import { useLoaderData, useLocation } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact as AgGridReactType } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import FetchData from "../api/fetch-data";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import React from "react";
import Grid from "@mui/material/Grid2";

export const loader = async () => {
	const courseTypeRes = await FetchData.getData("api/accel_course_type/");
	const courseRes = await FetchData.getData("api/accel_course/");
	const jsonResult = {
		courseTypeData: await courseTypeRes.json(),
		courseData: await courseRes.json(),
	};
	console.log("🚀 ~ loader ~ jsonResult:", jsonResult);
	return jsonResult;
};

function ActionCellRenderer(params: any) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const handleDelete = async () => {
		try {
			const { api, node } = params;
			const data = node.data;
			const response = await fetch(
				`http://localhost:8000/api/accel_course/${data.id}`,
				{
					method: "DELETE",
					headers: {
						"Content-type": "application/json",
					},
				}
			);
			if (response.ok) {
				api.applyTransaction({ remove: [data] });
				toast("🦄 Wow so easy!", {
					position: "bottom-left",
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					progress: undefined,
					theme: "light",
				});
			} else {
				console.error("Failed to delete:", response.statusText);
				// toast.error("Oops! Couldn't delete entry", {
				// 	position: toast.POSITION.BOTTOM_LEFT,
				// 	autoClose: 4000,
				// });
			}
		} catch (error) {
			console.error("Error during delete:", error);
		} finally {
			setDialogOpen(false);
		}
	};

	const handleActionClick = async (action: any) => {
		if (action === "delete") {
			setDialogOpen(true);
		}
	};

	const handleClose = () => {
		setDialogOpen(false);
	};

	return (
		<div>
			<>
				<Button
					sx={{ maxWidth: 8, mb: 0.8 }}
					color="error"
					size="small"
					variant="contained"
					className="action-button button-delete delete"
					onClick={() => handleActionClick("delete")}
				>
					X
				</Button>
				<Dialog
					open={dialogOpen}
					onClose={handleClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle>{"Confirm Delete"}</DialogTitle>
					<DialogContent>
						<DialogContentText id="alert-dialog-description">
							Are you sure you want to delete this Course?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose} color="primary">
							Cancel
						</Button>
						<Button onClick={handleDelete} color="error" variant="contained">
							Delete
						</Button>
					</DialogActions>
				</Dialog>
			</>
		</div>
	);
}

export default function AccelCourse(params: any) {
	const data: any = useLoaderData();
	//const courseTypes = data.courseTypeData;
	const initialState = {
		course_type: null,
		course_name: "",
		course_link: "",
	};
	const location = useLocation();
	const { courseName } = location.state || {};
	const [gridApi, setGridApi] = useState<any>(null);
	const [searchParam, setSearchParam] = useState("");
	const [rowData, setRowData] = useState([]);
	const [courseTypes, setCourseTypes] = useState();
	const [refreshGrid, setRefreshGrid] = useState(false);
	const [refreshCourses, setRefreshCourses] = useState(false);

	useEffect(() => {
		const refetchForGrid = async () => {
			const courseTypeRes = await FetchData.getData("api/accel_course_type/");
			const courseRes = await FetchData.getData("api/accel_course/");
			const courses = await courseRes.json();
			const courseTypeArr = await courseTypeRes.json();
			console.log(courses);
			setRowData(courses);
			setCourseTypes(courseTypeArr);
			console.log("re redner");
		};

		refetchForGrid();
	}, [refreshGrid, refreshCourses]);

	const stateRef = useRef();
	stateRef.current = courseTypes;

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		params.api.sizeColumnsToFit();
	};

	useEffect(() => {
		if (courseName) {
			console.log("Passed course_name:", courseName);
			setSearchParam(courseName);
		}
	}, []);

	const clearSearchParam = () => {
		setSearchParam("");
		window.history.replaceState({}, "");
	};

	type Inputs = {
		course_name: string;
		course_type: any;
		course_link: string;
	};

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			course_type: null,
			course_name: "",
			course_link: "",
		},
	});

	const onSubmit: SubmitHandler<Inputs> = async (formData) => {
		const thisFormData = formData;
		thisFormData.course_type = formData.course_type.id;
		FetchData.postDataJSON("api/accel_course/", JSON.stringify(formData)).then(
			async (response) => {
				console.log(response);
				if (response.ok === true) {
					console.log(data);
					// toast.success("Course added!", {
					// 	position: toast.POSITION.BOTTOM_LEFT,
					// 	autoClose: 4000,
					// });
					const courseRes = await FetchData.getData("api/accel_course/");
					data.courseData = await courseRes.json();
					console.log(data);
					reset();
					setRefreshGrid((prev) => !prev);
					setRefreshCourses((prev) => !prev);
					return response.json();
				} else {
					// toast.error("Oops! Something went wrong!", {
					// 	position: toast.POSITION.BOTTOM_LEFT,
					// 	autoClose: 4000,
					// });
				}
			}
		);
	};

	let gridRef = useRef<AgGridReactType>(null); //

	const defaultColDef = useMemo<ColDef>(() => {
		return {
			flex: 1,
			filter: true,
			editable: true,
			sortable: true,
			resizable: true,
		};
	}, []);

	const handleCourseTypeChange = async (
		params: any,
		selectedCourseTypeId: number
	) => {
		const { api, node } = params;
		console.log(params.node.data, "ACCEL DATA");
		const updatedCourseData = {
			...params.node.data,
			course_type: selectedCourseTypeId,
		};
		localStorage.setItem("selectedCourseTypeId", selectedCourseTypeId.toString());
		console.log(selectedCourseTypeId, "selectedCourseTypeId");

		const response = await fetch(
			`http://localhost:8000/api/accel_course/${params.node.data.id}/`,
			{
				method: "PUT",
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify(updatedCourseData),
			}
		);

		if (response.ok) {
			console.log("🚀 ~ response:", response);
			setRefreshGrid((prev) => !prev);
			setRefreshCourses((prev) => !prev);
			// add toast here
		} else {
			// toast.error("Oops! Something went wrong!", {
			// 	position: toast.POSITION.BOTTOM_LEFT,
			// 	autoClose: 4000,
			// });
			console.log(response, "BAD REPONSE");
			console.error("Oops something went wrong");
		}
	};

	const courseTypeDropdown = (params: any) => {
		console.log("course types inside dropdown:", stateRef.current);
		return (
			<FormControl fullWidth>
				<Controller
					name={"course_type"}
					control={control}
					render={({ field }) => (
						<Select
							menuPortalTarget={document.body}
							options={stateRef.current}
							getOptionLabel={(option: any) => option.course_type}
							getOptionValue={(option: any) => option.id}
							onChange={(event) => {
								console.log("🚀 ~ courseTypeDropdown ~ event:", event);
								handleCourseTypeChange(params, event.id);
							}}
							closeMenuOnSelect={true}
						/>
					)}
				/>
			</FormControl>
		);
	};

	const courseLinkRenderer = (params: any) => {
		const courseLink = params.data.course_link;
		return courseLink ? (
			<a href={courseLink} target="_blank" rel="noopener noreferrer">
				{params.value}
			</a>
		) : (
			params.value
		);
	};

	const handleNameUpdate = async (event: any) => {
		const { api, node } = params;
		const updatedData = event.data;
		try {
			const response = await fetch(
				`http://localhost:8000/api/accel_course/${updatedData.id}/`,
				{
					method: "PATCH",
					headers: {
						"Content-type": "application/json",
					},
					body: JSON.stringify(updatedData),
				}
			);
			console.log(response, "REPONSE");

			if (response.ok) {
				// toast.success("Course updated!", {
				// 	position: toast.POSITION.BOTTOM_LEFT,
				// 	autoClose: 4000,
				// });
				setRefreshGrid((prev) => !prev);
				setRefreshCourses((prev) => !prev);
			} else {
				// toast.error("Oops! Something went wrong", {
				// 	position: toast.POSITION.BOTTOM_LEFT,
				// 	autoClose: 4000,
				// });
				console.log("Failed to update");
			}
		} catch (error) {
			console.error("Error when updating:", error);
		}
	};

	const [columnDefs, setColumnDefs] = useState<ColDef[]>([
		{
			headerName: "Course Name",
			field: "course_name",
			editable: true,
		},
		{
			headerName: "Course Type",
			field: "course_type.course_type",
			editable: true,
			cellEditor: courseTypeDropdown,
		},
		{
			headerName: "Course Link",
			field: "course_link",
			editable: true,
			cellRenderer: courseLinkRenderer,
		},
		{
			headerName: "Delete",
			cellRenderer: ActionCellRenderer,
			editable: false,
			colId: "action",
		} as ColDef,
	]);

	const getRowId = (params: any) => params.data.id.toString();

	const overlayLoadingTemplate =
		'<span class="ag-overlay-loading-center">Loading...</span>';
	const overlayNoRowsTemplate =
		'<span class="ag-overlay-loading-center">No rows to display</span>';

	return (
		<>
			<Box
				sx={{
					height: "100%",
					width: "100%",
					maxWidth: "1400px",
					padding: "3rem",
					alginItems: "center",
					margin: "auto",
				}}
			>
				<Card variant="outlined" sx={{ display: "block", height: 800 }}>
					<CardContent sx={{ height: "100%" }}>
						<Typography variant="h5" component="div">
							Add Course
						</Typography>
						<form onSubmit={handleSubmit(onSubmit)} id="course-form">
							<Box
								sx={{
									"& > :not(style)": { m: 1 },
								}}
							>
								<FormControl fullWidth>
									<Grid container spacing={2}>
										<Grid style={{ paddingLeft: "7px" }} size={3}>
											<TextField
												fullWidth
												required
												id="course_name"
												label="Course Name"
												variant="outlined"
												size="small"
												{...register("course_name")}
											/>
										</Grid>
										<Grid size={3}>
											<FormControl fullWidth>
												<Controller
													name={"course_type"}
													control={control}
													render={({ field }) => (
														<Select
															{...field}
															menuPortalTarget={document.body}
															styles={{
																menuPortal: (base) => ({
																	...base,
																	zIndex: 9999,
																}),
															}}
															options={courseTypes}
															getOptionLabel={(option: any) => option.course_type}
															getOptionValue={(option: any) => option.id}
															isClearable
															placeholder="Course Type"
														/>
													)}
												/>
											</FormControl>
										</Grid>
										<Grid size={3}>
											<TextField
												required
												fullWidth
												id="course_link"
												label="Course Link"
												variant="outlined"
												size="small"
												{...register("course_link")}
											/>
										</Grid>
										<Grid>
											<Button type="submit" variant="contained">
												Save
											</Button>
										</Grid>
									</Grid>
								</FormControl>
							</Box>
						</form>
						<br></br>
						<Button
							variant="contained"
							size="small"
							style={{ marginBottom: "10px" }}
							onClick={clearSearchParam}
						>
							reset
						</Button>
						<div className="ag-theme-alpine" style={{ height: "75%" }}>
							<AgGridReact
								ref={gridRef} // Ref for accessing Grid's APIstatusBar: {
								suppressRowTransform={true}
								getRowId={getRowId}
								rowData={rowData} // Row Data for Rows
								columnDefs={columnDefs} // Column Defs for Columns
								defaultColDef={defaultColDef} // Default Column Properties
								animateRows={true} // Optional - set to 'true' to have rows animate when sorted
								rowSelection="single" // Options - allows click selection of rows
								overlayLoadingTemplate={overlayLoadingTemplate}
								overlayNoRowsTemplate={overlayNoRowsTemplate}
								stopEditingWhenCellsLoseFocus={true}
								onCellValueChanged={handleNameUpdate}
								reactiveCustomComponents={true}
								onGridReady={onGridReady}
								quickFilterText={searchParam}
							/>
						</div>
						<p>Rows: {rowData ? rowData.length : 0}</p>
					</CardContent>
				</Card>
			</Box>
		</>
	);
}

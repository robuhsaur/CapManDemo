import "ag-grid-community";
import { useLoaderData } from "react-router-dom";
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
import { ColDef } from "ag-grid-community";
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
import { useNavigate } from "react-router-dom";
import React from "react";
import Grid from "@mui/material/Grid2";

const fn = (arr: any) => {
	return arr.flatMap(({ accel_course, ...rest }: any) =>
		accel_course.map((o: any, i: any) => {
			return {
				...rest,
				course_id: o.id,
				course_name: o.course_name,
				course_link: o.course_link,
				course_type: o.course_type,
				combo_id: `${rest.id}-${o.id}`,
				index: i,
			};
		})
	);
};

export const loader = async () => {
	const categoryRes = await FetchData.getData("api/accel_category/");
	const courseRes = await FetchData.getData("api/accel_course/");
	const jsonResult = {
		categoryData: await categoryRes.json(),
		courseData: await courseRes.json(),
	};
	return jsonResult;
};

export default function AccelSkills(params: any) {
	const [gridApi, setGridApi] = useState<any>({});
	const [rowData, setRowData] = useState([]);
	const [courseData, setCourseData] = useState();
	const [refreshGrid, setRefreshGrid] = useState(false);
	const [refreshCourses, setRefreshCourses] = useState(false);
	const [dropdown, setDropDown] = useState(false);
	const data: any = useLoaderData();
	const navigate = useNavigate();

	useEffect(() => {
		const refetchForGrid = async () => {
			const categoryRes = await FetchData.getData("api/accel_category/");
			const courseRes = await FetchData.getData("api/accel_course/");
			const categoryData = await categoryRes.json();
			const courseData = await courseRes.json();
			setRowData(fn(categoryData));
			setCourseData(courseData);
			console.log("this is happening on render");
			console.log(courseData);
		};

		refetchForGrid();
	}, [refreshGrid, refreshCourses, dropdown]);

	function ActionCellRenderer(params: any) {
		const [dialogOpen, setDialogOpen] = useState(false);

		const handleDelete = async () => {
			try {
				const { api, node } = params;
				const data = node.data.id;
				const rowID = node.data;
				console.log("inside the delete", params.api);
				console.log("🚀 ~ handleDelete ~ rowID:", rowID);
				const response = await fetch(
					`http://localhost:8000/api/accel_category/${data}/`,
					{
						method: "DELETE",
						headers: {
							"Content-type": "application/json",
						},
					}
				);
				if (response.ok) {
					console.log("🚀 ~ handleDelete ~ response:", response);
					api.applyTransaction({ remove: [rowID] });
					setRefreshGrid((prev) => !prev);
					setRefreshCourses((prev) => !prev);
					// toast.success("Skill deleted!", {
					// 	position: toast.POSITION.BOTTOM_LEFT,
					// 	autoClose: 4000,
					// });
				} else {
					// toast.error("Oops! Couldn't delete entry", {
					// 	position: toast.POSITION.BOTTOM_LEFT,
					// 	autoClose: 4000,
					// });
					console.error("Failed to delete:", response.statusText);
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
								Are you sure you want to delete this Skill?
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

	const stateRef = useRef();
	stateRef.current = courseData;

	let gridRef = useRef<AgGridReactType>(null); //
	// console.log("🚀 ~ gridRef:", gridRef);

	type Inputs = {
		category_name: string;
		accel_course: any;
	};

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			category_name: "",
			accel_course: null,
		},
	});

	const onGridReady = (params: any) => {
		setGridApi(params.api);
		console.log(gridApi);
	};

	const onSubmit: SubmitHandler<Inputs> = async (formData) => {
		const thisFormData = formData;
		let courseIds = formData.accel_course.map((item: any) => {
			return item.id;
		});
		thisFormData.accel_course = courseIds;
		//console.log(thisFormData);
		FetchData.postDataJSON(
			"api/accel_category/",
			JSON.stringify(thisFormData)
		).then(async (response) => {
			console.log(response);
			if (response.ok === true) {
				//console.log(data);
				const courseRes = await FetchData.getData("api/accel_category/");
				data.courseData = await courseRes.json();
				setRefreshGrid((prev) => !prev);
				setRefreshCourses((prev) => !prev);
				reset();
				return response.json();
			} else {
				// toast.error("Oops! Something went wrong!", {
				// 	position: toast.POSITION.BOTTOM_LEFT,
				// 	autoClose: 4000,
				// });
				console.log("OOPS");
				// openAlert("Error Updating Record", "error")
			}
		});
	};

	const defaultColDef = useMemo<ColDef>(() => {
		return {
			flex: 1,
			filter: true,
			editable: true,
			sortable: true,
			resizable: true,
		};
	}, []);

	//give the grid row id (need to add unique id for duplicate rows)
	const getRowId = (params: any) => params.data.combo_id;

	const handleCourseChange = async (params: any, selectedCourseId: any) => {
		setRefreshGrid((prev) => !prev);
		setRefreshCourses((prev) => !prev);
		const { api, node } = params;
		console.log("selected node", params.node.data);
		console.log("course id ", params.node.data.course_id);
		console.log("look for all the courses by id", params.node.data.id);

		const categoryData = data.categoryData;
		const categoryIdToUpdate = params.node.data.id;
		const selectedId = selectedCourseId;

		const categoryToUpdate = categoryData.find(
			(category: any) => category.id === categoryIdToUpdate
		);

		// check if category exists
		if (!categoryToUpdate) {
			console.error("Category not found");
			return;
		}

		// check is accel_course is an array
		if (
			!categoryToUpdate.accel_course ||
			!Array.isArray(categoryToUpdate.accel_course)
		) {
			console.error("accel_course is undefined or not an array");
		}

		if (categoryToUpdate) {
			let accelCourseIds = categoryToUpdate.accel_course.map(
				(course: any) => course.id
			);
			const oldCourseId = params.node.data.course_id;

			accelCourseIds = accelCourseIds.filter((id: number) => id !== oldCourseId);
			accelCourseIds.push(selectedId);
			const updatedCourseData = {
				accel_course: accelCourseIds,
			};
			console.log(
				"🚀 ~ handleCourseChange ~ updatedCourseData:",
				updatedCourseData
			);
			// check what is being sent
			const response = await fetch(
				`http://localhost:8000/api/accel_category/${params.node.data.id}/`,
				{
					method: "PUT",
					headers: {
						"Content-type": "application/json",
					},
					body: JSON.stringify(updatedCourseData),
				}
			);

			if (response.ok) {
				console.log(response, "GOOD REPONSE");
				// toast.success("Skill updated!", {
				// 	position: toast.POSITION.BOTTOM_LEFT,
				// 	autoClose: 4000,
				// });
				console.log("YUP WORKED");
				setRefreshGrid((prev) => !prev);
				setRefreshCourses((prev) => !prev);
			} else {
				console.error("Oops something went wrong");
			}
		}
	};

	const courseDropdownRenderer = (params: any) => {
		console.log("REF", stateRef.current);
		return (
			<FormControl fullWidth>
				<Controller
					name={"accel_course"}
					control={control}
					render={({ field }) => (
						<Select
							menuPortalTarget={document.body}
							options={stateRef.current}
							getOptionLabel={(option: any) => option.course_name}
							getOptionValue={(option: any) => option.id}
							onChange={(event) => {
								console.log("🚀 ~ courseTypeDropdown ~ event:", event);
								handleCourseChange(params, event.id);
							}}
						/>
					)}
				/>
			</FormControl>
		);
	};

	const courseLinkRenderer = (params: any) => {
		const courseLink = params.data.course_link;
		return courseLink ? (
			<span
				onClick={() => {
					navigate(`/accel_course`, {
						state: { courseName: params.data.course_name },
					});
				}}
				//href={courseLink}
				rel="noopener noreferrer"
				style={{ color: "blue", cursor: "pointer" }}
			>
				{params.value}
			</span>
		) : (
			params.value
		);
	};

	const handleNameUpdate = async (event: any) => {
		console.log("🚀 ~ handleNameUpdate ~ params:", params);
		const updatedData = event.data;
		try {
			const response = await fetch(
				`http://localhost:8000/api/accel_category/${updatedData.id}/`,
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
				console.log("IT WORKED");
				setRefreshGrid((prev) => !prev);
				setRefreshCourses((prev) => !prev);
				console.log("YUP WORKED");
			} else {
				console.log("Failed to update");
			}
		} catch (error) {
			console.error("Error when updating:", error);
		}
	};

	const [columnDefs, setColumnDefs] = useState<ColDef[]>([
		{
			headerName: "Skill Name",
			field: "category_name",
			editable: true,
		},
		{
			headerName: "Course Name",
			field: "course_name",
			editable: true,
			cellRenderer: courseLinkRenderer,
			cellEditor: courseDropdownRenderer,
		},
		{
			headerName: "Delete",
			cellRenderer: ActionCellRenderer,
			colId: "action",
			editable: false,
		} as ColDef,
	]);

	const overlayLoadingTemplate =
		'<span class="ag-overlay-loading-center">Loading...</span>';
	const overlayNoRowsTemplate =
		'<span class="ag-overlay-loading-center">Loading...</span>';

	return (
		<>
			<Box
				sx={{
					height: "100%",
					width: "100%",
					maxWidth: "calc(100vw - 4rem)",
					padding: "3rem",
					alginItems: "center",
					margin: "auto",
				}}
			>
				<Card variant="outlined" sx={{ display: "block", height: 800 }}>
					<CardContent sx={{ height: "100%" }}>
						<Typography variant="h5" component="div">
							Add Skill
						</Typography>
						<form onSubmit={handleSubmit(onSubmit)} id="course-form">
							<Box
								sx={{
									"& > :not(style)": { m: 1 },
								}}
							>
								<FormControl fullWidth>
									<Grid container spacing={2}>
										<Grid size={3}>
											<TextField
												fullWidth
												required
												id="course_category"
												label="Skill Name"
												variant="outlined"
												size="small"
												{...register("category_name")}
											/>
										</Grid>
										<Grid size={3}>
											<FormControl fullWidth>
												<Controller
													name={"accel_course"}
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
															options={courseData}
															getOptionLabel={(option: any) => option.course_name}
															getOptionValue={(option: any) => option.id}
															isClearable
															placeholder="Course Name"
															isMulti={true}
														/>
													)}
												/>
											</FormControl>
										</Grid>
										<Grid size={1}>
											<Button type="submit" variant="contained">
												Save
											</Button>
										</Grid>
									</Grid>
								</FormControl>
							</Box>
						</form>
						<br></br>
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
							/>
						</div>
						<p>Rows: {rowData ? rowData.length : 0}</p>
					</CardContent>
				</Card>
			</Box>
		</>
	);
}

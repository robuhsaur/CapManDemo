import React, {
	useEffect,
	useState,
	useRef,
	useMemo,
	useCallback,
} from "react";
import { useLoaderData } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import { useUser } from "../UserContext";
import { AgGridReact as AgGridReactType } from "ag-grid-react";
import {
	SubmitHandler,
	Controller,
	useForm,
	FormProvider,
} from "react-hook-form";
import { toast } from "react-toastify";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Select from "react-select";
import FormControl from "@mui/material/FormControl";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import fetchData from "../api/fetch-data";
import ProgressCellRenderer from "../components/ProgressCellRenderer";
import RatingCellRenderer from "../components/RatingCellRenderer";
import FormLabel from "@mui/material/FormLabel";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	TextField,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import ReactDatepicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const loader = async () => {
	const response = await fetch(
		"http://localhost:8000/api/accel_progress_status/"
	);
	if (!response.ok) {
		throw new Error("failed to fetch dropdown data");
	}
	const dropDownData = await response.json();
	return dropDownData;
};

function ActionCellRenderer(params: any) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const localID = localStorage.getItem("userID");
	const [user, setUser] = useState({});
	const { api, node } = params;

	// get accel_user obj
	useEffect(() => {
		axios
			.get(`http://localhost:8000/api/accel_user/${localID}`)
			.then((response: any) => {
				setUser(response.data);
			});
		//console.log("Logged in user:", user);
	}, []);

	// delete
	const handleDelete = async () => {
		if (!user) return;
		try {
			//console.log("🚀 ~ handleDelete ~ data:", data);
			await axios
				.delete(`http://localhost:8000/api/accel_user_progress/${params.data.id}/`)
				.then((response: any) => {
					console.log("🚀 ~ .then ~ response:", response);
					if (response.status === 204) {
						const data = node.data;
						//console.log("🚀 ~ .then ~ data:", data);
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
					}
				});
			console.log("User progress updated");
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

const MyCourses: React.FC = (params: any) => {
	const gridRef = useRef<AgGridReactType>(null);
	const dropDownOptions: any = useLoaderData();
	const { userProgress, setUserProgress } = useUser();
	const [userID, setUserID] = useState("");
	const [courseData, setCourseData] = useState();
	const [firstName, setFirstName] = useState("");
	const [searchParam, setSearchParam] = useState("");
	const [gridApi, setGridApi] = useState();
	const [refreshGrid, setRefreshGrid] = useState(false);
	const [refreshCourses, setRefreshCourses] = useState(false);
	const [courseTypes, setCourseTypes] = useState();
	const [courseProg, setCourseProg] = useState();
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();

	useEffect(() => {
		const refetchDropDown = async () => {
			const courseProgTypes = await fetchData.getData(
				"api/accel_progress_status/"
			);
			const progTypes = await courseProgTypes.json();
			const progressOptions = progTypes?.filter(
				(option: any) => option.progress_status !== "Approved"
			);
			console.log("🚀 ~ refetchDropDown ~ should be 3:", progressOptions);
			setCourseProg(progressOptions);
		};

		refetchDropDown();
	}, [refreshGrid]);

	//console.log(userProgress);

	// get user ID and first name
	useEffect(() => {
		const storedUserID = localStorage.getItem("userID");
		if (storedUserID) {
			setUserID(storedUserID);
		}
		const storedFirstName = localStorage.getItem("firstName");
		if (storedFirstName) {
			setFirstName(storedFirstName);
			//console.log("🚀 ~ useEffect ~ storedFirstName:", storedFirstName);
		}
	}, []);

	// get userData
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await fetch(
					`http://localhost:8000/api/accel_user/${userID}`
				);
				if (response.ok) {
					const data = await response.json();
					setUserProgress(data.user_progress || []);
				} else {
					console.error("Failed to fetch:", response.statusText);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		};

		if (userID) {
			fetchUserData();
		}
	}, [userID, setUserProgress, refreshGrid]);

	const onGridReady = (params: any) => {
		setGridApi(params.api);
	};

	// fetch course data
	useEffect(() => {
		const fetchCourseData = async () => {
			try {
				const response = await fetch("http://localhost:8000/api/accel_course/");
				if (response.ok) {
					const fetchedData = await response.json();
					//console.log("🚀 ~ fetchCourseData ~ fetchedData:", fetchedData);
					setCourseData(fetchedData);
					//console.log("COURSE DATA:", courseData);
				} else {
					console.error("Failed to fetch:", response.statusText);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		};
		fetchCourseData();
	}, [refreshCourses]);

	const resetGrid = () => {
		setRefreshGrid((prev) => !prev);
	};

	const methods = useForm<any>({
		defaultValues: {
			accel_course: null,
			user_id: null,
			rating: null,
		},
	});

	const handleFilter = () => {
		//setRefreshGrid((prev) => !prev);
		const filteredData = userProgress?.filter((row: any) => {
			const completeDate = new Date(row.complete_date);
			const approveDate = new Date(row.approve_date);

			const today = new Date();
			const start = startDate ? new Date(startDate) : today;
			const end = endDate ? new Date(endDate) : today;

			// console.log("🚀 ~ filteredData ~ start:", start);
			// console.log("🚀 ~ filteredData ~ approveDate:", approveDate);
			// console.log("🚀 ~ filteredData ~ completeDate:", completeDate);
			// console.log("🚀 ~ filteredData ~ end:", end);

			return (
				!start ||
				(completeDate >= start && completeDate <= end) ||
				!start ||
				(approveDate >= start && approveDate <= end)
			);
		});
		//console.log("That filtered data", filteredData);
		setUserProgress(filteredData || []);
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

	const { control, handleSubmit, reset } = methods;

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// cell renderers and cell editors
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// render courses link as hyper link
	const courseLinkRenderer = (params: any) => {
		const courseLink = params.data.accel_course.course_link;
		return courseLink ? (
			<a href={courseLink} target="_blank" rel="noopener noreferrer">
				{params.value}
			</a>
		) : (
			params.value
		);
	};

	// adding courses
	const onSubmit: SubmitHandler<any> = async (formData: any) => {
		let thisFormData = formData;
		thisFormData.user_id = userID;
		fetchData
			.postDataJSON("api/accel_user_progress/", JSON.stringify(thisFormData))
			.then(async (response) => {
				console.log(response);
				if (response.ok === true) {
					const userRes = await fetchData.getData("api/accel_user/" + userID);
					const data = await userRes.json();
					setUserProgress(data.user_progress);
					//console.log("SUBMIT DATA:", data);
					reset();
				} else {
					// openAlert("Error Updating Record", "error")
				}
			});
	};

	const formatDate = (dateString: any) => {
		if (!dateString) {
			return "";
		}
		return format(new Date(dateString), "MM/dd/yy");
	};

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	const columnDefs: ColDef[] = [
		{
			headerName: "Course Name",
			field: "accel_course.course_name",
			editable: false,
			filter: "agTextColumnFilter",
		},
		{
			headerName: "Course Link",
			field: "accel_course.course_link",
			editable: false,
			cellRenderer: courseLinkRenderer,
		},
		{
			headerName: "Progress",
			field: "course_progress.progress_status",
			editable: true,
			cellEditor: (params: any) => (
				<ProgressCellRenderer
					value={params.value} //check what the value should be
					options={courseProg}
					rowIndex={params.rowIndex}
					onCellValueChanged={onCellValueChanged}
					params={params}
				/>
			),
		},
		{
			headerName: "Completed Date",
			field: "complete_date",
			editable: false,
			cellRenderer: (params: any) => formatDate(params.value),
		},
		{
			headerName: "Approved Date",
			field: "approve_date",
			editable: false,
			cellRenderer: (params: any) => formatDate(params.value),
		},
		{
			headerName: "Rating",
			field: "rating",
			editable: false,
			cellRenderer: (params: any) => {
				const parsedValue = parseFloat(params.value);
				return (
					<RatingCellRenderer
						value={parsedValue}
						rowIndex={params.rowIndex}
						params={params}
						readOnly
					/>
				);
			},
		},
		{
			headerName: "Remove",
			cellRenderer: ActionCellRenderer,
			editable: false,
			colId: "action",
		} as ColDef,
	];

	const overlayLoadingTemplate =
		'<span class="ag-overlay-loading-center">Loading...</span>';
	const overlayNoRowsTemplate =
		'<span class="ag-overlay-loading-center">No courses available...</span>';

	const onCellValueChanged = (params: any) => {
		const { data, rowIndex } = params;
		// console.log("🚀 ~ onCellValueChanged ~ params:", params.value);
		// console.log("🚀 ~ onCellValueChanged ~ rowIndex:", rowIndex);
		//api.applyTransaction to the progress??

		fetchData.putData("api/accel_user_progress", data).then(async (response) => {
			console.log(response);
			if (response.ok === true) {
				let obj = await response.json();
				console.log("🚀 ~ obj:", obj.course_progress.progress_status);
				setRefreshGrid((prev) => !prev);
				// toast.success("Progress updated", {
				//   position: toast.POSITION.BOTTOM_LEFT,
				//   autoClose: 4000,
				// });
				let rowNode = gridRef.current?.api.getRowNode(params);
				//console.log("🚀 ~ rowNode:", rowNode); // this is undefined
				rowNode?.setDataValue(
					"course_progress.progress_status",
					obj.course_progress.progress_status
				);
				// gridRef.current?.api.refreshCells();
			} else {
				// openAlert("Error Updating Record", "error")
			}
		});
	};

	const onQuickFilterChange = (event: any) => {
		setSearchParam(event.target.value);
		if (gridRef.current) {
			gridRef.current.api.setGridOption(
				"quickFilterText",
				(document.getElementById("filter-text-box") as HTMLInputElement).value
			);
		}
	};

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
				<Card variant="outlined" sx={{ display: "block", height: "100%" }}>
					<CardContent sx={{ height: "100%" }}>
						<FormProvider {...methods}>
							<form onSubmit={handleSubmit(onSubmit)} id="course-form">
								<Box
									height="75vh"
									display="flex"
									flexDirection="column"
									justifyContent="end"
									sx={{
										"& > :not(style)": { m: 1 },
									}}
								>
									<Typography variant="h5" component="div">
										{" "}
										{firstName}'s Courses{" "}
									</Typography>
									<div
										className="search-wrapper"
										style={{
											marginBottom: "10px",
											marginTop: "6px",
										}}
									>
										<FormControl>
											<Controller
												name={"accel_course"}
												control={control}
												render={({ field }) => (
													<div style={{ width: "250px" }}>
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
													</div>
												)}
											/>
										</FormControl>
										<Button
											type="submit"
											variant="contained"
											style={{ marginRight: "16px", marginLeft: "16px" }}
										>
											Save
										</Button>

										<Grid
											style={{
												marginTop: "16px ",
												// justifyContent: "right",
												// display: "flex",
												// flexDirection: "column",
											}}
										>
											<Typography color="grey">Search by date:</Typography>
											<Grid
												size={3}
												style={{
													display: "flex",
												}}
											>
												<ReactDatepicker
													id="start date"
													selected={startDate}
													// dateFormat="yyyy-MM-dd"
													onChange={(date: any) => setStartDate(date)}
													placeholderText="Start date"
													customInput={<TextField variant="outlined" size="small" />}
												/>
												<ReactDatepicker
													id="end date"
													selected={endDate}
													// dateFormat="yyyy-MM-dd"
													onChange={(date: any) => setEndDate(date)}
													placeholderText="End date"
													customInput={
														<TextField
															variant="outlined"
															size="small"
															style={{
																marginRight: "16px",
																marginLeft: "16px",
															}}
														/>
													}
												/>
												<Button
													type="button"
													variant="contained"
													onClick={handleFilter}
													disabled={!startDate || !endDate}
												>
													Query
												</Button>
											</Grid>
											<Grid
												style={{
													marginTop: "16px",
												}}
											>
												<Typography color="grey">Quick Search</Typography>
												<TextField
													id="filter-text-box"
													onInput={onQuickFilterChange}
													value={searchParam}
													placeholder="Course search..."
													variant="outlined"
													size="small"
													style={{
														marginRight: "16px",
													}}
												/>
												<Button type="button" variant="contained" onClick={resetGrid}>
													Reset
												</Button>
											</Grid>
										</Grid>
									</div>

									<div
										className="ag-theme-alpine"
										style={{
											height: "75%",
										}}
									>
										<AgGridReact
											rowData={userProgress}
											columnDefs={columnDefs}
											defaultColDef={defaultColDef}
											overlayLoadingTemplate={overlayLoadingTemplate}
											overlayNoRowsTemplate={overlayNoRowsTemplate}
											stopEditingWhenCellsLoseFocus={true}
											animateRows={true}
											rowSelection="single"
											quickFilterText={searchParam}
											onGridReady={onGridReady}
										/>
									</div>
									<p>Rows: {userProgress?.length ?? 0}</p>
								</Box>
							</form>
						</FormProvider>
						<br></br>
					</CardContent>
				</Card>
			</Box>
		</>
	);
};

export default MyCourses;

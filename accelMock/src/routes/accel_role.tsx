import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { useRef, useState, FormEvent, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import FetchData from "../api/fetch-data";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { ColDef } from "ag-grid-community";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact as AgGridReactType } from "ag-grid-react";
import FormControl from "@mui/material/FormControl";
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

// ******* KEEP *******
export const loader = async () => {
	const roleType = await FetchData.getData("api/accel_role/");
	const categoryType = await FetchData.getData("api/accel_category/");
	const jsonResult = {
		categoryData: await categoryType.json(),
		roleData: await roleType.json(),
	};
	return jsonResult;
};

const fn = (arr: any) => {
	return arr.flatMap(({ accel_course, ...rest }: any) =>
		accel_course.map((o: any) => ({
			...rest,
			course_id: o.id,
			course_name: o.course_name,
			course_link: o.course_link,
			course_type: o.course_type,
			combo_id: `${rest.id}-${o.id}`,
		}))
	);
};

export default function AccelRole(params: any) {
	const [gridApi, setGridApi] = useState<any>({});
	const [rowData, setRowData] = useState([]);
	const [categoryRoleData, setCategoryRoleData] = useState();
	const [refreshGrid, setRefreshGrid] = useState(false);
	const [refreshCategory, setRefreshCategory] = useState(false);
	const [dropdown, setDropDown] = useState(false);
	const data: any = useLoaderData();

	useEffect(() => {
		const refetchForGrid = async () => {
			const roleRes = await FetchData.getData("api/accel_role/");
			const categoryRes = await FetchData.getData("api/accel_category/");
			const roleData = await roleRes.json();
			const categoryData = await categoryRes.json();
			setCategoryRoleData(fn(categoryData));
			const flat = fn(categoryData);
			setRowData(combineData(flat, roleData));
		};
		console.log("ROW YA BOAT", rowData);
		refetchForGrid();
	}, [refreshGrid, refreshCategory, dropdown]);

	function ActionCellRenderer(params: any) {
		const [dialogOpen, setDialogOpen] = useState(false);

		const handleDelete = async () => {
			try {
				const { api, node } = params;
				const data = node.data;
				const response = await fetch(
					`http://localhost:8000/api/accel_role/${data.roleId}`,
					{
						method: "DELETE",
						headers: {
							"Content-type": "application/json",
						},
					}
				);
				if (response.ok) {
					console.log(response);
					api.applyTransaction({ remove: [data] });
					setRefreshGrid((prev) => !prev);
					setRefreshCategory((prev) => !prev);
					console.log("WORKED");
				} else {
					console.log("DID NOT WORK");
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
								Are you sure you want to delete this Role?
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
	} //end

	const combineData = (flat: any, roles: any) => {
		const result: any = [];
		const roleMap = new Map();
		console.log("FLAT STUFF", flat);
		console.log("ROLE STUFF", roles);
		for (let role of roles) {
			for (let id of role.accel_category) {
				const categoryData = flat.filter((item: any) => item.id === id);
				categoryData.forEach((courseData: any) => {
					result.push({
						...courseData,
						role_name: role.role_name,
						roleId: role.id,
						tripleId: `${role.id}-${courseData.combo_id}`,
					});
				});
			}
		}
		return result;
	};

	type Inputs = {
		accel_role: string;
		accel_category: { id: number; category_name: string }[];
	};

	const {
		register,
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			accel_role: "",
			accel_category: [],
		},
	});

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

	const onSubmit: SubmitHandler<Inputs> = async (formData) => {
		const categoryIds = Array.isArray(formData.accel_category)
			? formData.accel_category.map((category) => category.id)
			: [];
		const payload = {
			role_name: formData.accel_role,
			accel_category: formData.accel_category.map((category) => category.id),
		};
		FetchData.postDataJSON("api/accel_role/", JSON.stringify(payload)).then(
			async (response) => {
				console.log(response);
				if (response.ok === true) {
					console.log(data);
					const roleRes = await FetchData.getData("api/accel_role/");
					data.roleRes = await roleRes.json();
					setRefreshGrid((prev) => !prev);
					setRefreshCategory((prev) => !prev);
					reset();
					//setValue("accel_category", []);
					console.log("WORKED");
				} else {
					console.log("WORKED");
					//openAlert("Error Updating Record", "error")
				}
			}
		);
	};

	const overlayLoadingTemplate =
		'<span class="ag-overlay-loading-center">Loading...</span>';
	const overlayNoRowsTemplate =
		'<span class="ag-overlay-loading-center">Loading...</span>';

	useEffect(() => {
		const submissionSuccess = localStorage.getItem("submissionSuccess");
		const editSuccess = localStorage.getItem("editSuccess");
		if (submissionSuccess === "true") {
			console.log("WORKED");

			localStorage.removeItem("submissionSuccess");
		}
		if (editSuccess === "true") {
			console.log("WORKED");
			localStorage.removeItem("editSuccess");
		}
	}, []);

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

	const handleCategoryChange = async (
		params: any,
		selectedCategoryId: number
	) => {
		// const { api, node } = params;
		// console.log(params.node.data, "ACCEL DATA");
		// const updatedNodeData = {
		//   accel_category: selectedCategoryId,
		// };
		// api.applyTransaction({ update: [updatedNodeData] });
		// console.log(updatedNodeData, "PAYLOAD");
		// // localStorage.setItem("selectedCategoryId", selectedCategoryId.toString());
		// console.log(updatedNodeData, "selectedCategoryId");
		// const response = await fetch(
		//   `http://localhost:8000/api/accel_role/${params.node.data.roleId}/`,
		//   {
		//     method: "PATCH",
		//     headers: {
		//       "Content-type": "application/json",
		//     },
		//     body: JSON.stringify({ accel_category: [selectedCategoryId] }),
		//   }
		// );
		// if (response.ok) {
		//   console.log(response, "GOOD REPONSE");
		//   api.refreshCells({ force: true });
		//   api.stopEditing();
		//   localStorage.setItem("editSuccess", "true");
		//   window.location.reload();
		// } else {
		//   toast.error("Oops! Something went wrong!", {
		//     position: toast.POSITION.BOTTOM_LEFT,
		//     autoClose: 4000,
		//   });
		//   console.log(response, "BAD REPONSE");
		//   console.error("Oops something went wrong");
		// }
	};

	const skillDropdownRenderer = (params: any) => {
		console.log(params, "Params");
		return (
			<FormControl fullWidth>
				<Controller
					name={"accel_role"}
					control={control}
					render={({ field }) => (
						<Select
							menuPortalTarget={document.body}
							options={data.categoryData}
							getOptionLabel={(option: any) => option.category_name}
							getOptionValue={(option: any) => option.id}
							onChange={(event) => {
								//console.log("🚀 ~ courseTypeDropdown ~ event:", event);
								handleCategoryChange(params, event.id);
							}}
						/>
					)}
				/>
			</FormControl>
		);
	};

	const handleNameUpdate = async (event: any) => {
		const { api, node } = params;
		const updatedData = event.data;
		console.log("CHECK THIS OUT", params.data);
		console.log(updatedData, "PAYLOAD IS MOVING");
		try {
			const response = await fetch(
				`http://localhost:8000/api/accel_role/${updatedData.roleId}/`,
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
				setRefreshGrid((prev) => !prev);
				setRefreshCategory((prev) => !prev);
				console.log("WORKED");
			} else {
				console.log("DIDN'T WORK");

				console.log("Failed to update");
			}
		} catch (error) {
			console.error("Error when updating:", error);
		}
	};

	const getRowId = (params: any) => params.data.tripleId;

	const [columnDefs, setColumnDefs] = useState<ColDef[]>([
		{
			headerName: "Role name",
			field: "role_name",
			editable: true,
		},
		{
			headerName: "Skill Name",
			field: "category_name",
			editable: false,
			//cellEditor: skillDropdownRenderer,
		},
		{
			headerName: "Course Name",
			field: "course_name",
			editable: false,
			cellRenderer: courseLinkRenderer,
		},
		{
			headerName: "Delete",
			cellRenderer: ActionCellRenderer,
			colId: "action",
			editable: false,
		} as ColDef,
	]);

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
							Add Role
						</Typography>
						<form onSubmit={handleSubmit(onSubmit)} id="role-form">
							<Box
								sx={{
									"& > :not(style)": { m: 1 },
								}}
							>
								<FormControl fullWidth>
									<Grid container spacing={2}>
										<Grid size={2}>
											<TextField
												fullWidth
												required
												id="role_name"
												label="Role Name"
												variant="outlined"
												size="small"
												{...register("accel_role")}
											/>
										</Grid>
										<Grid>
											<FormControl fullWidth>
												<Controller
													name="accel_category"
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
															options={data.categoryData}
															getOptionLabel={(option: any) => option.category_name}
															getOptionValue={(option: any) => option.id}
															isClearable
															placeholder="Skill name"
															isMulti={true}
														/>
													)}
												/>
											</FormControl>
										</Grid>
										<Grid size={2}>
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
								// statusBar={statusBar}
								suppressRowTransform={true}
								rowData={rowData} // Row Data for Rows
								columnDefs={columnDefs} // Column Defs for Columns
								defaultColDef={defaultColDef} // Default Column Properties
								animateRows={true} // Optional - set to 'true' to have rows animate when sorted
								rowSelection="single" // Options - allows click selection of rows
								overlayLoadingTemplate={overlayLoadingTemplate}
								overlayNoRowsTemplate={overlayNoRowsTemplate}
								stopEditingWhenCellsLoseFocus={true}
								onCellValueChanged={handleNameUpdate}
								getRowId={getRowId}
							/>
						</div>
						<p>Rows: {rowData ? rowData.length : 0}</p>
					</CardContent>
				</Card>
			</Box>
		</>
	);
}

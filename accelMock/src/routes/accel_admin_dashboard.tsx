import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { useRef, useState, FormEvent, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import { AgGridReact as AgGridReactType } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Alert,
} from "@mui/material";
import FetchData from "../api/fetch-data";
import { toast } from "react-toastify";
import { format } from "date-fns";
import React from "react";

export const loader = async () => {
	const userRes = await FetchData.getData("api/accel_user/");
	const courseRes = await FetchData.getData("api/accel_course/");
	// const courseRes = await FetchData.getData("api/accel_course/")
	const jsonResult = {
		userData: await userRes.json(),
	};
	return jsonResult;
};

function ActionCellRenderer(params: any) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const handleDelete = async () => {
		try {
			const { api, node } = params;
			const data = node.data;
			const response = await fetch(
				`http://localhost:8000/api/accel_user/${data.id}`,
				{
					method: "DELETE",
					headers: {
						"Content-type": "application/json",
					},
				}
			);
			if (response.ok) {
				api.applyTransaction({ remove: [data] });
				console.log("SUCCESS");
			} else {
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
							Are you sure you want to delete this User?
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

export default function AccelUserAdmin() {
	let gridRef = useRef<AgGridReactType>(null); //
	const data: any = useLoaderData();
	console.log(data);
	const [error, setError] = useState(false);

	const defaultColDef = useMemo<ColDef>(() => {
		return {
			flex: 1,
			filter: true,
			editable: true,
			sortable: true,
			resizable: true,
		};
	}, []);

	const formatDate = (dateString: any) => {
		if (!dateString) {
			return "";
		}
		return format(new Date(dateString), "MM/dd/yyyy");
	};

	const [columnDefs, setColumnDefs] = useState<ColDef[]>([
		{
			headerName: "First Name",
			field: "first_name",
			cellRenderer: (params: any) => {
				console.log(params);
				let data = params.data;
				return (
					<a href={`./accel_user/${data.id}`} target="_blank">
						{data.first_name}
					</a>
				);
			},
		},
		{
			headerName: "Last Name",
			field: "last_name",
		},
		{
			headerName: "E-Mail",
			field: "email",
		},
		{
			headerName: "Description",
			field: "description",
		},
		{
			headerName: "Start Date",
			field: "start_date",
			cellRenderer: (params: any) => formatDate(params.value),
		},
		{
			headerName: "Delete",
			editable: false,
			colId: "action",
			cellRenderer: ActionCellRenderer,
		} as ColDef,
	]);

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<any>({
		defaultValues: {
			first_name: "",
			last_name: "",
			start_date: moment(new Date()).format("YYYY-MM-DD"),
			email: "",
			description: "",
		},
	});

	const onSubmit: SubmitHandler<any> = async (formData) => {
		let thisFormData = formData;
		const trimEmail = formData.email.trim();
		console.log("🚀 ~ constonSubmit:SubmitHandler<any>= ~ trimEmail:", trimEmail);
		const idDuplicate = data.userData.some(
			(row: any) => row.email === formData.email
		);
		if (idDuplicate) {
			//setError(true);
			console.log("That was a duplicate entry");
			return;
		}
		FetchData.postDataJSON("api/accel_user/", JSON.stringify(thisFormData)).then(
			async (response: any) => {
				if (response.ok === true) {
					setError(false);
					const userRes = await FetchData.getData("api/accel_user/");
					data.userData = await userRes.json();
					reset();
					console.log("SUCCESS");
				} else {
					// add alert about missing fields or incorrect format
					// openAlert("Error Updating Record", "error")
				}
			}
		);
	};

	const handleCellUpdate = async (event: any) => {
		const updatedData = event.data;
		console.log("Updated data:", updatedData);
		try {
			const response = await fetch(
				`http://localhost:8000/api/accel_user/${updatedData.id}/`,
				{
					method: "PATCH",
					headers: {
						"Content-type": "application/json",
					},
					body: JSON.stringify(updatedData),
				}
			);
			console.log(response, "RESPONSE");

			if (response.ok) {
				console.log("USER UPDATED");
			} else {
				console.log("Failed to update");
			}
		} catch (error) {
			console.error("Error when updating:", error);
		}
	};

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
				<Card variant="outlined" sx={{ display: "block", height: "100%" }}>
					<CardContent sx={{ height: "100%" }}>
						<Typography variant="h5" component="div">
							Manage ACCEL Users
						</Typography>
						{error && (
							<Alert severity="error">Duplicate entry is not allowed!: email</Alert>
						)}
						<form onSubmit={handleSubmit(onSubmit)} id="user-form">
							<Box
								height="75vh"
								display="flex"
								flexDirection="column"
								sx={{
									"& > :not(style)": { m: 1 },
								}}
							>
								<Grid container>
									<Grid size={2}>
										<FormControl>
											<Stack spacing={2}>
												<TextField
													required
													fullWidth
													id="first_name"
													label="First Name"
													// variant="outlined"
													{...register("first_name")}
												/>

												<TextField
													required
													fullWidth
													id="last_name"
													label="Last Name"
													// variant="outlined"
													{...register("last_name")}
												/>
												<LocalizationProvider dateAdapter={AdapterMoment}>
													<Controller
														name="start_date"
														control={control}
														render={({ field }) => (
															<DatePicker
																{...field}
																value={moment(field.value)}
																label="Start Date"
																onChange={(e: any) => field.onChange(e.format("YYYY-MM-DD"))}
															/>
														)}
													/>
												</LocalizationProvider>
												<TextField
													required
													fullWidth
													id="email"
													label="E-Mail"
													// variant="outlined"
													size="small"
													{...register("email")}
												/>
												<TextField
													required
													fullWidth
													id="description"
													label="Description"
													// variant="outlined"
													size="small"
													multiline={true}
													minRows={5}
													{...register("description")}
												/>
												<Button type="submit" variant="contained">
													Save
												</Button>
											</Stack>
										</FormControl>
									</Grid>
									<Grid container size={10}>
										<Grid size={12}>
											<Box sx={{ height: "100%" }}>
												<div className="ag-theme-alpine" style={{ height: "100%" }}>
													<AgGridReact
														ref={gridRef} // Ref for accessing Grid's APIstatusBar: {
														// statusBar={statusBar}
														suppressRowTransform={true}
														rowData={data.userData} // Row Data for Rows
														columnDefs={columnDefs} // Column Defs for Columns
														defaultColDef={defaultColDef} // Default Column Properties
														animateRows={true} // Optional - set to 'true' to have rows animate when sorted
														rowSelection="single" // Options - allows click selection of rows
														overlayLoadingTemplate={overlayLoadingTemplate}
														overlayNoRowsTemplate={overlayNoRowsTemplate}
														stopEditingWhenCellsLoseFocus={true}
														onCellValueChanged={handleCellUpdate}
													/>
												</div>
											</Box>
										</Grid>
									</Grid>
								</Grid>
							</Box>
						</form>
						<br></br>
					</CardContent>
				</Card>
			</Box>
		</>
	);
}

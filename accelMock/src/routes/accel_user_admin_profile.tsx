import { useLoaderData } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import { AgGridReact as AgGridReactType } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import {
	useForm,
	SubmitHandler,
	Controller,
	FormProvider,
} from "react-hook-form";
import FetchData from "../api/fetch-data";
import { format } from "date-fns";
import React from "react";

export const loader = async ({ params }: any) => {
	let jsonResult = {
		userData: await (
			await FetchData.getData("api/accel_user/" + params.userId)
		).json(),
		courseData: await (await FetchData.getData("api/accel_course/")).json(),
		progressData: await (
			await FetchData.getData("api/accel_progress_status/")
		).json(),
		userId: params.userId,
	};
	return jsonResult;
};

export default function AccelUserProfile() {
	const gridRef = useRef<AgGridReactType>(null); //
	const data: any = useLoaderData();
	const userId: number = data.userId;

	const methods = useForm<any>({
		defaultValues: {
			accel_course: null,
			user_id: null,
			rating: null,
		},
	});

	const {
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { errors },
	} = methods;

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
		return format(new Date(dateString), "MM/dd/yy");
	};

	const [columnDefs, setColumnDefs] = useState<ColDef[]>([
		{
			headerName: "Course Name",
			field: "accel_course.course_name",
			editable: false,
			type: "text",
		},
		{
			headerName: "Completed Date",
			field: "complete_date",
			editable: false,
			type: "date",
			cellRenderer: (params: any) => formatDate(params.value),
		},
		{
			headerName: "Approved Date",
			field: "approve_date",
			editable: false,
			type: "date",
			cellRenderer: (params: any) => formatDate(params.value),
		},
	]);

	const onCellValueChanged = (params: any) => {
		const { data, rowIndex } = params;
		console.log(params);
		console.log(data);

		FetchData.putData("api/accel_user_progress", data).then(async (response) => {
			console.log(response);
			if (response.ok === true) {
				let obj = await response.json();

				let rowNode = gridRef.current?.api.getRowNode(rowIndex);
				rowNode?.setDataValue("complete_date", obj.complete_date);
				rowNode?.setDataValue("approve_date", obj.approve_date);
				gridRef.current?.api.refreshCells();
			} else {
				// openAlert("Error Updating Record", "error")
			}
		});
	};

	const onSubmit: SubmitHandler<any> = async (formData) => {
		let thisFormData = formData;
		thisFormData.user_id = userId;
		FetchData.postDataJSON(
			"api/accel_user_progress/",
			JSON.stringify(thisFormData)
		).then(async (response) => {
			console.log(response);
			if (response.ok === true) {
				console.log(data);
				const userRes = await FetchData.getData("api/accel_user/" + userId);
				data.userData = await userRes.json();

				console.log(data);
				reset();
			} else {
				// openAlert("Error Updating Record", "error")
			}
		});
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
							{data.userData.first_name} {data.userData.last_name}
						</Typography>
						<FormProvider {...methods}>
							<form onSubmit={handleSubmit(onSubmit)} id="course-form">
								<Box
									height="75vh"
									display="flex"
									flexDirection="column"
									sx={{
										"& > :not(style)": { m: 1 },
									}}
								>
									<Grid container>
										<Grid>
											<FormControl fullWidth>
												<Stack spacing={2}>
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
																options={data.courseData}
																getOptionLabel={(option: any) => option.course_name}
																getOptionValue={(option: any) => option.id}
																isClearable
																placeholder="Course Name"
																isMulti={true}
															/>
														)}
													/>
													<Grid>
														<Button type="submit" variant="contained">
															Add
														</Button>
													</Grid>
												</Stack>
											</FormControl>
										</Grid>
										<Grid container>
											<Grid>
												<Box sx={{ height: "100%" }}>
													<div className="ag-theme-alpine" style={{ height: "100%" }}>
														<AgGridReact
															ref={gridRef} // Ref for accessing Grid's APIstatusBar: {
															suppressRowTransform={true}
															rowData={data.userData.user_progress} // Row Data for Rows
															columnDefs={columnDefs} // Column Defs for Columns
															defaultColDef={defaultColDef} // Default Column Properties
															animateRows={true} // Optional - set to 'true' to have rows animate when sorted
															rowSelection="single" // Options - allows click selection of rows
															overlayLoadingTemplate={overlayLoadingTemplate}
															overlayNoRowsTemplate={overlayNoRowsTemplate}
															onCellValueChanged={onCellValueChanged}
														/>
													</div>
												</Box>
											</Grid>
										</Grid>
									</Grid>
								</Box>
							</form>
						</FormProvider>
						<br></br>
					</CardContent>
				</Card>
			</Box>
		</>
	);
}

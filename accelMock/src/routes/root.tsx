import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { useUser } from "../UserContext";

export default function Root() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [secondAnchorEl, setSecondAnchorEl] = useState<null | HTMLElement>(null);
	const [firstName, setFirstName] = useState<string>("");
	const { userRole, setUserRole } = useUser();

	const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleSecondButtonClick = (event: React.MouseEvent<HTMLElement>) => {
		setSecondAnchorEl(event.currentTarget);
	};

	const handleSecondMenuClose = () => {
		setSecondAnchorEl(null);
	};

	// get user's firstName
	useEffect(() => {
		const storedFirstName = localStorage.getItem("firstName");
		if (storedFirstName) {
			setFirstName(storedFirstName);
		}
	});

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar
				position="fixed"
				sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
				color="primary"
			>
				<Toolbar>
					<Typography
						variant="h6"
						component="div"
						sx={{ flexBasis: "5%", marginRight: "0px" }}
					>
						ACCEL
					</Typography>
					{userRole === "ADMIN" && (
						<>
							{/* <IconButton
                onClick={handleButtonClick}
                aria-controls="admin-menu"
                aria-haspopup="true"
                sx={{
                  "&.active": { background: "darkgrey" },
                  "&:hover": {
                    backgroundColor: "darkgrey",
                    opacity: [0.9, 0.8, 0.7],
                  },
                  color: "white",
                  fontSize: "15px",
                  borderRadius: "4px",
                  size: "small",
                }}
              >
                Admin▾
              </IconButton> */}
							{/* <Menu
                id="admin-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              > */}
							<MenuItem
								onClick={handleMenuClose}
								component={NavLink}
								to="/accel_user_admin"
								sx={{
									"&.active": { background: "grey" },
									"&:hover": {
										backgroundColor: "darkgrey",
										opacity: [0.9, 0.8, 0.7],
									},
								}}
							>
								User Admin
							</MenuItem>
							<MenuItem
								onClick={handleMenuClose}
								component={NavLink}
								to="/accel_role"
								sx={{
									"&.active": { background: "darkgrey" },
									"&:hover": {
										backgroundColor: "darkgrey",
										opacity: [0.9, 0.8, 0.7],
									},
								}}
							>
								Add Role
							</MenuItem>
							<MenuItem
								onClick={handleMenuClose}
								component={NavLink}
								to="/accel_skill"
								sx={{
									"&.active": { background: "darkgrey" },
									"&:hover": {
										backgroundColor: "darkgrey",
										opacity: [0.9, 0.8, 0.7],
									},
								}}
							>
								Add Skill
							</MenuItem>
							<MenuItem
								onClick={handleMenuClose}
								component={NavLink}
								to="/accel_course"
								sx={{
									"&.active": { background: "darkgrey" },
									"&:hover": {
										backgroundColor: "darkgrey",
										opacity: [0.9, 0.8, 0.7],
									},
								}}
							>
								Add Course
							</MenuItem>
							{/* </Menu> */}
						</>
					)}
					{"STUDENT" === "STUDENT" && (
						<>
							<IconButton
								onClick={handleSecondButtonClick}
								aria-controls="student-menu"
								aria-haspopup="true"
								sx={{
									"&.active": { background: "darkgrey" },
									"&:hover": {
										backgroundColor: "darkgrey",
										opacity: [0.9, 0.8, 0.7],
									},
									color: "white",
									fontSize: "15px",
									borderRadius: "4px",
									size: "small",
								}}
							>
								Student▾
							</IconButton>
							<Menu
								id="student-menu"
								anchorEl={secondAnchorEl}
								open={Boolean(secondAnchorEl)}
								onClose={handleSecondMenuClose}
							>
								<MenuItem
									onClick={handleSecondMenuClose}
									component={NavLink}
									to="/mycourses"
									sx={{
										"&.active": { background: "lightgrey" },
										"&:hover": {
											backgroundColor: "lightgrey",
											opacity: [0.9, 0.8, 0.7],
										},
									}}
								>
									My Courses
								</MenuItem>
							</Menu>
						</>
					)}
					<Box display="flex" ml="auto">
						{userRole === "ADMIN" && (
							<>
								<Typography paddingRight={"20px"} align="right">
									Welcome, {firstName}!
								</Typography>
								<Chip
									label="admin"
									color="warning"
									size="small"
									sx={{ ml: 1, fontWeight: "bold" }}
									style={{ marginRight: "8px" }}
								/>
							</>
						)}
						{userRole === "STUDENT" && (
							<>
								<Typography paddingRight={"20px"} align="right">
									Welcome, {firstName}!
								</Typography>
								<Chip
									label="student"
									color="warning"
									size="small"
									sx={{ ml: 1, fontWeight: "bold" }}
									style={{ marginRight: "8px" }}
								/>
							</>
						)}
					</Box>
				</Toolbar>
			</AppBar>
			<Toolbar />
			<Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: "80px" }}>
				<Box sx={{ overflow: "auto" }}>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
}

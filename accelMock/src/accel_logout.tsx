import axios from "axios";
import { useNavigate } from "react-router";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import React from "react";

const LogoutButton = () => {
	const navigate = useNavigate();
	const logout = async () => {
		// delete cookie
		try {
			const response = await axios.post(
				"http://localhost:8000/accel_logout/",
				{},
				{
					withCredentials: true,
				}
			);

			console.log("🚀 ~ logout ~ response:", response);
			if (response.status === 200) {
				localStorage.removeItem("role");
				localStorage.removeItem("userProgress");
				localStorage.removeItem("userID");
				localStorage.removeItem("firstName");

				navigate("/login");
			} else {
				console.error("logout failed");
			}
		} catch (error) {
			console.error("Failed logout:", error);
		}

		// redirect to login page
	};
	return <Chip label="logout" color="error" size="small" onClick={logout} />;
};

export default LogoutButton;

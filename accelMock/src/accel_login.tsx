import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
	TextField,
	Button,
	Typography,
	Container,
	Box,
	Alert,
	CircularProgress,
} from "@mui/material";
import Cookies from "js-cookie";
import { useUser } from "./UserContext";
import React from "react";

interface AccelCourse {
	course_name: string;
	course_link: string;
	course_type: string;
}

interface AccelProgressStatus {
	progress_status: string;
}

interface AccelUserProgress {
	accel_course: AccelCourse;
	course_progress: AccelProgressStatus;
	complete_date: string | null;
	approve_date: string | null;
	comment: string | null;
	rating: string | null;
}

interface AccelUser {
	first_name: string;
	last_name: string;
	description: string;
	start_date: string;
	email: string;
	role: string;
	id: string;
	user_progress: AccelUserProgress[];
}

interface ApiResponse {
	message: string;
	user: AccelUser;
	courses_progress: AccelUserProgress;
}

const AccelLogin: React.FC = () => {
	const navigate = useNavigate();
	const { setUserProgress, setUserRole } = useUser();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [csrfToken, setCsrfToken] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState("");
	const [buttonDisabled, setButtonDisabled] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function fetchCsrfToken() {
			try {
				const response = await fetch("http://localhost:8000/csrf-token/", {
					credentials: "include",
				});
				if (!response.ok) {
					throw new Error("Failed to fetch CSRF token");
				}
				const token = Cookies.get("csrftoken") || "";
				setCsrfToken(token);
				console.log("CSRF token fetched and set:", token);
			} catch (error) {
				console.error("Error fetching CSRF token", error);
			}
		}
		fetchCsrfToken();
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setButtonDisabled(true);
		try {
			const response = await fetch("http://localhost:8000/accel_login/", {
				method: "post",
				headers: {
					"Content-type": "application/json",
					"X-CSRFToken": csrfToken,
				},
				credentials: "include",
				body: JSON.stringify({ email: email, password: password }),
			});
			// Handle successful login
			console.log("🚀 ~ handleLogin ~ response:", response);
			const data: ApiResponse = await response.json();
			console.log("🚀 ~ handleLogin ~ data:", data.user);
			setIsLoading(false);

			if (response.ok) {
				console.log("🚀 ~ handleLogin ~ response:", response);

				// local storage store for testing
				localStorage.setItem("role", data.user.role); // not getting role for some reason
				localStorage.setItem(
					"userProgress",
					JSON.stringify(data.user.user_progress)
				);
				localStorage.setItem("userID", data.user.id);

				// set context for course data
				const userProgress = data.user.user_progress;
				setUserProgress(userProgress);
				console.log("🚀 ~ courseData:", data.user.user_progress);

				// set context for role data and set first name
				const role = data.user.role;
				console.log("🚀 ~ handleLogin ~ userRole:", role);
				setUserRole(role);
				const userFName = data.user.first_name;
				localStorage.setItem("firstName", userFName);

				// check role
				if (role === "STUDENT") {
					navigate("/mycourses");
				} else {
					navigate("/accel_user_admin");
				}
			} else {
				setErrorMessage(data.message);
				setButtonDisabled(false);
				console.error("login failed");
			}
		} catch (error) {
			// Handle login error
			console.error("Login failed:", error);
		}
	};

	return (
		<Container
			maxWidth="sm"
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
			}}
		>
			<Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 5 }}>
				<Typography variant="h5" align="center" gutterBottom>
					FHB ACCEL
				</Typography>
				{errorMessage && <Alert severity="error">{errorMessage}</Alert>}
				<form onSubmit={handleLogin}>
					<TextField
						label="username"
						type="username"
						fullWidth
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						margin="normal"
					/>
					<TextField
						label="password"
						type="password"
						fullWidth
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						margin="normal"
					/>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						fullWidth
						disabled={buttonDisabled}
					>
						{isLoading ? (
							<CircularProgress size={24} style={{ marginLeft: 16 }} />
						) : (
							"Login"
						)}
					</Button>
				</form>
			</Box>
		</Container>
	);
};

export default AccelLogin;

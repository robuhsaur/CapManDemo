import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import * as React from "react";
import MyCourses from "./routes/mycourses";
import { UserProvider } from "./UserContext";
import AccelCourse, {
	loader as accelCourseLoader,
} from "./routes/accel_course";
import AccelSkills, {
	loader as accelSkillsLoader,
} from "./routes/accel_skills";
import AccelRole, { loader as accelRoleLoader } from "./routes/accel_role";
import AccelUserAdmin, {
	loader as accelAdminDashboardLoader,
} from "./routes/accel_admin_dashboard";
import AccelUserProfile, {
	loader as accelUserProfileLoader,
} from "./routes/accel_user_admin_profile";
import AccelUser, { loader as accelUserLoader } from "./routes/accel_user";
import AccelLogin from "./accel_login";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		children: [
			{},
			{
				path: "mycourses",
				element: <MyCourses />,
			},
			{
				path: "accel_course",
				element: <AccelCourse />,
				loader: accelCourseLoader,
			},
			{
				path: "accel_skill",
				element: <AccelSkills />,
				loader: accelSkillsLoader,
			},
			{
				path: "accel_role",
				element: <AccelRole />,
				loader: accelRoleLoader,
			},
			{
				path: "accel_admin_dashboard",
				element: <AccelUserAdmin />,
				loader: accelAdminDashboardLoader,
			},
			{
				path: "accel_user_profile/:userId",
				element: <AccelUserProfile />,
				loader: accelUserProfileLoader,
			},
			{
				path: "accel_user/:userId",
				element: <AccelUser />,
				loader: accelUserLoader,
			},
		],
	},
	{
		path: "login",
		element: <AccelLogin />,
	},
]);

function App() {
	return (
		<React.StrictMode>
			<UserProvider>
				<RouterProvider router={router} />
			</UserProvider>
		</React.StrictMode>
	);
}

export default App;

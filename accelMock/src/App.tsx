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
		],
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

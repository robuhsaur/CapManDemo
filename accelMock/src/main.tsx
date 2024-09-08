import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
// import './index.css'
import { ToastContainer } from "react-toastify";
import React from "react";
import ReactDOM from "react-dom/client";

const Root = () => {
	return (
		<StrictMode>
			<App />
		</StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);

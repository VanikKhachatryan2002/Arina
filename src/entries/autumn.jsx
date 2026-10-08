import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AutumnPage } from "../pages/AutumnPage.jsx";
import "../styles/autumn.css";

createRoot(document.getElementById("root")).render(<StrictMode><AutumnPage /></StrictMode>);

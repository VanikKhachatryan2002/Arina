import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SparksPage } from "../pages/SparksPage.jsx";
import "../styles/sparks.css";
createRoot(document.getElementById("root")).render(<StrictMode><SparksPage /></StrictMode>);

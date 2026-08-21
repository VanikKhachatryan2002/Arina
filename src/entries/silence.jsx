import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SilencePage } from "../pages/SilencePage.jsx";
import "../styles/runtime.css";
import "../../silence.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><SilencePage /></StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuntPage } from "../pages/AuntPage.jsx";
import "../styles/runtime.css";
import "../../aunt.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><AuntPage /></StrictMode>,
);

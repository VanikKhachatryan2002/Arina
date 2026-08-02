import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnniversaryPage } from "../pages/AnniversaryPage.jsx";
import "../styles/runtime.css";
import "../../anniversary.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AnniversaryPage />
  </StrictMode>,
);

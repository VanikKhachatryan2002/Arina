import template from "../templates/may8.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "may8",
  html: template,
  bodyClass: "",
  css: () => import("../../may8.css"),
});

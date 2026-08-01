import template from "../templates/new-year.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "new-year",
  html: template,
  bodyClass: "locked",
  css: () => import("../../new-year.css"),
});

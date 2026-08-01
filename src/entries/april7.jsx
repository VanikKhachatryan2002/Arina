import template from "../templates/april7.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "april7",
  html: template,
  bodyClass: "",
  css: () => import("../../april7.css"),
});

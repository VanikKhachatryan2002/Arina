import template from "../templates/index.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "index",
  html: template,
  bodyClass: "",
  css: () => import("../../style.css"),
});

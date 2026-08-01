import template from "../templates/valentine.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "valentine",
  html: template,
  bodyClass: "",
  css: () => import("../../valentine.css"),
});

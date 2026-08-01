import template from "../templates/birthday.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "birthday",
  html: template,
  bodyClass: "",
  css: () => import("../../birthday.css"),
});

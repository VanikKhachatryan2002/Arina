import template from "../templates/book.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "book",
  html: template,
  bodyClass: "book-body",
  css: () => import("../../book.css"),
});

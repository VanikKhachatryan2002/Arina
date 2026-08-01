import template from "../templates/album.html?raw";
import "../styles/runtime.css";
import { createPage } from "../app/createPage.js";

createPage({
  page: "album",
  html: template,
  bodyClass: "",
  htmlClass: "locked",
  css: () => import("../../album.css"),
});

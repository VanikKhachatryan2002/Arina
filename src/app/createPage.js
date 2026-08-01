export function createPage({ page, html, css, bodyClass }) {
  return Promise.all([import("./PageRuntime.jsx"), css()]).then(([{ mountPage }]) => {
    mountPage({ page, html, bodyClass });
  });
}

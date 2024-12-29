import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import esbuild from "lume/plugins/esbuild.ts";

import beautify from "npm:js-beautify@1.15.1";

const site = lume({
  src: "./src",
});

site.use(jsx({
  extensions: [".page.tsx", ".layout.tsx"],
}));

site.use(esbuild({
  extensions: [".ts", ".js", ".tsx"],
  options: {
    plugins: [],
    bundle: false,
    format: "esm",
    minify: false,
    keepNames: true,
    platform: "browser",
    target: "esnext",
    treeShaking: false,
    outdir: "./",
    outbase: ".",
    jsxImportSource: "npm:preact@10.25.3", // avoid cache import
  },
}));

site.copy([".wgsl", ".css", ".jpg", ".png", ".html"]);

site.process([".html"], (files) => {
  for (const file of files) {
    file.content = beautify.html(file.content, {
      indent_size: 2,
      wrap_line_length: 120,
    });
  }
});

export default site;

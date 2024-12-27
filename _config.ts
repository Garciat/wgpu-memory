import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import esbuild from "lume/plugins/esbuild.ts";

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

site.copy([".wgsl", ".css", ".jpg", ".png"]);

export default site;

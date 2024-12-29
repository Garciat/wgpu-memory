export default ({ _search }: Lume.Data, { url }: Lume.Helpers) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <title>wgpu-memory</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="stylesheet" href={url("./main.css")} />
        <script type="module" src={url("./main.js")} defer />
      </head>

      <body>
        <header>
          <h1>
            wgpu-memory{" "}
            <sub>
              by&nbsp;<a href="https://github.com/Garciat">@garciat</a>
            </sub>
          </h1>
          <p>
            <a href="https://github.com/Garciat/wgpu-memory">
              <img
                alt="Static Badge"
                src="https://img.shields.io/badge/GitHub-source-blue?logo=github"
              />
            </a>{" "}
            <a href="https://jsr.io/@garciat/wgpu-memory">
              <img src="https://jsr.io/badges/@garciat/wgpu-memory" />
            </a>{" "}
            <a href="https://jsr.io/@garciat/wgpu-memory">
              <img src="https://jsr.io/badges/@garciat/wgpu-memory/score" />
            </a>{" "}
            <a href="https://github.com/garciat/wgpu-memory">
              <img src="https://github.com/garciat/wgpu-memory/workflows/ci/badge.svg" />
            </a>{" "}
            <a href="https://codecov.io/gh/garciat/wgpu-memory">
              <img src="https://codecov.io/gh/garciat/wgpu-memory/branch/main/graph/badge.svg?token=KEKZ52NXGP" />
            </a>
          </p>
          <p>
            A utility library for WebGPU that provides strongly-typed{" "}
            <code>ArrayBuffer</code> memory access that is compatible with{" "}
            <a href="https://gpuweb.github.io/gpuweb/wgsl/">
              WGSL
            </a>'s{" "}
            <a href="https://gpuweb.github.io/gpuweb/wgsl/#alignment-and-size">
              alignment and size specifications
            </a>.
          </p>
        </header>
        <main id="PreactMain" />
        <footer>
          <p>
            Built with <a href="https://www.typescriptlang.org/">TypeScript</a>,
            {" "}
            <a href="https://lume.land">Lume</a>, and{" "}
            <a href="https://preactjs.com">Preact</a>.
          </p>
          <p>
            Hosted by GitHub Pages &mdash;{" "}
            <a href="https://github.com/Garciat/wgpu-memory/tree/github-pages">
              source
            </a>.
          </p>
        </footer>
      </body>
    </html>
  );
};

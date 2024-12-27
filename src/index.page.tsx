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
      </body>
    </html>
  );
};

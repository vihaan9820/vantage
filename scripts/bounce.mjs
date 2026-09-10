import http from "node:http";

const PORT = 5173;
const TARGET = "https://vantage-skillswap.netlify.app";

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vantage — Redirecting to Cloud Production...</title>
  <style>
    body {
      background: #090a0f;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <script>
    (function() {
      var hash = window.location.hash || "";
      var search = window.location.search || "";
      var path = window.location.pathname === "/" ? "/dashboard" : window.location.pathname;
      var destination = "${TARGET}" + path + search + hash;
      window.location.replace(destination);
    })();
  </script>
</head>
<body>
  <div class="spinner"></div>
  <p>Connecting to Vantage Cloud...</p>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(html);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Vantage local bounce relay active on http://127.0.0.1:${PORT} -> ${TARGET}`);
});

import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const server = createServer(app);

  // Resilient static asset directory resolution for any cloud host
  const possiblePaths = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(__dirname, "..", "dist", "public"),
  ];
  const staticPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application static files building or missing index.html.");
    }
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 SkillSwap production server running on port ${port} (http://0.0.0.0:${port}/)`);
  });

  // Graceful shutdown handlers for container and PaaS environments
  const handleShutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
    server.close(() => {
      console.log("✅ HTTP server closed cleanly.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("⚠️ Forced shutdown after 10s timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

startServer().catch(console.error);

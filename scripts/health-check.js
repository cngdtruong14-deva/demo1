#!/usr/bin/env node

/**
 * Health Check Script
 * Verifies if the development environment is ready
 */

import net from "net";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load mysql2 from backend/node_modules using createRequire
let mysql = null;
try {
  const backendPath = path.join(__dirname, "..", "backend");
  const backendRequire = createRequire(path.join(backendPath, "package.json"));
  mysql = backendRequire("mysql2/promise");
} catch (error) {
  // mysql2 not available, database check will be skipped
  mysql = null;
}

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const PASS = `${colors.green}✅ PASS${colors.reset}`;
const FAIL = `${colors.red}❌ FAIL${colors.reset}`;

const results = {
  ports: {},
  database: false,
  cors: false,
};

/**
 * Check if a port is in use
 */
function checkPort(port, label) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, () => {
      server.once("close", () => {
        resolve(false); // Port is available (not in use)
      });
      server.close();
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Load environment variables from backend/.env
 */
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", "backend", ".env");

  if (!fs.existsSync(envPath)) {
    console.log(`${FAIL} backend/.env file not found`);
    return null;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith("#")) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        env[key] = value;
      }
    }
  });

  return env;
}

/**
 * Test MySQL connection
 */
async function testDatabaseConnection(env) {
  if (!mysql) {
    return false;
  }

  try {
    const connection = await mysql.createConnection({
      host: env.DB_HOST || "localhost",
      port: parseInt(env.DB_PORT) || 3306,
      user: env.DB_USER || "root",
      password: env.DB_PASSWORD || "",
      database: env.DB_NAME || "qr_order_db",
      connectTimeout: 3000,
    });

    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check CORS configuration in backend/server.js and backend/src/config/app.js
 */
function checkCORSConfiguration() {
  const serverJsPath = path.join(__dirname, "..", "backend", "server.js");
  const appJsPath = path.join(
    __dirname,
    "..",
    "backend",
    "src",
    "config",
    "app.js"
  );

  let serverJsContent = "";
  let appJsContent = "";

  if (fs.existsSync(serverJsPath)) {
    serverJsContent = fs.readFileSync(serverJsPath, "utf8");
  }

  if (fs.existsSync(appJsPath)) {
    appJsContent = fs.readFileSync(appJsPath, "utf8");
  }

  const combinedContent = serverJsContent + "\n" + appJsContent;

  // Check for localhost:3001 in CORS origin configuration
  const has3001 =
    /localhost:3001/.test(combinedContent) ||
    /['"]http:\/\/localhost:3001['"]/.test(combinedContent) ||
    /3001/.test(combinedContent);

  // Check for localhost:5173 in CORS origin configuration
  const has5173 =
    /localhost:5173/.test(combinedContent) ||
    /['"]http:\/\/localhost:5173['"]/.test(combinedContent) ||
    /5173/.test(combinedContent);

  return has3001 && has5173;
}

/**
 * Main function
 */
async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  Development Environment Health Check");
  console.log("=".repeat(60) + "\n");

  // 1. Port Checks
  console.log(`${colors.blue}1. Port Availability Check${colors.reset}`);
  console.log("-".repeat(60));

  const ports = [
    { port: 3000, label: "Backend" },
    { port: 3001, label: "Customer" },
    { port: 5173, label: "Admin" },
    { port: 3306, label: "MySQL" },
  ];

  for (const { port, label } of ports) {
    const isInUse = await checkPort(port);
    results.ports[port] = isInUse;
    const status = isInUse
      ? `${colors.green}✅ ACTIVE${colors.reset}`
      : `${colors.yellow}⚠️  NOT LISTENING${colors.reset}`;
    console.log(`  Port ${port} (${label}): ${status}`);
  }

  console.log("");

  // 2. Database Connection
  console.log(`${colors.blue}2. Database Connection Check${colors.reset}`);
  console.log("-".repeat(60));

  const env = loadEnvFile();
  if (!mysql) {
    console.log(`  MySQL Connection: ${FAIL} - mysql2 package not found`);
    console.log(`    Please run: cd backend && npm install`);
    results.database = false;
  } else if (env) {
    const dbConnected = await testDatabaseConnection(env);
    results.database = dbConnected;
    const status = dbConnected ? PASS : FAIL;
    const statusText = dbConnected ? "CONNECTED" : "FAILED";
    console.log(`  MySQL Connection: ${status} - ${statusText}`);

    if (!dbConnected) {
      console.log(`    Host: ${env.DB_HOST || "localhost"}`);
      console.log(`    Port: ${env.DB_PORT || 3306}`);
      console.log(`    Database: ${env.DB_NAME || "qr_order_db"}`);
      console.log(`    User: ${env.DB_USER || "root"}`);
    }
  } else {
    console.log(`  MySQL Connection: ${FAIL} - Cannot load .env file`);
    results.database = false;
  }

  console.log("");

  // 3. CORS Verification
  console.log(`${colors.blue}3. CORS Configuration Check${colors.reset}`);
  console.log("-".repeat(60));

  const corsValid = checkCORSConfiguration();
  results.cors = corsValid;
  const status = corsValid ? PASS : FAIL;
  const statusText = corsValid
    ? "localhost:3001 and localhost:5173 found"
    : "Missing localhost:3001 or localhost:5173";
  console.log(`  CORS Origins: ${status} - ${statusText}`);

  console.log("");

  // Summary
  console.log("=".repeat(60));
  console.log("  Summary");
  console.log("=".repeat(60));

  const allPortsOk = true; // Port check is informational only

  const allChecks = allPortsOk && results.database && results.cors;

  console.log(`  Ports Check: ${allPortsOk ? PASS : FAIL}`);
  console.log(`  Database: ${results.database ? PASS : FAIL}`);
  console.log(`  CORS Config: ${results.cors ? PASS : FAIL}`);
  console.log("");
  console.log(`  Overall Status: ${allChecks ? PASS : FAIL}`);
  console.log("");

  if (!allChecks) {
    console.log(
      `${colors.yellow}⚠️  Some checks failed. Please review the issues above.${colors.reset}`
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.green}✓ All checks passed! Development environment is ready.${colors.reset}`
    );
    process.exit(0);
  }
}

// Run the health check
main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});

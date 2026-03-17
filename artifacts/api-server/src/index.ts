import app from "./app";
import { seedIfEmpty } from "./lib/seed-data";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  try {
    await seedIfEmpty();
  } catch (err) {
    console.error("Auto-seed failed (non-fatal):", err);
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start();

/**
 * Backend entry point
 * Load env, initialize DAL, mount routes.
 */

import "dotenv/config";
import express from "express";
import routes from "./src/routes/index.js";

// Initialize DAL (wires Firestore adapter)
import "./src/db/index.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

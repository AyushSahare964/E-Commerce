import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { addressRouter } from "./routes/addresses.js"; // New: Import for Logistics Hub
import { authRequired } from "./middleware/auth.js";
import { pool, connectWithRetry, ensureSchema } from "./db.js";
import { productsRouter } from "./routes/products.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:8081"],
    credentials: true,
  }),
);
app.use(express.json());

// Health Check: Terminal Diagnostics
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db_error" });
  }
});

// ROUTE REGISTRATION
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/addresses", addressRouter); // FIX: Opens the door for saving addresses

// USER CONTEXT: Operator Profile
app.get("/api/auth/me", authRequired, async (req, res) => {
  // Use 'sub' or 'id' depending on your JWT payload structure
  const userId = req.user.sub || req.user.id; 
  
  try {
    const [rows] = await pool.query(
      // UPDATED: Added avatar_url to selection
      "SELECT id, email, full_name, avatar_url, created_at FROM users WHERE id = ?",
      [userId],
    );
    
    if (rows.length === 0) return res.status(404).json({ message: "Operator not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// INITIALIZATION: DB Link & Schema Verification
const port = process.env.PORT || 4000;

await connectWithRetry();
await ensureSchema();

app.listen(port, () => {
  console.log(`🚀 Zentaro API running on http://localhost:${port}`);
  console.log(`📡 Accepting frontend link from http://localhost:8080`);
});
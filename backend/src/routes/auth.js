import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";

export const authRouter = express.Router();

/**
 * Utility to generate JWT for Zentaro Operators
 */
function createToken(user) {
  const payload = { sub: user.id, email: user.email };
  const options = { expiresIn: process.env.JWT_EXPIRES_IN || "7d" };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

// 1. GET /api/auth/avatars (Fetch all available emblems from MySQL)
authRouter.get("/avatars", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT image_url FROM available_avatars");
    res.json(rows.map(row => row.image_url));
  } catch (err) {
    console.error("Fetch avatars error:", err);
    res.status(500).json({ message: "Failed to load avatar protocol" });
  }
});

// 2. POST /api/auth/update-avatar (Sync selection to users table)
authRouter.post("/update-avatar", authRequired, async (req, res) => {
  const { avatar_url } = req.body;
  const userId = req.user.sub || req.user.id; 

  if (!avatar_url) {
    return res.status(400).json({ message: "Avatar URL is required" });
  }

  try {
    await pool.query(
      "UPDATE users SET avatar_url = ? WHERE id = ?",
      [avatar_url, userId]
    );
    res.json({ success: true, message: "Avatar protocol synchronized" });
  } catch (err) {
    console.error("Update avatar error:", err);
    res.status(500).json({ message: "Database sync failed" });
  }
});

// 3. GET /api/auth/me (Fetch current operator data including avatar)
authRouter.get("/me", authRequired, async (req, res) => {
  const userId = req.user.sub || req.user.id;
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, avatar_url FROM users WHERE id = ?",
      [userId]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: "Operator not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Me route error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 4. POST /api/auth/register (Create new account with default avatar)
authRouter.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "fullName, email and password are required" });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Default Zentaro Avatar Protocol
    const defaultAvatar = "https://tse3.mm.bing.net/th/id/OIP.K8O_ArBuc2InpMji5NydWAHaEK?w=760&h=427&rs=1&pid=ImgDetMain&o=7&rm=3";

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)",
      [fullName, email, passwordHash, defaultAvatar],
    );

    const newUser = { id: result.insertId, fullName, email, avatar_url: defaultAvatar };
    const token = createToken(newUser);

    return res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 5. POST /api/auth/login (Authorize and return user data)
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, email, full_name, password_hash, avatar_url FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);
    
    // Remove hash before returning to frontend for security
    delete user.password_hash;

    return res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// 6. POST /api/auth/change-password (Standard security update)
authRouter.post("/change-password", authRequired, async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, userId]);

    return res.json({ message: "Encryption Protocol Updated" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
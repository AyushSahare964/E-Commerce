import express from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import crypto from "crypto";

export const addressRouter = express.Router();

// 1. POST: Initialize Logistics Sector
addressRouter.post("/", authRequired, async (req, res) => {
  const { 
    label, 
    full_name, 
    phone_number, 
    address_line1, 
    address_line2, 
    city, 
    state, 
    postal_code, 
    is_default 
  } = req.body;
  
  const userId = req.user.sub || req.user.id;
  const newAddressId = crypto.randomUUID();
  const now = new Date(); // Created at timestamp

  try {
    // If setting as primary, demote other sectors first
    if (is_default) {
      await pool.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
    }

    // INSERT protocol
    await pool.query(
      `INSERT INTO addresses 
      (id, user_id, label, full_name, phone_number, address_line1, address_line2, city, state, postal_code, is_default, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAddressId,
        userId, 
        label, 
        full_name, 
        phone_number, 
        address_line1, 
        address_line2 || null, 
        city, 
        state, 
        postal_code, 
        is_default ? 1 : 0,
        now
      ]
    );

    /**
     * SUCCESS PROTOCOL: Return the FULL object.
     * This prevents the frontend from crashing because it now has 
     * all variables required for the 'addresses.map()' function.
     */
    const synchronizedAddress = {
      id: newAddressId,
      user_id: userId,
      label,
      full_name,
      phone_number,
      address_line1,
      address_line2: address_line2 || null,
      city,
      state,
      postal_code,
      is_default: is_default ? 1 : 0,
      created_at: now
    };

    res.status(201).json({ 
      address: synchronizedAddress,
      message: "Logistics Sector Synchronized." 
    });
  } catch (error) {
    console.error("SQL Error:", error.message);
    res.status(500).json({ message: "Database link failure: " + error.message });
  }
});

// 2. GET: Fetch all active coordinates
addressRouter.get("/", authRequired, async (req, res) => {
  const userId = req.user.sub || req.user.id;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC", 
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to retrieve coordinates." });
  }
});

// 3. DELETE: Terminate Logistics Sector
addressRouter.delete("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub || req.user.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sector not found or access denied." });
    }

    res.json({ message: "Logistics Sector Terminated." });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
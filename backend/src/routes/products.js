import { Router } from "express";
import { pool } from "../db.js"; //

export const productsRouter = Router();

// GET all products with their category names
productsRouter.get("/", async (req, res) => {
  try {
    // UPDATED QUERY: Mapping database names to frontend property names
    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.brand, 
        p.price, 
        p.original_price AS originalPrice, 
        p.discount, 
        p.rating, 
        p.reviews, 
        p.image_url AS image, 
        p.description, 
        p.in_stock AS inStock, 
        p.delivery_days AS deliveryDays,
        c.slug AS category, 
        c.name AS category_name, 
        c.icon AS category_icon
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.in_stock = 1
    `); //
    
    // Fetch specs for these products
    const [specs] = await pool.query("SELECT * FROM product_specs");
    
    // Logic remains identical, attaching specifications to the mapped products
    const productsWithSpecs = rows.map(product => ({
      ...product,
      specifications: specs
        .filter(s => s.product_id === product.id)
        .reduce((acc, curr) => ({ ...acc, [curr.spec_key]: curr.spec_value }), {})
    }));

    res.json(productsWithSpecs);
  } catch (error) {
    console.error("Query Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
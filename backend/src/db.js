import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Single shared MySQL pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD, // set via .env
  database: process.env.DB_NAME || "shopkart",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional helper: try to connect with retries so the app doesn't crash immediately
export async function connectWithRetry(retries = 5, delayMs = 5000) {
  while (retries > 0) {
    try {
      const conn = await pool.getConnection();
      console.log("✅ Connected to MySQL database.");
      conn.release();
      return;
    } catch (err) {
      retries -= 1;
      console.error(`❌ DB connection failed. Retries left: ${retries}`);
      console.error(err.message);
      if (retries === 0) {
        console.error("Giving up on DB connection. Exiting.");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// Ensure minimum schema for auth + catalog exists
export async function ensureSchema() {
  // Users for authentication
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name     VARCHAR(150) NOT NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  // Product categories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id    INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug  VARCHAR(50) NOT NULL UNIQUE,
      name  VARCHAR(100) NOT NULL,
      icon  VARCHAR(10) NOT NULL
    ) ENGINE=InnoDB;
  `);

  // Products
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id               CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
      name             VARCHAR(255) NOT NULL,
      brand            VARCHAR(100) NOT NULL,
      category_id      INT UNSIGNED NOT NULL,
      price            DECIMAL(12,2) NOT NULL,
      original_price   DECIMAL(12,2) DEFAULT NULL,
      discount         INT DEFAULT NULL,
      rating           DECIMAL(2,1) DEFAULT NULL,
      reviews          INT DEFAULT NULL,
      image_url        TEXT,
      description      TEXT,
      in_stock         TINYINT(1) NOT NULL DEFAULT 1,
      delivery_days    INT DEFAULT NULL,
      created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE RESTRICT
    ) ENGINE=InnoDB;
  `);

  // Product specifications (key/value)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_specs (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      product_id  CHAR(36) NOT NULL,
      spec_key    VARCHAR(100) NOT NULL,
      spec_value  VARCHAR(255) NOT NULL,
      CONSTRAINT fk_specs_product
        FOREIGN KEY (product_id) REFERENCES products(id)
          ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
}

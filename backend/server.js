const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* Подключение к PostgreSQL */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database() AS database");

    res.json({
      message: "Сервер работает",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("Ошибка подключения к БД:", error.message);

    res.status(500).json({
      message: "Не удалось подключиться к базе данных",
    });
  }
});

/* Получение всех товаров */
app.get("/api/products", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.id,
                p.name,
                p.brand,
                p.price,
                p.old_price AS "oldPrice",
                p.discount,
                p.image,
                p.color,
                p.material,
                p.gender,
                p.is_sale AS "isSale",
                COALESCE(
                    json_agg(c.slug) FILTER (WHERE c.id IS NOT NULL),
                    '[]'::json
                ) AS category
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            GROUP BY p.id
            ORDER BY p.id;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Ошибка получения товаров:", error.message);

        res.status(500).json({
            message: "Не удалось получить список товаров"
        });
    }
});

/* Получение одного товара по ID */
app.get("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                p.id,
                p.name,
                p.brand,
                p.price,
                p.old_price AS "oldPrice",
                p.discount,
                p.image,
                p.color,
                p.material,
                p.gender,
                p.is_sale AS "isSale",
                COALESCE(
                    json_agg(c.slug) FILTER (WHERE c.id IS NOT NULL),
                    '[]'::json
                ) AS category
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            WHERE p.id = $1
            GROUP BY p.id;
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Товар не найден"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Ошибка получения товара:", error.message);

        res.status(500).json({
            message: "Не удалось получить товар"
        });
    }
});

/* Получение всех категорий */
app.get("/api/categories", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                name,
                slug
            FROM categories
            ORDER BY id;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Ошибка получения категорий:", error.message);

        res.status(500).json({
            message: "Не удалось получить список категорий"
        });
    }
});

/* Запуск */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});

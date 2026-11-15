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

/* Создание нового товара */
app.post("/api/products", async (req, res) => {
    const {
        name,
        brand,
        price,
        oldPrice = null,
        discount = null,
        image,
        color = [],
        material = [],
        gender = [],
        isSale = false,
        category = []
    } = req.body;

    if (!name || !brand || price === undefined || !image) {
        return res.status(400).json({
            message: "Заполните обязательные поля: name, brand, price, image"
        });
    }

    if (
        !Array.isArray(category) ||
        !Array.isArray(color) ||
        !Array.isArray(material) ||
        !Array.isArray(gender)
    ) {
        return res.status(400).json({
            message: "Категории, цвета, материалы и пол должны быть массивами"
        });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
            message: "Цена должна быть неотрицательным числом"
        });
    }

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const categoryResult = await client.query(
            "SELECT id, slug FROM categories WHERE slug = ANY($1::text[])",
            [category]
        );

        if (categoryResult.rows.length !== category.length) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Одна или несколько категорий не найдены"
            });
        }

        const productResult = await client.query(`
            INSERT INTO products (
                name,
                brand,
                price,
                old_price,
                discount,
                image,
                color,
                material,
                gender,
                is_sale
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id;
        `, [
            name,
            brand,
            price,
            oldPrice,
            discount,
            image,
            color,
            material,
            gender,
            isSale
        ]);

        const productId = productResult.rows[0].id;

        const categoryIds = categoryResult.rows.map(item => item.id);

        if (categoryIds.length > 0) {
            await client.query(`
                INSERT INTO product_categories (product_id, category_id)
                SELECT $1, unnest($2::int[]);
            `, [productId, categoryIds]);
        }

        const newProduct = await client.query(`
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
        `, [productId]);

        await client.query("COMMIT");

        res.status(201).json(newProduct.rows[0]);

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error("Ошибка создания товара:", error.message);

        res.status(500).json({
            message: "Не удалось создать товар"
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});

/* Редактирование товара */
app.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;

    const {
        name,
        brand,
        price,
        oldPrice = null,
        discount = null,
        image,
        color = [],
        material = [],
        gender = [],
        isSale = false,
        category = []
    } = req.body;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            message: "Некорректный ID товара"
        });
    }

    if (!name || !brand || price === undefined || !image) {
        return res.status(400).json({
            message: "Заполните обязательные поля"
        });
    }

    if (
        !Array.isArray(category) ||
        !Array.isArray(color) ||
        !Array.isArray(material) ||
        !Array.isArray(gender)
    ) {
        return res.status(400).json({
            message: "Категории, цвета, материалы и пол должны быть массивами"
        });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
            message: "Цена должна быть неотрицательным числом"
        });
    }

    let client;

    try {
        client = await pool.connect();

        await client.query("BEGIN");

        const existingProduct = await client.query(
            "SELECT id FROM products WHERE id = $1",
            [id]
        );

        if (existingProduct.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Товар не найден"
            });
        }

        const categoryResult = await client.query(
            "SELECT id, slug FROM categories WHERE slug = ANY($1::text[])",
            [category]
        );

        if (categoryResult.rows.length !== category.length) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Одна или несколько категорий не найдены"
            });
        }

        await client.query(`
            UPDATE products
            SET
                name = $1,
                brand = $2,
                price = $3,
                old_price = $4,
                discount = $5,
                image = $6,
                color = $7,
                material = $8,
                gender = $9,
                is_sale = $10
            WHERE id = $11;
        `, [
            name,
            brand,
            price,
            oldPrice,
            discount,
            image,
            color,
            material,
            gender,
            isSale,
            id
        ]);

        await client.query(
            "DELETE FROM product_categories WHERE product_id = $1",
            [id]
        );

        const categoryIds = categoryResult.rows.map(item => item.id);

        if (categoryIds.length > 0) {
            await client.query(`
                INSERT INTO product_categories (product_id, category_id)
                SELECT $1, unnest($2::int[]);
            `, [id, categoryIds]);
        }

        const updatedProduct = await client.query(`
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

        await client.query("COMMIT");

        res.json(updatedProduct.rows[0]);

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error("Ошибка редактирования товара:", error.message);

        res.status(500).json({
            message: "Не удалось обновить товар"
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});

/* Удаление товара */
app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            message: "Некорректный ID товара"
        });
    }

    try {
        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING id, name",
            [id]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Товар не найден"
            });
        }

        res.json({
            message: "Товар успешно удалён",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Ошибка удаления товара:", error.message);

        res.status(500).json({
            message: "Не удалось удалить товар"
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

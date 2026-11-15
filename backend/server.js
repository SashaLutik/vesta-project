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

/* Запуск */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});

const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
  // Логин
  async login(req, res) {
    try {
      const { username, password } = req.body;

      const userResult = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: "Неверный логин или пароль" });
      }

      const user = userResult.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: "Неверный логин или пароль" });
      }

      const token = jwt.sign(
        { id: user.id }, // Удалено поле role
        process.env.JWT_SECRET || "your_super_secret_key",
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Ошибка сервера при входе" });
    }
  }

  // Регистрация
  async register(req, res) {
    try {
      const { username, password } = req.body;

      const existing = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Пользователь уже существует" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await db.query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
        [username, hashedPassword]
      );

      const token = jwt.sign(
        { id: newUser.rows[0].id },
        process.env.JWT_SECRET || "your_super_secret_key",
        { expiresIn: "24h" }
      );

      res.status(201).json({
        token,
        user: newUser.rows[0]
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Ошибка сервера при регистрации" });
    }
  }

  // Получить текущего пользователя
  async getCurrentUser(req, res) {
    try {
      const user = await db.query(
        "SELECT id, username FROM users WHERE id = $1",
        [req.user.id]
      );

      res.json(user.rows[0]);
    } catch (err) {
      console.error("getCurrentUser error:", err);
      res.status(500).json({ error: "Ошибка сервера при получении пользователя" });
    }
  }
}

module.exports = new AuthController();

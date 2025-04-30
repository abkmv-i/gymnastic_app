const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
    async login(req, res) {
        try {
            const {username, password} = req.body;

            const user = await db.query(
                "SELECT * FROM users WHERE username = $1",
                [username]
            );

            if (user.rows.length === 0) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
            if (!validPassword) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const token = jwt.sign(
                {id: user.rows[0].id, role: user.rows[0].role},
                process.env.JWT_SECRET || "your_super_secret_key",
                {expiresIn: "24h"}
            );

            res.json({
                token,
                user: {
                    id: user.rows[0].id,
                    username: user.rows[0].username,
                    role: user.rows[0].role
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Internal server error"});
        }
    }

    async register(req, res) {
        try {
            const {username, password, role = "judge"} = req.body;

            // Проверка существования пользователя
            const existingUser = await db.query(
                "SELECT * FROM users WHERE username = $1",
                [username]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({error: "Username already exists"});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await db.query(
                "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
                [username, hashedPassword]
            );

            res.status(201).json({
                message: "Registration successful",
                user: newUser.rows[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Internal server error"});
        }
    }

    async getCurrentUser(req, res) {
        try {
            const user = await db.query(
                "SELECT id, username, role FROM users WHERE id = $1",
                [req.user.id]
            );
            res.json(user.rows[0]); // Вернёт { id, username, role }
        } catch (err) {
            res.status(500).json({error: "Internal server error"});
        }
    }
}

module.exports = new AuthController();
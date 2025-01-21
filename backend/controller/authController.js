const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
    async login(req, res) {
        try {
            console.error(req.body);
            const { username, password } = req.body;
            console.error(username);
            console.error(password);
            const user = await db.query(
                "SELECT * FROM users WHERE username = $1",
                [username]
            );

            if (user.rows.length === 0) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

            if (!validPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

//            const token = jwt.sign(
//                { id: user.rows[0].id, role: user.rows[0].role },
//                process.env.JWT_SECRET,
//                { expiresIn: "24h" }
//            );
            const token = jwt.sign(
              { id: user.rows[0].id, role: user.rows[0].role },
              "your_super_secret_key",
              { expiresIn: "24h" }
            );

            res.json({ token, role: user.rows[0].role });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async register(req, res) {
        try {
            const { username, password, role } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            await db.query(
                "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
                [username, hashedPassword, role]
            );

            res.json({ message: "Registration successful" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

module.exports = new AuthController();

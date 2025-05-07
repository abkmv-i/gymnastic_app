const Router = require('express')
const router = new Router()
const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Авторизация
router.post("/login", authController.login);

// Регистрация
router.post("/register", authController.register);

router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;

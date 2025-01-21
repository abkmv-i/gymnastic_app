const Router = require ('express')
const router = new Router()
const authController = require("../controller/authController");
//const router = express.Router();

// Авторизация
router.post("/login", authController.login);

// Регистрация
router.post("/register", authController.register);

module.exports = router;

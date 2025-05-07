const Router = require('express');
const router = new Router();
const scoringController = require("../controller/scoringController");
const authMiddleware = require("../middleware/authMiddleware");

// Судейство
router.post('/judge', authMiddleware, scoringController.addScore);

module.exports = router;
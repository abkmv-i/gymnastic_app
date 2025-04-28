const Router = require('express');
const router = new Router();
const scoringController = require("../controller/scoringController");
const authMiddleware = require("../middleware/authMiddleware");

// Судейство
router.post("/scores", authMiddleware, scoringController.recordScore);
router.post("/performances/:performance_id/calculate", authMiddleware, scoringController.calculatePerformanceResult);

// Результаты
router.get("/streams/:stream_id/results", scoringController.getStreamResults);
router.get("/gymnasts/:gymnast_id/competitions/:competition_id/results", scoringController.getGymnastDetailedResults);
router.post("/competitions/:competition_id/update-ranks", authMiddleware, scoringController.updateRanks);

module.exports = router;
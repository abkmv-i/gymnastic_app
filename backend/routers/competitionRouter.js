const Router = require ('express')
const router = new Router()
const competitionController = require("../controller//competitionController");
const authMiddleware = require("../middleware/authMiddleware");

// Создание и управление соревнованиями
router.post("/", authMiddleware, competitionController.createCompetition);
router.post("/:competition_id/days", authMiddleware, competitionController.addCompetitionDay);
router.post("/:competition_id/streams", authMiddleware, competitionController.createStream);
router.post("/streams/assign-gymnast", authMiddleware, competitionController.assignGymnastToStream);

// Судейские бригады
router.post("/:competition_id/panels", authMiddleware, competitionController.createJudgingPanel);
router.post("/panels/assign-judge", authMiddleware, competitionController.assignJudgeToPanel);

// Получение информации
router.get("/:competition_id", competitionController.getFullCompetitionInfo);
router.put("/:competition_id/status", authMiddleware, competitionController.updateCompetitionStatus);

router.get("/:competition_id/gymnasts", competitionController.getCompetitionGymnasts);
router.get("/:competition_id/judges", competitionController.getCompetitionJudges);
router.get("/:competition_id/streams", competitionController.getCompetitionStreams);
router.get("/:competition_id/results", competitionController.getCompetitionResults);
// В competitionRouter.js добавьте:
//router.get("/:competition_id/streams-with-gymnasts", competitionController.getStreamsWithGymnasts);
router.get("/:competition_id/streams-with-gymnasts", competitionController.getStreamsWithGymnastsAndApparatuses);
router.get("/:competition_id/results-with-details", competitionController.getCompetitionResultsWithDetails);
router.put("/:id", authMiddleware, competitionController.updateCompetition);

module.exports = router;
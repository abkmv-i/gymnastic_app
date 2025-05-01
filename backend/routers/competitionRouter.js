const Router = require('express')
const router = new Router()
const competitionController = require("../controller//competitionController");
const authMiddleware = require("../middleware/authMiddleware");

// Создание и управление соревнованиями
router.post("/", authMiddleware, competitionController.createCompetition);
router.put("/:id", authMiddleware, competitionController.updateCompetition);
router.delete('/:competition_id', competitionController.deleteCompetition);

router.post('/:competition_id/auto-assign', competitionController.autoAssignGymnastsToStreams);
router.post('/streams/assign-gymnast', competitionController.manualAssignGymnast);
router.post("/:competition_id/streams", authMiddleware, competitionController.createStream);

router.get("/:competition_id", competitionController.getFullCompetitionInfo);
router.put("/:competition_id/status", authMiddleware, competitionController.updateCompetitionStatus);

router.post("/:competition_id/days", authMiddleware, competitionController.addCompetitionDay);//-не используется

router.get("/:competition_id/gymnasts", competitionController.getCompetitionGymnasts);
router.get("/:competition_id/judges", competitionController.getCompetitionJudges);
router.get("/:competition_id/streams", competitionController.getCompetitionStreams);
router.get("/:competition_id/results", competitionController.getCompetitionResults);
router.get("/:competition_id/streams-with-gymnasts", competitionController.getStreamsWithGymnastsAndApparatuses);
router.get("/:competition_id/results-with-details", competitionController.getCompetitionResultsWithDetails);

// Судейские бригады
router.post("/:competition_id/panels", authMiddleware, competitionController.createJudgingPanel);
router.post("/panels/assign-judge", authMiddleware, competitionController.assignJudgeToPanel);


router.get("/:competition_id/performances", competitionController.getCompetitionPerformances);

module.exports = router;
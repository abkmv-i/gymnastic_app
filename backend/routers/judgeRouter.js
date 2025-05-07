const Router = require('express')
const router = new Router()
const judgeController = require('../controller/judgeController');
const authMiddleware = require("../middleware/authMiddleware");

router.post('/', authMiddleware, judgeController.createJudgeWithUser);
router.post('/assign', authMiddleware, judgeController.addJudgeToCompetition);
router.put('/competitions/:competition_id/judges/:judge_id', authMiddleware, judgeController.updateJudgeRole);
router.delete('/:competition_id/:judge_id', authMiddleware, judgeController.removeJudgeFromCompetition);
router.get('/competition/:competition_id', authMiddleware, judgeController.getCompetitionJudges);
// router.post('/create', authMiddleware, judgeController.createJudge);
router.get('/competitions/:competition_id/judges/id', authMiddleware, judgeController.getJudgeIdsForCompetition);
router.get('/user/:userId/competitions/:competitionId/role', authMiddleware, judgeController.getJudgeRoleByUserId);

module.exports = router;

const Router = require('express')
const router = new Router()
const dataController = require("../controller/dataController");
//const router = express.Router();


// Судейство
// router.post("/scores/judge", dataController.judgePerformance);

router.get("/competitions", dataController.getAllCompetitions);
router.get("/competitions/:id", dataController.getCompetitionByID);

router.get('/competitions/:competitionId/age-categories', dataController.getAgeCategories);
router.post('/competitions/:competitionId/age-categories', dataController.addAgeCategory);
router.put('/age-categories/:id', dataController.updateAgeCategory);
router.delete('/age-categories/:id', dataController.deleteAgeCategory);

module.exports = router;

const Router = require ('express')
const router = new Router()
const dataController = require("../controller/dataController");
//const router = express.Router();

// Загрузка данных
router.post("/gymnasts/upload", dataController.uploadGymnasts);
router.post("/judges/upload", dataController.uploadJudges);

// Судейство
router.post("/scores/judge", dataController.judgePerformance);

// Получение результатов
router.get("/results/gymnast/:gymnast_id", dataController.getGymnastResults);
router.get("/results/protocols", dataController.getCompetitionProtocols);
router.get("/results/brigades/:competition_id", dataController.getBrigadeResults);
router.get("/results/detail/:gymnast_id", dataController.getDetailedResults);


router.get("/competitions", dataController.getAllCompetitions);
router.get("/competitions/:id", dataController.getCompetitionByID);

router.get("/competitions/:id/list", dataController.getListGymnastics);

router.get('/competitions/:competitionId/age-categories', dataController.getAgeCategories);
router.post('/competitions/:competitionId/age-categories', dataController.addAgeCategory);
router.put('/age-categories/:id', dataController.updateAgeCategory);
router.delete('/age-categories/:id', dataController.deleteAgeCategory);

//router.put("/competitions/:id", authMiddleware, dataController.updateCompetition);
module.exports = router;

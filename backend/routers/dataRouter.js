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

module.exports = router;

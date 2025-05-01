const Router = require('express');
const router = new Router();
const multer = require('multer');   // <-- Добавь этот импорт
const gymnastController = require('../controller/gymnastController');
const authMiddleware = require("../middleware/authMiddleware");

// Добавление гимнастки
router.post('/', gymnastController.addGymnast);

// Назначение категории
router.put('/:id/assign-category', gymnastController.assignCategory);
router.delete('/:id', gymnastController.deleteGymnast);
router.put('/:id', gymnastController.updateGymnast);
const upload = multer({dest: 'uploads/'});  

router.post('/upload-gymnasts', upload.single('file'), gymnastController.fileGymnasts);
module.exports = router;

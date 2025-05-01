const db = require("../db");

class DataController {

    async judgePerformance(req, res) {
        try {
            const {gymnast_id, judge_id, apparatus, A_score, E_score, DA_score} = req.body;

            // Логика оценки выступления
            res.json({message: "Score recorded successfully"});
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to record score"});
        }
    }

    
    async getAllCompetitions(req, res) {
        try {
            const result = await db.query("SELECT id, name, date, location FROM competitions");
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to fetch competitions"});
        }
    }

    // Получить информацию о выбранном соревновании
    async getCompetitionByID(req, res) {
        try {
            const {id} = req.params;

            // Получаем основную информацию о соревновании
            const competition = await db.query(
                "SELECT id, name, date, location, status FROM competitions WHERE id = $1",
                [id]
            );

            if (competition.rows.length === 0) {
                return res.status(404).json({error: "Competition not found"});
            }

            // Получаем гимнасток (используем LEFT JOIN на случай отсутствия связей)
            const gymnasts = await db.query(
                `SELECT DISTINCT g.id, g.name, g.birth_year, g.city
             FROM gymnasts g
             LEFT JOIN gymnast_streams gs ON g.id = gs.gymnast_id
             LEFT JOIN streams s ON gs.stream_id = s.id
             WHERE s.competition_id = $1 OR g.id IN (
               SELECT gymnast_id FROM results WHERE competition_id = $1
             )`,
                [id]
            );

            // Получаем судей (используем альтернативный подход)
            const judges = await db.query(
                `SELECT DISTINCT j.id, j.name, pj.position AS category
             FROM judges j
             JOIN panel_judges pj ON j.id = pj.judge_id
             JOIN judging_panels jp ON pj.panel_id = jp.id
             WHERE jp.competition_id = $1`,
                [id]
            );

            res.json({
                ...competition.rows[0],
                gymnasts: gymnasts.rows,
                judges: judges.rows
            });
        } catch (err) {
            console.error("Detailed error:", err);
            res.status(500).json({
                error: "Failed to fetch competition details",
                details: err.message
            });
        }
    }

    async getAgeCategories(req, res) {
        try {
            const {competitionId} = req.params;

            const categoriesResult = await db.query(
                `SELECT id, name, min_birth_year, max_birth_year, description
                 FROM age_categories
                 WHERE competition_id = $1
                 ORDER BY min_birth_year`,
                [competitionId]
            );

            const categories = categoriesResult.rows;

            // Получаем предметы для всех категорий
            const apparatusResult = await db.query(
                `SELECT category_id, apparatus FROM category_apparatuses
                 WHERE category_id = ANY($1::int[])`,
                [categories.map(c => c.id)]
            );

            // Группируем предметы по категориям
            const apparatusMap = {};
            apparatusResult.rows.forEach(row => {
                if (!apparatusMap[row.category_id]) {
                    apparatusMap[row.category_id] = [];
                }
                apparatusMap[row.category_id].push(row.apparatus);
            });

            // Добавляем список предметов к каждой категории
            const enrichedCategories = categories.map(cat => ({
                ...cat,
                apparatuses: apparatusMap[cat.id] || []
            }));

            res.json(enrichedCategories);
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Не удалось получить категории с предметами"});
        }
    }


    async addAgeCategory(req, res) {
        try {
            const {competitionId} = req.params;
            const {name, minBirthYear, maxBirthYear, description, apparatuses} = req.body;

            if (!apparatuses || !Array.isArray(apparatuses) || apparatuses.length === 0) {
                return res.status(400).json({error: "Необходимо выбрать хотя бы один предмет"});
            }

            const existing = await db.query(
                'SELECT 1 FROM age_categories WHERE name = $1 AND competition_id = $2',
                [name, competitionId]
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({error: "Категория с таким названием уже существует"});
            }

            const newCategory = await db.query(
                `INSERT INTO age_categories (name, min_birth_year, max_birth_year, description, competition_id) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [name, minBirthYear, maxBirthYear, description || null, competitionId]
            );

            const categoryId = newCategory.rows[0].id;

            // Вставляем предметы
            for (const apparatus of apparatuses) {
                await db.query(
                    `INSERT INTO category_apparatuses (category_id, apparatus) VALUES ($1, $2)`,
                    [categoryId, apparatus]
                );
            }

            res.status(201).json({...newCategory.rows[0], apparatuses});
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Не удалось добавить категорию"});
        }
    }


    async deleteAgeCategory(req, res) {
        try {
            const {id} = req.params;

            // Проверяем, используется ли категория в streams или у гимнастов
            const inUse = await db.query(
                `SELECT 1 FROM streams WHERE age_category_id = $1 LIMIT 1`,
                [id]
            );

            if (inUse.rows.length > 0) {
                return res.status(400).json({
                    error: "Нельзя удалить категорию, она используется в потоках соревнования"
                });
            }

            await db.query(
                'DELETE FROM age_categories WHERE id = $1',
                [id]
            );

            res.json({message: "Категория успешно удалена"});
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Не удалось удалить категорию"});
        }
    }


    async updateAgeCategory(req, res) {
        try {
            const {id} = req.params;
            const {name, minBirthYear, maxBirthYear, description, apparatuses} = req.body;

            const updated = await db.query(
                `UPDATE age_categories 
             SET name = $1, min_birth_year = $2, max_birth_year = $3, description = $4
             WHERE id = $5
             RETURNING *`,
                [name, minBirthYear, maxBirthYear, description || null, id]
            );

            if (updated.rows.length === 0) {
                return res.status(404).json({error: "Категория не найдена"});
            }

            // Удаляем старые предметы
            await db.query(`DELETE FROM category_apparatuses WHERE category_id = $1`, [id]);

            // Вставляем новые предметы
            for (const apparatus of apparatuses) {
                await db.query(
                    `INSERT INTO category_apparatuses (category_id, apparatus) VALUES ($1, $2)`,
                    [id, apparatus]
                );
            }

            res.json({...updated.rows[0], apparatuses});
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Не удалось обновить категорию"});
        }
    }


}

module.exports = new DataController();

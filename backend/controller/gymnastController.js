const db = require('../db');
const xlsx = require('xlsx');
const fs = require('fs');
class GymnastController {
    // Добавление новой гимнастки
    async addGymnast(req, res) {
        try {
            const { name, birth_year, coach, city, age_category_id, competition_id } = req.body;
    
            if (!name || !birth_year || !competition_id) {
                return res.status(400).json({ error: "Необходимы имя, год рождения и ID соревнования" });
            }
    
            // Добавляем гимнастку
            const newGymnastResult = await db.query(
                `INSERT INTO gymnasts (name, birth_year, coach, city, age_category_id)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [name, birth_year, coach, city, age_category_id || null]  // Если категория не обязательна
            );
    
            const newGymnast = newGymnastResult.rows[0];
    
            // Добавляем в gymnast_additional_categories, если указана категория
            // if (newGymnast.age_category_id) {
            //     await db.query(
            //         `INSERT INTO gymnast_additional_categories (gymnast_id, category_id)
            //          VALUES ($1, $2)`,
            //         [newGymnast.id, newGymnast.age_category_id]
            //     );
            // }
    
            // Добавляем в competition_gymnasts
            await db.query(
                `INSERT INTO competition_gymnasts (competition_id, gymnast_id)
                 VALUES ($1, $2)`,
                [competition_id, newGymnast.id]
            );
    
            res.status(201).json(newGymnast);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Ошибка при добавлении гимнастки" });
        }
    }
    
    

    // Назначение возрастной категории гимнастке
    async assignCategory(req, res) {
        try {
            const { id } = req.params;
            const { age_category_id } = req.body;

            const updated = await db.query(
                `UPDATE gymnasts 
                 SET age_category_id = $1
                 WHERE id = $2
                 RETURNING *`,
                [age_category_id, id]
            );

            if (updated.rows.length === 0) {
                return res.status(404).json({ error: "Гимнастка не найдена" });
            }

            res.json(updated.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Ошибка при назначении категории" });
        }
    }
    // Удаление гимнастки
    async deleteGymnast(req, res) {
        try {
            const { id } = req.params;
    
            const gymnast = await db.query(
                `SELECT * FROM gymnasts WHERE id = $1`,
                [id]
            );
    
            if (gymnast.rows.length === 0) {
                return res.status(404).json({ error: "Гимнастка не найдена" });
            }
    
            // Удаляем все зависимости
            await db.query(`DELETE FROM gymnast_additional_categories WHERE gymnast_id = $1`, [id]);
            await db.query(`DELETE FROM gymnast_streams WHERE gymnast_id = $1`, [id]);
            await db.query(`DELETE FROM competition_gymnasts WHERE gymnast_id = $1`, [id]);
            await db.query(`DELETE FROM scores WHERE performance_id IN (SELECT id FROM performances WHERE gymnast_id = $1)`, [id]);
            await db.query(`DELETE FROM performances WHERE gymnast_id = $1`, [id]);
            await db.query(`DELETE FROM results WHERE gymnast_id = $1`, [id]);
    
            // Теперь можно удалить гимнастку
            await db.query(`DELETE FROM gymnasts WHERE id = $1`, [id]);
    
            res.json({ message: "Гимнастка успешно удалена" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Ошибка при удалении гимнастки" });
        }
    }
    // Полное обновление данных гимнастки
    async updateGymnast(req, res) {
        try {
            const { id } = req.params;
            const { name, birth_year, coach, city, age_category_id } = req.body;

            if (!name || !birth_year) {
                return res.status(400).json({ error: "Необходимы имя и год рождения" });
            }

            const updated = await db.query(
                `UPDATE gymnasts 
                SET name = $1, birth_year = $2, coach = $3, city = $4, age_category_id = $5
                WHERE id = $6
                RETURNING *`,
                [name, birth_year, coach, city, age_category_id || null, id]
            );

            if (updated.rows.length === 0) {
                return res.status(404).json({ error: "Гимнастка не найдена" });
            }

            res.json(updated.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Ошибка при обновлении гимнастки" });
        }
    }

    async fileGymnasts(req, res) {
        try {
            const file = req.file;
            const competitionId = req.body.competition_id;

            if (!file) return res.status(400).json({ error: "Файл не загружен" });

            const workbook = xlsx.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            for (let row of data) {
                const { "ФИО": name, "Год рождения": birthYear, "Тренер": coach, "Город": city, "Категория": categoryName } = row;

                if (!name || !birthYear) continue;

                // Поиск категории по названию
                const categoryResult = await db.query(
                    `SELECT id FROM age_categories WHERE name = $1 AND competition_id = $2`,
                    [categoryName, competitionId]
                );

                const ageCategoryId = categoryResult.rows[0]?.id || null;

                // Вставка гимнастки
                const gymnastResult = await db.query(
                    `INSERT INTO gymnasts (name, birth_year, coach, city, age_category_id)
                     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                    [name, birthYear, coach, city, ageCategoryId]
                );

                const gymnastId = gymnastResult.rows[0].id;

                // Привязка к соревнованию
                await db.query(
                    `INSERT INTO competition_gymnasts (competition_id, gymnast_id)
                     VALUES ($1, $2)`,
                    [competitionId, gymnastId]
                );
            }

            fs.unlinkSync(file.path);  // Удаляем файл после обработки

            res.json({ message: "Гимнастки успешно загружены" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Ошибка при обработке файла" });
        }
    }


}

module.exports = new GymnastController();

const db = require("../db");

class ScoringController {
    // Запись оценки за выступление
    async recordScore(req, res) {
        try {
            const {performance_id, judge_id, brigade, score} = req.body;

            // Проверяем, существует ли уже оценка от этого судьи за это выступление
            const existingScore = await db.query(
                "SELECT * FROM scores WHERE performance_id = $1 AND judge_id = $2 AND brigade = $3",
                [performance_id, judge_id, brigade]
            );

            if (existingScore.rows.length > 0) {
                return res.status(400).json({error: "Score already recorded for this performance"});
            }

            const newScore = await db.query(
                `INSERT INTO scores 
                 (performance_id, judge_id, brigade, score) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [performance_id, judge_id, brigade, score]
            );

            res.status(201).json(newScore.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to record score"});
        }
    }

    // Расчет итоговой оценки за выступление
    async calculatePerformanceResult(req, res) {
        try {
            const {performance_id} = req.params;

            // Получаем все оценки за это выступление
            const scores = await db.query(
                "SELECT * FROM scores WHERE performance_id = $1",
                [performance_id]
            );

            if (scores.rows.length === 0) {
                return res.status(404).json({error: "No scores found for this performance"});
            }

            // Группируем оценки по бригадам
            const scoresByBrigade = scores.rows.reduce((acc, score) => {
                if (!acc[score.brigade]) {
                    acc[score.brigade] = [];
                }
                acc[score.brigade].push(score.score);
                return acc;
            }, {});

            // Рассчитываем средние оценки по бригадам
            const brigadeAverages = {};
            for (const brigade in scoresByBrigade) {
                const brigadeScores = scoresByBrigade[brigade];
                brigadeScores.sort((a, b) => a - b);

                // Удаляем наивысшую и наинизшую оценки (если достаточно оценок)
                if (brigadeScores.length > 2) {
                    brigadeScores.pop(); // удаляем наивысшую
                    brigadeScores.shift(); // удаляем наинизшую
                }

                // Рассчитываем среднее
                const sum = brigadeScores.reduce((a, b) => a + b, 0);
                brigadeAverages[brigade] = sum / brigadeScores.length;
            }

            // Рассчитываем итоговую оценку по правилам художественной гимнастики
            let totalScore = 0;
            let aScore = brigadeAverages['A'] || 0;
            let eScore = brigadeAverages['E'] || 0;
            let daScore = brigadeAverages['DA'] || 0;
            let dbScore = brigadeAverages['DB'] || 0;

            // Формула расчета итоговой оценки может быть адаптирована под конкретные правила
            totalScore = aScore + eScore + daScore + (dbScore || 0);

            // Получаем информацию о выступлении
            const performance = await db.query(
                "SELECT * FROM performances WHERE id = $1",
                [performance_id]
            );

            if (performance.rows.length === 0) {
                return res.status(404).json({error: "Performance not found"});
            }

            // Обновляем или создаем запись в результатах
            const existingResult = await db.query(
                "SELECT * FROM results WHERE gymnast_id = $1 AND competition_id = $2",
                [performance.rows[0].gymnast_id, performance.rows[0].competition_id]
            );

            if (existingResult.rows.length > 0) {
                // Обновляем существующий результат
                const updatedResult = await db.query(
                    `UPDATE results SET 
                     total_score = $1, 
                     a_score = $2, 
                     e_score = $3, 
                     da_score = $4, 
                     db_score = $5 
                     WHERE id = $6 RETURNING *`,
                    [totalScore, aScore, eScore, daScore, dbScore, existingResult.rows[0].id]
                );

                res.json(updatedResult.rows[0]);
            } else {
                // Создаем новый результат
                const newResult = await db.query(
                    `INSERT INTO results 
                     (gymnast_id, competition_id, total_score, a_score, e_score, da_score, db_score) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [
                        performance.rows[0].gymnast_id,
                        performance.rows[0].competition_id,
                        totalScore,
                        aScore,
                        eScore,
                        daScore,
                        dbScore
                    ]
                );

                res.status(201).json(newResult.rows[0]);
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to calculate performance result"});
        }
    }

    // Обновление рангов гимнасток после завершения соревнования
    async updateRanks(req, res) {
        try {
            const {competition_id} = req.params;

            // Получаем все результаты для этого соревнования
            const results = await db.query(
                "SELECT * FROM results WHERE competition_id = $1 ORDER BY total_score DESC",
                [competition_id]
            );

            if (results.rows.length === 0) {
                return res.status(404).json({error: "No results found for this competition"});
            }

            // Обновляем ранги
            for (let i = 0; i < results.rows.length; i++) {
                await db.query(
                    "UPDATE results SET rank = $1 WHERE id = $2",
                    [i + 1, results.rows[i].id]
                );
            }

            res.json({message: "Ranks updated successfully"});
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to update ranks"});
        }
    }

    // Получение результатов по потоку
    async getStreamResults(req, res) {
        try {
            const {stream_id} = req.params;

            const results = await db.query(
                `SELECT r.*, g.name as gymnast_name, g.birth_year
                 FROM results r
                 JOIN gymnasts g ON r.gymnast_id = g.id
                 JOIN performances p ON r.gymnast_id = p.gymnast_id AND r.competition_id = p.competition_id
                 JOIN gymnast_streams gs ON g.id = gs.gymnast_id
                 WHERE gs.stream_id = $1
                 ORDER BY r.rank`,
                [stream_id]
            );

            res.json(results.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to get stream results"});
        }
    }

    // Получение детализированных результатов по гимнастке
    async getGymnastDetailedResults(req, res) {
        try {
            const {gymnast_id, competition_id} = req.params;

            // Основная информация о результате
            const result = await db.query(
                "SELECT * FROM results WHERE gymnast_id = $1 AND competition_id = $2",
                [gymnast_id, competition_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({error: "Result not found"});
            }

            // Все выступления гимнастки в этом соревновании
            const performances = await db.query(
                "SELECT * FROM performances WHERE gymnast_id = $1 AND competition_id = $2",
                [gymnast_id, competition_id]
            );

            // Все оценки за эти выступления
            const scores = await db.query(
                `SELECT s.*, j.name as judge_name, p.apparatus
                 FROM scores s
                 JOIN judges j ON s.judge_id = j.id
                 JOIN performances p ON s.performance_id = p.id
                 WHERE p.gymnast_id = $1 AND p.competition_id = $2`,
                [gymnast_id, competition_id]
            );

            res.json({
                ...result.rows[0],
                performances: performances.rows,
                scores: scores.rows
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Failed to get detailed results"});
        }
    }
}

module.exports = new ScoringController();
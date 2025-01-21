const db = require("../db");

class DataController {
    async uploadGymnasts(req, res) {
        try {
            // Логика загрузки файла с гимнастками
            res.json({ message: "Gymnasts uploaded successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to upload gymnasts" });
        }
    }

    async uploadJudges(req, res) {
        try {
            // Логика загрузки файла с судьями
            res.json({ message: "Judges uploaded successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to upload judges" });
        }
    }

    async judgePerformance(req, res) {
        try {
            const { gymnast_id, judge_id, apparatus, A_score, E_score, DA_score } = req.body;

            // Логика оценки выступления
            res.json({ message: "Score recorded successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to record score" });
        }
    }

    async getGymnastResults(req, res) {
        try {
            const { gymnast_id } = req.params;

            const results = await db.query(
                "SELECT * FROM results WHERE gymnast_id = $1",
                [gymnast_id]
            );

            res.json(results.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch results" });
        }
    }

//    async getCompetitionProtocols(req, res) {
//        try {
//            const { competition_id } = req.query;
//
//            const protocols = await db.query(
//                "SELECT * FROM results WHERE competition_id = $1",
//                [competition_id]
//            );
//
//            res.json(protocols.rows);
//        } catch (err) {
//            console.error(err);
//            res.status(500).json({ error: "Failed to fetch protocols" });
//        }
//    }

    // Пример контроллера на сервере
    async getCompetitionProtocols(req, res) {
      try {
        const { competition_id } = req.query;

        // Объединяем results и gymnasts по gymnast_id.
        // Предположим, вся ФИО хранится в gymnasts.name
        // Добавляем ORDER BY r.rank, если нужно сортировать по месту.
        const protocols = await db.query(
          "SELECT r.id, r.rank, r.total_score, r.a_score, r.e_score, r.da_score, r.created_at, r.competition_id, r.gymnast_id, g.name AS gymnast_name FROM results AS r JOIN gymnasts AS g ON r.gymnast_id = g.id WHERE r.competition_id = $1 ORDER BY r.rank ASC",
          [competition_id]
        );

        res.json(protocols.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch protocols" });
      }
    }


    async getBrigadeResults(req, res) {
        try {
            const { competition_id, brigade } = req.query;

            const results = await db.query(
                "SELECT * FROM scores WHERE competition_id = $1 AND brigade = $2",
                [competition_id, brigade]
            );

            res.json(results.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch brigade results" });
        }
    }

    async getDetailedResults(req, res) {
        try {
            const { gymnast_id } = req.params;

            const details = await db.query(
                `SELECT * FROM scores
         WHERE performance_id IN (
           SELECT id FROM performances WHERE gymnast_id = $1
         )`,
                [gymnast_id]
            );

            res.json(details.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch detailed results" });
        }
    }

    async getAllCompetitions(req, res) {
        try {
          const result = await db.query("SELECT id, name, date, location FROM competitions");
          res.json(result.rows);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to fetch competitions" });
        }
      }

      async getListGymnastics(req, res){
      try {
                const result = await db.query("SELECT id, name, birth_year, club FROM gymnasts");
                res.json(result.rows);
              } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Failed to fetch competitions" });
              }
      }

      // Получить информацию о выбранном соревновании
      async getCompetitionByID(req, res) {
        try {
          const { id } = req.params;

          const competition = await db.query(
            "SELECT id, name, date, location FROM competitions WHERE id = $1",
            [id]
          );

          if (competition.rows.length === 0) {
            return res.status(404).json({ error: "Competition not found" });
          }

          const competitionId = competition.rows[0].id;

          // Получить список гимнасток для соревнования
          const gymnasts = await db.query(
            `SELECT g.id, g.name, g.birth_year, g.club
             FROM gymnasts g
             JOIN performances p ON g.id = p.gymnast_id
             WHERE p.competition_id = $1`,
            [competitionId]
          );

          // Получить список судей для соревнования
          const judges = await db.query(
            `SELECT j.id, j.name, j.category
             FROM judges j
             JOIN scores s ON j.id = s.judge_id
             JOIN performances p ON s.performance_id = p.id
             WHERE p.competition_id = $1
             GROUP BY j.id`,
            [competitionId]
          );

          res.json({
            ...competition.rows[0],
            gymnasts: gymnasts.rows,
            judges: judges.rows
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to fetch competition details" });
        }
      }

}

module.exports = new DataController();

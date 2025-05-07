const db = require('../db');

class ScoringController {
  recalculateOneResult = async (gymnast_id, competition_id, apparatus) => {
    const scoresRes = await db.query(
      `SELECT s.score, jr.code
       FROM scores s
       JOIN judge_roles jr ON s.role_id = jr.id
       WHERE s.gymnast_id = $1 AND s.competition_id = $2 AND s.apparatus = $3`,
      [gymnast_id, competition_id, apparatus]
    );

    const a = [], e = [], da = [], db_scores = [];
    for (const { score, code } of scoresRes.rows) {
      const numericScore = parseFloat(score);
      if (code.startsWith('A')) a.push(numericScore);
      else if (code.startsWith('E')) e.push(numericScore);
      else if (code.startsWith('DA')) da.push(numericScore);
      else if (code.startsWith('DB')) db_scores.push(numericScore);
    }
    

    const mean = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
    const trimmedMean = (arr) => {
      if (arr.length <= 2) return mean(arr);
      const sorted = [...arr].sort((a, b) => a - b).slice(1, -1);
      return mean(sorted);
    };

    const a_score = 10 - trimmedMean(a);
    const e_score = 10 - trimmedMean(e);
    const da_score = mean(da);
    const db_score = mean(db_scores);
    const total_score = a_score + e_score + da_score + db_score;

    const gymnastRes = await db.query(
      `SELECT birth_year FROM gymnasts WHERE id = $1`,
      [gymnast_id]
    );
    if (gymnastRes.rows.length === 0) throw new Error("Гимнастка не найдена");

    const birth_year = gymnastRes.rows[0].birth_year;

    const ageCatRes = await db.query(
      `SELECT id FROM age_categories
       WHERE competition_id = $1 AND min_birth_year <= $2 AND max_birth_year >= $2
       LIMIT 1`,
      [competition_id, birth_year]
    );
    if (ageCatRes.rows.length === 0) throw new Error("Возрастная категория не найдена");

    const age_category_id = ageCatRes.rows[0].id;

    const exists = await db.query(
      `SELECT id FROM results WHERE gymnast_id = $1 AND competition_id = $2 AND apparatus = $3`,
      [gymnast_id, competition_id, apparatus]
    );

    if (exists.rows.length) {
      await db.query(
        `UPDATE results
         SET a_score = $1, e_score = $2, da_score = $3, db_score = $4,
             total_score = $5, age_category_id = $6
         WHERE gymnast_id = $7 AND competition_id = $8 AND apparatus = $9`,
        [a_score, e_score, da_score, db_score, total_score, age_category_id,
         gymnast_id, competition_id, apparatus]
      );
    } else {
      await db.query(
        `INSERT INTO results (gymnast_id, competition_id, apparatus,
          a_score, e_score, da_score, db_score, total_score, age_category_id, rank)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0)`,
        [gymnast_id, competition_id, apparatus, a_score, e_score, da_score, db_score, total_score, age_category_id]
      );
    }

    await db.query(`
      WITH ranked AS (
        SELECT id,
               RANK() OVER (
                 PARTITION BY age_category_id, apparatus
                 ORDER BY total_score DESC
               ) AS r
        FROM results
        WHERE competition_id = $1
      )
      UPDATE results r
      SET rank = ranked.r
      FROM ranked
      WHERE r.id = ranked.id
    `, [competition_id]);
  };

  addScore = async (req, res) => {
    try {
      const {
        performance_id,
        role_id,
        gymnast_id,
        competition_id,
        apparatus,
        score
      } = req.body;

      const user_id = req.user.id;

      const judgeRes = await db.query(
        `SELECT id FROM judges WHERE user_id = $1`,
        [user_id]
      );

      if (judgeRes.rows.length === 0) {
        return res.status(403).json({ error: 'Пользователь не является судьей' });
      }

      const judge_id = judgeRes.rows[0].id;

      await db.query(
        `INSERT INTO scores (performance_id, judge_id, role_id, gymnast_id, competition_id, apparatus, score)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [performance_id, judge_id, role_id, gymnast_id, competition_id, apparatus, score]
      );

      const allRolesRes = await db.query(
        `SELECT id FROM judge_roles WHERE code SIMILAR TO '(A[1-4]|E[1-4]|DA[12]|DB[12])'`
      );
      const expected = allRolesRes.rows.map(r => r.id).sort().join(',');

      const actualRolesRes = await db.query(
        `SELECT DISTINCT role_id FROM scores
         WHERE gymnast_id = $1 AND competition_id = $2 AND apparatus = $3`,
        [gymnast_id, competition_id, apparatus]
      );
      const actual = actualRolesRes.rows.map(r => r.role_id).sort().join(',');

      if (expected === actual) {
        await this.recalculateOneResult(gymnast_id, competition_id, apparatus);
      }

      res.status(201).json({ message: 'Оценка добавлена' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при добавлении оценки' });
    }
  };
}

module.exports = new ScoringController();

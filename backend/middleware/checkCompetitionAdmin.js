const db = require('../db');

module.exports = async function checkCompetitionAdmin(req, res, next) {
  try {
    const competitionId = parseInt(req.params.id || req.params.competition_id);
    const userId = req.user.id;

    if (isNaN(competitionId)) {
      return res.status(400).json({ error: "Некорректный ID соревнования" });
    }

    const result = await db.query(
      `SELECT 1 FROM competition_admins WHERE competition_id = $1 AND user_id = $2`,
      [competitionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "У вас нет прав администратора этого соревнования" });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ error: "Ошибка проверки прав администратора" });
  }
};

const db = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

function transliterate(str) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd',
    е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n',
    о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
    ш: 'sh', щ: 'shch', ы: 'y', э: 'e', ю: 'yu',
    я: 'ya', ь: '', ъ: ''
  };
  return str
    .toLowerCase()
    .split('')
    .map(char => map[char] || '')
    .join('');
}

function generateLoginFromName(fullName) {
  const parts = fullName.trim().toLowerCase().split(' ');
  if (parts.length !== 3) return null;

  const [last, first, middle] = parts;
  const login = `${last.slice(0, 4)}${first[0]}${middle[0]}`;
  return transliterate(login);
}


// Генерация случайного пароля
function generateRandomPassword(length = 8) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

async function getRoleIdByCode(code) {
  const res = await db.query('SELECT id FROM judge_roles WHERE code = $1', [code]);
  if (res.rows.length === 0) {
    throw new Error(`Роль "${code}" не найдена`);
  }
  return res.rows[0].id;
}

class JudgeController {
  // Создать судью и пользователя (если нужно)
  async createJudgeWithUser(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Имя обязательно' });
  
      const login = await generateLoginFromName(name);
      if (!login) return res.status(400).json({ error: 'Некорректное ФИО' });
  
      // Проверка — есть ли пользователь с таким логином
      const userRes = await db.query('SELECT * FROM users WHERE username = $1', [login]);
      let userId, generatedPassword = null;
  
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      } else {
        // Создание нового пользователя
        const password = generateRandomPassword();
        generatedPassword = password;
        const hashed = await bcrypt.hash(password, 10);
        const newUser = await db.query(
          'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
          [login, hashed]
        );
        userId = newUser.rows[0].id;
      }
  
      // Проверка — есть ли уже судья с таким user_id
      const judgeCheck = await db.query('SELECT * FROM judges WHERE user_id = $1', [userId]);
      let judge;
  
      if (judgeCheck.rows.length > 0) {
        judge = judgeCheck.rows[0];
      } else {
        // Создание нового судьи
        const newJudge = await db.query(
          'INSERT INTO judges (name, user_id) VALUES ($1, $2) RETURNING *',
          [name, userId]
        );
        judge = newJudge.rows[0];
      }
  
      res.status(201).json({
        judge,
        login,
        password: generatedPassword || undefined
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при создании судьи' });
    }
  }
  

  // Назначить судью на соревнование
  async addJudgeToCompetition(req, res) {
    try {
      const { judge_id, competition_id, role } = req.body;
  
      const roleId = await getRoleIdByCode(role);
  
      const existing = await db.query(
        `SELECT * FROM competition_judges WHERE judge_id = $1 AND competition_id = $2`,
        [judge_id, competition_id]
      );
  
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Судья уже назначен на это соревнование' });
      }
  
      const result = await db.query(
        `INSERT INTO competition_judges (judge_id, competition_id, role)
         VALUES ($1, $2, $3) RETURNING *`,
        [judge_id, competition_id, roleId]
      );
  
      if (role === 'администратор') {
        const userRes = await db.query(`SELECT user_id FROM judges WHERE id = $1`, [judge_id]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Судья не найден' });
  
        await db.query(
          `INSERT INTO competition_admins (competition_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [competition_id, userRes.rows[0].user_id]
        );
      }
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при добавлении судьи в соревнование' });
    }
  }
  

  // Обновить роль судьи
  async updateJudgeRole(req, res) {
    try {
      const { competition_id, judge_id } = req.params;
      const { role } = req.body;
  
      const roleId = await getRoleIdByCode(role);
  
      const updated = await db.query(
        `UPDATE competition_judges
         SET role = $1
         WHERE competition_id = $2 AND judge_id = $3
         RETURNING *`,
        [roleId, competition_id, judge_id]
      );
  
      if (updated.rows.length === 0) {
        return res.status(404).json({ error: 'Связь не найдена' });
      }
  
      const userRes = await db.query(`SELECT user_id FROM judges WHERE id = $1`, [judge_id]);
      if (userRes.rows.length === 0) return res.status(404).json({ error: 'Судья не найден' });
  
      const user_id = userRes.rows[0].user_id;
  
      if (role === 'администратор') {
        await db.query(
          `INSERT INTO competition_admins (competition_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [competition_id, user_id]
        );
      } else {
        await db.query(
          `DELETE FROM competition_admins WHERE competition_id = $1 AND user_id = $2`,
          [competition_id, user_id]
        );
      }
  
      res.json(updated.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при обновлении роли судьи' });
    }
  }
  

  // Удалить судью из соревнования
  async removeJudgeFromCompetition(req, res) {
    try {
      const competition_id = parseInt(req.params.competition_id);
      const judge_id = parseInt(req.params.judge_id);

      const userRes = await db.query(`SELECT user_id FROM judges WHERE id = $1`, [judge_id]);
      const user_id = userRes.rows.length > 0 ? userRes.rows[0].user_id : null;

      await db.query(
        `DELETE FROM competition_judges WHERE competition_id = $1 AND judge_id = $2`,
        [competition_id, judge_id]
      );

      if (user_id) {
        await db.query(
          `DELETE FROM competition_admins WHERE competition_id = $1 AND user_id = $2`,
          [competition_id, user_id]
        );
      }

      res.json({ message: 'Судья удалён из соревнования' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при удалении судьи' });
    }
  }

  // Получить всех судей соревнования
  async getCompetitionJudges(req, res) {
    try {
      const { competition_id } = req.params;
  
      const result = await db.query(`
        SELECT j.*, jr.code as role
        FROM competition_judges cj
        JOIN judges j ON cj.judge_id = j.id
        JOIN judge_roles jr ON cj.role = jr.id
        WHERE cj.competition_id = $1
        ORDER BY jr.id`,
        [competition_id]
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при получении судей' });
    }
  }
  

async getJudgeIdsForCompetition(req, res) {
  try {
    const { competition_id } = req.params;
    const result = await db.query(
      `SELECT j.user_id FROM competition_judges cj
       JOIN judges j ON cj.judge_id = j.id
       WHERE cj.competition_id = $1`,
      [competition_id]
    );
    const judgeIds = result.rows.map(r => r.user_id);
    res.json({ judgeIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить судей' });
  }
}
// Получить роль судьи в соревновании
// Получить роль судьи в соревновании по user_id
async getJudgeRoleByUserId(req, res) {
  try {
    const { userId, competitionId } = req.params;

    const result = await db.query(`
      SELECT jr.id AS role_id, jr.code
      FROM judges j
      JOIN competition_judges cj ON cj.judge_id = j.id
      JOIN judge_roles jr ON cj.role = jr.id
      WHERE j.user_id = $1 AND cj.competition_id = $2
      LIMIT 1
    `, [userId, competitionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Судья не найден или не назначен в этом соревновании' });
    }

    res.json(result.rows[0]); // { role_id, code }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении роли судьи' });
  }
}



}

module.exports = new JudgeController();

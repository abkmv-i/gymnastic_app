const db = require("../db");

class CompetitionController {
    // Создание нового соревнования
    async createCompetition(req, res) {
        try {
            const { name, date, location, status = "planned" } = req.body;
            
            const newCompetition = await db.query(
                `INSERT INTO competitions (name, date, location, status) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [name, date, location, status]
            );
            
            res.status(201).json(newCompetition.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to create competition" });
        }
    }

    // Добавление дня соревнования
    async addCompetitionDay(req, res) {
        try {
            const { competition_id, day_date, start_time, end_time, description } = req.body;
            
            const newDay = await db.query(
                `INSERT INTO competition_days 
                 (competition_id, day_date, start_time, end_time, description) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [competition_id, day_date, start_time, end_time, description]
            );
            
            res.status(201).json(newDay.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to add competition day" });
        }
    }

    // Создание потоков для соревнования
    async createStream(req, res) {
        try {
            const { 
                competition_id, 
                age_category_id, 
                stream_number, 
                name, 
                max_gymnasts, 
                competition_day_id,
                scheduled_start,
                estimated_duration
            } = req.body;
            
            const newStream = await db.query(
                `INSERT INTO streams 
                 (competition_id, age_category_id, stream_number, name, max_gymnasts, 
                  competition_day_id, scheduled_start, estimated_duration) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [
                    competition_id, 
                    age_category_id, 
                    stream_number, 
                    name, 
                    max_gymnasts, 
                    competition_day_id,
                    scheduled_start,
                    estimated_duration
                ]
            );
            
            res.status(201).json(newStream.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to create stream" });
        }
    }

    // Назначение гимнасток в потоки
    // async assignGymnastToStream(req, res) {
    //     try {
    //         const { gymnast_id, stream_id } = req.body;
            
    //         // Проверяем, не назначена ли уже гимнастка в этот поток
    //         const existingAssignment = await db.query(
    //             "SELECT * FROM gymnast_streams WHERE gymnast_id = $1 AND stream_id = $2",
    //             [gymnast_id, stream_id]
    //         );
            
    //         if (existingAssignment.rows.length > 0) {
    //             return res.status(400).json({ error: "Gymnast already assigned to this stream" });
    //         }
            
    //         const assignment = await db.query(
    //             "INSERT INTO gymnast_streams (gymnast_id, stream_id) VALUES ($1, $2) RETURNING *",
    //             [gymnast_id, stream_id]
    //         );
            
    //         res.status(201).json(assignment.rows[0]);
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({ error: "Failed to assign gymnast to stream" });
    //     }
    // }

    // Создание судейских бригад
    async createJudgingPanel(req, res) {
        try {
            const { competition_id, apparatus, panel_type } = req.body;
            
            const newPanel = await db.query(
                `INSERT INTO judging_panels 
                 (competition_id, apparatus, panel_type) 
                 VALUES ($1, $2, $3) RETURNING *`,
                [competition_id, apparatus, panel_type]
            );
            
            res.status(201).json(newPanel.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to create judging panel" });
        }
    }

    // Назначение судей в бригады
    async assignJudgeToPanel(req, res) {
        try {
            const { panel_id, judge_id, position } = req.body;
            
            // Проверяем, не назначен ли уже судья в эту бригаду
            const existingAssignment = await db.query(
                "SELECT * FROM panel_judges WHERE panel_id = $1 AND judge_id = $2",
                [panel_id, judge_id]
            );
            
            if (existingAssignment.rows.length > 0) {
                return res.status(400).json({ error: "Judge already assigned to this panel" });
            }
            
            const assignment = await db.query(
                `INSERT INTO panel_judges (panel_id, judge_id, position) 
                 VALUES ($1, $2, $3) RETURNING *`,
                [panel_id, judge_id, position]
            );
            
            res.status(201).json(assignment.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to assign judge to panel" });
        }
    }

    // Получение полной информации о соревновании
    async getFullCompetitionInfo(req, res) {
        try {
            const { competition_id } = req.params;
            
            // Основная информация о соревновании
            const competition = await db.query(
                "SELECT * FROM competitions WHERE id = $1",
                [competition_id]
            );
            
            if (competition.rows.length === 0) {
                return res.status(404).json({ error: "Competition not found" });
            }
            
            // Дни соревнования
            const days = await db.query(
                "SELECT * FROM competition_days WHERE competition_id = $1 ORDER BY day_date",
                [competition_id]
            );
            
            // Потоки
            const streams = await db.query(
                `SELECT s.*, ac.name as age_category_name 
                 FROM streams s
                 JOIN age_categories ac ON s.age_category_id = ac.id
                 WHERE s.competition_id = $1 ORDER BY s.scheduled_start`,
                [competition_id]
            );
            
            // Гимнастки в соревновании
            const gymnasts = await db.query(
                `SELECT DISTINCT g.* 
                 FROM gymnasts g
                 JOIN gymnast_streams gs ON g.id = gs.gymnast_id
                 JOIN streams s ON gs.stream_id = s.id
                 WHERE s.competition_id = $1`,
                [competition_id]
            );
            
            // Судейские бригады
            const panels = await db.query(
                `SELECT jp.*, 
                 ARRAY(
                     SELECT json_build_object(
                         'id', j.id, 
                         'name', j.name, 
                         'position', pj.position
                     )
                     FROM panel_judges pj
                     JOIN judges j ON pj.judge_id = j.id
                     WHERE pj.panel_id = jp.id
                 ) as judges
                 FROM judging_panels jp
                 WHERE jp.competition_id = $1`,
                [competition_id]
            );
            
            res.json({
                ...competition.rows[0],
                days: days.rows,
                streams: streams.rows,
                gymnasts: gymnasts.rows,
                panels: panels.rows
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to get competition info" });
        }
    }

    // Обновление статуса соревнования
    async updateCompetitionStatus(req, res) {
        try {
            const { competition_id } = req.params;
            const { status } = req.body;
            
            const updated = await db.query(
                "UPDATE competitions SET status = $1 WHERE id = $2 RETURNING *",
                [status, competition_id]
            );
            
            res.json(updated.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to update competition status" });
        }
    }


    async getCompetitionJudges(req, res){
        try {
          const { competition_id } = req.params;
          
          const judges = await db.query(`
            SELECT j.* FROM judges j
            JOIN panel_judges pj ON j.id = pj.judge_id
            JOIN judging_panels jp ON pj.panel_id = jp.id
            WHERE jp.competition_id = $1
            GROUP BY j.id
          `, [competition_id]);
      
          res.json(judges.rows);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
        }
      };
      
      async getCompetitionStreams (req, res){
        try {
          const { competition_id } = req.params;
          
          const streams = await db.query(`
            SELECT s.*, ac.name as age_category_name 
            FROM streams s
            LEFT JOIN age_categories ac ON s.age_category_id = ac.id
            WHERE s.competition_id = $1
            ORDER BY s.stream_number
          `, [competition_id]);
      
          res.json(streams.rows);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
        }
      };
      
      async getCompetitionResults(req, res) {
        try {
          const { competition_id } = req.params;
          
          const results = await db.query(`
            SELECT r.*, g.name as gymnast_name 
            FROM results r
            JOIN gymnasts g ON r.gymnast_id = g.id
            WHERE r.competition_id = $1
            ORDER BY r.rank
          `, [competition_id]);
      
          res.json(results.rows);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
        }
      };

      async getCompetitionGymnasts(req, res){
        try {
          const { competition_id } = req.params;
          
          const gymnasts = await db.query(`
            SELECT g.*, ac.name as age_category_name 
            FROM competition_gymnasts cg
            JOIN gymnasts g ON cg.gymnast_id = g.id
            LEFT JOIN age_categories ac ON g.age_category_id = ac.id
            WHERE cg.competition_id = $1
            ORDER BY g.name
          `, [competition_id]);
    
          res.json(gymnasts.rows);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
        }
    };
    

      // В competitionController.js добавьте:
async getStreamsWithGymnasts(req, res) {
    try {
      const { competition_id } = req.params;
      
      const streams = await db.query(`
        SELECT s.*, ac.name as age_category_name 
        FROM streams s
        LEFT JOIN age_categories ac ON s.age_category_id = ac.id
        WHERE s.competition_id = $1
        ORDER BY s.stream_number
      `, [competition_id]);
  
      // Для каждого потока получаем гимнасток
      for (let stream of streams.rows) {
        const gymnasts = await db.query(`
          SELECT g.* 
          FROM gymnasts g
          JOIN gymnast_streams gs ON g.id = gs.gymnast_id
          WHERE gs.stream_id = $1
          ORDER BY g.name
        `, [stream.id]);
        stream.gymnasts = gymnasts.rows;
      }
  
      res.json(streams.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  async getStreamsWithGymnastsAndApparatuses(req, res) {
    try {
      const { competition_id } = req.params;
  
      const streams = await db.query(`
        SELECT s.*, ac.name as age_category_name 
        FROM streams s
        LEFT JOIN age_categories ac ON s.age_category_id = ac.id
        WHERE s.competition_id = $1
        ORDER BY s.stream_number
      `, [competition_id]);
  
      for (let stream of streams.rows) {
        const gymnastsWithApparatuses = await db.query(`
          SELECT 
            g.id, 
            g.name,
            g.birth_year,
            g.city,
            g.coach,
            COALESCE(array_agg(DISTINCT p.apparatus::text), ARRAY[]::text[]) as apparatuses
          FROM gymnasts g
          JOIN gymnast_streams gs ON g.id = gs.gymnast_id
          LEFT JOIN performances p ON p.gymnast_id = g.id AND p.stream_id = $1
          WHERE gs.stream_id = $1
          GROUP BY g.id, g.name, g.birth_year, g.city, g.coach
          ORDER BY g.name
        `, [stream.id]);
  
        stream.gymnasts = gymnastsWithApparatuses.rows.map(g => ({
          ...g,
          apparatuses: g.apparatuses || []
        }));
      }
  
      res.json(streams.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  

  async getCompetitionResultsWithDetails(req, res) {
    try {
      const { competition_id } = req.params;
      
      // Сначала получаем все возрастные категории
      const ageCategories = await db.query(`
        SELECT * FROM age_categories
        ORDER BY min_birth_year
      `);
  
      // Получаем всех гимнасток с их возрастными категориями
      const gymnasts = await db.query(`
        SELECT g.id, g.name, g.age_category_id
        FROM gymnasts g
        JOIN results r ON g.id = r.gymnast_id
        WHERE r.competition_id = $1
        GROUP BY g.id
      `, [competition_id]);
  
      // Для каждой возрастной категории получаем результаты
      const resultsByCategory = await Promise.all(
        ageCategories.rows.map(async (category) => {
          // Получаем результаты с ранжированием внутри категории
          const categoryResults = await db.query(`
            SELECT 
              r.*,
              g.name as gymnast_name,
              RANK() OVER (ORDER BY r.total_score DESC) as category_rank
            FROM results r
            JOIN gymnasts g ON r.gymnast_id = g.id
            WHERE r.competition_id = $1 AND g.age_category_id = $2
            ORDER BY category_rank
          `, [competition_id, category.id]);
  
          // Для каждого результата получаем данные по предметам
          for (let result of categoryResults.rows) {
            const apparatusResults = await db.query(`
              SELECT 
                p.apparatus,
                COALESCE(SUM(CASE WHEN pj.position = 'A' THEN s.score ELSE 0 END)::numeric, 0) as a_score,
                COALESCE(SUM(CASE WHEN pj.position = 'E' THEN s.score ELSE 0 END)::numeric, 0) as e_score,
                COALESCE(SUM(CASE WHEN pj.position = 'DA' THEN s.score ELSE 0 END)::numeric, 0) as da_score,
                COALESCE(SUM(CASE WHEN pj.position = 'DB' THEN s.score ELSE 0 END)::numeric, 0) as db_score,
                COALESCE(SUM(s.score)::numeric, 0) as total
              FROM performances p
              LEFT JOIN scores s ON p.id = s.performance_id
              LEFT JOIN panel_judges pj ON s.judge_id = pj.judge_id
              WHERE p.gymnast_id = $1 AND p.competition_id = $2
              GROUP BY p.apparatus
              ORDER BY p.apparatus
            `, [result.gymnast_id, competition_id]);
            
            result.apparatusResults = apparatusResults.rows;
          }
  
          return {
            category,
            results: categoryResults.rows
          };
        })
      );
  
      // Формируем плоский список результатов для обратной совместимости
      const allResults = resultsByCategory.flatMap(category => 
        category.results.map(result => ({
          ...result,
          age_category_id: category.category.id,
          age_category_name: category.category.name,
          rank: result.category_rank // Используем ранг в категории как основной
        }))
      );
  
      res.json(allResults);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

  async updateCompetition(req, res) {
    try {
      const { id } = req.params;
      const { name, date, location, status } = req.body;
      
      const updatedCompetition = await db.query(
        `UPDATE competitions 
         SET name = $1, date = $2, location = $3, status = $4 
         WHERE id = $5 RETURNING *`,
        [name, date, location, status, id]
      );
      
      if (updatedCompetition.rows.length === 0) {
        return res.status(404).json({ error: "Competition not found" });
      }
      
      res.json(updatedCompetition.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update competition" });
    }
  };
  

  async autoAssignGymnastsToStreams(req, res) {
    try {
      const { competition_id } = req.params;
      const { day_start_time, day_end_time } = req.body;
  
      if (!day_start_time || !day_end_time) {
        return res.status(400).json({ error: "Нужно передать время начала и окончания дня соревнований" });
      }
  
      const apparatusMap = {
        'б/п': 'no_apparatus',
        'скакалка': 'rope',
        'обруч': 'hoop',
        'мяч': 'ball',
        'булавы': 'clubs',
        'лента': 'ribbon'
      };
  
      const gymnastsResult = await db.query(`
        SELECT g.id, g.name, g.age_category_id
        FROM gymnasts g
        JOIN competition_gymnasts cg ON g.id = cg.gymnast_id
        WHERE cg.competition_id = $1
        ORDER BY g.age_category_id
      `, [competition_id]);
  
      const gymnasts = gymnastsResult.rows;
  
      if (gymnasts.length === 0) {
        return res.status(400).json({ error: "Нет гимнасток для распределения" });
      }
  
      const categoriesResult = await db.query(`
        SELECT ac.id, array_agg(ca.apparatus) as apparatuses
        FROM age_categories ac
        LEFT JOIN category_apparatuses ca ON ca.category_id = ac.id
        WHERE ac.competition_id = $1
        GROUP BY ac.id
      `, [competition_id]);
  
      const categories = categoriesResult.rows.reduce((acc, cat) => {
        acc[cat.id] = cat.apparatuses;
        return acc;
      }, {});
  
      // Очистка данных
      await db.query(`
        DELETE FROM scores 
        WHERE performance_id IN (
            SELECT id FROM performances WHERE competition_id = $1
        )
      `, [competition_id]);
  
      await db.query(`
        DELETE FROM performances WHERE competition_id = $1
      `, [competition_id]);
  
      await db.query(`
        DELETE FROM gymnast_streams 
        WHERE stream_id IN (SELECT id FROM streams WHERE competition_id = $1)
      `, [competition_id]);
  
      await db.query(`
        DELETE FROM streams WHERE competition_id = $1
      `, [competition_id]);
  
      let streamNumber = 1;
      const groupedByCategory = {};
      gymnasts.forEach(g => {
        if (!g.age_category_id) {
          console.warn(`Гимнастка ${g.name} (ID: ${g.id}) без категории, пропущена`);
          return;
        }
        if (!groupedByCategory[g.age_category_id]) groupedByCategory[g.age_category_id] = [];
        groupedByCategory[g.age_category_id].push(g);
      });
  
      // Текущий таймер времени дня
      let currentTime = new Date(`1970-01-01T${day_start_time}:00`);
      const endTime = new Date(`1970-01-01T${day_end_time}:00`);
  
      for (const [categoryId, gymnastsList] of Object.entries(groupedByCategory)) {
        const apparatuses = categories[categoryId];
  
        if (!apparatuses || apparatuses.length === 0) {
          console.warn(`Категория ID ${categoryId} не имеет предметов, пропуск`);
          continue;
        }
  
        for (let i = 0; i < gymnastsList.length; i += 7) {
          const batch = gymnastsList.slice(i, i + 7);
  
          const batchDurationMinutes = batch.length * 2; // 2 минуты на гимнастку
          const estimatedDuration = `${Math.floor(batchDurationMinutes / 60)}:${(batchDurationMinutes % 60).toString().padStart(2, '0')}:00`;
  
          if (currentTime > endTime) {
            return res.status(400).json({ error: "Недостаточно времени для всех потоков. Проверьте day_start_time и day_end_time" });
          }
  
          const scheduled_start = new Date(currentTime); // Фиксируем текущее время для потока
  
          // Создаем поток
          const newStream = await db.query(`
            INSERT INTO streams (competition_id, age_category_id, stream_number, scheduled_start, estimated_duration)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `, [competition_id, categoryId, streamNumber, scheduled_start, estimatedDuration]);
  
          const streamId = newStream.rows[0].id;
  
          for (const gymnast of batch) {
            await db.query(`
              INSERT INTO gymnast_streams (gymnast_id, stream_id, competition_id)
              VALUES ($1, $2, $3)
            `, [gymnast.id, streamId, competition_id]);
          
  
            for (const apparatus of apparatuses) {
              const enumApparatus = apparatusMap[apparatus];
              if (!enumApparatus) {
                console.warn(`Неизвестный предмет "${apparatus}" у гимнастки ${gymnast.id}`);
                continue;
              }
  
              await db.query(`
                INSERT INTO performances (gymnast_id, competition_id, stream_id, apparatus)
                VALUES ($1, $2, $3, $4)
              `, [gymnast.id, competition_id, streamId, enumApparatus]);
            }
          }
  
          streamNumber++;
  
          // Сдвигаем текущее время на длительность потока
          currentTime.setMinutes(currentTime.getMinutes() + batchDurationMinutes);
        }
      }
  
      res.json({ message: "Автоматическое распределение завершено успешно" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ошибка при автоматическом распределении", details: err.message });
    }
  }
  
  async manualAssignGymnast(req, res) {
    try {
      const { gymnast_id, stream_id, competition_id } = req.body;
  
      // Найти старый stream_id этой гимнастки в этом соревновании
      const oldStreamRes = await db.query(`
        SELECT stream_id FROM gymnast_streams
        WHERE gymnast_id = $1 AND stream_id IN (
          SELECT id FROM streams WHERE competition_id = $2
        )
        LIMIT 1
      `, [gymnast_id, competition_id]);
  
      const oldStreamId = oldStreamRes.rows[0]?.stream_id;
  
      // Обновить связь в gymnast_streams
      await db.query(`
        DELETE FROM gymnast_streams
        WHERE gymnast_id = $1
          AND stream_id IN (
            SELECT id FROM streams WHERE competition_id = $2
          )
      `, [gymnast_id, competition_id]);
  
      await db.query(`
        INSERT INTO gymnast_streams (gymnast_id, stream_id, competition_id)
        VALUES ($1, $2, $3)
      `, [gymnast_id, stream_id, competition_id]);
  
      // ⏩ Обновить stream_id в performances (не удалять!)
      if (oldStreamId) {
        await db.query(`
          UPDATE performances
          SET stream_id = $1
          WHERE gymnast_id = $2
            AND stream_id = $3
            AND competition_id = $4
        `, [stream_id, gymnast_id, oldStreamId, competition_id]);
      }
  
      res.json({ message: "Гимнастка перемещена без потери предметов" });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ошибка при перемещении", details: err.message });
    }
  }

  // Удаление соревнования и всех связанных данных
async deleteCompetition(req, res) {
  try {
    const { competition_id } = req.params;

    // Удаляем сначала дочерние зависимости вручную (если нет ON DELETE CASCADE)
    await db.query(`DELETE FROM scores WHERE performance_id IN (
      SELECT id FROM performances WHERE competition_id = $1
    )`, [competition_id]);

    await db.query(`DELETE FROM performances WHERE competition_id = $1`, [competition_id]);

    await db.query(`DELETE FROM gymnast_streams 
      WHERE stream_id IN (SELECT id FROM streams WHERE competition_id = $1)`, [competition_id]);

    await db.query(`DELETE FROM streams WHERE competition_id = $1`, [competition_id]);

    await db.query(`DELETE FROM judging_panels WHERE competition_id = $1`, [competition_id]);

    await db.query(`DELETE FROM results WHERE competition_id = $1`, [competition_id]);

    await db.query(`DELETE FROM competition_days WHERE competition_id = $1`, [competition_id]);

    await db.query(`DELETE FROM competition_gymnasts WHERE competition_id = $1`, [competition_id]);

    await db.query(`DELETE FROM age_categories WHERE competition_id = $1`, [competition_id]);

    // Удаление самого соревнования
    const deleted = await db.query(`DELETE FROM competitions WHERE id = $1 RETURNING *`, [competition_id]);

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Соревнование не найдено" });
    }

    res.json({ message: "Соревнование успешно удалено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при удалении соревнования", details: err.message });
  }
}

}

module.exports = new CompetitionController();
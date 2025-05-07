import React, { useState } from 'react';
import axios from 'axios';
import { Judge, JudgesTableProps, JudgeRole } from '../../models/types';
import '../../styles/common.css';

const JudgesTable: React.FC<JudgesTableProps> = ({ judges, competitionId, onUpdate }) => {
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeRole, setNewJudgeRole] = useState<JudgeRole>('A1');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [judgeToDelete, setJudgeToDelete] = useState<Judge | null>(null);
  const [credentials, setCredentials] = useState<{ login: string, password?: string } | null>(null);

  const resetForm = () => {
    setNewJudgeName('');
    setNewJudgeRole('A1');
    setEditingId(null);
    setIsEditing(false);
    setCredentials(null);
  };

  const handleAddOrUpdateJudge = async () => {
    if (!newJudgeName.trim()) {
      alert('Введите имя судьи');
      return;
    }

    try {
      if (isEditing && editingId !== null) {
        // Обновление роли
        await axios.put(`http://localhost:8080/judges/competitions/${competitionId}/judges/${editingId}`, {
          role: newJudgeRole
        });
      } else {
        // 1. Создаём судью с пользователем
        const createRes = await axios.post('http://localhost:8080/judges', {
          name: newJudgeName
        });
        const { judge, login, password } = createRes.data;
        const judgeId = judge.id;

        // 2. Назначаем судью на соревнование
        await axios.post('http://localhost:8080/judges/assign', {
          judge_id: judgeId,
          competition_id: competitionId,
          role: newJudgeRole
        });

        // Показываем логин и пароль
        setCredentials({ login, password });
      }

      onUpdate();
      setNewJudgeName('');
      setNewJudgeRole('A1');
      setEditingId(null);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Ошибка при добавлении судьи');
    }
  };

  const handleEditJudge = (judge: Judge) => {
    setNewJudgeName(judge.name);
    setNewJudgeRole(judge.role);
    setEditingId(judge.id);
    setIsEditing(true);
    setCredentials(null);
  };

  const confirmDeleteJudge = () => {
    if (judgeToDelete) {
      axios.delete(`http://localhost:8080/judges/${competitionId}/${judgeToDelete.id}`)
        .then(() => {
          onUpdate();
          setShowDeleteModal(false);
          setJudgeToDelete(null);
        })
        .catch(() => alert('Ошибка при удалении судьи'));
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setJudgeToDelete(null);
  };

  const judgeRoles: JudgeRole[] = ['A1', 'A2', 'A3', 'A4', 'E1', 'E2', 'E3', 'E4', 'DA1', 'DA2',  'DB1', 'DB2', 'линейный судья', 'хронометрист', 'главный судья', 'администратор'];

  return (
    <div className="section-container">
      <div className="form-grid">
        <h4>{isEditing ? 'Редактировать судью' : 'Добавить судью'}</h4>
        <input
          type="text"
          placeholder="Имя судьи"
          value={newJudgeName}
          onChange={(e) => setNewJudgeName(e.target.value)}
        />
        <select
          value={newJudgeRole}
          onChange={(e) => setNewJudgeRole(e.target.value as JudgeRole)}
        >
          {judgeRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <button className="btn add" onClick={handleAddOrUpdateJudge}>
          {isEditing ? 'Сохранить' : 'Добавить'}
        </button>
        {isEditing && <button className="btn cancel-btn" onClick={resetForm}>Отмена</button>}

        {credentials && (
          <div className="credentials-info">
            <p><strong>Логин:</strong> {credentials.login}</p>
            {credentials.password && <p><strong>Пароль:</strong> {credentials.password}</p>}
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="common-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {judges.map(judge => (
              <tr key={judge.id}>
                <td>{judge.name}</td>
                <td>{judge.role}</td>
                <td className="actions-cell">
                  <button className="btn small edit" onClick={() => handleEditJudge(judge)}>✏️</button>
                  <button className="btn small delete" onClick={() => {
                    setJudgeToDelete(judge);
                    setShowDeleteModal(true);
                  }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && judgeToDelete && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Удалить судью {judgeToDelete.name}?</h2>
            <div className="modal-buttons">
              <button className="cancel" onClick={cancelDelete}>Отмена</button>
              <button className="confirm" onClick={confirmDeleteJudge}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgesTable;

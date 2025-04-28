import React, { useState } from 'react';
import axios from 'axios';
import { AgeCategory, AgeCategoriesManagerProps } from '../models/types';
import './common.css';

const AgeCategoriesManager: React.FC<AgeCategoriesManagerProps> = ({ ageCategories, setAgeCategories, competitionId }) => {
  const [name, setName] = useState('');
  const [minYear, setMinYear] = useState<number | ''>('');
  const [maxYear, setMaxYear] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const years = Array.from({ length: 21 }, (_, i) => 2000 + i).reverse();

  const resetForm = () => {
    setName('');
    setMinYear('');
    setMaxYear('');
    setEditingId(null);
    setIsEditing(false);
  };

  const fetchCategories = () => {
    axios.get<AgeCategory[]>(`http://localhost:8080/competitions/${competitionId}/age-categories`)
      .then(res => setAgeCategories(res.data))
      .catch(() => alert('Ошибка при загрузке категорий'));
  };

  const handleAddOrUpdate = () => {
    if (!name || minYear === '' || maxYear === '') {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    if (minYear > maxYear) {
      alert('Минимальный год рождения не может быть больше максимального');
      return;
    }

    const request = editingId 
      ? axios.put(`http://localhost:8080/age-categories/${editingId}`, { name, minBirthYear: minYear, maxBirthYear: maxYear })
      : axios.post(`http://localhost:8080/competitions/${competitionId}/age-categories`, { name, minBirthYear: minYear, maxBirthYear: maxYear });

    request
      .then(() => {
        fetchCategories();
        resetForm();
      })
      .catch(err => alert(err.response?.data?.error || 'Ошибка при сохранении категории'));
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      axios.delete(`http://localhost:8080/age-categories/${categoryId}`)
        .then(() => fetchCategories())
        .catch(() => alert('Ошибка при удалении категории'));
    }
  };

  const handleEditCategory = (category: AgeCategory) => {
    setName(category.name);
    setMinYear(category.min_birth_year);
    setMaxYear(category.max_birth_year);
    setEditingId(category.id);
    setIsEditing(true);
  };

  return (
    <div className="section-container">
      <div className="form-grid">
        <h4>{isEditing ? 'Редактировать категорию' : 'Добавить новую категорию'}</h4>
        <input 
          type="text" 
          placeholder="Название" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={minYear} onChange={(e) => setMinYear(Number(e.target.value))}>
          <option value="">Мин. г.р.</option>
          {years.map(year => (
            <option key={`min-${year}`} value={year}>{year}</option>
          ))}
        </select>
        <select value={maxYear} onChange={(e) => setMaxYear(Number(e.target.value))}>
          <option value="">Макс. г.р.</option>
          {years.map(year => (
            <option key={`max-${year}`} value={year}>{year}</option>
          ))}
        </select>
        <button className="btn add" onClick={handleAddOrUpdate}>
          {isEditing ? 'Сохранить' : 'Добавить'}
        </button>
        {isEditing && (
          <button className="btn cancel-btn" onClick={resetForm}>Отмена</button>
        )}
      </div>
      <div className="category-list">
        {ageCategories.map(category => (
          <div key={category.id} className="category-item">
            <span>{category.name} ({category.min_birth_year} - {category.max_birth_year} г.р.)</span>
            <div>
              <button className="btn small edit" onClick={() => handleEditCategory(category)}>✏️</button>
              <button className="btn small delete" onClick={() => handleDeleteCategory(category.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default AgeCategoriesManager;

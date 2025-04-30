import React, {useState} from 'react';
import axios from 'axios';
import {AgeCategory, AgeCategoriesManagerProps} from '../models/types';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './common.css';

const apparatusTypes = ['б/п', 'скакалка', 'обруч', 'мяч', 'булавы', 'лента'];

const AgeCategoriesManager: React.FC<AgeCategoriesManagerProps> = ({
                                                                       ageCategories,
                                                                       setAgeCategories,
                                                                       competitionId
                                                                   }) => {
    const [name, setName] = useState('');
    const [minYear, setMinYear] = useState<number | ''>('');
    const [maxYear, setMaxYear] = useState<number | ''>('');
    const [selectedApparatuses, setSelectedApparatuses] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<AgeCategory | null>(null);


    const years = Array.from({length: 21}, (_, i) => 2000 + i).reverse();

    const resetForm = () => {
        setName('');
        setMinYear('');
        setMaxYear('');
        setSelectedApparatuses([]);
        setEditingId(null);
        setIsEditing(false);
    };

    const handleError = (err: any, defaultMessage: string) => {
        const serverMessage = err.response?.data?.error || err.message;
        toast.error(serverMessage || defaultMessage);
    };

    const fetchCategories = () => {
        axios.get<AgeCategory[]>(`http://localhost:8080/competitions/${competitionId}/age-categories`)
            .then(res => setAgeCategories(res.data))
            .catch(err => handleError(err, 'Ошибка при загрузке категорий'));
    };

    const toggleApparatus = (apparatus: string) => {
        if (selectedApparatuses.includes(apparatus)) {
            setSelectedApparatuses(selectedApparatuses.filter(a => a !== apparatus));
        } else {
            setSelectedApparatuses([...selectedApparatuses, apparatus]);
        }
    };

    const handleAddOrUpdate = () => {
        if (!name || minYear === '' || maxYear === '') {
            toast.warn('Пожалуйста, заполните все поля');
            return;
        }

        if (minYear > maxYear) {
            toast.warn('Минимальный год рождения не может быть больше максимального');
            return;
        }

        if (selectedApparatuses.length === 0) {
            toast.warn('Выберите хотя бы один предмет');
            return;
        }

        const payload = {
            name,
            minBirthYear: minYear,
            maxBirthYear: maxYear,
            apparatuses: selectedApparatuses
        };

        const request = editingId
            ? axios.put(`http://localhost:8080/age-categories/${editingId}`, payload)
            : axios.post(`http://localhost:8080/competitions/${competitionId}/age-categories`, payload);

        request
            .then(() => {
                toast.success(`Категория успешно ${editingId ? 'обновлена' : 'добавлена'}`);
                fetchCategories();
                resetForm();
            })
            .catch(err => handleError(err, 'Ошибка при сохранении категории'));
    };

    const handleDeleteCategory = (category: AgeCategory) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;
        axios.delete(`http://localhost:8080/age-categories/${categoryToDelete.id}`)
            .then(() => {
                toast.success('Категория успешно удалена');
                fetchCategories();
            })
            .catch(err => handleError(err, 'Ошибка при удалении категории'))
            .finally(() => {
                setShowDeleteModal(false);
                setCategoryToDelete(null);
            });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
    };


    const handleEditCategory = (category: AgeCategory) => {
        setName(category.name);
        setMinYear(category.min_birth_year);
        setMaxYear(category.max_birth_year);
        setSelectedApparatuses(category.apparatuses || []);
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

                <div className="apparatus-checkboxes">
                    {apparatusTypes.map(apparatus => (
                        <label key={apparatus}>
                            <input
                                type="checkbox"
                                checked={selectedApparatuses.includes(apparatus)}
                                onChange={() => toggleApparatus(apparatus)}
                            />
                            {apparatus}
                        </label>
                    ))}
                </div>

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
            <span>
              {category.name} ({category.min_birth_year} - {category.max_birth_year} г.р.)
            </span>
                        <div className="apparatus-list">
                            {category.apparatuses?.join(', ') || 'Нет предметов'}
                        </div>
                        <div>
                            <button className="btn small edit" onClick={() => handleEditCategory(category)}>✏️</button>
                            <button className="btn small delete"
                                    onClick={() => handleDeleteCategory(category)}
                            >🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ToastContainer position="top-right" autoClose={3000}/>
            {showDeleteModal && categoryToDelete && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Удалить категорию "{categoryToDelete.name}"?</h2>
                        <div className="modal-buttons">
                            <button className="cancel" onClick={cancelDelete}>Отмена</button>
                            <button className="confirm" onClick={confirmDelete}>Удалить</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AgeCategoriesManager;

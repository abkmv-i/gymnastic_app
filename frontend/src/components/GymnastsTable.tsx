import React, {useState} from 'react';
import axios from 'axios';
import {Gymnast, GymnastsTableProps} from '../models/types';
import './common.css';

const GymnystsTable: React.FC<GymnastsTableProps> = ({
                                                         gymnasts,
                                                         ageCategories = [],
                                                         competitionId,
                                                         onUpdate,
                                                         onDelete
                                                     }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [newGymnast, setNewGymnast] = useState({name: '', birth_year: '', coach: '', city: '', age_category_id: ''});
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [gymnastToDelete, setGymnastToDelete] = useState<Gymnast | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);  // Для хранения выбранного файла

    const resetForm = () => {
        setNewGymnast({name: '', birth_year: '', coach: '', city: '', age_category_id: ''});
        setEditingId(null);
        setIsEditing(false);
    };

    const handleAddOrUpdateGymnast = () => {
        const {name, birth_year, coach, city, age_category_id} = newGymnast;
        if (!name || !birth_year) {
            alert('Заполните имя и год рождения');
            return;
        }

        const payload = {
            name,
            birth_year: Number(birth_year),
            coach,
            city,
            age_category_id: age_category_id ? Number(age_category_id) : null,
            competition_id: competitionId
        };

        const request = isEditing
            ? axios.put(`http://localhost:8080/gymnasts/${editingId}`, payload)
            : axios.post('http://localhost:8080/gymnasts', payload);

        request
            .then(() => {
                if (onUpdate) onUpdate();
                resetForm();
            })
            .catch(() => alert('Ошибка при сохранении гимнастки'));
    };

    // 📥 Сохраняем файл
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // 🚀 Загрузка файла по кнопке
    const handleFileUpload = () => {
        if (!selectedFile) {
            alert('Пожалуйста, выберите файл');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('competition_id', competitionId.toString());

        axios.post('http://localhost:8080/gymnasts/upload-gymnasts', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        })
            .then(() => {
                alert('Гимнастки успешно загружены');
                if (onUpdate) onUpdate();
                setSelectedFile(null);  // Сброс выбранного файла
            })
            .catch(() => alert('Ошибка при загрузке файла'));
    };

    const handleEditGymnast = (gymnast: Gymnast) => {
        setNewGymnast({
            name: gymnast.name,
            birth_year: gymnast.birth_year.toString(),
            coach: gymnast.coach || '',
            city: gymnast.city || '',
            age_category_id: gymnast.age_category_id?.toString() || ''
        });
        setEditingId(gymnast.id);
        setIsEditing(true);
    };

    const handleAssignCategory = (gymnastId: number, categoryId: number) => {
        axios.put(`http://localhost:8080/gymnasts/${gymnastId}/assign-category`, {
            age_category_id: categoryId
        })
            .then(() => {
                if (onUpdate) onUpdate();
            })
            .catch(() => alert('Ошибка при назначении категории'));
    };
    const confirmDeleteGymnast = () => {
        if (gymnastToDelete && onDelete) {
            onDelete(gymnastToDelete.id);
            setShowDeleteModal(false);
            setGymnastToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setGymnastToDelete(null);
    };


    const tabs = [
        {id: 'all', label: 'Все гимнастки'},
        ...ageCategories.map(category => ({
            id: category.id.toString(),
            label: `${category.name} (${category.min_birth_year}-${category.max_birth_year} г.р.)`
        }))
    ];

    const filteredGymnasts = activeTab === 'all'
        ? gymnasts
        : gymnasts.filter(g => g.age_category_id?.toString() === activeTab);

    return (
        <div className="section-container">
            {/* --- Форма добавления --- */}
            <div className="form-grid">
                <h4>{isEditing ? 'Редактировать гимнастку' : 'Добавить гимнастку'}</h4>
                <input type="text" placeholder="Имя" value={newGymnast.name}
                       onChange={(e) => setNewGymnast({...newGymnast, name: e.target.value})}/>
                <input type="number" placeholder="Год рождения" value={newGymnast.birth_year}
                       onChange={(e) => setNewGymnast({...newGymnast, birth_year: e.target.value})}/>
                <input type="text" placeholder="Тренер" value={newGymnast.coach}
                       onChange={(e) => setNewGymnast({...newGymnast, coach: e.target.value})}/>
                <input type="text" placeholder="Город" value={newGymnast.city}
                       onChange={(e) => setNewGymnast({...newGymnast, city: e.target.value})}/>
                <select value={newGymnast.age_category_id}
                        onChange={(e) => setNewGymnast({...newGymnast, age_category_id: e.target.value})}>
                    <option value="">Категория</option>
                    {ageCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <button className="btn add" onClick={handleAddOrUpdateGymnast}>
                    {isEditing ? 'Сохранить' : 'Добавить'}
                </button>
                {isEditing && <button className="btn cancel-btn" onClick={resetForm}>Отмена</button>}

                {/* --- Загрузка Excel --- */}
                <h4>Загрузить список гимнасток (Excel)</h4>
                <div className="upload-container">
                    <label htmlFor="file-upload" className="btn upload-btn">
                        📥 Загрузить файл
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        style={{display: 'none'}}   // Скрываем input
                    />
                </div>
                <div>
                    <button
                        className="btn add"
                        onClick={handleFileUpload}
                        disabled={!selectedFile}
                    >
                        Добавить гимнасток
                    </button>
                </div>

                <div>
                    {selectedFile && <p className="file-info">Выбран файл: {selectedFile.name}</p>}

                    <div className="upload-hint">
                        <a href="/templates/gymnasts_template.xlsx" download>📄 Скачать шаблон Excel</a>
                    </div>
                </div>

            </div>


            {/* --- Табуляция и таблица --- */}
            <div className="tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="common-table">
                    <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Год рождения</th>
                        <th>Тренер</th>
                        <th>Город</th>
                        <th>Категория</th>
                        <th>Распределить</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredGymnasts.map(gymnast => {
                        const category = ageCategories.find(c => c.id === gymnast.age_category_id);
                        return (
                            <tr key={gymnast.id}>
                                <td>{gymnast.name}</td>
                                <td>{gymnast.birth_year}</td>
                                <td>{gymnast.coach || '-'}</td>
                                <td>{gymnast.city || '-'}</td>
                                <td>{category?.name || '-'}</td>
                                <td>
                                    <select className='category'
                                            value={gymnast.age_category_id || ''}
                                            onChange={(e) => handleAssignCategory(gymnast.id, Number(e.target.value))}
                                    >
                                        <option value="">Выбрать категорию</option>
                                        {ageCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="actions-cell">
                                    <button className="btn small edit" onClick={() => handleEditGymnast(gymnast)}>✏️
                                    </button>
                                    <button className="btn small delete"
                                            onClick={() => {
                                                setGymnastToDelete(gymnast);
                                                setShowDeleteModal(true);
                                            }}
                                    >🗑️
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            {showDeleteModal && gymnastToDelete && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Удалить гимнастку {gymnastToDelete.name}?</h2>
                        <div className="modal-buttons">
                            <button className="cancel" onClick={cancelDelete}>Отмена</button>
                            <button className="confirm" onClick={confirmDeleteGymnast}>Удалить</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default GymnystsTable;

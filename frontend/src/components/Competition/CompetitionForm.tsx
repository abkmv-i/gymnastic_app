import React, {useState} from 'react';
import {Competition} from '../../models/types';
import '../../styles/common.css';

interface CompetitionFormProps {
    initialData?: Omit<Competition, 'id' | 'created_at'>;
    onSubmit: (data: Omit<Competition, 'id' | 'created_at'>) => void;
}

const CompetitionForm: React.FC<CompetitionFormProps> = ({
                                                             initialData = {
                                                                 name: '',
                                                                 date: new Date().toISOString().split('T')[0],
                                                                 location: '',
                                                                 status: 'planned'
                                                             },
                                                             onSubmit
                                                         }) => {
    const [name, setName] = useState(initialData.name);
    const [location, setLocation] = useState(initialData.location);
    const [status, setStatus] = useState(initialData.status);

    const getLocalDateString = (dateInput?: string): string => {
        const date = dateInput ? new Date(dateInput) : new Date();
        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const [date, setDate] = useState(getLocalDateString(initialData.date));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({name, date, location, status});
    };

    return (
        <div className="section-container">
            <form onSubmit={handleSubmit} className="form-vertical">
                <h4>Данные соревнования</h4>

                <div className="form-field">
                    <label>Название соревнования:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Дата проведения:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Место проведения:</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Статус соревнования:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'planned' | 'in_progress' | 'completed')}
                    >
                        <option value="planned">Запланировано</option>
                        <option value="in_progress">В процессе</option>
                        <option value="completed">Завершено</option>
                    </select>
                </div>

                <button type="submit" className="btn add">Сохранить</button>
            </form>
        </div>
    );
};

export default CompetitionForm;

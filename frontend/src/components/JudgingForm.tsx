import React, {useState} from 'react';
import {Performance, Score} from '../models/types';
import './JudgingForm.css';

interface JudgingFormProps {
    performance: Performance;
    judgeId: number;
    existingScores?: Score[];
    onSubmit: (data: Omit<Score, 'id' | 'created_at'>) => void;
    onCancel?: () => void;
}

const JudgingForm: React.FC<JudgingFormProps> = ({
                                                     performance,
                                                     judgeId,
                                                     existingScores = [],
                                                     onSubmit,
                                                     onCancel
                                                 }) => {
    const [formData, setFormData] = useState<Omit<Score, 'id' | 'created_at'>>({
        performance_id: performance.id,
        judge_id: judgeId,
        brigade: 'A',
        score: 0
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'score' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.score < 0 || formData.score > 10) {
            setError('Score must be between 0 and 10');
            return;
        }

        // Check if score for this brigade already exists
        const existingScore = existingScores.find(
            s => s.brigade === formData.brigade && s.judge_id === judgeId
        );

        if (existingScore) {
            setError(`You've already submitted a score for ${formData.brigade} brigade`);
            return;
        }

        setError('');
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="judging-form">
            <h3>Judging Performance #{performance.id}</h3>
            <p>Apparatus: {performance.apparatus}</p>

            <div className="form-group">
                <label htmlFor="brigade">Brigade:</label>
                <select
                    id="brigade"
                    name="brigade"
                    value={formData.brigade}
                    onChange={handleChange}
                    required
                >
                    <option value="A">Artistry (A)</option>
                    <option value="E">Execution (E)</option>
                    <option value="DA">Difficulty A (DA)</option>
                    <option value="DB">Difficulty B (DB)</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="score">Score (0-10):</label>
                <input
                    id="score"
                    type="number"
                    name="score"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.score}
                    onChange={handleChange}
                    required
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
                <button type="submit" className="btn-primary">
                    Submit Score
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-secondary">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default JudgingForm;
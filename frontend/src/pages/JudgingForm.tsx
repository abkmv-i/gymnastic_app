import React, {useState} from 'react';
import {Performance} from '../models/types';
import './JudgingForm.css';

interface JudgingFormProps {
    performance: Performance;
    judgeId: number;
    onSubmit: (data: {
        performance_id: number;
        judge_id: number;
        brigade: 'A' | 'E' | 'DA' | 'DB';
        score: number;
    }) => void;
}

const JudgingForm: React.FC<JudgingFormProps> = ({performance, judgeId, onSubmit}) => {
    const [brigade, setBrigade] = useState<'A' | 'E' | 'DA' | 'DB'>('A');
    const [score, setScore] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const scoreValue = parseFloat(score);
        if (isNaN(scoreValue)) {
            setError('Please enter a valid score');
            return;
        }

        onSubmit({
            performance_id: performance.id,
            judge_id: judgeId,
            brigade,
            score: scoreValue
        });
    };

    return (
        <form onSubmit={handleSubmit} className="judging-form">
            <h3>Apparatus: {performance.apparatus}</h3>

            <div className="form-group">
                <label>Brigade:</label>
                <select
                    value={brigade}
                    onChange={(e) => setBrigade(e.target.value as 'A' | 'E' | 'DA' | 'DB')}
                >
                    <option value="A">Artistry (A)</option>
                    <option value="E">Execution (E)</option>
                    <option value="DA">Difficulty A (DA)</option>
                    <option value="DB">Difficulty B (DB)</option>
                </select>
            </div>

            <div className="form-group">
                <label>Score (0-10):</label>
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit">Submit Score</button>
        </form>
    );
};

export default JudgingForm;
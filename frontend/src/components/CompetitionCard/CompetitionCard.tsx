import React from 'react';
import {Competition} from '../../models/types';
import './CompetitionCard.css';

interface CompetitionCardProps {
    competition: Competition;
    onClick: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({competition, onClick}) => {
    return (
        <div className="competition-card" onClick={onClick}>
            <h3>{competition.name}</h3>
            <p>Date: {new Date(competition.date).toLocaleDateString()}</p>
            <p>Location: {competition.location}</p>
            <p>Status: {competition.status}</p>
        </div>
    );
};

export default CompetitionCard;
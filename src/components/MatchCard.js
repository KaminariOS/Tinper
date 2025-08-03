import React from 'react';
import { X } from 'lucide-react';

function MatchCard({ match, onChat, onUnmatch, onViewProfile }) {
  return (
    <div className="match-card clickable">
      <div className="match-card-content" onClick={() => onChat(match)}>
        <img src={match.profileData.mainPhoto} alt={match.name} />
        <div className="match-info">
          <h3>{match.profileData.name}</h3>
          <p>{match.profileData.age} years old</p>
          <small>Matched on {new Date(match.timestamp).toLocaleDateString()}</small>
        </div>
      </div>
      <button 
        className="unmatch-btn" 
        onClick={(e) => {
          e.stopPropagation();
          onUnmatch(match.name);
        }}
      >
        <X size={16} />
        Unmatch
      </button>
    </div>
  );
}

export default MatchCard;

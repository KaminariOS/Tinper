import React from 'react';

function BioSection({ profile }) {
  return (
    <div className="bio-section">
      {/* Single unified grid with vertical separator */}
      <div className="bio-unified-grid">
        <div className="bio-grid-item">
          <span className="bio-label">Nationality:</span>
          <span className="bio-value">{profile.nationality}</span>
        </div>
        <div className="bio-grid-item">
          <span className="bio-label">Height:</span>
          <span className="bio-value">{profile.height}</span>
        </div>
        <div className="bio-grid-item">
          <span className="bio-label">Hair:</span>
          <span className="bio-value">{profile.hairColor}</span>
        </div>
        <div className="bio-grid-item">
          <span className="bio-label">Eyes:</span>
          <span className="bio-value">{profile.eyeColor}</span>
        </div>
        <div className="bio-grid-item">
          <span className="bio-label">Ethnicity:</span>
          <span className="bio-value">{profile.ethnicity}</span>
        </div>
        {profile.birthplace && (
          <div className="bio-grid-item">
            <span className="bio-label">Birthplace:</span>
            <span className="bio-value">{profile.birthplace}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BioSection;

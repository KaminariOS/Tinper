import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Instagram } from 'lucide-react';

function ProfileCard({ profile, onSwipe, isNext = false }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const cardRef = useRef(null);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    } else {
      // If not swiped far enough, animate back to center
      x.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="profile-card"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={isNext ? { scale: 0.95, opacity: 0.8 } : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="card-header">
        <div className="profile-info">
          <h2>{profile.name}, {profile.age}</h2>
          <p>{profile.location}</p>
        </div>
      </div>

      <div className="card-content">
        <div className="photos-gallery">
          {/* First photo with bio below */}
          <div className="first-photo-section">
            <div className="photo-item">
              <img src={profile.photos[0]} alt={`${profile.name} photo 1`} />
            </div>
            {/* Instagram link */}
            {profile.instagram && (
              <div className="instagram-link">
                <a 
                  href={profile.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="instagram-btn"
                >
                  <Instagram size={20} />
                  <span>Follow on Instagram</span>
                </a>
              </div>
            )}
            <div className="bio-section">
              <div className="bio-grid">
                <div className="bio-item">
                  <span className="bio-label">Nationality:</span>
                  <span className="bio-value">{profile.nationality}</span>
                </div>
                <div className="bio-item">
                  <span className="bio-label">Height:</span>
                  <span className="bio-value">{profile.height}</span>
                </div>
                <div className="bio-item">
                  <span className="bio-label">Hair:</span>
                  <span className="bio-value">{profile.hairColor}</span>
                </div>
                <div className="bio-item">
                  <span className="bio-label">Eyes:</span>
                  <span className="bio-value">{profile.eyeColor}</span>
                </div>
                <div className="bio-item">
                  <span className="bio-label">Ethnicity:</span>
                  <span className="bio-value">{profile.ethnicity}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interleaved photos and prompts */}
          {profile.photos.slice(1).map((photo, index) => (
            <React.Fragment key={`photo-${index + 1}`}>
              {/* Show prompt before each photo (except first) */}
              {index < profile.prompts.length && (
                <div className="prompt">
                  <p>{profile.prompts[index]}</p>
                </div>
              )}
              <div className="photo-item">
                <img src={photo} alt={`${profile.name} photo ${index + 2}`} />
              </div>
            </React.Fragment>
          ))}
          
          {/* Show remaining prompts if there are more prompts than photos */}
          {profile.prompts.slice(profile.photos.length - 1).map((prompt, index) => (
            <div key={`prompt-${profile.photos.length - 1 + index}`} className="prompt">
              <p>{prompt}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-actions">
        <button className="action-btn reject" onClick={() => onSwipe('left')}>
          <X size={32} />
        </button>
        <button className="action-btn like" onClick={() => onSwipe('right')}>
          <Heart size={32} />
        </button>
      </div>
    </motion.div>
  );
}

export default ProfileCard;

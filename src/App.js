import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import './App.css';

// Sample profile data
const sampleProfiles = [
  {
    id: 1,
    name: "Sarah",
    age: 25,
    location: "2 miles away",
    nationality: "American",
    height: "5'6\"",
    hairColor: "Brown",
    eyeColor: "Green",
    ethnicity: "Caucasian",
    mainPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop"
    ],
    prompts: [
      "My ideal Sunday morning: Coffee, a good book, and a long walk in the park",
      "I'm looking for someone who: Makes me laugh and isn't afraid to be silly",
      "My most controversial opinion: Pineapple belongs on pizza"
    ]
  },
  {
    id: 2,
    name: "Alex",
    age: 28,
    location: "5 miles away",
    nationality: "Canadian",
    height: "6'0\"",
    hairColor: "Black",
    eyeColor: "Brown",
    ethnicity: "Asian",
    mainPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop"
    ],
    prompts: [
      "My simple pleasures: Cooking new recipes and trying different cuisines",
      "I'm looking for someone who: Values deep conversations and intellectual growth",
      "My most irrational fear: That I'll forget how to ride a bike"
    ]
  },
  {
    id: 3,
    name: "Emma",
    age: 26,
    location: "3 miles away",
    nationality: "British",
    height: "5'4\"",
    hairColor: "Blonde",
    eyeColor: "Blue",
    ethnicity: "Caucasian",
    mainPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop"
    ],
    prompts: [
      "My ideal travel companion: Someone who's spontaneous and loves adventure",
      "I'm looking for someone who: Is passionate about their interests and life goals",
      "My most controversial opinion: Breakfast food is acceptable at any time of day"
    ]
  }
];

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
          
          {/* Remaining photos */}
          {profile.photos.slice(1).map((photo, index) => (
            <div key={index + 1} className="photo-item">
              <img src={photo} alt={`${profile.name} photo ${index + 2}`} />
            </div>
          ))}
        </div>
        
        <div className="prompts-section">
          {profile.prompts.map((prompt, index) => (
            <div key={index} className="prompt">
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

function App() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleSwipe = (direction) => {
    setCurrentProfileIndex((prev) => (prev + 1) % sampleProfiles.length);
    setIsDragging(false);
  };

  const currentProfile = sampleProfiles[currentProfileIndex];
  const nextProfile = sampleProfiles[(currentProfileIndex + 1) % sampleProfiles.length];

  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <h1>Hinge Clone</h1>
          <p>Drag the card left or right to like or pass</p>
        </header>

        <div className="cards-container">
          <div className="cards-stack">
            {/* Next card (background) */}
            <motion.div
              key={`next-${nextProfile.id}`}
              className="card-wrapper next-card"
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 0.95, opacity: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileCard 
                profile={nextProfile} 
                onSwipe={handleSwipe}
                isNext={true}
              />
            </motion.div>

            {/* Current card (foreground) */}
            <motion.div
              key={`current-${currentProfile.id}`}
              className="card-wrapper current-card"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileCard 
                profile={currentProfile} 
                onSwipe={handleSwipe}
              />
            </motion.div>
          </div>
        </div>

        <div className="swipe-instructions">
          <div className="instruction">
            <X size={20} />
            <span>Drag left to pass</span>
          </div>
          <div className="instruction">
            <Heart size={20} />
            <span>Drag right to like</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

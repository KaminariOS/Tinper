import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Instagram, Zap, Users, Settings, Send, ArrowLeft } from 'lucide-react';
import './App.css';
import profilesData from './babe_images.json';
import hingePrompts from './hinge_prompts.json';
import initiationMessages from './initiation_messages.json';
import ProfileCard from './components/ProfileCard';
import ChatWindow from './components/ChatWindow';
import MatchCard from './components/MatchCard';

// IndexedDB utilities
const DB_NAME = 'SwipeAppDB';
const DB_VERSION = 3;
const STORE_NAME = 'swipes';
const CHAT_STORE_NAME = 'chatMessages';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'name' });
        store.createIndex('direction', 'direction', { unique: false });
        store.createIndex('profileId', 'profileId', { unique: false });
      }
      
      // Create chat messages store if it doesn't exist
      if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
        const chatStore = db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('matchName', 'matchName', { unique: false });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

const addSwipeToDB = async (direction, profileData) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const swipeRecord = {
      name: profileData.name, // Primary key
      direction: direction, // 'left' or 'right'
      profileId: profileData.id,
      profileData: profileData,
      timestamp: new Date().toISOString()
    };
    
    // Use put instead of add to allow overwrites if user swipes same person again
    await store.put(swipeRecord);
    console.log(`Added ${direction} swipe for ${profileData.name} to IndexedDB`);
  } catch (error) {
    console.error('Error adding swipe to IndexedDB:', error);
  }
};

const getSwipesByDirection = async (direction) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('direction');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(direction);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Error getting ${direction} swipes from IndexedDB:`, error);
    return [];
  }
};

const removeSwipeFromDB = async (profileName) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await store.delete(profileName);
    console.log(`Removed swipe for ${profileName} from IndexedDB`);
  } catch (error) {
    console.error('Error removing swipe from IndexedDB:', error);
  }
};

// Chat message IndexedDB functions
const saveChatMessageToDB = async (matchName, messageData) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(CHAT_STORE_NAME);
    
    const messageRecord = {
      matchName: matchName,
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    await store.add(messageRecord);
    console.log(`Added chat message for ${matchName} to IndexedDB`);
  } catch (error) {
    console.error('Error adding chat message to IndexedDB:', error);
  }
};

const getChatMessagesFromDB = async (matchName) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
    const store = transaction.objectStore(CHAT_STORE_NAME);
    const index = store.index('matchName');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(matchName);
      request.onsuccess = () => {
        // Sort messages by timestamp
        const messages = request.result.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Error getting chat messages from IndexedDB:`, error);
    return [];
  }
};

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Transform JSON data to match the expected profile structure
function getRandomPrompts(promptsArray, n) {
  const used = new Set();
  const result = [];
  while (result.length < n && used.size < promptsArray.length) {
    const idx = Math.floor(Math.random() * promptsArray.length);
    if (!used.has(idx)) {
      used.add(idx);
      const promptObj = promptsArray[idx];
      result.push(`${promptObj.prompt}: ${promptObj.answer}`);
    }
  }
  return result;
}

const sampleProfiles = shuffleArray(profilesData).map((profile, index) => ({
  id: index + 1,
  name: profile.name,
  age: parseInt(profile.original_data?.Personal?.Age) || 25,
  location: `${Math.floor(Math.random() * 10) + 1} miles away`,
  nationality: profile.original_data?.Personal?.Nationality?.replace(/[()]/g, '') || 'Unknown',
  height: profile.original_data?.Body?.Height || 'Unknown',
  hairColor: profile.original_data?.Body?.['Hair color'] || 'Unknown',
  eyeColor: profile.original_data?.Body?.['Eye color'] || 'Unknown',
  ethnicity: profile.original_data?.Personal?.Ethnicity || 'Unknown',
  birthplace: profile.original_data?.Personal?.Birthplace || 'Unknown',
  mainPhoto: profile.images?.[0] || 'https://via.placeholder.com/400x600',
  photos: profile.images || ['https://via.placeholder.com/400x600'],
  instagram: profile.original_data?.Instagram || null,
  professions: profile.original_data?.Personal?.Professions || 'Unknown',
  ps: (profile.original_data?.Personal?.Professions || 'Unknown').toLowerCase().match(/adult|porn/),
  sexuality: profile.original_data?.Personal?.Sexuality || 'Unknown',
  prompts: getRandomPrompts(hingePrompts, 3)
}));



// Matches component
function MatchesTab({ onUnmatch }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [chatMatch, setChatMatch] = useState(null);

  const loadMatches = async () => {
    const rightSwipes = await getSwipesByDirection('right');
    setMatches(rightSwipes);
    setLoading(false);
  };

  React.useEffect(() => {
    loadMatches();
  }, []);

  const handleUnmatch = async (profileName) => {
    await removeSwipeFromDB(profileName);
    // Refresh the matches list
    loadMatches();
    // Notify parent component to update swiped names
    if (onUnmatch) {
      onUnmatch(profileName);
    }
  };

  if (loading) {
    return (
      <div className="matches-tab">
        <h2>Loading matches...</h2>
      </div>
    );
  }

  return (
    <>
      <div className="matches-tab">
        <h2>Your Matches ({matches.length})</h2>
        {matches.length === 0 ? (
          <div className="no-matches">
            <Heart size={48} color="#ccc" />
            <p>No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <MatchCard
                key={match.name}
                match={match}
                onChat={setChatMatch}
                onUnmatch={handleUnmatch}
                onViewProfile={() => {
                  setSelectedMatch(match);
                  setShowProfileCard(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Chat Window */}
      {chatMatch && !showProfileCard && (
        <ChatWindow
          match={chatMatch}
          onClose={() => setChatMatch(null)}
          onViewProfile={() => {
            setSelectedMatch(chatMatch);
            setShowProfileCard(true);
          }}
          saveChatMessageToDB={saveChatMessageToDB}
          getChatMessagesFromDB={getChatMessagesFromDB}
        />
      )}
      
      {/* Profile Card View */}
      {selectedMatch && showProfileCard && (
        <div className="profile-card-overlay">
          <div className="profile-card-container">
            <button 
              className="profile-card-close" 
              onClick={() => {
                setSelectedMatch(null);
                setShowProfileCard(false);
              }}
            >
              <X size={24} />
            </button>
            <ProfileCard 
              profile={selectedMatch.profileData} 
              onSwipe={() => {}} // Disable swiping in this view
              isNext={false}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Settings component
function SettingsTab({ filters, setFilters }) {
  const [leftSwipes, setLeftSwipes] = useState([]);
  const [rightSwipes, setRightSwipes] = useState([]);

  React.useEffect(() => {
    const loadSwipeData = async () => {
      const left = await getSwipesByDirection('left');
      const right = await getSwipesByDirection('right');
      setLeftSwipes(left);
      setRightSwipes(right);
    };
    loadSwipeData();
  }, []);

  // Get unique values for filter options
  const getUniqueNationalities = () => {
    const nationalities = sampleProfiles.map(profile => profile.nationality).filter(Boolean);
    return [...new Set(nationalities)].sort();
  };

  const getUniqueEthnicities = () => {
    const ethnicities = sampleProfiles.map(profile => profile.ethnicity).filter(Boolean);
    return [...new Set(ethnicities)].sort();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      nationality: '',
      ethnicity: '',
      minAge: 18,
      maxAge: 50
    });
  };

  return (
    <div className="settings-tab">
      <h2>Settings & Stats</h2>
      
      {/* Filter Section */}
      <div className="filter-section">
        <h3>Profile Filters</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="nationality-filter">Nationality</label>
            <select 
              id="nationality-filter"
              value={filters.nationality}
              onChange={(e) => handleFilterChange('nationality', e.target.value)}
              className="filter-select"
            >
              <option value="">All Nationalities</option>
              {getUniqueNationalities().map(nationality => (
                <option key={nationality} value={nationality}>{nationality}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="ethnicity-filter">Ethnicity</label>
            <select 
              id="ethnicity-filter"
              value={filters.ethnicity}
              onChange={(e) => handleFilterChange('ethnicity', e.target.value)}
              className="filter-select"
            >
              <option value="">All Ethnicities</option>
              {getUniqueEthnicities().map(ethnicity => (
                <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Age Range</label>
            <div className="age-range-controls">
              <div className="age-input-group">
                <label htmlFor="min-age">Min</label>
                <input 
                  id="min-age"
                  type="number" 
                  min="18" 
                  max="99" 
                  value={filters.minAge}
                  onChange={(e) => handleFilterChange('minAge', parseInt(e.target.value))}
                  className="age-input"
                />
              </div>
              <span className="age-separator">-</span>
              <div className="age-input-group">
                <label htmlFor="max-age">Max</label>
                <input 
                  id="max-age"
                  type="number" 
                  min="18" 
                  max="99" 
                  value={filters.maxAge}
                  onChange={(e) => handleFilterChange('maxAge', parseInt(e.target.value))}
                  className="age-input"
                />
              </div>
            </div>
          </div>
          
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear All Filters
          </button>
        </div>
      </div>
      
      <div className="stats-section">
        <h3>Swipe Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <X size={24} color="#ff4458" />
            <span>Passed: {leftSwipes.length}</span>
          </div>
          <div className="stat-item">
            <Heart size={24} color="#42cca0" />
            <span>Liked: {rightSwipes.length}</span>
          </div>
        </div>
      </div>
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {[...leftSwipes, ...rightSwipes]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10)
            .map((swipe) => (
              <div key={swipe.name} className="activity-item">
                <img src={swipe.profileData.mainPhoto} alt={swipe.name} />
                <div className="activity-info">
                  <span>{swipe.profileData.name}</span>
                  <small>{swipe.direction === 'right' ? 'Liked' : 'Passed'}</small>
                </div>
                <small>{new Date(swipe.timestamp).toLocaleTimeString()}</small>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('swipe');
  const [filters, setFilters] = useState({
    nationality: '',
    ethnicity: '',
    minAge: 18,
    maxAge: 50
  });
  const [swipedNames, setSwipedNames] = useState(new Set());

  // Load swiped names from IndexedDB on component mount
  React.useEffect(() => {
    const loadSwipedNames = async () => {
      try {
        const leftSwipes = await getSwipesByDirection('left');
        const rightSwipes = await getSwipesByDirection('right');
        const allSwipes = [...leftSwipes, ...rightSwipes];
        const swipedNamesSet = new Set(allSwipes.map(swipe => swipe.name));
        setSwipedNames(swipedNamesSet);
      } catch (error) {
        console.error('Error loading swiped names:', error);
      }
    };
    
    loadSwipedNames();
  }, []);

  // Filter profiles based on current filters and swiped names
  const filteredProfiles = sampleProfiles.filter(profile => {
    // Skip profiles that have already been swiped
    if (swipedNames.has(profile.name)) {
      return false;
    }
    
    // Nationality filter
    if (filters.nationality && profile.nationality !== filters.nationality) {
      return false;
    }
    
    // Ethnicity filter
    if (filters.ethnicity && profile.ethnicity !== filters.ethnicity) {
      return false;
    }
    
    // Age range filter
    if (profile.age < filters.minAge || profile.age > filters.maxAge) {
      return false;
    }
    
    return true;
  });

  // Use filtered profiles or fallback to all profiles if no matches
  const profilesToShow = filteredProfiles.length > 0 ? filteredProfiles : sampleProfiles.filter(profile => !swipedNames.has(profile.name));

  const handleSwipe = async (direction) => {
    const currentProfile = profilesToShow[currentProfileIndex];
    
    // Store swipe data in IndexedDB
    await addSwipeToDB(direction, currentProfile);
    
    // Update swiped names set
    setSwipedNames(prev => new Set(prev).add(currentProfile.name));
    
    // Move to next profile
    setCurrentProfileIndex((prev) => (prev + 1) % profilesToShow.length);
    setIsDragging(false);
  };

  const currentProfile = profilesToShow[currentProfileIndex];
  const nextProfile = profilesToShow[(currentProfileIndex + 1) % profilesToShow.length];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'swipe':
        return (
          <div className="swipe-tab">

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
          </div>
        );
      case 'matches':
        return <MatchesTab onUnmatch={(profileName) => {
          setSwipedNames(prev => {
            const newSet = new Set(prev);
            newSet.delete(profileName);
            return newSet;
          });
        }} />;
      case 'settings':
        return <SettingsTab filters={filters} setFilters={setFilters} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <div className="app-container">
        <div className="logo-container">
          <img src={`${process.env.PUBLIC_URL}/favicon-96x96-removebg-preview.png`} alt="Logo" />
        </div>
        {renderTabContent()}
        
        
        
        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'swipe' ? 'active' : ''}`}
            onClick={() => setActiveTab('swipe')}
          >
            <Zap size={24} />
            <span>Swipe</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Users size={24} />
            <span>Matches</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={24} />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;

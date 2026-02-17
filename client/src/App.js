import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [disability, setDisability] = useState(null);
  const [phrases, setPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBlind, setIsBlind] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isIntro, setIsIntro] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const disabilities = [
    { id: 'visual', label: 'Visual Impairment (Blind)', icon: '👁️' },
    { id: 'hearing', label: 'Hearing Impairment', icon: '👂' },
    { id: 'speech', label: 'Speech Impairment', icon: '🗣️' },
    { id: 'multiple', label: 'Multi Disabilities', icon: '♿' }
  ];

  const selectDisability = (id) => {
    setDisability(id);
    setIsBlind(id === 'visual');
    setError(null);
  };

  const resetSelection = () => {
    setDisability(null);
    setIsBlind(false);
    setPhrases([]);
    setCurrentIndex(0);
    setError(null);
    setIsCooldown(false);
    setHasStarted(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setDisability(null);
    setIsBlind(false);
    setPhrases([]);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setDisability(user.disability_type);
    setIsBlind(user.disability_type === 'visual');
    setIsIntro(false); // Hide intro after login
  };

  useEffect(() => {
    if (isBlind) {
      fetchPhrases();
    } else if (disability) {
      fetchPhrases();
    }
  }, [disability, isBlind]);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setIsIntro(false); // Skip intro for returning users
      // Auto-redirect to user's disability section
      setDisability(user.disability_type);
      setIsBlind(user.disability_type === 'visual');
    }
  }, []);

  // Intro animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntro(false);
    }, 6000); // 6 seconds intro for more impressive effect

    return () => clearTimeout(timer);
  }, []);

  const fetchPhrases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/phrases`);
      if (!res.ok) throw new Error('Failed to fetch phrases');
      const data = await res.json();
      console.log('Fetched phrases from server:', data);
      setPhrases(data);
      if (data.length > 0 && isBlind) {
        // Don't speak automatically, wait for user interaction
      } else if (data.length === 0 && isBlind) {
        // Don't speak
      }
    } catch (err) {
      console.error('Error fetching phrases:', err);
      // Fallback to default phrases for demo
      const defaultPhrases = [
        { id: 1, text: 'I need food' },
        { id: 2, text: 'I need water' },
        { id: 3, text: 'I need help' },
        { id: 4, text: 'Yes' },
        { id: 5, text: 'No' }
      ];
      console.log('Using fallback phrases:', defaultPhrases);
      setPhrases(defaultPhrases);
      setError('Using demo phrases. Please check server connection for full functionality.');
      if (isBlind) {
        // Don't speak automatically
      }
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    console.log('Speaking:', text);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis not supported');
    }
  };

  const speakOption = (index) => {
    if (phrases[index]) {
      speak(`Current option: ${phrases[index].text}. Single click for next, double click for select, triple click for back.`);
    }
  };

  // Click handling for blind mode
  let clickCount = 0;
  let clickTimer;

  // Keyboard shortcuts for caregivers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isBlind) {
        // Ctrl+B = Go back to disability selection
        if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
          e.preventDefault();
          speak('Going back to disability selection');
          resetSelection();
        }
        // Ctrl+L = Logout
        if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
          e.preventDefault();
          speak('Logging out');
          handleLogout();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlind]);

  const handleClick = () => {
    if (isCooldown) {
      speak('Please wait 1 minute before selecting another option.');
      return;
    }
    if (!hasStarted) {
      setHasStarted(true);
      speak('Welcome to KOTO. Click once to hear the current option. Double click to select the current option. Triple click to go to previous option.');
      speakOption(currentIndex);
      return;
    }
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      if (clickCount === 1) {
        nextOption();
      } else if (clickCount === 2) {
        selectOption();
      } else if (clickCount === 3) {
        prevOption();
      }
      clickCount = 0;
    }, 300);
  };

  const nextOption = () => {
    const next = (currentIndex + 1) % phrases.length;
    setCurrentIndex(next);
    speakOption(next);
  };

  const prevOption = () => {
    const prev = currentIndex === 0 ? phrases.length - 1 : currentIndex - 1;
    setCurrentIndex(prev);
    speakOption(prev);
  };

  const selectOption = (phrase = null) => {
    const selected = phrase || phrases[currentIndex];
    if (selected) {
      speak(selected.text);
      setIsCooldown(true);
      speak('Message communicated. Please wait 1 minute before selecting another option.');
      // Repeat the selected option every 5 seconds during cooldown
      const intervalId = setInterval(() => {
        speak(selected.text);
      }, 5000);
      updateUsage(selected.id);
      // Stop repetition and cooldown after 60 seconds
      setTimeout(() => {
        clearInterval(intervalId);
        setIsCooldown(false);
        speak('You can now select another option.');
      }, 60000);
    }
  };

  const updateUsage = async (id) => {
    try {
      await fetch(`${API_BASE}/api/phrases/${id}`, { method: 'PUT' });
      fetchPhrases(); // Reorder
    } catch (err) {
      console.error('Error updating usage:', err);
    }
  };

  // Show intro screen first
  if (isIntro) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <div className="logo-container">
            <img src="/logo.png" alt="KOTO Logo" className="logo-image" />
            <h1 className="app-title">KOTO</h1>
            <p className="app-subtitle">Digital Assistive Communication System</p>
          </div>
          <div className="loading-animation">
            <div className="pulse-ring"></div>
            <div className="pulse-ring pulse-ring-delay"></div>
            <div className="pulse-ring pulse-ring-delay-2"></div>
          </div>
          <div className="intro-features">
            <div className="feature-item">🎯 Multi-Disability Support</div>
            <div className="feature-item">🗣️ Voice-Guided Navigation</div>
            <div className="feature-item">📱 Responsive Design</div>
            <div className="feature-item">⚡ Real-time Communication</div>
          </div>
          <p className="intro-text">Empowering voices through innovative technology...</p>
        </div>
      </div>
    );
  }

  // Show login if not logged in (after intro)
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (!disability) {
    return (
      <div className="disability-selection">
        <div className="user-header">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="user-name">{currentUser?.username}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <h1>KOTO - Assistive Communication</h1>
        <div className="disability-grid">
          {disabilities.map(d => (
            <button key={d.id} onClick={() => selectDisability(d.id)} className="large-button">
              <span className="icon">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isBlind) {
    return (
      <div className="blind-mode" onClick={handleClick}>
        <h2>Blind Mode Active</h2>
        <p>Click once for next option, double click to select, triple click for previous option.</p>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '20px' }}>
          Caregiver: Press Ctrl+B to go back • Press Ctrl+L to logout
        </p>
        {isCooldown && <p style={{ color: '#ff6b6b' }}>Cooldown active: Please wait 1 minute after selection.</p>}
        {loading && <div className="loading"></div>}
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
        {phrases.length > 0 && (
          <p>Current option: {phrases[currentIndex]?.text}</p>
        )}
      </div>
    );
  }

  // Multi Disabilities Mode - Combines visual buttons with audio guidance
  if (disability === 'multiple') {
    return (
      <div className="multi-disabilities-mode">
        <button className="back-button" onClick={resetSelection}>Back</button>
        <h2>Multi Disabilities Mode</h2>
        <p>Click buttons to communicate or use audio-guided navigation.</p>
        {isCooldown && <p style={{ color: '#ff6b6b' }}>Cooldown active: Please wait 1 minute after selection.</p>}
        {loading && <div className="loading"></div>}
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

        {/* Audio-guided navigation section (from blind mode) */}
        <div className="audio-navigation" onClick={handleClick}>
          <h3>Audio Navigation</h3>
          <p>Click here: Single click for next, double click to select, triple click to go back.</p>
          {phrases.length > 0 && (
            <p>Current option: {phrases[currentIndex]?.text}</p>
          )}
        </div>

        {/* Visual buttons section (from normal mode) */}
        <div className="visual-buttons">
          <h3>Visual Communication</h3>
          <div className="phrase-grid">
            {phrases.map(p => (
              <button key={p.id} onClick={() => selectOption(p)} className="phrase-button">
                {p.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <div className="communication">
      <button className="back-button" onClick={resetSelection}>Back</button>
      <h1>Communication</h1>
      {loading && <div className="loading"></div>}
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
      <div className="phrase-grid">
        {phrases.map(p => (
          <button key={p.id} onClick={() => speak(p.text)} className="phrase-button">
            {p.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
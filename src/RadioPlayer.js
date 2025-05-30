import React, { useState, useRef, useEffect } from 'react';

const stations = {
  'RMF FM': 'https://rs6-krk2.rmfstream.pl/RMFFM48',
  'Antyradio': 'https://ant-waw-01.cdn.eurozet.pl/ant-waw.mp3',
  'Radio Maryja': 'https://radiomaryja.fastcast4u.com/proxy/radiomaryja?mp=/1',
  'RMF Classic': 'https://rs9-krk2.rmfstream.pl/RMFCLASSIC48',
};

const RadioPlayer = ({ location }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState(Object.keys(stations)[0]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Zapamiętaj ustawienia użytkownika
  useEffect(() => {
    const savedStation = localStorage.getItem('selected-station');
    const savedVolume = localStorage.getItem('player-volume');
    
    if (savedStation && stations[savedStation]) {
      setCurrentStation(savedStation);
    }
    
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      if (vol >= 0 && vol <= 1) {
        setVolume(vol);
      }
    }
  }, []);

  // Event handlers
  const handleCanPlay = () => {
    console.log('Audio can play');
    setLoading(false);
  };
  
  const handleAudioError = (e) => {
    console.error('Audio error:', e, audioRef.current?.error);
    setLoading(false);
    setIsPlaying(false);
    setError(`Błąd odtwarzania stacji: ${currentStation}`);
  };

  const handlePlaying = () => {
    console.log('Audio is playing');
    setLoading(false);
    setIsPlaying(true);
  };

  const handleWaiting = () => {
    console.log('Audio is buffering');
    setLoading(true);
  };

  const handlePause = () => {
    console.log('Audio paused');
    setIsPlaying(false);
    setLoading(false);
  };

  useEffect(() => {
    // Timer dla daty/czasu
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    // Zatrzymaj poprzedni strumień
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('canplay', handleCanPlay);
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current.removeEventListener('playing', handlePlaying);
      audioRef.current.removeEventListener('waiting', handleWaiting);
      audioRef.current.removeEventListener('pause', handlePause);
    }
    
    // Utwórz nowy element audio
    audioRef.current = new Audio(stations[currentStation]);
    audioRef.current.volume = volume;
    audioRef.current.crossOrigin = "anonymous";
    audioRef.current.preload = "none";
    
    // Reset stanu
    setLoading(false);
    setIsPlaying(false);
    setError(null);

    // Dodaj event listenery
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('error', handleAudioError);
    audioRef.current.addEventListener('playing', handlePlaying);
    audioRef.current.addEventListener('waiting', handleWaiting);
    audioRef.current.addEventListener('pause', handlePause);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.removeEventListener('playing', handlePlaying);
        audioRef.current.removeEventListener('waiting', handleWaiting);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.pause();
      }
    };
  }, [currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('player-volume', volume.toString());
  }, [volume]);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setLoading(false);
      } else {
        setLoading(true);
        setError(null);
        
        // Upewnij się, że audio ma źródło
        if (!audioRef.current.src || audioRef.current.error) {
          audioRef.current.src = stations[currentStation];
        }
        
        console.log('Trying to play:', stations[currentStation]);
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Audio started playing');
          // Stan zostanie zaktualizowany przez event listener 'playing'
        }
      }
    } catch (err) {
      console.error('Play error:', err);
      setError(`Nie można odtworzyć stacji: ${currentStation}`);
      setLoading(false);
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleStationChange = (e) => {
    const newStation = e.target.value;
    setCurrentStation(newStation);
    setIsPlaying(false);
    setError(null);
    localStorage.setItem('selected-station', newStation);
  };

  const formatLocationInfo = () => {
    if (!location) return null;
    
    let locationText = '';
    if (location.city) {
      locationText = location.city;
      if (location.country) {
        locationText += `, ${location.country}`;
      }
    } else {
      locationText = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
    
    return locationText;
  };

  return (
    <div className="radio-player">
      <h2>Odtwarzacz Radiowy</h2>
      
      <div className="station-selector">
        <label>Wybierz stację:</label>
        <select value={currentStation} onChange={handleStationChange}>
          {Object.keys(stations).map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>

      <div className="controls">
        <button 
          onClick={togglePlayPause} 
          disabled={loading}
          className={isPlaying ? 'playing' : 'paused'}
        >
          {loading ? 'Ładowanie...' : (isPlaying ? 'Pauza' : 'Odtwórz')}
        </button>
      </div>

      <div className="volume-control">
        <label>Głośność: {Math.round(volume * 100)}%</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={handleVolumeChange} 
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={() => {
              setError(null);
              setIsPlaying(false);
            }}
            className="dismiss-error"
          >
            OK
          </button>
        </div>
      )}

      <div className="current-station">
        <p>Obecnie odtwarzane: <strong>{currentStation}</strong></p>
        {isPlaying && <div className="playing-indicator">♪ Na żywo</div>}
      </div>

      <div className="date-time-location">
        <div className="date-time">
          <p>Data: {currentDateTime.toLocaleDateString('pl-PL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p>Godzina: {currentDateTime.toLocaleTimeString('pl-PL')}</p>
        </div>
        
        {formatLocationInfo() && (
          <div className="location-display">
            <p>Lokalizacja: <strong>{formatLocationInfo()}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadioPlayer;
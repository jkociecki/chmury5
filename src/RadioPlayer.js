import React, { useState, useRef, useEffect } from 'react';

const stations = {
  Antyradio: 'https://ant-waw-01.cdn.eurozet.pl/ant-waw.mp3',
  RMF_FM: 'https://rs6-krk2.rmfstream.pl/RMFFM48',
  Radio_ZET: 'https://radiozetmp3-01.eurozet.pl:8400/;',
  Radio_Maryja: 'https://radiomaryja.fastcast4u.com/proxy/radiomaryja?mp=/1'
};

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState(Object.keys(stations)[0]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = new Audio(stations[currentStation]);
    audioRef.current.volume = volume;
    audioRef.current.crossOrigin = "anonymous";
    
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    const handleCanPlay = () => {
      setLoading(false);
      setError(null);
    };
    
    const handleLoadStart = () => {
      setLoading(true);
      setError(null);
    };
    
    const handleError = (e) => {
      setLoading(false);
      setIsPlaying(false);
      setError('Błąd odtwarzania stacji radiowej');
      console.error('Błąd odtwarzania radio:', e);
    };

    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('loadstart', handleLoadStart);
    audioRef.current.addEventListener('error', handleError);

    return () => {
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('loadstart', handleLoadStart);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.pause();
      }
    };
  }, [currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setLoading(false);
      }
    } catch (err) {
      setError('Nie można odtworzyć stacji radiowej');
      setLoading(false);
      setIsPlaying(false);
      console.error('Błąd odtwarzania:', err);
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
  };

  return (
    <div className="radio-player">
      <h2>🎵 Odtwarzacz Radiowy</h2>
      
      <div className="station-selector">
        <label>Wybierz stację:</label>
        <select value={currentStation} onChange={handleStationChange}>
          {Object.keys(stations).map((station) => (
            <option key={station} value={station}>
              {station.replace('_', ' ')}
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
          {loading ? '⏳ Ładowanie...' : (isPlaying ? '⏸️ Pauza' : '▶️ Odtwórz')}
        </button>
      </div>

      <div className="volume-control">
        <label>🔊 Głośność: {Math.round(volume * 100)}%</label>
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
          ❌ {error}
        </div>
      )}

      <div className="current-station">
        <p>📻 Obecnie: <strong>{currentStation.replace('_', ' ')}</strong></p>
      </div>

      <div className="date-time">
        <p>📅 Data: {currentDateTime.toLocaleDateString('pl-PL')}</p>
        <p>🕐 Godzina: {currentDateTime.toLocaleTimeString('pl-PL')}</p>
      </div>
    </div>
  );
};

export default RadioPlayer;
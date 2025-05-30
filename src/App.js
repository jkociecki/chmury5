import React, { useEffect, useState } from 'react';
import RadioPlayer from './RadioPlayer';
import PrivacyPopup from './PrivacyPopup';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Sprawdź zgodę użytkownika
    const consent = localStorage.getItem('privacy-consent');
    if (consent === 'accepted') {
      setConsentGiven(true);
    }

    // Pobierz informacje o przeglądarce (nie wymaga zgody)
    setBrowserInfo({
      appName: navigator.appName || 'Nieznana',
      appVersion: navigator.appVersion || 'Nieznana',
      userAgent: navigator.userAgent || 'Nieznany',
      platform: navigator.platform || 'Nieznana',
      language: navigator.language || 'Nieznany',
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    });

    // Pobierz geolokalizację tylko jeśli użytkownik wyraził zgodę
    if (consent === 'accepted' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).tolocaleString('pl-PL')
          });
          setLocationError(null);
        },
        (error) => {
          let errorMessage = 'Nieznany błąd geolokalizacji';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Dostęp do lokalizacji został odmówiony';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informacje o lokalizacji są niedostępne';
              break;
            case error.TIMEOUT:
              errorMessage = 'Przekroczono czas oczekiwania na lokalizację';
              break;
            default:
              errorMessage = 'Wystąpił błąd podczas pobierania lokalizacji';
              break;
          }
          setLocationError(errorMessage);
          console.warn("Błąd geolokalizacji:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minut cache
        }
      );
    }
  }, []);

  // Funkcja do formatowania współrzędnych
  const formatCoordinate = (coord, type) => {
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S') 
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎵 Radio Internetowe</h1>
        <p>Słuchaj ulubionych stacji w najlepszej jakości</p>
      </header>

      <main className="main-content">
        <RadioPlayer />

        <div className="info-section">
          {consentGiven && location && (
            <div className="location-info">
              <h3>📍 Twoja lokalizacja</h3>
              <p><strong>Szerokość:</strong> {formatCoordinate(location.latitude, 'lat')}</p>
              <p><strong>Długość:</strong> {formatCoordinate(location.longitude, 'lng')}</p>
              <p><strong>Dokładność:</strong> ±{Math.round(location.accuracy)}m</p>
              <p><strong>Pobrano:</strong> {location.timestamp}</p>
            </div>
          )}

          {consentGiven && locationError && (
            <div className="location-error">
              <h3>📍 Informacje o lokalizacji</h3>
              <p>❌ {locationError}</p>
            </div>
          )}

          {browserInfo && (
            <div className="browser-info">
              <h3>🌐 Informacje o przeglądarce</h3>
              <div className="browser-details">
                <p><strong>Nazwa:</strong> {browserInfo.appName}</p>
                <p><strong>Platforma:</strong> {browserInfo.platform}</p>
                <p><strong>Język:</strong> {browserInfo.language}</p>
                <p><strong>Status połączenia:</strong> {browserInfo.onLine ? '🟢 Online' : '🔴 Offline'}</p>
                <p><strong>Cookies włączone:</strong> {browserInfo.cookieEnabled ? '✅ Tak' : '❌ Nie'}</p>
                <details>
                  <summary><strong>User Agent</strong></summary>
                  <small>{browserInfo.userAgent}</small>
                </details>
              </div>
            </div>
          )}
        </div>

        {!consentGiven && (
          <div className="no-consent-info">
            <p>ℹ️ Niektóre funkcje są wyłączone z powodu braku zgody na przetwarzanie danych.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 Radio Internetowe. Wszelkie prawa zastrzeżone.</p>
        <p>
          <small>
            Projekt realizowany w ramach laboratorium "Programowanie w chmurze" |
            <a href="#privacy" onClick={() => {
              localStorage.removeItem('privacy-consent');
              window.location.reload();
            }}> Zmień ustawienia prywatności</a>
          </small>
        </p>
      </footer>

      <PrivacyPopup />
    </div>
  );
}

export default App;
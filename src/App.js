import React, { useEffect, useState } from 'react';
import RadioPlayer from './RadioPlayer';
import PrivacyPopup from './PrivacyPopup';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  useEffect(() => {
    // Sprawdź zgodę użytkownika
    const consent = localStorage.getItem('privacy-consent');
    if (consent === 'accepted') {
      setConsentGiven(true);
      fetchLocation();
    }

    // Pobierz informacje o przeglądarce (nie wymaga zgody)
    setBrowserInfo({
      appName: getBrowserName(),
      appVersion: navigator.appVersion || 'Nieznana',
      userAgent: navigator.userAgent || 'Nieznany',
      platform: navigator.platform || 'Nieznana',
      language: navigator.language || 'Nieznany',
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    });
  }, []);

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Nieznana';
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toLocaleString('pl-PL'),
            city: 'Pobieranie...' // placeholder, można dodać reverse geocoding
          });
          setLocationError(null);
          
          // Opcjonalnie: reverse geocoding do uzyskania nazwy miasta
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          let errorMessage = 'Nieznany błąd geolokalizacji';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Dostęp do lokalizacji został odmówiony przez użytkownika';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informacje o lokalizacji są niedostępne';
              break;
            case error.TIMEOUT:
              errorMessage = 'Przekroczono czas oczekiwania na lokalizację';
              break;
            default:
              errorMessage = 'Wystąpił nieoczekiwany błąd podczas pobierania lokalizacji';
              break;
          }
          setLocationError(errorMessage);
          console.warn("Błąd geolokalizacji:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minut cache
        }
      );
    } else {
      setLocationError('Geolokalizacja nie jest obsługiwana przez tę przeglądarkę');
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Używamy bezpłatnego API do reverse geocoding
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pl`);
      const data = await response.json();
      
      setLocation(prev => ({
        ...prev,
        city: data.city || data.locality || data.principalSubdivision || 'Nieznane miasto',
        country: data.countryName || 'Nieznany kraj'
      }));
    } catch (error) {
      console.warn('Nie udało się pobrać nazwy miasta:', error);
      setLocation(prev => ({
        ...prev,
        city: 'Nieznane miasto'
      }));
    }
  };

  // Funkcja do formatowania współrzędnych
  const formatCoordinate = (coord, type) => {
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S') 
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  const handlePrivacySettingsChange = () => {
    localStorage.removeItem('privacy-consent');
    localStorage.removeItem('privacy-consent-date');
    setConsentGiven(false);
    setLocation(null);
    setLocationError(null);
    setShowPrivacySettings(true);
  };

  const handleConsentUpdate = (accepted) => {
    setConsentGiven(accepted);
    setShowPrivacySettings(false);
    if (accepted) {
      fetchLocation();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Radio Internetowe</h1>
        <p>Słuchaj ulubionych stacji w najlepszej jakości</p>
      </header>

      <main className="main-content">
        <RadioPlayer location={location} />

        <div className="info-section">
          {consentGiven && location && (
            <div className="location-info">
              <h3>Twoja lokalizacja</h3>
              <p><strong>Miasto:</strong> {location.city}</p>
              {location.country && <p><strong>Kraj:</strong> {location.country}</p>}
              <p><strong>Współrzędne:</strong> {formatCoordinate(location.latitude, 'lat')}, {formatCoordinate(location.longitude, 'lng')}</p>
              <p><strong>Dokładność:</strong> ±{Math.round(location.accuracy)}m</p>
              <p><strong>Aktualizacja:</strong> {location.timestamp}</p>
            </div>
          )}

          {consentGiven && locationError && (
            <div className="location-error">
              <h3>Informacje o lokalizacji</h3>
              <p>Błąd: {locationError}</p>
              <button 
                onClick={fetchLocation}
                className="retry-location-btn"
              >
                Spróbuj ponownie
              </button>
            </div>
          )}

          {browserInfo && (
            <div className="browser-info">
              <h3>Informacje o przeglądarce</h3>
              <div className="browser-details">
                <p><strong>Przeglądarka:</strong> {browserInfo.appName}</p>
                <p><strong>Platforma:</strong> {browserInfo.platform}</p>
                <p><strong>Język:</strong> {browserInfo.language}</p>
                <p><strong>Status połączenia:</strong> {browserInfo.onLine ? 'Online' : 'Offline'}</p>
                <p><strong>Cookies włączone:</strong> {browserInfo.cookieEnabled ? 'Tak' : 'Nie'}</p>
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
            <p>Niektóre funkcje są wyłączone z powodu braku zgody na przetwarzanie danych.</p>
            <button onClick={() => setShowPrivacySettings(true)}>
              Zmień ustawienia prywatności
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 Radio Internetowe. Wszelkie prawa zastrzeżone.</p>
        <p>
          <small>
            Projekt realizowany w ramach laboratorium "Programowanie w chmurze" |
            <a href="#privacy" onClick={handlePrivacySettingsChange}>
              Zmień ustawienia prywatności
            </a>
          </small>
        </p>
      </footer>

      {(showPrivacySettings || !localStorage.getItem('privacy-consent')) && (
        <PrivacyPopup onConsentChange={handleConsentUpdate} />
      )}
    </div>
  );
}

export default App;
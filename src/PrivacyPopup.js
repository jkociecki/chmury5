import React, { useState, useEffect } from 'react';

const PrivacyPopup = ({ onConsentChange }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik już podjął decyzję
    const consent = localStorage.getItem('privacy-consent');
    if (!consent) {
      setShowPopup(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy-consent', 'accepted');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setShowPopup(false);
    if (onConsentChange) {
      onConsentChange(true);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('privacy-consent', 'declined');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setShowPopup(false);
    if (onConsentChange) {
      onConsentChange(false);
    }
  };

  const handleSelectiveAccept = () => {
    localStorage.setItem('privacy-consent', 'selective');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setShowPopup(false);
    if (onConsentChange) {
      onConsentChange(false); // Tylko podstawowe funkcje
    }
  };

  if (!showPopup) {
    return null;
  }

  return (
    <div className="privacy-popup-overlay">
      <div className="privacy-popup">
        <h3>Polityka Prywatności i Cookies</h3>
        <div className="privacy-content">
          <p>
            <strong>Ta aplikacja wykorzystuje następujące technologie:</strong>
          </p>
          <ul>
            <li><strong>Local Storage</strong> - do zapamiętania Twoich preferencji (wybrana stacja, głośność, zgody)</li>
            <li><strong>Geolokalizacja HTML5</strong> - do określenia Twojej lokalizacji (opcjonalnie)</li>
            <li><strong>Informacje o przeglądarce</strong> - do optymalizacji działania aplikacji</li>
          </ul>
          
          <p>
            <strong>Cel zbierania danych:</strong>
          </p>
          <ul>
            <li>Zapamiętanie ostatnio wybranej stacji radiowej</li>
            <li>Zachowanie ustawień głośności</li>
            <li>Wyświetlenie lokalnej godziny i lokalizacji</li>
            <li>Dostosowanie interfejsu do możliwości przeglądarki</li>
          </ul>

          <p>
            <strong>Bezpieczeństwo danych:</strong><br/>
            Wszystkie dane są przechowywane lokalnie w Twojej przeglądarce. 
            Żadne informacje nie są wysyłane na zewnętrzne serwery, 
            z wyjątkiem strumieni radiowych i opcjonalnego określania nazwy miasta.
          </p>

          <div className="privacy-details">
            <details>
              <summary><strong>Szczegóły techniczne</strong></summary>
              <div className="technical-details">
                <p><strong>Local Storage:</strong> Przechowywanie preferencji w przeglądarce</p>
                <p><strong>Geolocation API:</strong> HTML5 API do określenia współrzędnych</p>
                <p><strong>Navigator Object:</strong> Informacje o przeglądarce i systemie</p>
                <p><strong>Reverse Geocoding:</strong> Bezpłatne API do określenia nazwy miasta</p>
                <p><strong>Strumienie radiowe:</strong> Bezpośrednie połączenia z serwerami stacji</p>
              </div>
            </details>
          </div>
        </div>

        <div className="privacy-buttons">
          <button onClick={handleAccept} className="accept-btn">
            Akceptuję wszystkie
          </button>
          <button onClick={handleSelectiveAccept} className="selective-btn">
            Tylko niezbędne
          </button>
          <button onClick={handleDecline} className="decline-btn">
            Odmawiam
          </button>
        </div>

        <div className="privacy-footer">
          <small>
            Zgodnie z RODO i prawem o prywatnościoelektronicznej.<br/>
            Możesz zmienić swoje ustawienia w dowolnym momencie.<br/>
            Kontakt: admin@radioapp.pl
          </small>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPopup;
import React, { useState, useEffect } from 'react';

const PrivacyPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Sprawdź czy użytkownik już zaakceptował
    const consent = localStorage.getItem('privacy-consent');
    if (!consent) {
      setShowPopup(true);
    } else {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy-consent', 'accepted');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setAccepted(true);
    setShowPopup(false);
  };

  const handleDecline = () => {
    localStorage.setItem('privacy-consent', 'declined');
    setShowPopup(false);
  };

  if (!showPopup) {
    return null;
  }

  return (
    <div className="privacy-popup-overlay">
      <div className="privacy-popup">
        <h3>🔒 Polityka Prywatności i Cookies</h3>
        <div className="privacy-content">
          <p>
            <strong>Ta strona wykorzystuje:</strong>
          </p>
          <ul>
            <li>🍪 <strong>Cookies</strong> - do zapamiętania Twoich preferencji</li>
            <li>📍 <strong>Geolokalizację</strong> - do wyświetlenia Twojej lokalizacji (opcjonalnie)</li>
            <li>🌐 <strong>Informacje o przeglądarce</strong> - do optymalizacji działania strony</li>
          </ul>
          
          <p>
            <strong>Dlaczego zbieramy te dane?</strong>
          </p>
          <ul>
            <li>Zapamiętanie wybranej stacji radiowej</li>
            <li>Dostosowanie treści do Twojej lokalizacji</li>
            <li>Poprawa funkcjonalności aplikacji</li>
          </ul>

          <p>
            <strong>Twoje prawa:</strong><br/>
            Możesz odmówić zgody lub wycofać ją w dowolnym momencie. 
            Dane geolokalizacyjne nie są przechowywane na serwerze.
          </p>

          <div className="privacy-details">
            <details>
              <summary><strong>Szczegóły techniczne</strong></summary>
              <p>
                • Cookies są przechowywane lokalnie w Twojej przeglądarce<br/>
                • Geolokalizacja wykorzystuje HTML5 Geolocation API<br/>
                • Informacje o przeglądarce pochodzą z navigator object<br/>
                • Żadne dane nie są wysyłane do zewnętrznych serwerów
              </p>
            </details>
          </div>
        </div>

        <div className="privacy-buttons">
          <button onClick={handleAccept} className="accept-btn">
            ✅ Akceptuję wszystkie
          </button>
          <button onClick={handleDecline} className="decline-btn">
            ❌ Odmawiam
          </button>
        </div>

        <div className="privacy-footer">
          <small>
            Zgodnie z RODO i prawem o cookies.<br/>
            Kontakt: admin@radioapp.pl
          </small>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPopup;
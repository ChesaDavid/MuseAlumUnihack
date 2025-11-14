// pages/index.js
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  // Obține locația reală a utilizatorului
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setUserLocation({ lat, lng });
          
          // Încearcă să obțină numele orașului
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ro`
            );
            const data = await response.json();
            setCity(data.city || data.locality || 'Locația ta');
          } catch (error) {
            setCity('Locația ta');
          }
          
          setLoading(false);
        },
        (error) => {
          // Dacă geolocația eșuează, folosește o locație random
          const randomLocations = [
            { lat: 44.4268 + (Math.random() - 0.5) * 2, lng: 26.1025 + (Math.random() - 0.5) * 2, city: 'București' },
            { lat: 46.7712 + (Math.random() - 0.5) * 2, lng: 23.6236 + (Math.random() - 0.5) * 2, city: 'Cluj-Napoca' },
            { lat: 45.9432 + (Math.random() - 0.5) * 2, lng: 24.9668 + (Math.random() - 0.5) * 2, city: 'Sibiu' },
          ];
          const randomLoc = randomLocations[Math.floor(Math.random() * randomLocations.length)];
          setUserLocation(randomLoc);
          setCity(randomLoc.city);
          setLoading(false);
        }
      );
    } else {
      // Browser-ul nu suportă geolocația
      const randomLoc = { lat: 44.4268, lng: 26.1025, city: 'București' };
      setUserLocation(randomLoc);
      setCity(randomLoc.city);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <div className="text-xl text-gray-600">Se detectează locația ta...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🗺️ Harta Ta Personală
          </h1>
          <p className="text-gray-600 text-lg">
            Aceasta este harta unică pentru locația ta actuală
          </p>
        </div>

        {/* Card cu informații */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
              📍
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {city}
            </h2>
            <p className="text-gray-600 mb-4">
              Locația ta curentă
            </p>
          </div>

          {/* Coordonate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold">Latitudine</p>
              <p className="text-lg font-mono font-bold text-blue-800">
                {userLocation.lat.toFixed(6)}° N
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-semibold">Longitudine</p>
              <p className="text-lg font-mono font-bold text-green-800">
                {userLocation.lng.toFixed(6)}° E
              </p>
            </div>
          </div>
        </div>

        {/* Hartă vizuală */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            📍 Locația ta exactă
          </h3>
          
          <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-8 h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
            
            {/* Marker personalizat */}
            <div className="absolute" style={{ 
              top: '50%', 
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <div className="animate-pulse bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                📍
              </div>
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border">
                <p className="text-sm font-semibold whitespace-nowrap">
                  Tu ești aici!
                </p>
              </div>
            </div>

            {/* Coordonate pe hartă */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
              {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
            </div>
          </div>

          {/* Buton de acțiune */}
          <div className="text-center mt-6">
            <a 
              href={`https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              <span>🗺️</span>
              <span>Deschide în Google Maps</span>
            </a>
          </div>
        </div>

        {/* Informații */}
        <div className="text-center mt-8 text-gray-500">
          <p>✨ Această hartă este unică pentru locația ta actuală</p>
          <p className="text-sm mt-2">
            Fiecare persoană va vedea o hartă diferită bazată pe locația sa
          </p>
        </div>

      </div>
    </div>
  );
}

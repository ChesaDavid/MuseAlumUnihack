// pages/index.js
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setUserLocation({ lat, lng });
          
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
          console.log('Eroare geolocație:', error);
          setUserLocation(null);
          setLoading(false);
        }
      );
    } else {
      setUserLocation(null);
      setLoading(false);
    }
  }, []);

  const retryLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setUserLocation({ lat, lng });
          
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
          console.log('Eroare geolocație:', error);
          setLoading(false);
        }
      );
    }
  };

  // Museum AI Component integrat direct
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useState(null);

  const museumDatabase = {
    romania: {
      country: "Romania",
      museums: [
        {
          name: "Muzeul Național de Artă al României",
          city: "București",
          description: "Găzduiește colecția națională de artă românească și europeană",
          highlights: ["Arta medievală românească", "Colecția europeană", "Colecția Theodor Aman"],
          type: "Muzeu de Artă",
          rating: 4.6,
          mustSee: true
        },
        {
          name: "Muzeul Național de Istorie a României",
          city: "București",
          description: "Prezintă istoria României de la preistorie până în era modernă",
          highlights: ["Tezaurul de la Pietroasa", "Artefacte romane", "Bijuterii regale"],
          type: "Muzeu de Istorie",
          rating: 4.5,
          mustSee: true
        }
      ]
    },
    france: {
      country: "France",
      museums: [
        {
          name: "Louvre Museum",
          city: "Paris",
          description: "Cel mai mare muzeu de artă din lume",
          highlights: ["Mona Lisa", "Venus de Milo", "Victoriei din Samotracia"],
          type: "Muzeu de Artă",
          rating: 4.8,
          mustSee: true
        }
      ]
    },
    italy: {
      country: "Italy",
      museums: [
        {
          name: "Vatican Museums",
          city: "Vatican City",
          description: "Artă creștină și sculpturi clasice",
          highlights: ["Capela Sixtină", "Camerele lui Rafael"],
          type: "Muzeu de Artă",
          rating: 4.8,
          mustSee: true
        }
      ]
    }
  };

  const getMuseumsByCountry = (countryName) => {
    const normalizedCountry = countryName.toLowerCase().trim();
    for (const [key, data] of Object.entries(museumDatabase)) {
      if (data.country.toLowerCase().includes(normalizedCountry) || normalizedCountry.includes(key)) {
        return data;
      }
    }
    return null;
  };

  const generateAIResponse = (country) => {
    const countryData = getMuseumsByCountry(country);
    
    if (!countryData) {
      return {
        text: `Nu am informații despre muzee în ${country}. Încearcă: România, Franța, Italia.`,
        museums: []
      };
    }

    let response = `🏛️ **Muzee de top în ${countryData.country}**\n\n`;
    countryData.museums.forEach((museum, index) => {
      response += `${index + 1}. **${museum.name}** (${museum.city})\n`;
      response += `   ⭐ ${museum.rating}/5 | ${museum.type}\n`;
      response += `   📍 ${museum.description}\n\n`;
    });

    return {
      text: response,
      museums: countryData.museums
    };
  };

  const handleSend = async () => {
    if (!input.trim() || aiLoading) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAiLoading(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const aiMessage = { 
        type: 'ai', 
        content: aiResponse.text,
        museums: aiResponse.museums
      };
      setMessages(prev => [...prev, aiMessage]);
      setAiLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <div className="text-xl text-gray-600">Se detectează locația ta...</div>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Nu s-a putut detecta locația</h2>
          <button
            onClick={retryLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            🔄 Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coloana stângă - Harta */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                📍 {city}
              </h2>
              <p className="text-gray-600 mt-1">Locația ta actuală</p>
            </div>

            <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-xl p-6 h-80 flex items-center justify-center border-2 border-dashed border-gray-300">
              
              <div className="absolute" style={{ 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <div className="animate-pulse bg-green-500 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                  📍
                </div>
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg border">
                  <p className="text-xs font-semibold whitespace-nowrap">
                    Tu ești aici!
                  </p>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs">
                {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
              </div>

              <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                ✅ Reală
              </div>
            </div>

            <div className="text-center mt-4">
              <a 
                href={`https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
              >
                <span>🗺️</span>
                <span>Google Maps</span>
              </a>
            </div>
          </div>

          {/* Coloana dreaptă - Museum AI */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  🏛️
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Museum Explorer AI</h1>
                  <p className="text-purple-100">Descoperă cele mai bune muzee</p>
                </div>
              </div>
            </div>

            {/* Quick Buttons */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600 mb-2">Țări disponibile:</p>
              <div className="flex flex-wrap gap-2">
                {['România', 'Franța', 'Italia'].map(country => (
                  <button
                    key={country}
                    onClick={() => setInput(country)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-4xl mb-4">🏛️</div>
                  <p className="text-lg font-semibold">Bun venit!</p>
                  <p className="text-sm">Întreabă-mă despre muzee</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        message.type === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                        {message.type === 'ai' ? (
                          <div className="whitespace-pre-line">
                            {message.content.split('**').map((part, i) => 
                              i % 2 === 1 ? <strong key={i} className="text-purple-600">{part}</strong> : part
                            )}
                          </div>
                        ) : (
                          message.content
                        )}
                        
                        {message.type === 'ai' && message.museums && message.museums.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {message.museums.map((museum, museumIndex) => (
                              <div key={museumIndex} className="p-3 rounded-lg border bg-white border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-gray-900">{museum.name}</h4>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="text-sm font-medium">{museum.rating}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{museum.description}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>🏙️ {museum.city}</span>
                                  <span>📚 {museum.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-none p-4">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-white">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Scrie o țară (ex: România, Franța...)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  disabled={aiLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={aiLoading || !input.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                >
                  Trimite
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
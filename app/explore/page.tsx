"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function ExplorePage() {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  // Load Leaflet JS/CSS dynamically on client
  useEffect(() => {
    const Lcss = document.createElement("link")
    Lcss.rel = "stylesheet"
    Lcss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(Lcss)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)

    return () => {
      try { document.head.removeChild(Lcss) } catch {};
      try { document.body.removeChild(script) } catch {};
    }
  }, [])

  // Initialize map after leaflet loaded
  useEffect(() => {
    if (!loaded || !mapContainerRef.current) return
    // @ts-ignore
    const L = (window as any).L
    if (!L) return

    mapRef.current = L.map(mapContainerRef.current).setView([45.9432, 24.9668], 6) // Romania center default
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current)
  }, [loaded])

  // helper: place markers from museums array
  const addMuseumMarkers = async (museums: any[]) => {
    const map = mapRef.current
    if (!map) return

    // remove existing layers (simple approach)
    map.eachLayer((layer: any) => {
      try {
        if (layer && layer.options && layer.options.pane !== 'tilePane') map.removeLayer(layer)
      } catch {}
    })

    const group = (window as any).L.featureGroup()

    for (const m of museums) {
      const q = encodeURIComponent(`${m.name || ""} ${m.city || ""}`)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`)
        const data = await res.json()
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat)
          const lon = parseFloat(data[0].lon)
          const marker = (window as any).L.marker([lat, lon])
          marker.bindPopup(`<strong>${m.name}</strong><br/>${m.city || ""}<br/><small>${m.description || ""}</small>`)
          marker.addTo(group)
        }
      } catch (e) {
        console.warn("geocode failed", e)
      }
    }

    group.addTo(map)
    try { map.fitBounds(group.getBounds(), { maxZoom: 12 }) } catch {}
  }

  const sendPrompt = async () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { type: "user", text: input }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      })

      if (!res.ok) throw new Error(`OpenAI returned ${res.status}`)

      const payload = await res.json()
      const aiText = payload.text || JSON.stringify(payload)
      setMessages(prev => [...prev, { type: 'ai', text: aiText }])

      if (payload.museums && Array.isArray(payload.museums) && payload.museums.length > 0) {
        await addMuseumMarkers(payload.museums)
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { type: 'ai', text: 'Sorry, failed to fetch suggestions.' }])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-center gap-4 mb-8">
          <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="h-10 w-10 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow">
            M
          </motion.div>
          <span className="text-2xl font-bold bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Musealum</span>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.1 }} className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-[520px] rounded-2xl  overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
              <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="text-sm text-gray-600">Tip: Try “Museums in Bucharest” or “Top museums in Romania”.</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-[590px]">
            {/* Chat Header */}
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">🗺️ Museum Guide</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ask for museums by city or country</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scroll-smooth">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <div className="text-4xl mb-3">🎨</div>
                  <p className="text-sm font-medium">Start exploring!</p>
                  <p className="text-xs mt-1">Try: "Museums in Bucharest"</p>
                </motion.div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                      m.type === 'user'
                        ? 'bg-linear-to-br from-red-600 to-red-700 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-gray-100 dark:bg-gray-700 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && sendPrompt()}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  placeholder="Museums in Bucharest..."
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendPrompt}
                  disabled={loading || !input.trim()}
                  className="px-6 py-2.5 rounded-full bg-linear-to-r from-red-600 to-red-700 text-white font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '✨' : '🔍'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.4 }} className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🗺️', title: 'Interactive Map', desc: 'Explore museum locations visually' },
            { icon: '🤖', title: 'AI Suggestions', desc: 'Ask for curated museum lists' },
            { icon: '🌐', title: 'Global Coverage', desc: 'Find museums around the world' },
          ].map((f, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

      </main>
    </div>
  )
}

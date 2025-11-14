
"use client";

import { useState } from "react";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    setMessages([...messages, { role: "user", text: question }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", text: "Eroare la conectarea cu ChatGPT." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat cu ChatGPT</h1>
      <div className="border p-2 h-64 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={m.role === "user" ? "bg-blue-200 p-2 rounded inline-block" : "bg-gray-200 p-2 rounded inline-block"}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border p-2 flex-1 rounded"
          placeholder="Scrie întrebarea ta..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded" disabled={loading}>
          {loading ? "Se încarcă..." : "Trimite"}
        </button>
      </form>
    </div>
  );
}

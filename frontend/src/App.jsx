import React, { useState, useEffect, useRef } from "react";
import "./index.css";

export default function App() {
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      textEn:
        "Welcome to RailSahayak! 🚂 I can help you with train booking, PNR status, complaints, temple routes, and more. How can I help you today?",
      textHi:
        "रेलसहायक में आपका स्वागत है! 🚂 मैं ट्रेन बुकिंग, PNR स्थिति, शिकायत, मंदिर मार्ग और बहुत कुछ में आपकी मदद कर सकता हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    document.body.className = `lang-${lang} ${isDark ? "dark" : ""}`;
  }, [lang, isDark]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleLang = () => setLang((prev) => (prev === "en" ? "hi" : "en"));
  const toggleTheme = () => setIsDark((prev) => !prev);

  const getBackendResponse = async (query, isHi) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://sih-rag-backend.onrender.com"}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: query }],
          lang: isHi ? "hi" : "en",
        }),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      return {
        answer: data.answer,
        category:
          (data.sources?.category || (isHi ? "सामान्य" : "General")) + " (AI)",
      };
    } catch (err) {
      return {
        answer: isHi
          ? "क्षमा करें, मुझे इसका उत्तर नहीं मिल सका। कृपया अपने प्रश्न को अलग तरह से पूछें या सहायता के लिए रेलवे हेल्पलाइन 139 पर कॉल करें।"
          : "Sorry, I couldn't find an answer to that. Please try rephrasing your question or call the Railway Helpline 139 for assistance.",
        category: isHi ? "सामान्य" : "General",
      };
    }
  };

  const processMessage = async (text) => {
    const isDevanagari = /[\\u0900-\\u097F]/.test(text);
    let currentLang = lang;
    if (isDevanagari && lang === "en") {
      setLang("hi");
      currentLang = "hi";
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", textEn: text, textHi: text },
    ]);
    setShowQuickActions(false);
    setIsTyping(true);

    const response = await getBackendResponse(text, currentLang === "hi");
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        textEn: response.answer,
        textHi: response.answer,
        category: response.category,
      },
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      processMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const renderText = (msg) => {
    let t = lang === "en" ? msg.textEn : msg.textHi;
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: t.replace(/\\*\\*(.*?)\\*\\*/g, "<strong>$1</strong>"),
        }}
      />
    );
  };

  const quickActionChips = [
    { en: "How to book a ticket?", hi: "टिकट कैसे बुक करें?" },
    { en: "How to file a complaint?", hi: "शिकायत कैसे दर्ज करें?" },
    { en: "Order food online", hi: "ऑनलाइन भोजन ऑर्डर करें" },
    { en: "Find holiday packages", hi: "हॉलिडे पैकेज खोजें" },
    { en: "Check PNR Status", hi: "PNR स्थिति जांचें" },
    { en: "How to cancel ticket?", hi: "टिकट कैसे रद्द करें?" },
  ];

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <div className="logo">🚂</div>
          <div className="title-container">
            <h1 className="title en-text">RailSahayak</h1>
            <h1 className="title hi-text">रेलसहायक</h1>
            <span className="subtitle en-text">AI Assistant</span>
            <span className="subtitle hi-text">एआई सहायक</span>
          </div>
        </div>
        <div className="actions">
          <button id="lang-toggle" className="lang-btn" onClick={toggleLang}>
            <span className="en-label">हिंदी</span>
            <span className="hi-label">English</span>
          </button>
          <button
            className="theme-btn"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}></i>
          </button>
        </div>
      </header>

      <main className="chat-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}-message`}>
            <div className="avatar">{msg.sender === "bot" ? "🚂" : "👤"}</div>
            <div className="message-content">
              {msg.category && msg.sender === "bot" && (
                <span className="category-tag">{msg.category}</span>
              )}
              <p>{renderText(msg)}</p>
            </div>
          </div>
        ))}

        {showQuickActions && (
          <div className="quick-actions">
            {quickActionChips.map((chip, i) => (
              <button
                key={i}
                className="chip"
                disabled={isTyping}
                onClick={() =>
                  processMessage(lang === "en" ? chip.en : chip.hi)
                }
              >
                <span className="en-text">{chip.en}</span>
                <span className="hi-text">{chip.hi}</span>
              </button>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="message bot-message typing-indicator">
            <div className="avatar">🚂</div>
            <div className="message-content typing-content">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="input-container">
        <form id="chat-form" className="input-area" onSubmit={handleSend}>
          <input
            type="text"
            id="user-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              lang === "en"
                ? "Type your message here..."
                : "अपना संदेश यहाँ लिखें..."
            }
            disabled={isTyping}
          />
          <button
            type="submit"
            id="send-btn"
            className="send-btn"
            disabled={isTyping || !inputValue.trim()}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </footer>
    </div>
  );
}

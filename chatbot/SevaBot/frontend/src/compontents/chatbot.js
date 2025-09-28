import React, { useState, useRef } from "react";
// Load available voices

// Languages for speech
const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "mr-IN", label: "Marathi" },
];

function Chatbot() {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [chat, setChat] = useState([]); // [{ sender: "user"/"bot", text }]
  const [selectedLang, setSelectedLang] = useState(" ");
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Speak text
  const speak = (text) => {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);

  if (selectedLang === "hi-IN") {
    utter.lang = "hi-IN";
  } else if (selectedLang === "mr-IN") {
    utter.lang = "mr-IN";
  } else {
    utter.lang = "en-IN"; // default English
  }

  // Speak must be called outside if-else
  window.speechSynthesis.speak(utter);
};

  // Speech-to-text
const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Your browser does not support speech recognition.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = selectedLang || "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Automatically restart if no speech detected
  recognition.onspeechend = () => recognition.stop();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setMessage(transcript);
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") {
      console.log("No speech detected, try again.");
      alert("No speech detected, please speak clearly into your microphone.");
    } else {
      console.error("Speech recognition error:", event.error);
      alert("Speech recognition error: " + event.error);
    }
  };

  recognition.start();
};

  // Send message + image to backend
  const handleSend = async () => {
  if (!message && !imageFile) return;

  setChat((prev) => [...prev, { sender: "user", text: message }]);
  setMessage("");
  scrollToBottom();

  const formData = new FormData();
  formData.append("message", message);
  formData.append("lang", selectedLang); // send selected language
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch("http://localhost:8080/chat", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    // Bot reply in selected language
    setChat((prev) => [...prev, { sender: "bot", text: data.reply }]);
    speak(data.reply);

    scrollToBottom();
  } catch (err) {
    console.error(err);
    setChat((prev) => [...prev, { sender: "bot", text: "Error: Could not reach server." }]);
    speak("Error: Could not reach server.", selectedLang);
  }

  setImageFile(null);
};

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2>🌐 Multilingual AI Chatbot</h2>

      {/* Language select */}
      <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>

      {/* Chat messages */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginTop: "10px",
        }}
      >
        {chat.map((c, idx) => (
          <div
            key={idx}
            style={{
              textAlign: c.sender === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "15px",
                backgroundColor: c.sender === "user" ? "#007bff" : "#eee",
                color: c.sender === "user" ? "#fff" : "#000",
              }}
            >
              {c.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input + image + buttons */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "60%" }}
        />
        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
          style={{ width: "30%", marginLeft: "5px" }}
        />
        <div style={{ marginTop: "5px" }}>
          <button onClick={handleSend}>Send</button>
          <button onClick={startListening} style={{ marginLeft: "5px" }}>🎤 Speak</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;

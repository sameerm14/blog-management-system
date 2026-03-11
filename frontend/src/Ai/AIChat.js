import React, { useState, useRef } from "react";
import "./AIChat.css";
import { useNavigate } from "react-router-dom";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://blog-management-system-y5tx.onrender.com/api/ai-support",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: input }),
        },
      );

      const data = await res.json();

      const aiMsg = {
        sender: "ai",
        text: data.reply,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.log(err);
    }

    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim()) {
      sendMessage();
    }
  };

  return (
    <>
      <div className="chat-button" onClick={() => setOpen(!open)}>
        <span className="chat-icon">💬</span>
        <span className="chat-text">Need Help?</span>
      </div>

      {open && (
        <div className="chat-window">
          <div className="chat-header">AI Support</div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender}>
                {msg.text.split("\n").map((line, index) => {
                  if (line.startsWith("Open:")) {
                    const path = line.replace("Open:", "").trim();

                    return (
                      <div key={index}>
                        <button
                          className="chat-link"
                          onClick={() => navigate(path)}
                        >
                          Go to page
                        </button>
                      </div>
                    );
                  }

                  return <div key={index}>{line}</div>;
                })}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

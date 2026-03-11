import React from "react";
import { useState } from "react";
import "./AIChat.css";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

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

      const aiMsg = { sender: "ai", text: data.reply };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.log(err);
    }

    setInput("");
  };

  return (
    <>
      <div className="chat-button" onClick={() => setOpen(!open)}>
        💬
      </div>

      {open && (
        <div className="chat-window">
          <div className="chat-header">AI Support</div>

          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

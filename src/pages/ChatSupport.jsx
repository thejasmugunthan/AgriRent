// src/pages/ChatSupport.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import io from "socket.io-client";
import "../css/Chat.css";

const socket = io("http://localhost:5000");

export default function ChatSupport() {
  const [params] = useSearchParams();

  const rentalId = params.get("rentalId");
  const otherId = params.get("otherId");
  const otherName = params.get("otherName") || "User";
  const otherRole = params.get("otherRole") || "user";

  const userId = localStorage.getItem("userId");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const isInvalid = !rentalId || !otherId || !userId;

  // Load existing chat
  const loadChat = useCallback(async () => {
    try {
      const res = await api.get(`/chat/${rentalId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.log("Chat load error:", err);
    }
  }, [rentalId]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || isInvalid) return;

    const payload = {
      rentalId,
      senderId: userId,
      receiverId: otherId,
      message: text,
    };

    try {
      await api.post("/chat/send", payload);

      // Add ONLY socket update (avoid double message)
      socket.emit("chat:message", payload);
      setText("");
    } catch (err) {
      alert("Failed to send message");
      console.log("Send error:", err);
    }
  };

  // Socket listener
  useEffect(() => {
    if (isInvalid) return;

    socket.emit("join-room", { rentalId });

    // Received message
    const handler = (msg) => {
      if (msg.rentalId === rentalId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("chat:message", handler);

    loadChat(); // load history once

    return () => {
      socket.off("chat:message", handler);
    };
  }, [isInvalid, rentalId, loadChat]);


  if (isInvalid) {
    return (
      <div className="chat-container">
        <h2 className="chat-header">❌ Invalid chat session</h2>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <h2 className="chat-header">
        Chat with {otherName} ({otherRole})
      </h2>

      <div className="chat-box">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              m.senderId === userId ? "mine" : "theirs"
            }`}
          >
            {m.message}
          </div>
        ))}
      </div>

      <div className="chat-input-bar">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

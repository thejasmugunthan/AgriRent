import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import io from "socket.io-client";
import { FaArrowLeft, FaUser, FaPaperPlane, FaComments } from "react-icons/fa";

const socket = io("http://localhost:5000");

export default function ChatSupport() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const rentalId = params.get("rentalId");
  const otherId = params.get("otherId");
  const otherName = params.get("otherName") || "User";
  const otherRole = params.get("otherRole") || "user";

  const userId = localStorage.getItem("userId");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const isInvalid = !rentalId || !otherId || !userId;


  const loadChat = useCallback(async () => {
    try {
      const res = await api.get(`/chat/${rentalId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.log("Chat load error:", err);
    }
  }, [rentalId]);


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

      setMessages((prev) => [...prev, payload]);

      setText("");
    } catch (err) {
      alert("Failed to send message");
      console.log("Send error:", err);
    }
  };

  useEffect(() => {
    if (isInvalid) return;

    socket.emit("join-room", { rentalId });

    const handler = (msg) => {
      if (
        msg.rentalId === rentalId &&
        msg.senderId !== userId
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("chat:message", handler);

    loadChat();

    return () => {
      socket.off("chat:message", handler);
    };
  }, [isInvalid, rentalId, loadChat, userId]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isInvalid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Invalid Chat Session
          </h2>
          <p className="text-gray-600 mb-6">
            This chat session could not be found or is no longer valid.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg mb-6 shadow-sm"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <FaUser className="text-green-600 text-xl" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaComments /> Chat with {otherName}
              </h2>
              <p className="text-green-100 text-sm capitalize">{otherRole}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white shadow-lg p-6 h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaComments className="text-6xl mb-4" />
              <p className="text-lg">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.senderId === userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow ${
                      m.senderId === userId
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="break-words">{m.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 rounded-b-xl shadow-lg p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                text.trim()
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FaPaperPlane /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

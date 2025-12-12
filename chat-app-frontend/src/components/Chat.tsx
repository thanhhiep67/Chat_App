import React, { useEffect, useRef, useState } from "react";
import { Client, Message as StompMessage } from "@stomp/stompjs";
import Message from "./Message";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface ChatProps {
  userName: string;
  onLogout?: () => void;
}

interface ChatMessage {
  sender: string;
  content: string;
  type: "JOIN" | "LEAVE" | "CHAT";
}

const Chat: React.FC<ChatProps> = ({ userName, onLogout }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  const clientRef = useRef<Client | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- Auto Scroll ----
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- WebSocket Setup ----
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/chat-websocket",
      reconnectDelay: 500,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("Connected!");
        setConnected(true);

        // 1) Subscribe message room
        client.subscribe("/topic/messages", (msg: StompMessage) => {
          const body = JSON.parse(msg.body) as ChatMessage;
          setMessages((prev) => [...prev, body]);
        });

        // 2) Subscribe online users
        client.subscribe("/topic/onlineUsers", (msg: StompMessage) => {
          const users = JSON.parse(msg.body) as string[];
          setOnlineUsers(users);
        });

        // 3) JOIN room
        client.publish({
          destination: "/app/join",
          body: JSON.stringify({ username: userName }),
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userName]);

  // ---- Send Message ----
  const sendMessage = () => {
    if (!connected || !clientRef.current || message.trim() === "") return;

    const chatMessage: ChatMessage = {
      sender: userName,
      content: message,
      type: "CHAT",
    };

    clientRef.current.publish({
      destination: "/app/sendMessage",
      body: JSON.stringify(chatMessage),
    });

    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // ---- Logout ----
  const handleLogout = () => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/leave",
        body: JSON.stringify({ username: userName }),
      });
      clientRef.current.deactivate();
    }

    onLogout?.();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col bg-white rounded-xl shadow-lg w-full sm:w-[29rem] h-[700px]">

        {/* Header */}
        <div className="bg-blue-500 text-white p-4 rounded-t-xl text-center text-lg font-semibold">
          Chat Room
        </div>

        {/* Online Users */}
        <div className="p-3 bg-gray-200 border-b text-sm">
          <strong>Online:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {onlineUsers.map((u, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-green-100 text-green-700 rounded-full"
              >
                🟢 {u}
              </span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.type === "JOIN" ? (
                <p className="text-center text-gray-500 italic">{msg.content}</p>
              ) : msg.type === "LEAVE" ? (
                <p className="text-center text-red-500 italic">{msg.content}</p>
              ) : (
                <Message
                  sender={msg.sender}
                  content={msg.content}
                  isOwnMessage={msg.sender === userName}
                />
              )}
            </div>
          ))}
          <div ref={messageEndRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={message}
              ref={inputRef}
              placeholder="Type your message..."
              className="flex-1 p-3 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 text-center border-t bg-gray-50">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

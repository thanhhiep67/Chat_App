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
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // STOMP client setup
  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/chat-websocket",
      reconnectDelay: 500,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log("Connected to WebSocket server");
        setConnected(true);

        // Subscribe to message topic
        client.subscribe("/topic/messages", (msg: StompMessage) => {
          const body: ChatMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, body]);
        });

        // Send join message
        client.publish({
          destination: "/app/join",
          body: JSON.stringify({ username: userName }),
        });
      },
      onStompError: (frame) => {
        console.error("STOMP ERROR:", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userName]);

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col bg-white rounded-xl shadow-lg w-full sm:w-[29rem] h-[700px]">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-500 text-white p-4 rounded-t-xl text-center">
          Chat Room
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.type === "JOIN" ? (
                <div className="text-center text-gray-500 italic">
                  {msg.content}
                </div>
              ) : msg.type === "LEAVE" ? (
                <div className="text-center text-red-500 italic">
                  {msg.content}
                </div>
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
            onClick={() => {
              // Gửi leave message trước
              if (clientRef.current && clientRef.current.connected) {
                clientRef.current.publish({
                  destination: "/app/leave",
                  body: JSON.stringify({ username: userName }),
                });

                // Ngắt kết nối STOMP
                clientRef.current.deactivate();
              }

              // Gọi callback onLogout để chuyển trang
              if (onLogout) onLogout();
            }}
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

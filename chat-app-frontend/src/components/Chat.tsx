import React, { useEffect, useRef, useState } from "react";
import { Client, Message as StompMessage } from "@stomp/stompjs";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface ChatProps {
  userName: string;
  onLogout?: () => void;
}

interface ChatMessage {
  sender: string;
  receiver?: string;
  content: string;
  type: "JOIN" | "LEAVE" | "CHAT" | "PRIVATE";
}

type TabType = "room" | "private";

const Chat: React.FC<ChatProps> = ({ userName, onLogout }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("room");
  const [targetUser, setTargetUser] = useState<string | null>(null);

  const clientRef = useRef<Client | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const client = new Client({
      brokerURL: `ws://localhost:8080/chat-websocket?username=${userName}`,
      reconnectDelay: 500,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);

        client.subscribe("/topic/messages", (msg: StompMessage) => {
          const body = JSON.parse(msg.body) as ChatMessage;
          setMessages((prev) => [...prev, body]);
        });

        client.subscribe("/topic/onlineUsers", (msg: StompMessage) => {
          const users = JSON.parse(msg.body) as string[];
          setOnlineUsers(users);
        });

        client.subscribe("/user/queue/messages", (msg: StompMessage) => {
          const body = JSON.parse(msg.body) as ChatMessage;
          setMessages((prev) => [...prev, body]);
        });

        client.publish({
          destination: "/app/join",
          body: JSON.stringify({ username: userName }),
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [userName]);

  const sendRoomMessage = () => {
    if (!connected || !clientRef.current || message.trim() === "") return;
    const chatMessage: ChatMessage = { sender: userName, content: message, type: "CHAT" };
    clientRef.current.publish({ destination: "/app/sendMessage", body: JSON.stringify(chatMessage) });
    setMessage("");
  };

  const sendPrivateMessage = () => {
    if (!connected || !clientRef.current || message.trim() === "" || !targetUser) return;
    const chatMessage: ChatMessage = { 
      sender: userName, 
      receiver: targetUser, 
      content: message, 
      type: "PRIVATE" 
    };
    clientRef.current.publish({ destination: "/app/private-message", body: JSON.stringify(chatMessage) });
    
    // thêm vào UI ngay cho người gửi
    setMessages((prev) => [...prev, chatMessage]);
    setMessage("");
  };
  

  const handleLogout = () => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination: "/app/leave", body: JSON.stringify({ username: userName }) });
      clientRef.current.deactivate();
    }
    onLogout?.();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Khung chat gọn hơn */}
      <div className="flex h-[600px] w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 sm:w-1/4 bg-white border-r flex flex-col">
          {/* Current User */}
          <div className="p-4 border-b flex items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="ml-3 font-semibold">You: {userName}</span>
          </div>
  
          {/* Online Users */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <strong className="block mb-2">Online Users</strong>
            {onlineUsers
              .filter((u) => u !== userName)
              .map((u, idx) => {
                const isSelected = activeTab === "private" && targetUser === u;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveTab("private");
                      setTargetUser(u);
                    }}
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                      isSelected ? "bg-blue-100 border border-blue-400" : "hover:bg-gray-200"
                    }`}
                  >
                    <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
                      {u.charAt(0).toUpperCase()}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                    <span className="ml-3 text-gray-700">{u}</span>
                  </div>
                );
              })}
          </div>
  
          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
  
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {/* Header + Tabs */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
            <span className="font-semibold text-lg">Chat App</span>
            <div className="space-x-6">
              <button
                onClick={() => setActiveTab("room")}
                className={`pb-1 ${activeTab === "room" ? "border-b-2 border-white font-bold" : ""}`}
              >
                Room
              </button>
              <button
                onClick={() => setActiveTab("private")}
                className={`pb-1 ${activeTab === "private" ? "border-b-2 border-white font-bold" : ""}`}
              >
                Private
              </button>
            </div>
          </div>
  
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages
              .filter((msg) =>
                activeTab === "room"
                  ? msg.type !== "PRIVATE"
                  : msg.type === "PRIVATE" &&
                    ((msg.sender === userName && msg.receiver === targetUser) ||
                      (msg.sender === targetUser && msg.receiver === userName))
              )
              .map((msg, index) => (
                <div key={index}>
                  {msg.type === "JOIN" ? (
                    <p className="text-center text-gray-500 italic">{msg.content}</p>
                  ) : msg.type === "LEAVE" ? (
                    <p className="text-center text-red-500 italic">{msg.content}</p>
                  ) : (
                    <div className={`flex ${msg.sender === userName ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                          msg.sender === userName
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="block text-xs mt-1 opacity-70">
                          {msg.sender === userName ? "You" : msg.sender}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            <div ref={messageEndRef}></div>
          </div>
  
          {/* Input */}
          <div className="p-4 bg-gray-100 flex items-center space-x-2">
            <input
              type="text"
              value={message}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  activeTab === "room" ? sendRoomMessage() : sendPrivateMessage();
                }
              }}
            />
            <button
              onClick={activeTab === "room" ? sendRoomMessage : sendPrivateMessage}
              className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
    );  
};

export default Chat;

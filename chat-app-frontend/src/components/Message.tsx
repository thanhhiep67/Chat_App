import React from 'react';

interface MessageProps {
    sender: string;
    content: string;
    isOwnMessage: boolean
}

const Message: React.FC<MessageProps> = ({ sender, content, isOwnMessage }) => {
    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex flex-col max-w-[70%] p-3 rounded-2xl 
                ${isOwnMessage 
                    ? 'bg-blue-500 text-white rounded-br-none items-end' 
                    : 'bg-gray-200 text-gray-900 rounded-bl-none items-start'
                }`}
            >
                {/* Hiển thị tên người gửi nếu không phải mình */}
                {!isOwnMessage && (
                    <span className="text-sm font-semibold mb-1">{sender}</span>
                )}

                {/* Nội dung tin nhắn */}
                <span>{content}</span>
            </div>
        </div>
    );
};

export default Message;

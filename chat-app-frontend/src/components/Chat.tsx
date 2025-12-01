import { Stomp } from '@stomp/stompjs';
import React, { use, useEffect } from 'react';
import Message from './Message';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';


interface ChatProps{
    userName:string;
    onLogout?: () => void;
}
const Chat : React.FC<ChatProps> = ({userName, onLogout}) => {

    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<any[]>([]);
    const [stompClient, setStompClient] = React.useState<any>(null);
    const messageEndRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const HandleKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter'){

        }
    }
    const senMessage = () => {
        if(stompClient && message.trim() !== ''){
            const chatMessage = { dender:userName, content: message, type: 'CHAT' };
            stompClient.send('/app/chatMessage', {}, JSON.stringify(chatMessage));
            setMessage('');
            inputRef.current?.focus();
        }
    }
    
    useEffect(() => {
        const socket = new WebSocket('http://localhost:8080/chat-websocket');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('Connected to WebSocket server');
            client.send('/app/join', {}, JSON.stringify( userName));

            client.subscribe('/topic/message', (msg) => {
                setMessages( (prev) => [...prev, JSON.parse(msg.body)]);
            });

            setStompClient(client);
        });
        return () => {
            if(client) client.disconnect();
        }

    }, [userName]);
    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className='flex flex-col bg-white rounded-xl shadow-lg w-full sm:w-[29rem] h-[700px]'>
                <div className='flex justify-between items-center bg-blue-500 text-white p-4 rounded-t-xl text-center'>
                    Chat Room
                </div>
                {/* Messages */}
                <div className='flex-1 p-4 overflow-y-auto bg-gray-50 rounded-b-xl spacae-y-4 '>
                    {messages.map((message, index) => (
                        <div key={index} >
                            { message.type === 'JOIN' }? (
                                <div className='text-center text-gray-500 italic'>
                                </div>
                            ) :  message.type === 'LEAVE' ?(
                                <div className='text-red-500 italic'></div>
                            ) : (
                                <Message 
                                sender={message.sender}
                                content={message.content}
                                isOwnMessage={message.sender === userName}
                                />
                            )
                        </div>
                    ))}

                </div>
                {/* Input */}
                <div className='p-4 bg-gray-50 rounded-b-xl '>
                    <div className='flex items-center space-x-4'>
                        <input
                            type='text'
                            className='flex-1 p-3 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-300'
                            placeholder='Type your message...'
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={HandleKeyDown}
                        />
                        <button
                            onClick={senMessage}
                            className='p-2 text-white  bg-blue-500 rounded-full hover:bg-blue-600 transition duration-300'
                        >
                            <PaperAirplaneIcon className='w-6 h-6'/>
                        </button>
                    </div>
                </div>
                {/* Logout Button */}
                <div className='p-4 text-center border-t bg-gray-50'>
                    <button
                        onClick={onLogout}
                        className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300'
                    >
                        Logout
                    </button>

                </div>
            </div>
        </div>
      );
}

export default Chat;
import React from 'react';
interface MessageProps{
    sender:string;
    content:string;
    isOwnMessage:boolean
}

const  Message: React.FC<MessageProps> = ({sender, content, isOwnMessage}) => {
    return ( 
        <div>
            <span>{sender}</span>
            <p>{content}</p>
        </div>
     );
}

export default Message;
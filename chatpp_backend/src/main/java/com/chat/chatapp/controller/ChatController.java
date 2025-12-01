package com.chat.chatapp.controller;

import com.chat.chatapp.model.ChatMessage;
import com.chat.chatapp.model.JoinMessage;
import com.chat.chatapp.model.LeaveMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(ChatMessage message) {
        System.out.println(" Received message " + message);

        return message;
    }

    @MessageMapping("/leave")
    @SendTo("/topic/messages")
    public ChatMessage leave(LeaveMessage user) {
        ChatMessage newMessage = new ChatMessage();
        newMessage.setContent(user.getUsername() + " đã rời phòng chat.");
        newMessage.setSender("System");
        newMessage.setType("LEAVE");

        return newMessage;
    }

    @MessageMapping("/join")
    @SendTo("/topic/messages")
    public ChatMessage join(JoinMessage msg) {
        ChatMessage newMessage = new ChatMessage();
        newMessage.setContent(msg.getUsername() + " đã tham gia phòng chat.");
        newMessage.setSender("System");
        newMessage.setType("JOIN");
        return newMessage;
    }

}

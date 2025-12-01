package com.chat.chatapp.controller;

import com.chat.chatapp.model.ChatMessage;
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
    public ChatMessage leave(String username) {
        ChatMessage newMessage = new ChatMessage();
        newMessage.setContent(username + " đã rời phòng chat.");
        newMessage.setSender("System");
        newMessage.setType("LEAVE");

        return newMessage;
    }

    @MessageMapping("/join")
    @SendTo("/topic/messages")
    public ChatMessage join(String username) {
        ChatMessage newMessage = new ChatMessage();
        newMessage.setContent(username + " đã tham gia phòng chat.");
        newMessage.setSender("System");
        newMessage.setType("JOIN");

        return newMessage;
    }
}

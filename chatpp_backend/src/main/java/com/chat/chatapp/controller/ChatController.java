package com.chat.chatapp.controller;

import com.chat.chatapp.model.ChatMessage;
import com.chat.chatapp.model.JoinMessage;
import com.chat.chatapp.model.LeaveMessage;
import com.chat.chatapp.service.OnlineUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendMessage")
    public void sendMessage(ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/messages", message);
    }

    @MessageMapping("/join")
    public void join(JoinMessage msg, SimpMessageHeaderAccessor headerAccessor) {

        headerAccessor.getSessionAttributes().put("username", msg.getUsername());

        onlineUserService.addUser(msg.getUsername());

        // 1. Broadcast JOIN message
        ChatMessage joinMsg = new ChatMessage();
        joinMsg.setSender("System");
        joinMsg.setType("JOIN");
        joinMsg.setContent(msg.getUsername() + " đã tham gia phòng chat.");
        messagingTemplate.convertAndSend("/topic/messages", joinMsg);

        // 2. Broadcast danh sách online
        messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUserService.getOnlineUsers());
    }


    @MessageMapping("/leave")
    public void leave(LeaveMessage msg) {

        onlineUserService.removeUser(msg.getUsername());
        System.out.println("AFTER REMOVE: " + onlineUserService.getOnlineUsers());

        // 1. Broadcast LEAVE message
        ChatMessage leaveMsg = new ChatMessage();
        leaveMsg.setSender("System");
        leaveMsg.setType("LEAVE");
        leaveMsg.setContent(msg.getUsername() + " đã rời phòng chat.");
        messagingTemplate.convertAndSend("/topic/messages", leaveMsg);

        // 2. Broadcast danh sách online
        messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUserService.getOnlineUsers());
    }
}

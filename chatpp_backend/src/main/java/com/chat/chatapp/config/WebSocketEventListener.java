package com.chat.chatapp.config;

import com.chat.chatapp.service.OnlineUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private OnlineUserService onlineUserService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        System.out.println("New WebSocket connection detected");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) accessor.getSessionAttributes().get("username");

        if (username != null) {

           // Xóa từ service (Redis hoặc RAM)
            onlineUserService.removeUser(username);

            //  Broadcast danh sách sau khi cập nhật
            messagingTemplate.convertAndSend(
                    "/topic/onlineUsers",
                    onlineUserService.getOnlineUsers()
            );

            System.out.println("User disconnected: " + username);
        }
    }

    // Được gọi khi ChatController xử lý /join
    public void addOnlineUser(String username) {

        onlineUserService.addUser(username);

        messagingTemplate.convertAndSend(
                "/topic/onlineUsers",
                onlineUserService.getOnlineUsers()
        );
    }
}

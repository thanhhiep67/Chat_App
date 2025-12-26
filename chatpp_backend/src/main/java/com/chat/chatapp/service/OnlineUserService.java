package com.chat.chatapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;


@Service
@RequiredArgsConstructor
public class OnlineUserService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String ONLINE_SET = "online_users";

    public void addUser(String username) {
        redisTemplate.opsForSet().add(ONLINE_SET, username);
    }

    public void removeUser(String username) {
        redisTemplate.opsForSet().remove(ONLINE_SET, username);
    }

    public Set<String> getOnlineUsers() {
        Set<String> members = redisTemplate.opsForSet().members(ONLINE_SET);
        return members == null ? Collections.emptySet() : members;
    }
}

package com.chat.chatapp.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OnlineUserServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private SetOperations<String, String> setOperations;

    @InjectMocks
    private OnlineUserService onlineUserService;

    @Test
    void addUser_callsSAdd() {
        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        onlineUserService.addUser("alice");
        verify(setOperations, times(1)).add("online_users", "alice");
    }

    @Test
    void removeUser_callsSRem() {
        when(redisTemplate.opsForSet()).thenReturn(setOperations);

        onlineUserService.removeUser("bob");
        verify(setOperations, times(1)).remove("online_users", "bob");
    }

    @Test
    void getOnlineUsers_returnsSet_whenNonNull() {
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        Set<String> sample = new HashSet<>();
        sample.add("alice");
        when(setOperations.members("online_users")).thenReturn(sample);

        Set<String> result = onlineUserService.getOnlineUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.contains("alice"));
    }

    @Test
    void getOnlineUsers_returnsEmptySet_whenNull() {
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.members("online_users")).thenReturn(null);

        Set<String> result = onlineUserService.getOnlineUsers();

        assertNotNull(result);
        assertEquals(0, result.size());
    }
}

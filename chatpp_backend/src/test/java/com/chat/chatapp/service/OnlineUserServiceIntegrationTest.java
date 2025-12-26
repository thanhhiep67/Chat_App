package com.chat.chatapp.service;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.GenericContainer;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class OnlineUserServiceIntegrationTest {

    private GenericContainer<?> redis;

    private OnlineUserService onlineUserService;
    private LettuceConnectionFactory connectionFactory;

    @BeforeAll
    void setUp() {
        // Skip integration if Docker is not available on this machine
        assumeTrue(DockerClientFactory.instance().isDockerAvailable(), "Docker is required for this integration test");

        redis = new GenericContainer<>("redis:7.0.11").withExposedPorts(6379);
        redis.start();

        String host = redis.getHost();
        Integer port = redis.getMappedPort(6379);

        connectionFactory = new LettuceConnectionFactory(host, port);
        connectionFactory.afterPropertiesSet();

        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();

        onlineUserService = new OnlineUserService(template);
    }

    @AfterAll
    void tearDown() {
        if (connectionFactory != null) {
            connectionFactory.destroy();
        }
        if (redis != null && redis.isRunning()) {
            redis.stop();
        }
    }

    @Test
    void addAndRemoveUser_roundtrip() {
        onlineUserService.addUser("inttest-user");

        Set<String> members = onlineUserService.getOnlineUsers();
        assertTrue(members.contains("inttest-user"));

        onlineUserService.removeUser("inttest-user");

        Set<String> after = onlineUserService.getOnlineUsers();
        assertFalse(after.contains("inttest-user"));
    }
}

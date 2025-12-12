package com.chat.chatapp.service;

import com.chat.chatapp.model.User;

public interface UserService {
    User register(User user);
    User findByUsername(String username);

    User login(String username, String password);
}

package com.antigravity.controller;

import com.antigravity.model.ChatMessage;
import com.antigravity.repository.ChatMessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatWebSocketController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatWebSocketController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public ChatMessage sendMessage(ChatMessage message) {
        message.setCreatedAt(LocalDateTime.now());
        return chatMessageRepository.save(message);
    }
}

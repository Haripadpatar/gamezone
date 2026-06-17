package com.antigravity.repository;

import com.antigravity.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query(value = "SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 50", nativeQuery = true)
    List<ChatMessage> findRecentMessages();
}

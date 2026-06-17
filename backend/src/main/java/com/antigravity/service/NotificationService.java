package com.antigravity.service;

import com.antigravity.model.Notification;
import com.antigravity.model.User;
import com.antigravity.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification sendNotification(User user, String title, String desc, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .description(desc)
                .type(type)
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);

        // Send real-time notification to user via websocket
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getUsername(),
                    "/topic/notifications",
                    notification
            );
        } catch (Exception e) {
            // ignore
        }
        
        return notification;
    }
}

package com.antigravity.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    private String device;

    private String location;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

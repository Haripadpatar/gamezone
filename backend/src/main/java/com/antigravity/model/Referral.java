package com.antigravity.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "referrals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "referrer_id", referencedColumnName = "id", nullable = false)
    private User referrer;

    @ManyToOne
    @JoinColumn(name = "referee_id", referencedColumnName = "id", nullable = false)
    private User referee;

    @Column(name = "commission_earned")
    private BigDecimal commissionEarned = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

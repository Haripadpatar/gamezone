package com.antigravity.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "main_balance")
    private BigDecimal mainBalance = BigDecimal.valueOf(1000.00);

    @Column(name = "bonus_balance")
    private BigDecimal bonusBalance = BigDecimal.valueOf(250.00);

    @Column(name = "locked_balance")
    private BigDecimal lockedBalance = BigDecimal.ZERO;

    @Column(name = "practice_balance")
    private BigDecimal practiceBalance = BigDecimal.valueOf(10000.00);

    @Column(name = "referral_earnings")
    private BigDecimal referralEarnings = BigDecimal.ZERO;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}

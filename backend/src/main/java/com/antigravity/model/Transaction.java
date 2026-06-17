package com.antigravity.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wallet_id", referencedColumnName = "id", nullable = false)
    private Wallet wallet;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String type; // DEPOSIT, WITHDRAWAL, BONUS, REFERRAL

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, SUCCESS, FAILED

    @Column(name = "payment_method")
    private String paymentMethod; // UPI, CARD, NETBANKING, CRYPTO

    @Column(name = "transaction_reference", unique = true, nullable = false)
    private String transactionReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

package com.antigravity.service;

import com.antigravity.model.Transaction;
import com.antigravity.model.User;
import com.antigravity.model.Wallet;
import com.antigravity.repository.TransactionRepository;
import com.antigravity.repository.UserRepository;
import com.antigravity.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WalletService(
            WalletRepository walletRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> walletRepository.save(Wallet.builder()
                        .user(user)
                        .mainBalance(BigDecimal.valueOf(1000.00))
                        .bonusBalance(BigDecimal.valueOf(250.00))
                        .lockedBalance(BigDecimal.ZERO)
                        .practiceBalance(BigDecimal.valueOf(10000.00))
                        .referralEarnings(BigDecimal.ZERO)
                        .build()));
    }

    @Transactional
    public Transaction requestDeposit(Long userId, BigDecimal amount, String method, String reference) {
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for userId: " + userId));

        Transaction tx = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type("DEPOSIT")
                .status("PENDING")
                .paymentMethod(method)
                .transactionReference(reference)
                .createdAt(LocalDateTime.now())
                .build();

        tx = transactionRepository.save(tx);
        
        notificationService.sendNotification(
                wallet.getUser(),
                "Deposit Initiated",
                "Your deposit request of $" + String.format("%.2f", amount) + " is placed in the review queue.",
                "DEPOSIT"
        );

        return tx;
    }

    @Transactional
    public Transaction requestWithdrawal(Long userId, BigDecimal amount, String method, String accountDetails) {
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for userId: " + userId));

        if (wallet.getMainBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds in Main Balance.");
        }

        // Deduct from Main Balance, lock in escrow
        wallet.setMainBalance(wallet.getMainBalance().subtract(amount));
        wallet.setLockedBalance(wallet.getLockedBalance().add(amount));
        walletRepository.save(wallet);

        Transaction tx = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type("WITHDRAWAL")
                .status("PENDING")
                .paymentMethod(method)
                .transactionReference("WD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + " (" + accountDetails + ")")
                .createdAt(LocalDateTime.now())
                .build();

        tx = transactionRepository.save(tx);

        notificationService.sendNotification(
                wallet.getUser(),
                "Withdrawal Requested",
                "Withdrawal request of $" + String.format("%.2f", amount) + " submitted successfully.",
                "WITHDRAWAL"
        );

        return tx;
    }

    @Transactional
    public void cancelWithdrawal(Long userId, Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found."));

        if (!tx.getWallet().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized transaction cancellation.");
        }

        if (!"PENDING".equals(tx.getStatus())) {
            throw new IllegalArgumentException("Only pending withdrawals can be cancelled.");
        }

        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found."));

        // Unlock funds back to main balance
        wallet.setLockedBalance(wallet.getLockedBalance().subtract(tx.getAmount()));
        wallet.setMainBalance(wallet.getMainBalance().add(tx.getAmount()));
        walletRepository.save(wallet);

        tx.setStatus("FAILED"); // Mark as failed/cancelled
        transactionRepository.save(tx);

        notificationService.sendNotification(
                wallet.getUser(),
                "Withdrawal Cancelled",
                "Your withdrawal of $" + String.format("%.2f", tx.getAmount()) + " was cancelled. Funds returned to your Main Balance.",
                "WITHDRAWAL"
        );
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionHistory(Long userId) {
        return transactionRepository.findByWalletUserIdOrderByCreatedAtDesc(userId);
    }
}

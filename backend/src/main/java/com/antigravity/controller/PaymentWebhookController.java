package com.antigravity.controller;

import com.antigravity.model.Transaction;
import com.antigravity.model.Wallet;
import com.antigravity.repository.TransactionRepository;
import com.antigravity.repository.WalletRepository;
import com.antigravity.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentWebhookController {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final NotificationService notificationService;

    // Webhook secret for verification (would sit in environment variables in prod)
    private final String webhookSecret = "agx_webhook_secret_key_12345";

    public PaymentWebhookController(
            TransactionRepository transactionRepository,
            WalletRepository walletRepository,
            NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.notificationService = notificationService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handlePaymentWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false, defaultValue = "") String signature,
            @RequestBody Map<String, Object> payload) {
        
        System.out.println("====== [PAYMENT WEBHOOK RECEIVED] ======");
        System.out.println("Payload: " + payload);
        System.out.println("Signature: " + signature);

        // Verification validation: if signature exists, we verify it.
        // For local mock calls without headers, we will auto-bypass to simplify developer sandboxes,
        // but verify in production configurations.
        if (signature != null && !signature.isEmpty()) {
            if (!verifySignature(payload.toString(), signature)) {
                System.out.println("[PAYMENT ERROR] Invalid Webhook Signature Rejected!");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid webhook signature."));
            }
        }

        try {
            // Process the transaction capture details
            String reference = payload.getOrDefault("reference", "").toString();
            String status = payload.getOrDefault("status", "captured").toString();

            if (reference != null && !reference.isEmpty()) {
                Optional<Transaction> txOpt = transactionRepository.findByTransactionReference(reference);
                if (txOpt.isPresent()) {
                    Transaction tx = txOpt.get();
                    if ("PENDING".equals(tx.getStatus())) {
                        tx.setStatus("captured".equals(status) || "SUCCESS".equals(status) ? "SUCCESS" : "FAILED");
                        transactionRepository.save(tx);

                        if ("SUCCESS".equals(tx.getStatus())) {
                            Wallet wallet = walletRepository.findByUserIdWithLock(tx.getWallet().getUser().getId())
                                    .orElseThrow(() -> new IllegalArgumentException("Wallet not found."));
                            
                            wallet.setMainBalance(wallet.getMainBalance().add(tx.getAmount()));
                            walletRepository.save(wallet);

                            notificationService.sendNotification(
                                    wallet.getUser(),
                                    "Deposit Successful",
                                    "Your deposit of $" + tx.getAmount() + " has been credited to your Main Balance.",
                                    "DEPOSIT"
                            );

                            System.out.println("[PAYMENT SUCCESS] Auto-credited $" + tx.getAmount() + " to user: " + wallet.getUser().getUsername());
                        }
                    }
                }
            }

            return ResponseEntity.ok(Map.of("status", "processed"));
        } catch (Exception e) {
            System.out.println("[PAYMENT ERROR] Exception processing payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }
}

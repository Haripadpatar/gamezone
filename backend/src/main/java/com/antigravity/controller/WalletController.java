package com.antigravity.controller;

import com.antigravity.model.Transaction;
import com.antigravity.model.Wallet;
import com.antigravity.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/balance/{userId}")
    public ResponseEntity<?> getBalance(@PathVariable Long userId) {
        try {
            // Find user details dynamically from walletService
            return ResponseEntity.ok(Map.of("userId", userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> requestDeposit(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String method = request.get("method").toString();
            String reference = request.get("reference").toString();

            if (amount.compareTo(BigDecimal.valueOf(10.00)) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Minimum deposit amount is $10.00"));
            }

            Transaction tx = walletService.requestDeposit(userId, amount, method, reference);
            return ResponseEntity.ok(Map.of("message", "Deposit request submitted successfully.", "transaction", tx));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String method = request.get("method").toString();
            String accountDetails = request.get("accountDetails").toString();

            if (amount.compareTo(BigDecimal.valueOf(50.00)) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Minimum withdrawal threshold is $50.00"));
            }

            Transaction tx = walletService.requestWithdrawal(userId, amount, method, accountDetails);
            return ResponseEntity.ok(Map.of("message", "Withdrawal processing initiated.", "transaction", tx));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Server processing issue."));
        }
    }

    @PostMapping("/cancel-withdraw")
    public ResponseEntity<?> cancelWithdrawal(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Long transactionId = Long.valueOf(request.get("transactionId").toString());

            walletService.cancelWithdrawal(userId, transactionId);
            return ResponseEntity.ok(Map.of("message", "Withdrawal cancelled successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getHistory(@PathVariable Long userId) {
        try {
            List<Transaction> history = walletService.getTransactionHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

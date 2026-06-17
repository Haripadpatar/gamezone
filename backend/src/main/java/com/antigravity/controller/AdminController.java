package com.antigravity.controller;

import com.antigravity.model.*;
import com.antigravity.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final FAQRepository faqRepository;

    private double rtpPercentage = 95.0; // System RTP ratio config
    private final Map<String, Object> adStatus = new HashMap<>();

    public AdminController(
            UserRepository userRepository,
            WalletRepository walletRepository,
            TransactionRepository transactionRepository,
            FAQRepository faqRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.faqRepository = faqRepository;

        adStatus.put("popup", true);
        adStatus.put("banner", true);
        adStatus.put("sidebar", true);
        adStatus.put("rewarded", true);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        BigDecimal totalDeposits = transactionRepository.findAll().stream()
                .filter(tx -> "DEPOSIT".equals(tx.getType()) && "SUCCESS".equals(tx.getStatus()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWithdrawals = transactionRepository.findAll().stream()
                .filter(tx -> "WITHDRAWAL".equals(tx.getType()) && "SUCCESS".equals(tx.getStatus()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netRevenue = totalDeposits.subtract(totalWithdrawals);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalBetsVolume", totalDeposits.multiply(BigDecimal.valueOf(1.5))); // mock volume representation
        stats.put("totalWinPayouts", totalDeposits.multiply(BigDecimal.valueOf(1.42))); // matches RTP statistics
        stats.put("netRevenue", netRevenue);
        stats.put("houseRtp", rtpPercentage);
        stats.put("activeAds", adStatus);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/rtp")
    public ResponseEntity<?> updateRtp(@RequestBody Map<String, Double> request) {
        Double rtp = request.get("rtp");
        if (rtp == null || rtp < 50.0 || rtp > 99.9) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid RTP percentage. Must be between 50% and 99.9%"));
        }
        rtpPercentage = rtp;
        return ResponseEntity.ok(Map.of("message", "System RTP configured successfully.", "rtp", rtpPercentage));
    }

    @PostMapping("/ads/toggle")
    public ResponseEntity<?> toggleAd(@RequestBody Map<String, Object> request) {
        String placement = request.get("placement").toString();
        Boolean enabled = (Boolean) request.get("enabled");

        if (!adStatus.containsKey(placement)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid placement specifier."));
        }

        adStatus.put(placement, enabled);
        return ResponseEntity.ok(Map.of("message", "Ad status updated successfully.", "placement", placement, "enabled", enabled));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/kyc/approve/{userId}")
    public ResponseEntity<?> approveKyc(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setKycStatus("VERIFIED");
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "KYC Approved successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/kyc/reject/{userId}")
    public ResponseEntity<?> rejectKyc(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setKycStatus("UNVERIFIED");
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "KYC Rejected successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/withdrawals/pending")
    public ResponseEntity<?> getPendingWithdrawals() {
        List<Transaction> pending = transactionRepository.findAll().stream()
                .filter(tx -> "WITHDRAWAL".equals(tx.getType()) && "PENDING".equals(tx.getStatus()))
                .toList();
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/withdrawal/approve/{txId}")
    public ResponseEntity<?> approveWithdrawal(@PathVariable Long txId) {
        Optional<Transaction> txOpt = transactionRepository.findById(txId);
        if (txOpt.isPresent()) {
            Transaction tx = txOpt.get();
            if ("PENDING".equals(tx.getStatus()) && "WITHDRAWAL".equals(tx.getType())) {
                tx.setStatus("SUCCESS");
                transactionRepository.save(tx);

                Wallet wallet = walletRepository.findByUserId(tx.getWallet().getUser().getId()).get();
                wallet.setLockedBalance(wallet.getLockedBalance().subtract(tx.getAmount()));
                walletRepository.save(wallet);

                return ResponseEntity.ok(Map.of("message", "Withdrawal approved and finalized."));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid transaction or status."));
    }

    @PostMapping("/withdrawal/reject/{txId}")
    public ResponseEntity<?> rejectWithdrawal(@PathVariable Long txId) {
        Optional<Transaction> txOpt = transactionRepository.findById(txId);
        if (txOpt.isPresent()) {
            Transaction tx = txOpt.get();
            if ("PENDING".equals(tx.getStatus()) && "WITHDRAWAL".equals(tx.getType())) {
                tx.setStatus("FAILED");
                transactionRepository.save(tx);

                Wallet wallet = walletRepository.findByUserId(tx.getWallet().getUser().getId()).get();
                wallet.setLockedBalance(wallet.getLockedBalance().subtract(tx.getAmount()));
                wallet.setMainBalance(wallet.getMainBalance().add(tx.getAmount()));
                walletRepository.save(wallet);

                return ResponseEntity.ok(Map.of("message", "Withdrawal request rejected. Escrow returned to main balance."));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid transaction or status."));
    }

    @PostMapping("/cms/faq")
    public ResponseEntity<?> addFAQ(@RequestBody FAQ faq) {
        return ResponseEntity.ok(faqRepository.save(faq));
    }
}

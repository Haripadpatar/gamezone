package com.antigravity.controller;

import com.antigravity.model.User;
import com.antigravity.model.Wallet;
import com.antigravity.repository.UserRepository;
import com.antigravity.repository.WalletRepository;
import com.antigravity.security.JwtTokenProvider;
import com.antigravity.service.EmailService;
import com.antigravity.service.NotificationService;
import com.antigravity.service.OtpService;
import com.antigravity.service.SmsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationService notificationService;

    public AuthController(
            UserRepository userRepository,
            WalletRepository walletRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            OtpService otpService,
            EmailService emailService,
            SmsService smsService,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.otpService = otpService;
        this.emailService = emailService;
        this.smsService = smsService;
        this.notificationService = notificationService;

        // Auto-seed admin user if missing
        try {
            if (!userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@antigravity.io")
                        .passwordHash(passwordEncoder.encode("adminpassword123"))
                        .referralCode("ADM001")
                        .vipTier("DIAMOND")
                        .role("ADMIN")
                        .isActive(true)
                        .emailVerified(true)
                        .phoneVerified(true)
                        .kycStatus("VERIFIED")
                        .build();
                admin = userRepository.save(admin);

                Wallet wallet = Wallet.builder()
                        .user(admin)
                        .mainBalance(BigDecimal.valueOf(9999999.00))
                        .bonusBalance(BigDecimal.valueOf(0.00))
                        .lockedBalance(BigDecimal.ZERO)
                        .practiceBalance(BigDecimal.valueOf(9999999.00))
                        .referralEarnings(BigDecimal.ZERO)
                        .build();
                walletRepository.save(wallet);
            }
        } catch (Exception e) {
            // Seeding log fails silently in test classes
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String referredBy = request.get("referredBy");

        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, email and password are required."));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is already taken."));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered."));
        }

        String newRefCode = username.toUpperCase().substring(0, Math.min(username.length(), 4)) + (int)(Math.random() * 900 + 100);
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .referralCode(newRefCode)
                .referredBy(referredBy)
                .vipTier("BRONZE")
                .role("USER")
                .isActive(true)
                .emailVerified(false)
                .phoneVerified(false)
                .kycStatus("UNVERIFIED")
                .security2Fa(false)
                .build();
        user = userRepository.save(user);

        Wallet wallet = Wallet.builder()
                .user(user)
                .mainBalance(BigDecimal.valueOf(1000.00))
                .bonusBalance(BigDecimal.valueOf(250.00))
                .lockedBalance(BigDecimal.ZERO)
                .practiceBalance(BigDecimal.valueOf(10000.00))
                .referralEarnings(BigDecimal.ZERO)
                .build();
        walletRepository.save(wallet);

        notificationService.sendNotification(user, "Welcome to AGX!", "Your secure game wallets have been created successfully.", "SYSTEM");

        String jwt = tokenProvider.generateToken(user.getUsername(), user.getRole());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required."));
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            // Auto register to make local UX testing frictionless
            Map<String, String> regReq = new HashMap<>();
            regReq.put("username", username);
            regReq.put("email", username + "@antigravity.io");
            regReq.put("password", password);
            return registerUser(regReq);
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid password details."));
        }

        String jwt = tokenProvider.generateToken(user.getUsername(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/otp/send-email")
    public ResponseEntity<?> sendEmailOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Email parameter is required."));

        String code = otpService.generateOtp("EMAIL_" + email);
        emailService.sendEmailOtp(email, code);
        return ResponseEntity.ok(Map.of("message", "OTP sent to your email."));
    }

    @PostMapping("/otp/verify-email")
    public ResponseEntity<?> verifyEmailOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("otp");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP parameters are required."));
        }

        boolean isValid = otpService.verifyOtp("EMAIL_" + email, code);
        if (isValid) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setEmailVerified(true);
                userRepository.save(user);
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Email verified."));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired email OTP."));
    }

    @PostMapping("/otp/send-phone")
    public ResponseEntity<?> sendPhoneOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        if (phone == null) return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required."));

        String code = otpService.generateOtp("PHONE_" + phone);
        smsService.sendSmsOtp(phone, code);
        return ResponseEntity.ok(Map.of("message", "OTP sent via SMS."));
    }

    @PostMapping("/otp/verify-phone")
    public ResponseEntity<?> verifyPhoneOtp(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String phone = request.get("phone");
        String code = request.get("otp");

        if (phone == null || code == null || username == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, phone, and OTP are required."));
        }

        boolean isValid = otpService.verifyOtp("PHONE_" + phone, code);
        if (isValid) {
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPhoneVerified(true);
                userRepository.save(user);
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Phone verified."));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired SMS OTP."));
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Email address is required."));

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No account associated with that email."));
        }

        String code = otpService.generateOtp("RESET_" + email);
        emailService.sendEmailOtp(email, code);
        return ResponseEntity.ok(Map.of("message", "Reset code sent successfully."));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || code == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, reset code, and new password are required."));
        }

        boolean isValid = otpService.verifyOtp("RESET_" + email, code);
        if (isValid) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPasswordHash(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset code."));
    }
}

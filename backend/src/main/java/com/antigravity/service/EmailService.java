package com.antigravity.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmailOtp(String to, String otp) {
        String subject = "Your AGX Security Verification Code";
        String body = "Hello,\n\nYour AGX security code is: " + otp + "\n\nIt is valid for 5 minutes. If you did not request this, please secure your account credentials.\n\nBest regards,\nAGX Security Team";

        System.out.println("====== [SIMULATED EMAIL SENDER] ======");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body:\n" + body);
        System.out.println("======================================");

        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
            }
        } catch (Exception e) {
            // Graceful degradation
        }
    }
}

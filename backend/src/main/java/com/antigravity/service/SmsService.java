package com.antigravity.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {

    public void sendSmsOtp(String phone, String otp) {
        String messageBody = "Your AGX Security Verification OTP is: " + otp + " (expires in 5 minutes).";

        System.out.println("====== [SIMULATED SMS SENDER] ======");
        System.out.println("To: " + phone);
        System.out.println("Message: " + messageBody);
        System.out.println("=====================================");

        // In production, this would make an HTTP request to Twilio or Vonage SMS API.
    }
}

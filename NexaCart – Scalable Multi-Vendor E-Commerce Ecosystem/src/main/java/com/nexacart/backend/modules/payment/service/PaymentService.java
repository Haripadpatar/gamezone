package com.nexacart.backend.modules.payment.service;

import com.nexacart.backend.modules.payment.dto.PaymentVerificationRequest;

public interface PaymentService {
    
    void verifyPayment(PaymentVerificationRequest request);
}

package com.nexacart.backend.modules.auth.service;

import com.nexacart.backend.modules.auth.dto.JwtResponse;
import com.nexacart.backend.modules.auth.dto.LoginRequest;
import com.nexacart.backend.modules.auth.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;

public interface AuthService {
    
    void register(RegisterRequest request);
    
    LoginResult login(LoginRequest request);
    
    JwtResponse refresh(HttpServletRequest request);
    
    ResponseCookie logout();

    record LoginResult(JwtResponse jwtResponse, ResponseCookie refreshCookie) {}
}

package com.nonvegshop.delivery.service;

import com.nonvegshop.delivery.config.JwtUtils;
import com.nonvegshop.delivery.dto.AuthResponse;
import com.nonvegshop.delivery.dto.LoginRequest;
import com.nonvegshop.delivery.dto.RegisterRequest;
import com.nonvegshop.delivery.entity.User;
import com.nonvegshop.delivery.exception.BadRequestException;
import com.nonvegshop.delivery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number is already registered.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("CUSTOMER"); // Default registered user role

        userRepository.save(user);

        // Auto authenticate after registration
        return login(new LoginRequest() {{
            setPhone(request.getPhone());
            setPassword(request.getPassword());
        }});
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhone(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = (User) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(user);

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getRole()
        );
    }
}

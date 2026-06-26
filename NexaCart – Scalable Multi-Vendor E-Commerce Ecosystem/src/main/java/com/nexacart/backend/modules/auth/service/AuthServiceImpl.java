package com.nexacart.backend.modules.auth.service;

import com.nexacart.backend.global.exception.AppException;
import com.nexacart.backend.global.security.JwtUtils;
import com.nexacart.backend.global.security.UserDetailsImpl;
import com.nexacart.backend.modules.auth.dto.JwtResponse;
import com.nexacart.backend.modules.auth.dto.LoginRequest;
import com.nexacart.backend.modules.auth.dto.RegisterRequest;
import com.nexacart.backend.modules.user.model.ERole;
import com.nexacart.backend.modules.user.model.Role;
import com.nexacart.backend.modules.user.model.User;
import com.nexacart.backend.modules.user.model.UserStatus;
import com.nexacart.backend.modules.user.repository.RoleRepository;
import com.nexacart.backend.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email is already taken");
        }

        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Default user role not initialized"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .status(UserStatus.ACTIVE)
                .role(customerRole)
                .build();

        userRepository.save(user);
        log.info("Successfully registered user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public LoginResult login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        String accessToken = jwtUtils.generateAccessToken(userPrincipal);
        String refreshToken = jwtUtils.generateRefreshToken(userPrincipal.getUsername());
        ResponseCookie refreshCookie = jwtUtils.generateRefreshCookie(refreshToken);

        JwtResponse jwtResponse = JwtResponse.builder()
                .token(accessToken)
                .id(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .firstName(userPrincipal.getFirstName())
                .lastName(userPrincipal.getLastName())
                .role(userPrincipal.getAuthorities().iterator().next().getAuthority())
                .build();

        log.info("Successfully authenticated user: {}", request.getEmail());
        return new LoginResult(jwtResponse, refreshCookie);
    }

    @Override
    @Transactional(readOnly = true)
    public JwtResponse refresh(HttpServletRequest request) {
        String refreshToken = jwtUtils.getRefreshFromCookies(request);
        
        if (refreshToken == null || !jwtUtils.validateJwtToken(refreshToken)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        String email = jwtUtils.getUsernameFromJwtToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(HttpStatus.FORBIDDEN, "User account is inactive");
        }

        UserDetailsImpl userPrincipal = UserDetailsImpl.build(user);
        String newAccessToken = jwtUtils.generateAccessToken(userPrincipal);

        return JwtResponse.builder()
                .token(newAccessToken)
                .id(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .firstName(userPrincipal.getFirstName())
                .lastName(userPrincipal.getLastName())
                .role(userPrincipal.getAuthorities().iterator().next().getAuthority())
                .build();
    }

    @Override
    public ResponseCookie logout() {
        return jwtUtils.getCleanRefreshCookie();
    }
}

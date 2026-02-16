package com.nexus.estates.controller;

import com.nexus.estates.dto.LoginRequest;
import com.nexus.estates.dto.RegisterRequest;
import com.nexus.estates.dto.AuthResponde;
import com.nexus.estates.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponde> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponde> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
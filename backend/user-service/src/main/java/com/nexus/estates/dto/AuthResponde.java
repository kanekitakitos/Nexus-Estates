package com.nexus.estates.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponde {
    private String token;
    private UUID id;
    private String email;
    private String role;
}

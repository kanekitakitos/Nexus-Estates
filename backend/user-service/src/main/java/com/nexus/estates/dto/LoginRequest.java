package com.nexus.estates.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AllArgsConstructor;


@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class LoginRequest {


    private String email;


    private String password;
}

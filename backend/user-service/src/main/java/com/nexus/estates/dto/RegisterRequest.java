package com.nexus.estates.dto;

import com.nexus.estates.entity.UserRole;
import lombok.Data;

@Data
public class RegisterRequest {


    private String email;


    private String password;

    private String phone;


    private UserRole role;
}

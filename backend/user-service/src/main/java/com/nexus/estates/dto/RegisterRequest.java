package com.nexus.estates.dto;

import com.nexus.estates.entity.UserRole;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    private String phone;

    @NotNull(message = "Role cannot be null")
    private UserRole role;
}

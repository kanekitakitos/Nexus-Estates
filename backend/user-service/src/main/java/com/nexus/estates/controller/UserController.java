package com.nexus.estates.controller;

import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

import java.util.UUID;

@RestController
@RequestMapping("/user")
public class UserController
{

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user){
        return userRepository.save(user);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));
    }

}

package com.nexus.estates.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GuestProfileResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String internalNotes;
    private List<String> tags;
}

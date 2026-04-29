package com.nexus.estates.dto;

import lombok.Data;
import java.util.List;

@Data
public class GuestProfileRequest {
    private String internalNotes;
    private List<String> tags;
}

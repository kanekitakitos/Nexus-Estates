package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.util.List;

@Entity
@Table(name = "guest_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Audited
public class GuestProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String internalNotes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "guest_profile_tags", joinColumns = @JoinColumn(name = "guest_profile_id"))
    @Column(name = "tag")
    private List<String> tags;
}

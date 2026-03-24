package com.nexus.estates.repository;

import com.nexus.estates.entity.PropertyChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyChangeLogRepository extends JpaRepository<PropertyChangeLog, Long> {
    List<PropertyChangeLog> findByPropertyIdOrderByChangedAtDesc(Long propertyId);
}

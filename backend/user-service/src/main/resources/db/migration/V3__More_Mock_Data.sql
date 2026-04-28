-- More users with BCrypt password (password123)
-- $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy

INSERT INTO users (email, password, role, phone)
VALUES 
    ('admin2@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'ADMIN', '+351910000004'),
    ('owner1@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'OWNER', '+351910000005'),
    ('owner2@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'OWNER', '+351910000006'),
    ('owner3@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'OWNER', '+351910000007'),
    ('guest1@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000001'),
    ('guest2@yahoo.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000002'),
    ('guest3@outlook.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000003'),
    ('guest4@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000004'),
    ('guest5@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000005'),
    ('guest6@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000006'),
    ('guest7@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000007'),
    ('guest8@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000008'),
    ('guest9@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000009'),
    ('guest10@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351920000010'),
    ('staff1@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'STAFF', '+351930000001'),
    ('staff2@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'STAFF', '+351930000002')
ON CONFLICT (email) DO NOTHING;

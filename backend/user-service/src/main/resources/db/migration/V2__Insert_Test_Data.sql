-- Insercao de utilizadores iniciais com passwords BCrypt (password123)
-- u1: Brandon (Admin), u2: Luis (Owner), u3: Miguel (GUEST)

INSERT INTO users (email, password, role, phone)
VALUES 
    ('brandon@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'ADMIN', '+351910000001'),
    ('luis@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'OWNER', '+351910000002'),
    ('miguel@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'GUEST', '+351910000003')
ON CONFLICT (email) DO NOTHING;

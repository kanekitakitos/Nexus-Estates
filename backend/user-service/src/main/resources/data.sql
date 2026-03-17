-- Insercao de utilizadores iniciais com passwords BCrypt (password123)
-- u1: Brandon (Admin), u2: Luis (Owner), u3: Miguel (User)

INSERT INTO users (id, email, password, role, full_name, created_at)
VALUES 
    ('u1', 'brandon@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'ADMIN', 'Brandon Administrator', NOW()),
    ('u2', 'luis@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'OWNER', 'Luis Property Owner', NOW()),
    ('u3', 'miguel@nexus.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.z.icLfy', 'USER', 'Miguel Guest', NOW())
ON CONFLICT (email) DO NOTHING;

-- Seed global 'Dev' user for E2E testing
-- User ID: 999 

-- Insert User 999
INSERT INTO users (id, email, password, phone, role, clerk_user_id)
VALUES (
    999, 
    'dev@nexus.com', 
    '$2b$10$CY4VsA1kHAxPO/K9vZHDBuAic2mdR0JWBD3DTl7Dnb36ypXhUr.AC', -- '12345' bcrypt hash
    '+351999999999', 
    'OWNER', 
    'user_2devTester'
) ON CONFLICT (email) DO UPDATE 
SET clerk_user_id = 'user_2devTester', role='OWNER';

-- Update sequence to prevent collision
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users') THEN
      PERFORM setval(pg_get_serial_sequence('users', 'id'), 10000);
   END IF;
END $$;

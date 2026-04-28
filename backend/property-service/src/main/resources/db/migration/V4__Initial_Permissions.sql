-- Add constraint to ensure access_level matches Java Enum
ALTER TABLE property_permissions DROP CONSTRAINT IF EXISTS property_permissions_access_level_check;
ALTER TABLE property_permissions ADD CONSTRAINT property_permissions_access_level_check CHECK (access_level IN ('PRIMARY_OWNER', 'MANAGER', 'STAFF'));

-- Assign properties to owners
-- Owners from user-service: Luis (ID 2), owner1 (ID 5), owner2 (ID 6), owner3 (ID 7)

-- Property permissions sequence is property_permissions_seq

-- Luis (ID 2) owns the first 3 properties
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 1, 2, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 2, 2, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 3, 2, 'PRIMARY_OWNER');

-- Owner1 (ID 5) owns properties 4-7
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 4, 5, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 5, 5, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 6, 5, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 7, 5, 'PRIMARY_OWNER');

-- Owner2 (ID 6) owns properties 8-11
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 8, 6, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 9, 6, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 10, 6, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 11, 6, 'PRIMARY_OWNER');

-- Owner3 (ID 7) owns properties 12-15
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 12, 7, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 13, 7, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 14, 7, 'PRIMARY_OWNER'),
    (nextval('property_permissions_seq'), 15, 7, 'PRIMARY_OWNER');

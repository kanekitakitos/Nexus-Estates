-- Assign properties to owners
-- Owners from user-service: Luis (ID 2), owner1 (ID 5), owner2 (ID 6), owner3 (ID 7)

-- Property permissions sequence is property_permissions_seq

-- Luis (ID 2) owns the first 3 properties
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 1, 2, 'OWNER'),
    (nextval('property_permissions_seq'), 2, 2, 'OWNER'),
    (nextval('property_permissions_seq'), 3, 2, 'OWNER');

-- owner1 (ID 5) owns properties 4-8
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 4, 5, 'OWNER'),
    (nextval('property_permissions_seq'), 5, 5, 'OWNER'),
    (nextval('property_permissions_seq'), 6, 5, 'OWNER'),
    (nextval('property_permissions_seq'), 7, 5, 'OWNER'),
    (nextval('property_permissions_seq'), 8, 5, 'OWNER');

-- owner2 (ID 6) owns properties 9-13
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 9, 6, 'OWNER'),
    (nextval('property_permissions_seq'), 10, 6, 'OWNER'),
    (nextval('property_permissions_seq'), 11, 6, 'OWNER'),
    (nextval('property_permissions_seq'), 12, 6, 'OWNER'),
    (nextval('property_permissions_seq'), 13, 6, 'OWNER');

-- owner3 (ID 7) owns properties 14-18
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (nextval('property_permissions_seq'), 14, 7, 'OWNER'),
    (nextval('property_permissions_seq'), 15, 7, 'OWNER'),
    (nextval('property_permissions_seq'), 16, 7, 'OWNER'),
    (nextval('property_permissions_seq'), 17, 7, 'OWNER'),
    (nextval('property_permissions_seq'), 18, 7, 'OWNER');

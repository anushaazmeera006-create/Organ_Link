CREATE DATABASE IF NOT EXISTS organ_system;
USE organ_system;

-- 1. Tables
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS person (
    person_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT CHECK (age > 0),
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    phone VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS donor (
    donor_id INT PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'active',
    consent BOOLEAN NOT NULL,
    FOREIGN KEY (donor_id) REFERENCES person(person_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipient (
    recipient_id INT PRIMARY KEY,
    organ_needed VARCHAR(50),
    urgency_level INT CHECK (urgency_level BETWEEN 1 AND 5),
    waiting_time INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'waiting',
    FOREIGN KEY (recipient_id) REFERENCES person(person_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS organ (
    organ_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT,
    organ_type VARCHAR(50),
    availability_status VARCHAR(20) DEFAULT 'available',
    expiry_time DATETIME,
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS hospital (
    hospital_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    location VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS match_table (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT,
    recipient_id INT,
    organ_id INT,
    hospital_id INT,
    match_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id),
    FOREIGN KEY (recipient_id) REFERENCES recipient(recipient_id),
    FOREIGN KEY (organ_id) REFERENCES organ(organ_id),
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

CREATE TABLE IF NOT EXISTS waiting_list (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT,
    priority_score FLOAT,
    rank_position INT,
    FOREIGN KEY (recipient_id) REFERENCES recipient(recipient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- 2. View for Potential Matches
CREATE OR REPLACE VIEW view_potential_matches AS
SELECT 
    o.organ_id, o.organ_type,
    p1.name AS donor_name, p1.age AS donor_age, p1.blood_group,
    p2.name AS recipient_name, p2.age AS recipient_age,
    r.urgency_level,
    ABS(p1.age - p2.age) AS age_diff,
    o.expiry_time
FROM organ o
JOIN person p1 ON o.donor_id = p1.person_id
JOIN recipient r ON o.organ_type = r.organ_needed
JOIN person p2 ON r.recipient_id = p2.person_id
WHERE o.availability_status = 'available' 
  AND r.status = 'waiting'
  AND p1.blood_group = p2.blood_group
  AND o.expiry_time > NOW();

-- 3. Stored Procedure for Matching
DELIMITER //
CREATE PROCEDURE perform_priority_matching()
BEGIN
    DECLARE v_organ_id, v_recipient_id, v_donor_id INT;
    
    START TRANSACTION;

    -- Update expired
    UPDATE organ SET availability_status = 'expired' 
    WHERE expiry_time <= NOW() AND availability_status = 'available';

    -- Find best match
    SELECT o.organ_id, r.recipient_id, d.donor_id INTO v_organ_id, v_recipient_id, v_donor_id
    FROM organ o
    JOIN donor d ON o.donor_id = d.donor_id
    JOIN person p1 ON d.donor_id = p1.person_id
    JOIN recipient r ON o.organ_type = r.organ_needed
    JOIN person p2 ON r.recipient_id = p2.person_id
    WHERE o.availability_status = 'available' AND r.status = 'waiting'
      AND p1.blood_group = p2.blood_group AND o.expiry_time > NOW()
    ORDER BY r.urgency_level DESC, ABS(p1.age - p2.age) ASC LIMIT 1;

    IF v_organ_id IS NOT NULL THEN
        INSERT INTO match_table (donor_id, recipient_id, organ_id, hospital_id, status)
        VALUES (v_donor_id, v_recipient_id, v_organ_id, 1, 'completed');

        UPDATE organ SET availability_status = 'allocated' WHERE organ_id = v_organ_id;
        UPDATE recipient SET status = 'completed' WHERE recipient_id = v_recipient_id;
        INSERT INTO audit_log (action, details) VALUES ('Match', 'Automated match found');
        SELECT 'SUCCESS' AS result;
    ELSE
        SELECT 'NO_MATCH' AS result;
    END IF;

    COMMIT;
END //
DELIMITER ;
-- Create country table
CREATE TABLE country (
    id BIGINT NOT NULL AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone_prefix VARCHAR(10),
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_country_uuid (uuid),
    INDEX idx_country_code (code)
);

-- Create headquarter table
CREATE TABLE headquarter (
    id BIGINT NOT NULL AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    country_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_headquarter_uuid (uuid),
    INDEX idx_headquarter_country_id (country_id),
    CONSTRAINT fk_headquarter_country FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE
);

-- Create department table
CREATE TABLE department (
    id BIGINT NOT NULL AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    country_id BIGINT NOT NULL,
    headquarter_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_department_uuid (uuid),
    INDEX idx_department_country_id (country_id),
    INDEX idx_department_headquarter_id (headquarter_id),
    CONSTRAINT fk_department_country FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE,
    CONSTRAINT fk_department_headquarter FOREIGN KEY (headquarter_id) REFERENCES headquarter(id) ON DELETE CASCADE
);

-- Insert sample data for countries
INSERT INTO country (uuid, name, phone_prefix, code) VALUES
(UUID(), 'South Korea', '+82', 'KR'),
(UUID(), 'United States', '+1', 'US'),
(UUID(), 'Japan', '+81', 'JP'),
(UUID(), 'China', '+86', 'CN'),
(UUID(), 'Germany', '+49', 'DE'),
(UUID(), 'United Kingdom', '+44', 'GB');

-- Insert sample data for headquarters
INSERT INTO headquarter (uuid, country_id, name) VALUES
(UUID(), 1, 'Seoul Central Office'),
(UUID(), 1, 'Busan Regional Office'),
(UUID(), 2, 'New York Headquarters'),
(UUID(), 2, 'Los Angeles Branch'),
(UUID(), 3, 'Tokyo Main Office'),
(UUID(), 4, 'Beijing Central Office'),
(UUID(), 5, 'Berlin Headquarters'),
(UUID(), 6, 'London Main Office');

-- Insert sample data for departments
INSERT INTO department (uuid, country_id, headquarter_id, name) VALUES
(UUID(), 1, 1, 'Cyber Crime Investigation'),
(UUID(), 1, 1, 'Intellectual Property Protection'),
(UUID(), 1, 1, 'International Cooperation'),
(UUID(), 1, 2, 'Regional Investigation Unit'),
(UUID(), 2, 3, 'Digital Forensics'),
(UUID(), 2, 3, 'Copyright Enforcement'),
(UUID(), 2, 4, 'West Coast Operations'),
(UUID(), 3, 5, 'IP Investigation Division'),
(UUID(), 4, 6, 'Anti-Piracy Department'),
(UUID(), 5, 7, 'Cyber Security Unit'),
(UUID(), 6, 8, 'International Investigation');

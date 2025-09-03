-- Create country table
CREATE TABLE country (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone_prefix VARCHAR(10),
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for country table
CREATE INDEX idx_country_uuid ON country(uuid);
CREATE INDEX idx_country_code ON country(code);

-- Create headquarter table
CREATE TABLE headquarter (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    country_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_headquarter_country FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE
);

-- Create indexes for headquarter table
CREATE INDEX idx_headquarter_uuid ON headquarter(uuid);
CREATE INDEX idx_headquarter_country_id ON headquarter(country_id);

-- Create department table
CREATE TABLE department (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    country_id BIGINT NOT NULL,
    headquarter_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department_country FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE,
    CONSTRAINT fk_department_headquarter FOREIGN KEY (headquarter_id) REFERENCES headquarter(id) ON DELETE CASCADE
);

-- Create indexes for department table
CREATE INDEX idx_department_uuid ON department(uuid);
CREATE INDEX idx_department_country_id ON department(country_id);
CREATE INDEX idx_department_headquarter_id ON department(headquarter_id);

-- Insert sample data for countries
INSERT INTO country (name, phone_prefix, code) VALUES
('South Korea', '+82', 'KR'),
('United States', '+1', 'US'),
('Japan', '+81', 'JP'),
('China', '+86', 'CN'),
('Germany', '+49', 'DE'),
('United Kingdom', '+44', 'GB');

-- Insert sample data for headquarters
INSERT INTO headquarter (country_id, name) VALUES
(1, 'Seoul Central Office'),
(1, 'Busan Regional Office'),
(2, 'New York Headquarters'),
(2, 'Los Angeles Branch'),
(3, 'Tokyo Main Office'),
(4, 'Beijing Central Office'),
(5, 'Berlin Headquarters'),
(6, 'London Main Office');

-- Insert sample data for departments
INSERT INTO department (country_id, headquarter_id, name) VALUES
(1, 1, 'Cyber Crime Investigation'),
(1, 1, 'Intellectual Property Protection'),
(1, 1, 'International Cooperation'),
(1, 2, 'Regional Investigation Unit'),
(2, 3, 'Digital Forensics'),
(2, 3, 'Copyright Enforcement'),
(2, 4, 'West Coast Operations'),
(3, 5, 'IP Investigation Division'),
(4, 6, 'Anti-Piracy Department'),
(5, 7, 'Cyber Security Unit'),
(6, 8, 'International Investigation');

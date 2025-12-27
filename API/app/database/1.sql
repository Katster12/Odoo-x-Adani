CREATE DATABASE IF NOT EXISTS maintenance_tracker;

CREATE TABLE IF NOT EXISTS Version (
    version INT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user (
    userid BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role ENUM('USER', 'TECHNICIAN', 'ADMIN') NOT NULL DEFAULT 'USER',
    email VARCHAR(190) NOT NULL UNIQUE,
    name VARCHAR(120),
    password VARCHAR(255),
    isVerified TINYINT(1) DEFAULT 0,
    lastLogin DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS dept (
    deptid BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    deptname VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deptname (deptname)
);

CREATE TABLE IF NOT EXISTS maintenanceteam (
    maintenanceid BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    `desc` VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

CREATE TABLE IF NOT EXISTS equipment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    srno VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(120),
    purchasedate DATE,
    warrentyenddate DATE,
    location VARCHAR(190),
    deptid BIGINT UNSIGNED,
    maintenanceid BIGINT UNSIGNED,
    technicianuserid BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deptid) REFERENCES dept(deptid) ON DELETE SET NULL,
    FOREIGN KEY (maintenanceid) REFERENCES maintenanceteam(maintenanceid) ON DELETE SET NULL,
    FOREIGN KEY (technicianuserid) REFERENCES user(userid) ON DELETE SET NULL,
    INDEX idx_srno (srno),
    INDEX idx_deptid (deptid),
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_maintenanceid (maintenanceid),
    INDEX idx_technicianuserid (technicianuserid)
);

CREATE TABLE IF NOT EXISTS teamname (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userid BIGINT UNSIGNED NOT NULL,
    maintenanceid BIGINT UNSIGNED NOT NULL,
    islead TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES user(userid) ON DELETE CASCADE,
    FOREIGN KEY (maintenanceid) REFERENCES maintenanceteam(maintenanceid) ON DELETE CASCADE,
    UNIQUE KEY unique_user_team (userid, maintenanceid),
    INDEX idx_userid (userid),
    INDEX idx_maintenanceid (maintenanceid),
    INDEX idx_islead (islead)
);

CREATE TABLE IF NOT EXISTS maintenancereq (
    reqid BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type ENUM('CORRECTIVE', 'PREVENTIVE') NOT NULL,
    stage ENUM('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP') NOT NULL DEFAULT 'NEW',
    priority ENUM('HIGH', 'MED', 'LOW') NOT NULL,
    subject VARCHAR(220) NOT NULL,
    description TEXT,
    equipmentid BIGINT UNSIGNED NOT NULL,
    maintenanceid BIGINT UNSIGNED,
    assigneduserid BIGINT UNSIGNED,
    createduserid BIGINT UNSIGNED NOT NULL,
    scheduleddate DATETIME,
    duedate DATETIME,
    startedat DATETIME,
    completedat DATETIME,
    hoursspent DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipmentid) REFERENCES equipment(id) ON DELETE RESTRICT,
    FOREIGN KEY (maintenanceid) REFERENCES maintenanceteam(maintenanceid) ON DELETE SET NULL,
    FOREIGN KEY (assigneduserid) REFERENCES user(userid) ON DELETE SET NULL,
    FOREIGN KEY (createduserid) REFERENCES user(userid) ON DELETE RESTRICT,
    INDEX idx_equipmentid (equipmentid),
    INDEX idx_maintenanceid (maintenanceid),
    INDEX idx_assigneduserid (assigneduserid),
    INDEX idx_createduserid (createduserid),
    INDEX idx_stage (stage),
    INDEX idx_priority (priority),
    INDEX idx_type (type),
    INDEX idx_scheduleddate (scheduleddate),
    INDEX idx_duedate (duedate)
);

CREATE TABLE IF NOT EXISTS VerificationCode (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL,
    expiresOn DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(userid) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_code (code)
);

CREATE TABLE IF NOT EXISTS PasswordResetCode (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL,
    expiresOn DATETIME NOT NULL,
    isCodeUsed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(userid) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_code (code),
    INDEX idx_isCodeUsed (isCodeUsed)
);

INSERT INTO Version (version) VALUES (1);

ALTER TABLE equipment
ADD CONSTRAINT fk_equipment_maintenanceid FOREIGN KEY (maintenanceid) REFERENCES maintenanceteam(maintenanceid) ON DELETE SET NULL,
ADD CONSTRAINT fk_equipment_technicianuserid FOREIGN KEY (technicianuserid) REFERENCES user(userid) ON DELETE SET NULL;

INSERT INTO Version (version) VALUES (2);
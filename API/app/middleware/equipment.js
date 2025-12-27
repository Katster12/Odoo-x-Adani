let mysql = require("mysql2/promise"),
    mysqlAuth = require("../config/mysqlAuth");

let equipmentMiddleware = {};

const pool = mysql.createPool(mysqlAuth.mysql);

equipmentMiddleware.getAllEquipment = async (req, res) => {
    const { category, deptid, maintenanceid, technicianuserid, search } = req.query;

    const conn = await pool.getConnection();
    try {
        let query = `
            SELECT e.*, d.deptname, mt.name as teamName, u.name as technicianName,
                   (SELECT COUNT(*) FROM maintenancereq WHERE equipmentid = e.id) as totalRequests,
                   (SELECT COUNT(*) FROM maintenancereq WHERE equipmentid = e.id AND stage = 'NEW') as pendingRequests
            FROM equipment e
            LEFT JOIN dept d ON e.deptid = d.deptid
            LEFT JOIN maintenanceteam mt ON e.maintenanceid = mt.maintenanceid
            LEFT JOIN user u ON e.technicianuserid = u.userid
            WHERE 1=1
        `;
        let params = [];

        if (category) {
            query += ' AND e.category = ?';
            params.push(category);
        }

        if (deptid) {
            query += ' AND e.deptid = ?';
            params.push(deptid);
        }

        if (maintenanceid) {
            query += ' AND e.maintenanceid = ?';
            params.push(maintenanceid);
        }

        if (technicianuserid) {
            query += ' AND e.technicianuserid = ?';
            params.push(technicianuserid);
        }

        if (search) {
            query += ' AND (e.name LIKE ? OR e.srno LIKE ? OR e.category LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY e.created_at DESC';

        const [equipment] = await conn.query(query, params);

        res.json({
            status: 200,
            equipment: equipment
        });
    } catch (err) {
        console.error('Get all equipment error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.getEquipmentById = async (req, res) => {
    const equipmentId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [equipment] = await conn.query(`
            SELECT e.*, d.deptname, mt.name as teamName, mt.maintenanceid as teamId,
                   u.name as technicianName, u.userid as technicianId
            FROM equipment e
            LEFT JOIN dept d ON e.deptid = d.deptid
            LEFT JOIN maintenanceteam mt ON e.maintenanceid = mt.maintenanceid
            LEFT JOIN user u ON e.technicianuserid = u.userid
            WHERE e.id = ?
        `, [equipmentId]);

        if (equipment.length === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        const [maintenanceHistory] = await conn.query(`
            SELECT mr.*, u.name as createdByName, u2.name as assignedToName, mt.name as teamName
            FROM maintenancereq mr
            LEFT JOIN user u ON mr.createduserid = u.userid
            LEFT JOIN user u2 ON mr.assigneduserid = u2.userid
            LEFT JOIN maintenanceteam mt ON mr.maintenanceid = mt.maintenanceid
            WHERE mr.equipmentid = ?
            ORDER BY mr.created_at DESC
        `, [equipmentId]);

        res.json({
            status: 200,
            equipment: {
                ...equipment[0],
                maintenanceHistory: maintenanceHistory
            }
        });
    } catch (err) {
        console.error('Get equipment by ID error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.createEquipment = async (req, res) => {
    const { name, srno, category, purchasedate, warrentyenddate, location, deptid, maintenanceid, technicianuserid } = req.body;

    if (!name || !srno) {
        return res.status(400).json({ message: 'Name and serial number are required' });
    }

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(`
            INSERT INTO equipment (name, srno, category, purchasedate, warrentyenddate, location, deptid, maintenanceid, technicianuserid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, srno, category, purchasedate, warrentyenddate, location, deptid, maintenanceid, technicianuserid]);

        res.status(201).json({
            status: 201,
            message: 'Equipment created successfully',
            equipment: {
                id: result.insertId,
                name,
                srno,
                category,
                purchasedate,
                warrentyenddate,
                location,
                deptid,
                maintenanceid,
                technicianuserid
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Equipment with this serial number already exists' });
        }
        console.error('Create equipment error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.updateEquipment = async (req, res) => {
    const equipmentId = req.params.id;
    const { name, srno, category, purchasedate, warrentyenddate, location, deptid, maintenanceid, technicianuserid } = req.body;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(`
            UPDATE equipment 
            SET name = ?, srno = ?, category = ?, purchasedate = ?, warrentyenddate = ?, location = ?, deptid = ?, maintenanceid = ?, technicianuserid = ?
            WHERE id = ?
        `, [name, srno, category, purchasedate, warrentyenddate, location, deptid, maintenanceid, technicianuserid, equipmentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json({
            status: 200,
            message: 'Equipment updated successfully'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Equipment with this serial number already exists' });
        }
        console.error('Update equipment error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.deleteEquipment = async (req, res) => {
    const equipmentId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [maintenanceCheck] = await conn.query('SELECT COUNT(*) as count FROM maintenancereq WHERE equipmentid = ?', [equipmentId]);

        if (maintenanceCheck[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete equipment with existing maintenance requests' });
        }

        const [result] = await conn.query('DELETE FROM equipment WHERE id = ?', [equipmentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json({
            status: 200,
            message: 'Equipment deleted successfully'
        });
    } catch (err) {
        console.error('Delete equipment error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.getEquipmentCategories = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [categories] = await conn.query('SELECT DISTINCT category FROM equipment WHERE category IS NOT NULL ORDER BY category ASC');

        res.json({
            status: 200,
            categories: categories.map(c => c.category)
        });
    } catch (err) {
        console.error('Get equipment categories error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.assignTeam = async (req, res) => {
    const equipmentId = req.params.id;
    const { maintenanceid } = req.body;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('UPDATE equipment SET maintenanceid = ? WHERE id = ?', [maintenanceid, equipmentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json({
            status: 200,
            message: 'Team assigned to equipment successfully'
        });
    } catch (err) {
        console.error('Assign team error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.assignTechnician = async (req, res) => {
    const equipmentId = req.params.id;
    const { technicianuserid } = req.body;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('UPDATE equipment SET technicianuserid = ? WHERE id = ?', [technicianuserid, equipmentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json({
            status: 200,
            message: 'Technician assigned to equipment successfully'
        });
    } catch (err) {
        console.error('Assign technician error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.getEquipmentByTeam = async (req, res) => {
    const teamId = req.params.teamId;

    const conn = await pool.getConnection();
    try {
        const [equipment] = await conn.query(`
            SELECT e.*, d.deptname, mt.name as teamName, u.name as technicianName
            FROM equipment e
            LEFT JOIN dept d ON e.deptid = d.deptid
            LEFT JOIN maintenanceteam mt ON e.maintenanceid = mt.maintenanceid
            LEFT JOIN user u ON e.technicianuserid = u.userid
            WHERE e.maintenanceid = ?
            ORDER BY e.created_at DESC
        `, [teamId]);

        res.json({
            status: 200,
            equipment: equipment
        });
    } catch (err) {
        console.error('Get equipment by team error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

equipmentMiddleware.getEquipmentByTechnician = async (req, res) => {
    const technicianId = req.params.technicianId;

    const conn = await pool.getConnection();
    try {
        const [equipment] = await conn.query(`
            SELECT e.*, d.deptname, mt.name as teamName, u.name as technicianName
            FROM equipment e
            LEFT JOIN dept d ON e.deptid = d.deptid
            LEFT JOIN maintenanceteam mt ON e.maintenanceid = mt.maintenanceid
            LEFT JOIN user u ON e.technicianuserid = u.userid
            WHERE e.technicianuserid = ?
            ORDER BY e.created_at DESC
        `, [technicianId]);

        res.json({
            status: 200,
            equipment: equipment
        });
    } catch (err) {
        console.error('Get equipment by technician error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

module.exports = equipmentMiddleware;
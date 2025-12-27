let mysql = require("mysql2/promise"),
    mysqlAuth = require("../config/mysqlAuth");

let maintenanceRequestMiddleware = {};

const pool = mysql.createPool(mysqlAuth.mysql);

maintenanceRequestMiddleware.getAllRequests = async (req, res) => {
    const { stage, priority, type, equipmentid, assigneduserid } = req.query;

    const conn = await pool.getConnection();
    try {
        let query = `
            SELECT mr.*, 
                   e.name as equipmentName, e.srno as equipmentSrno,
                   u1.name as createdByName, u1.email as createdByEmail,
                   u2.name as assignedToName, u2.email as assignedToEmail,
                   mt.name as teamName,
                   d.deptname
            FROM maintenancereq mr
            JOIN equipment e ON mr.equipmentid = e.id
            LEFT JOIN user u1 ON mr.createduserid = u1.userid
            LEFT JOIN user u2 ON mr.assigneduserid = u2.userid
            LEFT JOIN maintenanceteam mt ON mr.maintenanceid = mt.maintenanceid
            LEFT JOIN dept d ON e.deptid = d.deptid
            WHERE 1=1
        `;
        let params = [];

        if (stage) {
            query += ' AND mr.stage = ?';
            params.push(stage);
        }

        if (priority) {
            query += ' AND mr.priority = ?';
            params.push(priority);
        }

        if (type) {
            query += ' AND mr.type = ?';
            params.push(type);
        }

        if (equipmentid) {
            query += ' AND mr.equipmentid = ?';
            params.push(equipmentid);
        }

        if (assigneduserid) {
            query += ' AND mr.assigneduserid = ?';
            params.push(assigneduserid);
        }

        query += ' ORDER BY mr.created_at DESC';

        const [requests] = await conn.query(query, params);

        res.json({
            status: 200,
            requests: requests
        });
    } catch (err) {
        console.error('Get all requests error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.getRequestById = async (req, res) => {
    const reqId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [requests] = await conn.query(`
            SELECT mr.*, 
                   e.name as equipmentName, e.srno as equipmentSrno, e.category as equipmentCategory,
                   u1.name as createdByName, u1.email as createdByEmail,
                   u2.name as assignedToName, u2.email as assignedToEmail,
                   mt.name as teamName, mt.desc as teamDesc,
                   d.deptname
            FROM maintenancereq mr
            JOIN equipment e ON mr.equipmentid = e.id
            LEFT JOIN user u1 ON mr.createduserid = u1.userid
            LEFT JOIN user u2 ON mr.assigneduserid = u2.userid
            LEFT JOIN maintenanceteam mt ON mr.maintenanceid = mt.maintenanceid
            LEFT JOIN dept d ON e.deptid = d.deptid
            WHERE mr.reqid = ?
        `, [reqId]);

        if (requests.length === 0) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        res.json({
            status: 200,
            request: requests[0]
        });
    } catch (err) {
        console.error('Get request by ID error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.createRequest = async (req, res) => {
    const { type, priority, subject, description, equipmentid, scheduleddate, duedate } = req.body;
    const createduserid = req.user.id;

    if (!type || !priority || !subject || !equipmentid) {
        return res.status(400).json({ message: 'Type, priority, subject, and equipment ID are required' });
    }

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(`
            INSERT INTO maintenancereq 
            (type, stage, priority, subject, description, equipmentid, createduserid, scheduleddate, duedate)
            VALUES (?, 'NEW', ?, ?, ?, ?, ?, ?, ?)
        `, [type, priority, subject, description, equipmentid, createduserid, scheduleddate, duedate]);

        res.status(201).json({
            status: 201,
            message: 'Maintenance request created successfully',
            request: {
                reqid: result.insertId,
                type,
                stage: 'NEW',
                priority,
                subject,
                description,
                equipmentid,
                createduserid,
                scheduleddate,
                duedate
            }
        });
    } catch (err) {
        console.error('Create request error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.updateRequest = async (req, res) => {
    const reqId = req.params.id;
    const { type, stage, priority, subject, description, maintenanceid, assigneduserid, scheduleddate, duedate, startedat, completedat, hoursspent } = req.body;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(`
            UPDATE maintenancereq 
            SET type = ?, stage = ?, priority = ?, subject = ?, description = ?, 
                maintenanceid = ?, assigneduserid = ?, scheduleddate = ?, duedate = ?, 
                startedat = ?, completedat = ?, hoursspent = ?
            WHERE reqid = ?
        `, [type, stage, priority, subject, description, maintenanceid, assigneduserid, scheduleddate, duedate, startedat, completedat, hoursspent, reqId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        res.json({
            status: 200,
            message: 'Maintenance request updated successfully'
        });
    } catch (err) {
        console.error('Update request error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.updateRequestStage = async (req, res) => {
    const reqId = req.params.id;
    const { stage } = req.body;

    if (!['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP'].includes(stage)) {
        return res.status(400).json({ message: 'Invalid stage' });
    }

    const conn = await pool.getConnection();
    try {
        let updateQuery = 'UPDATE maintenancereq SET stage = ?';
        let params = [stage];

        if (stage === 'IN_PROGRESS') {
            updateQuery += ', startedat = NOW()';
        } else if (stage === 'REPAIRED' || stage === 'SCRAP') {
            updateQuery += ', completedat = NOW()';
        }

        updateQuery += ' WHERE reqid = ?';
        params.push(reqId);

        const [result] = await conn.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        res.json({
            status: 200,
            message: 'Request stage updated successfully'
        });
    } catch (err) {
        console.error('Update request stage error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.assignRequest = async (req, res) => {
    const reqId = req.params.id;
    const { assigneduserid, maintenanceid } = req.body;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(`
            UPDATE maintenancereq 
            SET assigneduserid = ?, maintenanceid = ?
            WHERE reqid = ?
        `, [assigneduserid, maintenanceid, reqId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        res.json({
            status: 200,
            message: 'Request assigned successfully'
        });
    } catch (err) {
        console.error('Assign request error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.deleteRequest = async (req, res) => {
    const reqId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('DELETE FROM maintenancereq WHERE reqid = ?', [reqId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Maintenance request not found' });
        }

        res.json({
            status: 200,
            message: 'Maintenance request deleted successfully'
        });
    } catch (err) {
        console.error('Delete request error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.getMyRequests = async (req, res) => {
    const userId = req.user.id;

    const conn = await pool.getConnection();
    try {
        const [requests] = await conn.query(`
            SELECT mr.*, 
                   e.name as equipmentName, e.srno as equipmentSrno,
                   u2.name as assignedToName,
                   mt.name as teamName
            FROM maintenancereq mr
            JOIN equipment e ON mr.equipmentid = e.id
            LEFT JOIN user u2 ON mr.assigneduserid = u2.userid
            LEFT JOIN maintenanceteam mt ON mr.maintenanceid = mt.maintenanceid
            WHERE mr.createduserid = ?
            ORDER BY mr.created_at DESC
        `, [userId]);

        res.json({
            status: 200,
            requests: requests
        });
    } catch (err) {
        console.error('Get my requests error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.getAssignedRequests = async (req, res) => {
    const userId = req.user.id;

    const conn = await pool.getConnection();
    try {
        const [requests] = await conn.query(`
            SELECT mr.*, 
                   e.name as equipmentName, e.srno as equipmentSrno,
                   u1.name as createdByName,
                   mt.name as teamName
            FROM maintenancereq mr
            JOIN equipment e ON mr.equipmentid = e.id
            LEFT JOIN user u1 ON mr.createduserid = u1.userid
            LEFT JOIN maintenanceteam mt ON mr.maintenanceid = mt.maintenanceid
            WHERE mr.assigneduserid = ?
            ORDER BY mr.created_at DESC
        `, [userId]);

        res.json({
            status: 200,
            requests: requests
        });
    } catch (err) {
        console.error('Get assigned requests error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceRequestMiddleware.getDashboardStats = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [totalRequests] = await conn.query('SELECT COUNT(*) as count FROM maintenancereq');
        const [newRequests] = await conn.query('SELECT COUNT(*) as count FROM maintenancereq WHERE stage = "NEW"');
        const [inProgress] = await conn.query('SELECT COUNT(*) as count FROM maintenancereq WHERE stage = "IN_PROGRESS"');
        const [completed] = await conn.query('SELECT COUNT(*) as count FROM maintenancereq WHERE stage IN ("REPAIRED", "SCRAP")');
        const [totalEquipment] = await conn.query('SELECT COUNT(*) as count FROM equipment');
        const [highPriority] = await conn.query('SELECT COUNT(*) as count FROM maintenancereq WHERE priority = "HIGH" AND stage NOT IN ("REPAIRED", "SCRAP")');

        res.json({
            status: 200,
            stats: {
                totalRequests: totalRequests[0].count,
                newRequests: newRequests[0].count,
                inProgress: inProgress[0].count,
                completed: completed[0].count,
                totalEquipment: totalEquipment[0].count,
                highPriorityOpen: highPriority[0].count
            }
        });
    } catch (err) {
        console.error('Get dashboard stats error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

module.exports = maintenanceRequestMiddleware;
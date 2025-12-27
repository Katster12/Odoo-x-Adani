let mysql = require("mysql2/promise"),
    mysqlAuth = require("../config/mysqlAuth");

let departmentMiddleware = {};

const pool = mysql.createPool(mysqlAuth.mysql);

departmentMiddleware.getAllDepartments = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [departments] = await conn.query('SELECT * FROM dept ORDER BY deptname ASC');

        res.json({
            status: 200,
            departments: departments
        });
    } catch (err) {
        console.error('Get all departments error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

departmentMiddleware.getDepartmentById = async (req, res) => {
    const deptId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [departments] = await conn.query('SELECT * FROM dept WHERE deptid = ?', [deptId]);

        if (departments.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const [equipmentCount] = await conn.query('SELECT COUNT(*) as count FROM equipment WHERE deptid = ?', [deptId]);

        res.json({
            status: 200,
            department: {
                ...departments[0],
                equipmentCount: equipmentCount[0].count
            }
        });
    } catch (err) {
        console.error('Get department by ID error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

departmentMiddleware.createDepartment = async (req, res) => {
    const { deptname } = req.body;

    if (!deptname) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('INSERT INTO dept (deptname) VALUES (?)', [deptname]);

        res.status(201).json({
            status: 201,
            message: 'Department created successfully',
            department: {
                deptid: result.insertId,
                deptname: deptname
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Department with this name already exists' });
        }
        console.error('Create department error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

departmentMiddleware.updateDepartment = async (req, res) => {
    const deptId = req.params.id;
    const { deptname } = req.body;

    if (!deptname) {
        return res.status(400).json({ message: 'Department name is required' });
    }

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('UPDATE dept SET deptname = ? WHERE deptid = ?', [deptname, deptId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({
            status: 200,
            message: 'Department updated successfully'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Department with this name already exists' });
        }
        console.error('Update department error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

departmentMiddleware.deleteDepartment = async (req, res) => {
    const deptId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [equipmentCheck] = await conn.query('SELECT COUNT(*) as count FROM equipment WHERE deptid = ?', [deptId]);

        if (equipmentCheck[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete department with existing equipment' });
        }

        const [result] = await conn.query('DELETE FROM dept WHERE deptid = ?', [deptId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({
            status: 200,
            message: 'Department deleted successfully'
        });
    } catch (err) {
        console.error('Delete department error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

module.exports = departmentMiddleware;
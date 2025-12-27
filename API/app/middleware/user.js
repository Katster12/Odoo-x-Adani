let mysql = require("mysql2/promise"),
    mysqlAuth = require("../config/mysqlAuth");

let userMiddleware = {};

const pool = mysql.createPool(mysqlAuth.mysql);

userMiddleware.currentUser = async (req, res) => {
    const userId = req.user.id;

    const conn = await pool.getConnection();
    try {
        const [users] = await conn.query('SELECT userid, email, name, role, isVerified, created_at, lastLogin FROM user WHERE userid = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            status: 200,
            user: users[0]
        });
    } catch (err) {
        console.error('Current user error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

userMiddleware.getAllUsers = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [users] = await conn.query('SELECT userid, email, name, role, isVerified, created_at FROM user ORDER BY created_at DESC');

        res.json({
            status: 200,
            users: users
        });
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

userMiddleware.getUserById = async (req, res) => {
    const userId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [users] = await conn.query('SELECT userid, email, name, role, isVerified, created_at, lastLogin FROM user WHERE userid = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            status: 200,
            user: users[0]
        });
    } catch (err) {
        console.error('Get user by ID error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

userMiddleware.updateUser = async (req, res) => {
    const userId = req.user.id;
    const { name, email } = req.body;

    const conn = await pool.getConnection();
    try {
        await conn.query('UPDATE user SET name = ?, email = ? WHERE userid = ?', [name, email, userId]);

        res.json({
            status: 200,
            message: 'User updated successfully'
        });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

userMiddleware.updateUserRole = async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!['USER', 'TECHNICIAN', 'ADMIN'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.query('UPDATE user SET role = ? WHERE userid = ?', [role, userId]);

        res.json({
            status: 200,
            message: 'User role updated successfully'
        });
    } catch (err) {
        console.error('Update user role error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

userMiddleware.deleteUser = async (req, res) => {
    const userId = req.params.id;

    const conn = await pool.getConnection();
    try {
        await conn.query('DELETE FROM user WHERE userid = ?', [userId]);

        res.json({
            status: 200,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

module.exports = userMiddleware;
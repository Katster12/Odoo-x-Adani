let mysql = require("mysql2/promise"),
    mysqlAuth = require("../config/mysqlAuth");

let maintenanceTeamMiddleware = {};

const pool = mysql.createPool(mysqlAuth.mysql);

maintenanceTeamMiddleware.getAllTeams = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [teams] = await conn.query(`
            SELECT mt.*, 
                   COUNT(DISTINCT tn.userid) as memberCount,
                   COUNT(DISTINCT mr.reqid) as assignedRequests
            FROM maintenanceteam mt
            LEFT JOIN teamname tn ON mt.maintenanceid = tn.maintenanceid
            LEFT JOIN maintenancereq mr ON mt.maintenanceid = mr.maintenanceid
            GROUP BY mt.maintenanceid
            ORDER BY mt.name ASC
        `);

        res.json({
            status: 200,
            teams: teams
        });
    } catch (err) {
        console.error('Get all teams error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceTeamMiddleware.getTeamById = async (req, res) => {
    const teamId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [teams] = await conn.query('SELECT * FROM maintenanceteam WHERE maintenanceid = ?', [teamId]);

        if (teams.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const [members] = await conn.query(`
            SELECT tn.*, u.name, u.email, u.role
            FROM teamname tn
            JOIN user u ON tn.userid = u.userid
            WHERE tn.maintenanceid = ?
            ORDER BY tn.islead DESC, u.name ASC
        `, [teamId]);

        const [assignedRequests] = await conn.query(`
            SELECT mr.*, e.name as equipmentName
            FROM maintenancereq mr
            JOIN equipment e ON mr.equipmentid = e.id
            WHERE mr.maintenanceid = ?
            ORDER BY mr.created_at DESC
        `, [teamId]);

        res.json({
            status: 200,
            team: {
                ...teams[0],
                members: members,
                assignedRequests: assignedRequests
            }
        });
    } catch (err) {
        console.error('Get team by ID error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceTeamMiddleware.createTeam = async (req, res) => {
    const { name, desc } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Team name is required' });
    }

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('INSERT INTO maintenanceteam (name, `desc`) VALUES (?, ?)', [name, desc]);

        res.status(201).json({
            status: 201,
            message: 'Team created successfully',
            team: {
                maintenanceid: result.insertId,
                name,
                desc
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Team with this name already exists' });
        }
        console.error('Create team error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceTeamMiddleware.updateTeam = async (req, res) => {
    const teamId = req.params.id;
    const { name, desc } = req.body;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('UPDATE maintenanceteam SET name = ?, `desc` = ? WHERE maintenanceid = ?', [name, desc, teamId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json({
            status: 200,
            message: 'Team updated successfully'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Team with this name already exists' });
        }
        console.error('Update team error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceTeamMiddleware.deleteTeam = async (req, res) => {
    const teamId = req.params.id;

    const conn = await pool.getConnection();
    try {
        const [requestCheck] = await conn.query('SELECT COUNT(*) as count FROM maintenancereq WHERE maintenanceid = ?', [teamId]);

        if (requestCheck[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete team with assigned maintenance requests' });
        }

        await conn.query('DELETE FROM teamname WHERE maintenanceid = ?', [teamId]);
        
        const [result] = await conn.query('DELETE FROM maintenanceteam WHERE maintenanceid = ?', [teamId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json({
            status: 200,
            message: 'Team deleted successfully'
        });
    } catch (err) {
        console.error('Delete team error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceTeamMiddleware.addTeamMember = async (req, res) => {
    const teamId = req.params.id;
    const { userid, islead } = req.body;

    if (!userid) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('INSERT INTO teamname (maintenanceid, userid, islead) VALUES (?, ?, ?)', [teamId, userid, islead || 0]);

        res.status(201).json({
            status: 201,
            message: 'Member added to team successfully',
            member: {
                id: result.insertId,
                maintenanceid: teamId,
                userid,
                islead: islead || 0
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'User is already a member of this team' });
        }
        console.error('Add team member error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceTeamMiddleware.removeTeamMember = async (req, res) => {
    const teamId = req.params.id;
    const memberId = req.params.memberId;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('DELETE FROM teamname WHERE maintenanceid = ? AND id = ?', [teamId, memberId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        res.json({
            status: 200,
            message: 'Member removed from team successfully'
        });
    } catch (err) {
        console.error('Remove team member error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

maintenanceTeamMiddleware.updateTeamMember = async (req, res) => {
    const teamId = req.params.id;
    const memberId = req.params.memberId;
    const { islead } = req.body;

    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query('UPDATE teamname SET islead = ? WHERE maintenanceid = ? AND id = ?', [islead, teamId, memberId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        res.json({
            status: 200,
            message: 'Team member updated successfully'
        });
    } catch (err) {
        console.error('Update team member error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

module.exports = maintenanceTeamMiddleware;
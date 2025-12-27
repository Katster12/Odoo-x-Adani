const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const mysql = require('mysql2/promise');
require('dotenv').config();

const jwtSecret = require('../config/secret');
const mysqlAuth = require('../config/mysqlAuth');

const pool = mysql.createPool(mysqlAuth.mysql);

const authMiddleware = {};

authMiddleware.signUp = async (req, res) => {
    let password = req.body.password;
    let email = req.body.email;
    let name = req.body.name || null;
    let emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!email || !password) {
        return res.status(400).json({
            message: "Missing required property email or password"
        });
    }

    if (!emailRegexp.test(email)) {
        return res.status(403).json({
            message: "Email address is not valid"
        });
    }

    const conn = await pool.getConnection();
    try {
        const [foundUser] = await conn.query("SELECT * FROM user WHERE email=?", [email]);
        
        if (foundUser.length > 0) {
            return res.status(409).json({
                message: "User with same email already exists"
            });
        }

        let hashedPassword = bcrypt.hashSync(password, 10);
        const [insertedUser] = await conn.query("INSERT INTO user(email,password,name,role,isVerified) VALUES(?,?,?,?,?)", [email, hashedPassword, name, 'USER', 1]);

        let user = {
            id: insertedUser.insertId,
            role: 'USER',
            email: email,
            name: name
        };

        const token = jwt.sign({ user: user }, jwtSecret.secret, { expiresIn: '24h' });

        res.status(200).json({
            message: "New user successfully created",
            data: {
                user: user,
                token: token
            }
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

authMiddleware.authToken = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    const conn = await pool.getConnection();
    try {
        const [users] = await conn.query("SELECT * FROM user WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];
        const isValidPassword = bcrypt.compareSync(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const currentUser = {
            id: user.userid,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        };

        const token = jwt.sign({ user: currentUser }, jwtSecret.secret, { expiresIn: '24h' });

        await conn.query("UPDATE user SET lastLogin = NOW() WHERE userid = ?", [user.userid]);

        res.status(200).json({ 
            data: { 
                user: currentUser, 
                token 
            } 
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    } finally {
        conn.release();
    }
};

authMiddleware.changePassword = async (req, res) => {
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;
    const userId = req.user.id;
    
    const conn = await pool.getConnection();
    try {
        const [users] = await conn.query("SELECT * FROM user WHERE userid = ?", [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValidPassword = bcrypt.compareSync(oldPassword, users[0].password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: "Your old password is not correct" });
        }

        const newHashedPassword = bcrypt.hashSync(newPassword, 10);
        await conn.query("UPDATE user SET password = ? WHERE userid = ?", [newHashedPassword, userId]);

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Server error" });
    } finally {
        conn.release();
    }
};

module.exports = authMiddleware;
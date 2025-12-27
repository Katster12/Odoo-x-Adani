let jwt = require('jsonwebtoken'),
    jwtSecret = require('../config/secret');
const mysql = require('mysql2/promise');
const mysqlAuth = require('../config/mysqlAuth');

const pool = mysql.createPool(mysqlAuth.mysql);

let indexMiddleware = {};

indexMiddleware.verifyToken = (req, res, next) => {
    let bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        let bearer = bearerHeader.split(' ');
        let bearerToken = bearer[1];
        req.token = bearerToken;
        
        jwt.verify(req.token, jwtSecret.secret, (err, jwtData) => {
            if (err) {
                res.status(403).json({
                    message: "Invalid token"
                });
            } else {
                req.user = jwtData.user;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
};

indexMiddleware.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        next();
    };
};

module.exports = indexMiddleware;
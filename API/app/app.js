let express = require('express'),
    app = express(),
    cors = require('cors'),
    jwt = require('jsonwebtoken'),
    session = require('express-session'),
    bodyParser = require('body-parser');
    DBUtil = require('./utils/DatabaseUtility'),
    multer = require('multer');
    var path = require('path');
    require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

process.on('uncaughtException', (err) => {
    console.log(err)
});

setTimeout(() => {
    console.log('This will still run.');
}, 500);

app.use(session({
    secret: 'maintenance_tracker_secret',
    cookie: {
        maxAge: 60000
    },
    resave: false,
    saveUninitialized: false
}));

const logRequestStart = (req, res, next) => {
    console.info(`${req.method} ${req.originalUrl}`)
    next()
}

app.use(logRequestStart)
app.use(express.static('uploads',  express.static(path.join(__dirname, 'uploads'))))

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({ limit: '50mb' }));

app.get("/", (req, res, next) => {
    res.status(200).json({
        message: "Maintenance Tracker API WORKS"
    });
})

let routes = require('./routes/router');
app.use('/', routes);

app.get('*', () => {
    console.log("ROUTE NOT FOUND")
})

module.exports = app;
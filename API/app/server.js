require('dotenv').config();
const http = require('http');
const app = require('./app');

const port = process.env.PORT || 5000;

let server = http.Server(app);

server.listen(port, () => {
    console.log(`Maintenance Tracker Server started at ${port}`)
});
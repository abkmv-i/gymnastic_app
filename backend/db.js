const Pool = require('pg').Pool
const pool = new Pool({
    host: 'localhost', // Connect to the local port forwarded by SSH tunnel
    database: 'gymnastic',
    port: 5432, // Local port forwarded by SSH tunnel
    user: 'irinaabakumova',
    password: 'postgres'
})
module.exports = pool
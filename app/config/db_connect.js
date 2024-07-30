const mongoose = require('mongoose');
const db = process.env.MONGO_CONNECT;

const connect_db = async () => {
    try {
        const connectedDB = await mongoose.connect(db);
        console.log(`DB CONNECTED: ${connectedDB.connection.readyState}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connect_db;

const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        // Set options
        // useNewUrlParser: true,
        // useUnifiendTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
}

module.exports = connectDB;
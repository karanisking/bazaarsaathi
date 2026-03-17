const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected:`);
    } catch(err){
        console.log('Error while connecting Database', err);
    }
}

module.exports = connectDB
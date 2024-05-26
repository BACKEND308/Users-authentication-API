const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectMongo;
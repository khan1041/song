


// db.js

import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://skshimul79977007:tiBPI7LUbBnOwdoE@cluster0.cwfmg5j.mongodb.net/music';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully 🎉');
  } catch (err) {
    console.error('MongoDB connection failed ❌:', err.message);
    // Exit process with failure
    process.exit(1); 
  }
};

export default connectDB;

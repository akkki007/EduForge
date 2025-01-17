import { app } from "./app.js";
import dotenv from "dotenv";
import User from "./models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import express from "express";
import connectDB from "./db/index.js";
import Teacher from "./models/teacher.models.js";
dotenv.config();
const PORT = process.env.PORT || 7000;
const JWT_SECRET = process.env.JWT_SECRET || 'akshaydbmsproject';
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.post("/studentSignUp", async(req, res) => {

  try {
    connectDB();
    const { fullname, enrollmentNo, division, email, password } = req.body;
    // Validate required fields
    if (!fullname || !enrollmentNo || !email || !division || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { enrollmentNo },
        { email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email ? 
          'Email already registered' : 
          'Enrollment number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      fullname,
      enrollmentNo,
      email,
      division,
      password: hashedPassword, // Store hashed password
      createdAt: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        enrollmentNo: newUser.enrollmentNo,
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Add JWT token to the response cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

    // Success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          enrollmentNo: newUser.enrollmentNo,
          division: newUser.division
        },
        token
      }
    });

  } catch (error) {
    console.error('Student signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
app.post("/teacherSignUp", async (req, res) => {
  try {
    connectDB();
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    // Validate required fields
    if (!lastName || !firstName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingTeacher = await Teacher.findOne({
      $or: [
        { phoneNumber },
        { email }
      ]
    });

    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: existingTeacher.email === email ?
          'Email already registered' :
          'Phone Number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new teacher
    const newTeacher = new Teacher({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword, // Store hashed password
    });
    await newTeacher.save();

    // Generate JWT token for teacher
    const token = jwt.sign(
      { id: newTeacher._id, email: newTeacher.email },
      process.env.JWT_SECRET, // Replace with your secret key from environment variables
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Add JWT token to the response cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: newTeacher._id,
          fullname: newTeacher.firstName + ' ' + newTeacher.lastName,
          email: newTeacher.email,
          phoneNumber: newTeacher.phoneNumber
        },
        token
      }
    });

  } catch (error) {
    console.error('Teacher signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
);
//create a signin route for student
app.post("/studentSignIn", async (req, res) => {
  try{
    const { email, password } = req.body;
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
  }
  // Check if student exists
  const student = await User.findOne({ email });

  if(student!=null){
    //fetch student data from jwt
    const token = req.cookies.jwt;
    const studentData = jwt.verify(token, JWT_SECRET);
    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, student.password);
    
      
  }
}catch(error){
    console.error('Student signin error:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at : http://localhost:${PORT}`);
});

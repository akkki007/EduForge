import { app } from "./app.js";
import dotenv from "dotenv";
import User from "./models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import express from "express";
import connectDB from "./db/index.js";
import Teacher from "./models/teacher.models.js";
import cookieParser from "cookie-parser";
import sgMail from "@sendgrid/mail"
dotenv.config();
app.use(cookieParser());  
const PORT = process.env.PORT || 7000;
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const JWT_SECRET = process.env.JWT_SECRET || 'akshaydbmsproject';
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from frontend
  credentials: true, // Allow cookies
}));
app.get("/", (req, res) => {
  res.send("Welcome to the student teacher portal");
});
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
      createdAt: new Date(),
      accepted: false
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
      message: 'Account request sent successfully. Please wait for the admin to accept your account. The login credentials will be sent to you via email.',
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
      if (!firstName || !lastName || !email || !phoneNumber || !password) {
          return res.status(400).json({
              success: false,
              message: "All fields are required",
          });
      }

      // Check if user already exists
      const existingTeacher = await Teacher.findOne({
          $or: [{ phoneNumber }, { email }],
      });

      if (existingTeacher) {
          return res.status(409).json({
              success: false,
              message:
                  existingTeacher.email === email
                      ? "Email already registered"
                      : "Phone number already exists",
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
          status: "pending", // Default status
      });

      await newTeacher.save();

      // Generate JWT token for teacher
      const token = jwt.sign(
          { id: newTeacher._id, email: newTeacher.email },
          process.env.JWT_SECRET, // Replace with your secret key from environment variables
          { expiresIn: "24h" } // Token expires in 24 hours
      );

      // Add JWT token to the response cookie
      res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Success response
      return res.status(201).json({
          success: true,
          message:
              "Account request sent successfully. Please wait for the admin to review your request.",
          data: {
              user: {
                  id: newTeacher._id,
                  fullname: newTeacher.firstName + " " + newTeacher.lastName,
                  email: newTeacher.email,
                  phoneNumber: newTeacher.phoneNumber,
              },
              token,
          },
      });
  } catch (error) {
      console.error("Teacher signup error:", error);
      return res.status(500).json({
          success: false,
          message: "Internal server error",
      });
  }
});

//create a signin route for student
app.post("/studentLogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if student exists
    const student = await User.findOne({ email });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if student is accepted by admin
    if (!student.accepted) {
      return res.status(403).json({
        success: false,
        message: 'Your account has not been accepted by the admin yet.Please wait for the admin to accept your account.The login credentials will be sent to you via email.',
      });
    }

    // Compare the password
    const isPasswordMatch = await bcrypt.compare(password, student.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please try again.',
      });
    }

    // Generate a new JWT token
    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.JWT_SECRET, // Replace with your secret key
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Add JWT token to the response cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Student logged in successfully',
      data: {
        student: {
          id: student._id,
          fullname: student.fullname,
          email: student.email,
          enrollmentNo: student.enrollmentNo,
          division: student.division,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login',
    });
  }
});
app.post("/teacherLogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if teacher exists
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found. Please register first.',
      });
    }
    if(!teacher.accepted){
      return res.status(400).json({
        success: false,
        message: 'Teacher not accepted. Please wait for the admin to accept your account.Your login credentials will be sent to you via email.',
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, teacher.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate a new JWT token
    const token = jwt.sign(
      { id: teacher._id, email: teacher.email },
      process.env.JWT_SECRET, // Replace with your secret key
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Add JWT token to the response cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: teacher._id,
          fullname: teacher.firstName + ' ' + teacher.lastName,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});
app.get("/admin/teacherRequests", async (req, res) => {
  try { 
    connectDB();
    const teacherRequests = await Teacher.find({status:"pending"})
    if(!teacherRequests){
      return res.status(404).json({
        message: 'No teacher requests found',
      });
    }

    return res.status(200).json(teacherRequests);
  } catch (error) {
    console.error('Error fetching Teacher requests:', error);
    return res.status(500).json({
      message: 'Failed to fetch account requests',
    });
  }
});
app.get("/admin/studentRequests", async (req, res) => {
  try { 
    connectDB();
    const userRequests = await User.find({ status:"pending" });

    // Return the combined requests in the response
    return res.status(200).json(userRequests);
  } catch (error) {
    console.error('Error fetching account requests:', error);
    return res.status(500).json({
      message: 'Failed to fetch account requests',
    });
  }
}
);
app.post("/adminLogin", async (req, res) => {
  try{
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if admin exists
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate a new JWT token
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || "admin", // Replace with your secret key
      { expiresIn: '24h' } // Token expires in 24 hours
    );
    console.log(token);
    
    // Add JWT token to the response cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'None', // Enable cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Admin logged in successfully',
      token,
    });
  }catch(error){
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

app.post("/admin/updateRequests", async (req, res) => {

  const { id, status, type } = req.body;

    if (!id || !status || !type) {
        return res.status(400).json({ error: 'Missing required fields: id, status, or type' });
    }

    try {
        if (type === "student") {
            const user = await User.findOneAndUpdate({ _id: id }, { status: status }, { new: true });
            if (!user) {
                return res.status(404).json({ error: 'Student not found' });
            }

            const msg = {
                to: user.email,
                from: 'akshaynazare3@gmail.com',
                subject: 'Status Update Notification',
                text: `Your status has been updated to: ${status}`,
            };

            await sgMail.send(msg);
            return res.status(200).json({ message: 'Student status updated and email sent successfully' });
        }

        if (type === "teacher") {
            const teacher = await Teacher.findOneAndUpdate({ _id: id }, { status: status }, { new: true });
            if (!teacher) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            return res.status(200).json({ message: 'Teacher status updated successfully' });
        }

        return res.status(400).json({ error: 'Invalid type. Must be "student" or "teacher"' });
    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

 
});

// Route to fetch students data
app.get("/students", async (req, res) => {
  try {
    // Fetch all students
    const students = await User.find();

    // Return the students in the response
    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Error fetching students data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students data.",
    });
  }
});
app.post("/logout", (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict', // Restrict cross-site access
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at : http://localhost:${PORT}`);
});

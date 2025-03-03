import { app } from "./app.js";

import User from "./models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import express from "express";
import connectDB from "./db/index.js";
import Teacher from "./models/teacher.models.js";
import cookieParser from "cookie-parser";
import sgMail from "@sendgrid/mail"
import supabase from "./supabase.js";
import dotenv from "dotenv";
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

app.get("/user", async(req,res)=>{
    
})

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
    connectDB();
    const { email, password } = req.body;
    console.log(req.body);
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if teacher exists
    const teacher = await Teacher.findOne({ email:email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found. Please register first.',
      });
    }
    if(teacher.status=="pending"){
      return res.status(400).json({
        success: false,
        message: 'Teacher not accepted. Please wait for the admin to accept your account.Your login credentials will be sent to you via email.',
      });
    }
    if(teacher.status=="declined"){
      return res.status(400).json({
        success: false,
        message: 'Teacher request is declined. Please contact the admin to accept your account.Your login credentials will be sent to you via email.',
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
    res.cookie("jwt", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: false, // Allow frontend access
      secure: false,   // Set to true if using HTTPS
      sameSite: "Lax"
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
      httpOnly: false,
      secure:true,
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
            const msg = {
              to: teacher.email,
              from: 'akshaynazare3@gmail.com',
              subject: 'Status Update Notification',
              text: `Your status has been updated to: ${status}`,
          };

          await sgMail.send(msg);
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
app.post("/show", async (req, res) => {
  if (!req.body.date || !req.body.division) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "Both date and division are required",
    });
  }
  const { date, division } = req.body;

  try {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("pracdates", date)
      .eq("division", division)
      .order("enroll", { ascending: true });

    if (attendanceError) {
      console.error(
        "Attendance query error for date:",
        date,
        "and division:",
        division,
        "Error:",
        attendanceError
      );
      return res.status(500).json({
        error: "Failed to fetch attendance data",
        message: "Error querying attendance records",
        details: attendanceError,
      });
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("studentname, division, enroll")
      .eq("division", division);

    if (studentError) {
      console.error(
        "Student query error for division:",
        division,
        "Error:",
        studentError
      );
      return res.status(500).json({
        error: "Failed to fetch student data",
        message: "Error querying student records",
        details: studentError,
      });
    }
    const combData = combineResults(studentData, attendanceData || []);

    return res.json(combData);
  } catch (error) {
    console.error("Detailed error:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

const combineResults = (studentResults, otherData) => {
  if (otherData.length === 0) {
    return studentResults.map((student, index) => ({
      id: index,
      studentname: student.studentname,
      enroll: student.enroll,
      isPresent: false,
    }));
  } else {    
    return otherData.map((attendance, index) => {
      const student = studentResults.find(
        (student) => student.enroll === attendance.enroll
      );
      return {
        id: index,
        studentname: student ? student.studentname : "Unknown",
        enroll: attendance.enroll,
        isPresent: Boolean(attendance.ispresent),
      };
    });
  }
};

app.post("/load", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("daterecord")
      .select("*")
      .order("pracdates", { ascending: false });

    if (error) {
      console.error("Error fetching date records. Error:", error);
      return res.status(500).json({
        error: "Failed to load date records",
        message: "Error querying date records",
        details: error,
      });
    }

    if (!data || data.length === 0) {
      console.log("No date records found");
      return res.json({ user: [] });
    }

    return res.json({ user: data });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/update", async (req, res) => {
  if (!req.body.updatedRows || !req.body.date || !req.body.div) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "updatedRows, date, and div are all required",
    });
  }
  const { updatedRows, date, div } = req.body;

  try {
    const promises = updatedRows.map(async (row) => {
      const isPresent = row.isPresent ? true : false;

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("enroll", row.EnRoll)
        .eq("pracdates", date)
        .eq("division", div);
      if (error) throw error;
      if (data && data.length > 0) {
        return supabase
          .from("attendance")
          .update({ ispresent: isPresent })
          .eq("enroll", row.EnRoll)
          .eq("pracdates", date)
          .eq("division", div);
      }
    });

    const results = await Promise.all(promises);

    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      console.error("Errors updating rows:", errors);
      return res
        .status(500)
        .json({ error: "Database update error", details: errors });
    }

    res.status(200).json({ message: "All updates processed successfully." });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.post("/stud", async (req, res) => {
  if (!req.body.division) {
    return res.status(400).json({
      error: "Missing required field",
      message: "Division is required",
    });
  }
  const { division } = req.body;

  try {
    const { data, error } = await supabase
      .from("students")
      .select("studentname, enroll")
      .eq("division", division);

    if (error) {
      console.error(
        "Error fetching students for division:",
        division,
        "Error:",
        error
      );
      return res.status(500).json({
        error: "Failed to fetch student list",
        message: "Error querying student records",
        details: error,
      });
    }

    if (!data || data.length === 0) {
      console.log("No student data found");
      return res.json({ user: [] });
    }

    const formattedData = data.map((student) => ({
      Name: student.studentname,
      EnRoll: student.enroll,
    }));

    return res.json({ user: formattedData });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/insert", async (req, res) => {
  if (!req.body.updatedRows || !req.body.date || !req.body.div) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "updatedRows, date, and div are all required",
    });
  }
  const { updatedRows, date, div } = req.body;

  const filteredRows = updatedRows.map((stud) => ({
    enroll: stud.EnRoll,
    ispresent: stud.isPresent,
    division: div,
    pracdates: date,
  }));

  try {
    const { data, error } = await supabase
      .from("attendance")
      .insert(filteredRows);
    if (error) {
      console.error("Error inserting attendance data:", error);
    } else {
      console.log("Attendance data inserted successfully");
    }
  } catch (error) {
    console.log(error);
  }

  try {
    const { data, error } = await supabase.from("daterecord").insert([
      {
        division: div,
        pracdates: date,
      },
    ]);

    if (error) {
      console.error("Error inserting attendance data:", error);
    } else {
      console.log("Attendance data inserted successfully");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/marks", async (req, res) => {
  if (!req.body.division || !req.body.subject) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "Both division and subject are required",
    });
  }
  const { division, subject } = req.body;

  try {
    const { data: marksData, error: marksError } = await supabase
      .from("student_marks")
      .select("*")
      .eq("div", division)
      .eq("subject", subject)
      .order("enroll", { ascending: true });

    if (marksError) {
      console.error(
        "Marks query error for division:",
        division,
        "and subject:",
        subject,
        "Error:",
        marksError
      );
      return res.status(500).json({
        error: "Failed to fetch marks data",
        message: "Error querying student marks",
        details: marksError,
      });
    }
    if (marksData.length === 0) {
      return res.json({ message: "No Rows Found" });
    }
    const { data: students, error: studenterror } = await supabase
      .from("students")
      .select("studentname")
      .eq("division", division)
      .order("enroll", { ascending: true });
    if (studenterror) {
      console.error(
        "Students query error for division:",
        division,
        "Error:",
        studenterror
      );
      return res.status(500).json({
        error: "Failed to fetch student names",
        message: "Error querying student records",
        details: studenterror,
      });
    }

    for (let index = 0; index < students.length; index++) {
      if (marksData[index]) {
        marksData[index].id = index;
        marksData[index].studentname = students[index].studentname;
      }
    }

    return res.json(marksData);
  } catch (error) {
    console.error("Detailed error:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});
app.post("/updateMarks", async (req, res) => {
  if (!req.body.division || !req.body.subject || !req.body.marks) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "Division, subject, and marks data are required",
    });
  }

  const { division, subject, marks } = req.body;

  try {
    const updatePromises = marks.map(async (row) => {
      const { id, enroll, studentname, ...scores } = row;

      Object.keys(scores).forEach((key) => {
        scores[key] = Number(scores[key]) || 0;
      });

      const { error } = await supabase
        .from("student_marks")
        .update(scores)
        .eq("enroll", enroll)
        .eq("div", division)
        .eq("subject", subject);

      if (error) {
        console.error(`Error updating marks for ${enroll}:`, error);
        throw error;
      }
    });

    await Promise.all(updatePromises);

    return res.status(200).json({ message: "Marks updated successfully" });
  } catch (error) {
    console.error("Error updating marks:", error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at : http://localhost:${PORT}`);
});

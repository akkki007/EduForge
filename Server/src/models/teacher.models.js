import { Schema, model } from 'mongoose';

const teacherSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // change accepted to status and limit to three values "pending", "accepted", "declined"
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending"
    },
    subject: {
        type: String,
        default: "JavaScript",
        required: true
    },
});

const Teacher = model('Teacher', teacherSchema);

export default Teacher;
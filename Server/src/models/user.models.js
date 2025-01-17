import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    enrollmentNo: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    division: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    //created at
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = model('User', userSchema);

export default User;
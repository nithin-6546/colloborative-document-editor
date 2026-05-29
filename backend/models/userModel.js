import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true,"First Name is Required"],
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true,"Email is required"],
      unique: [true,"Email already exists"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true,"password is required"],
    },
  },
  {
    strict:"throw",
    timestamps:true,
    versionKey:false
  }
);

export const UserTypeModel=mongoose.model('User',userSchema);
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserTypeModel } from "../models/userModel.js";
import { config } from "dotenv";
config();

//register function
export const register=async(userObj)=>{
    //check for existing user with email 
    const existingUser = await UserTypeModel.findOne({
    email: userObj.email,
    });

    if (existingUser) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
    }
    //create document
    const userDocument=new UserTypeModel(userObj);
    //validate for empty passwords
    await userDocument.validate();
    //hash and replace the plain password
    userDocument.password=await bcrypt.hash(userDocument.password,12);
    //save userDocument in mongoDB database
    const created =await userDocument.save();
    //convert document to object to remove password
    const newUserobj=created.toObject();
    //remove the password
    delete newUserobj.password;
    //return userObj without password
    return newUserobj;
}

//authenticate function
export const authenticate=async(email,password)=>{
    //check user with email and role
    const user=await UserTypeModel.findOne({email});
    if(!user){
        const err=new Error("Invalid email");
        err.status=401;
        throw err;
    }
    
    //compare passwords
    const isMatchedPassword=await bcrypt.compare(password,user.password);
    if(!isMatchedPassword){
        const err=new Error("Invalid Password");
        err.status=401;
        throw err;
    }
    //generate token
     const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "30d",
        }
        );

    const userObj=user.toObject();
    delete userObj.password;
    return {token ,user:userObj};
}
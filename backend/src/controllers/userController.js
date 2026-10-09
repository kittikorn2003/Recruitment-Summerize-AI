const bcrypt = require ("bcrypt")
const jwt = require("jsonwebtoken")
const { findUserById,findUserWithPassword,updateUserWithPassword, updateUser, updateProfileImage } = require("../models/userModel")

const getMe = async (req, res) => {
    try { 
        const userId = req.user.id;
        const user = await findUserById(userId)

        if (!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        res.status(200).json(user)

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

const updateProfile = async (req, res) => {
    const { id,username,email } = req.body;
    try {
        const userId = req.user.id;
        const currentUser = await findUserById(userId)
        if (!currentUser){
            return res.status(404).json({
                message: "User not found"
            })
        }

        const finalUsername = username ?? currentUser.username
        const finalEmail = email ?? currentUser.email
        const updatedUser = await updateUser(userId,finalUsername,finalEmail)
        res.status(200).json({
            message: "Update Successfully"
        })
    } catch (err) {
        console.log(err)
        if (err.code === "23505"){
            return res.status(400).json({
                message: "Username or Email already used"
            })
        }
        res.status(500).json({
            message: "Server Error"
        })
    }
}

const changPassword = async (req,res) => {
    const { oldPassword,newPassword } = req.body;
    try{
        const userId = req.user.id;
        const user = await findUserWithPassword(userId);
        const isMatch = await bcrypt.compare(oldPassword,user.password);
        if(!isMatch){
            return res.status(401).json({
                message: "Current password is incorrect"
            })
        }
        const hashedNewPassword = await bcrypt.hash(newPassword,10);
        const updatedPassword = await updateUserWithPassword(userId,hashedNewPassword);
        res.status(200).json({
            message: "Password change successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Server error"
        })
    }
}

const uploadProfileImage = async (req,res) => {
    try {
        const userId = req.user.id;
        if (!req.file)
            return res.status(400).json({
                message: "No file upload"
            })
        const imagePath = `/uploads/profiles/${req.file.filename}`;
        const saveImage = await updateProfileImage(userId,imagePath);
        res.json({
            success: true,
            message: "ProfileImage saved",
            data: saveImage
        });
        
    }catch(err) {
        console.error("Server Error:", err);
        res.status(500).json({
            error: err.message
        })
    }
}
module.exports = {getMe,updateProfile,changPassword,uploadProfileImage}
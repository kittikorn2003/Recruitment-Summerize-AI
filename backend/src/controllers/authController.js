const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const { createUser,findUserByIdentifier, findUserById,findUserWithPassword, updateUser, updateUserWithPassword} = require("../models/userModel")

const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {

        const hashed = await bcrypt.hash(password,10);
        if(!email || !username || !password ){
            return res.status(400).json({
                message:"All fields are required. Please fill in everything."
            })
        }
        const newUser = await createUser(username, email, hashed);

        res.status(201).json({
            message: "register success",
            user: newUser,
        });
    }  catch (err) {
        console.log("Database Error:",err);
        if (err.code === "23505") {
            if (err.constraint.includes("email")) {
                return res.status(400).json({
                    message: "Email already used"
                })
            }
            if (err.constraint.includes("username")){
                return res.status(400).json({
                    message: "Username already used"
            })
        }
        }

        res.status(500).json({ message:err.message});
    }
};

const login = async (req, res) => {
    const { username,password } = req.body;
    try{
        const user = await findUserByIdentifier(username);
        if (!user){
            return res.status(401).json({
                message: "Invalid Username/Email"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({
                message: " Invalid Password "
            })
        }
        const { password: userPass, ...userData } = user;
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: "1h"}
        )
        res.status(200).json({
            message: "Login Successful",
            token,
            user:userData
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message:" Internal Server Error"
        })
    }
}

// const getMe = async (req, res) => {
//     try { 
//         const userId = req.user.id;
//         const user = await findUserById(userId)

//         if (!user){
//             return res.status(404).json({
//                 message: "User not found"
//             })
//         }
//         res.status(200).json(user)

//     } catch (err) {
//         console.log(err)
//         res.status(500).json({
//             message: "Server Error"
//         })
//     }
// }

// const editProfile = async (req, res) => {
//     const { id,username,email } = req.body;
//     try {
//         const userId = req.user.id;
//         const currentUser = await findUserById(userId)
//         if (!currentUser){
//             return res.status(404).json({
//                 message: "User not found"
//             })
//         }

//         const finalUsername = username ?? currentUser.username
//         const finalEmail = email ?? currentUser.email
//         const updatedUser = await updateUser(userId,finalUsername,finalEmail)
//         res.status(200).json({
//             message: "Update Successfully"
//         })
//     } catch (err) {
//         console.log(err)
//         if (err.code === "23505"){
//             return res.status(400).json({
//                 message: "Username or Email already used"
//             })
//         }
//         res.status(500).json({
//             message: "Server Error"
//         })
//     }
// }

// const changPassword = async (req,res) => {
//     const { oldPassword,newPassword } = req.body;
//     try{
//         const userId = req.user.id;
//         const user = await findUserWithPassword(userId);
//         const isMatch = await bcrypt.compare(oldPassword,user.password);
//         if(!isMatch){
//             return res.status(401).json({
//                 message: "Current password is incorrect"
//             })
//         }
//         const hashedNewPassword = await bcrypt.hash(newPassword,10);
//         const updatedPassword = await updateUserWithPassword(userId,hashedNewPassword);
//         res.status(200).json({
//             message: "Password change successfully"
//         })
//     } catch (err) {
//         res.status(500).json({
//             message: "Server error"
//         })
//     }
// }

module.exports = { register,login};
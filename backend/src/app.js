const express = require("express")
const cors = require("cors")
require("dotenv").config();
const path = require("path");
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const resumeRoutes = require("./routes/resumeRoutes")
const roleRequestRoutes = require("./routes/roleRequestRoutes");

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api", resumeRoutes)
app.use("/uploads",express.static(path.join(__dirname, "uploads")));
app.use("/api", roleRequestRoutes);

app.listen("3000", () =>{
    console.log("Server is running")
})



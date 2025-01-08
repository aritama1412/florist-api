const session = require("express-session"); // for session management
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, Username and password are required",
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save the user with the hashed password
    const newUser = await User.create({
      name,
      username,
      password: hashedPassword,
      status: "1",
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: { id: newUser.id, username: newUser.username },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// const login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({
//         status: "error",
//         message: "Username and password are required",
//       });
//     }

//     // Retrieve the user from the database
//     const user = await User.findOne({ where: { username } });

//     if (!user) {
//       return res.status(404).json({
//         status: "error",
//         message: "User not found",
//       });
//     }

//     // Compare the input password with the stored hashed password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         status: "error",
//         message: "Invalid password",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Login successful",
//       data: { id: user.id, username: user.username },
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required",
      });
    }

    // Retrieve the user from the database
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Compare the input password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // Save user information in the session
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ username, password }, secretKey, {
      expiresIn: "365d",
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        id: user.id,
        username: user.username,
        tokenType: "bearer",
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  register,
  login,
};

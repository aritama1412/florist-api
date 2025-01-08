const User = require("../models/User");

// ✅ Create a new user
const createUser = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, username, and password are required",
      });
    }

    const newUser = await User.create({ name, username, password });
    res.status(201).json({ status: "success", data: newUser });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ✅ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.query; // Get ID from query parameters
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
      data: null,
    });
  }
};

// ✅ Update user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    await user.update({ name, username, password, status });
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ✅ Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    await user.destroy();
    res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import createUserToken from "../utils/createUserToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ((!username, !email, !password)) {
    throw new Error("Fill all the inputs");
  }

  const userExists = await User.findOne({ email });
  if (userExists) res.status(400).send("User already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPW = await bcrypt.hash(password, salt);
  const newUser = new User({ username, email, password: hashedPW });

  try {
    await newUser.save();
    createUserToken(res, newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid User Data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (isPasswordValid) {
      createUserToken(res, userExists._id);
      res.status(201).json({
        _id: userExists._id,
        username: userExists.username,
        isAdmin: userExists.isAdmin,
      });
      return;
    }
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Succesfully logged out",
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, username: user.username, email: user.email });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

const updateCurrUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPW = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPW;
    }
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete administrator");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User deleted" });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

export {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getCurrUserProfile,
  updateCurrUserProfile,
  deleteUser,
  getUserById,
  updateUserById,
};

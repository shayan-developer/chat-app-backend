import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerCtrl = async (req, res, next) => {
  const { userName, email, password } = req.body;

  try {
    const isUserExist = await User.findOne({ userName });
    if (isUserExist) {
      const error = new Error("User already exist");
      error.statusCode = 409;
      throw error;
    }
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      const error = new Error("Email already exist");
      error.statusCode = 409;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ userName, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_JWT);

    res.status(201).json({
      message: "User created",
      user: { userName: user.userName, email: user.email, id: user._id, token },
    });
  } catch (error) {
    next(error);
  }
};

export const loginCtrl = async (req, res, next) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({ userName });
    if (!user) {
      const error = new Error("incorrect username or password ");
      error.statusCode = 404;
      throw error;
    }
    const matchedPsw = await bcrypt.compare(password, user.password);
    if (!matchedPsw) {
      const error = new Error("incorrect username or password ");
      error.statusCode = 404;
      throw error;
    }
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_JWT);
    if (matchedPsw) {
      res.status(200).json({
        message: "sucessfully logged in ",
        user: {
          userName: user.userName,
          email: user.email,
          id: user._id,
          token,
          avatar: user?.avatar,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

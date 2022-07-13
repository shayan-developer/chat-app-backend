import User from "../models/user.js";

export const setAvatar = async (req, res, next) => {
  const userId = req.params.userId;
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, {
      avatar: avatar.toString(),
    });

    return res.status(200).json({ message: "Avatar updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const contacts = user.contacts;
    const users = await User.find({ _id: { $in: contacts } }).select(["userName", "avatar","_id"]);
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

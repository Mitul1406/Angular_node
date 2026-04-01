import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exist = await User.findOne({ email });
  if (exist) return res.status(400).json({ msg: "User already exists" });
  
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role });

  res.json(user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role,name: user.name, email: user.email },
    process.env.JWT_SECRET
  );

  res.json({ token });
};
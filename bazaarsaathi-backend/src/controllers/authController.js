const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { validate, registerSchema, loginSchema } = require('../utils/validator')


const register = async (req, res, next) => {
  try {
    const data = validate(registerSchema, req.body)

    const exists = await User.findOne({ email: data.email })
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    console.log(data);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role, 
    })

    console.log(user);

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '7d' }
      )

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email,role: user.role },
      },
    })
  } catch (err) {
    next(err)
  }
}


const login = async (req, res, next) => {
  try {
    const data = validate(loginSchema, req.body)

    const user = await User.findOne({ email: data.email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const isMatch = await bcrypt.compare(data.password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const token =jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '7d' }
      )

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    })
  } catch (err) {
    next(err)
  }
}


const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' })
}

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    res.status(200).json({
      success: true,
      message: 'User fetched.',
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, logout, getMe }
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  assignments: { type: [String], default: [] },
}, { timestamps: true })

export const User = mongoose.model('User', userSchema)

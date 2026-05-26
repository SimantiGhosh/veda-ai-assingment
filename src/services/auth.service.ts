import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model'
import { env } from '../config'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema'

export const authService = {
  async register(data: RegisterInput) {
    const existing = await User.findOne({ username: data.username })
    if (existing) throw new Error('Username already exists')

    const passwordHash = await bcrypt.hash(data.password, 10)
    const user = await User.create({ username: data.username, passwordHash })

    return { userId: user._id.toString(), username: user.username }
  },

  async login(data: LoginInput) {
    const user = await User.findOne({ username: data.username })
    if (!user) throw new Error('Invalid credentials')

    const isValid = await bcrypt.compare(data.password, user.passwordHash)
    if (!isValid) throw new Error('Invalid credentials')

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return { token }
  }
}

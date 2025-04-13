import mongoose, { Schema, model, models } from 'mongoose'
import { compare } from 'bcryptjs'

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  image: { type: String },
  provider: {
    type: String,
    enum: ['credentials', 'google', 'github'],
    default: 'credentials'
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  rationality_score: {
    type: Number,
    default: 0,
  },
  empathy_score: {
    type: Number,
    default: 0,
  },
  clarity_score: {
    type: Number,
    default: 0,
  },
  decisiveness_score: {
    type: Number,
    default: 0,
  },
  mbtiType: { type: String },
  decisionStyle: { type: String },
  primaryBias: { type: String },
  onboardingCompleted: { type: Boolean, default: false },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Pre-save hook to update updated_at
userSchema.pre('save', function(next) {
  this.updated_at = new Date()
  next()
})

// Add a method to compare passwords
userSchema.method('comparePassword', async function(candidatePassword: string) {
  try {
    return await compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
})

// Prevent model recompilation in development
const User = models.User || model('User', userSchema)

export { User }

export interface IUser extends mongoose.Document {
  email: string
  password?: string
  username?: string
  provider: 'credentials' | 'google' | 'github'
  mbtiType?: string
  decisionStyle?: string
  primaryBias?: string
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
} 
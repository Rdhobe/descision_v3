import mongoose, { Schema, model, models } from 'mongoose'

const userProgressSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  },
  completed_scenarios: [{
    scenario_id: {
      type: Schema.Types.ObjectId,
      ref: 'Scenario'
    },
    option_chosen: String,
    is_correct: Boolean,
    completed_at: {
      type: Date,
      default: Date.now
    }
  }],
  last_challenges_date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  daily_challenges: [{
    challenge_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    generated_at: {
      type: Date,
      default: Date.now
    }
  }],
  rationality_score: {
    type: Number,
    default: 0
  },
  empathy_score: {
    type: Number,
    default: 0
  },
  clarity_score: {
    type: Number,
    default: 0
  },
  decisiveness_score: {
    type: Number,
    default: 0
  },
  last_active: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Pre-save hook to update last_active
userProgressSchema.pre('save', function(next) {
  this.last_active = new Date()
  next()
})

// Prevent model recompilation in development
const UserProgress = models.UserProgress || model('UserProgress', userProgressSchema)

export { UserProgress } 
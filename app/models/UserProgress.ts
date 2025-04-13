import mongoose from 'mongoose'

const userProgressSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  completed_scenarios: [{
    scenario_id: { type: String, required: true },
    option_chosen: { type: String, required: true },
    is_correct: { type: Boolean, required: true },
    completed_at: { type: Date, default: Date.now }
  }]
})

export default mongoose.models.UserProgress || mongoose.model('UserProgress', userProgressSchema) 
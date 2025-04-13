import mongoose, { Schema, model, models, Document } from 'mongoose'

interface IOption {
  text: string;
  is_correct: boolean;
  feedback?: string;
}

export interface IScenario extends Document {
  title: string;
  description: string;
  content: string;
  category: string;
  creator_id: string;
  xp_reward: number;
  difficulty: number;
  type: 'scenario' | 'daily_challenge';
  active_date?: Date;
  options: IOption[];
  created_at: Date;
  updated_at: Date;
  attempts: number;
  successful_attempts: number;
}

const optionSchema = new Schema({
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true
  },
  is_correct: {
    type: Boolean,
    required: true,
    default: false
  },
  feedback: {
    type: String,
    trim: true
  }
});

const scenarioSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  creator_id: {
    type: String,
    required: [true, 'Creator ID is required']
  },
  xp_reward: {
    type: Number,
    required: true,
    default: 10,
    min: [1, 'XP reward must be at least 1']
  },
  difficulty: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Difficulty must be at least 1'],
    max: [5, 'Difficulty cannot exceed 5']
  },
  type: {
    type: String,
    enum: {
      values: ['scenario', 'daily_challenge'],
      message: '{VALUE} is not a valid type'
    },
    default: 'scenario',
    required: true
  },
  active_date: {
    type: Date,
    validate: {
      validator: function(this: IScenario, value: Date | undefined) {
        if (this.type === 'daily_challenge' && !value) {
          return false;
        }
        return true;
      },
      message: 'Active date is required for daily challenges'
    }
  },
  options: {
    type: [optionSchema],
    required: true,
    validate: {
      validator: function(options: IOption[]) {
        return options.length >= 2 && options.some(opt => opt.is_correct);
      },
      message: 'At least 2 options are required and one must be correct'
    }
  },
  attempts: {
    type: Number,
    default: 0
  },
  successful_attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Add index for faster queries
scenarioSchema.index({ type: 1, active_date: 1 });
scenarioSchema.index({ creator_id: 1 });

export const Scenario = models.Scenario || model<IScenario>('Scenario', scenarioSchema); 
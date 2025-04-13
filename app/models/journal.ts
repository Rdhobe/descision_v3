import mongoose, { Schema, model, models, Document } from 'mongoose'

export interface IJournalEntry extends Document {
  userId: string
  date: Date
  context: string
  options: string[]
  decision: string
  reflection: string
  createdAt: Date
  updatedAt: Date
}

const journalEntrySchema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  context: {
    type: String,
    required: [true, 'Context is required'],
    trim: true,
  },
  options: [{
    type: String,
    required: [true, 'Options are required'],
    trim: true,
  }],
  decision: {
    type: String,
    required: [true, 'Decision is required'],
    trim: true,
  },
  reflection: {
    type: String,
    required: [true, 'Reflection is required'],
    trim: true,
  },
}, {
  timestamps: true,
})

// Pre-save hook to update timestamps
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Use existing model if it exists, otherwise create a new one
export const JournalEntry = models.JournalEntry || model<IJournalEntry>('JournalEntry', journalEntrySchema) 
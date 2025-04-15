import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: {
    sender: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
    readBy: mongoose.Types.ObjectId[];
  }[];
  lastMessage: {
    content: string;
    timestamp: Date;
    sender: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Create index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema); 
import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: {
    sender: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
    readBy: mongoose.Types.ObjectId[];
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    messageType?: 'text' | 'file' | 'scenario' | 'challenge';
    scenarioId?: mongoose.Types.ObjectId;
    scenarioData?: {
      title: string;
      description: string;
      category: string;
      difficulty: number;
      xp_reward: number;
    };
  }[];
  lastMessage: {
    content: string;
    timestamp: Date;
    sender: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
  unreadCount: Map<mongoose.Types.ObjectId, number>;
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
    }],
    fileUrl: {
      type: String
    },
    fileName: {
      type: String
    },
    fileType: {
      type: String
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'scenario', 'challenge'],
      default: 'text'
    },
    scenarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Scenario'
    },
    scenarioData: {
      title: String,
      description: String,
      category: String,
      difficulty: Number,
      xp_reward: Number
    }
  }],
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Create index for faster queries
chatSchema.index({ participants: 1 });

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema); 
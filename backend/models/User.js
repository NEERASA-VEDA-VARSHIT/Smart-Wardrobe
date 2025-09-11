import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    avatar: { 
      type: String, 
      default: null 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Strategic indexes for optimal performance
userSchema.index({ email: 1 }, { unique: true }); // Email lookup
userSchema.index({ isActive: 1 }); // Active users
userSchema.index({ createdAt: -1 }); // Recent users
userSchema.index({ 'name': 'text', 'email': 'text' }); // Text search

// Method to get user statistics
userSchema.methods.getStats = async function() {
  const Cloth = mongoose.model('Cloth');
  const Collection = mongoose.model('Collection');
  
  const [clothCount, collectionCount] = await Promise.all([
    Cloth.countDocuments({ userId: this._id }),
    Collection.countDocuments({ ownerId: this._id, isActive: true })
  ]);
  
  return {
    clothCount,
    collectionCount,
    memberSince: this.createdAt
  };
};

// Method to deactivate user (soft delete)
userSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

export const User = mongoose.model('User', userSchema);

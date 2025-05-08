import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['invoice', 'receipt', 'bank_statement', 'tax_form', 'other'],
    default: 'other',
  },
  fileUrl: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['processing', 'processed', 'error'],
    default: 'processing',
  },
  workflowId: {
    type: String,
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  validationResults: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  complianceStatus: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent overwriting if model exists (for Next.js hot reloading)
const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

export default Document; 
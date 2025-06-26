import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
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
  },
  size: {
    type: Number,
  },
  mimeType: {
    type: String,
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
  },
  validationResults: {
    type: mongoose.Schema.Types.Mixed,
  },
  complianceStatus: {
    type: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

// Use mongoose models if they exist, or create new ones
export default mongoose.models.Document || mongoose.model('Document', DocumentSchema); 
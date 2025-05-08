import { NextResponse } from "next/server";
import { scanDocument } from "@/lib/gemini";
import { getServerSession } from "next-auth/next";
import orkesClient from "@/lib/orkes";
import connectToDatabase from '@/lib/db';
import Document from '@/lib/models/Document';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { authOptions } from '@/lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const documentType = formData.get('documentType') || 'other';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Get file metadata
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const fileSize = file.size;
    const fileMimeType = file.type;
    
    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      fileBuffer,
      fileName,
      `taxmate-${session.user.id}`
    );
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Create document record
    const documentRecord = new Document({
      userId: session.user.id,
      name: fileName,
      type: documentType,
      fileUrl: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      size: fileSize,
      mimeType: fileMimeType,
      status: 'processing',
    });
    
    // Save to database
    await documentRecord.save();
    
    // Start document workflow
    const workflowResult = await orkesClient.startDocumentWorkflow({
      id: documentRecord._id.toString(),
      userId: session.user.id,
      type: documentType,
      name: fileName,
      size: fileSize,
      mimeType: fileMimeType,
      fileUrl: cloudinaryResult.secure_url,
    });
    
    // Update document with workflow ID
    documentRecord.workflowId = workflowResult.workflowId;
    await documentRecord.save();
    
    // Return response
    return NextResponse.json({
      success: true,
      document: {
        id: documentRecord._id.toString(),
        name: fileName,
        type: documentType,
        fileUrl: cloudinaryResult.secure_url,
        size: fileSize,
        workflowId: workflowResult.workflowId,
        workflowStatus: workflowResult.status,
        initialScanResults: workflowResult.initialScanResults || null,
      },
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET documents by user ID
export async function getUserDocuments(userId) {
  try {
    await connectToDatabase();
    
    const documents = await Document.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
      
    return documents;
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
}

/**
 * GET handler for checking workflow status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    
    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }
    
    const status = await orkesClient.getWorkflowStatus(workflowId);
    
    // If workflow is completed, update the document in the database
    if (status.status === 'COMPLETED' && status.output) {
      try {
        await connectToDatabase();
        
        // Find the document with this workflowId
        const document = await Document.findOne({ workflowId });
        
        if (document) {
          // Update with processing results
          document.status = 'processed';
          document.extractedData = status.output.extractedData || null;
          document.validationResults = status.output.validationResults || null;
          document.complianceStatus = status.output.complianceStatus || null;
          await document.save();
        }
      } catch (dbError) {
        console.error('Error updating document in database:', dbError);
        // Continue to return the status even if DB update fails
      }
    } else if (status.status === 'FAILED') {
      try {
        await connectToDatabase();
        
        // Find the document with this workflowId
        const document = await Document.findOne({ workflowId });
        
        if (document) {
          document.status = 'error';
          await document.save();
        }
      } catch (dbError) {
        console.error('Error updating document status to error:', dbError);
      }
    }
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking workflow status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
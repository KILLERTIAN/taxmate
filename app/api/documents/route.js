import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/db';
import Document from '@/lib/models/Document';
import { authOptions } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { startDocumentWorkflow, getWorkflowStatus } from '@/lib/orkes';

/**
 * GET handler to retrieve user documents
 */
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // If a specific document is requested
    if (documentId) {
      const document = await Document.findOne({ 
        _id: documentId,
        userId: session.user.id
      });
      
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      
      // If the document is still processing and has a workflow ID, check the status
      if (document.status === 'processing' && document.workflowId) {
        try {
          const workflowStatus = await getWorkflowStatus(document.workflowId);
          
          // If workflow completed, update document with results
          if (workflowStatus.status === 'COMPLETED' && workflowStatus.output) {
            document.status = 'processed';
            document.extractedData = workflowStatus.output.extractedData || null;
            document.validationResults = workflowStatus.output.validationResults || null;
            document.complianceStatus = workflowStatus.output.complianceStatus || null;
            await document.save();
          } else if (workflowStatus.status === 'FAILED') {
            document.status = 'error';
            await document.save();
          }
        } catch (error) {
          console.error('Error checking workflow status:', error);
          // Continue even if workflow check fails
        }
      }
      
      // Convert document to a plain object for response
      const documentObj = document.toObject();
      documentObj.id = documentObj._id.toString();
      delete documentObj._id;
      delete documentObj.__v;
      
      return NextResponse.json({ document: documentObj });
    }
    
    // Otherwise, get all documents for user
    const documents = await Document.find({ userId: session.user.id })
      .sort({ createdAt: -1 });
      
    // Check status of processing documents
    for (const doc of documents) {
      if (doc.status === 'processing' && doc.workflowId) {
        try {
          const workflowStatus = await getWorkflowStatus(doc.workflowId);
          
          if (workflowStatus.status === 'COMPLETED' && workflowStatus.output) {
            doc.status = 'processed';
            doc.extractedData = workflowStatus.output.extractedData || null;
            doc.validationResults = workflowStatus.output.validationResults || null;
            doc.complianceStatus = workflowStatus.output.complianceStatus || null;
            await doc.save();
          } else if (workflowStatus.status === 'FAILED') {
            doc.status = 'error';
            await doc.save();
          }
        } catch (error) {
          console.error(`Error checking workflow for document ${doc._id}:`, error);

        }
      }
    }
    

    const documentObjects = documents.map(doc => {
      const docObj = doc.toObject();
      docObj.id = docObj._id.toString();
      delete docObj._id;
      delete docObj.__v;
      return docObj;
    });
    
    return NextResponse.json({ documents: documentObjects });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a document
 */
export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find the document
    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.id
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Delete from database
    await Document.deleteOne({ _id: documentId });
    
    // In a complete implementation, you would also delete the file from storage
    // e.g., from Cloudinary using the cloudinaryId
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/db';
import Document from '@/lib/models/Document';
import { authOptions } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    await connectToDatabase();
    
    // If a specific document is requested
    if (documentId) {
      const document = await Document.findOne({
        _id: documentId,
        userId: session.user.id
      }).lean();
      
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      
      return NextResponse.json({ document });
    }
    
    // Build query for filtered documents
    const query = { userId: session.user.id };
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Get documents with pagination
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ 
      documents,
      total: await Document.countDocuments(query)
    });
    
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
    
    await connectToDatabase();
    
    // Find the document
    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.id
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Delete from Cloudinary if it has a cloudinaryId
    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId);
    }
    
    // Delete from database
    await Document.deleteOne({ _id: documentId });
    
    return NextResponse.json({ 
      success: true,
      message: 'Document successfully deleted' 
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
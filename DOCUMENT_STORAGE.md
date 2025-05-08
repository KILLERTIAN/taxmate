# Document Storage in TaxMate

This document explains how document storage works in the TaxMate application.

## Architecture

TaxMate uses a combination of Cloudinary for file storage and MongoDB for document metadata and processing results:

1. **Cloudinary** - Cloud-based media storage service for storing the actual document files
2. **MongoDB** - Database for storing document metadata, workflow status, and processing results

## Flow for Document Storage

1. User uploads a document through the DocumentUpload component
2. The document is sent to the API endpoint (`/api/upload`)
3. The API endpoint uploads the file to Cloudinary
4. A record is created in MongoDB with the document metadata and Cloudinary URL
5. The document processing workflow is started with Orkes Conductor
6. Once processing is complete, the workflow results are stored in MongoDB

## MongoDB Schema

Documents are stored in MongoDB with the following schema:

- **_id**: Unique document identifier
- **userId**: The user who uploaded the document
- **name**: Original filename
- **type**: Document type (invoice, receipt, bank_statement, tax_form, other)
- **fileUrl**: Cloudinary URL for the document
- **cloudinaryId**: Cloudinary public ID for deleting the file
- **size**: File size in bytes
- **mimeType**: File MIME type
- **status**: Processing status (processing, processed, error)
- **workflowId**: Orkes Conductor workflow ID
- **extractedData**: Processed document data
- **validationResults**: Document validation results
- **complianceStatus**: Tax compliance status
- **createdAt**: Document upload timestamp
- **updatedAt**: Last update timestamp

## API Endpoints

- **POST /api/upload** - Upload a new document
- **GET /api/upload?workflowId=xxx** - Check workflow status
- **GET /api/documents** - List user's documents
- **GET /api/documents?documentId=xxx** - Get specific document
- **DELETE /api/documents?documentId=xxx** - Delete a document

## Environment Configuration

To set up document storage, the following environment variables need to be configured:

```
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/taxmate?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Implementation Notes

1. Documents are automatically stored in Cloudinary in a folder structure based on the user ID
2. Document processing status is updated in real-time as the workflow progresses
3. When a document is deleted, both the MongoDB record and the Cloudinary file are removed
4. Documents are fetched directly from MongoDB for the dashboard view
5. Individual document fields are displayed based on document type in the details view 
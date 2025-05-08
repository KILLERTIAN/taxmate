# TaxMate - Tax Management for Freelancers

TaxMate is a comprehensive tax management application designed specifically for freelancers and independent contractors. It helps simplify tax document management, automates tax calculations, and ensures compliance with tax regulations.

![TaxMate Logo](/public/images/bill.png)

## Features

- **Document Management**: Upload, store, and organize all your tax-related documents in one place
- **Intelligent Document Processing**: AI-powered extraction of data from receipts, invoices, and tax forms
- **Tax Compliance Checks**: Automatic verification of tax documents for compliance with regulations
- **Document Analytics**: Gain insights from your financial documents with detailed reports
- **Secure Cloud Storage**: Store all your documents securely on the cloud with Cloudinary
- **Responsive Design**: Access your tax information from any device

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Shadcn UI
- **Authentication**: NextAuth.js with support for Google OAuth and credentials
- **Storage**: MongoDB for document metadata, Cloudinary for file storage
- **AI Integration**: Google Gemini AI for document processing
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- MongoDB database
- Cloudinary account
- Google API credentials (for authentication)

### Environment Setup

Create a `.env.local` file in the root directory with the following configuration:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/taxmate?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google AI
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taxmate.git
   cd taxmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Document Storage Architecture

TaxMate uses a combination of MongoDB and Cloudinary for document storage:

- **Cloudinary** handles the storage of actual document files
- **MongoDB** stores document metadata, processing status, and extracted information

For more details on the document storage architecture, please refer to [DOCUMENT_STORAGE.md](DOCUMENT_STORAGE.md).

## API Documentation

### Authentication Endpoints

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/signin**: Sign in with credentials

### Document Endpoints

- **POST /api/upload**: Upload a new document
- **GET /api/documents**: List user's documents
- **GET /api/documents?documentId=xxx**: Get specific document details
- **DELETE /api/documents?documentId=xxx**: Delete a document

## Deployment

The application is configured for easy deployment on Vercel:

```bash
npx vercel
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

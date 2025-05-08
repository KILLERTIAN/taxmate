# Deploying TaxMate

This guide provides instructions for deploying TaxMate to production using Vercel.

## Prerequisites

Before deploying, you'll need:

1. A [Vercel](https://vercel.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database
3. A [Cloudinary](https://cloudinary.com/) account for document storage
4. [Google OAuth](https://console.cloud.google.com/) credentials for authentication

## Environment Variables

Set up the following environment variables in your Vercel project settings:

```
# NextAuth Configuration
NEXTAUTH_URL=https://your-production-url.com
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

# Google AI (if used)
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## Deployment Steps

1. Push your code to a GitHub repository
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in the Vercel project settings
4. Deploy the application

## Using the Vercel CLI

Alternatively, you can deploy using the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Production Checks

After deployment, verify:

1. Authentication is working correctly
2. Document uploads and storage are functioning
3. Database connections are established
4. All pages load without errors

## Troubleshooting

- If you encounter CORS issues with Cloudinary, add your production domain to the allowed origins in your Cloudinary settings.
- For MongoDB connection issues, ensure your MongoDB Atlas cluster allows connections from your Vercel deployment IP addresses.
- For NextAuth issues, make sure your Google OAuth credentials have the correct redirect URIs configured.

## Performance Optimization

- Enable Vercel's Edge Functions for improved global performance
- Configure Vercel's ISR (Incremental Static Regeneration) for pages that don't change frequently
- Use Vercel's Analytics to monitor application performance

## Custom Domain

To use a custom domain:

1. Add your domain in Vercel project settings
2. Update DNS records with your domain registrar
3. Configure SSL certificates (Vercel handles this automatically)
4. Update the `NEXTAUTH_URL` environment variable to your custom domain 
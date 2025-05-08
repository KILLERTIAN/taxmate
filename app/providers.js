"use client";

import { useState, useEffect } from 'react';
import { AuthProvider } from "@/components/AuthProvider";

export function Providers({ children }) {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initializeDb() {
      try {
        // Initialize database connection on client-side
        // This only triggers the connection - the actual connection happens server-side
        const response = await fetch('/api/db/init');
        if (!response.ok) {
          throw new Error('Failed to initialize database connection');
        }
        setDbInitialized(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err.message);
      }
    }

    initializeDb();
  }, []);

  if (error) {
    // You could render a more graceful error state here
    console.warn('DB initialization error, proceeding without database connection');
  }

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
} 
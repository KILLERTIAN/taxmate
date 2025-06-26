"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceDetails from "@/components/InvoiceDetails";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function DocumentViewer({ document, onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!document) {
    return (
      <Card className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Document Viewer</CardTitle>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <CardDescription>No document selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Display the appropriate document viewer based on type
  const renderDocumentContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="h-10 w-10 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Processing document...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 font-medium mb-2">Error processing document</p>
          <p className="text-gray-600 dark:text-gray-400 text-center">{error}</p>
        </div>
      );
    }
    
    if (!document.extractedData) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">No extracted data available</p>
          <p className="text-gray-600 dark:text-gray-400 text-center">This document has not been processed yet or could not be processed.</p>
        </div>
      );
    }
    
    // Display different document types
    switch (document.type) {
      case "invoice":
        return <InvoiceDetails invoice={document} />;
      
      case "receipt":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Receipt Details</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(document.extractedData, null, 2)}
            </pre>
          </div>
        );
      
      case "bank_statement":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Bank Statement Details</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(document.extractedData, null, 2)}
            </pre>
          </div>
        );
      
      case "tax_form":
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Tax Form Details</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(document.extractedData, null, 2)}
            </pre>
          </div>
        );
      
      default:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Document Details</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(document.extractedData, null, 2)}
            </pre>
          </div>
        );
    }
  };
  
  return (
    <Card className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            <CardTitle>{document.name}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <CardDescription>
          {document.status === "processed" ? (
            <span className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              Processed successfully
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              Status: {document.status}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderDocumentContent()}
      </CardContent>
      
      {document.extractedData && document.complianceStatus && (
        <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="w-full">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Compliance Status
            </h3>
            <div className="flex items-start">
              {document.complianceStatus.compliant ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>Document is compliant with regulations</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  <span>Document has compliance issues</span>
                </div>
              )}
            </div>
            
            {document.complianceStatus.recommendations?.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Recommendations
                </h4>
                <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc list-inside">
                  {document.complianceStatus.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 
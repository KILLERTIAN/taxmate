"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText, CreditCard, Receipt, FileCheck, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const DocumentReport = ({ documents, onBack }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [summaryByType, setSummaryByType] = useState({});
  const [reportDate] = useState(new Date());

  useEffect(() => {
    if (!documents || !documents.length) return;

    // Calculate totals and summaries
    let amount = 0;
    let tax = 0;
    const typeSummary = {};

    documents.forEach(doc => {
      // Get the document data (could be in extractedData or directly in the doc)
      const data = doc.extractedData || doc;
      
      // Track document counts by type
      const type = doc.documentType || "other";
      typeSummary[type] = (typeSummary[type] || 0) + 1;
      
      // Extract financial information based on document type
      if (type === "invoice" || type === "receipt") {
        amount += parseFloat(data.totalAmount || 0);
        tax += parseFloat(data.taxAmount || 0);
      } else if (type === "tax_form") {
        amount += parseFloat(data.totalTaxPayable || 0);
      }
    });

    setTotalAmount(amount);
    setTotalTax(tax);
    setSummaryByType(typeSummary);
  }, [documents]);

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });
  };

  const formatDate = (date) => {
    return format(date, "MMMM d, yyyy");
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case "invoice":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "receipt":
        return <Receipt className="h-5 w-5 text-green-500" />;
      case "tax_form":
        return <FileCheck className="h-5 w-5 text-purple-500" />;
      case "bank_statement":
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      default:
        return <FileWarning className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!documents || !documents.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Document Report</CardTitle>
          <CardDescription>No documents processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileWarning className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents found for reporting</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Tax Document Report</CardTitle>
              <CardDescription>Summary of processed documents</CardDescription>
            </div>
            <Badge className="bg-green-500">Completed</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tax</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalTax)}</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 dark:text-gray-400">Documents Processed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
              </div>
            </div>
          </div>

          {/* Document Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Document Breakdown</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(summaryByType).map(([type, count]) => (
                    <tr key={type}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {getDocumentIcon(type)}
                          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {type.replace('_', ' ')}s
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Document List</h3>
            <div className="space-y-2">
              {documents.map((doc, index) => {
                const data = doc.extractedData || doc;
                const documentType = doc.documentType || "other";
                
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getDocumentIcon(documentType)}
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.fileName || data.documentName || `Document ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {documentType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {(documentType === "invoice" || documentType === "receipt") && (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(parseFloat(data.totalAmount || 0))}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DocumentReport; 
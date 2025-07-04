"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentReport from "@/components/DocumentReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  FileWarning,
  Filter,
  Search,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import DocumentViewer from "@/components/DocumentViewer";

// Wrapper component to handle search params
function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showDetails, setShowDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("documents");
  const [reportData, setReportData] = useState(null);

  // Check if we should show report view
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'report') {
      setActiveTab('reports');
      
      // Try to get report data from sessionStorage
      try {
        const storedReportData = sessionStorage.getItem('taxmateReportData');
        if (storedReportData) {
          setReportData(JSON.parse(storedReportData));
        }
      } catch (error) {
        console.error('Error retrieving report data:', error);
      }
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Replace the useEffect that sets mock documents with this one
  useEffect(() => {
    // Fetch user's documents if authenticated
    const fetchDocuments = async () => {
      if (!session || !session.user) return;
      
      try {
        const response = await fetch(`/api/documents`);
        
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents.map(doc => ({
            id: doc._id,
            name: doc.name,
            type: doc.type,
            status: doc.status,
            date: doc.createdAt,
            fileUrl: doc.fileUrl,
            extractedData: doc.extractedData,
            validationResults: doc.validationResults,
            complianceStatus: doc.complianceStatus,
            workflowId: doc.workflowId
          })));
        } else {
          console.error('Error fetching documents:', await response.text());
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };
    
    fetchDocuments();
  }, [session]);

  // Handle document upload success
  const handleUploadSuccess = (newDocuments) => {
    if (!newDocuments || !newDocuments.length) return;
    
    // Refresh the documents list from the API
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/documents`);
        
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents.map(doc => ({
            id: doc._id,
            name: doc.name,
            type: doc.type,
            status: doc.status,
            date: doc.createdAt,
            fileUrl: doc.fileUrl,
            extractedData: doc.extractedData,
            validationResults: doc.validationResults,
            complianceStatus: doc.complianceStatus,
            workflowId: doc.workflowId
          })));
        }
      } catch (error) {
        console.error('Failed to fetch updated documents:', error);
      }
    };
    
    fetchDocuments();
  };

  // Handle view document details
  const handleViewDocument = (doc) => {
    setShowDetails(doc);
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    
    // Type filter
    const matchesType = filterType === "all" || doc.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status badge for documents
  const getStatusBadge = (status) => {
    switch(status) {
      case "processed":
        return <Badge className="bg-green-500">Processed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  // Get document type icon
  const getDocumentIcon = (type) => {
    switch(type) {
      case "invoice":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "receipt":
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case "tax_form":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "bank_statement":
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    // Clear report view URL parameter if not on reports tab
    if (value !== 'reports' && searchParams.get('view') === 'report') {
      router.push('/dashboard');
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="documents">My Documents</TabsTrigger>
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="reports">Tax Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>My Documents</CardTitle>
                  <CardDescription>
                    Manage your uploaded documents and view their processing status
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search documents..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="relative inline-block">
                        <select
                          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 pr-8 text-sm"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="processed">Processed</option>
                          <option value="processing">Processing</option>
                          <option value="error">Error</option>
                        </select>
                        <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                      <div className="relative inline-block">
                        <select
                          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 pr-8 text-sm"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="all">All Types</option>
                          <option value="invoice">Invoices</option>
                          <option value="receipt">Receipts</option>
                          <option value="tax_form">Tax Forms</option>
                          <option value="bank_statement">Bank Statements</option>
                          <option value="other">Other</option>
                        </select>
                        <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileWarning className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No documents found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {searchTerm || filterStatus !== "all" || filterType !== "all" 
                          ? "Try changing your search or filters"
                          : "Upload some documents to get started"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Document</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDocuments.map((doc) => (
                            <tr 
                              key={doc.id} 
                              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getDocumentIcon(doc.type)}
                                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                    {doc.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                  {doc.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(doc.date)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {getStatusBadge(doc.status)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDocument(doc)}
                                    disabled={doc.status !== "processed"}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={doc.status !== "processed"}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(`/api/documents?documentId=${doc.id}`, {
                                          method: 'DELETE',
                                        });
                                        
                                        if (response.ok) {
                                          // Remove from local state
                                          setDocuments(docs => docs.filter(d => d.id !== doc.id));
                                          
                                          // Close details view if open
                                          if (showDetails?.id === doc.id) {
                                            setShowDetails(null);
                                          }
                                        } else {
                                          console.error('Failed to delete document:', await response.text());
                                        }
                                      } catch (error) {
                                        console.error('Error deleting document:', error);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredDocuments.length} of {documents.length} documents
                  </p>
                </CardFooter>
              </Card>
              
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <DocumentViewer
                    document={showDetails}
                    onBack={() => setShowDetails(null)}
                  />
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="upload">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload your tax documents for processing and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload onUploadSuccess={handleUploadSuccess} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Tax Reports</CardTitle>
                  <CardDescription>
                    Generate and view tax reports based on your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData ? (
                    <DocumentReport 
                      documents={reportData.documents} 
                      onBack={() => {
                        setReportData(null);
                        router.push('/dashboard');
                      }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No reports available</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">
                        Upload and process documents to generate tax reports
                      </p>
                      <Button 
                        onClick={() => setActiveTab("upload")}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                      >
                        Upload Documents
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 
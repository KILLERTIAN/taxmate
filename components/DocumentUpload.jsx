"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const DocumentUpload = ({ onUploadSuccess }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState("invoice");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadResults, setUploadResults] = useState([]);
  const [processingFiles, setProcessingFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState([]);

  // Polling for workflow status
  useEffect(() => {
    if (!processingFiles.length) return;

    const pollingInterval = setInterval(async () => {
      const updatedProcessingFiles = [...processingFiles];
      let shouldUpdateState = false;
      let successfulOutputs = [];
      
      for (let i = 0; i < updatedProcessingFiles.length; i++) {
        const file = updatedProcessingFiles[i];
        
        // Skip if not in "processing" state anymore
        if (file.workflowStatus !== "RUNNING") continue;
        
        try {
          const response = await fetch(`/api/upload?workflowId=${file.workflowId}`);
          if (response.ok) {
            const data = await response.json();
            
            if (data.status !== file.workflowStatus) {
              shouldUpdateState = true;
              updatedProcessingFiles[i] = {
                ...file,
                workflowStatus: data.status,
                output: data.output,
                endTime: data.endTime,
              };
              
              // If this file was completed successfully, add to outputs list
              if (data.status === "COMPLETED" && data.output) {
                successfulOutputs.push(data.output);
                // Add to processed documents for the report view
                setProcessedDocuments(prev => [...prev, {
                  ...data.output,
                  fileName: file.fileName,
                  documentType: file.documentType
                }]);
              }
            }
          }
        } catch (error) {
          console.error(`Error polling workflow status for ${file.id}:`, error);
          // Mark file as error but don't stop polling other files
          updatedProcessingFiles[i] = {
            ...file,
            workflowStatus: "FAILED",
            error: error.message || "Failed to check status"
          };
          shouldUpdateState = true;
        }
      }
      
      if (shouldUpdateState) {
        setProcessingFiles(updatedProcessingFiles);
        
        // Update the file statuses in the main files array too
        setFiles(prevFiles => {
          return prevFiles.map(file => {
            const processingFile = updatedProcessingFiles.find(pf => pf.id === file.id);
            if (processingFile) {
              return {
                ...file,
                status: processingFile.workflowStatus === "COMPLETED" ? "success" : 
                        processingFile.workflowStatus === "FAILED" ? "error" :
                        processingFile.workflowStatus === "RUNNING" ? "uploading" : "pending",
                output: processingFile.output,
                error: processingFile.error
              };
            }
            return file;
          });
        });
        
        // Check if all files are processed
        const allCompleted = updatedProcessingFiles.every(file => 
          file.workflowStatus === "COMPLETED"
        );
        
        const allFailed = updatedProcessingFiles.every(file => 
          file.workflowStatus === "FAILED"
        );
        
        // Notify parent of any successful outputs
        if (successfulOutputs.length > 0 && onUploadSuccess) {
          onUploadSuccess(successfulOutputs);
        }
        
        if (allCompleted) {
          setUploadStatus("success");
          // Set flag to redirect to report view after a short delay
          if (processedDocuments.length > 0) {
            setShouldRedirect(true);
          }
          
          // Remove completed files after a delay
          setTimeout(() => {
            setFiles(prev => prev.filter(f => 
              !updatedProcessingFiles.some(pf => pf.id === f.id)
            ));
            setProcessingFiles([]);
          }, 3000);
        } else if (allFailed) {
          setUploadStatus("error");
        } else if (updatedProcessingFiles.some(file => file.workflowStatus === "COMPLETED")) {
          setUploadStatus("partial");
        }
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(pollingInterval);
  }, [processingFiles, onUploadSuccess]);

  // Effect to handle redirect to report view
  useEffect(() => {
    if (shouldRedirect && processedDocuments.length > 0) {
      // Create a state object with processed documents to pass to the report page
      const reportData = {
        documents: processedDocuments,
        uploadDate: new Date().toISOString()
      };
      
      // Store report data in sessionStorage for the report page
      sessionStorage.setItem('taxmateReportData', JSON.stringify(reportData));
      
      // Wait a moment to show success message before redirecting
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard?view=report');
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [shouldRedirect, processedDocuments, router]);

  const onDrop = useCallback((acceptedFiles) => {
    // Add unique IDs to files for tracking
    const filesWithIds = acceptedFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      file,
      status: "pending", // pending, uploading, success, error
      documentType // Set the current selected document type as default for each file
    }));
    setFiles(prevFiles => [...prevFiles, ...filesWithIds]);
  }, [documentType]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 10485760, // 10MB
    onDropRejected: (rejections) => {
      const errors = rejections.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return `${rejection.file.name} is too large (max 10MB)`;
        }
        return `${rejection.file.name}: ${rejection.errors[0].message}`;
      });
      setUploadError(errors.join(', '));
    }
  });

  const removeFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    setProcessingFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  };

  // Allow changing document type per file
  const updateFileDocumentType = (fileId, newType) => {
    setFiles(prevFiles => 
      prevFiles.map(f => f.id === fileId ? { ...f, documentType: newType } : f)
    );
  };

  const handleUpload = async () => {
    if (files.length === 0 || !session) return;
    
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("processing");
    setUploadResults([]);
    setUploadError(null);
    setProcessedDocuments([]);
    setShouldRedirect(false);

    const pendingFiles = files.filter(f => f.status === "pending");
    const results = [];
    const newProcessingFiles = [];
    
    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const fileObj = pendingFiles[i];
        
        // Update individual file status
        setFiles(prev => 
          prev.map(f => f.id === fileObj.id ? { ...f, status: "uploading" } : f)
        );
        
        const formData = new FormData();
        formData.append("file", fileObj.file);
        // Use file-specific document type instead of global
        formData.append("documentType", fileObj.documentType || documentType);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Upload failed");
          }

          // Update the file status based on the workflow initiation
          setFiles(prev => 
            prev.map(f => f.id === fileObj.id ? { 
              ...f, 
              status: "uploading",
              workflowId: result.document.workflowId,
              documentId: result.document.id,
              fileUrl: result.document.fileUrl,
              documentType: result.document.type,
              workflowStatus: "RUNNING",
              initialResults: result.document.initialScanResults
            } : f)
          );
          
          // Add to processing files for status polling
          newProcessingFiles.push({
            id: fileObj.id,
            documentId: result.document.id,
            workflowId: result.document.workflowId,
            workflowStatus: "RUNNING",
            fileName: fileObj.file.name,
            fileUrl: result.document.fileUrl,
            documentType: result.document.type
          });
          
          results.push({
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            success: true,
            document: result.document,
            workflowId: result.document.workflowId,
            documentId: result.document.id
          });

        } catch (error) {
          // Update individual file status
          setFiles(prev => 
            prev.map(f => f.id === fileObj.id ? { ...f, status: "error", error: error.message } : f)
          );
          
          results.push({
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            success: false,
            error: error.message
          });
        }

        // Update overall progress
        setUploadProgress(((i + 1) / pendingFiles.length) * 100);
      }

      setUploadResults(results);
      
      // Add new processing files to the state for polling
      if (newProcessingFiles.length > 0) {
        setProcessingFiles(prev => [...prev, ...newProcessingFiles]);
      }
      
      const allSuccessful = results.every(r => r.success);
      if (!allSuccessful) {
        setUploadStatus("partial");
      }
      
    } catch (error) {
      console.error("Error during upload process:", error);
      setUploadStatus("error");
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Get status icon based on file status
  const getStatusIcon = (status, isAnimated = false, fileUrl = null) => {
    // If the file has been uploaded to Cloudinary, show a tiny preview icon
    if (fileUrl && (status === "success" || status === "COMPLETED")) {
      return (
        <div className="h-6 w-6 rounded-full overflow-hidden border border-green-500">
          <img src={fileUrl} alt="Preview" className="h-full w-full object-cover" />
        </div>
      );
    }
    
    // Otherwise, use the existing icon logic
    switch (status) {
      case "uploading":
        return isAnimated ? 
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /> :
          <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "RUNNING":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Label htmlFor="document-type" className="block text-sm font-medium mb-2">
          Document Type
        </Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger id="document-type" className="w-full max-w-xs" disabled={uploading}>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="receipt">Receipt</SelectItem>
            <SelectItem value="bank_statement">Bank Statement</SelectItem>
            <SelectItem value="tax_form">Tax Form</SelectItem>
            <SelectItem value="other">Other Document</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Selecting the correct document type helps improve the accuracy of document scanning.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive
                ? "Drop your files here"
                : "Drag & drop your files here"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to select files
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Supported formats: PDF, PNG, JPG, JPEG (Max 10MB)
            </p>
          </div>
        </motion.div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            <AnimatePresence>
              {files.map((fileObj) => (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        {fileObj.workflowId && (
                          <span className="ml-2">
                            • Workflow: {fileObj.workflowStatus || "Initializing"}
                          </span>
                        )}
                      </p>
                      {fileObj.initialResults?.preview && (
                        <p className="text-xs text-blue-500 mt-1">
                          Preview: {fileObj.initialResults.preview.detectedFields} fields detected
                        </p>
                      )}
                      {fileObj.status === "error" && (
                        <p className="text-xs text-red-500 mt-1">{fileObj.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Document type selector for individual files */}
                    {fileObj.status === "pending" && (
                      <Select 
                        value={fileObj.documentType || documentType} 
                        onValueChange={(value) => updateFileDocumentType(fileObj.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="bank_statement">Bank Statement</SelectItem>
                          <SelectItem value="tax_form">Tax Form</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {getStatusIcon(fileObj.workflowStatus || fileObj.status, true, fileObj.fileUrl)}
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 flex-shrink-0"
                      disabled={fileObj.status === "uploading" || fileObj.workflowStatus === "RUNNING"}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setFiles(prev => prev.filter(f => 
                  f.status === "uploading" || f.workflowStatus === "RUNNING"
                ));
              }}
              disabled={uploading || files.every(f => 
                f.status === "uploading" || f.workflowStatus === "RUNNING"
              )}
            >
              Clear Completed
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                uploading || 
                files.length === 0 || 
                !session || 
                !files.some(f => f.status === "pending")
              }
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
              {uploading ? "Processing..." : "Upload Files"}
            </Button>
          </div>

          {uploadError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-400">Upload Error</p>
                <p className="text-xs text-red-600 dark:text-red-500">{uploadError}</p>
              </div>
            </motion.div>
          )}

          {uploading && (
            <div className="w-full">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Processing {uploadProgress.toFixed(0)}% complete
              </p>
            </div>
          )}

          {processingFiles.length > 0 && !uploading && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Processing documents</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">
                  {processingFiles.length} {processingFiles.length === 1 ? 'document is' : 'documents are'} being processed by our workflow. This may take a few moments.
                </p>
              </div>
            </div>
          )}

          {uploadStatus === "success" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3"
            >
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-400">Upload successful!</p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  All documents were successfully uploaded and processed.
                </p>
              </div>
            </motion.div>
          )}

          {uploadStatus === "error" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-400">Upload failed</p>
                <p className="text-xs text-red-600 dark:text-red-500">
                  An error occurred during the upload. Please try again.
                </p>
              </div>
            </motion.div>
          )}

          {uploadStatus === "partial" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start space-x-3"
            >
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Partial success</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  Some documents were uploaded successfully, but others failed. Check the details above.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload; 
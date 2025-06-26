"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader, RefreshCw, Receipt, FileSpreadsheet, FileBox } from "lucide-react";
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
  const [documentTypes, setDocumentTypes] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
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
    console.log('Files dropped:', acceptedFiles);
    
    // Update files state with status "pending" for each file
    const updatedFiles = acceptedFiles.map(file => ({
      ...file,
      status: "pending"  // Explicitly set status to pending
    }));
    
    console.log('Files with status:', updatedFiles);
    
    setFiles(prevFiles => [...prevFiles, ...updatedFiles]);
    
    // Initialize document types for new files
    const newDocTypes = {};
    acceptedFiles.forEach(file => {
      // Try to auto-detect document type from filename
      let detectedType = 'other';
      const fileName = file.name.toLowerCase();
      
      if (fileName.includes('invoice') || fileName.includes('bill')) {
        detectedType = 'invoice';
      } else if (fileName.includes('receipt')) {
        detectedType = 'receipt';
      } else if (fileName.includes('statement') || fileName.includes('bank')) {
        detectedType = 'bank_statement';
      } else if (fileName.includes('tax') || fileName.includes('itr') || fileName.includes('form')) {
        detectedType = 'tax_form';
      }
      
      newDocTypes[file.name] = detectedType;
    });
    
    setDocumentTypes(prev => ({ ...prev, ...newDocTypes }));
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
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

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
    
    // Also remove from status and types
    const newStatus = {...uploadStatus};
    delete newStatus[fileName];
    setUploadStatus(newStatus);
    
    const newTypes = {...documentTypes};
    delete newTypes[fileName];
    setDocumentTypes(newTypes);
  };

  const handleDocTypeChange = (fileName, type) => {
    setDocumentTypes(prev => ({
      ...prev,
      [fileName]: type
    }));
  };

  const handleUpload = async () => {
    if (!session?.user || files.length === 0) return;

    setUploading(true);
    
    // Get only files that haven't been uploaded yet
    const filesToUpload = files.filter(file => 
      file.status === "pending" || !file.status
    );
    
    console.log('Files to upload:', filesToUpload.map(f => ({ name: f.name, status: f.status })));
    
    if (filesToUpload.length === 0) {
      console.log('No files to upload');
      setUploading(false);
      return;
    }
    
    // Update all files being uploaded to have status "uploading"
    setFiles(prevFiles => prevFiles.map(file => {
      if (filesToUpload.some(f => f.name === file.name)) {
        return {
          ...file,
          status: "uploading"
        };
      }
      return file;
    }));
    
    const newUploadStatus = {};
    const uploadedDocs = [];

    for (const file of filesToUpload) {
      try {
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentTypes[file.name] || 'other');
        formData.append('userId', session.user.id);
        
        newUploadStatus[file.name] = { status: 'uploading', message: 'Uploading...' };
        setUploadStatus({...uploadStatus, ...newUploadStatus});
        
        // Upload file
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        
        newUploadStatus[file.name] = { 
          status: 'success', 
          message: 'Upload successful. Processing document...',
          docId: uploadResult.documentId
        };
        
        // Update file status to success
        setFiles(prevFiles => prevFiles.map(f => 
          f.name === file.name ? { ...f, status: "success" } : f
        ));
        
        uploadedDocs.push(uploadResult.document);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        newUploadStatus[file.name] = { 
          status: 'error', 
          message: error.message || 'Upload failed'
        };
        
        // Update file status to error
        setFiles(prevFiles => prevFiles.map(f => 
          f.name === file.name ? { ...f, status: "error" } : f
        ));
      }
      
      setUploadStatus({...uploadStatus, ...newUploadStatus});
    }
    
    setUploading(false);
    
    // Call the success callback with uploaded documents
    if (uploadedDocs.length > 0 && onUploadSuccess) {
      onUploadSuccess(uploadedDocs);
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

  const getDocumentIcon = (fileName) => {
    const type = documentTypes[fileName] || 'other';
    
    switch(type) {
      case 'invoice':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'receipt':
        return <Receipt className="h-5 w-5 text-green-500" />;
      case 'bank_statement':
        return <FileSpreadsheet className="h-5 w-5 text-orange-500" />;
      case 'tax_form':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileBox className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Label htmlFor="document-type" className="block text-sm font-medium mb-2">
          Document Type
        </Label>
        <Select value={documentTypes[files[0]?.name] || 'other'} onValueChange={setDocumentTypes}>
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
              {files.map((file) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getDocumentIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="min-w-[140px]">
                      <Label htmlFor={`docType-${file.name}`} className="sr-only">Document Type</Label>
                      <Select 
                        value={documentTypes[file.name] || 'other'} 
                        onValueChange={(value) => handleDocTypeChange(file.name, value)}
                        disabled={!!uploadStatus[file.name]}
                      >
                        <SelectTrigger id={`docType-${file.name}`} className="w-full text-sm h-9">
                          <SelectValue placeholder="Document Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="bank_statement">Bank Statement</SelectItem>
                          <SelectItem value="tax_form">Tax Form</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {!uploadStatus[file.name] ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2"
                        onClick={() => removeFile(file.name)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2 min-w-[100px]">
                        {getStatusIcon(uploadStatus[file.name].status)}
                        <span className="text-xs">
                          {uploadStatus[file.name].status === 'uploading' ? 'Uploading...' : 
                           uploadStatus[file.name].status === 'success' ? 'Uploaded' : 'Failed'}
                        </span>
                      </div>
                    )}
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
            {console.log('Upload button render - files:', files.map(f => ({ name: f.name, status: f.status })))}
            <Button
              onClick={handleUpload}
              disabled={
                uploading || 
                files.length === 0 || 
                !session ||
                !files.some(file => !file.status || file.status === "pending")
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
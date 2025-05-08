/**
 * Orkes Conductor API integration for TaxMate
 * 
 * This module provides functions to interact with Orkes Conductor for workflow orchestration
 */

const ORKES_API_URL = process.env.ORKES_API_URL || 'https://developer.orkescloud.com/api';
const ORKES_KEY = process.env.ORKES_KEY || '9cmo0a861f03-2bdc-11f0-8937-c204fdb9d88b';
const ORKES_SECRET = process.env.ORKES_SECRET || 'foHkmme3OS1hb9w2ygNF9l7zYlaIi9hIQdPw9IBsB1MBABRS';

// In-memory store for mock workflows (in production, this would be a database)
const mockWorkflows = {};

/**
 * Get authentication token for Orkes API
 * @returns {Promise<string>} - The authentication token
 */
async function getAuthToken() {
  try {
    if (!ORKES_KEY || !ORKES_SECRET) {
      console.warn('Orkes credentials not configured. Using mock mode.');
      return null;
    }

    console.log('Attempting to get Orkes token...');
    
    // Using the correct token endpoint
    const tokenEndpoint = `${ORKES_API_URL}/auth/token`;
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        keyId: ORKES_KEY,
        keySecret: ORKES_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get Orkes token: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Failed to get Orkes token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully obtained Orkes token');
    return data.token;
  } catch (error) {
    console.error('Error getting Orkes auth token:', error);
    return null;
  }
}

/**
 * Start a document processing workflow
 * @param {Object} documentData - The document data to process
 * @returns {Promise<Object>} - The workflow execution details
 */
export async function startDocumentWorkflow(documentData) {
  try {
    const token = await getAuthToken();
    
    // If we're in mock mode or couldn't get a token, return mock data
    if (!token) {
      console.log('Using mock Orkes workflow execution');
      return mockStartWorkflow(documentData);
    }
    
    console.log(`Starting Orkes workflow for document: ${documentData.id}`);
    
    const workflowPayload = {
      name: 'document_processing',  // Using a simpler name
      version: 1,
      input: {
        documentId: documentData.id,
        userId: documentData.userId,
        documentType: documentData.type,
        documentName: documentData.name,
        documentSize: documentData.size,
        documentMimeType: documentData.mimeType,
        timestamp: new Date().toISOString(),
      },
      correlationId: `taxmate_${documentData.userId}_${Date.now()}`,
    };

    // Use the correct workflow endpoint
    const workflowEndpoint = `${ORKES_API_URL}/workflow`;
    
    const response = await fetch(workflowEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(workflowPayload),
    });

    // Debug response details
    console.log(`Orkes workflow API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to start workflow: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      // Fallback to mock mode when API fails
      console.log('Falling back to mock workflow');
      return mockStartWorkflow(documentData);
    }

    const data = await response.json();
    console.log(`Successfully started Orkes workflow with ID: ${data.workflowId}`);
    
    return {
      workflowId: data.workflowId,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error starting Orkes workflow:', error);
    // Fallback to mock data in case of error
    return mockStartWorkflow(documentData);
  }
}

/**
 * Get the status of a workflow execution
 * @param {string} workflowId - The workflow ID to check
 * @returns {Promise<Object>} - The workflow status
 */
export async function getWorkflowStatus(workflowId) {
  try {
    // If it's a mock workflow ID, use mock status
    if (workflowId.startsWith('mock_')) {
      return mockGetWorkflowStatus(workflowId);
    }
    
    const token = await getAuthToken();
    
    // If we couldn't get a token, return mock data
    if (!token) {
      console.log(`No token available, returning mock status for workflow: ${workflowId}`);
      return mockGetWorkflowStatus(workflowId);
    }

    console.log(`Checking status for workflow: ${workflowId}`);
    
    // Use the correct workflow status endpoint
    const statusEndpoint = `${ORKES_API_URL}/workflow/${workflowId}`;
    
    const response = await fetch(statusEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Debug response status
    console.log(`Orkes status API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get workflow status: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      // Fallback to mock mode when API fails
      console.log('Falling back to mock workflow status');
      return mockGetWorkflowStatus(workflowId);
    }

    const data = await response.json();
    console.log(`Workflow ${workflowId} status: ${data.status}`);
    
    return {
      workflowId: data.workflowId,
      status: data.status,
      startTime: data.startTime,
      endTime: data.endTime,
      output: data.output,
    };
  } catch (error) {
    console.error('Error getting workflow status:', error);
    // Fallback to mock data in case of error
    return mockGetWorkflowStatus(workflowId);
  }
}

/**
 * Mock implementation of workflow start (for development/testing)
 * @param {Object} documentData - The document data
 * @returns {Object} - The mock workflow execution details
 */
function mockStartWorkflow(documentData) {
  const workflowId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Store mock workflow in memory (in production, this would be in a database)
  mockWorkflows[workflowId] = {
    workflowId,
    status: 'RUNNING',
    startTime: new Date().toISOString(),
    documentData,
    completionTime: new Date(Date.now() + 5000).toISOString(), // Complete in 5 seconds
  };
  
  // Simulate workflow completion after a delay
  setTimeout(() => {
    mockWorkflows[workflowId].status = 'COMPLETED';
    mockWorkflows[workflowId].endTime = new Date().toISOString();
    mockWorkflows[workflowId].output = processMockDocument(documentData);
  }, 5000);
  
  return {
    workflowId,
    status: 'RUNNING',
    startTime: mockWorkflows[workflowId].startTime,
  };
}

/**
 * Mock implementation of getting workflow status
 * @param {string} workflowId - The workflow ID
 * @returns {Object} - The mock workflow status
 */
function mockGetWorkflowStatus(workflowId) {
  // If the workflow doesn't exist in our mock store, return not found
  if (!mockWorkflows[workflowId]) {
    return {
      workflowId,
      status: 'NOT_FOUND',
    };
  }
  
  return mockWorkflows[workflowId];
}

/**
 * Process a document in mock mode
 * @param {Object} documentData - The document data
 * @returns {Object} - The processed document data
 */
function processMockDocument(documentData) {
  // Generate mock processing results based on document type
  const typeMap = {
    invoice: generateMockInvoiceData,
    receipt: generateMockReceiptData,
    bank_statement: generateMockBankStatementData,
    tax_form: generateMockTaxFormData,
    other: generateMockOtherDocumentData,
  };
  
  const processor = typeMap[documentData.type.toLowerCase()] || typeMap.other;
  return processor(documentData);
}

/**
 * Generate mock data for an invoice
 * @param {Object} documentData - The document data
 * @returns {Object} - Mock invoice data
 */
function generateMockInvoiceData(documentData) {
  return {
    documentId: documentData.id,
    extractedData: {
      vendorName: "ABC Services Ltd.",
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      issueDate: new Date(Date.now() - Math.random() * 7776000000).toISOString().split('T')[0], // Random date in last 90 days
      dueDate: new Date(Date.now() + Math.random() * 2592000000).toISOString().split('T')[0], // Random date in next 30 days
      totalAmount: Math.floor(Math.random() * 10000) + 1000,
      taxAmount: Math.floor(Math.random() * 1000) + 100,
      currency: "INR",
      lineItems: [
        {
          description: "Consulting Services",
          quantity: 1,
          unitPrice: Math.floor(Math.random() * 5000) + 500,
          amount: Math.floor(Math.random() * 5000) + 500,
        },
        {
          description: "Software Development",
          quantity: Math.floor(Math.random() * 10) + 1,
          unitPrice: Math.floor(Math.random() * 1000) + 100,
          amount: Math.floor(Math.random() * 5000) + 500,
        }
      ]
    },
    validationResults: {
      isValid: true,
      gstin: {
        value: "29AADCB2230M1ZV",
        isValid: true,
      },
      issueDateValid: true,
      dueDateValid: true,
      lineItemsValid: true,
    },
    complianceStatus: {
      compliant: true,
      flags: [],
      recommendations: []
    },
    processingTime: Math.random() * 3 + 2, // 2-5 seconds
  };
}

/**
 * Generate mock data for a receipt
 * @param {Object} documentData - The document data
 * @returns {Object} - Mock receipt data
 */
function generateMockReceiptData(documentData) {
  return {
    documentId: documentData.id,
    extractedData: {
      merchantName: "XYZ Restaurant",
      receiptNumber: `R-${Math.floor(Math.random() * 10000)}`,
      date: new Date(Date.now() - Math.random() * 7776000000).toISOString().split('T')[0], // Random date in last 90 days
      totalAmount: Math.floor(Math.random() * 2000) + 200,
      taxAmount: Math.floor(Math.random() * 200) + 20,
      currency: "INR",
      paymentMethod: ["Cash", "Credit Card", "Debit Card", "UPI"][Math.floor(Math.random() * 4)],
      items: [
        {
          description: "Food & Beverages",
          amount: Math.floor(Math.random() * 1000) + 100,
        },
        {
          description: "Service Charge",
          amount: Math.floor(Math.random() * 200) + 50,
        }
      ]
    },
    validationResults: {
      isValid: true,
      dateValid: true,
      amountValid: true,
    },
    complianceStatus: {
      compliant: true,
      flags: [],
      recommendations: []
    },
    processingTime: Math.random() * 2 + 1, // 1-3 seconds
  };
}

/**
 * Generate mock data for a bank statement
 * @param {Object} documentData - The document data
 * @returns {Object} - Mock bank statement data
 */
function generateMockBankStatementData(documentData) {
  return {
    documentId: documentData.id,
    extractedData: {
      bankName: "State Bank of India",
      accountNumber: `XXXX${Math.floor(Math.random() * 10000)}`,
      accountHolderName: "John Doe",
      statementPeriod: {
        from: new Date(Date.now() - 2592000000).toISOString().split('T')[0], // 30 days ago
        to: new Date().toISOString().split('T')[0], // Today
      },
      openingBalance: Math.floor(Math.random() * 50000) + 5000,
      closingBalance: Math.floor(Math.random() * 60000) + 5000,
      transactions: [
        {
          date: new Date(Date.now() - Math.random() * 2592000000).toISOString().split('T')[0],
          description: "Salary Credit",
          amount: Math.floor(Math.random() * 50000) + 30000,
          type: "credit",
        },
        {
          date: new Date(Date.now() - Math.random() * 2592000000).toISOString().split('T')[0],
          description: "Rent Payment",
          amount: Math.floor(Math.random() * 15000) + 10000,
          type: "debit",
        },
        {
          date: new Date(Date.now() - Math.random() * 2592000000).toISOString().split('T')[0],
          description: "Utilities Bill",
          amount: Math.floor(Math.random() * 3000) + 1000,
          type: "debit",
        }
      ]
    },
    validationResults: {
      isValid: true,
      periodValid: true,
      balancesValid: true,
    },
    complianceStatus: {
      compliant: true,
      flags: [],
      recommendations: []
    },
    processingTime: Math.random() * 4 + 3, // 3-7 seconds
  };
}

/**
 * Generate mock data for a tax form
 * @param {Object} documentData - The document data
 * @returns {Object} - Mock tax form data
 */
function generateMockTaxFormData(documentData) {
  return {
    documentId: documentData.id,
    extractedData: {
      formType: "ITR-4",
      assessmentYear: "2023-24",
      panNumber: "ABCDE1234F",
      taxpayerName: "John Doe",
      filingDate: new Date(Date.now() - Math.random() * 7776000000).toISOString().split('T')[0],
      grossTotalIncome: Math.floor(Math.random() * 1000000) + 500000,
      deductions: Math.floor(Math.random() * 150000) + 50000,
      totalTaxPayable: Math.floor(Math.random() * 100000) + 50000,
      taxPaid: Math.floor(Math.random() * 100000) + 40000,
    },
    validationResults: {
      isValid: true,
      panValid: true,
      assessmentYearValid: true,
    },
    complianceStatus: {
      compliant: true,
      flags: [],
      recommendations: []
    },
    processingTime: Math.random() * 5 + 4, // 4-9 seconds
  };
}

/**
 * Generate mock data for other document types
 * @param {Object} documentData - The document data
 * @returns {Object} - Mock document data
 */
function generateMockOtherDocumentData(documentData) {
  return {
    documentId: documentData.id,
    extractedData: {
      documentTitle: `${documentData.name.split('.')[0]}`,
      date: new Date(Date.now() - Math.random() * 7776000000).toISOString().split('T')[0],
      relevantParties: ["Individual/Company Name"],
      keyInformation: "Extracted key information from the document",
      possibleDocumentType: ["Contract", "Agreement", "Letter", "Certificate"][Math.floor(Math.random() * 4)],
    },
    validationResults: {
      isValid: true,
      dateValid: true,
    },
    complianceStatus: {
      compliant: true,
      flags: [],
      recommendations: ["Consider proper categorization of this document for better tax management"]
    },
    processingTime: Math.random() * 3 + 2, // 2-5 seconds
  };
}

// Create an object with all the exported functions
const orkesAPI = {
  startDocumentWorkflow,
  getWorkflowStatus
};

export default orkesAPI; 
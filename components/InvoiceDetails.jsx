import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";

/**
 * Format currency values for display
 */
const formatCurrency = (amount, currency = "INR") => {
  return amount?.toLocaleString('en-IN', { 
    style: 'currency', 
    currency: currency,
    minimumFractionDigits: 2 
  }) || "N/A";
};

/**
 * Format date strings for display
 */
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    // Handle different date formats
    if (dateString.includes("-")) {
      const [day, month, year] = dateString.split("-").map(part => parseInt(part, 10));
      return format(new Date(year, month - 1, day), "dd MMM yyyy");
    }
    return format(new Date(dateString), "dd MMM yyyy");
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString; // Return original string if formatting fails
  }
};

export default function InvoiceDetails({ invoice }) {
  if (!invoice || !invoice.extractedData) {
    return (
      <Card className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>No invoice data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const {
    vendorName,
    invoiceNumber,
    issueDate,
    dueDate,
    totalAmount,
    taxAmount,
    currency,
    gstin,
    orderId,
    lineItems,
    billingInfo,
    shippingInfo
  } = invoice.extractedData;

  return (
    <Card className="w-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">
              Invoice
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {gstin ? "GST Invoice" : "Invoice"}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              <span className="font-medium">Invoice #:</span> {invoiceNumber}
            </CardDescription>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div><span className="font-medium">Issue Date:</span> {formatDate(issueDate)}</div>
              {dueDate && <div><span className="font-medium">Due Date:</span> {formatDate(dueDate)}</div>}
              {orderId && <div><span className="font-medium">Order ID:</span> {orderId}</div>}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* Vendor Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">From</h3>
          <div className="text-base font-semibold">{vendorName}</div>
          {gstin && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              GSTIN: {gstin}
            </div>
          )}
        </div>
        
        {/* Customer Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">To</h3>
          {billingInfo && (
            <>
              <div className="text-base font-semibold">{billingInfo.name}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {billingInfo.address}<br />
                {billingInfo.city}, {billingInfo.postalCode}
              </div>
            </>
          )}
        </div>
        
        {/* Line Items */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Items</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lineItems && lineItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-4 text-sm">{item.description}</td>
                    <td className="px-4 py-4 text-sm text-center">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm text-right">{formatCurrency(item.unitPrice, currency)}</td>
                    <td className="px-4 py-4 text-sm text-right">{formatCurrency(item.discount, currency)}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium">{formatCurrency(item.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {taxAmount && (
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan="4" className="px-4 py-3 text-sm text-right font-medium">GST/Tax</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(taxAmount, currency)}</td>
                  </tr>
                )}
                <tr className="border-t border-gray-200 dark:border-gray-700 font-bold">
                  <td colSpan="4" className="px-4 py-3 text-right">Total</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totalAmount, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Thank you for your business!</p>
          {invoice.validationResults && invoice.validationResults.isValid && (
            <p className="mt-1 text-green-600 dark:text-green-400 font-medium">✓ Validated</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="sm:hidden">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 
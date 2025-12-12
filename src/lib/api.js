// API service layer - redirects to mock services for frontend-only mode
// TODO: Lovable will implement Supabase client here
// This file maintains the same interface so components don't need changes

// Import all mock APIs
import {
  authAPI,
  companyAPI,
  truckAPI,
  projectAPI,
  diagnosticsAPI,
  workOrderAPI,
  vinAPI,
  voiceAPI,
  summaryAPI,
  warrantyAPI,
  partsAPI,
  laborAPI,
  invoiceAPI,
  estimateAPI,
  pmAPI,
  customerAPI
} from '../services/mockAPI';

// Re-export all APIs for backward compatibility
export {
  authAPI,
  companyAPI,
  truckAPI,
  projectAPI,
  diagnosticsAPI,
  workOrderAPI,
  vinAPI,
  voiceAPI,
  summaryAPI,
  warrantyAPI,
  partsAPI,
  laborAPI,
  invoiceAPI,
  estimateAPI,
  pmAPI,
  customerAPI
};

// Default export for compatibility
export default {
  authAPI,
  companyAPI,
  truckAPI,
  projectAPI,
  diagnosticsAPI,
  workOrderAPI,
  vinAPI,
  voiceAPI,
  summaryAPI,
  warrantyAPI,
  partsAPI,
  laborAPI,
  invoiceAPI,
  estimateAPI,
  pmAPI,
  customerAPI
};

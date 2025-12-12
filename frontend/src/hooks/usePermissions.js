import { useAuth } from '../contexts/AuthContext';

/**
 * Permission Management Hook
 * Provides role-based access control for UI elements and routes
 */

const PERMISSIONS = {
  master_admin: {
    companies: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    trucks: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete', 'assign'],
    diagnostics: ['read', 'generate'],
    summaries: ['read', 'generate'],
    warranty: ['read', 'analyze'],
    customers: ['create', 'read', 'update', 'delete'],
    estimates: ['create', 'read', 'update', 'delete', 'approve'],
    invoices: ['create', 'read', 'update', 'delete'],
    parts: ['create', 'read', 'update', 'delete', 'order', 'approve'],
    pricing: ['read', 'update'],
    reports: ['read', 'generate'],
    knowledge: ['create', 'read', 'update', 'delete', 'curate'],
    safety: ['create', 'read', 'update', 'delete'],
    team: ['read', 'manage'],
    allCompanies: true
  },
  company_admin: {
    companies: ['read', 'update'],
    users: ['create', 'read', 'update'],
    trucks: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete', 'assign'],
    diagnostics: ['read', 'generate'],
    summaries: ['read', 'generate'],
    warranty: ['read', 'analyze'],
    customers: ['create', 'read', 'update', 'delete'],
    estimates: ['create', 'read', 'update', 'delete', 'approve'],
    invoices: ['create', 'read', 'update', 'delete'],
    parts: ['create', 'read', 'update', 'delete', 'order', 'approve'],
    pricing: ['read', 'update'],
    reports: ['read', 'generate'],
    knowledge: ['create', 'read', 'update', 'delete', 'curate'],
    safety: ['create', 'read', 'update', 'delete'],
    team: ['read', 'manage'],
    allCompanies: false
  },
  office_manager: {
    companies: ['read'],
    users: ['read'],
    trucks: ['create', 'read', 'update'],
    projects: ['create', 'read', 'update', 'assign'],
    diagnostics: ['read'],
    summaries: ['read'],
    warranty: ['read'],
    customers: ['create', 'read', 'update'],
    estimates: ['create', 'read', 'update', 'approve'],
    invoices: ['create', 'read', 'update'],
    parts: ['create', 'read', 'update', 'order'],
    pricing: ['read', 'update'],
    reports: ['read', 'generate'],
    knowledge: ['read'],
    safety: ['read'],
    team: ['read'],
    allCompanies: false
  },
  shop_supervisor: {
    companies: ['read'],
    users: ['read'],
    trucks: ['create', 'read', 'update'],
    projects: ['create', 'read', 'update', 'assign'],
    diagnostics: ['read', 'generate'],
    summaries: ['read', 'generate'],
    warranty: ['read'],
    customers: ['read'],
    estimates: ['read'],
    invoices: ['read'],
    parts: ['create', 'read', 'update', 'approve'],
    pricing: ['read'],
    reports: ['read'],
    knowledge: ['create', 'read'],
    safety: ['create', 'read', 'update', 'delete'],
    team: ['read', 'manage'],
    allCompanies: false
  },
  technician: {
    companies: ['read'],
    users: ['read'],
    trucks: ['read'],
    projects: ['create', 'read', 'update'],
    diagnostics: ['read', 'generate'],
    summaries: ['read'],
    warranty: ['read'],
    customers: ['read'],
    estimates: ['read'],
    invoices: ['read'],
    parts: ['read'],
    pricing: [],
    reports: [],
    knowledge: ['create', 'read'],
    safety: ['read'],
    team: ['read'],
    allCompanies: false
  }
};

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (resource, action) => {
    if (!user || !user.role) return false;
    
    const rolePermissions = PERMISSIONS[user.role] || {};
    const resourcePermissions = rolePermissions[resource] || [];
    
    return resourcePermissions.includes(action);
  };
  
  const canAccessAllCompanies = () => {
    if (!user || !user.role) return false;
    return PERMISSIONS[user.role]?.allCompanies || false;
  };
  
  const isAdmin = () => {
    return user && (user.role === 'master_admin' || user.role === 'company_admin');
  };
  
  const isTechnician = () => {
    return user && user.role === 'technician';
  };
  
  const isMasterAdmin = () => {
    return user && user.role === 'master_admin';
  };
  
  const isOfficeManager = () => {
    return user && user.role === 'office_manager';
  };
  
  const isShopSupervisor = () => {
    return user && user.role === 'shop_supervisor';
  };
  
  const getRole = () => {
    return user?.role || null;
  };
  
  return {
    hasPermission,
    canAccessAllCompanies,
    isAdmin,
    isTechnician,
    isMasterAdmin,
    isOfficeManager,
    isShopSupervisor,
    getRole
  };
};

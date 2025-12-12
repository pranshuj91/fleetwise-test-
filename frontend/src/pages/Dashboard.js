import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AlertsWidget from '../components/AlertsWidget';
import QuickActionsPanel from '../components/QuickActionsPanel';
import LiveStatusIndicator from '../components/LiveStatusIndicator';
import WarrantyAutoDetect from '../components/WarrantyAutoDetect';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI, truckAPI, estimateAPI, invoiceAPI, pmAPI, partsAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Truck, FileText, TrendingUp, Plus, Upload, DollarSign, 
  Clock, Package, Wrench, AlertTriangle, CheckCircle, Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Role-based dashboard routing
  // NOTE: Disabled for frontend-only mode to prevent navigation loops
  // TODO: Lovable will re-enable role-based routing with real auth
  // useEffect(() => {
  //   const role = user?.role;
  //   if (role === 'technician') {
  //     navigate('/technician/mobile');
  //     return;
  //   } else if (role === 'shop_supervisor') {
  //     navigate('/supervisor/dashboard');
  //     return;
  //   } else if (role === 'office_manager') {
  //     navigate('/office/pipeline');
  //     return;
  //   }
  //   // company_admin and master_admin stay on main dashboard
  // }, [user, navigate]);
  
  const [stats, setStats] = useState({
    totalTrucks: 0,
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    // Estimates
    totalEstimates: 0,
    pendingEstimates: 0,
    estimatesValue: 0,
    // Invoices
    totalInvoices: 0,
    unpaidInvoices: 0,
    unpaidValue: 0,
    // PM Schedules
    upcomingPM: 0,
    overduePM: 0,
    // Parts
    totalParts: 0,
    lowStockParts: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [
          trucksRes, 
          projectsRes, 
          estimatesRes, 
          invoicesRes,
          upcomingPMRes,
          overduePMRes,
          partsRes
        ] = await Promise.allSettled([
          truckAPI.list(user?.company_id),
          projectAPI.list(user?.company_id),
          estimateAPI.list(),
          invoiceAPI.list(),
          pmAPI.schedules.upcoming(),
          pmAPI.schedules.overdue(),
          partsAPI.list()
        ]);

        // Trucks data
        const trucks = trucksRes.status === 'fulfilled' ? trucksRes.value.data : [];
        
        // Projects data
        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
        
        // Estimates data
        const estimates = estimatesRes.status === 'fulfilled' ? estimatesRes.value.data : [];
        const pendingEstimates = estimates.filter(e => e.status === 'sent' || e.status === 'draft');
        const estimatesValue = estimates.reduce((sum, e) => sum + (e.estimated_total || 0), 0);
        
        // Invoices data
        const invoices = invoicesRes.status === 'fulfilled' ? invoicesRes.value.data : [];
        const unpaidInvoices = invoices.filter(i => i.status !== 'paid');
        const unpaidValue = unpaidInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
        
        // PM data
        const upcomingPM = upcomingPMRes.status === 'fulfilled' ? upcomingPMRes.value.data.length : 0;
        const overduePM = overduePMRes.status === 'fulfilled' ? overduePMRes.value.data.length : 0;
        
        // Parts data
        const parts = partsRes.status === 'fulfilled' ? partsRes.value.data : [];
        const lowStockParts = parts.filter(p => p.quantity_in_stock <= p.minimum_stock_level);

        setStats({
          totalTrucks: trucks.length,
          totalProjects: projects.length,
          inProgressProjects: projects.filter(p => p.status === 'in_progress').length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          // Estimates
          totalEstimates: estimates.length,
          pendingEstimates: pendingEstimates.length,
          estimatesValue: estimatesValue,
          // Invoices
          totalInvoices: invoices.length,
          unpaidInvoices: unpaidInvoices.length,
          unpaidValue: unpaidValue,
          // PM
          upcomingPM: upcomingPM,
          overduePM: overduePM,
          // Parts
          totalParts: parts.length,
          lowStockParts: lowStockParts.length,
        });

        setRecentProjects(projects.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-page">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">
            Welcome back, {user?.full_name || user?.username}
          </h1>
          <p className="text-gray-600">Here's what's happening with your fleet today.</p>
        </div>

        {/* Hero CTA - Start Diagnostic Workflow */}
        <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#124481] via-[#1E7083] to-[#289790] p-8 shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <div className="inline-block mb-3">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    ⚡ START HERE
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  AI-Guided Diagnostics
                </h2>
                <p className="text-blue-100 text-lg mb-6">
                  Scan a work order to automatically create trucks, launch diagnostics, and get expert AI guidance in seconds.
                </p>
                <Button
                  onClick={() => {
                    // Trigger QuickStart modal for scan
                    const scanButton = document.querySelector('[data-scan-trigger]');
                    if (scanButton) scanButton.click();
                  }}
                  className="bg-white text-[#124481] hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  data-testid="hero-scan-button"
                >
                  <Upload className="h-6 w-6 mr-3" />
                  Scan Work Order & Start Diagnostic
                </Button>
              </div>
              <div className="hidden lg:block">
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                  <Wrench className="h-24 w-24 text-white/80" />
                </div>
              </div>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        </div>

        {/* Quick Actions Panel - Role-Specific */}
        <div className="mb-8">
          <QuickActionsPanel />
        </div>

        {/* Live Shop Floor Status - For Office Managers */}
        {user?.role !== 'technician' && (
          <div className="mb-8">
            <LiveStatusIndicator />
          </div>
        )}

        {/* AI Warranty Auto-Detection - Money Saver! */}
        {user?.role !== 'technician' && (
          <div className="mb-8">
            <WarrantyAutoDetect />
          </div>
        )}

        {/* Stats Grid - Core Metrics */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Fleet Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            data-testid="stat-total-trucks"
            onClick={() => navigate('/trucks')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
              <Truck className="h-4 w-4 text-[#124481]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#124481]">{stats.totalTrucks}</div>
              <p className="text-xs text-muted-foreground mt-1">Vehicles in fleet</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            data-testid="stat-total-projects"
            onClick={() => navigate('/projects')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-[#1E7083]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1E7083]">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Work orders</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            data-testid="stat-in-progress"
            onClick={() => navigate('/projects')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#289790]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#289790]">{stats.inProgressProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Active repairs</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            data-testid="stat-completed"
            onClick={() => navigate('/projects')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Finished projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Business Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/estimates')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Estimates</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pendingEstimates}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.estimatesValue.toFixed(0)} total value
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/invoices')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unpaidInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${stats.unpaidValue.toFixed(0)} outstanding
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/pm/dashboard')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming PM</CardTitle>
              <Calendar className="h-4 w-4 text-[#289790]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#289790]">{stats.upcomingPM}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled maintenance</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer bg-red-50 border-red-200" 
            onClick={() => navigate('/pm/dashboard')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Overdue PM</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overduePM}</div>
              <p className="text-xs text-red-700 mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory & Parts */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Inventory & Operations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/parts')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parts Catalog</CardTitle>
              <Package className="h-4 w-4 text-[#124481]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#124481]">{stats.totalParts}</div>
              <p className="text-xs text-muted-foreground mt-1">Total parts tracked</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer bg-yellow-50 border-yellow-200" 
            onClick={() => navigate('/parts')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockParts}</div>
              <p className="text-xs text-yellow-700 mt-1">Need reordering</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/invoices')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">Generated invoices</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/estimates')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
              <FileText className="h-4 w-4 text-[#1E7083]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1E7083]">{stats.totalEstimates}</div>
              <p className="text-xs text-muted-foreground mt-1">Customer estimates</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AlertsWidget />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-[#124481] hover:bg-[#1E7083]" 
                onClick={() => navigate('/projects/new')}
                data-testid="create-work-order-button"
              >
                <Plus className="mr-2 h-4 w-4" /> Create New Work Order
              </Button>
              <Button 
                className="w-full justify-start bg-[#1E7083] hover:bg-[#289790]" 
                onClick={() => navigate('/work-orders/upload')}
                data-testid="upload-work-order-button"
              >
                <Upload className="mr-2 h-4 w-4" /> Import Work Order PDF
              </Button>
              <Button 
                className="w-full justify-start bg-[#289790] hover:bg-[#1E7083]" 
                onClick={() => navigate('/trucks/new')}
                data-testid="add-truck-button"
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Truck
              </Button>
              <Button 
                className="w-full justify-start bg-[#1E7083] hover:bg-[#289790]"
                onClick={() => navigate('/trucks')}
                data-testid="view-trucks-button"
              >
                <Truck className="mr-2 h-4 w-4" /> View All Trucks
              </Button>
              <Button 
                className="w-full justify-start bg-[#124481] hover:bg-[#1E7083]"
                onClick={() => navigate('/projects')}
                data-testid="view-projects-button"
              >
                <FileText className="mr-2 h-4 w-4" /> View All Projects
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4" data-testid="no-projects">No projects yet</p>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      data-testid={`project-${project.id}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{project.truck_number || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{project.customer_name || 'Unknown Customer'}</div>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

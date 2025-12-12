import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DiagnosticChatInterface from '../components/DiagnosticChatInterface';
import PartSelectorModal from '../components/PartSelectorModal';
import LaborEntryModal from '../components/LaborEntryModal';
import PartsRequestModal from '../components/PartsRequestModal';
import { projectAPI, truckAPI, summaryAPI, warrantyAPI, partsAPI, laborAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, Truck as TruckIcon, FileText, 
  Lightbulb, CheckCircle2, Loader2, AlertCircle,
  Download, DollarSign, Package, Wrench, Plus, Trash2, CheckCircle
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diagnosticActive, setDiagnosticActive] = useState(false);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticSteps, setDiagnosticSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [techNotes, setTechNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState(null);
  const [dataQuestions, setDataQuestions] = useState([]);
  // DISABLED: Voice features temporarily removed
  // const [autoSpeakText, setAutoSpeakText] = useState('');
  
  // Summary and Warranty states
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [warrantyLoading, setWarrantyLoading] = useState(false);
  const [warrantyAnalysis, setWarrantyAnalysis] = useState(null);

  // Parts and Labor states
  const [showPartSelector, setShowPartSelector] = useState(false);
  const [showLaborEntry, setShowLaborEntry] = useState(false);
  const [showPartsRequest, setShowPartsRequest] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectAPI.get(id);
        setProject(response.data);
        
        if (response.data.truck_id) {
          try {
            const truckRes = await truckAPI.get(response.data.truck_id);
            setTruck(truckRes.data);
          } catch (truckError) {
            console.warn('Truck not found:', response.data.truck_id);
            // Truck doesn't exist - continue without truck data
            setTruck(null);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const startAIDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      const response = await diagnosticsAPI.generate({
        project_id: id,
        current_step: currentStep,
        tech_notes: techNotes
      });

      // Ensure response.data exists and has the expected structure
      if (response && response.data) {
        setDiagnosticSteps(response.data.steps || []);
        setEstimatedTime(response.data.estimated_time_minutes || null);
        setDifficultyLevel(response.data.difficulty_level || null);
        setDataQuestions(response.data.data_capture_questions || []);
        setDiagnosticActive(true);
        setCurrentStep(0);

        // DISABLED: Auto-speak feature temporarily disabled due to TTS service unavailability
        // if (response.data.steps && response.data.steps.length > 0) {
        //   const firstStep = response.data.steps[0];
        //   if (firstStep && firstStep.title && firstStep.description) {
        //     setAutoSpeakText(`Step 1: ${firstStep.title}. ${firstStep.description}`);
        //   }
        // }
      } else {
        // Invalid response structure
        setDiagnosticSteps([]);
        setDiagnosticActive(false);
      }
    } catch (error) {
      console.error('Error generating diagnostic:', error);
      
      // Silently handle errors - diagnostic steps will be empty and UI will show appropriate message
      setDiagnosticSteps([]);
      setDiagnosticActive(false);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  // DISABLED: Voice features temporarily removed
  // const handleVoiceTranscript = (transcript) => {
  //   setTechNotes(prev => prev ? `${prev} ${transcript}` : transcript);
  // };

  const saveNotes = async () => {
    if (techNotes.trim()) {
      try {
        await diagnosticsAPI.saveNotes(id, currentStep + 1, techNotes);
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    }
  };

  const nextStep = () => {
    saveNotes();
    if (currentStep < diagnosticSteps.length - 1) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      setTechNotes('');
      // DISABLED: Voice features temporarily removed
      // const step = diagnosticSteps[nextStepNum];
      // setAutoSpeakText(`Step ${nextStepNum + 1}: ${step.title}. ${step.description}`);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTechNotes('');
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await summaryAPI.generate(id);
      setSummary(response.data);
    } catch (error) {
      console.error('Error generating summary:', error);
      // Silently handle error - summary will remain null
    } finally {
      setSummaryLoading(false);
    }
  };

  const analyzeWarranty = async () => {
    setWarrantyLoading(true);
    try {
      const response = await warrantyAPI.analyze(id);
      setWarrantyAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing warranty:', error);
      // Silently handle error - warranty analysis will remain null
    } finally {
      setWarrantyLoading(false);
    }
  };

  const handleRemovePart = async (index) => {
    if (!window.confirm('Remove this part from the work order?')) return;
    
    try {
      await partsAPI.removeFromProject(id, index);
      // Refresh project data
      const response = await projectAPI.get(id);
      setProject(response.data);
    } catch (error) {
      console.error('Error removing part:', error);
      alert('Failed to remove part');
    }
  };

  const handleRemoveLabor = async (index) => {
    if (!window.confirm('Remove this labor item from the work order?')) return;
    
    try {
      await laborAPI.removeFromProject(id, index);
      // Refresh project data
      const response = await projectAPI.get(id);
      setProject(response.data);
    } catch (error) {
      console.error('Error removing labor:', error);
      alert('Failed to remove labor item');
    }
  };

  const handlePartsSuccess = async () => {
    setShowPartSelector(false);
    // Refresh project data
    const response = await projectAPI.get(id);
    setProject(response.data);
  };

  const handleLaborSuccess = async () => {
    setShowLaborEntry(false);
    // Refresh project data
    const response = await projectAPI.get(id);
    setProject(response.data);
  };

  const handlePartsRequestSuccess = async () => {
    setShowPartsRequest(false);
    // Refresh project data to show any updates
    const response = await projectAPI.get(id);
    setProject(response.data);
  };

  const proposeVehicleReady = async () => {
    if (!window.confirm('Propose this vehicle as ready for customer pickup? Office will review and confirm.')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/work-orders/${id}/propose-ready`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to propose vehicle ready');

      alert('Vehicle ready proposal submitted! Office will review and confirm with customer.');
      
      // Refresh project
      const projectResponse = await projectAPI.get(id);
      setProject(projectResponse.data);
    } catch (error) {
      console.error('Error proposing vehicle ready:', error);
      alert('Failed to propose vehicle ready');
    }
  };

  const confirmVehicleReady = async () => {
    if (!window.confirm('Confirm this vehicle is ready and notify customer?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/work-orders/${id}/confirm-ready`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to confirm vehicle ready');

      alert('Vehicle confirmed ready! Customer has been notified.');
      
      // Refresh project
      const projectResponse = await projectAPI.get(id);
      setProject(projectResponse.data);
    } catch (error) {
      console.error('Error confirming vehicle ready:', error);
      alert('Failed to confirm vehicle ready');
    }
  };

  const calculatePartsTotal = () => {
    if (!project?.parts_used) return 0;
    return project.parts_used.reduce((sum, part) => sum + part.total_price, 0);
  };

  const calculateLaborTotal = () => {
    if (!project?.labor_items) return 0;
    return project.labor_items.reduce((sum, labor) => sum + labor.total, 0);
  };

  const calculateGrandTotal = () => {
    return calculatePartsTotal() + calculateLaborTotal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
              <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeStep = diagnosticSteps && diagnosticSteps.length > 0 ? diagnosticSteps[currentStep] : null;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="project-detail-page">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mb-4"
            data-testid="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="project-title">
                Work Order: {project.work_order_number || project.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                {project.truck_number ? `Truck #${project.truck_number}` : 'No truck number'} - {project.customer_name || 'Unknown Customer'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Badge className={getStatusColor(project.status)} data-testid="status-badge">
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-3 mt-4">
            <Button
              onClick={generateSummary}
              disabled={summaryLoading}
              variant="outline"
              className="border-[#1E7083] text-[#1E7083] hover:bg-[#1E7083] hover:text-white"
            >
              {summaryLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" />Generate Summary</>
              )}
            </Button>
            
            <Button
              onClick={analyzeWarranty}
              disabled={warrantyLoading}
              variant="outline"
              className="border-[#289790] text-[#289790] hover:bg-[#289790] hover:text-white"
            >
              {warrantyLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
              ) : (
                <><DollarSign className="mr-2 h-4 w-4" />Check Warranty</>
              )}
            </Button>
            
            <Button
              onClick={() => navigate(`/projects/${id}/review`)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Review & Complete
            </Button>

            {/* Vehicle Ready - Two Step Process */}
            {project?.status === 'in_progress' && (
              <Button
                onClick={proposeVehicleReady}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Propose Vehicle Ready
              </Button>
            )}

            {project?.status === 'ready_pending_confirmation' && (
              <Button
                onClick={confirmVehicleReady}
                className="bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Ready & Notify Customer
              </Button>
            )}
            
            {warrantyAnalysis?.has_warranty_opportunity && (
              <Button
                onClick={() => navigate(`/warranty/claims/create/${id}`)}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Warranty Claim
              </Button>
            )}

            <Button
              onClick={() => navigate(`/invoices/create/${id}`)}
              disabled={!project?.parts_used?.length && !project?.labor_items?.length}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>

            <Button
              onClick={() => navigate(`/estimates/create/${id}`)}
              disabled={!project?.parts_used?.length && !project?.labor_items?.length}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Estimate
            </Button>
          </div>
        </div>

        {/* Two Column Layout: Main (Diagnostic) + Sidebar (Truck Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* LEFT COLUMN - Main Content (Diagnostic Interface) - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Diagnostic Chat Interface - HERO */}
            <DiagnosticChatInterface 
              projectId={id}
              project={project}
              truck={truck}
            />

          </div>

          {/* RIGHT SIDEBAR - Truck & Context Info - 1/3 width */}
          <div className="space-y-4">
            
            {/* Truck Info Card */}
            {truck ? (
              <Card className="border-[#1E7083]">
                <CardHeader className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white pb-4">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center">
                      <TruckIcon className="mr-2 h-5 w-5" />
                      Vehicle Info
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unit / Truck #</label>
                    <p className="text-lg font-bold text-gray-900">
                      {truck.identity?.unit_id || truck.identity?.truck_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {truck.identity?.year || 'N/A'} {truck.identity?.make || 'N/A'} {truck.identity?.model || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">VIN</label>
                    <p className="text-xs font-mono text-gray-700 break-all">{truck.identity?.vin || 'N/A'}</p>
                  </div>
                  {truck.identity?.odometer_mi && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Odometer</label>
                      <p className="text-sm font-semibold text-gray-900">{truck.identity.odometer_mi.toLocaleString()} mi</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/trucks/${truck.id}`)}
                    className="w-full mt-2"
                  >
                    Full Truck Details →
                  </Button>
                </CardContent>
              </Card>
            ) : project?.truck_id ? (
              <Card className="border-orange-400">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                    Truck Info Unavailable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant="warning" className="bg-orange-50 border-orange-200">
                    <AlertDescription className="text-sm text-orange-900">
                      The truck associated with this work order (ID: {project.truck_id.substring(0, 8)}...) 
                      no longer exists in the system.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <TruckIcon className="mr-2 h-5 w-5 text-gray-500" />
                    No Truck Linked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    This work order doesn't have a truck associated with it.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Customer & Complaint Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Work Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</label>
                  <p className="text-sm font-semibold text-gray-900">{project.customer_name || 'Unknown'}</p>
                </div>
                {project.complaint && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Complaint</label>
                    <p className="text-sm text-gray-700">{project.complaint}</p>
                  </div>
                )}
                {project.fault_codes && project.fault_codes.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Fault Codes</label>
                    <div className="flex flex-wrap gap-1">
                      {project.fault_codes.map((code, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-green-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setShowPartsRequest(true)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Add Parts Used
                </Button>
                <Button
                  onClick={() => setShowLaborEntry(true)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white"
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Log Labor Time
                </Button>
              </CardContent>
            </Card>

            {/* Parts & Labor Summary in Sidebar */}
            {(project?.parts_used?.length > 0 || project?.labor_items?.length > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {project.parts_used?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parts ({project.parts_used.length})</span>
                      <span className="font-semibold text-gray-900">${calculatePartsTotal().toFixed(2)}</span>
                    </div>
                  )}
                  {project.labor_items?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Labor ({project.labor_items.length})</span>
                      <span className="font-semibold text-gray-900">${calculateLaborTotal().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-green-600 text-lg">${calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {/* Summary Display */}
        {summary && (
          <Card className="mb-6 border-[#1E7083] shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-2xl">
                  <FileText className="mr-3 h-6 w-6" />
                  Work Order Summary
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/summary/generate-pdf/${id}`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        });
                        
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `work_order_${project?.work_order_number || id}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } else {
                          alert('Failed to generate PDF');
                        }
                      } catch (error) {
                        console.error('PDF generation error:', error);
                        alert('Error generating PDF');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white hover:bg-white hover:text-[#124481]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <div className="text-right">
                    <div className="text-sm opacity-90">Generated by</div>
                    <div className="text-lg font-bold">Fleetwise AI</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              {/* Professional Document Layout */}
              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b-2 border-[#289790] pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold text-[#124481] mb-1">
                        {project?.work_order_number || 'Work Order'}
                      </h2>
                      <p className="text-gray-600">
                        {project?.customer_name || 'Customer'} • {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#289790] text-white px-4 py-2 text-sm">
                        {project?.status?.toUpperCase() || 'DRAFT'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                {truck && (
                  <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#1E7083]">
                    <h3 className="text-lg font-semibold text-[#124481] mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Vehicle Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 font-medium">Year/Make/Model:</span>
                        <p className="font-semibold text-gray-900">{truck.identity?.year} {truck.identity?.make} {truck.identity?.model}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">VIN:</span>
                        <p className="font-mono text-xs text-gray-900">{truck.identity?.vin || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Truck #:</span>
                        <p className="font-semibold text-gray-900">{truck.identity?.truck_number || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Engine:</span>
                        <p className="font-semibold text-gray-900">{truck.engine?.model || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complaint Section */}
                {project?.complaint && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#124481] mb-2 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 text-sm font-bold">C</span>
                      Complaint
                    </h3>
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                      <p className="text-gray-800">{project.complaint}</p>
                    </div>
                  </div>
                )}

                {/* Fault Codes */}
                {project?.fault_codes && project.fault_codes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#124481] mb-2">Fault Codes</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.fault_codes.map((code, idx) => (
                        <Badge key={idx} variant="outline" className="border-red-500 text-red-700 px-3 py-1 font-mono">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Content - Parse and Format */}
                <div className="space-y-4">
                  {summary?.markdown_content?.split('\n').map((line, idx) => {
                    // Handle headers
                    if (line.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="text-base font-semibold text-[#124481] mt-4 mb-2">
                          {line.replace('### ', '')}
                        </h4>
                      );
                    } else if (line.startsWith('## ')) {
                      const headerText = line.replace('## ', '');
                      let icon = '📋';
                      let bgColor = 'bg-blue-100';
                      let textColor = 'text-blue-600';
                      let borderColor = 'border-blue-500';
                      
                      if (headerText.toLowerCase().includes('cause')) {
                        icon = '🔍';
                        bgColor = 'bg-yellow-100';
                        textColor = 'text-yellow-600';
                        borderColor = 'border-yellow-500';
                      } else if (headerText.toLowerCase().includes('correction') || headerText.toLowerCase().includes('repair')) {
                        icon = '🔧';
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-600';
                        borderColor = 'border-green-500';
                      }
                      
                      return (
                        <h3 key={idx} className={`text-lg font-semibold text-[#124481] mb-2 flex items-center mt-6`}>
                          <span className={`w-8 h-8 rounded-full ${bgColor} ${textColor} flex items-center justify-center mr-2 text-sm font-bold`}>
                            {icon}
                          </span>
                          {headerText}
                        </h3>
                      );
                    } else if (line.startsWith('# ')) {
                      return (
                        <h2 key={idx} className="text-2xl font-bold text-[#124481] mt-6 mb-3">
                          {line.replace('# ', '')}
                        </h2>
                      );
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      // Bold text
                      return (
                        <p key={idx} className="font-bold text-gray-900 mt-2">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    } else if (line.startsWith('- ') || line.startsWith('* ')) {
                      // List items
                      return (
                        <li key={idx} className="ml-6 text-gray-700 list-disc">
                          {line.replace(/^[-*]\s/, '')}
                        </li>
                      );
                    } else if (line.trim()) {
                      // Regular paragraph
                      return (
                        <p key={idx} className="text-gray-700 leading-relaxed">
                          {line}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Footer Branding */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <p className="font-semibold text-[#124481]">Fleetwise AI</p>
                      <p>AI-Powered Fleet Maintenance Intelligence</p>
                    </div>
                    <div className="text-right">
                      <p>Generated: {new Date().toLocaleString()}</p>
                      <p className="text-xs">Document ID: {summary.id || project?.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warranty Analysis Display */}
        {warrantyAnalysis && (
          <Card className="mb-6 border-[#289790]">
            <CardHeader className={`bg-gradient-to-r ${warrantyAnalysis.has_warranty_opportunity ? 'from-green-600 to-green-500' : 'from-[#1E7083] to-[#289790]'} text-white`}>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Warranty Analysis Results
                </span>
                {warrantyAnalysis.has_warranty_opportunity && warrantyAnalysis.total_estimated_recovery && (
                  <Badge className="bg-white text-green-700 text-lg">
                    ${warrantyAnalysis.total_estimated_recovery.toFixed(2)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {warrantyAnalysis.has_warranty_opportunity ? (
                <div className="space-y-4">
                  {warrantyAnalysis.opportunities && warrantyAnalysis.opportunities.length > 0 ? (
                    warrantyAnalysis.opportunities.map((opp, idx) => (
                      <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{opp.claim_type}</h4>
                          <Badge variant={opp.confidence === 'High' ? 'default' : 'outline'}>
                            {opp.confidence} Confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{opp.reasoning}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <strong>Eligible Parts:</strong>
                            <ul className="list-disc ml-5">
                              {opp.eligible_parts?.map((part, i) => (
                                <li key={i}>{part}</li>
                              )) || <li>None specified</li>}
                            </ul>
                          </div>
                          <div>
                            <strong>Documentation Needed:</strong>
                            <ul className="list-disc ml-5">
                              {opp.documentation_needed?.map((doc, i) => (
                                <li key={i}>{doc}</li>
                              )) || <li>None specified</li>}
                            </ul>
                          </div>
                        </div>
                        {opp.estimated_recovery && (
                          <p className="text-green-700 font-semibold mt-2">
                            Estimated Recovery: ${opp.estimated_recovery.toFixed(2)}
                          </p>
                        )}
                      </div>
                    ))
                  ) : null}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold mb-2 text-gray-700">No Warranty Opportunities Found</p>
                  <p className="text-sm text-gray-600 mb-4">Based on the current work order details, no warranty coverage opportunities were identified.</p>
                </div>
              )}
              
              {warrantyAnalysis.next_steps && warrantyAnalysis.next_steps.length > 0 && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <span className="text-blue-700">📋 Next Steps:</span>
                  </h4>
                  <ol className="list-decimal ml-5 space-y-1 text-sm">
                    {warrantyAnalysis.next_steps?.map((step, i) => (
                      <li key={i}>{step}</li>
                    )) || <li>No next steps specified</li>}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Parts & Labor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Parts Used */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Parts Used
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => setShowPartSelector(true)}
                    className="bg-white text-[#124481] hover:bg-gray-100"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Part
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowPartsRequest(true)}
                    variant="outline"
                    className="bg-white border-white text-[#124481] hover:bg-gray-100"
                  >
                    <Package className="mr-1 h-3 w-3" />
                    Request Parts
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {project?.parts_used && project.parts_used.length > 0 ? (
                <div className="space-y-3">
                  {project.parts_used.map((part, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-[#289790] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{part.part_name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {part.part_number}
                            </Badge>
                          </div>
                          {part.notes && (
                            <p className="text-sm text-gray-600 mb-2">{part.notes}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">Qty: {part.quantity}</span>
                            <span className="text-gray-600">@ ${part.unit_price.toFixed(2)}</span>
                            <span className="font-semibold text-green-600">
                              Total: ${part.total_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePart(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Parts Subtotal:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${calculatePartsTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p className="mb-3">No parts added yet</p>
                  <Button 
                    size="sm"
                    onClick={() => setShowPartSelector(true)}
                    className="bg-[#289790] hover:bg-[#1E7083]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Part
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Labor Items */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-[#1E7083] to-[#289790] text-white">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5" />
                  Labor
                </span>
                <Button 
                  size="sm"
                  onClick={() => setShowLaborEntry(true)}
                  className="bg-white text-[#1E7083] hover:bg-gray-100"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Labor
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {project?.labor_items && project.labor_items.length > 0 ? (
                <div className="space-y-3">
                  {project.labor_items.map((labor, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-[#289790] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{labor.description}</h4>
                          {labor.technician && (
                            <p className="text-sm text-gray-600 mb-2">Technician: {labor.technician}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">{labor.hours} hrs</span>
                            <span className="text-gray-600">@ ${labor.rate.toFixed(2)}/hr</span>
                            <span className="font-semibold text-green-600">
                              Total: ${labor.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveLabor(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Labor Subtotal:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${calculateLaborTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p className="mb-3">No labor added yet</p>
                  <Button 
                    size="sm"
                    onClick={() => setShowLaborEntry(true)}
                    className="bg-[#289790] hover:bg-[#1E7083]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Labor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Total Section */}
        {((project?.parts_used && project.parts_used.length > 0) || 
          (project?.labor_items && project.labor_items.length > 0)) && (
          <Card className="mb-6 border-[#289790]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Work Order Total</h3>
                  <p className="text-sm text-gray-600">
                    {(project?.parts_used?.length || 0)} parts • {(project?.labor_items?.length || 0)} labor items
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#289790]">
                    ${calculateGrandTotal().toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Before taxes & fees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parts & Labor Details Section - MOVED TO BOTTOM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {diagnosticActive && activeStep && (
              <Card className="border-[#289790]">
                <CardHeader className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Wrench className="mr-2 h-5 w-5" />
                      Step {currentStep + 1} of {diagnosticSteps.length}: {activeStep.title}
                    </CardTitle>
                    {estimatedTime && (
                      <Badge variant="secondary" className="bg-white text-[#124481]">
                        <Clock className="mr-1 h-3 w-3" />
                        {estimatedTime} min
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What This Step Does:</h4>
                    <p className="text-gray-700">{activeStep.description}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Detailed Instructions:
                    </h4>
                    <ol className="space-y-2">
                      {activeStep.detailed_instructions && activeStep.detailed_instructions.length > 0 ? (
                        activeStep.detailed_instructions.map((instruction, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="font-semibold text-blue-700 mr-2">{idx + 1}.</span>
                            <span className="text-sm text-blue-900">{instruction}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-blue-900">No detailed instructions available</li>
                      )}
                    </ol>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Expected Results:
                    </h4>
                    <ul className="space-y-1">
                      {activeStep.expected_results && activeStep.expected_results.length > 0 ? (
                        activeStep.expected_results.map((result, idx) => (
                          <li key={idx} className="text-sm text-green-800">• {result}</li>
                        ))
                      ) : (
                        <li className="text-sm text-green-800">No expected results specified</li>
                      )}
                    </ul>
                  </div>

                  {activeStep.tools_required && activeStep.tools_required.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tools Required:</h4>
                      <div className="flex gap-2 flex-wrap">
                        {activeStep.tools_required.map((tool, idx) => (
                          <Badge key={idx} variant="outline">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeStep.safety_notes && activeStep.safety_notes.length > 0 && (
                    <Alert variant="destructive">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Safety:</strong>
                        <ul className="mt-1">
                          {activeStep.safety_notes.map((note, idx) => (
                            <li key={idx} className="text-sm">• {note}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {activeStep.reference_links && activeStep.reference_links.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        References:
                      </h4>
                      <ul className="space-y-1">
                        {activeStep.reference_links.map((link, idx) => (
                          <li key={idx} className="text-sm text-blue-600">• {link}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium text-gray-900">Technician Notes:</label>
                      {/* DISABLED: VoiceInput temporarily removed due to TTS service unavailability */}
                    </div>
                    <Textarea
                      value={techNotes}
                      onChange={(e) => setTechNotes(e.target.value)}
                      placeholder="Document your findings, measurements, and observations..."
                      rows={4}
                      data-testid="tech-notes"
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      disabled={currentStep === 0}
                    >
                      Previous Step
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="bg-[#124481] hover:bg-[#1E7083]"
                      disabled={currentStep === diagnosticSteps.length - 1}
                    >
                      {currentStep === diagnosticSteps.length - 1 ? 'Complete' : 'Next Step'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-[#124481]" />
                  Work Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Work Order #</label>
                    <p className="text-base">{project.work_order_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Complaint</label>
                  <p className="text-base mt-1">{project.complaint || 'No complaint recorded'}</p>
                </div>
                {project.fault_codes && project.fault_codes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fault Codes</label>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {project.fault_codes.map((code, idx) => (
                        <Badge key={idx} variant="outline" className="text-red-700 border-red-300">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Modals */}
      {showPartSelector && (
        <PartSelectorModal
          projectId={id}
          onClose={() => setShowPartSelector(false)}
          onSuccess={handlePartsSuccess}
        />
      )}

      {showLaborEntry && (
        <LaborEntryModal
          projectId={id}
          onClose={() => setShowLaborEntry(false)}
          onSuccess={handleLaborSuccess}
        />
      )}

      {showPartsRequest && (
        <PartsRequestModal
          isOpen={showPartsRequest}
          projectId={id}
          onClose={() => setShowPartsRequest(false)}
          onSubmit={handlePartsRequestSuccess}
        />
      )}
    </div>
  );
};

export default ProjectDetail;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, Zap, Loader2, X } from 'lucide-react';

const QuickStartModal = ({ isOpen, onClose, mode = 'diagnostic' }) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/work-orders/scan-and-create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Navigate based on mode
        if (mode === 'diagnostic') {
          // Go to diagnostic chat with pre-loaded context
          navigate(`/projects/${result.project_id}/diagnostic`);
        } else {
          // Go to the new work order
          navigate(`/projects/${result.project_id}`);
        }
        
        onClose();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to process work order');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload work order');
    } finally {
      setUploading(false);
    }
  };

  const handleManualStart = () => {
    if (mode === 'diagnostic') {
      navigate('/templates');
    } else {
      navigate('/projects/new');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {mode === 'diagnostic' ? (
                <>
                  <Zap className="h-5 w-5 text-[#289790]" />
                  Start Diagnostic Session
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 text-[#289790]" />
                  Create Work Order
                </>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scan Work Order Option (PRIMARY) */}
          <div className="border-2 border-[#289790] rounded-lg p-6 bg-gradient-to-br from-[#289790]/5 to-[#124481]/5">
            <div className="flex items-start gap-4">
              <div className="bg-[#289790] p-3 rounded-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Scan Work Order (Recommended)
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload a PDF work order. We'll automatically extract VIN, complaints, 
                  fault codes, create the truck (if new), and {mode === 'diagnostic' ? 'launch AI diagnostics' : 'create the work order'}.
                </p>
                
                {!file ? (
                  <div>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="workorder-upload"
                    />
                    <label htmlFor="workorder-upload">
                      <Button
                        as="span"
                        className="bg-[#289790] hover:bg-[#1E7083] cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select PDF Work Order
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-white rounded border">
                      <FileText className="h-5 w-5 text-[#124481]" />
                      <span className="font-medium text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="ml-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-[#289790] hover:bg-[#1E7083] w-full"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          {mode === 'diagnostic' ? 'Scan & Start Diagnostic' : 'Scan & Create Work Order'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Manual Entry Option (SECONDARY) */}
          <div className="border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Manual Entry
                </h3>
                <p className="text-gray-600 mb-4">
                  {mode === 'diagnostic' 
                    ? 'Start a blank diagnostic session and enter information manually.'
                    : 'Create a work order by filling out the form manually.'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={handleManualStart}
                  className="border-gray-300"
                >
                  {mode === 'diagnostic' ? 'Start Blank Session' : 'Manual Entry Form'}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>💡 Pro Tip:</strong> Scanning a work order is 10x faster! Our AI will extract 
            all information, decode the VIN, create the truck profile, and {mode === 'diagnostic' ? 'start the diagnostic with full context' : 'set up the work order instantly'}.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStartModal;

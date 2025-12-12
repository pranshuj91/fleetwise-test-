import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import EditableExtraction from '../components/EditableExtraction';
import { workOrderAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';

const WorkOrderUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a PDF file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError('');
    setExtractedData(null);

    try {
      const response = await workOrderAPI.createFromPDF(file);
      
      if (response.data.ready_to_save) {
        setExtractedData(response.data.extracted_data);
        setShowEdit(true);
      }
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to process PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExtraction = async (editedData) => {
    setSaving(true);
    setError('');

    try {
      const response = await workOrderAPI.saveFromExtraction(editedData);
      
      setSuccess(true);
      
      // Redirect to the project detail page to start AI diagnostic
      setTimeout(() => {
        navigate(`/projects/${response.data.project_id}`);
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to save data. Please try again.');
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEdit(false);
    setExtractedData(null);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="work-order-upload-page">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="upload-title">
            Import Work Order from PDF
          </h1>
          <p className="text-gray-600">
            Upload an Enrich ERP work order PDF to automatically create truck profiles and projects
          </p>
        </div>

        {success ? (
          <Card className="border-green-200 bg-green-50" data-testid="success-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Work Order Imported Successfully!
                </h3>
                <p className="text-green-700 mb-4">
                  Truck and project have been created from the PDF
                </p>
                <p className="text-sm text-green-600">
                  Redirecting to work order to start AI-guided diagnostic...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : showEdit && extractedData ? (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4" data-testid="error-alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <EditableExtraction
              extractedData={extractedData}
              onSave={handleSaveExtraction}
              onCancel={handleCancelEdit}
            />
          </>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upload PDF Work Order</CardTitle>
                <CardDescription>
                  Drag and drop or click to select a PDF file from Enrich ERP
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4" data-testid="error-alert">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragging
                      ? 'border-[#124481] bg-blue-50'
                      : file
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-[#124481]'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  data-testid="drop-zone"
                >
                  {file ? (
                    <div className="space-y-4">
                      <FileText className="mx-auto h-16 w-16 text-green-600" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setFile(null)}
                        data-testid="remove-file-button"
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-16 w-16 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Drop your PDF here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Supported format: PDF (Enrich ERP work orders)
                        </p>
                      </div>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        data-testid="file-input"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          data-testid="browse-button"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('file-upload').click();
                          }}
                        >
                          Browse Files
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleUpload}
                      disabled={loading}
                      className="bg-[#124481] hover:bg-[#1E7083]"
                      data-testid="upload-button"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing PDF...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import Work Order
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Upload your Enrich ERP work order PDF</li>
            <li>AI automatically extracts truck, customer, and work order details</li>
            <li>Review and edit the extracted information</li>
            <li>Save to create truck and work order with guided diagnostics</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderUpload;

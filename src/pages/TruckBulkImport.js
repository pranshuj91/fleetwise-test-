import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, 
  Loader2, Download, Truck as TruckIcon 
} from 'lucide-react';
import api from '../lib/api';

const TruckBulkImport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/trucks/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: user.role === 'master_admin' ? { company_id: user.company_id } : {}
      });

      setResult(response.data);
      
      if (response.data.successful > 0) {
        setTimeout(() => {
          navigate('/trucks');
        }, 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `vin,year,make,model,truck_number,license_plate,fleet_assignment,engine_manufacturer,engine_model,engine_serial,engine_horsepower,transmission_manufacturer,transmission_model,transmission_type,rear_axle_ratio,emission_standard,current_mileage,customer_name,notes
1HGBH41JXMN109186,2022,Freightliner,Cascadia,FB-001,ABC123,Fleet A,Cummins,ISX15,12345678,450,Eaton,UltraShift PLUS,Automatic,3.42,EPA 2017,125000,Airoldi Brothers,Well maintained
2FMDK3GC4FBA00001,2021,International,LT625,FB-002,DEF456,Fleet B,Detroit,DD15,87654321,500,Allison,4000 Series,Automatic,3.73,EPA 2017,98000,Airoldi Brothers,New DPF installed`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'truck_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/trucks')}
          className="mb-6"
        >
          ← Back to Trucks
        </Button>

        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white">
            <CardTitle className="flex items-center text-2xl">
              <Upload className="mr-3 h-6 w-6" />
              Bulk Import Trucks from CSV
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Instructions */}
              <Alert className="border-blue-200 bg-blue-50">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  <strong>Import Instructions:</strong>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Download the CSV template to see expected format</li>
                    <li>Fill in truck data from AS400 or your existing system</li>
                    <li>Required: Either VIN or Truck Number</li>
                    <li>All other fields are optional</li>
                    <li>Maximum 1000 trucks per upload</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Download Template */}
              <div>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="w-full justify-center border-[#124481] text-[#124481] hover:bg-[#124481] hover:text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV Template
                </Button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#124481] file:text-white hover:file:bg-[#1E7083] cursor-pointer"
                  />
                </div>
                {file && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {file.name} selected
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-[#124481] hover:bg-[#1E7083]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing Trucks...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Trucks
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-900">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Result Display */}
              {result && (
                <div className="space-y-4">
                  <Alert className={result.failed === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                    {result.failed === 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <AlertDescription>
                      <div className="text-sm font-medium mb-2">
                        Import Complete
                      </div>
                      <div className="text-sm space-y-1">
                        <p>✅ Successfully imported: <strong>{result.successful}</strong> trucks</p>
                        {result.failed > 0 && (
                          <p>❌ Failed: <strong>{result.failed}</strong> rows</p>
                        )}
                        <p className="text-xs text-gray-600 mt-2">
                          Redirecting to trucks list in 3 seconds...
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Error Details */}
                  {result.errors && result.errors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-red-700">Import Errors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {result.errors.map((err, idx) => (
                            <div key={idx} className="text-sm bg-red-50 p-3 rounded border border-red-200">
                              <p className="font-medium text-red-900">Row {err.row}:</p>
                              <p className="text-red-700">{err.error}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CSV Format Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CSV Column Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-[#124481] mb-2">Identity</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• vin</li>
                  <li>• year</li>
                  <li>• make</li>
                  <li>• model</li>
                  <li>• truck_number</li>
                  <li>• license_plate</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#124481] mb-2">Engine</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• engine_manufacturer</li>
                  <li>• engine_model</li>
                  <li>• engine_serial</li>
                  <li>• engine_horsepower</li>
                  <li>• fuel_type</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#124481] mb-2">Transmission</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• transmission_manufacturer</li>
                  <li>• transmission_model</li>
                  <li>• transmission_type</li>
                  <li>• transmission_speeds</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#124481] mb-2">Drivetrain</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• rear_axle_manufacturer</li>
                  <li>• rear_axle_ratio</li>
                  <li>• rear_axle_type</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#124481] mb-2">Emissions</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• emission_standard</li>
                  <li>• dpf_manufacturer</li>
                  <li>• scr_manufacturer</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#124481] mb-2">Maintenance</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• current_mileage</li>
                  <li>• in_service_date</li>
                  <li>• last_service_date</li>
                </ul>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              <strong>Note:</strong> All columns are optional except VIN or truck_number. 
              Add more columns matching the comprehensive truck schema as needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TruckBulkImport;

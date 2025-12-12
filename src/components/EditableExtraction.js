import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Truck, User, Wrench, Save } from 'lucide-react';

const EditableExtraction = ({ extractedData, onSave, onCancel }) => {
  const [truckData, setTruckData] = useState(extractedData.truck || {});
  const [customerData, setCustomerData] = useState(extractedData.customer || {});
  const [workOrderData, setWorkOrderData] = useState(extractedData.work_order || {});

  const handleTruckChange = (field, value) => {
    setTruckData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkOrderChange = (field, value) => {
    setWorkOrderData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = () => {
    onSave({
      truck: truckData,
      customer: customerData,
      work_order: workOrderData
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Review and edit the extracted data below.</strong> You can modify any field or add missing information before saving.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Truck Information */}
        <Card data-testid="editable-truck-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Truck className="mr-2 h-5 w-5 text-[#124481]" />
              Truck Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">VIN *</label>
              <Input
                value={truckData.vin || ''}
                onChange={(e) => handleTruckChange('vin', e.target.value)}
                placeholder="17-character VIN"
                maxLength={17}
                data-testid="edit-vin"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Truck Number</label>
              <Input
                value={truckData.truck_number || ''}
                onChange={(e) => handleTruckChange('truck_number', e.target.value)}
                placeholder="Unit/Truck #"
                data-testid="edit-truck-number"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Year</label>
              <Input
                type="number"
                value={truckData.year || ''}
                onChange={(e) => handleTruckChange('year', parseInt(e.target.value) || null)}
                placeholder="2020"
                data-testid="edit-year"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Make</label>
              <Input
                value={truckData.make || ''}
                onChange={(e) => handleTruckChange('make', e.target.value)}
                placeholder="Freightliner, Peterbilt, etc."
                data-testid="edit-make"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Model</label>
              <Input
                value={truckData.model || ''}
                onChange={(e) => handleTruckChange('model', e.target.value)}
                placeholder="Cascadia, 579, etc."
                data-testid="edit-model"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Class</label>
              <Input
                value={truckData.vehicle_class || truckData.class || ''}
                onChange={(e) => handleTruckChange('vehicle_class', e.target.value)}
                placeholder="Class 8"
                data-testid="edit-class"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Odometer (miles)</label>
              <Input
                type="number"
                value={truckData.odometer_mi || ''}
                onChange={(e) => handleTruckChange('odometer_mi', parseInt(e.target.value) || null)}
                placeholder="125000"
                data-testid="edit-odometer"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">License Plate</label>
              <Input
                value={truckData.license || ''}
                onChange={(e) => handleTruckChange('license', e.target.value)}
                placeholder="ABC123"
                data-testid="edit-license"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card data-testid="editable-customer-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="mr-2 h-5 w-5 text-[#1E7083]" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Customer Name</label>
              <Input
                value={customerData.customer_name || ''}
                onChange={(e) => handleCustomerChange('customer_name', e.target.value)}
                placeholder="Company or Customer Name"
                data-testid="edit-customer-name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Customer ID</label>
              <Input
                value={customerData.customer_id || ''}
                onChange={(e) => handleCustomerChange('customer_id', e.target.value)}
                placeholder="Customer Reference #"
                data-testid="edit-customer-id"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Location</label>
              <Input
                value={customerData.location || ''}
                onChange={(e) => handleCustomerChange('location', e.target.value)}
                placeholder="City, State"
                data-testid="edit-location"
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Order Information */}
        <Card data-testid="editable-work-order-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Wrench className="mr-2 h-5 w-5 text-[#289790]" />
              Work Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Work Order #</label>
              <Input
                value={workOrderData.work_order_number || ''}
                onChange={(e) => handleWorkOrderChange('work_order_number', e.target.value)}
                placeholder="WO Number"
                data-testid="edit-wo-number"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Date</label>
              <Input
                type="date"
                value={workOrderData.date || ''}
                onChange={(e) => handleWorkOrderChange('date', e.target.value)}
                data-testid="edit-wo-date"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Complaint / Symptoms</label>
              <Textarea
                value={workOrderData.complaint || ''}
                onChange={(e) => handleWorkOrderChange('complaint', e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                data-testid="edit-complaint"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Fault Codes (comma-separated)</label>
              <Input
                value={Array.isArray(workOrderData.fault_codes) ? workOrderData.fault_codes.join(', ') : workOrderData.fault_codes || ''}
                onChange={(e) => handleWorkOrderChange('fault_codes', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                placeholder="SPN 524, FMI 2, etc."
                data-testid="edit-fault-codes"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          data-testid="cancel-edit-button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveAll}
          className="bg-[#124481] hover:bg-[#1E7083]"
          data-testid="save-extraction-button"
        >
          <Save className="mr-2 h-4 w-4" />
          Save & Create Truck + Work Order
        </Button>
      </div>
    </div>
  );
};

export default EditableExtraction;

import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Settings as SettingsIcon, Building, Bell, Shield, Palette, 
  Database, Users, Save, Check
} from 'lucide-react';

const Settings = () => {
  const [saved, setSaved] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Fleetwise AI Demo',
    address: '123 Fleet Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    phone: '(555) 123-4567',
    email: 'contact@fleetwise.ai',
    taxRate: '8.5',
    laborRate: '125',
    shopSuppliesFee: '25',
    environmentalFee: '15'
  });

  const [notifications, setNotifications] = useState({
    emailWorkOrders: true,
    emailInvoices: true,
    emailPM: true,
    emailWarranty: false,
    smsAlerts: false
  });

  const handleSave = () => {
    // In production, this would save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8 text-[#124481]" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your shop and system preferences</p>
        </div>

        {/* Save Button */}
        {saved && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <Check className="h-5 w-5" />
            Settings saved successfully!
          </div>
        )}

        {/* Company Information */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white">
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <Input
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  value={companySettings.city}
                  onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Input
                  value={companySettings.state}
                  onChange={(e) => setCompanySettings({...companySettings, state: e.target.value})}
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <Input
                  value={companySettings.zipCode}
                  onChange={(e) => setCompanySettings({...companySettings, zipCode: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-[#1E7083] to-[#289790] text-white">
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Default Rates & Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Rate (per hour)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    value={companySettings.laborRate}
                    onChange={(e) => setCompanySettings({...companySettings, laborRate: e.target.value})}
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={companySettings.taxRate}
                    onChange={(e) => setCompanySettings({...companySettings, taxRate: e.target.value})}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Supplies Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    value={companySettings.shopSuppliesFee}
                    onChange={(e) => setCompanySettings({...companySettings, shopSuppliesFee: e.target.value})}
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Environmental Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    value={companySettings.environmentalFee}
                    onChange={(e) => setCompanySettings({...companySettings, environmentalFee: e.target.value})}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-[#289790] to-[#1E7083] text-white">
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications - Work Orders</p>
                  <p className="text-sm text-gray-600">Receive emails when work orders are created or updated</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailWorkOrders}
                  onChange={(e) => setNotifications({...notifications, emailWorkOrders: e.target.checked})}
                  className="w-5 h-5 text-[#124481]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications - Invoices</p>
                  <p className="text-sm text-gray-600">Receive emails when invoices are sent or paid</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailInvoices}
                  onChange={(e) => setNotifications({...notifications, emailInvoices: e.target.checked})}
                  className="w-5 h-5 text-[#124481]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications - PM Reminders</p>
                  <p className="text-sm text-gray-600">Get reminders for upcoming preventive maintenance</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailPM}
                  onChange={(e) => setNotifications({...notifications, emailPM: e.target.checked})}
                  className="w-5 h-5 text-[#124481]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications - Warranty Claims</p>
                  <p className="text-sm text-gray-600">Alerts for warranty claim opportunities</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailWarranty}
                  onChange={(e) => setNotifications({...notifications, emailWarranty: e.target.checked})}
                  className="w-5 h-5 text-[#124481]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">SMS Alerts</p>
                  <p className="text-sm text-gray-600">Receive text message alerts for urgent items</p>
                </div>
                <Badge className="bg-yellow-500">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#124481] hover:bg-[#1E7083]"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

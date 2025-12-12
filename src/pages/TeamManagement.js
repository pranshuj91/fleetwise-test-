import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Users, UserPlus, Search, Edit, Trash2, Shield, Wrench, 
  Mail, Phone, Calendar, CheckCircle, X, Loader2
} from 'lucide-react';

const TeamManagement = () => {
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'john@fleetwise.com',
      role: 'company_admin',
      phone: '(555) 123-4567',
      status: 'active',
      joinedDate: '2024-01-15',
      assignedWorkOrders: 12,
      completedWorkOrders: 45
    },
    {
      id: '2',
      fullName: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@fleetwise.com',
      role: 'technician',
      phone: '(555) 234-5678',
      status: 'active',
      joinedDate: '2024-02-20',
      assignedWorkOrders: 8,
      completedWorkOrders: 32
    },
    {
      id: '3',
      fullName: 'Mike Wilson',
      username: 'mikewilson',
      email: 'mike@fleetwise.com',
      role: 'technician',
      phone: '(555) 345-6789',
      status: 'active',
      joinedDate: '2024-03-10',
      assignedWorkOrders: 5,
      completedWorkOrders: 28
    },
    {
      id: '4',
      fullName: 'Sarah Johnson',
      username: 'sarahj',
      email: 'sarah@fleetwise.com',
      role: 'service_advisor',
      phone: '(555) 456-7890',
      status: 'active',
      joinedDate: '2024-04-05',
      assignedWorkOrders: 0,
      completedWorkOrders: 15
    }
  ]);

  const [newMember, setNewMember] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'technician',
    phone: '',
    password: ''
  });

  const roles = [
    { value: 'company_admin', label: 'Company Admin', color: 'purple', icon: Shield },
    { value: 'technician', label: 'Technician', color: 'blue', icon: Wrench },
    { value: 'service_advisor', label: 'Service Advisor', color: 'green', icon: Users }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.color : 'gray';
  };

  const getRoleIcon = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.icon : Shield;
  };

  const handleAddMember = async () => {
    // In production, this would call the backend API
    setLoading(true);
    setTimeout(() => {
      const newUser = {
        id: String(teamMembers.length + 1),
        ...newMember,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        assignedWorkOrders: 0,
        completedWorkOrders: 0
      };
      setTeamMembers([...teamMembers, newUser]);
      setShowAddModal(false);
      setNewMember({
        fullName: '',
        username: '',
        email: '',
        role: 'technician',
        phone: '',
        password: ''
      });
      setLoading(false);
    }, 1000);
  };

  const handleDeleteMember = (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8 text-[#124481]" />
                Team Management
              </h1>
              <p className="text-gray-600 mt-1">Manage technicians and staff members</p>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#124481] hover:bg-[#1E7083]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-[#124481]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Technicians</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {teamMembers.filter(m => m.role === 'technician').length}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Work Orders</p>
                  <p className="text-2xl font-bold text-[#289790]">
                    {teamMembers.reduce((sum, m) => sum + m.assignedWorkOrders, 0)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-[#289790]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {teamMembers.reduce((sum, m) => sum + m.completedWorkOrders, 0)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Team Members List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMembers.map(member => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#124481] bg-opacity-10 rounded-full flex items-center justify-center">
                        <RoleIcon className="h-6 w-6 text-[#124481]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                        <p className="text-sm text-gray-600">@{member.username}</p>
                        <Badge className={`mt-1 bg-${getRoleBadgeColor(member.role)}-500`}>
                          {roles.find(r => r.value === member.role)?.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        {member.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(member.joinedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Assigned</p>
                      <p className="font-semibold text-[#289790]">{member.assignedWorkOrders} active</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Completed</p>
                      <p className="font-semibold text-green-600">{member.completedWorkOrders} total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add Team Member
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <Input
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <Input
                    value={newMember.username}
                    onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <Input
                    type="password"
                    value={newMember.password}
                    onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={loading || !newMember.fullName || !newMember.email}
                    className="flex-1 bg-[#124481] hover:bg-[#1E7083]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Member'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;

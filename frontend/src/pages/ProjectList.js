import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { FileText, Filter, ArrowUpDown } from 'lucide-react';

const ProjectList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'work_order'

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectAPI.list(user?.company_id, statusFilter === 'all' ? null : statusFilter);
        const fetchedProjects = response.data;
        
        // Apply sorting
        const sorted = [...fetchedProjects].sort((a, b) => {
          if (sortBy === 'work_order') {
            // Sort by work order number
            const woA = a.work_order_number || a.id || '';
            const woB = b.work_order_number || b.id || '';
            
            // Try numeric comparison first
            const numA = parseInt(woA);
            const numB = parseInt(woB);
            
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            
            // Fallback to string comparison
            return woA.localeCompare(woB);
          } else {
            // Sort by date (newest first)
            return new Date(b.created_at) - new Date(a.created_at);
          }
        });
        
        setProjects(sorted);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, statusFilter, sortBy]);

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
    <div className="min-h-screen bg-gray-50" data-testid="project-list-page">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="projects-title">Work Orders</h1>
            <p className="text-gray-600">{projects.length} projects</p>
          </div>
        </div>

        {/* Filter and Sort */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {/* Status Filter */}
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-gray-600" />
                <div className="flex gap-2">
                  <Badge 
                    className={`cursor-pointer ${statusFilter === 'all' ? 'bg-[#124481]' : 'bg-gray-300'}`}
                    onClick={() => setStatusFilter('all')}
                    data-testid="filter-all"
                  >
                    All
                  </Badge>
                  <Badge 
                    className={`cursor-pointer ${statusFilter === 'draft' ? 'bg-[#124481]' : 'bg-gray-300'}`}
                    onClick={() => setStatusFilter('draft')}
                    data-testid="filter-draft"
                  >
                    Draft
                  </Badge>
                  <Badge 
                    className={`cursor-pointer ${statusFilter === 'in_progress' ? 'bg-[#124481]' : 'bg-gray-300'}`}
                    onClick={() => setStatusFilter('in_progress')}
                    data-testid="filter-in-progress"
                  >
                    In Progress
                  </Badge>
                  <Badge 
                    className={`cursor-pointer ${statusFilter === 'completed' ? 'bg-[#124481]' : 'bg-gray-300'}`}
                    onClick={() => setStatusFilter('completed')}
                    data-testid="filter-completed"
                  >
                    Completed
                  </Badge>
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="flex items-center gap-3">
                <ArrowUpDown className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="flex gap-2">
                  <Badge 
                    className={`cursor-pointer ${sortBy === 'date' ? 'bg-[#289790]' : 'bg-gray-300'}`}
                    onClick={() => setSortBy('date')}
                    data-testid="sort-date"
                  >
                    Date
                  </Badge>
                  <Badge 
                    className={`cursor-pointer ${sortBy === 'work_order' ? 'bg-[#289790]' : 'bg-gray-300'}`}
                    onClick={() => setSortBy('work_order')}
                    data-testid="sort-work-order"
                  >
                    Work Order #
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2" data-testid="no-projects">No projects found</h3>
              <p className="text-gray-600">Projects will appear here once they are created</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
                data-testid={`project-card-${project.id}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    {/* Left: Work Order Number */}
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm text-gray-500">WO #</div>
                      <div className="text-lg font-bold text-gray-900">
                        {project.work_order_number || project.id?.substring(0, 8) || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Middle: Truck and Details */}
                    <div className="flex-1 px-6">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-semibold text-gray-900">
                          {project.truck_number || 'No Truck #'}
                        </h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {project.customer_name && (
                        <p className="text-sm text-gray-600 mb-1">
                          Customer: {project.customer_name}
                        </p>
                      )}
                      
                      {project.complaint && (
                        <p className="text-sm text-gray-700 mb-1 line-clamp-1">
                          {project.complaint}
                        </p>
                      )}
                      
                      {project.fault_codes && project.fault_codes.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-1">
                          {project.fault_codes.slice(0, 3).map((code, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                          {project.fault_codes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.fault_codes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Right: Dates */}
                    <div className="w-48 text-right flex-shrink-0">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Updated: {new Date(project.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;

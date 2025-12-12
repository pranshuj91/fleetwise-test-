import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Mail, Send, Inbox, User, Clock, AlertCircle,
  MessageSquare, CheckCircle, Loader2, X, FileText, Link
} from 'lucide-react';

const TeamMessages = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [estimates, setEstimates] = useState([]);
  
  // Compose form state
  const [composeForm, setComposeForm] = useState({
    recipient_id: '',
    subject: '',
    message_text: '',
    priority: 'normal',
    related_work_order: '',
    related_estimate: ''
  });

  useEffect(() => {
    fetchMessages();
    fetchTeamMembers();
    fetchWorkOrders();
    fetchEstimates();
  }, [unreadOnly]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/messages/inbox?unread_only=${unreadOnly}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/team`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/projects`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const fetchEstimates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/estimates`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setEstimates(data);
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/messages/${messageId}/read`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.ok) {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(composeForm)
        }
      );
      
      if (response.ok) {
        setShowCompose(false);
        setComposeForm({
          recipient_id: '',
          subject: '',
          message_text: '',
          priority: 'normal',
          related_work_order: '',
          related_estimate: ''
        });
        alert('Message sent successfully!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: <Badge className="bg-gray-400">Low</Badge>,
      normal: <Badge className="bg-blue-500">Normal</Badge>,
      high: <Badge className="bg-orange-500">High</Badge>,
      urgent: <Badge className="bg-red-600">Urgent</Badge>
    };
    return badges[priority] || <Badge>{priority}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-[#124481]" />
              Team Messages
            </h1>
            <p className="text-gray-600 mt-1">Communicate with your team members</p>
          </div>
          
          <Button
            onClick={() => setShowCompose(true)}
            className="bg-[#289790] hover:bg-[#1E7083]"
          >
            <Send className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>New Message</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCompose(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <select
                    value={composeForm.recipient_id}
                    onChange={(e) => setComposeForm({...composeForm, recipient_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select recipient...</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.full_name || member.email} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={composeForm.priority}
                    onChange={(e) => setComposeForm({...composeForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Input
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                    placeholder="Message subject..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <Textarea
                    value={composeForm.message_text}
                    onChange={(e) => setComposeForm({...composeForm, message_text: e.target.value})}
                    placeholder="Type your message..."
                    rows={6}
                  />
                </div>

                {/* Work Order / Estimate Tagging */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Link className="h-4 w-4" />
                    <span className="font-medium">Link to Work Order or Estimate (Optional)</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Work Order</label>
                    <select
                      value={composeForm.related_work_order}
                      onChange={(e) => setComposeForm({...composeForm, related_work_order: e.target.value, related_estimate: ''})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">None</option>
                      {workOrders.map(wo => (
                        <option key={wo.id} value={wo.id}>
                          {wo.work_order_number || wo.id.slice(0, 8)} - {wo.truck_id?.slice(0, 8)} ({wo.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimate</label>
                    <select
                      value={composeForm.related_estimate}
                      onChange={(e) => setComposeForm({...composeForm, related_estimate: e.target.value, related_work_order: ''})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">None</option>
                      {estimates.map(est => (
                        <option key={est.id} value={est.id}>
                          {est.estimate_number} - {est.customer_name} (${est.estimated_total?.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendMessage}
                    className="bg-[#289790] hover:bg-[#1E7083]"
                    disabled={!composeForm.recipient_id || !composeForm.subject || !composeForm.message_text}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    <Inbox className="h-5 w-5 inline mr-2" />
                    Inbox
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUnreadOnly(!unreadOnly)}
                  >
                    {unreadOnly ? 'Show All' : 'Unread Only'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No messages</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (!message.read) {
                            markAsRead(message.id);
                          }
                        }}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : message.read
                            ? 'bg-gray-50 hover:bg-gray-100'
                            : 'bg-white border-2 border-[#289790] hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className={`text-sm ${!message.read ? 'font-bold' : 'font-medium'}`}>
                              {message.sender_name}
                            </span>
                          </div>
                          {getPriorityBadge(message.priority)}
                        </div>
                        <p className={`text-sm ${!message.read ? 'font-semibold' : ''}`}>
                          {message.subject}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(message.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Message Details</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedMessage ? (
                  <div className="text-center py-12">
                    <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a message to view</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between pb-4 border-b">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedMessage.subject}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>From: {selectedMessage.sender_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {getPriorityBadge(selectedMessage.priority)}
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.message_text}
                      </p>
                    </div>

                    {/* Linked Work Order / Estimate */}
                    {(selectedMessage.related_work_order || selectedMessage.related_estimate) && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Linked Reference</span>
                        </div>
                        {selectedMessage.related_work_order && (
                          <div className="text-sm text-blue-800">
                            <span className="font-semibold">Work Order:</span>{' '}
                            <button 
                              onClick={() => navigate(`/projects/${selectedMessage.related_work_order}`)}
                              className="underline hover:text-blue-600"
                            >
                              {selectedMessage.work_order_number || selectedMessage.related_work_order.slice(0, 8)}
                            </button>
                          </div>
                        )}
                        {selectedMessage.related_estimate && (
                          <div className="text-sm text-blue-800">
                            <span className="font-semibold">Estimate:</span>{' '}
                            <button 
                              onClick={() => navigate(`/estimates/${selectedMessage.related_estimate}`)}
                              className="underline hover:text-blue-600"
                            >
                              {selectedMessage.estimate_number || selectedMessage.related_estimate.slice(0, 8)}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedMessage.read && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Read on {new Date(selectedMessage.read_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMessages;

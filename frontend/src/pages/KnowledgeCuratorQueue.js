import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Filter, Search, Plus, MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, Flag, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const KnowledgeCuratorQueue = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('knowledge'); // knowledge or diagnostics
  
  // Diagnostic sessions state
  const [diagnosticSessions, setDiagnosticSessions] = useState([]);
  const [diagnosticFilter, setDiagnosticFilter] = useState('all'); // all, low_rated, high_rated, with_feedback
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (viewMode === 'knowledge') {
      fetchSubmissions();
    } else {
      fetchDiagnosticSessions();
    }
  }, [filter, diagnosticFilter, viewMode]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/knowledge/curator/queue?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch submissions');

      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnosticSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/diagnostic/sessions/review?filter_type=${diagnosticFilter}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch diagnostic sessions');

      const data = await response.json();
      setDiagnosticSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching diagnostic sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosticAction = async (sessionId, action) => {
    try {
      setProcessing(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/diagnostic/session/${sessionId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            action,
            notes: reviewComment
          })
        }
      );

      if (!response.ok) throw new Error('Failed to process action');

      alert(`Session ${action === 'add_to_kb' ? 'approved and added to knowledge base' : action === 'flag_improvement' ? 'flagged for improvement' : 'marked as training example'}!`);
      setSelectedSession(null);
      setReviewComment('');
      fetchDiagnosticSessions();
    } catch (error) {
      console.error('Error processing diagnostic action:', error);
      alert('Failed to process action');
    } finally {
      setProcessing(false);
    }
  };

  const handleReview = async (submissionId, action) => {
    try {
      setProcessing(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/knowledge/curator/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            submission_id: submissionId,
            action, // 'approve' or 'reject'
            comment: reviewComment
          })
        }
      );

      if (!response.ok) throw new Error('Review action failed');

      alert(`Knowledge entry ${action}d successfully!`);
      setSelectedSubmission(null);
      setReviewComment('');
      await fetchSubmissions();
    } catch (error) {
      console.error('Error reviewing submission:', error);
      alert('Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const categoryColors = {
    triage: 'bg-purple-100 text-purple-800',
    diagnosis: 'bg-blue-100 text-blue-800',
    correction: 'bg-green-100 text-green-800',
    safety: 'bg-red-100 text-red-800',
    parts: 'bg-yellow-100 text-yellow-800',
    reference: 'bg-gray-100 text-gray-800'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <>
      <Navigation />
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Curator Queue</h1>
          <p className="text-gray-600">Review and approve submissions to train the AI</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600 text-white px-4 py-2 text-lg">
            {submissions.filter(s => s.status === 'pending').length} Pending
          </Badge>
          <Button 
            onClick={() => window.location.href = '/knowledge/submit'}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={viewMode === 'knowledge' ? 'default' : 'outline'}
              onClick={() => setViewMode('knowledge')}
              className="flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Knowledge Submissions
            </Button>
            <Button
              variant={viewMode === 'diagnostics' ? 'default' : 'outline'}
              onClick={() => setViewMode('diagnostics')}
              className="flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Diagnostic Reviews
            </Button>
          </div>

          {/* Filter Tabs */}
          {viewMode === 'knowledge' ? (
            <div className="flex space-x-2">
              {['pending', 'approved', 'rejected', 'all'].map(status => (
                <Badge
                  key={status}
                  className={`cursor-pointer ${filter === status ? 'bg-[#124481]' : 'bg-gray-300'}`}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Sessions' },
                { key: 'high_rated', label: '👍 High Rated' },
                { key: 'low_rated', label: '👎 Low Rated' },
                { key: 'with_feedback', label: '💬 With Comments' }
              ].map(({ key, label }) => (
                <Badge
                  key={key}
                  className={`cursor-pointer ${diagnosticFilter === key ? 'bg-[#124481]' : 'bg-gray-300'}`}
                  onClick={() => setDiagnosticFilter(key)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List View */}
        <div className="space-y-4">
          {viewMode === 'knowledge' ? (
            // KNOWLEDGE SUBMISSIONS
            loading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Loading submissions...
              </CardContent>
            </Card>
          ) : submissions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No submissions in this category</p>
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card
                key={submission.submission_id}
                className={`cursor-pointer transition-all ${
                  selectedSubmission?.submission_id === submission.submission_id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex-1">{submission.title}</h3>
                    <Badge className={statusColors[submission.status]}>
                      {submission.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={categoryColors[submission.category]}>
                      {submission.category}
                    </Badge>
                    {submission.tags && submission.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{submission.content}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Submitted by {submission.submitted_by_email} • {new Date(submission.submitted_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )
          ) : (
            // DIAGNOSTIC SESSIONS
            loading ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Loading diagnostic sessions...
                </CardContent>
              </Card>
            ) : diagnosticSessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No diagnostic sessions in this category</p>
                </CardContent>
              </Card>
            ) : (
              diagnosticSessions.map((session) => (
                <Card
                  key={session.session_id}
                  className={`cursor-pointer transition-all ${
                    selectedSession?.session_id === session.session_id
                      ? 'ring-2 ring-[#289790] shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          WO #{session.work_order_number || session.project_id?.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600">{session.truck_number || 'No truck'} • {session.customer_name || 'Unknown customer'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          session.satisfaction_score >= 75 ? 'bg-green-100 text-green-800' :
                          session.satisfaction_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {session.satisfaction_score}% 
                        </Badge>
                      </div>
                    </div>

                    {session.complaint && (
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        {session.complaint}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1 text-green-600" />
                          {session.thumbs_up}
                        </span>
                        <span className="flex items-center">
                          <ThumbsDown className="h-3 w-3 mr-1 text-red-600" />
                          {session.thumbs_down}
                        </span>
                        {session.has_comments > 0 && (
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1 text-blue-600" />
                            {session.has_comments} comments
                          </span>
                        )}
                      </div>
                      <span>
                        {session.user_email} • {new Date(session.last_feedback_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>

        {/* Detail View */}
        <div className="sticky top-6">
          {viewMode === 'knowledge' && selectedSubmission ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Review Submission</span>
                  <Badge className={statusColors[selectedSubmission.status]}>
                    {selectedSubmission.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedSubmission.title}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge className={categoryColors[selectedSubmission.category]}>
                      {selectedSubmission.category}
                    </Badge>
                    {selectedSubmission.tags && selectedSubmission.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Content:</label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSubmission.content}</p>
                  </div>
                </div>

                {selectedSubmission.source && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Source:</label>
                    <p className="text-sm text-gray-600">{selectedSubmission.source}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Submitted by:</label>
                  <p className="text-sm text-gray-600">
                    {selectedSubmission.submitted_by_email} on {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>

                {selectedSubmission.status === 'pending' && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Review Comment (optional)
                      </label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        placeholder="Add notes about your decision..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleReview(selectedSubmission.submission_id, 'approve')}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Train AI
                      </Button>
                      <Button
                        onClick={() => handleReview(selectedSubmission.submission_id, 'reject')}
                        disabled={processing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSubmission.reviewed_at && (
                  <div className="border-t pt-4 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">Review History:</p>
                    <p className="text-sm text-blue-800">
                      {selectedSubmission.status === 'approved' ? 'Approved' : 'Rejected'} by {selectedSubmission.reviewed_by_email}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {new Date(selectedSubmission.reviewed_at).toLocaleString()}
                    </p>
                    {selectedSubmission.review_comment && (
                      <p className="text-sm text-blue-900 mt-2 italic">"{selectedSubmission.review_comment}"</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'diagnostics' && selectedSession ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Diagnostic Session Review</span>
                  <Badge className={`${
                    selectedSession.satisfaction_score >= 75 ? 'bg-green-600' :
                    selectedSession.satisfaction_score >= 50 ? 'bg-yellow-600' :
                    'bg-red-600'
                  } text-white`}>
                    {selectedSession.satisfaction_score}% Satisfaction
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Session Info */}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Work Order:</strong> #{selectedSession.work_order_number}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Truck:</strong> {selectedSession.truck_number}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Customer:</strong> {selectedSession.customer_name}
                  </p>
                  {selectedSession.complaint && (
                    <p className="text-sm text-gray-600">
                      <strong>Complaint:</strong> {selectedSession.complaint}
                    </p>
                  )}
                </div>

                {/* Feedback Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Feedback Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <ThumbsUp className="h-5 w-5 text-green-600 mr-1" />
                        <span className="text-2xl font-bold text-green-600">{selectedSession.thumbs_up}</span>
                      </div>
                      <p className="text-xs text-gray-600">Helpful</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <ThumbsDown className="h-5 w-5 text-red-600 mr-1" />
                        <span className="text-2xl font-bold text-red-600">{selectedSession.thumbs_down}</span>
                      </div>
                      <p className="text-xs text-gray-600">Not Helpful</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <MessageSquare className="h-5 w-5 text-blue-600 mr-1" />
                        <span className="text-2xl font-bold text-blue-600">{selectedSession.has_comments}</span>
                      </div>
                      <p className="text-xs text-gray-600">Comments</p>
                    </div>
                  </div>
                </div>

                {/* Feedback Items */}
                <div className="max-h-64 overflow-y-auto space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 sticky top-0 bg-white py-2">Individual Feedback:</h4>
                  {selectedSession.feedback_items?.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded border ${
                      item.rating === 'up' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs text-gray-500">Message {item.message_index}</span>
                        {item.rating === 'up' ? (
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      {item.message_content && (
                        <p className="text-xs text-gray-700 mb-2 line-clamp-2">{item.message_content}</p>
                      )}
                      {item.comment && (
                        <p className="text-xs italic text-gray-600 mt-2">💬 "{item.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Review Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes (Optional)
                  </label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this diagnostic session..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleDiagnosticAction(selectedSession.session_id, 'add_to_kb')}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve & Add to Knowledge Base
                  </Button>
                  <Button
                    onClick={() => handleDiagnosticAction(selectedSession.session_id, 'mark_training')}
                    disabled={processing}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-700 hover:bg-blue-50"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Mark as Training Example
                  </Button>
                  <Button
                    onClick={() => handleDiagnosticAction(selectedSession.session_id, 'flag_improvement')}
                    disabled={processing}
                    variant="outline"
                    className="w-full border-orange-600 text-orange-700 hover:bg-orange-50"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Flag for Improvement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Select {viewMode === 'knowledge' ? 'a submission' : 'a diagnostic session'} to review</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default KnowledgeCuratorQueue;

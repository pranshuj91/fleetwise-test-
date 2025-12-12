import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import Navigation from '../components/Navigation';

const KnowledgeSubmit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'diagnosis',
    tags: '',
    source: ''
  });
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'file'
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'triage', label: 'Triage & Initial Assessment' },
    { value: 'diagnosis', label: 'Diagnostic Procedures' },
    { value: 'correction', label: 'Repair & Correction' },
    { value: 'safety', label: 'Safety & Compliance' },
    { value: 'parts', label: 'Parts & Components' },
    { value: 'reference', label: 'Reference Material' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/knowledge/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      setSuccess(true);
      setTimeout(() => {
        navigate('/knowledge-base');
      }, 2000);
    } catch (error) {
      console.error('Error submitting knowledge:', error);
      alert('Failed to submit knowledge entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
    <>
      <Navigation />
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted!</h2>
            <p className="text-gray-600">Your knowledge entry is pending curator approval.</p>
          </CardContent>
        </Card>
      </div>
    </>
    );
  }

  return (
    <>
      <Navigation />
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Knowledge</h1>
          <p className="text-gray-600">Share your expertise to improve AI guidance</p>
        </div>
        <BookOpen className="h-12 w-12 text-blue-600" />
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Human-in-the-Loop Quality Control</p>
              <p>All submissions are reviewed by a curator before becoming AI guidance. This ensures only accurate, high-quality knowledge trains the system.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Mode Toggle */}
      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          variant={uploadMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setUploadMode('manual')}
          className="flex-1"
        >
          Manual Entry
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          onClick={() => setUploadMode('file')}
          className="flex-1"
        >
          Upload Document
        </Button>
      </div>

      {uploadMode === 'file' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Knowledge Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (PDF, Word, or Text) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <p className="text-sm text-gray-500">
                We'll extract the content automatically. You can review and edit before submitting.
              </p>
              <Button type="button" disabled={!file || submitting} className="w-full">
                {submitting ? 'Processing...' : 'Process & Review Document'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadMode === 'manual' && (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Diagnosing Detroit DD15 Low Power Issues"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <Textarea
                required
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                placeholder="Share your knowledge in detail...\n\nExample:\n- Symptoms to look for\n- Diagnostic steps\n- Common causes\n- Recommended fixes\n- Parts typically needed\n- Time estimates"
              />
              <p className="text-xs text-gray-500 mt-1">Be specific and detailed. This will guide technicians through similar issues.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., DD15, low power, turbo, EGR"
              />
              <p className="text-xs text-gray-500 mt-1">Add relevant keywords to help AI match this knowledge to similar situations</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source (optional)</label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                placeholder="e.g., TSB #12-345, OEM Manual, personal experience"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/knowledge-base')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? 'Submitting...' : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </div>
      </form>
      )}
    </div>
    </>
  );
};

export default KnowledgeSubmit;

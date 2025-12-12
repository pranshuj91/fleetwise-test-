import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, Search, Star, TrendingUp, User, 
  ThumbsUp, MessageSquare, Plus, Filter, Award
} from 'lucide-react';

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddArticle, setShowAddArticle] = useState(false);
  
  const [newArticle, setNewArticle] = useState({
    title: '',
    category: 'diagnostic_tip',
    fault_codes: '',
    symptoms: '',
    solution: '',
    parts_needed: '',
    difficulty: 'intermediate'
  });

  useEffect(() => {
    fetchArticles();
  }, [filterCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/knowledge-base?`;
      if (filterCategory !== 'all') url += `category=${filterCategory}&`;
      if (searchQuery) url += `search=${searchQuery}&`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitArticle = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/knowledge-base`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...newArticle,
            fault_codes: newArticle.fault_codes.split(',').map(c => c.trim()).filter(Boolean),
            parts_needed: newArticle.parts_needed.split(',').map(p => p.trim()).filter(Boolean)
          })
        }
      );
      
      if (response.ok) {
        setShowAddArticle(false);
        setNewArticle({
          title: '',
          category: 'diagnostic_tip',
          fault_codes: '',
          symptoms: '',
          solution: '',
          parts_needed: '',
          difficulty: 'intermediate'
        });
        await fetchArticles();
        alert('Knowledge article added! Thank you for sharing your expertise!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add article');
    }
  };

  const voteArticle = async (articleId, helpful) => {
    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/knowledge-base/${articleId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ helpful })
        }
      );
      await fetchArticles();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'All', icon: BookOpen },
    { value: 'diagnostic_tip', label: 'Diagnostic Tips', icon: TrendingUp },
    { value: 'common_fix', label: 'Common Fixes', icon: Star },
    { value: 'troubleshooting', label: 'Troubleshooting', icon: Search },
    { value: 'best_practice', label: 'Best Practices', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-[#124481]" />
              Tribal Knowledge Base
            </h1>
            <p className="text-gray-600 mt-1">
              Learn from senior techs. Share your expertise. Build collective intelligence.
            </p>
          </div>
          
          <Button
            onClick={() => setShowAddArticle(true)}
            className="bg-[#289790] hover:bg-[#1E7083]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Knowledge
          </Button>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by fault code, symptom, or solution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchArticles()}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto">
                {categories.map(cat => (
                  <Button
                    key={cat.value}
                    variant={filterCategory === cat.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(cat.value)}
                    className={filterCategory === cat.value ? 'bg-[#124481]' : ''}
                  >
                    <cat.icon className="h-4 w-4 mr-1" />
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="mb-6 border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              🏆 Top Contributors This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">Mike S.</div>
                <div className="text-sm text-gray-600">12 articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">Sarah K.</div>
                <div className="text-sm text-gray-600">8 articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">John D.</div>
                <div className="text-sm text-gray-600">6 articles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Article Modal */}
        {showAddArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <Card className="w-full max-w-3xl mx-4 my-8">
              <CardHeader>
                <CardTitle>Share Your Knowledge</CardTitle>
                <p className="text-sm text-gray-600">Help your team learn from your experience</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <Input
                    placeholder="e.g., DPF Regen Failure on 2019 Freightliner Cascadia"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="diagnostic_tip">Diagnostic Tip</option>
                      <option value="common_fix">Common Fix</option>
                      <option value="troubleshooting">Troubleshooting</option>
                      <option value="best_practice">Best Practice</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                      value={newArticle.difficulty}
                      onChange={(e) => setNewArticle({...newArticle, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fault Codes (comma separated)</label>
                  <Input
                    placeholder="P0401, P0402, P0420"
                    value={newArticle.fault_codes}
                    onChange={(e) => setNewArticle({...newArticle, fault_codes: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Symptoms *</label>
                  <Textarea
                    placeholder="What are the symptoms? What does the driver/tech report?"
                    value={newArticle.symptoms}
                    onChange={(e) => setNewArticle({...newArticle, symptoms: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Solution *</label>
                  <Textarea
                    placeholder="Step-by-step solution. Be detailed - help a junior tech understand!"
                    value={newArticle.solution}
                    onChange={(e) => setNewArticle({...newArticle, solution: e.target.value})}
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Parts Needed (comma separated)</label>
                  <Input
                    placeholder="DPF Filter, EGR Valve"
                    value={newArticle.parts_needed}
                    onChange={(e) => setNewArticle({...newArticle, parts_needed: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddArticle(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitArticle}
                    disabled={!newArticle.title || !newArticle.symptoms || !newArticle.solution}
                    className="bg-[#289790] hover:bg-[#1E7083]"
                  >
                    Share Knowledge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-500">Loading knowledge base...</div>
              </CardContent>
            </Card>
          ) : articles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No articles yet. Be the first to share!</p>
              </CardContent>
            </Card>
          ) : (
            articles.map(article => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-[#124481]">{article.category.replace('_', ' ')}</Badge>
                        <Badge variant="outline">{article.difficulty}</Badge>
                        {article.fault_codes && article.fault_codes.length > 0 && (
                          article.fault_codes.map(code => (
                            <Badge key={code} className="bg-red-600">{code}</Badge>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{article.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{article.helpful_count || 0} helpful</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Symptoms:</p>
                      <p className="text-sm text-gray-600">{article.symptoms}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Solution:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{article.solution}</p>
                    </div>
                    
                    {article.parts_needed && article.parts_needed.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Parts Needed:</p>
                        <p className="text-sm text-gray-600">{article.parts_needed.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => voteArticle(article.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                    <span className="text-xs text-gray-500">
                      Added {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;

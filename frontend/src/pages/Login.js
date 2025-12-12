import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// TODO: Lovable will implement Supabase auth here
import { authAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // TODO: Lovable will implement real Supabase login here
    // For now, always succeed (auto-login is already active)
    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Lovable will implement real Supabase registration here
      const response = await authAPI.register({
        company_name: companyName,
        email,
        username,
        password,
        full_name: fullName
      });

      // Registration returns token and user, so we can set them directly
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Reload page to update AuthContext from localStorage
      window.location.href = '/';
    } catch (error) {
      setError(error.response?.data?.detail || error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#124481] via-[#1E7083] to-[#289790] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_535fa594-ede0-4625-8569-0b32ef57eae8/artifacts/f51bwilu_Fleetwise%20Logo%20H%402x%20%281%29.png" 
              alt="Fleetwise AI" 
              className="h-12 w-auto"
              data-testid="fleetwise-logo"
            />
          </div>
          <CardTitle className="text-2xl font-bold" data-testid="login-title">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isRegister 
              ? 'Set up your Fleetwise AI account' 
              : 'Sign in to your Fleetwise AI account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRegister ? (
            <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
              {error && (
                <Alert variant="destructive" data-testid="register-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="companyName">Company Name *</label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  data-testid="company-name-input"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="fullName">Full Name *</label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  data-testid="full-name-input"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="username">Username *</label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  data-testid="username-input"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">Email *</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="email-input"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">Password *</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  data-testid="password-input"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Minimum 8 characters</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#124481] hover:bg-[#1E7083]" 
                disabled={loading}
                data-testid="register-button"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                  }}
                  className="text-[#124481] hover:underline font-medium"
                  data-testid="switch-to-login"
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
              {error && (
                <Alert variant="destructive" data-testid="login-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="email-input"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="password-input"
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#124481] hover:bg-[#1E7083]" 
                disabled={loading}
                data-testid="login-button"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                  className="text-[#124481] hover:underline font-medium"
                  data-testid="switch-to-register"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

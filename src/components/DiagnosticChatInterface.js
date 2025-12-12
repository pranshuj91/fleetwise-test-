import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, Bot, CheckCircle2, Mic, Image, X, Volume2, VolumeX, Settings, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import DiagnosticContextPanel from './DiagnosticContextPanel';
// TODO: Lovable will implement Supabase diagnostic chat here
import { diagnosticChatAPI } from '../services/mockAPI';
import { voiceAPI } from '../lib/api';

const DiagnosticChatInterface = ({ 
  projectId, 
  truckInfo, 
  faultCodes, 
  complaint,
  onDataCaptured 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [diagnosticPlan, setDiagnosticPlan] = useState(null);
  const [capturedData, setCapturedData] = useState({
    readings: {},
    parts: [],
    stepsCompleted: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true); // TTS auto-play enabled by default
  const [ttsVoice, setTtsVoice] = useState('alloy'); // Default voice
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState({}); // { messageIndex: { rating, comment, showInput } }
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start the conversational diagnostic session
  const startSession = async () => {
    setIsLoading(true);
    try {
      // TODO: Lovable will implement Supabase diagnostic chat here
      const response = await diagnosticChatAPI.start({
        project_id: projectId,
        truck_info: truckInfo,
        fault_codes: faultCodes,
        complaint: complaint
      });

      const data = response.data;
      
      setSessionId(data.session_id);
      setDiagnosticPlan(data.plan);
      
      // Add AI's initial greeting
      const initialMessage = data.message;
      setMessages([{
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date().toISOString()
      }]);
      
      // Auto-play initial greeting if TTS enabled
      if (ttsEnabled) {
        playTextToSpeech(initialMessage);
      }
      
      if (data.captured_data) {
        setCapturedData(data.captured_data);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      const fallbackMessage = "Hi! I'm having trouble connecting right now. Let me help you with a basic diagnostic approach...";
      setMessages([{
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date().toISOString()
      }]);
      
      // Play fallback message if TTS enabled
      if (ttsEnabled) {
        playTextToSpeech(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && faultCodes && faultCodes.length > 0) {
      startSession();
    }
  }, [projectId]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // TODO: Lovable will implement Supabase diagnostic chat here
      const response = await diagnosticChatAPI.message(sessionId, messageToSend);

      const data = response.data;

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Auto-play TTS if enabled
      if (ttsEnabled) {
        playTextToSpeech(data.message);
      }

      // Update captured data
      if (data.captured_data) {
        setCapturedData(data.captured_data);
        if (onDataCaptured) {
          onDataCaptured(data.captured_data);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = "Sorry, I'm having trouble processing that. Can you try again?";
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      }]);
      
      // Play error message if TTS enabled
      if (ttsEnabled) {
        playTextToSpeech(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Voice to text functionality
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
          setIsLoading(true);
          // TODO: Lovable will implement Supabase voice transcription here
          const response = await voiceAPI.transcribe(audioBlob);
          
          if (response.data?.text) {
            setInputMessage(prev => prev + (prev ? ' ' : '') + response.data.text);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
        } finally {
          setIsLoading(false);
          stream.getTracks().forEach(track => track.stop());
        }
      });

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 10 seconds automatically
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 10000);

      // Store mediaRecorder in a ref so we can stop it manually
      window.currentMediaRecorder = mediaRecorder;

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (window.currentMediaRecorder && window.currentMediaRecorder.state === 'recording') {
      window.currentMediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Text-to-Speech playback
  const playTextToSpeech = async (text) => {
    // TODO: Lovable will implement Supabase TTS here
    // For now, TTS is disabled in frontend-only mode
    try {
      setIsPlayingAudio(true);
      
      // Use mock voice API
      const response = await voiceAPI.speak(text, ttsVoice);
      
      if (response.data) {
        const audioBlob = response.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create and play audio element
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
          console.error('Audio playback error');
        };
        
        await audio.play();
      }
      
    } catch (error) {
      console.error('TTS playback error:', error);
      setIsPlayingAudio(false);
    }
  };

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  // Image upload and analysis
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      analyzeImage(file);
    }
  };

  const analyzeImage = async (imageFile) => {
    setIsAnalyzingImage(true);
    
    // TODO: Lovable will implement Supabase image analysis here
    // For now, return mock analysis
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      const mockAnalysis = `I can see the image you uploaded. Based on the visual inspection:
- Components appear to be in good condition
- No obvious signs of damage or wear
- Connections look secure

Can you provide more details about what specific issue you're experiencing?`;

      // Add the analysis as a message from the AI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `📷 Image Analysis:\n\n${mockAnalysis}`,
        timestamp: new Date().toISOString(),
        imageUrl: URL.createObjectURL(imageFile)
      }]);

    } catch (error) {
      console.error('Error analyzing image:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble analyzing that image. Can you describe what you see?",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsAnalyzingImage(false);
      setSelectedImage(null);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };


  // Feedback handlers
  const handleFeedbackRating = async (messageIndex, rating) => {
    const message = messages[messageIndex];
    
    setMessageFeedback(prev => ({
      ...prev,
      [messageIndex]: { 
        ...prev[messageIndex], 
        rating, 
        showInput: rating === 'down' // Show input only for thumbs down
      }
    }));

    // If thumbs up, submit immediately
    if (rating === 'up') {
      await submitFeedback(messageIndex, rating, '');
    }
  };

  const submitFeedback = async (messageIndex, rating, comment) => {
    const message = messages[messageIndex];
    
    // TODO: Lovable will implement Supabase feedback storage here
    // For now, just store locally
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      
      // Hide input after submission
      setMessageFeedback(prev => ({
        ...prev,
        [messageIndex]: { ...prev[messageIndex], showInput: false, submitted: true }
      }));

      console.log('Feedback submitted:', { messageIndex, rating, comment });

    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleFeedbackComment = (messageIndex, comment) => {
    setMessageFeedback(prev => ({
      ...prev,
      [messageIndex]: { ...prev[messageIndex], comment }
    }));
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chat Area - Takes up 2 columns */}
      <div className="lg:col-span-2">
        <Card className="h-[700px] flex flex-col">
          <CardHeader className="border-b bg-gradient-to-r from-[#124481] to-[#1E7083]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <Bot className="mr-2 h-5 w-5" />
                  AI Diagnostic Assistant
                </CardTitle>
                <p className="text-white text-sm opacity-90">
                  Your expert technician guiding you step-by-step
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* TTS Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isPlayingAudio) {
                      stopAudioPlayback();
                    }
                    setTtsEnabled(!ttsEnabled);
                  }}
                  className="text-white hover:bg-[#1E7083]"
                  title={ttsEnabled ? "Disable voice responses" : "Enable voice responses"}
                >
                  {ttsEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Voice Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className="text-white hover:bg-[#1E7083]"
                  title="Voice settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Voice Settings Panel */}
            {showVoiceSettings && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg">
                <label className="text-white text-sm font-medium mb-2 block">
                  Voice Selection
                </label>
                <select
                  value={ttsVoice}
                  onChange={(e) => setTtsVoice(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#289790]"
                >
                  <option value="alloy">Alloy (Balanced)</option>
                  <option value="echo">Echo (Deep)</option>
                  <option value="fable">Fable (Warm)</option>
                  <option value="onyx">Onyx (Strong)</option>
                  <option value="nova">Nova (Clear)</option>
                  <option value="shimmer">Shimmer (Bright)</option>
                </select>
                <p className="text-white text-xs mt-2 opacity-80">
                  AI responses will be spoken using this voice
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-[#124481]' 
                      : 'bg-gradient-to-br from-[#1E7083] to-[#289790]'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-[#124481] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div className={`flex items-center justify-between mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      <div className="text-xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playTextToSpeech(message.content)}
                            disabled={isPlayingAudio}
                            className="h-6 px-2 text-xs hover:bg-gray-200"
                            title="Listen to this message"
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Listen
                          </Button>
                          
                          {/* Feedback Buttons */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedbackRating(index, 'up')}
                            className={`h-6 px-2 text-xs hover:bg-green-100 ${
                              messageFeedback[index]?.rating === 'up' ? 'bg-green-100 text-green-600' : ''
                            }`}
                            title="Helpful response"
                            disabled={messageFeedback[index]?.submitted}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedbackRating(index, 'down')}
                            className={`h-6 px-2 text-xs hover:bg-red-100 ${
                              messageFeedback[index]?.rating === 'down' ? 'bg-red-100 text-red-600' : ''
                            }`}
                            title="Not helpful"
                            disabled={messageFeedback[index]?.submitted}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Feedback Comment Input */}
                    {message.role === 'assistant' && messageFeedback[index]?.showInput && (
                      <div className="mt-2 space-y-2">
                        <Input
                          placeholder="What could be improved? (optional)"
                          value={messageFeedback[index]?.comment || ''}
                          onChange={(e) => handleFeedbackComment(index, e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => submitFeedback(index, 'down', messageFeedback[index]?.comment || '')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Submit Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1E7083] to-[#289790]">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-lg p-4 bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#289790]" />
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex gap-2">
              <div className="flex flex-col gap-2">
                {/* Voice button */}
                <Button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={isLoading || isAnalyzingImage}
                  variant="outline"
                  className={`${isRecording ? 'bg-red-50 border-red-300' : ''}`}
                  title="Voice to text"
                >
                  <Mic className={`h-4 w-4 ${isRecording ? 'text-red-600 animate-pulse' : ''}`} />
                </Button>
                
                {/* Image upload button */}
                <Button
                  type="button"
                  onClick={triggerImageUpload}
                  disabled={isLoading || isAnalyzingImage}
                  variant="outline"
                  title="Upload image (part numbers, readings, etc.)"
                >
                  {isAnalyzingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response... (e.g., 'I got 12.4 volts' or 'Where is connector C3?')"
                rows={2}
                className="flex-1 resize-none"
                disabled={isLoading || isAnalyzingImage}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || isAnalyzingImage}
                className="bg-[#289790] hover:bg-[#1E7083]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isRecording ? (
                <span className="text-red-600 font-semibold animate-pulse">🔴 Recording... (tap mic to stop)</span>
              ) : (
                <>Press Enter to send, Shift+Enter for new line • Use mic for voice or camera for images</>
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Sidebar - Diagnostic Plan & Progress */}
      <div className="lg:col-span-1 space-y-4">
        {/* Truck Context Panel - AI-Powered Intelligence */}
        {truckInfo?.truck_id && (
          <DiagnosticContextPanel 
            truckId={truckInfo.truck_id}
            currentFaultCodes={faultCodes}
          />
        )}
        
        {/* Diagnostic Plan */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-[#289790] to-[#1E7083]">
            <CardTitle className="text-white text-base">Diagnostic Plan</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {diagnosticPlan ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-700">
                  {diagnosticPlan.title || "Systematic Diagnostic Procedure"}
                </div>
                <div className="space-y-2">
                  {diagnosticPlan.steps && diagnosticPlan.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 text-sm p-2 rounded ${
                        idx < capturedData.stepsCompleted
                          ? 'bg-green-50 border border-green-200'
                          : idx === capturedData.stepsCompleted
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      {idx < capturedData.stepsCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={idx === capturedData.stepsCompleted ? 'font-semibold' : ''}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Plan will appear once diagnostic starts...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Captured Data */}
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-base">Data Captured</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-gray-700 mb-1">Readings:</div>
                {Object.keys(capturedData.readings).length > 0 ? (
                  Object.entries(capturedData.readings).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-mono text-gray-900">{value.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">No readings yet</div>
                )}
              </div>

              <div>
                <div className="font-semibold text-gray-700 mb-1">Parts Identified:</div>
                {capturedData.parts.length > 0 ? (
                  capturedData.parts.map((part, idx) => (
                    <div key={idx} className="py-1 border-b text-gray-900 font-mono text-xs">
                      {part.part_number || part}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">No parts yet</div>
                )}
              </div>

              <div>
                <div className="font-semibold text-gray-700 mb-1">Progress:</div>
                <div className="text-gray-900">
                  {capturedData.stepsCompleted} steps completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Truck Info */}
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-base">Vehicle Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-semibold">{truckInfo?.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Make:</span>
                <span className="font-semibold">{truckInfo?.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-semibold">{truckInfo?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Engine:</span>
                <span className="font-semibold">{truckInfo?.engine_model || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticChatInterface;

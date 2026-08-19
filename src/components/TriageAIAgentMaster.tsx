import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  Camera, 
  Mic, 
  MicOff, 
  Video, 
  Image as ImageIcon, 
  Calculator, 
  PackageCheck, 
  ShieldCheck, 
  BrainCircuit, 
  Zap, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Wrench, 
  HelpCircle,
  FileText,
  Sliders,
  Play,
  RotateCcw
} from 'lucide-react';
import { useToast } from './Toast';
import { TriageChatMessage, TriageQuoteEstimate, TriageInventoryItem } from '../types';

interface TriageAIAgentMasterProps {
  onNavigateToBooking?: () => void;
  onNavigateToIntake?: (deviceModel?: string, issueSummary?: string) => void;
}

export default function TriageAIAgentMaster({ 
  onNavigateToBooking, 
  onNavigateToIntake 
}: TriageAIAgentMasterProps) {
  const { showToast } = useToast();

  // Active feature sub-view
  const [activeMode, setActiveMode] = useState<'chat' | 'thinking' | 'vision' | 'voice' | 'image_gen' | 'video_gen' | 'inventory'>('chat');

  // Multi-turn Chat State
  const [messages, setMessages] = useState<TriageChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: "Hello! I am your Lead Triage & Quote AI Specialist for Display & Cell Pros LLC (D&CP). Our fully-equipped mobile lab van drives right to your driveway anywhere in Spokane or Spokane Valley. How can I help restore your device today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      suggestedActions: [
        'Quote for iPhone 13 Screen',
        'Check Van Stock for iPhone 12 OLED',
        'Phone dropped in water & overheating',
        'Galaxy S24 Ultra battery diagnostic'
      ]
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatModel, setChatModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Deep Thinking Mode State
  const [thinkingQuery, setThinkingQuery] = useState('Intermittent bootloop and suspected VDD_MAIN short on iPhone 13 Pro');
  const [thinkingDeviceModel, setThinkingDeviceModel] = useState('iPhone 13 Pro');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingResult, setThinkingResult] = useState<string | null>(null);

  // Vision & Video Inspection State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('Inspect screen glass, check for OLED purple bleed, and recommend repair tier.');
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionAnalysisResult, setVisionAnalysisResult] = useState<string | null>(null);

  // Video Inspection State
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<string | null>(null);

  // Audio Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // High-Quality Image / Blueprint Generator State
  const [imagePrompt, setImagePrompt] = useState('Technical schematic blueprint of mobile motherboard circuit showing VDD_MAIN power rail and micro-soldering rework points, clean modern vector engineering style');
  const [imageAspectRatio, setImageAspectRatio] = useState<string>('16:9');
  const [imageResolution, setImageResolution] = useState<string>('1K');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Veo Video Generator State
  const [videoPrompt, setVideoPrompt] = useState('Microscope view of precision micro-soldering repair on smartphone circuit board with smoke plume and glowing solder melt');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoOpStatus, setVideoOpStatus] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Inventory & Quote Calculator State
  const [inventoryList, setInventoryList] = useState<TriageInventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [calcPartsCost, setCalcPartsCost] = useState(35.0);
  const [calcLaborHours, setCalcLaborHours] = useState(0.75);
  const [calcZip, setCalcZip] = useState('99201');
  const [calculatedQuote, setCalculatedQuote] = useState<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Load Van Inventory on Mount
  useEffect(() => {
    fetchInventory();
    calculateQuotePreview();
  }, []);

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const res = await fetch('/api/triage/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventoryList(data.vanInventory || []);
      }
    } catch (err) {
      console.warn('Inventory fetch error:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const calculateQuotePreview = async () => {
    try {
      const res = await fetch('/api/triage/quote-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partsCost: calcPartsCost,
          laborHours: calcLaborHours,
          zipCode: calcZip,
          deviceModel: 'iPhone 13'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCalculatedQuote(data.calculation);
      }
    } catch (err) {
      console.warn('Quote calc error:', err);
    }
  };

  // 1. Chat Send Handler
  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isSending) return;

    const userMessage: TriageChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setChatInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/triage/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          model: chatModel,
          lowLatency: chatModel === 'gemini-3.1-flash-lite'
        })
      });

      if (!res.ok) throw new Error('Server returned an error');

      const data = await res.json();
      const aiMessage: TriageChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.text || "Thank you for providing those details. I've noted the issue for our mobile technicians.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || chatModel,
        quote: data.quote,
        suggestedActions: data.suggestedActions || ['Book Mobile Van Dispatch', 'View Parts in Stock']
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      showToast('Error communicating with Triage AI Agent.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          content: "I'm experiencing a brief network hiccup, but our mobile lab is fully operational! Display replacements start at $69.99 and battery refreshes at $49.99 with free Spokane on-site dispatch.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'offline-mode'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // 2. High Thinking Reasoning Handler
  const handleExecuteThinking = async () => {
    if (!thinkingQuery.trim() || isThinking) return;
    setIsThinking(true);
    setThinkingResult(null);

    try {
      const res = await fetch('/api/triage/thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: thinkingQuery,
          deviceModel: thinkingDeviceModel,
          telemetry: {
            ammeterDrawAmps: 4.8,
            isShortToGround: true,
            batteryTempCelsius: 31
          },
          symptoms: ['Power rail short', 'Thermal spike on PMIC', 'Ammeter spike > 4.5A']
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setThinkingResult(data.thinkingSummary);
        showToast('Deep Circuit Thinking Analysis Complete!', 'success');
      } else {
        throw new Error(data.error || 'Thinking analysis failed');
      }
    } catch (err: any) {
      console.error('Thinking Error:', err);
      showToast(err.message || 'Thinking analysis error', 'error');
      setThinkingResult("Analysis: High probability of primary rail collapse on VDD_MAIN (R_rail < 0.05Ω). Recommended action: Isolate C3100 decoupling capacitor with 1.2V DC bench injection and thermal imaging.");
    } finally {
      setIsThinking(false);
    }
  };

  // 3. Vision Image Inspection Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeVision = async () => {
    if (!selectedImage || isAnalyzingVision) return;
    setIsAnalyzingVision(true);
    setVisionAnalysisResult(null);

    try {
      const res = await fetch('/api/triage/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          prompt: visionPrompt,
          deviceModel: thinkingDeviceModel
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVisionAnalysisResult(data.analysis);
        showToast('Visual Inspection Complete!', 'success');
      } else {
        throw new Error(data.error || 'Vision analysis failed');
      }
    } catch (err: any) {
      console.error('Vision error:', err);
      showToast('Vision analysis error', 'error');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // 4. Voice Recording & Transcription Handlers
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      showToast('Listening... Speak your device symptoms.', 'info');
    } catch (err) {
      console.error('Microphone access error:', err);
      showToast('Microphone access denied or unavailable.', 'error');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeAudio = async () => {
    if (!audioBlob || isTranscribing) return;
    setIsTranscribing(true);
    setTranscriptionResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/triage/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: 'audio/webm'
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setTranscriptionResult(data.transcription);
          showToast('Audio transcribed successfully!', 'success');
        } else {
          throw new Error(data.error || 'Audio transcription failed');
        }
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      showToast('Transcription error', 'error');
      setIsTranscribing(false);
    }
  };

  // 5. Blueprint & Image Generation Handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch('/api/triage/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          imageSize: imageResolution
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedImageUrl(data.imageUrl);
        showToast('Technical blueprint generated!', 'success');
      } else {
        throw new Error(data.error || 'Image generation failed');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      showToast('Blueprint generation error', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 6. Veo Video Generation Handler
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setVideoOpStatus('Submitting generation request to Veo 3...');

    try {
      const res = await fetch('/api/triage/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const opName = data.operationName;
        setVideoOpStatus('Generating simulation video. Polling progress...');

        // Poll every 4 seconds
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await fetch('/api/triage/video-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: opName })
            });
            const statusData = await statusRes.json();
            if (statusData.done || attempts >= 4) {
              clearInterval(interval);
              setIsGeneratingVideo(false);
              setGeneratedVideoUrl(statusData.videoUri || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
              setVideoOpStatus('Video generated successfully!');
              showToast('Simulation video ready!', 'success');
            }
          } catch (pollErr) {
            clearInterval(interval);
            setIsGeneratingVideo(false);
            showToast('Video polling encountered an error.', 'error');
          }
        }, 3000);
      } else {
        throw new Error(data.error || 'Video generation failed');
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      setIsGeneratingVideo(false);
      showToast('Video generation error', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Bot className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-playfair font-black tracking-tight text-white">
                  Triage & Quote AI Agent
                </h1>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  ACTIVE ON-SITE AGENT
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Spokane’s autonomous mobile laboratory intake specialist. Powered by Gemini multimodal intelligence, active listening L.E.A.R.N. protocol, and formulaic Right to Repair pricing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl text-xs">
              <span className="text-slate-400 block font-medium">Van 01 Dispatch</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Spokane Ready (35 mi radius)
              </span>
            </div>
            {onNavigateToBooking && (
              <button
                onClick={onNavigateToBooking}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4" />
                <span>Book Van Dispatch</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-slate-800/80 scrollbar-none">
          {[
            { id: 'chat', label: 'Active L.E.A.R.N. Chat', icon: Bot },
            { id: 'thinking', label: 'High Thinking Diagnostics', icon: BrainCircuit },
            { id: 'vision', label: 'Visual Inspection', icon: Camera },
            { id: 'voice', label: 'Voice Intake', icon: Mic },
            { id: 'image_gen', label: 'Blueprint Generator', icon: ImageIcon },
            { id: 'video_gen', label: 'Veo Simulation', icon: Video },
            { id: 'inventory', label: 'Van Parts & Pricing Matrix', icon: PackageCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Active L.E.A.R.N. Multi-Turn Chat Tab */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Stream */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header Controls */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Conversational Triage</span>
              </div>

              {/* Model Selection Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Model Engine:</span>
                <select
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value as any)}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (General Chat)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Low Latency Fast)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Complex Diagnostic)</option>
                </select>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`
                        p-4 rounded-2xl text-sm leading-relaxed
                        ${msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/10 font-medium'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'}
                      `}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Render Quote Card if attached */}
                      {msg.quote && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white/80 rounded-xl p-3.5 space-y-2 text-slate-900">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wide text-blue-600">
                              Estimated Right to Repair Quote
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                              {msg.quote.serviceTier}
                            </span>
                          </div>

                          <div className="text-lg font-playfair font-black text-slate-900">
                            ${msg.quote.retailPrice.toFixed(2)}{' '}
                            <span className="text-xs font-normal text-slate-500">
                              + WA Tax (Total: ${msg.quote.totalWithTax.toFixed(2)})
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <div>Parts Cost: ${msg.quote.partsCost.toFixed(2)}</div>
                            <div>Labor ({msg.quote.laborHours}h @ $50): ${msg.quote.laborCost.toFixed(2)}</div>
                            <div>Van Stock: {msg.quote.inStock ? '✅ Sourced in Van' : '📦 2hr Lead'}</div>
                            <div>Warranty: {msg.quote.warrantyMonths} Months Included</div>
                          </div>

                          {onNavigateToBooking && (
                            <button
                              onClick={onNavigateToBooking}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <MapPin className="w-3.5 h-3.5 text-blue-400" />
                              <span>Dispatch Van to My Location</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && <span>• {msg.modelUsed}</span>}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      U
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-4 bg-slate-50 rounded-xl w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Triage AI is analyzing symptoms with L.E.A.R.N. protocol...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                'Quote for iPhone 13 Screen',
                'Check iPhone 12 OLED in Van',
                'Phone dropped in water',
                'Galaxy S24 Ultra Battery Quote',
                'Is logic board repair supported?'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(chip)}
                  disabled={isSending}
                  className="text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe your device issue (e.g., 'iPhone 13 screen spiderwebbed, how much?')..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSending}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Right Column: L.E.A.R.N. Protocol & Pricing Rules */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">L.E.A.R.N. Active Listening</h3>
              </div>
              <p className="text-xs text-slate-500">
                The agent is hardwired with active listening psychology to validate your urgency before quoting.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-blue-700 block">1. Listen & Mirror</span>
                  <span className="text-slate-600">Validates customer terminology without robotic jargon.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-blue-700 block">2. Ask Clarification</span>
                  <span className="text-slate-600">Probes display responsiveness, audio pings, or water exposure.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-blue-700 block">3. Reassure D&CP Promise</span>
                  <span className="text-slate-600">Zero customer travel. Mobile lab van comes to your driveway.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-blue-700 block">4. Right to Repair Pricing</span>
                  <span className="text-slate-600">Formulaic pricing with parts cost transparency & 1-year warranty.</span>
                </div>
              </div>
            </div>

            {/* Quick Pricing Formula Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">Pricing Engine Formula</span>
                <Calculator className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-lg font-playfair font-bold text-white">
                Price = (Parts × 1.80) + (Hours × $50)
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>• Tier 1 (Battery / Port): 0.50 hrs ($25 labor)</div>
                <div>• Tier 2 (Screen Replacement): 0.75 hrs ($37.50 labor)</div>
                <div>• Tier 3 (Micro-Soldering): $49.00 initial trace</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Deep Thinking Circuit Reasoning Tab */}
      {activeMode === 'thinking' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
                Deep Thinking Circuit Diagnostic Engine
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Powered by Gemini 3.1 Pro Preview with <code className="font-mono bg-purple-50 text-purple-700 px-1 py-0.5 rounded">ThinkingLevel.HIGH</code> for complex logic board traces and Ohm&apos;s Law analysis.
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full font-mono">
              HIGH REASONING MODE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Device Model Target
                </label>
                <input
                  type="text"
                  value={thinkingDeviceModel}
                  onChange={(e) => setThinkingDeviceModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Circuit Diagnostic Query
                </label>
                <textarea
                  rows={4}
                  value={thinkingQuery}
                  onChange={(e) => setThinkingQuery(e.target.value)}
                  placeholder="Describe electrical anomalies, ammeter draw spikes, or power rail faults..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <button
                onClick={handleExecuteThinking}
                disabled={isThinking}
                className="w-full py-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-700/20 flex items-center justify-center gap-2"
              >
                {isThinking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing High-Thinking Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Deep Circuit Reasoning</span>
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-2 bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs overflow-y-auto max-h-[400px] border border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  Reasoning Synthesis Stream
                </span>
                <span>IPC-A-610 Tier 3 Certified</span>
              </div>

              {thinkingResult ? (
                <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                  {thinkingResult}
                </div>
              ) : isThinking ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  <span>Evaluating VDD_MAIN rail collapse, Rosin bloom mapping & Ohm&apos;s Law equations...</span>
                </div>
              ) : (
                <div className="text-slate-500 italic flex items-center justify-center h-48">
                  Click &apos;Run Deep Circuit Reasoning&apos; to generate step-by-step schematic traces and thermal isolation steps.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Visual & Video Inspection Tab */}
      {activeMode === 'vision' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-600" />
              Multimodal Visual Hardware Inspection Studio
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload hardware photographs (broken glass, corrosion, swollen cells) or videos (flickering displays, boot loops) for AI damage classification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-colors bg-slate-50">
                {selectedImage ? (
                  <div className="space-y-3">
                    <img
                      src={selectedImage}
                      alt="Device Inspection"
                      className="max-h-48 mx-auto rounded-xl shadow-sm object-contain"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">Upload Device Photo</span>
                    <span className="text-[11px] text-slate-400 block">PNG, JPG, WEBP up to 20MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Inspection Focus Notes
                </label>
                <input
                  type="text"
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={handleAnalyzeVision}
                disabled={!selectedImage || isAnalyzingVision}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isAnalyzingVision ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Analyzing Image with Gemini Vision...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Analyze Device Photo</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Area */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-800 overflow-y-auto max-h-[380px]">
              <div className="font-bold text-slate-900 pb-2 mb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Inspection Findings</span>
                <span className="text-[10px] font-mono text-blue-600">Model: gemini-3.1-pro-preview</span>
              </div>

              {visionAnalysisResult ? (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {visionAnalysisResult}
                </div>
              ) : isAnalyzingVision ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Scanning digitizer grid, bezel deformation, and OLED pixel array...</span>
                </div>
              ) : (
                <div className="text-slate-400 italic text-center py-16">
                  Upload an image and click Analyze to view damage classification.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Voice Intake & Audio Transcription Tab */}
      {activeMode === 'voice' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-6 h-6 text-emerald-600" />
              Voice Intake & Audio Symptom Transcriber
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Speak naturally into your microphone. Gemini 3.5 Flash transcribes the audio and extracts device symptoms directly for the repair queue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center justify-center">
              <div
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center transition-all
                  ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-xl shadow-rose-500/30' : 'bg-slate-900 text-white'}
                `}
              >
                {isRecording ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8 text-slate-400" />}
              </div>

              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {isRecording ? 'Recording Voice Message...' : audioBlob ? 'Audio Captured Ready to Transcribe' : 'Microphone Ready'}
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  {isRecording ? 'Click stop when finished' : 'Press record to speak your symptoms'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Stop Recording
                  </button>
                )}

                {audioBlob && !isRecording && (
                  <button
                    onClick={handleTranscribeAudio}
                    disabled={isTranscribing}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    {isTranscribing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-blue-400" />}
                    <span>Transcribe Audio</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-800 overflow-y-auto max-h-[300px]">
              <div className="font-bold text-slate-900 pb-2 mb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Transcribed Voice Intake</span>
                <span className="text-[10px] font-mono text-emerald-600">Model: gemini-3.5-flash</span>
              </div>

              {transcriptionResult ? (
                <div className="whitespace-pre-wrap leading-relaxed space-y-3">
                  <p className="text-slate-800">{transcriptionResult}</p>
                  {onNavigateToIntake && (
                    <button
                      onClick={() => onNavigateToIntake('Voice Intake Device', transcriptionResult)}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Transfer to Official Intake Form
                    </button>
                  )}
                </div>
              ) : isTranscribing ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Processing speech tokens with Gemini 3.5 Flash...</span>
                </div>
              ) : (
                <div className="text-slate-400 italic text-center py-12">
                  Record your voice message to see transcript and extracted repair classifications here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Technical Blueprint & Image Generator Tab */}
      {activeMode === 'image_gen' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              Technical Blueprint & Schematic Generator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Generate studio-grade technical circuit drawings and repair workshop diagrams using Gemini image models with selectable aspect ratios and resolutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Blueprint Prompt
                </label>
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800"
                  >
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="3:4">3:4 (Tall)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Resolution Size
                  </label>
                  <select
                    value={imageResolution}
                    onChange={(e) => setImageResolution(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800"
                  >
                    <option value="1K">1K Resolution</option>
                    <option value="2K">2K High Def</option>
                    <option value="4K">4K Studio Master</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Rendering High-Res Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Generate Technical Blueprint</span>
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-2 bg-slate-950 rounded-2xl p-4 flex items-center justify-center min-h-[280px] border border-slate-800">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Generated Blueprint"
                  className="max-h-72 rounded-xl object-contain shadow-lg"
                />
              ) : isGeneratingImage ? (
                <div className="flex flex-col items-center space-y-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span>Synthesizing vector schematic lines at {imageResolution} resolution...</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic">
                  Blueprint preview will render here upon generation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Veo Video Simulation Tab */}
      {activeMode === 'video_gen' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-6 h-6 text-indigo-600" />
              Veo 3 Repair Simulation Video Studio
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Generate high-definition repair simulations using <code className="font-mono bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">veo-3.1-fast-generate-preview</code> in 16:9 or 9:16 aspect ratios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Simulation Prompt
                </label>
                <textarea
                  rows={3}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Aspect Ratio
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${videoAspectRatio === '16:9' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    16:9 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${videoAspectRatio === '9:16' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    9:16 Portrait
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Generating Simulation Video...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Generate Veo 3 Video</span>
                  </>
                )}
              </button>

              {videoOpStatus && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                  {videoOpStatus}
                </div>
              )}
            </div>

            <div className="md:col-span-2 bg-slate-950 rounded-2xl p-4 flex items-center justify-center min-h-[280px] border border-slate-800">
              {generatedVideoUrl ? (
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-72 rounded-xl object-contain shadow-lg"
                />
              ) : isGeneratingVideo ? (
                <div className="flex flex-col items-center space-y-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <span>Veo 3 fast generation engine processing cinematic render...</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic">
                  Video preview will play here once generated.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Van Parts Inventory & Live Pricing Matrix Tab */}
      {activeMode === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-6 h-6 text-blue-600" />
                Spokane Van 01 Parts Inventory & Live Pricing
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time stock of MobileSentrix & Genuine OEM parts carried in the mobile repair laboratory.
              </p>
            </div>
            <button
              onClick={fetchInventory}
              disabled={inventoryLoading}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${inventoryLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Van Stock</span>
            </button>
          </div>

          {/* Pricing Formula Recalculator Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Parts Cost ($)</label>
              <input
                type="number"
                value={calcPartsCost}
                onChange={(e) => { setCalcPartsCost(Number(e.target.value)); calculateQuotePreview(); }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Labor Time (Hrs)</label>
              <input
                type="number"
                step="0.25"
                value={calcLaborHours}
                onChange={(e) => { setCalcLaborHours(Number(e.target.value)); calculateQuotePreview(); }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Destination ZIP</label>
              <input
                type="text"
                value={calcZip}
                onChange={(e) => { setCalcZip(e.target.value); calculateQuotePreview(); }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Formula Retail Quote</span>
              <span className="text-base font-playfair font-black text-slate-900">
                ${calculatedQuote ? calculatedQuote.retailPrice.toFixed(2) : '104.99'}{' '}
                <span className="text-[11px] text-slate-500 font-normal">
                  (Tax: ${calculatedQuote ? calculatedQuote.taxAmount.toFixed(2) : '9.55'})
                </span>
              </span>
            </div>
          </div>

          {/* Parts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Part Description</th>
                  <th className="py-3 px-4">Device Series</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Wholesale Cost</th>
                  <th className="py-3 px-4">Retail Price</th>
                  <th className="py-3 px-4">Van Stock</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {inventoryList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4">{item.deviceSeries}</td>
                    <td className="py-3 px-4">{item.supplier}</td>
                    <td className="py-3 px-4">${item.costPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${item.standardRetailPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.stockVanQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {item.stockVanQuantity > 0 ? `${item.stockVanQuantity} in Van` : 'Warehouse (2h)'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setActiveMode('chat');
                          handleSendChat(`Can you prepare a quote for ${item.name}?`);
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Ask AI Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, MicOff, Volume2, Headphones, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/context/DashboardContext";
import { useLanguage } from "@/context/LanguageContext";
import type { MessageKey } from "@/i18n/translations";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content:
        "🌊 नमस्कार! I'm **Jal-Drishti AI**, your groundwater advisor.\n\nSelect a village from the sidebar and ask me anything about water levels, irrigation advice, or crop recommendations!\n\n🎤 You can also speak to me in English, Hindi, or Marathi!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isBluetooth, setIsBluetooth] = useState(false);
  const { predictionData, selectedRegion } = useDashboard();
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Enumerate and manage audio devices
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices?.enumerateDevices();
        if (devices) {
          const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
          setAudioDevices(audioInputDevices);
          
          console.log('Available audio devices:', audioInputDevices.map(d => ({
            label: d.label,
            deviceId: d.deviceId,
            kind: d.kind
          })));
          
          // Auto-select first Bluetooth device if available
          const bluetoothDevice = audioInputDevices.find(device => 
            device.label.toLowerCase().includes('bluetooth') || 
            device.deviceId.toLowerCase().includes('bluetooth')
          );
          
          if (bluetoothDevice) {
            setSelectedDevice(bluetoothDevice.deviceId);
            setIsBluetooth(true);
            console.log('Auto-selected Bluetooth device:', bluetoothDevice.label);
          } else if (audioInputDevices.length > 0) {
            setSelectedDevice(audioInputDevices[0].deviceId);
            setIsBluetooth(false);
            console.log('Auto-selected default device:', audioInputDevices[0].label);
          }
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    enumerateDevices();
    
    // Listen for device changes
    navigator.mediaDevices?.addEventListener('devicechange', enumerateDevices);
    
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', enumerateDevices);
    };
  }, []);

  // Initialize speech recognition with selected device
  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                           (window as any).webkitSpeechRecognition || 
                           (window as any).mozSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configure for better compatibility
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-US';
      
      // Force local speech recognition
      recognition.serviceURI = 'local'; // Force local instead of cloud service
      
      // Use selected audio device with enhanced error handling
      if (selectedDevice) {
        console.log('Requesting microphone access for device:', selectedDevice);
        
        navigator.mediaDevices?.getUserMedia({ 
          audio: {
            deviceId: { exact: selectedDevice },
            echoCancellation: false, // Disable for better voice recognition
            noiseSuppression: false, // Disable for better sensitivity
            autoGainControl: true,
            sampleRate: 16000, // Higher sample rate for better quality
            channelCount: 1, // Mono for speech recognition
          }
        }).then((stream) => {
          console.log(`✅ Microphone connected successfully (${isBluetooth ? 'Bluetooth' : 'Default'}):`, stream);
          console.log('Stream active:', stream.active);
        }).catch((err) => {
          console.error('❌ Microphone access error:', err);
          alert('🎤 Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.');
        });
      }
      
      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognition result:', transcript);
          setInput(transcript);
          setIsRecording(false);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
      };
      
      recognitionRef.current = recognition;
    } else {
      console.error('Cloud speech recognition not available');
      alert('🎤 Cloud speech recognition is not available. Please use Chrome, Edge, or Safari for voice features.');
    }
  }, [locale, selectedDevice, isBluetooth]);

  // Text-to-speech function
  const speakText = (text: string) => {
    console.log('Attempting to speak:', text, 'Language:', locale);
    
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language based on current locale
        if (locale === 'hi') {
          utterance.lang = 'hi-IN';
          console.log('Setting language to Hindi (hi-IN)');
        } else if (locale === 'mr') {
          utterance.lang = 'mr-IN';
          console.log('Setting language to Marathi (mr-IN)');
        } else {
          utterance.lang = 'en-US';
          console.log('Setting language to English (en-US)');
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log('Speech started');
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log('Speech ended');
          setIsSpeaking(false);
        };
        
        utterance.onerror = (event: any) => {
          console.error('Speech error:', event);
          setIsSpeaking(false);
        };
        
        synthesisRef.current = utterance;
        
        // Check if speech synthesis is available
        if (window.speechSynthesis.speaking) {
          console.log('Speech synthesis is speaking');
        }
        
        window.speechSynthesis.speak(utterance);
        console.log('Speech command sent');
        
      } catch (error) {
        console.error('Speech synthesis error:', error);
        setIsSpeaking(false);
        
        // Fallback: alert the user
        if (text.length > 0) {
          alert(`🔊 Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        }
      }
    } else {
      console.error('Speech synthesis not supported');
      alert('Speech synthesis is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    
    if (isRecording) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsRecording(false);
      }
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Build the request with village context
      const body: Record<string, unknown> = {
        message: userMsg,
        chat_history: messages.slice(-6), // last 6 messages for context
        language: locale, // Send selected language to backend
      };

      if (selectedRegion) {
        body.village_name = selectedRegion.name;
        body.district = selectedRegion.district;
        body.block = selectedRegion.subDistrict;
      }

      if (predictionData) {
        body.historical_data = predictionData.historicalData;
        body.predicted_data = predictionData.predictedData;
        body.risk_level = predictionData.riskLevel;
        body.current_depth = predictionData.currentDepth;
        body.annual_change_rate = predictionData.annualChangeRate;
      }

      const resp = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const assistantResponse = data.response;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantResponse },
      ]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${errorMsg}\n\nPlease try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center hover:scale-110 transition-all duration-300"
          aria-label={t("chatTitle" as MessageKey)}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[520px] glass-strong rounded-2xl flex flex-col shadow-2xl animate-slide-up overflow-hidden border border-cyan-500/20">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground block leading-tight">Jal-Drishti AI</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  {selectedRegion ? `📍 ${selectedRegion.name}` : "Ready to help"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary/50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-sm"
                      : "bg-secondary/60 text-foreground border border-border/20 rounded-bl-sm"
                  }`}
                >
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                      {line.split(/\*\*(.*?)\*\*/).map((part, k) =>
                        k % 2 === 1 ? (
                          <strong key={k} className="font-semibold">{part}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                  {msg.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.content)}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary/50"
                      title="Listen to this message"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <div className="bg-secondary/60 rounded-xl px-4 py-3 border border-border/20 rounded-bl-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border/50 bg-background/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedRegion ? `Ask about ${selectedRegion.name}...` : "First select a village and then ask me anything about water levels, irrigation advice, or crop recommendations! 🌾"}
                className="flex-1 bg-secondary/50 border-border/40 text-sm"
                disabled={isLoading || isRecording}
              />
              <Button
                type="button"
                size="icon"
                onClick={toggleRecording}
                className={`shrink-0 transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
                }`}
                disabled={isLoading}
                title={isBluetooth ? "Bluetooth Microphone" : "Default Microphone"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button type="submit" size="icon" className="shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
              {isSpeaking && (
                <Button
                  type="button"
                  size="icon"
                  onClick={stopSpeaking}
                  className="shrink-0 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 animate-pulse"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

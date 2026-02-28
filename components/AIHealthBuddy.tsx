
import React, { useState, useRef, useEffect } from 'react';
import { User, AppView } from '../types';
import { healthAssistantChat, generateSpeechResponse, checkSymptomsAI } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
  isAudio?: boolean;
}

interface AIHealthBuddyProps {
  user: User | null;
  notify: (msg: string, type?: any) => void;
  onNavigate: (view: AppView, data?: any) => void;
}

const AIHealthBuddy: React.FC<AIHealthBuddyProps> = ({ user, notify, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "English: Hello! I am your Salone Health Buddy. How can I help you today?\n\nKrio: Kusheh! Na me na yu Salone Health Buddy. Wetin de poynt yu tide?",
      sender: 'buddy',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isSymptomMode, setIsSymptomMode] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string, audioData?: { data: string, mimeType: string }) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() && !audioData) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend || 'Voice Message',
      sender: 'user',
      timestamp: new Date(),
      isAudio: !!audioData
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (isSymptomMode && textToSend) {
        const result = await checkSymptomsAI(textToSend);
        const formattedResponse = `English: ${result.assessment}\nUrgency: ${result.urgency}\nAdvice: ${result.advice}\n\nKrio: ${result.krioAdvice}\n\nDisclaimer: ${result.disclaimer}`;
        
        const buddyMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: formattedResponse,
          sender: 'buddy',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, buddyMsg]);
        setIsSymptomMode(false);
      } else {
        const context = `User District: ${user?.district}, Name: ${user?.name}`;
        const response = await healthAssistantChat(audioData || textToSend, context);
        
        const buddyMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: response || 'Sorry, I missed that.',
          sender: 'buddy',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, buddyMsg]);
      }
    } catch (err) {
      notify("Buddy is a bit sleepy right now. Try again?", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          handleSend('', { data: base64Data, mimeType: 'audio/webm' });
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      notify("Need microphone access to hear you.", "warning");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const startSymptomCheck = () => {
    setIsSymptomMode(true);
    const msg: Message = {
      id: Date.now().toString(),
      text: "English: I've started the AI Symptom Checker. Please describe what you are feeling in detail.\n\nKrio: A don start di AI Symptom Checker. Tel me wetin de poynt yu fine fine.",
      sender: 'buddy',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, msg]);
  };

  const playResponse = async (msgId: string, text: string) => {
    if (isPlaying) return;
    setIsPlaying(msgId);
    try {
      const base64 = await generateSpeechResponse(text);
      if (!base64) throw new Error();
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsPlaying(null);
      source.start();
    } catch (err) {
      notify("Voice engine failed.", "warning");
      setIsPlaying(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white p-6 rounded-t-[3rem] border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
           <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-face-smile-beam"></i>
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Health Buddy</h2>
              <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mt-1">
                 <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                 Online & Listening
              </p>
           </div>
        </div>
        <button onClick={() => onNavigate(AppView.DASHBOARD)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
           <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-white border-x border-slate-100 overflow-y-auto p-8 space-y-6 no-scrollbar"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
             <div className={`max-w-[80%] rounded-[2rem] p-6 relative group ${
               msg.sender === 'user' 
               ? 'bg-indigo-600 text-white rounded-tr-none' 
               : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
             }`}>
                <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <div className={`text-[8px] font-bold mt-2 opacity-40 ${msg.sender === 'user' ? 'text-white' : 'text-slate-500'}`}>
                   {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {msg.sender === 'buddy' && (
                  <button 
                    onClick={() => playResponse(msg.id, msg.text)}
                    className={`absolute -right-12 top-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isPlaying === msg.id ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                     <i className={`fa-solid ${isPlaying === msg.id ? 'fa-waveform-lines' : 'fa-volume-high'}`}></i>
                  </button>
                )}
             </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-slate-50 rounded-[2rem] rounded-tl-none p-6 border border-slate-100">
                <div className="flex space-x-2">
                   <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Quick Actions & Input */}
      <div className="bg-white p-8 rounded-b-[3rem] border border-slate-100 shadow-2xl space-y-6">
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={startSymptomCheck}
             className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 border ${
               isSymptomMode 
               ? 'bg-rose-600 text-white border-rose-700 shadow-lg' 
               : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'
             }`}
           >
             <i className="fa-solid fa-stethoscope mr-2"></i>
             {isSymptomMode ? "Symptom Checker Active" : "Check My Symptoms"}
           </button>
           {["Protect from Korera?", "Lassa signs?", "Pikin fever?", "117 Help"].map(q => (
             <button 
               key={q} 
               onClick={() => handleSend(q)}
               className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-tight hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
             >
               {q}
             </button>
           ))}
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex-1 relative group">
              <input 
                type="text" 
                placeholder="Talk to your Health Buddy..." 
                className="w-full pl-6 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-slate-300 hover:text-indigo-600 shadow-sm border border-slate-100'
                }`}
              >
                 <i className={`fa-solid ${isRecording ? 'fa-microphone' : 'fa-microphone-lines'}`}></i>
              </button>
           </div>
           <button 
             onClick={() => handleSend()}
             disabled={isLoading || (!input.trim() && !isRecording)}
             className="w-16 h-16 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-xl shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
           >
              <i className="fa-solid fa-paper-plane"></i>
           </button>
        </div>
      </div>
    </div>
  );
};

export default AIHealthBuddy;

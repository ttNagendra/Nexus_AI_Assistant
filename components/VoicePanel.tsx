
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { audioUtils } from '../services/gemini';
import { Mic, MicOff, Volume2, Loader2, Waves } from 'lucide-react';

const VoicePanel: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [transcription, setTranscription] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setStatus('Initializing...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus('Nexus is listening...');
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Simple PCM conversion
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: audioUtils.encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const buffer = await audioUtils.decodeAudioData(
                audioUtils.decode(audioData),
                outCtx,
                24000,
                1
              );
              
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Session error', e);
            setStatus('Error occurred');
          },
          onclose: () => {
            setIsActive(false);
            setStatus('Standby');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are Nexus, a calm and helpful voice assistant. Keep responses concise and human-like.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      setStatus('Access Denied');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsActive(false);
    setStatus('Standby');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-zinc-950 text-white p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="z-10 text-center space-y-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <div className={`text-sm font-semibold tracking-widest uppercase transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-600'}`}>
            {status}
          </div>
          
          <div className="relative">
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-indigo-500/30 animate-ping" />
                <div className="w-48 h-48 rounded-full border border-indigo-500/10 animate-ping" style={{ animationDelay: '500ms' }} />
              </div>
            )}
            
            <button
              onClick={isActive ? stopSession : startSession}
              disabled={isConnecting}
              className={`relative z-20 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 scale-110' 
                  : 'bg-zinc-800 hover:bg-indigo-600 shadow-indigo-500/10'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : isActive ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>
        </div>

        <div className="h-24 flex items-center justify-center gap-1">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full bg-indigo-500 transition-all duration-150 ${
                isActive ? 'opacity-100' : 'opacity-20 h-2'
              }`}
              style={{
                height: isActive ? `${Math.random() * 60 + 10}px` : '8px',
                transitionDelay: `${i * 30}ms`
              }}
            />
          ))}
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 text-zinc-400 mb-2">
            <Volume2 size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">Audio Monitor</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {isActive 
              ? "Listening for your voice. Speak naturally to converse with Nexus." 
              : "Tap the microphone to begin a real-time conversation."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoicePanel;

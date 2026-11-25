import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Loader2, AlertCircle, MessageSquare } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  speaker: 'vous' | 'era';
  text: string;
}

function floatTo16BitPcmBase64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function decodePcm24kToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const float32 = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

export const LiveVoiceAssistant: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isLiveRef = useRef(false);

  const clearScheduledOutput = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Ignore already stopped source
      }
    });
    activeSourcesRef.current.clear();
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
    setIsModelSpeaking(false);
  }, []);

  const stopSession = useCallback(() => {
    isLiveRef.current = false;
    clearScheduledOutput();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (inputCtxRef.current) {
      void inputCtxRef.current.close();
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      void outputCtxRef.current.close();
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('idle');
  }, [clearScheduledOutput]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  const schedulePcm24kChunk = useCallback((base64Audio: string) => {
    const outCtx = outputCtxRef.current;
    if (!outCtx) return;

    const samples = decodePcm24kToFloat32(base64Audio);
    if (samples.length === 0) return;

    const audioBuffer = outCtx.createBuffer(1, samples.length, 24000);
    audioBuffer.copyToChannel(new Float32Array(samples), 0);

    const source = outCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outCtx.destination);

    const startTime = Math.max(outCtx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;

    activeSourcesRef.current.add(source);
    setIsModelSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0) {
        setIsModelSpeaking(false);
      }
    };
  }, []);

  const appendTranscript = useCallback((speaker: 'vous' | 'era', chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text} ${trimmed}`.trim() },
        ];
      }
      return [...prev.slice(-11), { id: `${Date.now()}-${Math.random()}`, speaker, text: trimmed }];
    });
  }, []);

  const startSession = async () => {
    if (status === 'connecting' || status === 'live') return;
    setErrorMsg(null);
    setStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${wsProtocol}//${location.host}/live`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            ready?: boolean;
            audio?: string;
            interrupted?: boolean;
            inputTranscript?: string;
            outputTranscript?: string;
            error?: string;
          };

          if (msg.error) {
            setErrorMsg(msg.error);
            stopSession();
            setStatus('error');
            return;
          }

          if (msg.ready) {
            setStatus('live');
            isLiveRef.current = true;
          }

          if (msg.interrupted) {
            clearScheduledOutput();
          }

          if (msg.audio) {
            schedulePcm24kChunk(msg.audio);
          }

          if (msg.inputTranscript) {
            appendTranscript('vous', msg.inputTranscript);
          }

          if (msg.outputTranscript) {
            appendTranscript('era', msg.outputTranscript);
          }
        } catch {
          // Ignore malformed ws messages
        }
      };

      ws.onerror = () => {
        setErrorMsg('Connexion vocale en direct interrompue.');
        stopSession();
        setStatus('error');
      };

      ws.onclose = () => {
        if (isLiveRef.current) {
          stopSession();
        }
      };

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isLiveRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }
        const pcmBase64 = floatTo16BitPcmBase64(e.inputBuffer.getChannelData(0));
        wsRef.current.send(JSON.stringify({ audio: pcmBase64 }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err) {
      stopSession();
      setStatus('error');
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Impossible d'accéder au microphone pour la conversation vocale."
      );
    }
  };

  return (
    <section
      id="conseiller-vocal"
      className="py-12 sm:py-16 px-4 sm:px-8 border-t border-[#1A2D59] bg-[#060D1E]"
    >
      <div className="max-w-6xl mx-auto rounded-2xl bg-[#0C1732] border border-[#1E3363] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-wider text-[#E5A93B]">
              CONVERSATION VOCALE EN DIRECT · TEMPS RÉEL
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Posez vos questions de vive voix à ERA NETWORK PARTNERS
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Échangez en direct avec notre conseiller vocal francophone sur la Formation PCEICN,
              le E-Commerce communautaire, la sécurisation par séquestre ou votre adhésion depuis
              l&apos;Afrique et la Diaspora.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {status === 'live' || status === 'connecting' ? (
              <button
                type="button"
                onClick={stopSession}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                {status === 'connecting' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PhoneOff className="w-4 h-4" />
                )}
                <span>
                  {status === 'connecting' ? 'Connexion au micro…' : 'Terminer la conversation'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void startSession()}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mic className="w-4 h-4" />
                <span>Démarrer la conversation vocale</span>
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2.5 p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-xs sm:text-sm text-red-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {(status === 'live' || transcripts.length > 0) && (
          <div className="mt-6 pt-6 border-t border-[#1E3363] space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                {status === 'live' ? (
                  <Mic className="w-4 h-4 text-[#E5A93B]" />
                ) : (
                  <MicOff className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {status === 'live'
                    ? isModelSpeaking
                      ? 'ERA est en train de vous répondre…'
                      : 'Microphone actif — parlez naturellement en français'
                    : 'Session vocale terminée'}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Transcription en direct</span>
              </span>
            </div>

            {transcripts.length > 0 && (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {transcripts.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg text-sm ${
                      entry.speaker === 'era'
                        ? 'bg-[#122552] border border-[#E5A93B]/35 text-white'
                        : 'bg-[#060D1E] border border-white/10 text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold tracking-wider text-[#E5A93B] mr-2">
                      {entry.speaker === 'era' ? 'ERA' : 'VOUS'} ·
                    </span>
                    <span>{entry.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

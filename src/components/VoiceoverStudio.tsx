import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Download,
  Mic,
  Volume2,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SCENES, TOTAL_DURATION_SEC, type SceneDefinition } from '../data/presentationScript';

interface VoiceoverStudioProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  onJumpToVideoScene?: (startSec: number) => void;
}

const VOICE_OPTIONS = [
  {
    id: 'Charon',
    label: 'Voix Masculine Posée (Charon)',
    note: 'Chaleureuse, claire, rythme solennel · Recommandée',
  },
  {
    id: 'Fenrir',
    label: 'Voix Masculine Dynamique (Fenrir)',
    note: 'Affirmée, énergique, ton institutionnel',
  },
  {
    id: 'Orus',
    label: 'Voix Masculine Grave (Orus)',
    note: 'Profonde, rassurante, leadership communautaire',
  },
];

export const VoiceoverStudio: React.FC<VoiceoverStudioProps> = ({
  selectedVoice,
  onVoiceChange,
  onJumpToVideoScene,
}) => {
  const [playingSceneId, setPlayingSceneId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [loadingSceneId, setLoadingSceneId] = useState<string | null>(null);
  const [generatedScenes, setGeneratedScenes] = useState<Record<string, string>>({});
  const [clipProgress, setClipProgress] = useState(0);
  const [exportingFull, setExportingFull] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlCacheRef = useRef<Record<string, string>>({});
  const isPlayingAllRef = useRef(false);

  useEffect(() => {
    isPlayingAllRef.current = isPlayingAll;
  }, [isPlayingAll]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      Object.values(urlCacheRef.current).forEach((url) => URL.revokeObjectURL(url));
      urlCacheRef.current = {};
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current = null;
    }
    setPlayingSceneId(null);
    setLoadingSceneId(null);
    setIsPlayingAll(false);
    isPlayingAllRef.current = false;
    setClipProgress(0);
  }, []);

  // Reset local preview cache when voice changes
  const handleSelectVoice = (voice: string) => {
    stopAudio();
    Object.values(urlCacheRef.current).forEach((url) => URL.revokeObjectURL(url));
    urlCacheRef.current = {};
    setGeneratedScenes({});
    onVoiceChange(voice);
  };

  const getOrGenerateSceneUrl = useCallback(
    async (scene: SceneDefinition): Promise<string> => {
      const existing = urlCacheRef.current[scene.id];
      if (existing) return existing;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scene.id,
          text: scene.voiceText,
          voiceName: selectedVoice,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          `Le serveur API n'a pas renvoyé de JSON (HTTP ${res.status}).`
        );
      }
      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'Échec de génération de la voix off.');
      }

      const byteChars = atob(data.audioBase64);
      const byteNumbers = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteNumbers], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      urlCacheRef.current[scene.id] = url;
      setGeneratedScenes((prev) => ({ ...prev, [scene.id]: url }));
      return url;
    },
    [selectedVoice]
  );

  const playSceneAtIndex = useCallback(
    async (index: number, continueSequence: boolean) => {
      if (index < 0 || index >= SCENES.length) {
        stopAudio();
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current = null;
      }

      const scene = SCENES[index];
      setErrorMsg(null);
      setIsPlayingAll(continueSequence);
      isPlayingAllRef.current = continueSequence;
      setLoadingSceneId(scene.id);
      setPlayingSceneId(scene.id);
      setClipProgress(0);

      try {
        const url = await getOrGenerateSceneUrl(scene);

        // Preload next track smoothly when reading full sequence
        if (continueSequence && index + 1 < SCENES.length) {
          void getOrGenerateSceneUrl(SCENES[index + 1]).catch(() => {});
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        setLoadingSceneId(null);

        audio.ontimeupdate = () => {
          if (audio.duration > 0) {
            setClipProgress((audio.currentTime / audio.duration) * 100);
          }
        };

        audio.onended = () => {
          setClipProgress(100);
          if (isPlayingAllRef.current && index + 1 < SCENES.length) {
            void playSceneAtIndex(index + 1, true);
          } else {
            stopAudio();
          }
        };

        await audio.play();
      } catch (err) {
        stopAudio();
        setErrorMsg(err instanceof Error ? err.message : 'Erreur audio.');
      }
    },
    [getOrGenerateSceneUrl, stopAudio]
  );

  const handleToggleScenePlay = (index: number) => {
    const scene = SCENES[index];
    if (playingSceneId === scene.id && !isPlayingAll) {
      stopAudio();
      return;
    }
    void playSceneAtIndex(index, false);
  };

  const handlePlayAllToggle = () => {
    if (isPlayingAll || playingSceneId !== null) {
      stopAudio();
    } else {
      void playSceneAtIndex(0, true);
    }
  };

  const handleDownloadScene = async (scene: SceneDefinition) => {
    setErrorMsg(null);
    setLoadingSceneId(scene.id);
    try {
      const url = await getOrGenerateSceneUrl(scene);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ERA_${scene.indexLabel}_${scene.id}_${selectedVoice}.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Téléchargement impossible.');
    } finally {
      setLoadingSceneId(null);
    }
  };

  const handleDownloadFullTrack = async () => {
    setErrorMsg(null);
    setExportingFull(true);
    try {
      const res = await fetch('/api/tts/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: SCENES.map((s) => ({
            id: s.id,
            startSec: s.startSec,
            endSec: s.endSec,
            voiceText: s.voiceText,
          })),
          voiceName: selectedVoice,
          totalDurationSec: TOTAL_DURATION_SEC,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Impossible d'exporter la piste complète.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ERA_NETWORK_PARTNERS_Voix_Off_2min_${selectedVoice}.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur export audio.');
    } finally {
      setExportingFull(false);
    }
  };

  const activeSequenceIdx = SCENES.findIndex((s) => s.id === playingSceneId);

  return (
    <section
      id="voix-off"
      className="py-14 sm:py-18 px-4 sm:px-8 border-t border-[#1A2D59] bg-[#071024]"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#E5A93B]">
              <Mic className="w-4 h-4" />
              <span>STUDIO VOIX OFF · FRANÇAIS</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Écoutez toutes les voix off (01 à 05) ou téléchargez l&apos;audio
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Voix masculine française claire, chaleureuse et posée. Lisez les 5 séquences à la
              suite sans coupure, écoutez chaque passage séparément ou exportez la piste WAV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePlayAllToggle}
              className={`inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
                isPlayingAll || playingSceneId !== null
                  ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                  : 'bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E]'
              }`}
            >
              {loadingSceneId !== null && isPlayingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlayingAll || playingSceneId !== null ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span>
                {isPlayingAll
                  ? `Arrêter la lecture (${activeSequenceIdx + 1} / ${SCENES.length})`
                  : playingSceneId !== null
                    ? 'Arrêter la piste'
                    : 'Lire toutes les voix off (1 → 5)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadFullTrack}
              disabled={exportingFull}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[#152852] hover:bg-[#1E366D] border border-[#2B488C] disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              {exportingFull ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E5A93B]" />
                  <span>Assemblage WAV…</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#E5A93B]" />
                  <span>Télécharger WAV (02:00)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Voice Persona Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {VOICE_OPTIONS.map((v) => {
            const active = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVoice(v.id)}
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0F2147] border-[#E5A93B]'
                    : 'bg-[#0C1732] border-[#1E3363] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{v.label}</span>
                  {active && <Check className="w-4 h-4 text-[#E5A93B] shrink-0" />}
                </div>
                <p className="mt-1 text-xs text-slate-300">{v.note}</p>
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-sm text-red-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 5 Scene Voiceover Script & Audition Cards */}
        <div className="divide-y divide-[#1A2D59] rounded-xl border border-[#1E3363] bg-[#0C1732] overflow-hidden">
          {SCENES.map((scene, idx) => {
            const isPlayingThis = playingSceneId === scene.id;
            const isLoadingThis = loadingSceneId === scene.id;
            const isCached = Boolean(generatedScenes[scene.id]);
            const startFmt = `${String(Math.floor(scene.startSec / 60)).padStart(2, '0')}:${String(scene.startSec % 60).padStart(2, '0')}`;
            const endFmt = `${String(Math.floor(scene.endSec / 60)).padStart(2, '0')}:${String(scene.endSec % 60).padStart(2, '0')}`;

            return (
              <div
                key={scene.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isPlayingThis ? 'bg-[#122552]' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#E5A93B] tabular-nums">
                    <span>{scene.indexLabel}</span>
                    <span className="text-slate-500">·</span>
                    <span>
                      {startFmt} – {endFmt}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="font-sans font-semibold text-white">{scene.title}</span>
                    {isCached && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="font-sans text-emerald-400">Prêt</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">« {scene.voiceText} »</p>

                  {isPlayingThis && (
                    <div className="pt-1.5">
                      <div className="w-full h-1.5 rounded-full bg-[#060D1E] overflow-hidden">
                        <div
                          className="h-full bg-[#E5A93B] transition-[width] duration-150"
                          style={{ width: `${clipProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleScenePlay(idx)}
                    disabled={isLoadingThis}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isPlayingThis
                        ? 'bg-[#E5A93B] text-[#060D1E]'
                        : 'bg-[#152852] hover:bg-[#1E366D] text-white'
                    }`}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isPlayingThis ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-[#E5A93B] fill-[#E5A93B]" />
                    )}
                    <span>{isPlayingThis ? 'Arrêter' : 'Écouter'}</span>
                  </button>

                  {onJumpToVideoScene && (
                    <button
                      type="button"
                      onClick={() => onJumpToVideoScene(scene.startSec)}
                      className="px-3 py-2 rounded-lg bg-[#060D1E] hover:bg-[#152852] border border-[#1E3363] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Vidéo
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadScene(scene)}
                    disabled={isLoadingThis}
                    aria-label={`Télécharger l'audio de ${scene.title}`}
                    className="p-2 rounded-lg bg-[#060D1E] hover:bg-[#152852] border border-[#1E3363] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

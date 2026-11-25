import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Subtitles,
  Maximize2,
  Minimize2,
  GraduationCap,
  ShoppingBag,
  ShieldCheck,
  Award,
  ArrowRight,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  SCENES,
  PILLARS,
  TALENT_HUBS,
  FOUNDER_PROFILE,
  TOTAL_DURATION_SEC,
  type SceneDefinition,
} from '../data/presentationScript';
import { AfricanMusicEngine } from '../audio/africanMusicEngine';
import {
  renderAfricanMusicWavBase64,
  renderSceneOverlays,
} from '../export/renderExportAssets';
import { EraLogo } from './EraLogo';
import { WorldCorridorMap } from './WorldCorridorMap';

interface PresentationPlayerProps {
  onOpenJoinModal: () => void;
  selectedVoice?: string;
  externalSeekTime?: number | null;
  onExternalSeekHandled?: () => void;
}

function formatTime(sec: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_DURATION_SEC, Math.floor(sec)));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const PresentationPlayer: React.FC<PresentationPlayerProps> = ({
  onOpenJoinModal,
  selectedVoice = 'Charon',
  externalSeekTime,
  onExternalSeekHandled,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioLoadingScene, setAudioLoadingScene] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [exportPhase, setExportPhase] = useState<'idle' | 'preparing' | 'encoding'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const musicEngineRef = useRef<AfricanMusicEngine | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlCacheRef = useRef<Map<string, string>>(new Map());
  const audioInFlightRef = useRef<Map<string, Promise<string | null>>>(new Map());
  const lastTriggeredSceneIdRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const activeScene: SceneDefinition =
    SCENES.find((s) => currentTime >= s.startSec && currentTime < s.endSec) ??
    SCENES[SCENES.length - 1];

  const activeSubtitle = activeScene.subtitles.find(
    (cue) => currentTime >= cue.start && currentTime < cue.end
  );

  // Active pillar index during Scene 3 (35s - 70s)
  const activePillar =
    PILLARS.find((p) => currentTime >= p.startSec && currentTime < p.endSec) ?? PILLARS[0];

  const fetchSceneVoiceUrl = useCallback(
    async (scene: SceneDefinition): Promise<string | null> => {
      const cacheKey = `${scene.id}::${selectedVoice}`;
      const cached = audioUrlCacheRef.current.get(cacheKey);
      if (cached) return cached;

      const pending = audioInFlightRef.current.get(cacheKey);
      if (pending) return pending;

      const promise = (async () => {
        try {
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
              `Le serveur API n'a pas renvoyé de JSON (HTTP ${res.status}). Vérifiez le serveur backend.`
            );
          }
          const data = await res.json();
          if (!res.ok || !data.audioBase64) {
            throw new Error(data.error || 'Échec de génération de la voix.');
          }
          const byteChars = atob(data.audioBase64);
          const byteNumbers = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const blob = new Blob([byteNumbers], { type: data.mimeType || 'audio/wav' });
          const objectUrl = URL.createObjectURL(blob);
          audioUrlCacheRef.current.set(cacheKey, objectUrl);
          setTtsError(null);
          return objectUrl;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Erreur audio';
          setTtsError(msg);
          return null;
        } finally {
          audioInFlightRef.current.delete(cacheKey);
        }
      })();

      audioInFlightRef.current.set(cacheKey, promise);
      return promise;
    },
    [selectedVoice]
  );

  const stopCurrentVoice = useCallback(() => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.onended = null;
      voiceAudioRef.current = null;
    }
    musicEngineRef.current?.setDucked(false);
  }, []);

  const playSceneVoice = useCallback(
    async (scene: SceneDefinition, offsetWithinScene = 0) => {
      stopCurrentVoice();
      setAudioLoadingScene(scene.id);
      const url = await fetchSceneVoiceUrl(scene);
      setAudioLoadingScene(null);

      // Prefetch all remaining scenes in background so every transition is seamless
      SCENES.forEach((s) => {
        if (s.id !== scene.id) {
          void fetchSceneVoiceUrl(s);
        }
      });

      if (!url) return;

      const audio = new Audio(url);
      audio.muted = voiceMuted;
      if (offsetWithinScene > 0.5) {
        audio.addEventListener(
          'loadedmetadata',
          () => {
            if (Number.isFinite(audio.duration) && offsetWithinScene < audio.duration - 0.5) {
              audio.currentTime = offsetWithinScene;
            }
          },
          { once: true }
        );
      }

      audio.onended = () => {
        musicEngineRef.current?.setDucked(false);
      };

      voiceAudioRef.current = audio;
      musicEngineRef.current?.setDucked(true);
      try {
        await audio.play();
      } catch {
        musicEngineRef.current?.setDucked(false);
      }
    },
    [fetchSceneVoiceUrl, stopCurrentVoice, voiceMuted]
  );

  // Initialize music engine and cleanup URLs on unmount
  useEffect(() => {
    musicEngineRef.current = new AfricanMusicEngine();
    const urlCache = audioUrlCacheRef.current;
    return () => {
      musicEngineRef.current?.stop();
      stopCurrentVoice();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      urlCache.forEach((url) => URL.revokeObjectURL(url));
      urlCache.clear();
    };
  }, [stopCurrentVoice]);

  // Sync mute toggles
  useEffect(() => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.muted = voiceMuted;
    }
  }, [voiceMuted]);

  useEffect(() => {
    musicEngineRef.current?.setMuted(musicMuted);
  }, [musicMuted]);

  // Master 120s animation clock
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTickRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= TOTAL_DURATION_SEC) {
          setIsPlaying(false);
          musicEngineRef.current?.stop();
          stopCurrentVoice();
          return TOTAL_DURATION_SEC;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, stopCurrentVoice]);

  // Trigger voiceover when active scene changes during playback
  useEffect(() => {
    if (!isPlaying) return;
    if (lastTriggeredSceneIdRef.current !== activeScene.id) {
      lastTriggeredSceneIdRef.current = activeScene.id;
      const offset = Math.max(0, currentTime - activeScene.startSec);
      void playSceneVoice(activeScene, offset);
    }
  }, [isPlaying, activeScene, currentTime, playSceneVoice]);

  const handleStartOrTogglePlay = () => {
    if (currentTime >= TOTAL_DURATION_SEC) {
      handleRestart();
      return;
    }

    if (!isPlaying) {
      setHasStarted(true);
      setIsPlaying(true);
      musicEngineRef.current?.start();
      lastTriggeredSceneIdRef.current = activeScene.id;
      const offset = Math.max(0, currentTime - activeScene.startSec);
      void playSceneVoice(activeScene, offset);
    } else {
      setIsPlaying(false);
      musicEngineRef.current?.stop();
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
    }
  };

  const handleRestart = () => {
    stopCurrentVoice();
    lastTriggeredSceneIdRef.current = SCENES[0].id;
    setCurrentTime(0);
    setHasStarted(true);
    setIsPlaying(true);
    musicEngineRef.current?.start();
    void playSceneVoice(SCENES[0], 0);
  };

  const seekTo = useCallback(
    (targetSec: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_DURATION_SEC - 0.1, targetSec));
      const targetScene =
        SCENES.find((s) => clamped >= s.startSec && clamped < s.endSec) ?? SCENES[0];
      setCurrentTime(clamped);
      setHasStarted(true);

      if (isPlaying) {
        lastTriggeredSceneIdRef.current = targetScene.id;
        void playSceneVoice(targetScene, clamped - targetScene.startSec);
      } else {
        lastTriggeredSceneIdRef.current = null;
        stopCurrentVoice();
      }
    },
    [isPlaying, playSceneVoice, stopCurrentVoice]
  );

  // Handle external chapter seek from page navigation
  useEffect(() => {
    if (externalSeekTime !== null && externalSeekTime !== undefined) {
      seekTo(externalSeekTime);
      if (!isPlaying) {
        setHasStarted(true);
        setIsPlaying(true);
        musicEngineRef.current?.start();
        const targetScene =
          SCENES.find((s) => externalSeekTime >= s.startSec && externalSeekTime < s.endSec) ??
          SCENES[0];
        lastTriggeredSceneIdRef.current = targetScene.id;
        void playSceneVoice(targetScene, Math.max(0, externalSeekTime - targetScene.startSec));
      }
      onExternalSeekHandled?.();
    }
  }, [externalSeekTime, isPlaying, onExternalSeekHandled, playSceneVoice, seekTo]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      await stageRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleDownloadMp4 = async () => {
    if (exportPhase !== 'idle') return;
    setExportError(null);
    setExportPhase('preparing');

    try {
      const [overlays, musicWavBase64] = await Promise.all([
        renderSceneOverlays(),
        renderAfricanMusicWavBase64(),
      ]);

      setExportPhase('encoding');

      const response = await fetch('/api/export-mp4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overlays,
          musicWavBase64,
          voiceName: selectedVoice,
          scenes: SCENES.map((s) => ({
            id: s.id,
            startSec: s.startSec,
            voiceText: s.voiceText,
            subtitles: s.subtitles,
          })),
        }),
      });

      if (!response.ok) {
        let message = "Impossible d'exporter la vidéo MP4.";
        try {
          const errData = await response.json();
          if (errData?.error) message = errData.error;
        } catch {
          // ignore non-json error body
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ERA_NETWORK_PARTNERS_Presentation.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Erreur lors du téléchargement de la vidéo."
      );
    } finally {
      setExportPhase('idle');
    }
  };

  const progressPct = (currentTime / TOTAL_DURATION_SEC) * 100;

  // Dynamic background image per scene (Scene 3 switches per active pillar!)
  const sceneBackdropUrl =
    activeScene.id === 'ecosysteme-piliers' ? activePillar.imageUrl : activeScene.imageUrl;

  return (
    <div
      ref={stageRef}
      className="relative w-full bg-[#060D1E] border border-[#1E3363] rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* 16:9 Cinema Frame */}
      <div className="relative w-full aspect-video min-h-[340px] sm:min-h-[460px] bg-[#060D1E] overflow-hidden select-none">
        {/* Background Photo Layer with Ken Burns & Measured Midnight Blue Scrim */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneBackdropUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={sceneBackdropUrl}
              alt={activeScene.imageAlt}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${isPlaying ? 'animate-kenburns' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-[#060D1E]/75 to-[#060D1E]/55" />
            <div className="absolute inset-0 bg-[#081430]/45" />
          </motion.div>
        </AnimatePresence>

        {/* Top-left subtle scene header + Top-right compact clean ERA logo */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 pt-4 sm:pt-6">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-200">
            <span className="font-mono text-[#E5A93B] font-semibold tabular-nums">
              {activeScene.indexLabel}
            </span>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <span>{activeScene.title}</span>
          </div>
          <EraLogo variant="compact" className="opacity-95 scale-90 sm:scale-100 origin-right" />
        </div>

        {/* Center Stage Scene Choreography */}
        <div className="relative z-10 h-[calc(100%-9.5rem)] sm:h-[calc(100%-10.5rem)] flex items-center justify-center px-6 sm:px-14">
          <AnimatePresence mode="wait">
            {/* SCENE 1: [0-15s] ACCROCHE */}
            {activeScene.id === 'accroche' && (
              <motion.div
                key="scene-accroche"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto text-center flex flex-col items-center gap-5 sm:gap-7"
              >
                <EraLogo variant="full" className="w-56 sm:w-72 md:w-80 h-auto drop-shadow-lg" />
                <div className="h-px w-24 bg-[#E5A93B]/70" />
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white leading-snug tracking-tight max-w-3xl">
                  « Une formation pour démarrer, un métier pour évoluer, un leadership communautaire
                  pour impacter. »
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-300">
                  {FOUNDER_PROFILE.partners} ·{' '}
                  <span className="text-[#E5A93B]">
                    Cybersécurité, Cyber-résilience &amp; Éthique numérique
                  </span>
                </p>
              </motion.div>
            )}

            {/* SCENE 2: [15-35s] LE PROBLÈME / LA SOLUTION */}
            {activeScene.id === 'probleme-solution' && (
              <motion.div
                key="scene-probleme"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.55 }}
                className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-7"
              >
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold tracking-wider text-[#E5A93B]">
                  {TALENT_HUBS.map((hub, i) => (
                    <React.Fragment key={hub.city}>
                      <span>{hub.city}</span>
                      {i < TALENT_HUBS.length - 1 && (
                        <span aria-hidden="true" className="text-white/30">
                          ·
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-5 sm:p-7 rounded-xl bg-[#060D1E]/80 border border-white/15 backdrop-blur-sm">
                    <p className="text-xs font-semibold tracking-wider text-slate-400">
                      LE CONSTAT
                    </p>
                    <h3 className="mt-2 text-lg sm:text-2xl font-bold text-white leading-snug">
                      Des talents nombreux, freinés par trois barrières
                    </h3>
                    <ul className="mt-4 space-y-2.5 text-sm sm:text-base text-slate-300">
                      <li>· Manque d&apos;accès à une formation pratique certifiante</li>
                      <li>· Absence de réseau structuré Afrique – Diaspora</li>
                      <li>· Difficulté d&apos;accès à un financement sécurisé</li>
                    </ul>
                  </div>

                  <div className="p-5 sm:p-7 rounded-xl bg-[#0C1D42]/90 border border-[#E5A93B]/60 backdrop-blur-sm">
                    <p className="text-xs font-semibold tracking-wider text-[#E5A93B]">
                      LA SOLUTION ERA
                    </p>
                    <h3 className="mt-2 text-lg sm:text-2xl font-bold text-white leading-snug">
                      Apprendre sur mobile, bâtir ensemble et passer à l&apos;action
                    </h3>
                    <ul className="mt-4 space-y-2.5 text-sm sm:text-base text-slate-100">
                      <li>· Parcours de formation PCEICN accessible partout</li>
                      <li>· Réseau communautaire entre Dakar, Abidjan, Libreville &amp; Paris</li>
                      <li>· Projets encadrés et financés avec transparence</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCENE 3: [35-70s] L'ÉCOSYSTÈME ERA - 4 PILIERS */}
            {activeScene.id === 'ecosysteme-piliers' && (
              <motion.div
                key="scene-piliers"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.55 }}
                className="w-full max-w-5xl mx-auto space-y-5"
              >
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#E5A93B]">
                    L&apos;ÉCOSYSTÈME ERA NETWORK PARTNERS
                  </p>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
                    4 Piliers Complémentaires
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {PILLARS.map((pillar) => {
                    const isFocused = activePillar.id === pillar.id;
                    const Icon =
                      pillar.id === 1
                        ? GraduationCap
                        : pillar.id === 2
                          ? ShoppingBag
                          : pillar.id === 3
                            ? ShieldCheck
                            : Award;

                    return (
                      <motion.div
                        key={pillar.id}
                        animate={{
                          scale: isFocused ? 1.03 : 0.98,
                          opacity: isFocused ? 1 : 0.65,
                        }}
                        transition={{ duration: 0.35 }}
                        className={`p-4 sm:p-5 rounded-xl border backdrop-blur-md transition-colors ${
                          isFocused
                            ? 'bg-[#0F2147]/95 border-[#E5A93B] shadow-lg'
                            : 'bg-[#060D1E]/75 border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`p-2.5 rounded-lg ${
                              isFocused
                                ? 'bg-[#E5A93B] text-[#060D1E]'
                                : 'bg-white/10 text-[#E5A93B]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#E5A93B]">
                            {pillar.number}
                          </span>
                        </div>
                        <h3 className="mt-3.5 text-base sm:text-lg font-bold text-white leading-snug">
                          {pillar.title}
                        </h3>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {pillar.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SCENE 4: [70-95s] POUR TOUT LE MONDE */}
            {activeScene.id === 'pour-tout-le-monde' && (
              <motion.div
                key="scene-monde"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.55 }}
                className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4"
              >
                <div className="w-full">
                  <WorldCorridorMap
                    progress={(currentTime - activeScene.startSec) / (activeScene.endSec - activeScene.startSec)}
                  />
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="px-4 py-3 rounded-lg bg-[#060D1E]/85 border border-white/15">
                    <p className="text-sm font-bold text-white">Résident en Afrique</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Exécuter un projet sur place et développer votre activité
                    </p>
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-[#0C1D42]/90 border border-[#E5A93B]/60">
                    <p className="text-sm font-bold text-[#E5A93B]">
                      Diaspora · Paris, New York, Toronto
                    </p>
                    <p className="text-xs text-slate-200 mt-0.5">
                      Investir en Afrique sans vous déplacer, avec suivi par séquestre
                    </p>
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-[#060D1E]/85 border border-white/15">
                    <p className="text-sm font-bold text-white">International</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Participer à un écosystème commercial et entrepreneurial fiable
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCENE 5: [95-120s] APPEL À L'ACTION */}
            {activeScene.id === 'appel-action' && (
              <motion.div
                key="scene-cta"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5"
              >
                <EraLogo variant="full" className="w-44 sm:w-56 h-auto" />
                <p className="font-serif italic text-lg sm:text-2xl text-slate-100 max-w-2xl">
                  Une formation pour démarrer, un métier pour évoluer, un leadership communautaire
                  pour impacter.
                </p>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                  DEVENEZ MEMBRE ERA NETWORK PARTNERS CERTIFIÉ
                </h2>
                <button
                  type="button"
                  onClick={onOpenJoinModal}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E] font-bold text-sm sm:text-base shadow-xl transition-transform hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                >
                  <span>Je veux rejoindre ERA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-slate-300">
                  {FOUNDER_PROFILE.partners}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Initial Play Overlay before user starts playback */}
        {!hasStarted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#060D1E]/65 backdrop-blur-[2px] p-6 text-center">
            <button
              type="button"
              onClick={handleStartOrTogglePlay}
              className="group flex items-center gap-3.5 px-7 py-4 rounded-full bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E] font-bold text-base sm:text-lg shadow-2xl transition-transform hover:scale-[1.03] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-[#060D1E]" />
              <span>Lancer la présentation (02:00)</span>
            </button>
            <p className="mt-4 text-xs sm:text-sm text-slate-200">
              Voix masculine française · Musique africaine douce · Sous-titres français
            </p>
          </div>
        )}

        {/* French Subtitles Bar at bottom of screen */}
        {showSubtitles && activeSubtitle && hasStarted && (
          <div className="absolute bottom-4 sm:bottom-5 inset-x-4 z-20 flex justify-center pointer-events-none">
            <div className="max-w-3xl px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#060D1E]/90 border border-white/15 shadow-lg text-center">
              <p className="text-sm sm:text-base md:text-lg font-medium text-white leading-snug">
                {activeSubtitle.text}
              </p>
            </div>
          </div>
        )}

        {/* Voice loading indicator if fetching TTS clip */}
        {audioLoadingScene && isPlaying && (
          <div className="absolute top-16 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#060D1E]/85 border border-white/10 text-xs text-slate-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E5A93B]" />
            <span>Synthèse vocale en cours…</span>
          </div>
        )}
      </div>

      {/* Interactive Player Controls Bar */}
      <div className="bg-[#09132B] border-t border-[#1E3363] px-4 sm:px-6 py-3.5 space-y-3">
        {/* Scrubber Timeline with Chapter Segments */}
        <div className="relative flex items-center group">
          <div className="relative w-full h-2 rounded-full bg-[#152852] overflow-hidden">
            <div
              className="h-full bg-[#E5A93B] transition-[width] duration-100"
              style={{ width: `${progressPct}%` }}
            />
            {/* Chapter Boundary Markers */}
            {SCENES.slice(1).map((scene) => (
              <div
                key={scene.id}
                className="absolute top-0 bottom-0 w-0.5 bg-[#060D1E]"
                style={{ left: `${(scene.startSec / TOTAL_DURATION_SEC) * 100}%` }}
              />
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={TOTAL_DURATION_SEC}
            step={0.5}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Position dans la vidéo"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Transport & Audio Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleStartOrTogglePlay}
              aria-label={isPlaying ? 'Mettre en pause' : 'Lire la présentation'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E] font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : currentTime >= TOTAL_DURATION_SEC ? 'Revoir' : 'Lecture'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              aria-label="Recommencer depuis le début"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs sm:text-sm text-slate-200 tabular-nums pl-1">
              {formatTime(currentTime)} <span className="text-slate-500">/</span>{' '}
              {formatTime(TOTAL_DURATION_SEC)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setVoiceMuted((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                voiceMuted
                  ? 'bg-white/5 text-slate-400 hover:text-white'
                  : 'bg-[#152852] text-white hover:bg-[#1E366D]'
              }`}
            >
              {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#E5A93B]" />}
              <span>Voix</span>
            </button>

            <button
              type="button"
              onClick={() => setMusicMuted((m) => !m)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                musicMuted
                  ? 'bg-white/5 text-slate-400 hover:text-white'
                  : 'bg-[#152852] text-white hover:bg-[#1E366D]'
              }`}
            >
              <Music className={`w-3.5 h-3.5 ${musicMuted ? '' : 'text-[#E5A93B]'}`} />
              <span>Musique</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSubtitles((s) => !s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                showSubtitles
                  ? 'bg-[#152852] text-white hover:bg-[#1E366D]'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Subtitles className={`w-3.5 h-3.5 ${showSubtitles ? 'text-[#E5A93B]' : ''}`} />
              <span>Sous-titres</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMp4}
              disabled={exportPhase !== 'idle'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#E5A93B]/15 border border-[#E5A93B]/60 text-[#E5A93B] hover:bg-[#E5A93B] hover:text-[#060D1E] disabled:opacity-70 transition-colors cursor-pointer whitespace-nowrap"
            >
              {exportPhase !== 'idle' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>
                {exportPhase === 'preparing'
                  ? 'Préparation…'
                  : exportPhase === 'encoding'
                    ? 'Encodage MP4…'
                    : 'Télécharger MP4'}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Clean error notice if TTS service returns an issue */}
        {ttsError && (
          <div className="flex items-center gap-2 text-xs text-amber-300 pt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Synthèse vocale indisponible ({ttsError}). La présentation visuelle, la musique et les
              sous-titres restent actifs.
            </span>
          </div>
        )}

        {exportError && (
          <div className="flex items-center gap-2 text-xs text-red-300 pt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

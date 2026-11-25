import React, { useState } from 'react';
import {
  GraduationCap,
  ShoppingBag,
  ShieldCheck,
  Award,
  ArrowRight,
  Globe2,
  Play,
} from 'lucide-react';
import { EraLogo } from './components/EraLogo';
import { PresentationPlayer } from './components/PresentationPlayer';
import { VoiceoverStudio } from './components/VoiceoverStudio';
import { LiveVoiceAssistant } from './components/LiveVoiceAssistant';
import { JoinEraModal } from './components/JoinEraModal';
import { PILLARS, SCENES, TALENT_HUBS, FOUNDER_PROFILE } from './data/presentationScript';

export default function App() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Charon');
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  const jumpToScene = (startSec: number) => {
    setSeekTarget(startSec);
    const el = document.getElementById('presentation');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-[#060D1E] text-white flex flex-col">
      {/* Top Bar Contract: 3 zones — Wordmark | 4 concise single-line links | 1 primary CTA */}
      <header className="sticky top-0 z-40 bg-[#060D1E]/95 backdrop-blur-md border-b border-[#1A2D59]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <a href="#presentation" className="whitespace-nowrap shrink-0">
            <EraLogo variant="compact" />
          </a>

          <nav
            aria-label="Navigation principale"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            <a
              href="#presentation"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Présentation
            </a>
            <a
              href="#voix-off"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Voix Off
            </a>
            <a
              href="#piliers"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              4 Piliers
            </a>
            <a
              href="#conseiller-vocal"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Direct Vocal
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E] font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Je veux rejoindre ERA
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Cinema Theater Section */}
        <section id="presentation" className="pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold tracking-wider text-[#E5A93B]">
                  PRÉSENTATION OFFICIELLE · 02:00
                </p>
                <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Une formation pour démarrer, un métier pour évoluer, un leadership communautaire
                  pour impacter.
                </h1>
              </div>
              <p className="text-sm text-slate-300 md:text-right shrink-0">
                Afrique · Diaspora · International
              </p>
            </div>

            {/* Interactive 2-Minute Video Player */}
            <PresentationPlayer
              onOpenJoinModal={() => setIsJoinModalOpen(true)}
              selectedVoice={selectedVoice}
              externalSeekTime={seekTarget}
              onExternalSeekHandled={() => setSeekTarget(null)}
            />

            {/* Direct Scene Chapters Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => jumpToScene(scene.startSec)}
                  className="text-left p-3.5 rounded-xl bg-[#0C1732] hover:bg-[#11224A] border border-[#1E3363] hover:border-[#E5A93B]/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-[#E5A93B] tabular-nums">
                    <span>
                      {String(Math.floor(scene.startSec / 60)).padStart(2, '0')}:
                      {String(scene.startSec % 60).padStart(2, '0')} –{' '}
                      {String(Math.floor(scene.endSec / 60)).padStart(2, '0')}:
                      {String(scene.endSec % 60).padStart(2, '0')}
                    </span>
                    <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-white truncate">
                    {scene.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Studio Voix Off & Lecture Intégrale + Export WAV */}
        <VoiceoverStudio
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          onJumpToVideoScene={jumpToScene}
        />

        {/* Section 2: L'Écosystème ERA — 4 Piliers */}
        <section
          id="piliers"
          className="py-14 sm:py-20 px-4 sm:px-8 border-t border-[#1A2D59] bg-[#081229]"
        >
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-10 sm:mb-12">
              <p className="text-xs font-semibold tracking-wider text-[#E5A93B]">
                ARCHITECTURE DE L&apos;ÉCOSYSTÈME
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Quatre piliers concrets pour bâtir et sécuriser vos projets
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Pas de promesses irréalistes : une méthodologie structurée reliant la formation
                certifiante, l&apos;activité commerciale, l&apos;investissement sécurisé par séquestre
                et le leadership de terrain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PILLARS.map((pillar) => {
                const Icon =
                  pillar.id === 1
                    ? GraduationCap
                    : pillar.id === 2
                      ? ShoppingBag
                      : pillar.id === 3
                        ? ShieldCheck
                        : Award;

                return (
                  <article
                    key={pillar.id}
                    className="rounded-xl bg-[#0C1732] border border-[#1E3363] overflow-hidden flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative bg-[#060D1E]">
                      <img
                        src={pillar.imageUrl}
                        alt={pillar.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1732] via-[#0C1732]/30 to-transparent" />
                      <div className="absolute bottom-3 left-5 flex items-center gap-2.5">
                        <span className="p-2 rounded-lg bg-[#E5A93B] text-[#060D1E]">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="font-mono text-xs font-semibold text-white">
                          Pilier {pillar.number}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                        <p className="mt-2 text-sm font-medium text-[#E5A93B]">
                          {pillar.description}
                        </p>
                        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                          {pillar.detail}
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => jumpToScene(pillar.startSec)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-[#E5A93B] transition-colors cursor-pointer"
                        >
                          <span>Voir le passage dans la vidéo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Afrique, Diaspora & International */}
        <section id="reseau" className="py-14 sm:py-20 px-4 sm:px-8 border-t border-[#1A2D59]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#E5A93B]">
                <Globe2 className="w-4 h-4" />
                <span>POUR TOUT LE MONDE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Un pont direct entre l&apos;Afrique et la Diaspora
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Que vous soyez à Libreville, Dakar, Abidjan, Paris, New York ou Toronto, ERA
                NETWORK PARTNERS permet d&apos;investir à distance en toute confiance grâce au
                séquestre, ou d&apos;exécuter des projets certifiés sur place.
              </p>

              <div className="border-t border-[#1E3363] pt-5 grid grid-cols-2 gap-4 text-sm">
                {TALENT_HUBS.map((hub) => (
                  <div key={hub.city}>
                    <p className="font-bold text-white">{hub.city}</p>
                    <p className="text-xs text-slate-400">{hub.region}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl bg-[#0C1732] border border-[#1E3363] p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-[#E5A93B]">01 · AFRIQUE</p>
                  <h3 className="text-base font-bold text-white">Résident en Afrique</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Formez-vous via le PCEICN, commercialisez vos offres et pilotez des chantiers ou
                    projets locaux.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-[#E5A93B]">02 · DIASPORA</p>
                  <h3 className="text-base font-bold text-white">Diaspora Africaine</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Paris, New York, Toronto : financez des projets réels sans vous déplacer,
                    sécurisés par le Bureau de Gestion de Projet.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-[#E5A93B]">03 · PARTENAIRES</p>
                  <h3 className="text-base font-bold text-white">International</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Accédez à une communauté professionnelle sérieuse, certifiée et engagée sur le
                    terrain.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#1E3363] pt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
                <span>
                  Paris → Libreville · New York → Dakar · Paris → Île Maurice · Toronto → Abidjan
                </span>
                <button
                  type="button"
                  onClick={() => jumpToScene(70)}
                  className="font-semibold text-[#E5A93B] hover:underline cursor-pointer"
                >
                  Revoir la carte animée (01:10)
                </button>
              </div>
            </div>
          </div>

          {/* Gouvernance & Équipe Fondatrice */}
          <div className="max-w-6xl mx-auto mt-12 pt-10 border-t border-[#1A2D59] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-2">
              <p className="text-xs font-semibold tracking-wider text-[#E5A93B]">
                GOUVERNANCE &amp; VISION NUMÉRIQUE
              </p>
              <h3 className="text-2xl font-bold text-white">{FOUNDER_PROFILE.name}</h3>
              <p className="text-sm text-slate-300">
                {FOUNDER_PROFILE.partners}
              </p>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {FOUNDER_PROFILE.statement}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#1E3363] text-sm">
                {FOUNDER_PROFILE.pillars.map((item, i) => (
                  <div key={item}>
                    <span className="font-mono text-xs text-[#E5A93B]">0{i + 1}</span>
                    <p className="font-semibold text-white mt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Conversation Vocale en Direct (Gemini 3.8 Live API) */}
        <LiveVoiceAssistant />

        {/* Section 4: Final Conversion Call-to-Action */}
        <section
          id="adhesion"
          className="py-16 sm:py-24 px-4 sm:px-8 border-t border-[#1A2D59] bg-[#09132B]"
        >
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <EraLogo variant="full" className="w-56 sm:w-64 h-auto" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              DEVENEZ MEMBRE ERA NETWORK PARTNERS CERTIFIÉ
            </h2>
            <p className="font-serif italic text-xl sm:text-2xl text-slate-200 max-w-2xl mx-auto">
              Une formation pour démarrer, un métier pour évoluer, un leadership communautaire pour
              impacter.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-lg bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E] font-bold text-base shadow-xl transition-colors cursor-pointer"
              >
                <span>Je veux rejoindre ERA</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-[#1A2D59] bg-[#050A18] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <EraLogo variant="compact" className="scale-90 origin-left" />
          <p className="text-center">
            ERA NETWORK PARTNERS · {FOUNDER_PROFILE.partners} · Cybersécurité, Cyber-résilience &amp;
            Éthique numérique
          </p>
          <p>© {new Date().getFullYear()} ERA NETWORK PARTNERS</p>
        </div>
      </footer>

      <JoinEraModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </div>
  );
}

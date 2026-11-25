import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

interface JoinEraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubmissionSuccess {
  reference: string;
  applicant: {
    fullName: string;
    email: string;
    cityCountry: string;
    profile: string;
    pillar: string;
  };
}

export const JoinEraModal: React.FC<JoinEraModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [profile, setProfile] = useState<'resident' | 'diaspora' | 'international'>('resident');
  const [pillar, setPillar] = useState('Formation PCEICN');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmissionSuccess | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg('Veuillez saisir votre nom complet.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (cityCountry.trim().length < 2) {
      setErrorMsg('Veuillez indiquer votre ville et pays de résidence.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, cityCountry, profile, pillar }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer votre demande.");
      }
      setSuccess(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setErrorMsg(null);
    setSuccess(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-era-title"
    >
      <div className="relative w-full max-w-lg bg-[#0C1732] border border-[#24396B] rounded-xl shadow-2xl p-6 sm:p-8 text-white">
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93B]"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-4 space-y-5">
            <div className="inline-flex items-center gap-2.5 text-[#E5A93B]">
              <CheckCircle2 className="w-7 h-7" />
              <span className="text-sm font-semibold tracking-wide">
                Demande enregistrée
              </span>
            </div>
            <h2 id="join-era-title" className="text-2xl font-bold text-white leading-tight">
              Bienvenue dans la démarche ERA NETWORK PARTNERS
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Votre dossier de candidature pour devenir Membre Certifié a été enregistré sous la référence{' '}
              <span className="font-mono text-[#E5A93B] font-semibold">{success.reference}</span>.
            </p>
            <div className="border-t border-white/10 pt-4 text-sm text-slate-300 space-y-1.5">
              <div>
                <span className="text-slate-400">Candidat :</span> {success.applicant.fullName}
              </div>
              <div>
                <span className="text-slate-400">Localisation :</span> {success.applicant.cityCountry}
              </div>
              <div>
                <span className="text-slate-400">Parcours prioritaire :</span> {success.applicant.pillar}
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3 px-6 rounded-lg bg-[#E5A93B] hover:bg-[#d39627] text-[#060D1E] font-bold text-sm transition-colors cursor-pointer"
              >
                Revenir à la présentation
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#E5A93B]">
                ERA NETWORK PARTNERS · ADHÉSION
              </p>
              <h2 id="join-era-title" className="mt-1.5 text-2xl font-bold text-white leading-tight">
                Devenez Membre ERA Certifié
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Une formation pour démarrer, un métier pour évoluer, un leadership communautaire pour impacter.
              </p>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-sm text-red-200"
              >
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="era-fullname" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Nom et prénom
                </label>
                <input
                  id="era-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex. Aminata Diallo / Jean-Marc Obiang"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D1E] border border-[#24396B] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#E5A93B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="era-email" className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Adresse e-mail
                  </label>
                  <input
                    id="era-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D1E] border border-[#24396B] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#E5A93B]"
                  />
                </div>
                <div>
                  <label htmlFor="era-city" className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Ville & Pays
                  </label>
                  <input
                    id="era-city"
                    type="text"
                    required
                    value={cityCountry}
                    onChange={(e) => setCityCountry(e.target.value)}
                    placeholder="Ex. Libreville, Paris, Dakar"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D1E] border border-[#24396B] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#E5A93B]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Votre profil
                </span>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-[#060D1E] border border-[#24396B]">
                  {[
                    { id: 'resident', label: 'Résident Afrique' },
                    { id: 'diaspora', label: 'Diaspora' },
                    { id: 'international', label: 'International' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProfile(item.id as 'resident' | 'diaspora' | 'international')}
                      className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap truncate ${
                        profile === item.id
                          ? 'bg-[#E5A93B] text-[#060D1E]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="era-pillar" className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Pilier d&apos;intérêt principal
                </label>
                <select
                  id="era-pillar"
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D1E] border border-[#24396B] text-sm text-white focus:outline-none focus:border-[#E5A93B]"
                >
                  <option value="Formation PCEICN">1. Formation PCEICN & Certification</option>
                  <option value="E-Commerce Communautaire">2. E-Commerce Communautaire</option>
                  <option value="Projets & Investissement Séquestre">
                    3. Projets & Investissement (Séquestre)
                  </option>
                  <option value="Leadership Communautaire">4. Leadership Communautaire</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-[#E5A93B] hover:bg-[#d39627] disabled:opacity-60 text-[#060D1E] font-bold text-sm transition-colors cursor-pointer"
            >
              <span>{submitting ? 'Enregistrement en cours...' : 'Valider ma demande ERA'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

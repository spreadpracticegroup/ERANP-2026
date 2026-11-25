export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export interface SceneDefinition {
  id: string;
  indexLabel: string;
  title: string;
  startSec: number;
  endSec: number;
  voiceText: string;
  imageUrl: string;
  imageAlt: string;
  subtitles: SubtitleCue[];
}

export interface PillarItem {
  id: number;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  detail: string;
  startSec: number;
  endSec: number;
  imageUrl: string;
}

export const TOTAL_DURATION_SEC = 120;

export const SCENES: SceneDefinition[] = [
  {
    id: 'accroche',
    indexLabel: '01',
    title: 'Accroche',
    startSec: 0,
    endSec: 15,
    voiceText:
      "Bienvenue dans ERA NETWORK PARTNERS. Tu viens d'assister à une session. Et si c'était le début de ta nouvelle vie ?",
    imageUrl: '/src/assets/images/era_scene1_session_1795608251840.jpg',
    imageAlt:
      'Jeunes professionnels africains lors d’une conférence de leadership dans une salle moderne bleu nuit et or',
    subtitles: [
      {
        start: 0,
        end: 4.8,
        text: 'Bienvenue dans ERA NETWORK PARTNERS.',
      },
      {
        start: 4.8,
        end: 9.2,
        text: "Tu viens d'assister à une session.",
      },
      {
        start: 9.2,
        end: 15,
        text: "Et si c'était le début de ta nouvelle vie ?",
      },
    ],
  },
  {
    id: 'probleme-solution',
    indexLabel: '02',
    title: 'Le Problème & La Solution',
    startSec: 15,
    endSec: 35,
    voiceText:
      "Beaucoup de talents en Afrique et dans la Diaspora n'ont pas accès à une formation, à un réseau, ni à un financement pour lancer leur projet. ERA est là pour changer ça.",
    imageUrl: '/src/assets/images/era_scene2_talents_1795608253666.jpg',
    imageAlt:
      'Jeunes talents africains à Dakar, Abidjan, Libreville et Paris se formant sur smartphone et ordinateur',
    subtitles: [
      {
        start: 15,
        end: 21.5,
        text: "Beaucoup de talents en Afrique et dans la Diaspora n'ont pas accès à une formation,",
      },
      {
        start: 21.5,
        end: 28.5,
        text: 'à un réseau, ni à un financement pour lancer leur projet.',
      },
      {
        start: 28.5,
        end: 35,
        text: 'ERA est là pour changer ça.',
      },
    ],
  },
  {
    id: 'ecosysteme-piliers',
    indexLabel: '03',
    title: "L'Écosystème ERA — 4 Piliers",
    startSec: 35,
    endSec: 70,
    voiceText:
      "ERA, c'est 4 piliers. 1. La Formation PCEICN : tu te formes, tu deviens membre certifié. 2. Le E-Commerce : tu vends tes produits et services dans toute la communauté. 3. Les Projets et l'Investissement : tu proposes un projet, la Diaspora investit, le Bureau de Gestion de Projet ERA sécurise tout par séquestre. 4. Le Leadership Communautaire : tu deviens animateur, leader, tu fais grandir ta communauté et tu es rémunéré pour ça.",
    imageUrl: '/src/assets/images/era_scene3_boutique_1795608254122.jpg',
    imageAlt:
      'Jeune entrepreneure africaine souriante gérant sa boutique e-commerce avec une tablette',
    subtitles: [
      {
        start: 35,
        end: 39.5,
        text: "ERA, c'est 4 piliers.",
      },
      {
        start: 39.5,
        end: 45.5,
        text: '1. La Formation PCEICN : tu te formes, tu deviens membre certifié.',
      },
      {
        start: 45.5,
        end: 51.5,
        text: '2. Le E-Commerce : tu vends tes produits et services dans toute la communauté.',
      },
      {
        start: 51.5,
        end: 61,
        text: "3. Les Projets et l'Investissement : tu proposes un projet, la Diaspora investit, le Bureau de Gestion de Projet ERA sécurise tout par séquestre.",
      },
      {
        start: 61,
        end: 70,
        text: '4. Le Leadership Communautaire : tu deviens animateur, leader, tu fais grandir ta communauté et tu es rémunéré pour ça.',
      },
    ],
  },
  {
    id: 'pour-tout-le-monde',
    indexLabel: '04',
    title: 'Pour Tout le Monde',
    startSec: 70,
    endSec: 95,
    voiceText:
      "Que tu sois Résident en Afrique, Diaspora Africaine à Paris, New York ou Toronto, ou International, il y a une place pour toi. Tu peux investir en Afrique sans te déplacer, ou exécuter un projet sur place et gagner ta vie.",
    imageUrl: '/src/assets/images/era_scene4_chantier_1795608254078.jpg',
    imageAlt:
      'Ingénieure et chef de projet africains examinant des plans sur un chantier moderne au coucher du soleil',
    subtitles: [
      {
        start: 70,
        end: 78,
        text: 'Que tu sois Résident en Afrique, Diaspora Africaine à Paris, New York ou Toronto,',
      },
      {
        start: 78,
        end: 84,
        text: "ou International, il y a une place pour toi.",
      },
      {
        start: 84,
        end: 95,
        text: 'Tu peux investir en Afrique sans te déplacer, ou exécuter un projet sur place et gagner ta vie.',
      },
    ],
  },
  {
    id: 'appel-action',
    indexLabel: '05',
    title: "Appel à l'Action",
    startSec: 95,
    endSec: 120,
    voiceText:
      'Rejoins-nous. Deviens Membre ERA NETWORK PARTNERS Certifié. Une formation pour démarrer, un métier pour évoluer, un leadership communautaire pour impacter.',
    imageUrl: '/src/assets/images/era_scene5_leadership_1795608254268.jpg',
    imageAlt:
      'Leaders communautaires et partenaires ERA NETWORK PARTNERS en tenue bleu nuit et or devant une métropole africaine',
    subtitles: [
      {
        start: 95,
        end: 101.5,
        text: 'Rejoins-nous. Deviens Membre ERA NETWORK PARTNERS Certifié.',
      },
      {
        start: 101.5,
        end: 110.5,
        text: 'Une formation pour démarrer, un métier pour évoluer,',
      },
      {
        start: 110.5,
        end: 120,
        text: 'un leadership communautaire pour impacter.',
      },
    ],
  },
];

export const PILLARS: PillarItem[] = [
  {
    id: 1,
    number: '01',
    title: 'La Formation PCEICN',
    shortTitle: 'Formation PCEICN',
    description: 'Tu te formes, tu deviens membre certifié.',
    detail:
      'Parcours structuré de compétences professionnelles et entrepreneuriales validé par certification communautaire.',
    startSec: 35,
    endSec: 45.5,
    imageUrl: '/src/assets/images/era_scene1_session_1795608251840.jpg',
  },
  {
    id: 2,
    number: '02',
    title: 'Le E-Commerce',
    shortTitle: 'E-Commerce',
    description: 'Tu vends tes produits et services dans toute la communauté.',
    detail:
      'Accès direct à un marché connecté entre l’Afrique et la Diaspora pour valoriser le savoir-faire local.',
    startSec: 45.5,
    endSec: 51.5,
    imageUrl: '/src/assets/images/era_scene3_boutique_1795608254122.jpg',
  },
  {
    id: 3,
    number: '03',
    title: "Les Projets et l'Investissement",
    shortTitle: 'Projets & Séquestre',
    description:
      'Tu proposes un projet, la Diaspora investit, le Bureau de Gestion de Projet ERA sécurise tout par séquestre.',
    detail:
      'Gouvernance rigoureuse, jalons vérifiés sur le terrain et protection des fonds par mécanisme de séquestre.',
    startSec: 51.5,
    endSec: 61,
    imageUrl: '/src/assets/images/era_scene4_chantier_1795608254078.jpg',
  },
  {
    id: 4,
    number: '04',
    title: 'Le Leadership Communautaire',
    shortTitle: 'Leadership',
    description:
      'Tu deviens animateur, leader, tu fais grandir ta communauté et tu es rémunéré pour ça.',
    detail:
      'Développement territorial, animation des sections locales et reconnaissance financière transparente du travail accompli.',
    startSec: 61,
    endSec: 70,
    imageUrl: '/src/assets/images/era_scene5_leadership_1795608254268.jpg',
  },
];

export const TALENT_HUBS = [
  { city: 'Libreville', region: 'Gabon · Afrique Centrale' },
  { city: 'Dakar', region: 'Sénégal · Afrique de l’Ouest' },
  { city: 'Abidjan', region: 'Côte d’Ivoire · Afrique de l’Ouest' },
  { city: 'Paris', region: 'France · Diaspora Europe' },
  { city: 'Île Maurice', region: 'Océan Indien · Cybersécurité & Gouvernance' },
];

export const FOUNDER_PROFILE = {
  name: "Équipe d'Entrepreneurs & Investisseurs",
  role: 'Gouvernance · ERA NETWORK PARTNERS',
  base: 'Afrique · Europe · Amérique',
  partners: 'Entrepreneurs & Investisseurs Africains, Européens et Américains',
  pillars: ['Cybersécurité', 'Cyber-résilience', 'Éthique numérique en Afrique'],
  statement:
    "ERA NETWORK PARTNERS est fondé par une équipe d'entrepreneurs et d'investisseurs africains, européens et américains, réunissant une expertise de pointe en cybersécurité, cyber-résilience et éthique numérique en Afrique pour bâtir un écosystème entrepreneurial de confiance.",
};


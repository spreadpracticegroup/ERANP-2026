import { PILLARS, SCENES, TALENT_HUBS, TOTAL_DURATION_SEC } from '../data/presentationScript';

export interface ExportOverlayPayload {
  id: string;
  imageUrl: string;
  durationSec: number;
  pngBase64: string;
}

const WIDTH = 1280;
const HEIGHT = 720;

const ERA_FULL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" width="420" height="200" fill="none">
  <g transform="translate(22, 14)">
    <path d="M34.5 2.5C27.1 2.2 19.8 4.4 14.3 9.1C9.5 13.2 5.4 19.2 4.8 25.8C4.2 32.1 7.6 38.5 13.4 41.4C17.2 43.3 21.8 43.1 25.5 44.6C29.4 46.2 31.2 50.4 31.9 54.5C32.8 59.8 33.6 65.2 35.2 70.3C36.6 74.8 39.1 79.4 43.2 81.4C46.8 83.2 51.4 81.7 54.4 79.1C58.2 75.8 60.5 70.8 62.2 66.1C64.2 60.6 65.8 54.7 69.2 49.9C72.4 45.4 77.6 42.1 79.8 36.9C81.2 33.6 79.9 29.7 76.9 27.6C73.4 25.1 68.7 24.4 65.6 21.3C62.5 18.2 61.9 13.2 59.1 9.8C56.1 6.1 51.3 4.6 46.7 3.7C42.7 2.9 38.6 2.7 34.5 2.5Z" fill="#FFFFFF"/>
    <path d="M72.8 61.8C70.9 64.9 69.6 69.2 70.9 72.5C71.9 75.1 74.6 74.1 76.1 71.1C77.5 68.2 78.2 63.9 76.7 61.4C75.7 59.8 73.8 60.2 72.8 61.8Z" fill="#FFFFFF"/>
  </g>
  <text x="116" y="94" fill="#FFFFFF" font-family="Plus Jakarta Sans, Liberation Sans, sans-serif" font-weight="800" font-size="86" letter-spacing="4">ERA</text>
  <path d="M34 176V102L88 134V151L48 127V176H34Z" fill="#FFFFFF"/>
  <path d="M104 114V188L50 156V139L90 163V114H104Z" fill="#E5A93B"/>
  <text x="118" y="151" fill="#FFFFFF" font-family="Plus Jakarta Sans, Liberation Sans, sans-serif" font-weight="800" font-size="45" letter-spacing="2.5">ETWORK</text>
  <text x="120" y="181" fill="#FFFFFF" font-family="Plus Jakarta Sans, Liberation Sans, sans-serif" font-weight="600" font-size="20" letter-spacing="3.8">PARTNERS</text>
  <line x1="264" y1="174" x2="386" y2="174" stroke="#E5A93B" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

const ERA_COMPACT_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  <path d="M27.5 4.5C22.2 4.5 17.8 6.4 14.5 9.8C11.9 12.5 10.8 15.8 11.4 19.3C11.9 22.1 14.4 23.6 17.5 23.9C20.3 24.2 21.8 25.7 22.4 28.4C23.1 31.8 23.9 35.1 25.4 37.9C26.7 40.3 29.4 40.8 31.8 39.2C34.2 37.6 35.8 34.4 36.6 31.1C37.4 28 39.5 25.7 42.1 23.7C43.8 22.4 44.3 20.6 42.8 18.8C41.4 17.1 39.6 15.8 38.4 13.7C37.2 11.6 36.8 8.9 34.8 7C32.8 5.1 30.3 4.5 27.5 4.5Z" fill="#FFFFFF"/>
  <path d="M41.2 31.4C40.1 32.9 39.4 35.3 40.1 36.9C40.7 38.2 42 37.4 42.6 35.6C43.2 33.8 42.3 30.2 41.2 31.4Z" fill="#FFFFFF"/>
  <path d="M14 59V41.5L32 51.5V46L10.5 34V59H14Z" fill="#FFFFFF"/>
  <path d="M36 41V58.5L18 48.5V54L39.5 63.5V41H36Z" fill="#E5A93B"/>
</svg>`;

const WORLD_MAP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 440" width="960" height="440" fill="none">
  <defs>
    <radialGradient id="eraHubGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E5A93B" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#E5A93B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="eraArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5D078"/>
      <stop offset="50%" stop-color="#E5A93B"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <g stroke="#1E3363" stroke-width="0.75" stroke-dasharray="3 5" opacity="0.6">
    <line x1="60" y1="110" x2="900" y2="110"/>
    <line x1="60" y1="220" x2="900" y2="220"/>
    <line x1="60" y1="330" x2="900" y2="330"/>
    <line x1="220" y1="30" x2="220" y2="410"/>
    <line x1="480" y1="30" x2="480" y2="410"/>
    <line x1="720" y1="30" x2="720" y2="410"/>
  </g>
  <path d="M110 72 L245 58 L295 88 L278 138 L244 168 L208 202 L166 206 L132 165 L96 120 Z" fill="#0F2147" stroke="#2E4B8A" stroke-width="1.5"/>
  <path d="M462 66 L548 54 L610 78 L602 126 L562 146 L508 148 L472 128 L458 96 Z" fill="#0F2147" stroke="#2E4B8A" stroke-width="1.5"/>
  <path d="M470 175 L548 166 L618 184 L662 222 L652 274 L616 324 L592 382 L552 394 L526 350 L512 294 L468 262 L448 220 Z" fill="#132957" stroke="#E5A93B" stroke-opacity="0.75" stroke-width="1.75"/>
  <text x="155" y="44" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600" letter-spacing="2">AMÉRIQUE DU NORD</text>
  <text x="498" y="44" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600" letter-spacing="2">EUROPE</text>
  <text x="546" y="416" fill="#E5A93B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" letter-spacing="2.4">AFRIQUE</text>
  <path d="M514 114 Q605 186 548 286" stroke="url(#eraArcGrad)" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M242 134 Q358 118 458 232" stroke="url(#eraArcGrad)" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M212 118 Q364 166 494 260" stroke="#E5A93B" stroke-opacity="0.55" stroke-width="1.6" stroke-dasharray="5 4"/>
  <path d="M514 114 Q656 184 698 342" stroke="#E5A93B" stroke-opacity="0.65" stroke-width="1.75" stroke-dasharray="4 4"/>
  <circle cx="212" cy="118" r="12" fill="url(#eraHubGlow)"/><circle cx="212" cy="118" r="4" fill="#FFFFFF" stroke="#060D1E" stroke-width="1.5"/>
  <text x="200" y="112" text-anchor="end" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="500">Toronto</text>
  <circle cx="242" cy="134" r="16" fill="url(#eraHubGlow)"/><circle cx="242" cy="134" r="5" fill="#E5A93B" stroke="#060D1E" stroke-width="1.5"/>
  <text x="230" y="148" text-anchor="end" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700">New York</text>
  <circle cx="514" cy="114" r="16" fill="url(#eraHubGlow)"/><circle cx="514" cy="114" r="5" fill="#E5A93B" stroke="#060D1E" stroke-width="1.5"/>
  <text x="526" y="108" text-anchor="start" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700">Paris</text>
  <circle cx="458" cy="232" r="16" fill="url(#eraHubGlow)"/><circle cx="458" cy="232" r="5" fill="#E5A93B" stroke="#060D1E" stroke-width="1.5"/>
  <text x="446" y="236" text-anchor="end" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700">Dakar</text>
  <circle cx="494" cy="260" r="12" fill="url(#eraHubGlow)"/><circle cx="494" cy="260" r="4" fill="#FFFFFF" stroke="#060D1E" stroke-width="1.5"/>
  <text x="482" y="272" text-anchor="end" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="500">Abidjan</text>
  <circle cx="548" cy="286" r="16" fill="url(#eraHubGlow)"/><circle cx="548" cy="286" r="5" fill="#E5A93B" stroke="#060D1E" stroke-width="1.5"/>
  <text x="562" y="292" text-anchor="start" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700">Libreville</text>
  <circle cx="698" cy="342" r="16" fill="url(#eraHubGlow)"/><circle cx="698" cy="342" r="5" fill="#E5A93B" stroke="#060D1E" stroke-width="1.5"/>
  <text x="710" y="346" text-anchor="start" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700">Île Maurice</text>
  <g transform="translate(650, 128)">
    <text x="0" y="0" fill="#E5A93B" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" letter-spacing="1">CORRIDORS ACTIFS</text>
    <text x="0" y="24" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600">Paris → Libreville</text>
    <text x="0" y="46" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="600">New York → Dakar</text>
    <text x="0" y="68" fill="#CBD5E1" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="500">Paris → Île Maurice</text>
    <text x="0" y="88" fill="#CBD5E1" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="500">Toronto → Abidjan</text>
  </g>
</svg>`;

function loadSvgAsImage(svgText: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = 'left'
): number {
  ctx.textAlign = align;
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawTopChrome(
  ctx: CanvasRenderingContext2D,
  compactLogo: HTMLImageElement,
  indexLabel: string,
  title: string
) {
  // Subtle top-left scene label
  ctx.textAlign = 'left';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#E5A93B';
  ctx.fillText(indexLabel, 48, 52);

  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('·', 78, 52);

  ctx.fillStyle = '#E2E8F0';
  ctx.fillText(title, 96, 52);

  // Top-right compact ERA logo
  ctx.drawImage(compactLogo, WIDTH - 265, 24, 38, 38);
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('ERA', WIDTH - 218, 49);
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#E5A93B';
  ctx.fillText('NETWORK PARTNERS', WIDTH - 176, 48);
}

export async function renderSceneOverlays(): Promise<ExportOverlayPayload[]> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const [fullLogoImg, compactLogoImg, worldMapImg] = await Promise.all([
    loadSvgAsImage(ERA_FULL_LOGO_SVG),
    loadSvgAsImage(ERA_COMPACT_MARK_SVG),
    loadSvgAsImage(WORLD_MAP_SVG),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponible');

  const toBase64 = () => canvas.toDataURL('image/png').split(',')[1];

  const overlays: ExportOverlayPayload[] = [];

  // 1. Scene 1 [0-15s]: Accroche
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawTopChrome(ctx, compactLogoImg, SCENES[0].indexLabel, SCENES[0].title);
  ctx.drawImage(fullLogoImg, (WIDTH - 360) / 2, 130, 360, 171);
  ctx.fillStyle = '#E5A93B';
  ctx.fillRect((WIDTH - 120) / 2, 330, 120, 2);
  ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  drawWrappedText(
    ctx,
    '« Une formation pour démarrer, un métier pour évoluer, un leadership communautaire pour impacter. »',
    WIDTH / 2,
    398,
    920,
    50,
    'center'
  );
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#E5A93B';
  ctx.fillText(
    'Entrepreneurs & Investisseurs Africains, Européens et Américains · Cybersécurité, Cyber-résilience & Éthique numérique',
    WIDTH / 2,
    528
  );
  overlays.push({
    id: 'seg0_accroche',
    imageUrl: SCENES[0].imageUrl,
    durationSec: 15,
    pngBase64: toBase64(),
  });

  // 2. Scene 2 [15-35s]: Le Problème & La Solution
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawTopChrome(ctx, compactLogoImg, SCENES[1].indexLabel, SCENES[1].title);
  ctx.textAlign = 'center';
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#E5A93B';
  ctx.fillText(
    TALENT_HUBS.map((h) => h.city).join('   ·   '),
    WIDTH / 2,
    132
  );

  // Left card: Le Constat
  drawRoundedRect(ctx, 90, 170, 530, 360, 14);
  ctx.fillStyle = 'rgba(6, 13, 30, 0.84)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('LE CONSTAT', 124, 214);
  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  drawWrappedText(ctx, 'Des talents nombreux, freinés par trois barrières', 124, 254, 460, 34);
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  drawWrappedText(ctx, "· Manque d'accès à une formation pratique certifiante", 124, 346, 460, 28);
  drawWrappedText(ctx, '· Absence de réseau structuré Afrique – Diaspora', 124, 404, 460, 28);
  drawWrappedText(ctx, "· Difficulté d'accès à un financement sécurisé", 124, 462, 460, 28);

  // Right card: La Solution ERA
  drawRoundedRect(ctx, 660, 170, 530, 360, 14);
  ctx.fillStyle = 'rgba(12, 29, 66, 0.90)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(229, 169, 59, 0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#E5A93B';
  ctx.fillText('LA SOLUTION ERA', 694, 214);
  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  drawWrappedText(ctx, "Apprendre sur mobile, bâtir ensemble et passer à l'action", 694, 254, 460, 34);
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#F1F5F9';
  drawWrappedText(ctx, '· Parcours de formation PCEICN accessible partout', 694, 346, 460, 28);
  drawWrappedText(ctx, '· Réseau communautaire Dakar, Abidjan, Libreville & Paris', 694, 404, 460, 28);
  drawWrappedText(ctx, '· Projets encadrés et financés avec transparence', 694, 462, 460, 28);

  overlays.push({
    id: 'seg1_probleme',
    imageUrl: SCENES[1].imageUrl,
    durationSec: 20,
    pngBase64: toBase64(),
  });

  // 3-6. Scene 3 [35-70s]: 4 sequential pillars
  for (let pIdx = 0; pIdx < PILLARS.length; pIdx++) {
    const activePillar = PILLARS[pIdx];
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawTopChrome(ctx, compactLogoImg, SCENES[2].indexLabel, SCENES[2].title);

    ctx.textAlign = 'center';
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#E5A93B';
    ctx.fillText("L'ÉCOSYSTÈME ERA NETWORK PARTNERS", WIDTH / 2, 126);
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('4 Piliers Complémentaires', WIDTH / 2, 168);

    const cardWidth = 272;
    const gap = 24;
    const totalW = cardWidth * 4 + gap * 3;
    const startX = (WIDTH - totalW) / 2;

    PILLARS.forEach((pillar, idx) => {
      const isFocused = idx === pIdx;
      const x = startX + idx * (cardWidth + gap);
      const y = isFocused ? 208 : 220;
      const h = isFocused ? 345 : 325;

      drawRoundedRect(ctx, x, y, cardWidth, h, 14);
      ctx.fillStyle = isFocused ? 'rgba(15, 33, 71, 0.96)' : 'rgba(6, 13, 30, 0.78)';
      ctx.fill();
      ctx.strokeStyle = isFocused ? '#E5A93B' : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = isFocused ? 2.5 : 1;
      ctx.stroke();

      // Number badge box
      drawRoundedRect(ctx, x + 22, y + 24, 44, 34, 8);
      ctx.fillStyle = isFocused ? '#E5A93B' : 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillStyle = isFocused ? '#060D1E' : '#E5A93B';
      ctx.fillText(pillar.number, x + 44, y + 46);

      ctx.textAlign = 'left';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isFocused ? '#FFFFFF' : '#CBD5E1';
      const nextY = drawWrappedText(ctx, pillar.title, x + 22, y + 92, cardWidth - 44, 27);

      ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isFocused ? '#E2E8F0' : '#94A3B8';
      drawWrappedText(ctx, pillar.description, x + 22, nextY + 12, cardWidth - 44, 23);
    });

    overlays.push({
      id: `seg${2 + pIdx}_pillar_${activePillar.id}`,
      imageUrl: activePillar.imageUrl,
      durationSec: activePillar.endSec - activePillar.startSec,
      pngBase64: toBase64(),
    });
  }

  // 7. Scene 4 [70-95s]: Pour Tout Le Monde (Carte + 3 Profils)
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawTopChrome(ctx, compactLogoImg, SCENES[3].indexLabel, SCENES[3].title);
  ctx.drawImage(worldMapImg, (WIDTH - 860) / 2, 76, 860, 394);

  const profileCards = [
    {
      title: 'Résident en Afrique',
      desc: 'Exécuter un projet sur place et développer votre activité',
      highlight: false,
    },
    {
      title: 'Diaspora · Paris, New York, Toronto',
      desc: 'Investir en Afrique sans vous déplacer, avec suivi par séquestre',
      highlight: true,
    },
    {
      title: 'International',
      desc: 'Participer à un écosystème commercial et entrepreneurial fiable',
      highlight: false,
    },
  ];

  profileCards.forEach((card, i) => {
    const w = 360;
    const g = 24;
    const x = (WIDTH - (w * 3 + g * 2)) / 2 + i * (w + g);
    const y = 486;
    drawRoundedRect(ctx, x, y, w, 108, 10);
    ctx.fillStyle = card.highlight ? 'rgba(12, 29, 66, 0.92)' : 'rgba(6, 13, 30, 0.86)';
    ctx.fill();
    ctx.strokeStyle = card.highlight ? 'rgba(229, 169, 59, 0.75)' : 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = card.highlight ? 2 : 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = card.highlight ? '#E5A93B' : '#FFFFFF';
    ctx.fillText(card.title, x + w / 2, y + 34);

    ctx.font = '400 13.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#CBD5E1';
    drawWrappedText(ctx, card.desc, x + w / 2, y + 60, w - 34, 19, 'center');
  });

  overlays.push({
    id: 'seg6_monde',
    imageUrl: SCENES[3].imageUrl,
    durationSec: 25,
    pngBase64: toBase64(),
  });

  // 8. Scene 5 [95-120s]: Appel à l'action
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawTopChrome(ctx, compactLogoImg, SCENES[4].indexLabel, SCENES[4].title);
  ctx.drawImage(fullLogoImg, (WIDTH - 290) / 2, 92, 290, 138);

  ctx.textAlign = 'center';
  ctx.font = 'italic 600 28px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#F1F5F9';
  drawWrappedText(
    ctx,
    'Une formation pour démarrer, un métier pour évoluer, un leadership communautaire pour impacter.',
    WIDTH / 2,
    274,
    840,
    36,
    'center'
  );

  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('DEVENEZ MEMBRE ERA NETWORK PARTNERS CERTIFIÉ', WIDTH / 2, 392);

  // Gold CTA Button graphic
  const btnW = 300;
  const btnH = 56;
  drawRoundedRect(ctx, (WIDTH - btnW) / 2, 434, btnW, btnH, 10);
  ctx.fillStyle = '#E5A93B';
  ctx.fill();
  ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#060D1E';
  ctx.fillText('Je veux rejoindre ERA  →', WIDTH / 2, 469);

  ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText(
    'Entrepreneurs & Investisseurs Africains, Européens et Américains',
    WIDTH / 2,
    522
  );

  overlays.push({
    id: 'seg7_cta',
    imageUrl: SCENES[4].imageUrl,
    durationSec: 25,
    pngBase64: toBase64(),
  });

  return overlays;
}

const PENTATONIC_SCALE_HZ = [
  146.83, 164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33,
];
const MELODY_PATTERN = [5, 7, 8, 6, 9, 7, 5, 4, 5, 8, 10, 8, 7, 6, 4, 5];
const BASS_ROOTS = [146.83, 146.83, 196.0, 164.81];

function encodeFloat32ToWavBase64(samples: Float32Array, sampleRate: number): string {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Renders the full 120s modern soft African kora/balafon soundtrack offline in < 0.5s.
 */
export async function renderAfricanMusicWavBase64(): Promise<string> {
  const sampleRate = 24000;
  const offline = new OfflineAudioContext(1, sampleRate * TOTAL_DURATION_SEC, sampleRate);

  const master = offline.createGain();
  master.gain.setValueAtTime(0.01, 0);
  master.gain.linearRampToValueAtTime(0.75, 1.5);
  master.gain.setValueAtTime(0.75, TOTAL_DURATION_SEC - 3);
  master.gain.linearRampToValueAtTime(0.001, TOTAL_DURATION_SEC);
  master.connect(offline.destination);

  const stepSec = 0.319;
  const totalSteps = Math.floor((TOTAL_DURATION_SEC - 0.8) / stepSec);

  // Pre-build a short noise buffer for soft shaker
  const shakerLen = Math.floor(sampleRate * 0.045);
  const shakerBuffer = offline.createBuffer(1, shakerLen, sampleRate);
  const shakerData = shakerBuffer.getChannelData(0);
  for (let i = 0; i < shakerLen; i++) {
    shakerData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (shakerLen * 0.35));
  }

  for (let s = 0; s < totalSteps; s++) {
    const startTime = s * stepSec;
    const patternIdx = s % 16;
    const freq = PENTATONIC_SCALE_HZ[MELODY_PATTERN[patternIdx]];

    // Kora / Marimba pluck
    const osc = offline.createOscillator();
    const overtone = offline.createOscillator();
    const filter = offline.createBiquadFilter();
    const gain = offline.createGain();
    const overtoneGain = offline.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2, startTime);
    overtoneGain.gain.value = 0.22;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, startTime);
    filter.frequency.exponentialRampToValueAtTime(420, startTime + 0.45);

    const peak = patternIdx % 4 === 0 ? 0.22 : 0.14;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peak, startTime + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55);

    osc.connect(filter);
    overtone.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    overtone.start(startTime);
    osc.stop(startTime + 0.6);
    overtone.stop(startTime + 0.6);

    // Warm Bass & Pad on downbeats
    if (patternIdx % 4 === 0) {
      const chordBar = Math.floor(patternIdx / 4);
      const bassOsc = offline.createOscillator();
      const bassGain = offline.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(BASS_ROOTS[chordBar] / 2, startTime);
      bassGain.gain.setValueAtTime(0.0001, startTime);
      bassGain.gain.linearRampToValueAtTime(0.16, startTime + 0.06);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.95);
      bassOsc.connect(bassGain);
      bassGain.connect(master);
      bassOsc.start(startTime);
      bassOsc.stop(startTime + 1.0);

      const padOsc = offline.createOscillator();
      const padFilter = offline.createBiquadFilter();
      const padGain = offline.createGain();
      padOsc.type = 'sine';
      padOsc.frequency.setValueAtTime(BASS_ROOTS[chordBar] * 2, startTime);
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 650;
      padGain.gain.setValueAtTime(0.0001, startTime);
      padGain.gain.linearRampToValueAtTime(0.05, startTime + 0.25);
      padGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.15);
      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(master);
      padOsc.start(startTime);
      padOsc.stop(startTime + 1.2);
    }

    // Soft shaker
    if (patternIdx % 2 === 1) {
      const noise = offline.createBufferSource();
      noise.buffer = shakerBuffer;
      const bp = offline.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 4800;
      bp.Q.value = 1.6;
      const sg = offline.createGain();
      sg.gain.setValueAtTime(patternIdx % 4 === 3 ? 0.035 : 0.02, startTime);
      sg.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);
      noise.connect(bp);
      bp.connect(sg);
      sg.connect(master);
      noise.start(startTime);
    }
  }

  const rendered = await offline.startRendering();
  return encodeFloat32ToWavBase64(rendered.getChannelData(0), sampleRate);
}

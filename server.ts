import express from 'express';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer } from 'ws';

dotenv.config();

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));

// In-memory cache for generated French TTS WAV audio per scene
const ttsCache = new Map<string, string>();
const inFlightRequests = new Map<string, Promise<string>>();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const ALLOWED_VOICES = new Set(['Charon', 'Fenrir', 'Orus', 'Puck', 'Kore', 'Zephyr']);

async function generateFrenchVoiceoverWav(
  sceneId: string,
  text: string,
  voiceName = 'Charon'
): Promise<string> {
  const safeVoice = ALLOWED_VOICES.has(voiceName) ? voiceName : 'Charon';
  const cacheKey = `${sceneId}::${safeVoice}::${text}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = inFlightRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style:
                  'Voix masculine française, claire, chaleureuse, posée et inspirante, avec un léger accent africain francophone naturel, rythme professionnel et solennel.',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: safeVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio payload returned from Gemini TTS model.');
    }

    ttsCache.set(cacheKey, base64Audio);
    return base64Audio;
  })();

  inFlightRequests.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

function formatAssTime(sec: number): string {
  const clamped = Math.max(0, sec);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = Math.floor(clamped % 60);
  const centis = Math.floor((clamped - Math.floor(clamped)) * 100);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
}

interface ExportSceneInput {
  id: string;
  startSec: number;
  voiceText: string;
  subtitles: { start: number; end: number; text: string }[];
}

interface ExportOverlayInput {
  id: string;
  imageUrl: string;
  durationSec: number;
  pngBase64: string;
}

function buildAssSubtitles(scenes: ExportSceneInput[]): string {
  const header = `[Script Info]
Title: ERA NETWORK PARTNERS
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans,25,&H00FFFFFF,&H000000FF,&H20060D1E,&H281E0D06,-1,0,0,0,100,100,0,0,4,10,0,2,64,64,28,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const lines: string[] = [];
  for (const scene of scenes) {
    for (const cue of scene.subtitles) {
      const cleanText = cue.text.replace(/\r?\n/g, '\\N');
      lines.push(
        `Dialogue: 0,${formatAssTime(cue.start)},${formatAssTime(cue.end)},Default,,0,0,0,,${cleanText}`
      );
    }
  }
  return header + lines.join('\n') + '\n';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/tts', async (req, res) => {
  try {
    const { sceneId, text, voiceName } = req.body as {
      sceneId?: string;
      text?: string;
      voiceName?: string;
    };

    if (!sceneId || typeof sceneId !== 'string' || !text || typeof text !== 'string') {
      res.status(400).json({ error: 'sceneId et text sont requis.' });
      return;
    }

    if (text.length > 1500) {
      res.status(400).json({ error: 'Texte trop long pour la synthèse vocale.' });
      return;
    }

    const audioBase64 = await generateFrenchVoiceoverWav(sceneId, text, voiceName);
    res.json({
      sceneId,
      mimeType: 'audio/wav',
      audioBase64,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la synthèse vocale.';
    console.error('[TTS Error]', message);
    const status = message.includes('GEMINI_API_KEY') ? 500 : 502;
    res.status(status).json({ error: message });
  }
});

app.post('/api/tts/full', async (req, res) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'era-tts-full-'));
  const cleanup = () => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  };

  try {
    const { scenes, voiceName, totalDurationSec } = req.body as {
      scenes?: { id: string; startSec: number; voiceText: string }[];
      voiceName?: string;
      totalDurationSec?: number;
    };

    if (!Array.isArray(scenes) || scenes.length === 0) {
      res.status(400).json({ error: 'Les scènes sont requises.' });
      cleanup();
      return;
    }

    const totalDur = Math.min(180, Math.max(15, Number(totalDurationSec) || 120));
    const voiceBase64List = await Promise.all(
      scenes.map((s) => generateFrenchVoiceoverWav(s.id, s.voiceText, voiceName))
    );

    const args: string[] = ['-y'];
    const filterParts: string[] = [];
    const labels: string[] = [];

    voiceBase64List.forEach((b64, idx) => {
      const p = path.join(tempDir, `voice_${idx}.wav`);
      fs.writeFileSync(p, Buffer.from(b64, 'base64'));
      args.push('-i', p);
      const delayMs = Math.max(0, Math.round(scenes[idx].startSec * 1000));
      const delayFilter = delayMs > 0 ? `,adelay=${delayMs}` : '';
      filterParts.push(`[${idx}:a]aformat=sample_rates=24000:channel_layouts=mono${delayFilter}[v${idx}]`);
      labels.push(`[v${idx}]`);
    });

    filterParts.push(
      `${labels.join('')}amix=inputs=${scenes.length}:duration=longest:normalize=0,apad=whole_dur=${totalDur}[aout]`
    );

    const outputPath = path.join(tempDir, 'full_voiceover.wav');
    args.push('-filter_complex', filterParts.join(';'), '-map', '[aout]', '-t', String(totalDur), outputPath);

    await execFileAsync('ffmpeg', args, { maxBuffer: 1024 * 1024 * 5 });

    res.download(outputPath, 'ERA_NETWORK_PARTNERS_Voix_Off_2min.wav', (err) => {
      cleanup();
      if (err) console.error('[TTS Full Download Error]', err.message);
    });
  } catch (err) {
    cleanup();
    const message = err instanceof Error ? err.message : 'Erreur assemblage voix off.';
    console.error('[TTS Full Error]', message);
    res.status(500).json({ error: message });
  }
});

app.post('/api/export-mp4', async (req, res) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'era-mp4-'));
  const cleanup = () => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  };

  try {
    const { overlays, musicWavBase64, scenes, voiceName } = req.body as {
      overlays?: ExportOverlayInput[];
      musicWavBase64?: string;
      scenes?: ExportSceneInput[];
      voiceName?: string;
    };

    if (!Array.isArray(overlays) || overlays.length !== 8) {
      res.status(400).json({ error: 'Les 8 séquences visuelles sont requises.' });
      cleanup();
      return;
    }
    if (!Array.isArray(scenes) || scenes.length !== 5) {
      res.status(400).json({ error: 'Les 5 scènes audio sont requises.' });
      cleanup();
      return;
    }
    if (!musicWavBase64 || typeof musicWavBase64 !== 'string') {
      res.status(400).json({ error: 'La piste musicale WAV est requise.' });
      cleanup();
      return;
    }

    const allowedImageDir = path.resolve(__dirname, 'src/assets/images');

    // Resolve and validate background photos
    const bgPaths: string[] = [];
    const overlayPaths: string[] = [];

    for (let i = 0; i < overlays.length; i++) {
      const item = overlays[i];
      const fileName = path.basename(item.imageUrl);
      const resolvedBg = path.resolve(allowedImageDir, fileName);
      if (!resolvedBg.startsWith(allowedImageDir + path.sep) || !fs.existsSync(resolvedBg)) {
        res.status(400).json({ error: `Image introuvable : ${fileName}` });
        cleanup();
        return;
      }
      bgPaths.push(resolvedBg);

      const overlayPath = path.join(tempDir, `overlay_${i}.png`);
      fs.writeFileSync(overlayPath, Buffer.from(item.pngBase64, 'base64'));
      overlayPaths.push(overlayPath);
    }

    // Write African ambient music WAV
    const musicPath = path.join(tempDir, 'music.wav');
    fs.writeFileSync(musicPath, Buffer.from(musicWavBase64, 'base64'));

    // Generate or retrieve cached Gemini TTS French voiceover WAVs for all 5 scenes
    const voiceBase64List = await Promise.all(
      scenes.map((scene) => generateFrenchVoiceoverWav(scene.id, scene.voiceText, voiceName))
    );
    const voicePaths = voiceBase64List.map((b64, idx) => {
      const p = path.join(tempDir, `voice_${idx}.wav`);
      fs.writeFileSync(p, Buffer.from(b64, 'base64'));
      return p;
    });

    // Write ASS French subtitles
    const assPath = path.join(tempDir, 'subtitles.ass');
    fs.writeFileSync(assPath, buildAssSubtitles(scenes), 'utf8');

    const outputPath = path.join(tempDir, 'ERA_NETWORK_PARTNERS_Presentation.mp4');

    // Build FFmpeg input args
    const args: string[] = ['-y'];
    for (const bg of bgPaths) {
      args.push('-i', bg);
    }
    for (const ov of overlayPaths) {
      args.push('-i', ov);
    }
    args.push('-i', musicPath);
    for (const vp of voicePaths) {
      args.push('-i', vp);
    }

    // Build filter_complex
    const filterParts: string[] = [];
    const fps = 30;

    for (let i = 0; i < overlays.length; i++) {
      const frames = Math.round(overlays[i].durationSec * fps);
      const ovIdx = 8 + i;
      filterParts.push(
        `[${i}:v]scale=1400:-1,zoompan=z='1+0.06*(on/${frames})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1280x720:fps=${fps},format=rgba,drawbox=color=#060D1E@0.52:t=fill[bg${i}]`
      );
      filterParts.push(`[${ovIdx}:v]format=rgba[ov${i}]`);
      filterParts.push(
        `[bg${i}][ov${i}]overlay=0:0:shortest=1,format=yuv420p,setsar=1[seg${i}]`
      );
    }

    const concatInputs = overlays.map((_, i) => `[seg${i}]`).join('');
    filterParts.push(`${concatInputs}concat=n=8:v=1:a=0[vconcat]`);
    const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    filterParts.push(`[vconcat]ass='${escapedAssPath}'[vout]`);

    // Audio mix: 5 delayed French voiceovers + ducked African background music
    const voiceLabels: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const inputIdx = 17 + i;
      const delayMs = Math.round(scenes[i].startSec * 1000);
      const delayFilter = delayMs > 0 ? `,adelay=${delayMs}|${delayMs}` : '';
      filterParts.push(
        `[${inputIdx}:a]aformat=sample_rates=44100:channel_layouts=stereo${delayFilter},volume=1.18[v${i}]`
      );
      voiceLabels.push(`[v${i}]`);
    }

    filterParts.push(
      `${voiceLabels.join('')}amix=inputs=${scenes.length}:duration=longest:normalize=0,apad=whole_dur=120,asplit=2[voice_sc][voice_mix]`
    );
    filterParts.push(
      `[16:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.42[music_raw]`
    );
    filterParts.push(
      `[music_raw][voice_sc]sidechaincompress=threshold=0.015:ratio=3:attack=150:release=550[ducked_music]`
    );
    filterParts.push(
      `[ducked_music][voice_mix]amix=inputs=2:duration=first:normalize=0[aout]`
    );

    args.push(
      '-filter_complex',
      filterParts.join(';'),
      '-map',
      '[vout]',
      '-map',
      '[aout]',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '21',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart',
      '-t',
      '120',
      outputPath
    );

    await execFileAsync('ffmpeg', args, { maxBuffer: 1024 * 1024 * 10 });

    res.download(outputPath, 'ERA_NETWORK_PARTNERS_Presentation.mp4', (err) => {
      cleanup();
      if (err) {
        console.error('[Export Download Error]', err.message);
      }
    });
  } catch (err) {
    cleanup();
    const message = err instanceof Error ? err.message : 'Erreur lors du rendu vidéo MP4.';
    console.error('[Export MP4 Error]', message);
    res.status(500).json({ error: message });
  }
});

app.post('/api/join', (req, res) => {
  const { fullName, email, cityCountry, profile, pillar } = req.body as {
    fullName?: string;
    email?: string;
    cityCountry?: string;
    profile?: string;
    pillar?: string;
  };

  if (!fullName || fullName.trim().length < 2) {
    res.status(400).json({ error: 'Veuillez renseigner votre nom complet.' });
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Veuillez saisir une adresse e-mail valide.' });
    return;
  }
  if (!cityCountry || cityCountry.trim().length < 2) {
    res.status(400).json({ error: 'Veuillez indiquer votre ville et pays.' });
    return;
  }

  const allowedProfiles = ['resident', 'diaspora', 'international'];
  const safeProfile = allowedProfiles.includes(profile ?? '') ? profile : 'resident';

  const reference = `ERA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  res.status(201).json({
    ok: true,
    reference,
    applicant: {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      cityCountry: cityCountry.trim(),
      profile: safeProfile,
      pillar: pillar || 'Formation PCEICN',
    },
    submittedAt: new Date().toISOString(),
  });
});

// Ensure all /api/* requests always return JSON, never HTML
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint API introuvable.' });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.path.startsWith('/api')) {
      res.status(500).json({ error: err.message || 'Erreur serveur API.' });
      return;
    }
    next(err);
  }
);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });

  wss.on('connection', (clientWs) => {
    let closed = false;
    let ai: GoogleGenAI;

    try {
      ai = getGeminiClient();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Clé API manquante';
      clientWs.send(JSON.stringify({ error: msg }));
      clientWs.close();
      return;
    }

    const sessionPromise = ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction:
          "Tu es le conseiller vocal officiel d'ERA NETWORK PARTNERS. Si quelqu'un demande qui a fondé ERA NETWORK PARTNERS ou qui est derrière le projet, réponds tout simplement que ERA NETWORK PARTNERS est fondé par une équipe d'entrepreneurs et d'investisseurs africains, européens et américains, et ne mentionne aucun nom individuel de fondateur. Tu parles en français avec un ton masculin chaleureux, posé, sérieux, communautaire et inspirant. Tu mets en valeur l'expertise du réseau en cybersécurité, cyber-résilience et éthique numérique en Afrique, ainsi que les 4 piliers : 1) La Formation PCEICN certifiante, 2) Le E-Commerce communautaire, 3) Les Projets et l'Investissement sécurisés par séquestre via le Bureau de Gestion de Projet ERA, 4) Le Leadership Communautaire rémunéré, et la participation depuis l'Afrique (Libreville, Dakar, Abidjan, Île Maurice), la Diaspora (Paris, New York, Toronto) ou l'International. Ne promets jamais d'argent facile.",
      },
      callbacks: {
        onopen: () => {
          if (!closed) {
            clientWs.send(JSON.stringify({ ready: true }));
          }
        },
        onmessage: (message: LiveServerMessage) => {
          if (closed) return;
          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            clientWs.send(
              JSON.stringify({ inputTranscript: content.inputTranscription.text })
            );
          }
          if (content?.outputTranscription?.text) {
            clientWs.send(
              JSON.stringify({ outputTranscript: content.outputTranscription.text })
            );
          }
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
            }
          }
          if (content?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
          if (content?.turnComplete) {
            clientWs.send(JSON.stringify({ turnComplete: true }));
          }
        },
        onerror: (err: unknown) => {
          console.error('[Live API Error]', err);
          if (!closed) {
            clientWs.send(
              JSON.stringify({
                error: 'Erreur de connexion avec le service vocal en direct.',
              })
            );
          }
        },
      },
    });

    sessionPromise.catch((err) => {
      console.error('[Live Connect Error]', err);
      if (!closed) {
        clientWs.send(
          JSON.stringify({
            error:
              err instanceof Error
                ? err.message
                : 'Impossible de démarrer la conversation vocale.',
          })
        );
        clientWs.close();
      }
    });

    clientWs.on('message', (rawData) => {
      try {
        const parsed = JSON.parse(rawData.toString()) as {
          audio?: string;
          text?: string;
        };
        sessionPromise
          .then((session) => {
            if (closed) return;
            if (parsed.audio) {
              session.sendRealtimeInput({
                audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
              });
            } else if (parsed.text) {
              session.sendRealtimeInput({ text: parsed.text });
            }
          })
          .catch(() => {
            // Handled in sessionPromise catch
          });
      } catch {
        // Ignore malformed client payloads
      }
    });

    clientWs.on('close', () => {
      closed = true;
      sessionPromise
        .then((session) => {
          session.close();
        })
        .catch(() => {
          // Ignore close error
        });
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ERA NETWORK PARTNERS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

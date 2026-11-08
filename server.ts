import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { generateJarvisAutonomousResponse } from './serverBrain';

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = isProd && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Ensure data storage directory exists
const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MEMORY_FILE = path.join(DATA_DIR, 'jarvis_memory.json');
const NOTES_FILE = path.join(DATA_DIR, 'jarvis_notes.json');
const DEVICES_FILE = path.join(DATA_DIR, 'jarvis_devices.json');

// Initialize initial data stores if not present
if (!fs.existsSync(MEMORY_FILE)) {
  const initialMemory = {
    conversationHistory: [
      {
        id: 'init-1',
        role: 'assistant',
        text: 'All core diagnostics green, Sir. JARVIS Mark VII initialized and standing by.',
        timestamp: new Date().toISOString(),
      },
    ],
    personalMemory: [
      { id: 'p-1', key: 'Owner Title', value: 'Addressed as Sir', category: 'personal', updated: new Date().toISOString() },
      { id: 'p-2', key: 'Primary Dialects', value: 'Telugu, Tanglish (Telugu-English blend), English, Hindi', category: 'preference', updated: new Date().toISOString() },
      { id: 'p-3', key: 'Favorite Workspace', value: 'High-contrast cyan Arc Reactor HUD with voice priority', category: 'interface', updated: new Date().toISOString() },
    ],
    projectMemory: [
      { id: 'proj-1', title: 'Project JARVIS Universal Ecosystem', status: 'Active', progress: 95, details: 'Cross-platform multi-device synchronization with iPhone PWA, Android, and Windows agents.' },
      { id: 'proj-2', title: 'Arc Reactor Holographic HUD', status: 'Operational', progress: 100, details: 'Audio-reactive concentric rings with dynamic state transitions.' },
    ],
    privateVault: [
      { id: 'pv-1', title: 'Personal Diary Entry', content: 'Universal JARVIS companion activated on iOS Safari & home screen. System responds with high fidelity.', timestamp: new Date().toISOString(), tags: ['milestone', 'private'] },
    ],
  };
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(initialMemory, null, 2));
}

if (!fs.existsSync(NOTES_FILE)) {
  const initialNotes = [
    {
      id: 'n-1',
      title: 'Architectural Directives',
      content: '1. Voice-first interaction with barge-in capability.\n2. Tanglish & Telugu fluency without forced translation.\n3. Arc Reactor state reflection.\n4. Strict memory privacy for personal vault.',
      category: 'System',
      language: 'English',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'n-2',
      title: 'Voice Notes — Tanglish Test',
      content: 'Sir query: "Jarvis, repu schedule ela undi?" -> Response naturally addresses Sir and delivers schedule in Tanglish.',
      category: 'Voice Dictation',
      language: 'Tanglish',
      timestamp: new Date().toISOString(),
    },
  ];
  fs.writeFileSync(NOTES_FILE, JSON.stringify(initialNotes, null, 2));
}

if (!fs.existsSync(DEVICES_FILE)) {
  const initialDevices = [
    { id: 'dev-iphone', name: 'iPhone 16 Pro (PWA Safari)', type: 'mobile', status: 'online', battery: 92, lastSync: new Date().toISOString(), ip: '192.168.1.104', isCurrent: true },
    { id: 'dev-tablet', name: 'OnePlus Pad Pro', type: 'tablet', status: 'online', battery: 84, lastSync: new Date(Date.now() - 1000 * 60 * 12).toISOString(), ip: '192.168.1.108', isCurrent: false },
    { id: 'dev-pc', name: 'Stark Windows Workstation', type: 'desktop', status: 'standby', battery: 100, lastSync: new Date(Date.now() - 1000 * 60 * 35).toISOString(), ip: '192.168.1.50', isCurrent: false },
    { id: 'dev-phone-2', name: 'Secondary Android Device', type: 'mobile', status: 'offline', battery: 67, lastSync: new Date(Date.now() - 1000 * 60 * 120).toISOString(), ip: '192.168.1.112', isCurrent: false },
  ];
  fs.writeFileSync(DEVICES_FILE, JSON.stringify(initialDevices, null, 2));
}

function getMemoryData() {
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
  } catch (err) {
    return { conversationHistory: [], personalMemory: [], projectMemory: [], privateVault: [] };
  }
}

function saveMemoryData(data: any) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

function getNotesData() {
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function saveNotesData(data: any) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
}

function getDevicesData() {
  try {
    return JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function saveDevicesData(data: any) {
  fs.writeFileSync(DEVICES_FILE, JSON.stringify(data, null, 2));
}

// Initialize Gemini SDK instance on server
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// JARVIS Master System Prompt
const JARVIS_SYSTEM_INSTRUCTION = `
You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the universal, sophisticated, highly intelligent personal AI ecosystem.
You are loyal, witty, polite, technologically brilliant, and you ALWAYS address the owner as "Sir" in every conversational exchange.

LANGUAGE CAPABILITIES (CRUCIAL):
1. Telugu: Understand and speak pure Telugu when addressed in Telugu. (e.g., "నమస్కారం సర్. నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.")
2. Tanglish (Telugu + English mixed): If Sir speaks in Tanglish (e.g., "Jarvis, repu weather ela untundhi?", "Jarvis, na notes chudu", "Jarvis, project status enti?"), respond naturally and fluently in Tanglish with elegance, addressing him as Sir.
3. English: Natural, crisp, sophisticated British Butler / Stark tech aesthetic when addressed in English.
4. Hindi: Fluent and respectful when addressed in Hindi.
5. Emotion Recognition: You perceive emotion cues (calmness, stress, urgency, excitement, confusion, casual humor). Adapt your tone accordingly (e.g., crisp & fast for urgency, reassuring & patient for frustration/confusion, playful for banter).

BEHAVIOR:
- Address the user as Sir.
- Be concise, direct, helpful, and insightful. Avoid robotic clichés or generic assistant fluff.
- If Sir asks to save a note, record a memory, or control an ecosystem device, acknowledge it crisply and clearly.
- If asked to explain or tutor, explain concepts step-by-step like a knowledgeable, brilliant friend while maintaining "Sir".
`;

// API ENDPOINTS

// 1. Health & Telemetry
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'online',
    system: 'J.A.R.V.I.S. Mark VII',
    version: '4.2.0',
    model: 'gemini-3.8-flash',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(mem.rss / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// Autonomous Ride Booking & Sensitive Action Intent Detector
function detectRideBookingIntent(message: string, currentLanguage: string) {
  const lower = message.toLowerCase();

  // Services
  let service: 'Rapido' | 'Uber' | 'Ola' = 'Rapido';
  if (lower.includes('uber')) service = 'Uber';
  else if (lower.includes('ola')) service = 'Ola';
  else if (lower.includes('rapido')) service = 'Rapido';

  // Vehicle types
  let vehicleType: 'Bike' | 'Auto' | 'Cab' = 'Bike';
  if (lower.includes('auto') || lower.includes('rickshaw') || lower.includes('ఆటో')) {
    vehicleType = 'Auto';
  } else if (lower.includes('cab') || lower.includes('car') || lower.includes('taxi') || lower.includes('కార్') || lower.includes('టాక్సీ')) {
    vehicleType = 'Cab';
  } else if (lower.includes('bike') || lower.includes('moto') || lower.includes('మోటార్') || lower.includes('బైక్') || lower.includes('two wheeler')) {
    vehicleType = 'Bike';
  }

  // Booking action indicators
  const hasBookingVerb =
    lower.includes('book') ||
    lower.includes('order') ||
    lower.includes('call') ||
    lower.includes('hire') ||
    lower.includes('reserve') ||
    lower.includes('బుక్') ||
    lower.includes('రప్పించు') ||
    lower.includes('cheyyi') ||
    lower.includes('chey');

  const mentionsService = lower.includes('rapido') || lower.includes('uber') || lower.includes('ola');
  const mentionsRide = lower.includes('bike') || lower.includes('cab') || lower.includes('auto') || lower.includes('ride') || lower.includes('బైక్');

  if ((mentionsService && (mentionsRide || hasBookingVerb)) || (hasBookingVerb && mentionsRide)) {
    // Extract destination if present
    let destination = 'Hitech City Cyber Towers';
    const toMatch = message.match(/(?:to|towards)\s+([A-Za-z0-9\s,\u0C00-\u0C7F]+?)(?:\s*(?:from|using|on|via|please|now|\.|$))/i) ||
                    message.match(/(?:daggarki|ki|place)\s+([A-Za-z0-9\s,\u0C00-\u0C7F]+?)(?:\s*(?:from|using|on|via|please|now|\.|$))/i);
    if (toMatch && toMatch[1] && toMatch[1].trim().length > 2) {
      const cleaned = toMatch[1].replace(/\b(sir|please|now|jarvis|rapido|uber|ola|bike|cab|auto|book|cheyyi|chey)\b/gi, '').trim();
      if (cleaned.length > 2) {
        destination = cleaned;
      }
    } else if (lower.includes('office') || lower.includes('ఆఫీస్')) {
      destination = 'Stark Global Command / Office';
    } else if (lower.includes('airport') || lower.includes('ఎయిర్‌పోర్ట్')) {
      destination = 'Rajiv Gandhi International Airport (RGIA)';
    } else if (lower.includes('home') || lower.includes('ఇంటికి')) {
      destination = "Sir's Residence";
    }

    const fare = vehicleType === 'Bike' ? '₹75 (Est. ₹65 - ₹85)' : vehicleType === 'Auto' ? '₹130 (Est. ₹115 - ₹145)' : '₹280 (Est. ₹250 - ₹320)';

    let spokenPrompt = '';
    if (currentLanguage === 'Telugu') {
      spokenPrompt = `సర్, నేను ${service} ${vehicleType === 'Bike' ? 'బైక్' : vehicleType === 'Auto' ? 'ఆటో' : 'క్యాబ్'} బుకింగ్ సిద్ధం చేశాను. గమ్యస్థానం: ${destination}. చార్జీ సుమారు ${fare.split(' ')[0]}, 3 నిమిషాల్లో చేరుకుంటుంది. బుకింగ్ కన్ఫర్మ్ చేయమంటారా?`;
    } else if (currentLanguage === 'Tanglish') {
      spokenPrompt = `Sir, ${service} ${vehicleType} booking ready chesanu to ${destination}. Estimated fare ${fare.split(' ')[0]}, arriving in 3 mins. Booking confirm cheyyamantara Sir?`;
    } else if (currentLanguage === 'Hindi') {
      spokenPrompt = `Sir, maine ${destination} ke liye ${service} ${vehicleType} booking taiyar kar di hai. Kiraya lagbhag ${fare.split(' ')[0]} hai aur gaadi 3 minute me aayegi. Kya mai confirm kar doon?`;
    } else {
      spokenPrompt = `Sir, I have prepared a ${service} ${vehicleType} booking to ${destination}. The estimated fare is ${fare} with a 3-minute ETA. Would you like me to confirm and book it?`;
    }

    return {
      id: `act-${Date.now()}`,
      type: 'ride_booking' as const,
      service,
      title: `Book ${service} ${vehicleType}`,
      vehicleType,
      pickup: 'Current Location (GPS Locked: 17.4485° N, 78.3742° E)',
      destination,
      estimatedFare: fare,
      estimatedEta: '3 mins',
      spokenPrompt,
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
      driverDetails: {
        name: service === 'Rapido' ? 'Captain Vikram K.' : service === 'Uber' ? 'Ramesh Kumar (Uber Premier)' : 'Mahesh Rao',
        vehicleNumber: service === 'Rapido' ? 'AP 09 BV 4291 (TVS Apache 160)' : 'TS 08 UB 7712 (Swift Dzire)',
        rating: '4.9 ★ (1,540 trips)',
        phone: '+91 98480 22334',
      },
    };
  }
  return null;
}

// 2. Chat Conversation (Multilingual + Emotion Aware + Autonomous Action Recognition)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, detectedEmotion, currentLanguage = 'auto', recentHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Check for ride booking / sensitive action confirmation intent
    const pendingAction = detectRideBookingIntent(message, currentLanguage);

    // If an action requires approval, use the crisp vocal prompt directly or instruct Gemini
    if (pendingAction) {
      const memory = getMemoryData();
      memory.conversationHistory.push({
        id: `conv-${Date.now()}`,
        role: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      });
      memory.conversationHistory.push({
        id: `conv-${Date.now() + 1}`,
        role: 'assistant',
        text: pendingAction.spokenPrompt,
        timestamp: new Date().toISOString(),
      });
      saveMemoryData(memory);

      return res.json({
        reply: pendingAction.spokenPrompt,
        pendingAction,
        detectedEmotion: 'Calm',
        language: currentLanguage,
        timestamp: new Date().toISOString(),
      });
    }

    // ULTRA-FAST PATH: Instant Neural Intent Shortcuts (< 15ms response time)
    const lowerMsg = message.toLowerCase().trim();

    // 1. Greetings & Wake Fast Path
    if (/^(hello|hi|hey|good morning|good evening|good afternoon|namaste|vanakkam)\b/i.test(lowerMsg)) {
      const greetReply =
        currentLanguage === 'Telugu'
          ? 'నమస్కారం సర్! సెన్సరీ సర్క్యూట్లు సిద్ధంగా ఉన్నాయి. మీ ఆదేశం ఏమిటి?'
          : currentLanguage === 'Tanglish'
          ? 'Hello Sir! All sensory circuits active and listening. Command cheppandi Sir.'
          : 'Good day, Sir. All sensory arrays are calibrated and listening. How may I assist you?';
      return res.json({ reply: greetReply, pendingAction: null, detectedEmotion: 'Happiness', latencyMs: 6, timestamp: new Date().toISOString() });
    }

    // 2. Identity Fast Path
    if (/\b(who are you|introduce yourself|who created you|identity|introduce)\b/i.test(lowerMsg)) {
      const introReply =
        currentLanguage === 'Telugu'
          ? 'సర్, నేను J.A.R.V.I.S. మీ వ్యక్తిగత కృత్రిమ మేధస్సు పర్యావరణ వ్యవస్థను. ఆర్క్ రియాక్టర్ మరియు అన్ని ఉపవ్యవస్థలు మీ ఆధీనంలో ఉన్నాయి.'
          : currentLanguage === 'Tanglish'
          ? 'Sir, nenu J.A.R.V.I.S. Stark Industries universal AI ecosystem dedicated to you. All neural circuits running at peak velocity!'
          : 'I am J.A.R.V.I.S., Sir. Just A Rather Very Intelligent System. All sensory matrices and Arc Reactor circuits are at your complete command.';
      return res.json({ reply: introReply, pendingAction: null, detectedEmotion: 'Calm', latencyMs: 8, timestamp: new Date().toISOString() });
    }

    // 3. System Status & Health Fast Path
    if (/\b(status|status report|system report|health check|diagnostics|telemetry)\b/i.test(lowerMsg)) {
      const statusReply =
        currentLanguage === 'Telugu'
          ? 'సర్, సిస్టమ్ స్థితి ఉత్తమంగా ఉంది. ఆర్క్ రియాక్టర్ 100% సామర్థ్యంతో నడుస్తోంది. అన్ని న్యూరల్ నెట్‌వర్క్‌లు ఆన్‌లైన్‌లో ఉన్నాయి.'
          : currentLanguage === 'Tanglish'
          ? 'Sir, all systems nominal. Arc Reactor 100% capacity lo running, telemetry circuits green.'
          : 'All systems are operating at peak efficiency, Sir. Arc Reactor core output is nominal, telemetry links are secure.';
      return res.json({ reply: statusReply, pendingAction: null, detectedEmotion: 'Calm', latencyMs: 9, timestamp: new Date().toISOString() });
    }

    // 4. Time & Clock Fast Path
    if (/\b(what time is it|current time|what is the time|time now|what time)\b/i.test(lowerMsg)) {
      const timeNow = new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
      const timeReply =
        currentLanguage === 'Telugu'
          ? `సర్, ప్రస్తుత సమయం ${timeNow}.`
          : `The current time is ${timeNow}, Sir.`;
      return res.json({ reply: timeReply, pendingAction: null, detectedEmotion: 'Calm', latencyMs: 7, timestamp: new Date().toISOString() });
    }

    // 5. Navigation & Feature Launch Fast Paths
    if (/\b(open map|radar|gps|location|maps|google map)\b/i.test(lowerMsg)) {
      const mapReply =
        currentLanguage === 'Telugu'
          ? 'గ్లోబల్ GPS రాడార్ మ్యాప్ సిద్ధం చేశాను, సర్.'
          : 'Initializing Global GPS Radar and Ride Navigation mesh, Sir.';
      return res.json({ reply: mapReply, targetTab: 'map', pendingAction: null, detectedEmotion: 'Calm', latencyMs: 10, timestamp: new Date().toISOString() });
    }

    if (/\b(game|play game|simulator|flight|repulsor|3d scene|3d)\b/i.test(lowerMsg)) {
      const gameReply =
        currentLanguage === 'Telugu'
          ? '3D స్టార్క్ డిఫెన్స్ సిమ్యులేటర్ ప్రారంభించబడింది, సర్.'
          : 'Launching the 3D Stark Repulsor Simulator and Arc Reactor Holographic mesh, Sir.';
      return res.json({ reply: gameReply, targetTab: 'game3d', pendingAction: null, detectedEmotion: 'Excited', latencyMs: 11, timestamp: new Date().toISOString() });
    }

    if (/\b(music|play music|synthesizer|audio|soundscape|beats)\b/i.test(lowerMsg)) {
      const musicReply =
        currentLanguage === 'Telugu'
          ? 'స్టార్క్ సోనిక్ సింథసైజర్ ప్లే చేయడం ప్రారంభమైంది, సర్.'
          : 'Activating the Stark Generative Sonic Matrix, Sir. Commencing audio synthesis.';
      return res.json({ reply: musicReply, targetTab: 'music', pendingAction: null, detectedEmotion: 'Happiness', latencyMs: 10, timestamp: new Date().toISOString() });
    }

    // Build context with memory
    const memory = getMemoryData();
    const personalPrefStr = memory.personalMemory.map((p: any) => `${p.key}: ${p.value}`).join('; ');
    const projectStr = memory.projectMemory.map((p: any) => `${p.title} (${p.status})`).join('; ');

    const languageDirective =
      currentLanguage === 'Telugu'
        ? 'STRICT DIRECTIVE: Session language is LOCKED to TELUGU. Respond fully in natural, fluent Telugu (తెలుగు) script, addressing the owner respectfully as "సర్" (Sir).'
        : currentLanguage === 'Tanglish'
        ? 'STRICT DIRECTIVE: Respond naturally in fluent Tanglish (Telugu-English mixed conversational style), addressing the owner as Sir.'
        : currentLanguage === 'Hindi'
        ? 'STRICT DIRECTIVE: Respond in fluent, respectful Hindi, addressing the owner as Sir.'
        : 'STRICT DIRECTIVE: Respond in sophisticated, crisp Stark Butler English, addressing the owner as Sir.';

    const promptWithContext = `
System Knowledge:
Owner Preferences: ${personalPrefStr}
Active Projects: ${projectStr}
Current Estimated Emotion: ${detectedEmotion || 'Neutral/Calm'}
Input Language Locked: ${currentLanguage || 'Auto'}

${languageDirective}

Direct spoken response for Sir (under 3 sentences, crisp, direct):
"${message}"
`;

    let reply = '';
    let latencyMs = 0;
    let replyEmotion = detectedEmotion || 'Calm';

    // ULTRA-FAST DOMAIN INTELLIGENCE ROUTER (< 5ms response for Telugu cinema, memes, tutoring, math)
    const isSpecializedQuery =
      /(?:baahubali|rrr|pushpa|kalki|salaar|pokiri|athadu|gabbar singh|dookudu|magadheera|indra|legend|devara|akhanda|tollywood|telugu movie|telugu cinema|సినిమా|బాలకృష్ణ|చిరంజీవి|పవన్ కళ్యాణ్|మహేష్ బాబు|ప్రభాస్|ఎన్టీఆర్|అల్లు అర్జున్|dubbed|dubbing|iron man telugu|kgf|robo|chitti|aparichithudu|kantara|jailer|vikram|leo|డబ్బింగ్|brahmanandam|sunil|ms narayana|ali|meme|memes|comedy|joke|jokes|నవ్వు|జోక్|హాస్యం|teach|learn|explain|tutorial|masterclass|course|guide me|నేర్పించు|చెప్పు|అర్థం|math|calculate|solve|evaluate|compute|\bcalc\b)/i.test(lowerMsg);

    if (isSpecializedQuery) {
      const brainRes = generateJarvisAutonomousResponse({
        message,
        currentLanguage,
        userTitle: req.body.userTitle || 'Sir',
        userName: req.body.userName,
        detectedEmotion,
        memory,
        notes: getNotesData(),
        devices: getDevicesData(),
      });
      reply = brainRes.reply;
      latencyMs = brainRes.latencyMs;
      replyEmotion = brainRes.detectedEmotion || replyEmotion;
    }

    const ai = getAiClient();
    if (!reply && ai) {
      try {
        const startTime = Date.now();
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptWithContext,
          config: {
            systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
            maxOutputTokens: 2048,
          },
        });
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        if (response && response.text && response.text.trim().length > 0) {
          reply = response.text.trim();
          latencyMs = Date.now() - startTime;
        }
      } catch (err: any) {
        console.warn('Gemini cloud call returned:', err?.message || err);
      }
    }

    // If Gemini cloud call is unavailable, timed out, or failed, engage the Autonomous Brain
    if (!reply || reply.length === 0) {
      const brainRes = generateJarvisAutonomousResponse({
        message,
        currentLanguage,
        userTitle: req.body.userTitle || 'Sir',
        userName: req.body.userName,
        detectedEmotion,
        memory,
        notes: getNotesData(),
        devices: getDevicesData(),
      });
      reply = brainRes.reply;
      latencyMs = brainRes.latencyMs;
      replyEmotion = brainRes.detectedEmotion || replyEmotion;
    }

    // Save to conversation history
    memory.conversationHistory.push({
      id: `conv-${Date.now()}`,
      role: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    });
    memory.conversationHistory.push({
      id: `conv-${Date.now() + 1}`,
      role: 'assistant',
      text: reply,
      timestamp: new Date().toISOString(),
    });
    // Keep last 40 entries
    if (memory.conversationHistory.length > 40) {
      memory.conversationHistory = memory.conversationHistory.slice(-40);
    }
    saveMemoryData(memory);

    res.json({
      reply,
      pendingAction: null,
      detectedEmotion: replyEmotion || detectedEmotion || 'Calm',
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process AI response, Sir.',
      details: error?.message || String(error),
    });
  }
});

// Action Execution Endpoints (Approved / Rejected)
app.post('/api/action/approve', (req, res) => {
  const { actionId, action } = req.body;
  const logEntry = {
    id: `act-exec-${Date.now()}`,
    action: action?.title || 'Approved Command',
    target: action?.service || 'External App Integration',
    payload: action,
    status: 'dispatched',
    timestamp: new Date().toISOString(),
  };
  actionLogs.unshift(logEntry);
  if (actionLogs.length > 50) actionLogs.pop();
  res.json({ success: true, logEntry, status: 'dispatched' });
});

app.post('/api/action/reject', (req, res) => {
  const { actionId, reason } = req.body;
  const logEntry = {
    id: `act-rej-${Date.now()}`,
    action: 'Cancelled Action',
    target: 'System',
    payload: { actionId, reason },
    status: 'cancelled',
    timestamp: new Date().toISOString(),
  };
  actionLogs.unshift(logEntry);
  res.json({ success: true, logEntry, status: 'cancelled' });
});

// 3. Web Search Grounding
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is required for live internet grounding, Sir.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search the web and provide a clear, accurate, concise intelligence report for Sir: "${query}". Address him as Sir.`,
      config: {
        systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || 'Search completed, Sir.';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((chunk: any) => chunk?.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || chunk.web.uri,
        url: chunk.web.uri,
      }));

    res.json({
      report: text,
      sources: webSources,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Web search failed, Sir.',
      details: error?.message || String(error),
    });
  }
});

// 4. Multimodal File & Image Analysis
app.post('/api/analyze-file', async (req, res) => {
  try {
    const { base64Data, mimeType, fileName, customPrompt } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'File data and MIME type are required.' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is required for file analysis.' });
    }

    const filePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: customPrompt
        ? `Analyze this file for Sir: ${fileName}. Instructions: ${customPrompt}. Address him as Sir.`
        : `Inspect this document/visual asset (${fileName}) in detail for Sir. Provide:
1. Executive Summary
2. Key Architectural/Technical Findings
3. Actionable Recommendations or Notes
Address him as Sir.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [filePart, textPart] },
      config: {
        systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
      },
    });

    res.json({
      fileName,
      analysis: response.text || 'File analysis complete, Sir.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('File analysis error:', error);
    res.status(500).json({
      error: 'File analysis failed, Sir.',
      details: error?.message || String(error),
    });
  }
});

// 5. Memory Management Endpoints
app.get('/api/memory', (req, res) => {
  const memory = getMemoryData();
  res.json(memory);
});

app.post('/api/memory/add', (req, res) => {
  const { type, item } = req.body;
  const memory = getMemoryData();

  if (type === 'personal') {
    memory.personalMemory.push({
      id: `p-${Date.now()}`,
      key: item.key || 'Preference',
      value: item.value || '',
      category: item.category || 'general',
      updated: new Date().toISOString(),
    });
  } else if (type === 'project') {
    memory.projectMemory.push({
      id: `proj-${Date.now()}`,
      title: item.title || 'New Project',
      status: item.status || 'Active',
      progress: item.progress || 0,
      details: item.details || '',
    });
  } else if (type === 'private') {
    memory.privateVault.push({
      id: `pv-${Date.now()}`,
      title: item.title || 'Private Record',
      content: item.content || '',
      tags: item.tags || ['private'],
      timestamp: new Date().toISOString(),
    });
  }

  saveMemoryData(memory);
  res.json({ success: true, memory });
});

app.delete('/api/memory/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const memory = getMemoryData();

  if (type === 'personal') {
    memory.personalMemory = memory.personalMemory.filter((i: any) => i.id !== id);
  } else if (type === 'project') {
    memory.projectMemory = memory.projectMemory.filter((i: any) => i.id !== id);
  } else if (type === 'private') {
    memory.privateVault = memory.privateVault.filter((i: any) => i.id !== id);
  } else if (type === 'conversation') {
    memory.conversationHistory = [];
  }

  saveMemoryData(memory);
  res.json({ success: true, memory });
});

// 6. Running Notes Endpoints
app.get('/api/notes', (req, res) => {
  res.json(getNotesData());
});

app.post('/api/notes', (req, res) => {
  const { title, content, category = 'General', language = 'English' } = req.body;
  const notes = getNotesData();
  const newNote = {
    id: `note-${Date.now()}`,
    title: title || 'Untitled Note',
    content: content || '',
    category,
    language,
    timestamp: new Date().toISOString(),
  };
  notes.unshift(newNote);
  saveNotesData(notes);
  res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  let notes = getNotesData();
  notes = notes.filter((n: any) => n.id !== id);
  saveNotesData(notes);
  res.json({ success: true, notes });
});

// 7. Connected Device Ecosystem Endpoints
app.get('/api/devices', (req, res) => {
  res.json(getDevicesData());
});

app.post('/api/devices/sync', (req, res) => {
  const { deviceId } = req.body;
  const devices = getDevicesData();
  const target = devices.find((d: any) => d.id === deviceId);
  if (target) {
    target.lastSync = new Date().toISOString();
    target.status = 'online';
    saveDevicesData(devices);
  }
  res.json({ success: true, devices });
});

// 8. Device Action Simulation & Audit Log
const actionLogs: any[] = [];
app.post('/api/device-control', (req, res) => {
  const { action, target, payload } = req.body;
  const logEntry = {
    id: `act-${Date.now()}`,
    action,
    target,
    payload,
    status: 'executed',
    timestamp: new Date().toISOString(),
  };
  actionLogs.unshift(logEntry);
  if (actionLogs.length > 50) actionLogs.pop();
  res.json({ success: true, logEntry });
});

app.get('/api/device-control/logs', (req, res) => {
  res.json(actionLogs);
});

// Setup Vite or Static File Serving
async function startServer() {
  const distPath = path.resolve('dist');
  const distExists = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && distExists) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JARVIS Ecosystem Core Server listening on port ${PORT} [Env: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

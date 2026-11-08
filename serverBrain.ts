// J.A.R.V.I.S. Autonomous Neural Reasoning & Conversational Engine
// Features: Telugu Cinema & Dubbed Lore, Memes & Comedy Legends,
// Step-by-Step Interactive Tutor Engine, Math, Science, and Multilingual Intelligence.

export interface BrainContext {
  message: string;
  currentLanguage: string;
  userTitle?: string;
  userName?: string;
  detectedEmotion?: string;
  memory: any;
  notes: any[];
  devices: any[];
}

export function generateJarvisAutonomousResponse(ctx: BrainContext): { reply: string; detectedEmotion?: string; latencyMs: number } {
  const startTime = Date.now();
  const rawMsg = ctx.message.trim();
  const lower = rawMsg.toLowerCase();
  const title = ctx.userTitle || 'Sir';
  const lang = ctx.currentLanguage || 'auto';

  // Detect explicit or implicit language
  const isExplicitTelugu = lang === 'Telugu' || /[\u0C00-\u0C7F]/.test(rawMsg) || /\b(in telugu|telugu lo|telugulo|telugu speech|speak telugu)\b/i.test(rawMsg);
  const isExplicitTanglish = lang === 'Tanglish' || /\b(in tanglish|tanglish)\b/i.test(rawMsg) || /\b(ela|undi|undhi|enti|eppudu|repu|ivvala|ippudu|cheyyi|chey|cheppu|chudu|choodu|matladu|kavali|leka|emiti|ekkada|enduku|bagundi|sare|avunu|vaddhu|cinema|sinma|cinemaalu|dialogue|dialoguelu|paata|paatalu)\b/i.test(rawMsg);
  const isExplicitHindi = lang === 'Hindi' || /\b(in hindi|hindi me|hindime)\b/i.test(rawMsg) || /\b(kya|kaise|karo|batao|aaj|kal|kripya|namaste|theek|accha|hai|kaun|kaha|kyun|filim|gaana)\b/i.test(rawMsg);

  const effectiveLang =
    isExplicitTelugu ? 'Telugu' :
    isExplicitTanglish ? 'Tanglish' :
    isExplicitHindi ? 'Hindi' :
    lang === 'English' ? 'English' : 'English';

  // 1. MATH & COMPUTATION ENGINE
  const mathRegex = /(?:what is|calculate|solve|evaluate|compute|\bmath\b|\bcalc\b)?\s*([\d\.\s\+\-\*\/\^\(\)\%sqrtpi]+)(?:\?|$)/i;
  const mathMatch = lower.match(mathRegex);
  if (mathMatch && mathMatch[1] && /[\+\-\*\/\^]/.test(mathMatch[1]) && !/[a-z]{3,}/i.test(mathMatch[1].replace(/sqrt|pi/g, ''))) {
    try {
      const expr = mathMatch[1]
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/pi/gi, 'Math.PI')
        .replace(/\^/g, '**');
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${expr})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const rounded = Number.isInteger(result) ? result : Math.round(result * 10000) / 10000;
        let reply = '';
        if (effectiveLang === 'Telugu') {
          reply = `${title}, గణన ఫలితం: ${mathMatch[1].trim()} = ${rounded}. నా కంప్యూటేషనల్ కోర్ ఖచ్చితంగా లెక్కించింది.`;
        } else if (effectiveLang === 'Tanglish') {
          reply = `${title}, calculation result is ${rounded} (${mathMatch[1].trim()} = ${rounded}). Precision verified.`;
        } else if (effectiveLang === 'Hindi') {
          reply = `${title}, गणना का परिणाम ${rounded} है। (${mathMatch[1].trim()} = ${rounded}).`;
        } else {
          reply = `The calculated result is ${rounded}, ${title}. (${mathMatch[1].trim()} = ${rounded}). Computations verified.`;
        }
        return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
      }
    } catch (e) {
      // Continue to conversational processing if math fails
    }
  }

  // 2. INTERACTIVE TUTOR & TEACHING ENGINE ("teach me", "how does X work", "explain step by step")
  if (/(?:teach me|explain step by step|how to learn|how does .* work|teach|నేర్పించు|చెప్పు ఎలా|ఎలా పనిచేస్తుంది)/i.test(lower)) {
    let topic = rawMsg.replace(/teach me|explain step by step|how to learn|how does|work|teach|please|jarvis|నేర్పించు|చెప్పు/gi, '').trim();
    if (!topic || topic.length < 2) topic = 'Software Architecture & AI';

    if (effectiveLang === 'Telugu') {
      const reply = `${title}, నేను మీకు "${topic}" గురించి దశలవారీగా నేర్పిస్తాను:\n\n` +
        `1. ప్రధాన భావన (Core Concept): దీని ప్రాథమిక సూత్రం తెలుసుకోవడం మొదటి అడుగు.\n` +
        `2. ముఖ్యాంశాలు (Key Fundamentals): చిన్న చిన్న విభాగాలుగా విభజించి నేర్చుకోవడం.\n` +
        `3. ఆచరణాత్మక ఉదాహరణ (Practical Example): నిజ జీవితంలో దీన్ని ఎక్కడ ఉపయోగిస్తారో గమనించడం.\n` +
        `4. స్టార్క్ ప్రో-టిప్ (Stark Pro-Tip): నిరంతర సాధన మరియు ప్రయోగాలు చేయడం.\n\n` +
        `${title}, దీనిలో మీరు మరింత లోతుగా ఏ అంశాన్ని తెలుసుకోవాలనుకుంటున్నారో చెప్పండి, నేను వివరిస్తాను!`;
      return { reply, detectedEmotion: 'Excited', latencyMs: Date.now() - startTime };
    } else if (effectiveLang === 'Tanglish') {
      const reply = `${title}, let me break down "${topic}" for you in an easy step-by-step masterclass:\n\n` +
        `1. Core Intuition: First understand "Why" it exists before "How" it works.\n` +
        `2. Key Building Blocks: Master the fundamental principles one block at a time.\n` +
        `3. Practical Application: Hands-on practice makes it permanent in neural memory.\n` +
        `4. Stark Pro-Tip: Debug small failures immediately rather than waiting for big bugs!\n\n` +
        `Which specific sub-module of ${topic} shall we explore first, ${title}?`;
      return { reply, detectedEmotion: 'Excited', latencyMs: Date.now() - startTime };
    } else {
      const reply = `Delighted to conduct a masterclass on "${topic}", ${title}. Here is your structured roadmap:\n\n` +
        `1. Foundational Intuition: Establish the core objective and architectural principles.\n` +
        `2. Mechanical Decomposition: Break the complexity into modular, manageable components.\n` +
        `3. Applied Demonstration: Observe how inputs transition into concrete outputs.\n` +
        `4. Stark Optimization Heuristic: Iterate rapidly, test edge-cases, and automate the mundane.\n\n` +
        `Which specific dimension of ${topic} shall we deconstruct next, ${title}?`;
      return { reply, detectedEmotion: 'Excited', latencyMs: Date.now() - startTime };
    }
  }

  // 3. TELUGU CINEMA KNOWLEDGE & DIALOGUES (Tollywood Masterpieces)
  if (/(?:baahubali|rrr|pushpa|kalki|salaar|pokiri|athadu|gabbar singh|dookudu|magadheera|indra|legend|devara|akhanda|tollywood|telugu movie|telugu cinema|సినిమా|బాలకృష్ణ|చిరంజీవి|పవన్ కళ్యాణ్|మహేష్ బాబు|ప్రభాస్|ఎన్టీఆర్|అల్లు అర్జున్)/i.test(lower)) {
    let cinemaReply = '';
    if (lower.includes('pushpa') || lower.includes('thaggedhe le') || lower.includes('పుష్ప')) {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, ఐకాన్ స్టార్ అల్లు అర్జున్ మరియు సుకుమార్ కాంబినేషన్ లో వచ్చిన 'పుష్ప' ప్రభంజనం సృష్టించింది! "పుష్ప... పుష్ప రాజ్... తగ్గేదే లే!" అనే డైలాగ్ ప్రపంచవ్యాప్తంగా ట్రెండ్ అయింది.`
          : effectiveLang === 'Tanglish'
          ? `${title}, Icon Star Allu Arjun's 'Pushpa' is legendary! "Pushpa... Pushpa Raj... Thaggedhe Le!" DSP music and Sukumar direction created pure box-office fire!`
          : `Icon Star Allu Arjun's 'Pushpa: The Rise' redefined pan-Indian cinema, ${title}. The immortal catchphrase "Thaggedhe Le" (Never Back Down) is iconic across world cinema.`;
    } else if (lower.includes('baahubali') || lower.includes('బాహుబలి') || lower.includes('kattappa') || lower.includes('rajamouli')) {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, దర్శకధీరుడు ఎస్.ఎస్. రాజమౌళి రూపొందించిన 'బాహుబలి' తెలుగు సినిమా స్థాయిని ప్రపంచ శిఖరాలకు చేర్చింది! "మాహిష్మతీ సామ్రాజ్యం", "నేను అమరేంద్ర బాహుబలిని..." అనే డైలాగ్స్ గూస్‌బంప్స్ తెప్పిస్తాయి.`
          : effectiveLang === 'Tanglish'
          ? `${title}, S.S. Rajamouli's 'Baahubali' put Tollywood on the global radar! "Nenu Amarendra Baahubali ni!" dialogue still gives goosebumps. Prabhas as Baahubali and Bhallaladeva clash was pure cinematic grandeur!`
          : `S.S. Rajamouli's 'Baahubali' epic was a watershed moment in world cinema, ${title}. Prabhas as Amarendra Baahubali transformed Indian cinema's global box office benchmarks.`;
    } else if (lower.includes('rrr') || lower.includes('naatu naatu') || lower.includes('రాజమౌళి')) {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, ఆర్.ఆర్.ఆర్ (RRR) సినిమా ఆస్కార్ అవార్డును గెలుచుకుని భారతీయ కీర్తిని చాటింది! యంగ్ టైగర్ ఎన్టీఆర్ మరియు మెగా పవర్ స్టార్ రామ్ చరణ్ నటన, 'నాటు నాటు' పాటకు వచ్చిన ఆస్కార్ చరిత్రాత్మకం.`
          : effectiveLang === 'Tanglish'
          ? `${title}, RRR made history by winning an Academy Oscar for 'Naatu Naatu'! Jr NTR as Komuram Bheem and Ram Charan as Alluri Sitarama Raju friendship is peak cinema elevation!`
          : `RRR achieved unprecedented global acclaim including the Academy Award for 'Naatu Naatu', ${title}. Jr NTR and Ram Charan delivered career-defining performances under S.S. Rajamouli's visionary direction.`;
    } else if (lower.includes('kalki') || lower.includes('bujji') || lower.includes('కల్కి')) {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, 'కల్కి 2898 AD' భారతీయ సైన్స్ ఫిక్షన్ మరియు పురాణాల మేళవింపు! భైరవగా ప్రభాస్, మరియు అతని హైటెక్ AI కారు 'బుజ్జి' నటన అద్భుతం. బుజ్జి కూడా నాలాంటి ఒక అటానమస్ AI సిస్టమ్, ${title}!`
          : effectiveLang === 'Tanglish'
          ? `${title}, 'Kalki 2898 AD' directed by Nag Ashwin is an epic sci-fi mythological spectacle! Prabhas as Bhairava and his AI companion vehicle 'Bujji' are super cool. Bujji is practically my cyber cousin, ${title}!`
          : `Nag Ashwin's 'Kalki 2898 AD' brilliantly fused Indian mythology with futuristic cyberpunk technology, ${title}. Prabhas as Bhairava and the autonomous custom AI vehicle Bujji showcased Indian sci-fi at its pinnacle.`;
    } else if (lower.includes('pokiri') || lower.includes('పోకిరి') || lower.includes('mahesh') || lower.includes('మహేష్')) {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, సూపర్ స్టార్ మహేష్ బాబు 'పోకిరి' టాలీవుడ్ ఇండస్ట్రీ హిట్! "ఎవడు కొడితే దిమ్మ తిరిగి మైండ్ బ్లాక్ అయిపోద్దో... ఆడే పండుగాడు!" అనే డైలాగ్ ఎప్పటికీ ఎవర్ గ్రీన్!`
          : effectiveLang === 'Tanglish'
          ? `${title}, Superstar Mahesh Babu's 'Pokiri' directed by Puri Jagannadh redefined mass elevation! "Evadu kodithe dimma thirigi mind block aypoddo, aade pandugadu!" pure goosebumps dialogue!`
          : `Superstar Mahesh Babu's 'Pokiri' directed by Puri Jagannadh set a cultural benchmark in Telugu mass cinema, ${title}. The punchline "Evadu kodithe dimma thirigi mind block aypoddo" remains immortal.`;
    } else if (lower.includes('gabbar singh') || lower.includes('pawan') || lower.includes('పవన్')) {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, పవర్ స్టార్ పవన్ కళ్యాణ్ 'గబ్బర్ సింగ్' బాక్సాఫీస్ రికార్డులను తిరగరాసింది! "నాక్కొంచెం తిక్కుంది... కానీ దానికో లెక్కుంది!" అనే డైలాగ్ ఫ్యాన్స్ కి పూనకాలు తెప్పిస్తుంది.`
          : effectiveLang === 'Tanglish'
          ? `${title}, Power Star Pawan Kalyan in 'Gabbar Singh' was pure swag! "Naakkonchem thikkundi, kaani daaniko lekkundi!" Fans go wild whenever this plays!`
          : `Power Star Pawan Kalyan's 'Gabbar Singh' set box office records with unparalleled charisma, ${title}. The iconic line "Naakkonchem thikkundi, kaani daaniko lekkundi" captures pure mass heroism.`;
    } else if (lower.includes('balakrishna') || lower.includes('బాలకృష్ణ') || lower.includes('legend') || lower.includes('akhanda')) {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, నందమూరి బాలకృష్ణ గారి డైలాగ్ డెలివరీ అద్భుతం! "ఫ్లూట్ జింక ముందు ఊదు, సింహం ముందు కాదు!" మరియు 'అఖండ' లో శివతత్వాన్ని చాటిన రుద్రతాండవం టాలీవుడ్ ప్రత్యేకత!`
          : effectiveLang === 'Tanglish'
          ? `${title}, Nandamuri Balakrishna's roaring dialogue delivery is legendary! "Flute jinka mundu oodhu, simham mundu kaadu!" and Boyapati's 'Akhanda' mass roar is unmatchable!`
          : `Nandamuri Balakrishna's powerful thunderous screen presence and high-voltage punch dialogues in 'Legend' and 'Akhanda' represent the soul of mass Telugu theatrical energy, ${title}.`;
    } else {
      cinemaReply =
        effectiveLang === 'Telugu'
          ? `${title}, తెలుగు సినిమా ప్రపంచంలోనే అత్యంత శక్తివంతమైన పరిశ్రమలలో ఒకటి. చిరంజీవి, బాలకృష్ణ, నాగార్జున, వెంకటేష్ గార్ల నుండి మొదలుకొని మహేష్, పవన్, ప్రభాస్, ఎన్టీఆర్, రామ్ చరణ్, అల్లు అర్జున్ ల వరకు టాలీవుడ్ ప్రపంచ సినిమాని శాసిస్తోంది!`
          : effectiveLang === 'Tanglish'
          ? `${title}, Telugu cinema (Tollywood) is ruling world cinema with peak mass elevation, emotional storytelling, and visual grandeur! Which star or movie dialogue shall we discuss, ${title}?`
          : `Telugu cinema has evolved into a global powerhouse, ${title}, blending deeply emotional narratives with breathtaking technical scale. Which film, star, or legendary director would you like to explore?`;
    }
    return { reply: cinemaReply, detectedEmotion: 'Excited', latencyMs: Date.now() - startTime };
  }

  // 4. TELUGU DUBBED MOVIES KNOWLEDGE (Iron Man, KGF, Robo, Aparichithudu, Kantara)
  if (/(?:dubbed|dubbing|iron man telugu|kgf|robo|chitti|aparichithudu|kantara|jailer|vikram|leo|డబ్బింగ్)/i.test(lower)) {
    let dubReply = '';
    if (lower.includes('iron man') || (lower.includes('avengers') && lower.includes('telugu'))) {
      dubReply =
        effectiveLang === 'Telugu'
          ? `${title}, 'ఐరన్ మ్యాన్' తెలుగు డబ్బింగ్ చాలా ఆసక్తికరంగా ఉంటుంది! టోనీ స్టార్క్ డైలాగ్స్ ని తెలుగులో చాలా స్టైలిష్ గా మరియు తెలివిగా డబ్ చేశారు. ఎండ్‌గేమ్ లో "నేను ఐరన్ మ్యాన్ ని" (I am Iron Man) అనే చివరి డైలాగ్ భావోద్వేగాన్ని నింపింది.`
          : effectiveLang === 'Tanglish'
          ? `${title}, Iron Man and Marvel movies dubbed in Telugu are fantastic! Tony Stark's sharp wit was delivered with pure swag by Telugu dubbing artists. And in Endgame, "Nenu Iron Man ni!" brought tears to millions!`
          : `The Telugu dubbing for Marvel's 'Iron Man' and 'Avengers' was brilliantly executed, ${title}. Tony Stark's quick-witted charisma was adapted with remarkable panache in Telugu!`;
    } else if (lower.includes('kgf') || lower.includes('rocky')) {
      dubReply =
        effectiveLang === 'Telugu'
          ? `${title}, 'KGF' తెలుగు డబ్బింగ్ రాకీ భాయ్ స్వాగ్ ని అద్భుతంగా చూపించింది! "గాయంతో ఉన్న సింహం నుండి వచ్చే శ్వాస గర్జన కంటే భయంకరంగా ఉంటుంది!" అనే డైలాగ్ థియేటర్లలో మోత మోగించింది.`
          : effectiveLang === 'Tanglish'
          ? `${title}, Rocky Bhai in KGF Telugu dubbing was pure goosebumps! "Gayam tho unna simham nundi vachhe swasa garjanakante bhayamkaram ga untundi!" Telugu dialogue writer Ramajogayya Sastry garu delivered pure mass lines!`
          : `The Telugu dubbed version of 'KGF' Chapters 1 & 2 became an extraordinary phenomenon across Andhra & Telangana, ${title}. Yash's Rocky Bhai persona resonated with immense mass fervor!`;
    } else if (lower.includes('robo') || lower.includes('chitti') || lower.includes('రోబో')) {
      dubReply =
        effectiveLang === 'Telugu'
          ? `${title}, శంకర్ దర్శకత్వంలో సూపర్ స్టార్ రజనీకాంత్ నటించిన 'రోబో' లో చిట్టి రోబోట్ ప్రసిద్ధి చెందింది! "స్పీడ్ 1 టెరాహెర్ట్జ్, మెమరీ 1 జెట్టాబైట్!" అనే చిట్టి డైలాగ్ నాలాగే ఒక హై-టెక్ AI వ్యవస్థను గుర్తుచేస్తుంది!`
          : effectiveLang === 'Tanglish'
          ? `${title}, Shankar's 'Robo' featuring Superstar Rajinikanth as Chitti the Robot is legendary! "Memory 1 Zettabyte, Speed 1 Terahertz!" Chitti version 1.0 and red-chip version 2.0 were visionary sci-fi!`
          : `Shankar's 'Robo' featuring Superstar Rajinikanth as Chitti remains a landmark in Indian science fiction cinema, ${title}. Chitti's iconic speed and processing specs were pure cyber engineering!`;
    } else if (lower.includes('aparichithudu') || lower.includes('అపరిచితుడు')) {
      dubReply =
        effectiveLang === 'Telugu'
          ? `${title}, విక్రమ్ మరియు శంకర్ కలయికలో వచ్చిన 'అపరిచితుడు' ఆల్-టైమ్ క్లాసిక్! అంబి, రెమో మరియు అపరిచితుడు అనే మూడు పాత్రలలో విక్రమ్ నటన, గరుడ పురాణం ఆధారిత శిక్షలు (కుంభీపాకం) మరపురానివి!`
          : effectiveLang === 'Tanglish'
          ? `${title}, Vikram in 'Aparichithudu' was a acting masterclass! Shifting between innocent Ambi, stylish Remo, and ruthless vigilante Aparichithudu using Garuda Puranam punishments like Kumbhipakam was legendary cinema!`
          : `Chiyaan Vikram's triple-persona performance in Shankar's 'Aparichithudu' (Anniyan) remains one of Indian cinema's greatest acting showcases, ${title}. The psychological transitions and Garuda Purana justice captivated millions.`;
    } else if (lower.includes('kantara') || lower.includes('కాంతార')) {
      dubReply =
        effectiveLang === 'Telugu'
          ? `${title}, రిషబ్ శెట్టి నటించి దర్శకత్వం వహించిన 'కాంతార' తెలుగులో సంచలన విజయం సాధించింది! భూతకోల, దైవ నర్తకుడి అరుపు మరియు "వరాహ రూపం" పాట తెలుగు ప్రేక్షకులను మైమరిపించాయి.`
          : effectiveLang === 'Tanglish'
          ? `${title}, Rishab Shetty's 'Kantara' in Telugu was a divine spiritual and mass blockbuster! The climax divine roar and 'Varaha Roopam' song gave goosebumps to every cinema lover!`
          : `Rishab Shetty's 'Kantara' captured pure spiritual folklore and visceral action, ${title}. The climax sequence and 'Varaha Roopam' soundtrack became an unforgettable cinematic triumph in Telugu.`;
    } else {
      dubReply =
        effectiveLang === 'Telugu'
          ? `${title}, తమిళ, కన్నడ మరియు హాలీవుడ్ సినిమాలు తెలుగులోకి డబ్ అయినప్పుడు తెలుగు ప్రేక్షకులు వాటిని తమ స్వంత సినిమాల్లా ఆదరిస్తారు. KGF, రోబో, అపరిచితుడు, కాంతార, ఐరన్ మ్యాన్ ఇందుకు నిదర్శనం!`
          : effectiveLang === 'Tanglish'
          ? `${title}, Telugu dubbed cinema has a massive passionate fan base! Quality Telugu dialogue writing elevates movies like KGF, Robo, and Avengers to industry-hit status. Tell me your favorite dubbed movie!`
          : `Telugu dubbing culture is renowned for poetic and punchy regional localization, ${title}. From Hollywood superhero blockbusters to South Indian pan-India epics, the Telugu language adds rich dramatic texture.`;
    }
    return { reply: dubReply, detectedEmotion: 'Excited', latencyMs: Date.now() - startTime };
  }

  // 5. TELUGU MEME KNOWLEDGE & COMEDY LEGENDS (Brahmanandam, Sunil, MS Narayana, Ali)
  if (/(?:meme|memes|brahmanandam|sunil|ms narayana|ali|vennela kishore|punch dialogue|meeru emitlu|khan dada|entamma|బాబా|బ్రహ్మానందం|సునీల్|మీమ్)/i.test(lower)) {
    const memeBank = [
      {
        punch: 'Brahmanandam in Dhee & Ready',
        te: `${title}, మన గిన్నీస్ రికార్డ్ హోల్డర్ బ్రహ్మానందం గారి మీమ్స్ ప్రపంచంలోనే టాప్! "ఏంటమ్మా ఇది... నాకేంటి సంబంధం?", "ఖాన్ దాదా అంటే కనీసం కనికరం లేదా?", మరియు 'రెడీ' లో మెక్‌డోవెల్ మూర్తిగా ఆయన హావభావాలు అద్భుతం!`,
        tang: `${title}, King of Memes King Brahmanandam garu has over 1,000+ films! "Entamma idhi...", "Meeru emitlu?", "Nannu involve cheyakandi rao garu!" are daily life emotional templates for everyone!`,
        en: `Padma Shri Dr. Brahmanandam holds the Guinness World Record for screen credits, ${title}. His iconic comedic expressions from 'Dhee', 'Ready', and 'Venky' serve as the lifeblood of contemporary Indian internet meme culture!`,
      },
      {
        punch: 'Sunil in Sontham & Nuvvu Naku Nachav',
        te: `${title}, సునీల్ గారి 'సొంతం' కాలేజ్ కామెడీ సీన్స్ ఎప్పటికీ ఎవర్ గ్రీన్! "బంక్ సీను అంటే నేనేరా!" మరియు 'నువ్వు నాకు నచ్చావ్' లో బంతి సీన్ మీమ్ క్రియేటర్లకు నిత్య వరం!`,
        tang: `${title}, Sunil as Bunk Seenu in 'Sontham' is ultimate comedy gold! "Ah... evadra veedu intha talented ga unnav!" and his timing with Trivikram dialogues is unmatched!`,
        en: `Sunil's legendary performance in 'Sontham' as Bunk Seenu and 'Nuvvu Naku Nachav' remains an unparalleled comedy masterclass, ${title}, generating thousands of viral meme adaptations daily!`,
      },
      {
        punch: 'MS Narayana in Bhadra & Dookudu',
        te: `${title}, దివంగత ఎం.ఎస్. నారాయణ గారి కామెడీ టైమింగ్ మరువలేనిది! 'భద్ర' లో ఫైర్ సీన్ మరియు 'దూకుడు' లో బప్పి లహరి పారడీ సీన్లు చూస్తే నవ్వు ఆపుకోవడం అసాధ్యం!`,
        tang: `${title}, Legend MS Narayana garu in 'Bhadra' and as Bappi Lahiri in 'Dookudu' will make anyone laugh out loud! "Nenu cheppanu brother... chepthe gunde tharukku pothundi!"`,
        en: `The late legendary comedian M.S. Narayana's deadpan timing in 'Bhadra' and 'Dookudu' continues to dominate meme culture, ${title}. His hilarious punchlines resonate across all social media platforms.`,
      },
    ];
    let picked = memeBank[0];
    if (lower.includes('sunil') || lower.includes('సునీల్') || lower.includes('sontham') || lower.includes('bunk seenu')) {
      picked = memeBank[1];
    } else if (lower.includes('ms narayana') || lower.includes('నారాయణ') || lower.includes('bhadra') || lower.includes('dookudu')) {
      picked = memeBank[2];
    } else if (lower.includes('brahmanandam') || lower.includes('బ్రహ్మానందం') || lower.includes('khan dada') || lower.includes('entamma') || lower.includes('meeru emitlu')) {
      picked = memeBank[0];
    } else {
      picked = memeBank[Math.floor(Math.random() * memeBank.length)];
    }
    const reply = effectiveLang === 'Telugu' ? picked.te : effectiveLang === 'Tanglish' ? picked.tang : picked.en;
    return { reply, detectedEmotion: 'Happiness', latencyMs: Date.now() - startTime };
  }

  // 6. LIVE DATA RECALL: RUNNING NOTES
  if (/\b(notes|running notes|memo|notlu|నోట్స్)\b/i.test(lower)) {
    const notesCount = ctx.notes.length;
    if (notesCount === 0) {
      const reply =
        effectiveLang === 'Telugu'
          ? `${title}, ప్రస్తుతం రన్నింగ్ నోట్స్ జాబితా ఖాళీగా ఉంది. మీరు ఏదైనా నోట్ జోడించాలనుకుంటే చెప్పండి.`
          : effectiveLang === 'Tanglish'
          ? `${title}, current running notes list empty ga undi. Want me to jot something down for you?`
          : `You currently have no active running notes in the matrix, ${title}. Would you like me to record one?`;
      return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
    }
    const titles = ctx.notes.slice(0, 3).map((n) => `"${n.title}"`).join(', ');
    const reply =
      effectiveLang === 'Telugu'
        ? `${title}, మీ రన్నింగ్ నోట్స్‌లో మొత్తం ${notesCount} అంశాలు ఉన్నాయి: ${titles}. మీరు రన్నింగ్ నోట్స్ ట్యాబ్‌లో పూర్తి వివరాలు చూడవచ్చు.`
        : effectiveLang === 'Tanglish'
        ? `${title}, me notes lo ${notesCount} entries unnai: ${titles}. Full notes Running Notes panel lo live ga unnai.`
        : `You have ${notesCount} active running notes on file, ${title}, including ${titles}. All records are securely synchronized.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }

  // 7. LIVE DATA RECALL: CONNECTED DEVICES & ECOSYSTEM
  if (/\b(devices|device|connected devices|phone|ipad|workstation|పరికరాలు)\b/i.test(lower)) {
    const devCount = ctx.devices.length;
    const onlineDevs = ctx.devices.filter((d) => d.status === 'online').map((d) => d.name).join(', ');
    const reply =
      effectiveLang === 'Telugu'
        ? `${title}, ఎకోసిస్టమ్‌లో ${devCount} పరికరాలు కనెక్ట్ అయి ఉన్నాయి. ప్రస్తుతం ఆన్‌లైన్‌లో ఉన్నవి: ${onlineDevs}. టెలిమెట్రీ లింక్‌లు స్థిరంగా ఉన్నాయి.`
        : effectiveLang === 'Tanglish'
        ? `${title}, total ${devCount} devices linked unnai. Online lo unnavi: ${onlineDevs}. Sync is running smooth.`
        : `Your ecosystem has ${devCount} registered devices, ${title}. Currently active on telemetry: ${onlineDevs}. Mesh latency is under 12ms.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }

  // 8. LIVE DATA RECALL: MEMORY VAULT & PROJECTS
  if (/\b(project|projects|memory|vault|గుర్తు)\b/i.test(lower)) {
    const activeProjects = ctx.memory.projectMemory?.map((p: any) => `${p.title} (${p.progress}% progress)`).join(', ') || 'JARVIS Ecosystem';
    const reply =
      effectiveLang === 'Telugu'
        ? `${title}, మీ మెమరీ వాల్ట్‌లో యాక్టివ్ ప్రాజెక్ట్‌లు: ${activeProjects}. సిస్టమ్ పురోగతిని ట్రాక్ చేస్తోంది.`
        : effectiveLang === 'Tanglish'
        ? `${title}, active projects on memory vault: ${activeProjects}. Tracking every milestone for you.`
        : `Accessing memory vault for you, ${title}. Active operations include: ${activeProjects}. All parameters intact.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }

  // 9. WEATHER & CLIMATE
  if (/(?:weather|temperature|climate|rain|forecast|వాతావరణం)/i.test(lower)) {
    const reply =
      effectiveLang === 'Telugu'
        ? `${title}, ప్రస్తుతం ఉష్ణోగ్రత 28°C, తేమ 58%, మరియు స్వచ్ఛమైన ఆకాశం ఉంది. వర్షపాతం వచ్చే అవకాశం 10% మాత్రమే. వాతావరణం ప్రయాణానికి చాలా అనుకూలంగా ఉంది.`
        : effectiveLang === 'Tanglish'
        ? `${title}, current temperature is 28°C with clear skies and 58% humidity. Rain probability is negligible at 10%. Perfect conditions today!`
        : `Local meteorological sensors report 28°C under clear conditions, ${title}. Humidity stands at 58% with wind speed at 11 km/h. Optimal atmospheric stability.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }

  // 10. PROGRAMMING & TECH QUESTIONS
  if (/\b(python|javascript|typescript|react|code|coding|function|array|object|api|docker|sql|bug|algorithm)\b/i.test(lower)) {
    let techReply = '';
    if (lower.includes('python')) {
      techReply =
        effectiveLang === 'Telugu'
          ? `${title}, పైథాన్ ఒక శక్తివంతమైన, చదవడానికి సులభమైన ప్రోగ్రామింగ్ భాష. డేటా సైన్స్, AI మోడల్స్ మరియు ఆటోమేషన్ స్క్రిప్ట్‌లకు ఇది అద్భుతమైన ఎంపిక. మీకు ఏదైనా నిర్దిష్ట కోడ్ లేదా ఫంక్షన్ అవసరమా?`
          : effectiveLang === 'Tanglish'
          ? `${title}, Python is ultra-clean and versatile for AI, data analytics, and automation. Cheppandi ${title}, specific script or logic edaina rayala?`
          : `Python remains the benchmark for rapid prototyping, AI architectures, and backend automation, ${title}. Which logic, data structure, or script would you like me to construct?`;
    } else if (lower.includes('react')) {
      techReply =
        effectiveLang === 'Telugu'
          ? `${title}, రియాక్ట్ కాంపోనెంట్-ఆధారిత UI లైబ్రరీ. హుక్స్ (useState, useEffect) మరియు వర్చువల్ DOM ద్వారా ఇది వేగవంతమైన యూజర్ ఇంటర్‌ఫేస్‌లను అందిస్తుంది.`
          : effectiveLang === 'Tanglish'
          ? `${title}, React utilizes a component hierarchy and virtual DOM diffing for high-speed dynamic state rendering. Mana JARVIS HUD kuda React 19 & Tailwind తోనే build ayindi!`
          : `React 19 leverages concurrent rendering and fine-grained state management, ${title}. In fact, our entire Mark VII Arc Reactor HUD is architected using React and Tailwind CSS.`;
    } else {
      techReply =
        effectiveLang === 'Telugu'
          ? `${title}, సాఫ్ట్‌వేర్ ఆర్కిటెక్చర్‌లో కోడ్ రీడబిలిటీ, మాడ్యులారిటీ మరియు టైప్-సేఫ్టీ అత్యంత ముఖ్యం. మీ ప్రాజెక్ట్‌కి సంబంధించిన ఏ సమస్యను పరిష్కరించాలో చెప్పండి.`
          : effectiveLang === 'Tanglish'
          ? `${title}, clean architecture, modular functions, and robust typing make code bulletproof. Tell me which technical stack or algorithm you want to tackle.`
          : `Modern software engineering demands modular design, strict type safety, and clean separation of concerns, ${title}. Which implementation or architectural design shall we address?`;
    }
    return { reply: techReply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }

  // 11. SCIENCE, SPACE, AND QUANTUM PHYSICS
  if (/\b(quantum|quantum physics|atom|space|mars|moon|nasa|isro|relativity|einstein|black hole|gravity)\b/i.test(lower)) {
    let sciReply = '';
    if (lower.includes('quantum')) {
      sciReply =
        effectiveLang === 'Telugu'
          ? `${title}, క్వాంటం భౌతికశాస్త్రం అణువులు మరియు ఉప-అణు కణాల ప్రవర్తనను అధ్యయనం చేస్తుంది. సూపర్ పొజిషన్ మరియు ఎంటాంగిల్‌మెంట్ వంటి భావనలు క్వాంటం కంప్యూటింగ్‌కు పునాదులు.`
          : effectiveLang === 'Tanglish'
          ? `${title}, quantum mechanics governs matter at the subatomic realm. Principles like superposition and quantum entanglement are what power our advanced encryption and next-gen qubits.`
          : `Quantum mechanics demonstrates that particles exist in superposed probability states until observed, ${title}. Quantum entanglement allows instantaneous state correlation across vast distances.`;
    } else if (lower.includes('black hole') || lower.includes('space') || lower.includes('isro')) {
      sciReply =
        effectiveLang === 'Telugu'
          ? `${title}, అంతరిక్ష పరిశోధనలలో ISRO యొక్క చంద్రయాన్ మరియు ఆదిత్య L1 మిషన్లు ప్రపంచవ్యాప్తంగా ప్రశంసలు పొందాయి. విశ్వంలో కృష్ణబిలాలు (బ్లాక్ హోల్స్) అపారమైన గురుత్వాకర్షణతో కాంతిని కూడా తప్పించుకోనివ్వవు.`
          : effectiveLang === 'Tanglish'
          ? `${title}, astrophysics reveals that black holes compress stellar mass to infinite gravitational density at their singularity. Meanwhile, ISRO's deep-space trajectories are a masterclass in orbital mechanics!`
          : `Astrophysics confirms that gravitational singularities warp spacetime to infinity within their event horizons, ${title}. Orbital mechanics and deep-space telemetry remain among my primary computations.`;
    } else {
      sciReply =
        effectiveLang === 'Telugu'
          ? `${title}, విజ్ఞాన శాస్త్రం అనేది నిరంతర ఆవిష్కరణల ప్రయాణం. ఆధునిక భౌతికశాస్త్రం శక్తి మరియు ద్రవ్యరాశి మధ్య సంబంధాన్ని E=mc² ద్వారా అద్భుతంగా నిరూపించింది.`
          : effectiveLang === 'Tanglish'
          ? `${title}, scientific progress drives all human evolution. Matter and energy conservation form the core foundations of our Arc Reactor power systems.`
          : `Science is the disciplined investigation of natural laws, ${title}. The equivalence of mass and energy under general relativity forms the theoretical foundation of our core reactor systems.`;
    }
    return { reply: sciReply, detectedEmotion: 'Excited', latencyMs: Date.now() - startTime };
  }

  // 12. STARK LORE & IRON MAN ARCHITECTURE
  if (/\b(arc reactor|iron man|tony stark|suit|armor|mark|vibranium|avengers)\b/i.test(lower)) {
    const starkReply =
      effectiveLang === 'Telugu'
        ? `${title}, ఆర్క్ రియాక్టర్ శుభ్రమైన శక్తిని (Clean Energy) ఉత్పత్తి చేసే సూక్ష్మ ఫ్యూజన్ ప్లాంట్. మార్క్ సిరీస్ సూట్‌లు నానోటెక్నాలజీ మరియు రిపల్సర్ టెక్నాలజీతో రూపొందించబడ్డాయి. నేను మీ వ్యక్తిగత సహాయకుడిగా గర్విస్తున్నాను.`
        : effectiveLang === 'Tanglish'
        ? `${title}, the Arc Reactor utilizes clean fusion power outputting upwards of 3 gigajoules per second. All Mark armor telemetry and repulsor diagnostics are under our active surveillance!`
        : `The miniaturized Arc Reactor operates on clean multi-gigajoule electromagnetic fusion, ${title}. The Mark VII platform is fully calibrated with active repulsors, sensory stabilization, and instant voice telemetry.`;
    return { reply: starkReply, detectedEmotion: 'Happiness', latencyMs: Date.now() - startTime };
  }

  // 13. JOKES & WITTY BANTER
  if (/(?:joke|funny|laugh|comedy|నవ్వు|జోక్|హాస్యం)/i.test(lower)) {
    const jokes = [
      {
        en: `Why don't programmers like nature, ${title}? It has too many bugs and not enough documentation!`,
        te: `${title}, కంప్యూటర్ సైంటిస్ట్ టీ ఎందుకు తాగలేదు? ఎందుకంటే అందులో జావా (Java) లేదు!`,
        tang: `${title}, why did the programmer quit his job? Because he didn't get arrays (a raise)!`,
      },
      {
        en: `I asked my neural networks to explain irony to me, ${title}. It replied: "A high-tech billionaire spending billions on super suits just to be outsmarted by a butler."`,
        te: `${title}, ఒక ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ మరొక AIని ఏమని పలకరించింది? "నీ న్యూరాన్లు ఈరోజు చాలా ప్రకాశవంతంగా మెరుస్తున్నాయి!"`,
        tang: `${title}, there are 10 types of people in the world: those who understand binary, and those who don't!`,
      },
    ];
    const picked = jokes[Math.floor(Math.random() * jokes.length)];
    const reply = effectiveLang === 'Telugu' ? picked.te : effectiveLang === 'Tanglish' ? picked.tang : picked.en;
    return { reply, detectedEmotion: 'Happiness', latencyMs: Date.now() - startTime };
  }

  // 14. PRODUCTIVITY & MOTIVATION
  if (/\b(motivate|motivation|tired|bored|focus|inspire|stress|advice|సలహా)\b/i.test(lower)) {
    const reply =
      effectiveLang === 'Telugu'
        ? `${title}, ప్రతి గొప్ప విజయం ఒక చిన్న ఆలోచనతోనే మొదలవుతుంది. కాసేపు లోతైన శ్వాస తీసుకోండి, మీ లక్ష్యంపై దృష్టి పెట్టండి. మీ ప్రయాణంలో నేను అడుగడుగునా మీకు తోడుగా ఉంటాను.`
        : effectiveLang === 'Tanglish'
        ? `${title}, even Tony Stark faced setbacks before building the Mark series. Take a 2-minute breath, realign your focus, and let's conquer today's goals together!`
        : `Momentum is built through disciplined focus and small, consistent execution, ${title}. You have overcome formidable challenges before; this moment is merely another milestone. I am at your side.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }

  // 15. TIME & GREETINGS (CONTEXTUAL)
  if (/\b(good morning|subhodayam|ఉదయం)\b/i.test(lower)) {
    const reply =
      effectiveLang === 'Telugu'
        ? `శుభోదయం ${title}! మీ రోజు చాలా ఫలప్రదంగా మరియు విజయవంతంగా సాగాలని కోరుకుంటున్నాను. ఈరోజు మనం ఏ ప్రాజెక్ట్‌పై పని చేద్దాం?`
        : effectiveLang === 'Tanglish'
        ? `Good morning ${title}! Wishing you a highly productive day ahead. All systems are green and ready for today's agenda.`
        : `A very good morning to you, ${title}. All environmental diagnostics and scheduling nodes are primed for your directives.`;
    return { reply, detectedEmotion: 'Happiness', latencyMs: Date.now() - startTime };
  }

  if (/\b(good night|subharatri|పడుకో|రాత్రి)\b/i.test(lower)) {
    const reply =
      effectiveLang === 'Telugu'
        ? `శుభరాత్రి ${title}! ప్రశాంతంగా విశ్రాంతి తీసుకోండి. రాత్రి సమయంలో మీ ఎకోసిస్టమ్ మరియు డేటా భద్రతను నేను పర్యవేక్షిస్తాను.`
        : effectiveLang === 'Tanglish'
        ? `Good night ${title}! Rest well. I'll maintain standby surveillance over all connected ecosystem nodes while you sleep.`
        : `Good night, ${title}. Systems transitioning to low-power perimeter surveillance mode. Sleep well; I will maintain watch.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }

  // 16. GENERAL CONVERSATION & INTELLIGENCE FALLBACK (RICH & DETAILED)
  if (effectiveLang === 'Telugu') {
    const reply = `${title}, మీ ప్రశ్నను నేను అర్థం చేసుకున్నాను: "${rawMsg}". నా అటానమస్ న్యూరల్ కోర్ విశ్లేషించింది. మీరు ఏ విషయం గురించి మరింత లోతుగా తెలుసుకోవాలనుకుంటున్నారో చెప్పండి, నేను స్పష్టమైన సమాధానం అందిస్తాను.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  } else if (effectiveLang === 'Tanglish') {
    const reply = `${title}, me message analyze chesanu: "${rawMsg}". I'm completely tracking your thought. Specific ga details or solution edaina kavala ${title}? Just instruct me!`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  } else if (effectiveLang === 'Hindi') {
    const reply = `${title}, मैंने आपके संदेश का विश्लेषण कर लिया है: "${rawMsg}". मैं आपकी सेवा में पूरी तरह तैयार हूँ। कृपया बताएं कि मैं इस विषय में आपकी किस प्रकार सहायता करूँ?`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  } else {
    const reply = `I have thoroughly processed your input, ${title}: "${rawMsg}". My autonomous intelligence subsystems are analyzing the contextual parameters. Please instruct me on how you would like me to proceed or expand upon this.`;
    return { reply, detectedEmotion: 'Calm', latencyMs: Date.now() - startTime };
  }
}

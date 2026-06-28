import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { CivicIssue, UserProfile, Comment, StatusTimelineEvent, AIAgentAnalysis, IssueCategory, IssueSeverity, IssueStatus } from './src/types';
import { SEED_ISSUES, DEMO_USERS, getInitialImpactStats } from './src/seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));

// Local JSON file path for database persistence
const DATA_FILE = path.join(__dirname, 'data.json');

// Memory storage cache
let db: {
  issues: CivicIssue[];
  users: UserProfile[];
} = {
  issues: [],
  users: []
};

// Ensure data is loaded/initialized
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(content);
      console.log(`Loaded ${db.issues.length} issues and ${db.users.length} users from data.json`);
    } else {
      db = {
        issues: SEED_ISSUES,
        users: DEMO_USERS
      };
      saveData();
      console.log('Initialized data.json with seed data');
    }
  } catch (error) {
    console.error('Error loading data.json, falling back to seed data:', error);
    db = {
      issues: SEED_ISSUES,
      users: DEMO_USERS
    };
  }

  // Ensure Piyush Admin always exists with exact requested details
  const adminEmail = 'piyush.admin@gmail.com';
  let adminUser = db.users.find(u => u.email === adminEmail || u.uid === 'user_admin');
  if (!adminUser) {
    adminUser = {
      uid: 'user_admin',
      name: 'Piyush (Admin)',
      email: adminEmail,
      password: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      points: 1000,
      badges: [
        { id: 'b4', title: 'Municipal Admin', description: 'Has system administration rights over Nagar Nigam logs', icon: 'Shield', unlockedAt: '2026-01-01T00:00:00Z', color: 'from-purple-600 to-indigo-700' }
      ],
      reportedCount: 0,
      verifiedCount: 0,
      resolvedCount: 0,
      role: 'admin',
      verificationStatus: 'verified',
      accessLevel: 'level_3'
    };
    db.users.push(adminUser);
    saveData();
  } else {
    adminUser.uid = 'user_admin';
    adminUser.name = 'Piyush (Admin)';
    adminUser.email = adminEmail;
    adminUser.password = 'Admin';
    adminUser.role = 'admin';
    adminUser.verificationStatus = 'verified';
    adminUser.accessLevel = 'level_3';
    saveData();
  }

  // Synchronize db.users with DEMO_USERS to make sure any new users are added
  let updated = false;
  DEMO_USERS.forEach(demoUser => {
    if (!db.users.some(u => u.uid === demoUser.uid || u.email === demoUser.email)) {
      db.users.push(demoUser);
      updated = true;
    }
  });
  if (updated) {
    saveData();
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving data.json:', error);
  }
}

loadData();

// Initialize GoogleGenAI server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Successfully initialized Gemini API client with GEMINI_API_KEY');
  } catch (err) {
    console.error('Failed to initialize Gemini API client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY found or default placeholder detected. Using intelligent mock pipelines.');
}

// Distance calculation helper (Haversine formula in meters)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

// Helper to resolve an image or video URL or data URI to base64 format for Gemini
async function resolveMediaInput(input: string, defaultMimeType: string = 'image/jpeg'): Promise<{ base64Data: string; mimeType: string }> {
  if (!input) {
    return { base64Data: '', mimeType: defaultMimeType };
  }

  // Handle standard Data URIs (e.g. data:image/png;base64,iVBOR...)
  if (input.startsWith('data:')) {
    const parts = input.split(';base64,');
    const mime = parts[0].split(':')[1] || defaultMimeType;
    const base64 = parts[1] || '';
    return { base64Data: base64, mimeType: mime };
  }

  // Handle remote HTTP/HTTPS URLs (e.g. Unsplash presets)
  if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('//')) {
    const url = input.startsWith('//') ? `https:${input}` : input;
    try {
      console.log(`Resolving remote media URL for Gemini pipeline: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote media (Status: ${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mime = response.headers.get('content-type') || defaultMimeType;
      return {
        base64Data: buffer.toString('base64'),
        mimeType: mime
      };
    } catch (error) {
      console.error(`Error resolving remote media URL ${url}:`, error);
      throw error;
    }
  }

  // Handle relative server assets
  if (input.startsWith('/')) {
    try {
      const publicPath = path.join(process.cwd(), 'public', input);
      if (fs.existsSync(publicPath)) {
        const buffer = fs.readFileSync(publicPath);
        const ext = path.extname(input).toLowerCase();
        let mime = defaultMimeType;
        if (ext === '.png') mime = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.gif') mime = 'image/gif';
        else if (ext === '.webp') mime = 'image/webp';
        return {
          base64Data: buffer.toString('base64'),
          mimeType: mime
        };
      }
    } catch (e) {
      console.error(`Error resolving relative media path ${input}:`, e);
    }
  }

  // Fallback: assume input is already raw base64 data
  return { base64Data: input, mimeType: defaultMimeType };
}

// -------------------------------------------------------------
// Gemini Multi-Agent AI Pipeline
// -------------------------------------------------------------
async function runAIPipeline(
  imageBuffer: string, // base64 string or URL
  mimeType: string,
  userDescription: string,
  latitude: number,
  longitude: number,
  ward: string
): Promise<AIAgentAnalysis> {
  const timestamp = new Date().toISOString();

  // Determine if we can run the real Gemini pipeline
  if (aiClient) {
    try {
      console.log('Running real Multi-Agent Gemini pipeline...');

      // Step 1: Vision Intake Agent
      // We pass the image and user description to analyze category, severity, confidence, reasoning
      const resolved = await resolveMediaInput(imageBuffer, mimeType);
      const imagePart = {
        inlineData: {
          mimeType: resolved.mimeType,
          data: resolved.base64Data
        }
      };

      const visionPrompt = `
        You are the Vision Intake Agent for the My Gwalior City App, a citizen reporting platform for Gwalior, MP, India.
        Analyze the uploaded image of a civic issue alongside this citizen description: "${userDescription || 'No description provided.'}"
        
        Classify the issue into one of these exact categories: 'pothole', 'water_leakage', 'streetlight', 'garbage', 'road_damage', 'other'.
        Estimate the severity of the issue as one of: 'low', 'medium', 'high', 'critical'.
        Provide a confidence score between 0.0 and 1.0.
        Write a concise, highly professional 2-3 sentence analytical reasoning explaining the visual cues (size, location, hazard risk) that informed your classification.
        
        Return ONLY a JSON object matching this schema:
        {
          "category": "pothole" | "water_leakage" | "streetlight" | "garbage" | "road_damage" | "other",
          "severity": "low" | "medium" | "high" | "critical",
          "confidence": number,
          "reasoning": "string"
        }
      `;

      const visionResponse = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts: [imagePart, { text: visionPrompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              severity: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ['category', 'severity', 'confidence', 'reasoning']
          }
        }
      });

      const visionResult = JSON.parse(visionResponse.text || '{}');
      const category = (visionResult.category || 'other') as IssueCategory;
      const severity = (visionResult.severity || 'medium') as IssueSeverity;
      const confidence = visionResult.confidence || 0.85;
      const visionReasoning = visionResult.reasoning || 'Visual analysis completed successfully.';

      // Step 2: Duplicate-Detection Agent
      // Find nearby open issues within 150m of the same category
      const nearbyIssues = db.issues.filter(
        (issue) =>
          issue.status !== 'resolved' &&
          issue.category === category &&
          getDistanceMeters(latitude, longitude, issue.latitude, issue.longitude) <= 150
      );

      let duplicateCheck = {
        isDuplicate: false,
        similarIssueId: null as string | null,
        explanation: 'No overlapping reports found within 150 meters. This constitutes a unique entry.',
        nearbyCount: nearbyIssues.length
      };

      if (nearbyIssues.length > 0) {
        // Run Gemini to verify if it is indeed a duplicate or a separate issue
        const similarIssue = nearbyIssues[0];
        const duplicatePrompt = `
          Compare this new citizen issue:
          - Category: ${category}
          - New description: "${userDescription}"
          
          With an existing nearby open issue:
          - Existing Title: "${similarIssue.title}"
          - Existing Description: "${similarIssue.description}"
          
          Are they likely reporting the exact same physical issue or localized incident (e.g. the same broken pavement segment, same water burst, or same pile of trash)?
          
          Return ONLY a JSON object matching this schema:
          {
            "isDuplicate": boolean,
            "explanation": "Brief explanation (1-2 sentences) of why they are or are not duplicates"
          }
        `;

        const duplicateResponse = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: duplicatePrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isDuplicate: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING }
              },
              required: ['isDuplicate', 'explanation']
            }
          }
        });

        const dupResult = JSON.parse(duplicateResponse.text || '{}');
        duplicateCheck = {
          isDuplicate: !!dupResult.isDuplicate,
          similarIssueId: dupResult.isDuplicate ? similarIssue.id : null,
          explanation: dupResult.explanation || 'Analyzed proximity and category descriptions.',
          nearbyCount: nearbyIssues.length
        };
      }

      // Step 3: Priority-Scoring Agent
      // Combines severity, proximity to key structures, and user confirmations
      const priorityPrompt = `
        Calculate a final numeric priority score (1 to 100) for a civic issue report with:
        - Category: ${category}
        - Severity: ${severity}
        - Ward Name: ${ward}
        - User Description: "${userDescription}"
        
        Rules:
        - Base scores: critical=80, high=60, medium=40, low=20.
        - Add bonus points (+5 to +15) if description indicates proximity to sensitive locations like schools, hospitals, transit hub, main road, or if active hazards like electricity/flooding are present.
        - Provide an analytical reasoning of how the final score was determined.
        
        Return ONLY a JSON object matching this schema:
        {
          "baseScore": number,
          "bonusPoints": number,
          "finalScore": number,
          "reasoning": "string"
        }
      `;

      const priorityResponse = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: priorityPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              baseScore: { type: Type.NUMBER },
              bonusPoints: { type: Type.NUMBER },
              finalScore: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ['baseScore', 'bonusPoints', 'finalScore', 'reasoning']
          }
        }
      });

      const priorityResult = JSON.parse(priorityResponse.text || '{}');

      // Step 4: Routing & Drafting Agent
      // Auto-drafts formal complaint letter
      const routingPrompt = `
        Identify the appropriate local civic authority department and auto-draft a professional, formal complaint letter regarding a "${category}" issue of "${severity}" severity at coordinates (${latitude}, ${longitude}) in ward "${ward}".
        Use a respectful, authoritative municipal reporting tone.
        
        Return ONLY a JSON object matching this schema:
        {
          "department": "Name of official municipal board or department",
          "contactInfo": "Mock support email and emergency hotline extension",
          "draftedLetter": "Full drafted letter text"
        }
      `;

      const routingResponse = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: routingPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              department: { type: Type.STRING },
              contactInfo: { type: Type.STRING },
              draftedLetter: { type: Type.STRING }
            },
            required: ['department', 'contactInfo', 'draftedLetter']
          }
        }
      });

      const routingResult = JSON.parse(routingResponse.text || '{}');

      // Step 5: Predictive Insights Agent
      // Analyzes local history to flag patterns
      const historyPrompt = `
        Act as the Predictive Insights Agent. Review ward history for "${ward}" ward.
        We have seen multiple reports of type "${category}" in this region recently.
        Provide a predictive warning level ('low', 'medium', 'high'), describe any systemic pattern (e.g. weather impacts, aging grid, seasonal issues), and give a clear preventive infrastructure recommendation.
        
        Return ONLY a JSON object matching this schema:
        {
          "historicalPattern": "Description of systemic or historical pattern in 1-2 sentences",
          "recommendation": "Preventive recommendation in 1 sentence",
          "warningLevel": "low" | "medium" | "high"
        }
      `;

      const predictiveResponse = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: historyPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              historicalPattern: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              warningLevel: { type: Type.STRING }
            },
            required: ['historicalPattern', 'recommendation', 'warningLevel']
          }
        }
      });

      const predictiveResult = JSON.parse(predictiveResponse.text || '{}');

      return {
        visionIntake: {
          category,
          severity,
          confidence,
          reasoning: visionReasoning
        },
        duplicateCheck,
        priorityScoring: {
          baseScore: priorityResult.baseScore || 50,
          bonusPoints: priorityResult.bonusPoints || 0,
          finalScore: priorityResult.finalScore || 50,
          reasoning: priorityResult.reasoning || 'Priority scored based on standard municipal guidelines.'
        },
        routingAndDrafting: {
          department: routingResult.department || 'General Public Works Department',
          contactInfo: routingResult.contactInfo || 'pwd-complaints@citygov.metro | Ext 101',
          draftedLetter: routingResult.draftedLetter || 'Dear Department, \n\nWe would like to draw your attention to a civic hazard...'
        },
        predictiveInsights: {
          historicalPattern: predictiveResult.historicalPattern || 'Normal historical pattern of maintenance intervals.',
          recommendation: predictiveResult.recommendation || 'Regular inspection intervals advised.',
          warningLevel: (predictiveResult.warningLevel || 'low') as 'low' | 'medium' | 'high'
        },
        timestamp
      };

    } catch (err) {
      console.error('Error running real Gemini pipeline, falling back to mock pipeline:', err);
    }
  }

  // --- Mock/Simulated Multi-Agent AI Pipeline Fallback ---
  console.log('Running simulated Gemini multi-agent pipeline...');
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate thinking latency

  // Category determination
  let detectedCategory: IssueCategory = 'other';
  const descLower = userDescription.toLowerCase();
  if (descLower.includes('pothole') || descLower.includes('road') || descLower.includes('crater') || descLower.includes('asphalt')) {
    detectedCategory = 'pothole';
  } else if (descLower.includes('leak') || descLower.includes('water') || descLower.includes('burst') || descLower.includes('pipe') || descLower.includes('gush')) {
    detectedCategory = 'water_leakage';
  } else if (descLower.includes('light') || descLower.includes('dark') || descLower.includes('bulb') || descLower.includes('streetlamp') || descLower.includes('electric')) {
    detectedCategory = 'streetlight';
  } else if (descLower.includes('garbage') || descLower.includes('trash') || descLower.includes('waste') || descLower.includes('bin') || descLower.includes('smell')) {
    detectedCategory = 'garbage';
  } else if (descLower.includes('sidewalk') || descLower.includes('slab') || descLower.includes('crack') || descLower.includes('pavement')) {
    detectedCategory = 'road_damage';
  }

  // Severity determination
  let detectedSeverity: IssueSeverity = 'medium';
  if (descLower.includes('critical') || descLower.includes('danger') || descLower.includes('lethal') || descLower.includes('emergency') || descLower.includes('exposed wire')) {
    detectedSeverity = 'critical';
  } else if (descLower.includes('high') || descLower.includes('severe') || descLower.includes('flood') || descLower.includes('broken')) {
    detectedSeverity = 'high';
  } else if (descLower.includes('low') || descLower.includes('minor') || descLower.includes('flicker')) {
    detectedSeverity = 'low';
  }

  // Mock Step 1: Vision Intake
  const visionIntake = {
    category: detectedCategory,
    severity: detectedSeverity,
    confidence: 0.92,
    reasoning: `Visual signatures in the photo match the '${detectedCategory}' profile. Surface geometry indicates structural impairment corresponding to a ${detectedSeverity} hazard risk index in public access boundaries.`
  };

  // Mock Step 2: Duplicate Check
  const nearbyIssues = db.issues.filter(
    (issue) =>
      issue.status !== 'resolved' &&
      issue.category === detectedCategory &&
      getDistanceMeters(latitude, longitude, issue.latitude, issue.longitude) <= 150
  );

  const isDuplicate = nearbyIssues.length > 0;
  const duplicateCheck = {
    isDuplicate,
    similarIssueId: isDuplicate ? nearbyIssues[0].id : null,
    explanation: isDuplicate
      ? `Detected active duplicate report #${nearbyIssues[0].id.substring(6)} within ${Math.round(getDistanceMeters(latitude, longitude, nearbyIssues[0].latitude, nearbyIssues[0].longitude))} meters. Consolidating citizen feeds.`
      : 'No active matching issues discovered within 150 meters. Registered as a unique localized issue thread.',
    nearbyCount: nearbyIssues.length
  };

  // Mock Step 3: Priority Scoring
  let baseScore = 40;
  if (detectedSeverity === 'critical') baseScore = 85;
  else if (detectedSeverity === 'high') baseScore = 65;
  else if (detectedSeverity === 'low') baseScore = 20;

  let bonusPoints = 0;
  if (descLower.includes('school') || descLower.includes('hospital') || descLower.includes('metro') || descLower.includes('market')) {
    bonusPoints = 12;
  } else if (isDuplicate) {
    bonusPoints = 6;
  }
  const finalScore = Math.min(100, baseScore + bonusPoints);

  const priorityScoring = {
    baseScore,
    bonusPoints,
    finalScore,
    reasoning: `Base severity weight of ${baseScore} adjusted by ${bonusPoints} bonus points due to localized hazard modifiers, demographic sensitivity markers, and replication indicators.`
  };

  // Mock Step 4: Routing & Drafting
  let department = 'Municipal Corporation Operations Board';
  let contactInfo = 'ops-hotline@citygov.metro | Tel: Ext 100';
  let letters: Record<IssueCategory, string> = {
    pothole: 'FORMAL COMPLAINT\nTO: Gwalior Nagar Nigam PWD Division\nSUBJECT: Urgent Repair - Street Pothole Hazard\n\nDear Engineer,\n\nWe are formally forwarding a geolocated citizen report concerning a severe asphalt fracture. This creates a puncture threat and collision risk for active transit.\n\nRespectfully,\nMy Gwalior Automated Dispatch',
    water_leakage: 'URGENT UTILITY COMPLAINT\nTO: Gwalior Nagar Nigam Jal Board\nSUBJECT: Active Water Main Leakage Emergency\n\nDear Officer,\n\nAn active high-pressure pipe breach has been logged and confirmed by community members in Gwalior. Sub-base structural washout and municipal utility waste are actively occurring. Direct intervention requested.\n\nRespectfully,\nMy Gwalior Water Services Dispatch',
    streetlight: 'MAINTENANCE SERVICE REQUEST\nTO: Gwalior Nagar Nigam Electrical Department\nSUBJECT: Broken / Dark Zone Streetlight replacement\n\nDear Officer,\n\nPedestrians have flagged a lighting failure creating safety and visibility dark-zones. Standard luminaire replacement is requested.\n\nSincerely,\nMy Gwalior Lighting Dispatch',
    garbage: 'SANITATION ESCALATION ORDER\nTO: Gwalior Swachhata Division\nSUBJECT: Commercial Waste Overflows\n\nDear Officer,\n\nUncollected solid waste has overflowed standard receptacles. High potential for vector breeding and health safety issues in Gwalior. Requesting a mechanical cleanup crew.\n\nSincerely,\nMy Gwalior Sanitation Dispatch',
    road_damage: 'CIVIC STRUCTURAL WORK ORDER\nTO: Public Works Department (PWD) - Gwalior\nSUBJECT: Buckled Pavement Slabs Repair\n\nDear Engineer,\n\nSidewalk fracturing has created significant tripping hazards near public access bounds in Gwalior. We advise structural recasting at your earliest convenience.\n\nRespectfully,\nMy Gwalior PWD Dispatch',
    other: 'GENERAL CORRESPONDENCE\nTO: Gwalior Nagar Nigam Operations Bureau\nSUBJECT: Community Welfare Concern\n\nDear Administrator,\n\nA community-flagged maintenance concern has been verified and escalated. Please dispatch an inspection team.\n\nRespectfully,\nMy Gwalior Dispatch'
  };

  const routingAndDrafting = {
    department: detectedCategory === 'pothole' || detectedCategory === 'road_damage'
      ? 'Municipal Roads and Highways Division'
      : detectedCategory === 'water_leakage'
      ? 'Water Supply & Sewerage Board'
      : detectedCategory === 'streetlight'
      ? 'Public Lighting & Electricity Commission'
      : detectedCategory === 'garbage'
      ? 'Environmental Sanitation & Solid Waste Dept'
      : 'Public Works Department (PWD)',
    contactInfo: detectedCategory === 'pothole'
      ? 'roads-maintenance@citygov.metro | Ext 402'
      : detectedCategory === 'water_leakage'
      ? 'waterboard-leakage@citygov.metro | Tel: 1916'
      : detectedCategory === 'streetlight'
      ? 'lighting-dispatch@citygov.metro | Ext 105'
      : detectedCategory === 'garbage'
      ? 'sanitation-cleanup@citygov.metro | Toll-Free: 1800-440-22'
      : 'pwd-civil@citygov.metro | Ext 108',
    draftedLetter: letters[detectedCategory] || letters.other
  };

  // Mock Step 5: Predictive Insights
  const predictiveInsights = {
    historicalPattern: `Historical patterns in '${ward}' show a 15% increase in seasonal '${detectedCategory}' occurrences under high environmental fluctuation parameters.`,
    recommendation: `Schedule preventive structural reinforcement and install protective grids to mitigate seasonal stress cycles before winter begins.`,
    warningLevel: (detectedSeverity === 'critical' || detectedSeverity === 'high' ? 'high' : 'medium') as 'low' | 'medium' | 'high'
  };

  return {
    visionIntake,
    duplicateCheck,
    priorityScoring,
    routingAndDrafting,
    predictiveInsights,
    timestamp
  };
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Get all issues
app.get('/api/issues', (req, res) => {
  res.json(db.issues);
});

// 2. Submit new issue (runs AI Pipeline)
app.post('/api/issues', async (req, res) => {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      image, // Base64
      reporterId,
      reporterName,
      reporterAvatar,
      voiceNoteUrl
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: 'Title and visual evidence (image) are required.' });
    }

    // Determine ward based on mock coordinates/location
    const wards = ['Downtown Core', 'Preston Heights', 'Eastside Waterfront', 'South Greenwood', 'Oakridge District'];
    const selectedWard = wards[Math.abs(Math.round(latitude * 1000 + longitude * 1000)) % wards.length];

    // Execute Multi-Step AI Pipeline
    const mimeType = image.split(';')[0]?.split(':')[1] || 'image/jpeg';
    const aiAnalysis = await runAIPipeline(image, mimeType, description, latitude, longitude, selectedWard);

    // Get final details from AI analysis
    const category = aiAnalysis.visionIntake.category;
    const severity = aiAnalysis.visionIntake.severity;
    const priorityScore = aiAnalysis.priorityScoring.finalScore;

    // Create unique ID
    const newId = `issue_${Date.now()}`;

    // Create Initial status timeline event
    const initialTimeline: StatusTimelineEvent[] = [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Citizen report registered with coordinates and photograph.',
        timestamp: new Date().toISOString(),
        updatedBy: reporterName || 'Anonymous Citizen'
      }
    ];

    // Create new issue object
    const newIssue: CivicIssue = {
      id: newId,
      title,
      description: description || '',
      category,
      severity,
      status: 'reported',
      latitude: parseFloat(latitude) || 37.7749,
      longitude: parseFloat(longitude) || -122.4194,
      ward: selectedWard,
      reporterName: reporterName || 'Anonymous Citizen',
      reporterAvatar: reporterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      reporterId: reporterId || 'anonymous_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      image,
      voiceNoteUrl: voiceNoteUrl || null,
      confirmations: 1,
      confirmedBy: [reporterId || 'anonymous_user'],
      priorityScore,
      timeline: initialTimeline,
      aiAnalysis,
      comments: []
    };

    // Check if the AI pipeline identified this as a duplicate of an existing open issue
    if (aiAnalysis.duplicateCheck.isDuplicate && aiAnalysis.duplicateCheck.similarIssueId) {
      const parentIssue = db.issues.find(i => i.id === aiAnalysis.duplicateCheck.similarIssueId);
      if (parentIssue) {
        // Merge! Increment confirmations
        parentIssue.confirmations += 1;
        if (!parentIssue.confirmedBy.includes(reporterId)) {
          parentIssue.confirmedBy.push(reporterId);
        }
        // Update timeline to show merge activity
        parentIssue.timeline.push({
          status: parentIssue.status,
          title: 'Duplicate Merged',
          description: `Another citizen (${reporterName || 'Anonymous'}) submitted a duplicate report. Merged into this tracking thread.`,
          timestamp: new Date().toISOString(),
          updatedBy: 'My Gwalior AI Duplicate Agent'
        });
        parentIssue.priorityScore = Math.min(100, parentIssue.priorityScore + 4); // escalate priority slightly
        parentIssue.updatedAt = new Date().toISOString();

        saveData();
        return res.json({
          merged: true,
          parentIssueId: parentIssue.id,
          message: 'An active duplicate issue was detected nearby. Your report has been merged into the tracking timeline for that issue.',
          issue: parentIssue
        });
      }
    }

    // Otherwise, add as a new issue!
    db.issues.unshift(newIssue);

    // Award Points & Badge to user
    const user = db.users.find(u => u.uid === reporterId);
    if (user) {
      user.points += 25; // 25 points for reporting
      user.reportedCount += 1;

      // Check for badges
      if (user.reportedCount >= 3 && !user.badges.some(b => b.id === 'b1')) {
        user.badges.push({
          id: 'b1',
          title: 'Pothole Hunter',
          description: 'Reported 3 or more road hazards',
          icon: 'Hammer',
          unlockedAt: new Date().toISOString(),
          color: 'from-amber-400 to-orange-500'
        });
      }
      if (user.reportedCount >= 1 && !user.badges.some(b => b.id === 'b3')) {
        user.badges.push({
          id: 'b3',
          title: 'Civic Steward',
          description: 'First issue reported successfully',
          icon: 'Award',
          unlockedAt: new Date().toISOString(),
          color: 'from-green-400 to-emerald-600'
        });
      }
    }

    saveData();
    res.json({
      merged: false,
      issue: newIssue
    });
  } catch (error: any) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ error: error.message || 'Server error processing report.' });
  }
});

// 3. Confirm / Upvote issue
app.post('/api/issues/:id/confirm', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const issue = db.issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  if (issue.confirmedBy.includes(userId)) {
    // Revoke/Undo upvote
    issue.confirmations = Math.max(0, issue.confirmations - 1);
    issue.confirmedBy = issue.confirmedBy.filter(uid => uid !== userId);

    // Deduct points from user
    const user = db.users.find(u => u.uid === userId);
    if (user) {
      user.points = Math.max(0, user.points - 10);
      user.verifiedCount = Math.max(0, user.verifiedCount - 1);
    }
  } else {
    // Add confirmation
    issue.confirmations += 1;
    issue.confirmedBy.push(userId);

    // Add timeline event if it hits threshold
    if (issue.confirmations === 10 && !issue.timeline.some(t => t.title === 'Community Verified')) {
      issue.timeline.push({
        status: 'verified',
        title: 'Community Verified',
        description: 'Validated by 10+ nearby citizens. Priority escalated.',
        timestamp: new Date().toISOString(),
        updatedBy: 'My Gwalior System'
      });
      issue.status = 'verified';
      issue.priorityScore = Math.min(100, issue.priorityScore + 10);
    }

    // Award points to user
    const user = db.users.find(u => u.uid === userId);
    if (user) {
      user.points += 10; // 10 points for verifying
      user.verifiedCount += 1;

      // Check badges
      if (user.verifiedCount >= 10 && !user.badges.some(b => b.id === 'b2')) {
        user.badges.push({
          id: 'b2',
          title: 'Neighborhood Guardian',
          description: 'Verified 10 local issues',
          icon: 'Shield',
          unlockedAt: new Date().toISOString(),
          color: 'from-blue-400 to-indigo-600'
        });
      }
    }
  }

  issue.updatedAt = new Date().toISOString();
  saveData();
  res.json(issue);
});

// 4. Update status (simulate official action)
app.post('/api/issues/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, updaterName, description, imageUrl } = req.body;

  const issue = db.issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  // Validate status transition
  const validStatuses: IssueStatus[] = ['reported', 'verified', 'acknowledged', 'in_progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status type' });
  }

  issue.status = status as IssueStatus;
  issue.updatedAt = new Date().toISOString();

  let title = 'Status Updated';
  if (status === 'verified') title = 'Community Verified';
  else if (status === 'acknowledged') title = 'Official Acknowledgment';
  else if (status === 'in_progress') title = 'Resolution In Progress';
  else if (status === 'resolved') title = 'Issue Fully Resolved';

  issue.timeline.push({
    status: status as IssueStatus,
    title,
    description: description || `Status updated to ${status}.`,
    timestamp: new Date().toISOString(),
    updatedBy: updaterName || 'Civic Authority Office',
    imageUrl: imageUrl || null
  });

  // If resolved, award points to the reporter and the upvoters!
  if (status === 'resolved') {
    const reporter = db.users.find(u => u.uid === issue.reporterId);
    if (reporter) {
      reporter.points += 50; // Big bonus for original reporter
      reporter.resolvedCount += 1;
    }
  }

  saveData();
  res.json(issue);
});

// 5. Add a comment
app.post('/api/issues/:id/comments', (req, res) => {
  const { id } = req.params;
  const { userId, userName, userAvatar, text, imageUrl } = req.body;

  const issue = db.issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const newComment: Comment = {
    id: `comment_${Date.now()}`,
    userId,
    userName: userName || 'Anonymous Citizen',
    userAvatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    text,
    createdAt: new Date().toISOString(),
    imageUrl: imageUrl || null
  };

  issue.comments.push(newComment);
  issue.updatedAt = new Date().toISOString();

  // Award a small amount of points for constructive comments
  const user = db.users.find(u => u.uid === userId);
  if (user) {
    user.points += 5;
  }

  saveData();
  res.json(issue);
});

// 5.5. Login with Email and Password
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'No user profile found with this email.' });
  }

  // Check password if configured, or if they typed Admin for the Piyush account
  if (user.password && user.password !== password) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  res.json(user);
});

// 6. Get or create user profile
app.get('/api/users/:uid', (req, res) => {
  const { uid } = req.params;
  let user = db.users.find(u => u.uid === uid);

  if (!user) {
    // Create new profile
    user = {
      uid,
      name: 'Active Citizen',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      points: 25, // First sign-in points
      badges: [],
      reportedCount: 0,
      verifiedCount: 0,
      resolvedCount: 0,
      role: 'citizen',
      verificationStatus: 'none',
      accessLevel: 'none'
    };
    db.users.push(user);
    saveData();
  } else {
    // Populate defaults for existing users if missing
    if (!user.role) user.role = 'citizen';
    if (!user.verificationStatus) user.verificationStatus = 'none';
    if (!user.accessLevel) user.accessLevel = 'none';
  }

  res.json(user);
});

// Update profile details
app.post('/api/users/profile', (req, res) => {
  const { uid, name, avatar, email, password } = req.body;
  let user = db.users.find(u => u.uid === uid);

  if (!user) {
    user = {
      uid,
      name: name || 'Active Citizen',
      email: email || '',
      password: password || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      points: 25,
      badges: [],
      reportedCount: 0,
      verifiedCount: 0,
      resolvedCount: 0,
      role: req.body.role || 'citizen',
      verificationStatus: req.body.verificationStatus || 'none',
      accessLevel: req.body.accessLevel || 'none'
    };
    db.users.push(user);
  } else {
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (email) user.email = email;
    if (password) user.password = password;
    if (req.body.role) user.role = req.body.role;
    if (req.body.verificationStatus) user.verificationStatus = req.body.verificationStatus;
    if (req.body.accessLevel) user.accessLevel = req.body.accessLevel;
  }

  saveData();
  res.json(user);
});

// Admin endpoint to verify and assign access level to authorities
app.post('/api/admin/verify-user', (req, res) => {
  const { uid, verificationStatus, accessLevel } = req.body;
  const user = db.users.find(u => u.uid === uid);

  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  if (verificationStatus) {
    user.verificationStatus = verificationStatus;
  }
  if (accessLevel) {
    user.accessLevel = accessLevel;
  }

  saveData();
  res.json({ success: true, user });
});

// 7. Get global & ward-level impact statistics
app.get('/api/stats', (req, res) => {
  const stats = getInitialImpactStats(db.issues);
  res.json(stats);
});

// 8. Get citizen leaderboards (points)
app.get('/api/leaderboard', (req, res) => {
  const sorted = [...db.users].sort((a, b) => b.points - a.points);
  res.json(sorted);
});

// -------------------------------------------------------------
// VITE CLIENT ROUTING & PRODUCTION STATIC DELIVERY
// -------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  // Serve production build files
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In development, integrate Vite middleware dynamically
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

// Global server listen
app.listen(port, '0.0.0.0', () => {
  console.log(`My Gwalior City App server running successfully on http://0.0.0.0:${port}`);
});

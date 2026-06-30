import { CivicIssue, UserProfile, WardStats, ImpactStats, IssueCategory } from './types';

export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'user_1',
    name: 'Priyansh Sharma (Commissioner)',
    email: 'priyansh.sharma@gwaliorcity.gov.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    points: 340,
    badges: [
      { id: 'b1', title: 'Fort Guardian', description: 'Reported 3 or more local Gwalior issues', icon: 'Shield', unlockedAt: '2026-05-12T10:30:00Z', color: 'from-amber-400 to-orange-500' },
      { id: 'b2', title: 'Gwalior Gaurav', description: 'Verified 10 local community reports', icon: 'Award', unlockedAt: '2026-06-01T14:15:00Z', color: 'from-blue-400 to-indigo-600' },
      { id: 'b3', title: 'Swachh Steward', description: 'First garbage or cleanup issue logged successfully', icon: 'Hammer', unlockedAt: '2026-04-20T09:00:00Z', color: 'from-green-400 to-emerald-600' }
    ],
    reportedCount: 6,
    verifiedCount: 14,
    resolvedCount: 4,
    role: 'authority',
    verificationStatus: 'verified',
    accessLevel: 'level_3',
    department: 'admin',
    authorityLevel: 'commissioner'
  },
  {
    uid: 'user_2',
    name: 'Ananya Rao',
    email: 'ananya.rao@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    points: 190,
    badges: [
      { id: 'b3', title: 'Swachh Steward', description: 'First garbage or cleanup issue logged successfully', icon: 'Hammer', unlockedAt: '2026-05-18T11:00:00Z', color: 'from-green-400 to-emerald-600' },
      { id: 'b2', title: 'Gwalior Gaurav', description: 'Verified 10 local community reports', icon: 'Award', unlockedAt: '2026-06-10T16:20:00Z', color: 'from-blue-400 to-indigo-600' }
    ],
    reportedCount: 3,
    verifiedCount: 11,
    resolvedCount: 2,
    role: 'citizen',
    verificationStatus: 'none',
    accessLevel: 'none'
  },
  {
    uid: 'user_c1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    points: 245,
    badges: [
      { id: 'b2', title: 'Gwalior Gaurav', description: 'Verified 10 local community reports', icon: 'Award', unlockedAt: '2026-05-10T11:30:00Z', color: 'from-blue-400 to-indigo-600' }
    ],
    reportedCount: 5,
    verifiedCount: 14,
    resolvedCount: 3,
    role: 'citizen',
    verificationStatus: 'none',
    accessLevel: 'none'
  },
  {
    uid: 'user_c2',
    name: 'Meera Deshmukh',
    email: 'meera.d@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    points: 180,
    badges: [
      { id: 'b3', title: 'Swachh Steward', description: 'First garbage or cleanup issue logged successfully', icon: 'Hammer', unlockedAt: '2026-05-20T14:10:00Z', color: 'from-green-400 to-emerald-600' }
    ],
    reportedCount: 4,
    verifiedCount: 8,
    resolvedCount: 2,
    role: 'citizen',
    verificationStatus: 'none',
    accessLevel: 'none'
  },
  {
    uid: 'user_c3',
    name: 'Amit Patel',
    email: 'amit.patel@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    points: 135,
    badges: [],
    reportedCount: 2,
    verifiedCount: 9,
    resolvedCount: 1,
    role: 'citizen',
    verificationStatus: 'none',
    accessLevel: 'none'
  },
  {
    uid: 'user_c4',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@rediffmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    points: 110,
    badges: [],
    reportedCount: 1,
    verifiedCount: 6,
    resolvedCount: 1,
    role: 'citizen',
    verificationStatus: 'none',
    accessLevel: 'none'
  },
  {
    uid: 'user_c5',
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    points: 85,
    badges: [],
    reportedCount: 1,
    verifiedCount: 4,
    resolvedCount: 0,
    role: 'citizen',
    verificationStatus: 'none',
    accessLevel: 'none'
  },
  {
    uid: 'user_3',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    points: 95,
    badges: [
      { id: 'b3', title: 'Swachh Steward', description: 'First garbage or cleanup issue logged successfully', icon: 'Hammer', unlockedAt: '2026-06-15T08:45:00Z', color: 'from-green-400 to-emerald-600' }
    ],
    reportedCount: 1,
    verifiedCount: 5,
    resolvedCount: 1,
    role: 'authority',
    verificationStatus: 'pending',
    accessLevel: 'none',
    department: 'garbage',
    authorityLevel: 'field_officer'
  },
  {
    uid: 'user_l1_1',
    name: 'Rajesh Gwalior (Water Inspector)',
    email: 'rajesh.water@gwaliorcity.gov.in',
    password: 'authority',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    points: 120,
    badges: [
      { id: 'b3', title: 'Water Guardian', description: 'Resolved 3 water leak issues', icon: 'Shield', unlockedAt: '2026-06-20T10:00:00Z', color: 'from-blue-400 to-teal-500' }
    ],
    reportedCount: 1,
    verifiedCount: 8,
    resolvedCount: 4,
    role: 'authority',
    verificationStatus: 'verified',
    accessLevel: 'level_1',
    department: 'water',
    authorityLevel: 'inspector',
    attendanceLogs: [
      { timestamp: '2026-06-26T09:15:22.000Z', type: 'app_open', location: 'Lashkar Zone Office', latitude: 26.2183, longitude: 78.1828, pageOpened: 'Feed & Issues Board', durationMinutes: 12 },
      { timestamp: '2026-06-26T09:30:15.000Z', type: 'manual_checkin', location: 'Maharaj Bada Market Square', latitude: 26.2181, longitude: 78.1825, pageOpened: 'Feed & Issues Board', durationMinutes: 25 },
      { timestamp: '2026-06-27T08:55:00.000Z', type: 'app_open', location: 'Morar Ward Office', latitude: 26.2150, longitude: 78.2120, pageOpened: 'Interactive Civic Map', durationMinutes: 8 },
      { timestamp: '2026-06-28T09:05:10.000Z', type: 'app_open', location: 'Lashkar Zone Office', latitude: 26.2183, longitude: 78.1828, pageOpened: 'Inter-Department Chat', durationMinutes: 15 }
    ]
  },
  {
    uid: 'user_l1_2',
    name: 'Sunil Tomar (Light Inspector)',
    email: 'sunil.light@gwaliorcity.gov.in',
    password: 'authority',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    points: 95,
    badges: [],
    reportedCount: 0,
    verifiedCount: 4,
    resolvedCount: 2,
    role: 'authority',
    verificationStatus: 'verified',
    accessLevel: 'level_1',
    department: 'light',
    authorityLevel: 'inspector',
    attendanceLogs: [
      { timestamp: '2026-06-25T08:42:11.000Z', type: 'app_open', location: 'DD Nagar Sector', latitude: 26.2420, longitude: 78.2190, pageOpened: 'Feed & Issues Board', durationMinutes: 6 },
      { timestamp: '2026-06-26T08:50:00.000Z', type: 'app_open', location: 'Pinto Park Ward', latitude: 26.2415, longitude: 78.2185, pageOpened: 'Citizen Leaderboard', durationMinutes: 14 },
      { timestamp: '2026-06-27T09:01:45.000Z', type: 'app_open', location: 'City Center Hub', latitude: 26.1960, longitude: 78.1960, pageOpened: 'Interactive Civic Map', durationMinutes: 9 },
      { timestamp: '2026-06-27T09:10:00.000Z', type: 'manual_checkin', location: 'Pinto Park Circle', latitude: 26.2425, longitude: 78.2200, pageOpened: 'Interactive Civic Map', durationMinutes: 18 }
    ]
  },
  {
    uid: 'user_l2_1',
    name: 'Vivek Dixit (Zonal Chief)',
    email: 'vivek.dixit@gwaliorcity.gov.in',
    password: 'authority',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    points: 180,
    badges: [
      { id: 'b2', title: 'Gwalior Gaurav', description: 'Assigned and managed over 50 ward tickets', icon: 'Award', unlockedAt: '2026-05-15T12:00:00Z', color: 'from-blue-400 to-indigo-600' }
    ],
    reportedCount: 2,
    verifiedCount: 15,
    resolvedCount: 10,
    role: 'authority',
    verificationStatus: 'verified',
    accessLevel: 'level_2',
    department: 'road',
    authorityLevel: 'chief_engineer',
    attendanceLogs: [
      { timestamp: '2026-06-26T10:02:15.000Z', type: 'app_open', location: 'Gwalior Fort Zone HQ', latitude: 26.2280, longitude: 78.1710, pageOpened: 'Admin Control Center', durationMinutes: 45 },
      { timestamp: '2026-06-27T10:15:30.000Z', type: 'app_open', location: 'Gwalior Fort Zone HQ', latitude: 26.2280, longitude: 78.1710, pageOpened: 'Admin Control Center', durationMinutes: 30 },
      { timestamp: '2026-06-28T09:45:11.000Z', type: 'app_open', location: 'Morar Zone HQ', latitude: 26.2150, longitude: 78.2120, pageOpened: 'Feed & Issues Board', durationMinutes: 20 }
    ]
  },
  {
    uid: 'user_l2_2',
    name: 'Amit Bhadoria (SWM Head)',
    email: 'amit.bhadoria@gwaliorcity.gov.in',
    password: 'authority',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    points: 210,
    badges: [],
    reportedCount: 3,
    verifiedCount: 12,
    resolvedCount: 9,
    role: 'authority',
    verificationStatus: 'verified',
    accessLevel: 'level_2',
    department: 'garbage',
    authorityLevel: 'superintendent',
    attendanceLogs: [
      { timestamp: '2026-06-25T09:00:00.000Z', type: 'app_open', location: 'Nagar Nigam HQ', latitude: 26.2215, longitude: 78.1685, pageOpened: 'Feed & Issues Board', durationMinutes: 15 },
      { timestamp: '2026-06-26T09:12:00.000Z', type: 'app_open', location: 'Nagar Nigam HQ', latitude: 26.2215, longitude: 78.1685, pageOpened: 'Admin Control Center', durationMinutes: 22 },
      { timestamp: '2026-06-27T08:58:19.000Z', type: 'app_open', location: 'City Center SWM Station', latitude: 26.1960, longitude: 78.1960, pageOpened: 'Interactive Civic Map', durationMinutes: 11 }
    ]
  },
  {
    uid: 'user_admin',
    name: 'Piyush (Admin)',
    email: 'piyush.admin@gmail.com',
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
    accessLevel: 'level_3',
    department: 'admin',
    authorityLevel: 'commissioner'
  }
];

export const DEMO_WARDS: WardStats[] = [
  { wardName: 'Lashkar Zone (Maharaj Bada)', reportedCount: 34, resolvedCount: 29, avgResolutionDays: 3.2, hotspotIntensity: 45, topCategory: 'garbage' },
  { wardName: 'Morar Zone (Thatipur)', reportedCount: 21, resolvedCount: 18, avgResolutionDays: 4.5, hotspotIntensity: 30, topCategory: 'streetlight' },
  { wardName: 'City Center Gwalior', reportedCount: 45, resolvedCount: 31, avgResolutionDays: 5.8, hotspotIntensity: 80, topCategory: 'road_damage' },
  { wardName: 'Fort & Old Town Area', reportedCount: 15, resolvedCount: 14, avgResolutionDays: 2.4, hotspotIntensity: 15, topCategory: 'pothole' },
  { wardName: 'DD Nagar & Pinto Park', reportedCount: 28, resolvedCount: 22, avgResolutionDays: 4.1, hotspotIntensity: 60, topCategory: 'water_leakage' }
];

export const SEED_ISSUES: CivicIssue[] = [
  {
    id: 'issue_1',
    title: 'Major Road Cave-in on Maharaj Bada Circular Road',
    description: 'A deep, dangerous pothole/cave-in has opened up right near the heritage State Bank building in Maharaj Bada, causing severe traffic blocks in Gwalior\'s busiest market circular loop. Multiple two-wheelers have skidded here.',
    category: 'pothole',
    severity: 'critical',
    status: 'in_progress',
    latitude: 26.2052,
    longitude: 78.1578,
    ward: 'Lashkar Zone (Maharaj Bada)',
    reporterName: 'Priyansh Sharma',
    reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    reporterId: 'user_1',
    createdAt: '2026-06-21T08:12:00+05:30',
    updatedAt: '2026-06-24T14:30:00+05:30',
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=80',
    confirmations: 42,
    confirmedBy: ['user_2', 'user_3', 'demo_1', 'demo_2'],
    priorityScore: 94,
    timeline: [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Citizen report submitted with geolocation and photo details at Maharaj Bada.',
        timestamp: '2026-06-21T08:12:00+05:30',
        updatedBy: 'Priyansh Sharma'
      },
      {
        status: 'verified',
        title: 'Community Verified',
        description: 'Validated by 10+ local shop owners. Priority score escalated to Critical due to high festival traffic.',
        timestamp: '2026-06-2 circular T11:45:00+05:30',
        updatedBy: 'My Gwalior System'
      },
      {
        status: 'acknowledged',
        title: 'Acknowledged by GMC PWD',
        description: 'Gwalior Nagar Nigam PWD has dispatched a spot inspection unit. Work order #GMC-PWD-90218 created.',
        timestamp: '2026-06-22T09:15:00+05:30',
        updatedBy: 'GMC Roads Division'
      },
      {
        status: 'in_progress',
        title: 'Asphalt & Slab Filling In Progress',
        description: 'Repair crew is on-site. Barricades placed. Core filling done, final tar coating scheduled tonight.',
        timestamp: '2026-06-24T14:30:00+05:30',
        updatedBy: 'Junior Engineer, Lashkar Zone',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=80'
      }
    ],
    aiAnalysis: {
      visionIntake: {
        category: 'pothole',
        severity: 'critical',
        confidence: 0.95,
        reasoning: 'Visual inspection reveals deep asphalt collapse (> 18cm depth) in an extremely high footfall circular heritage market loop. Poses immediate tipping risk for auto-rickshaws and two-wheelers.'
      },
      duplicateCheck: {
        isDuplicate: false,
        explanation: 'No duplicate open reports found within 150 meters on the Maharaj Bada circular loop.',
        nearbyCount: 0
      },
      priorityScoring: {
        baseScore: 85,
        bonusPoints: 9,
        finalScore: 94,
        reasoning: 'Elevated from base 85 due to: 1) High heritage business zone (Bada circular loop), 2) Proximity (< 30m) to major pedestrian pathways, 3) Rapid citizen endorsements.'
      },
      routingAndDrafting: {
        department: 'Gwalior Municipal Corporation - Public Works Department',
        contactInfo: 'pwd-lashkar@gwaliornagar-nigam.gov.in | Central Portal: 1800-233-3015',
        draftedLetter: 'OFFICIAL MUNICIPAL ESCALATION\nTO: City Engineer, GMC PWD Lashkar\nSUBJECT: Emergency Road Tarring - Maharaj Bada Heritage Area (Ref: GW-PWD-940)\n\nDear Sir,\n\nA severe road cave-in has been validated via My Gwalior City App at Maharaj Bada circular loop (26.2052, 78.1578). As you are aware, Maharaj Bada is the business heart of Gwalior, and this deep pothole has already caused multiple scooter skids.\n\nImmediate mechanical repair and safety bar placement are requested.\n\nRegards,\nMy Gwalior Automated Dispatch'
      },
      predictiveInsights: {
        historicalPattern: 'Maharaj Bada Heritage loop experiences waterlogging during monsoons, accelerating base-course breakdown.',
        recommendation: 'Recommend using polymer-modified bitumen (PMB) for water-resistant properties on this heavy-loading circular street.',
        warningLevel: 'high'
      },
      timestamp: '2026-06-21T08:12:05+05:30'
    },
    comments: [
      {
        id: 'c1',
        userId: 'user_2',
        userName: 'Ananya Rao',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: 'Nearly crashed my Honda Activa here in the evening! The lighting makes it hard to see. Please drive very carefully around the SBI bank curve.',
        createdAt: '2026-06-21T09:30:00+05:30'
      },
      {
        id: 'c2',
        userId: 'user_3',
        userName: 'Kabir Mehta',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        text: 'Saw the municipal truck with tar bags working there today afternoon. Looks like they are filling the base structure.',
        createdAt: '2026-06-24T15:00:00+05:30'
      }
    ]
  },
  {
    id: 'issue_2',
    title: 'High-Pressure Drinking Water Pipeline Leak near City Center Mall',
    description: 'Clean drinking water is gushing out from an underground pipeline fracture near Gwalior City Center Mall road, flooding the street and creating complete low water-pressure issues across Patel Nagar.',
    category: 'water_leakage',
    severity: 'high',
    status: 'acknowledged',
    latitude: 26.2144,
    longitude: 78.1969,
    ward: 'City Center Gwalior',
    reporterName: 'Ananya Rao',
    reporterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    reporterId: 'user_2',
    createdAt: '2026-06-23T11:20:00+05:30',
    updatedAt: '2026-06-23T16:00:00+05:30',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    confirmations: 29,
    confirmedBy: ['user_1', 'demo_1'],
    priorityScore: 82,
    timeline: [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Main pipeline leak reported with geolocated media near City Center.',
        timestamp: '2026-06-23T11:20:00+05:30',
        updatedBy: 'Ananya Rao'
      },
      {
        status: 'verified',
        title: 'Verified by Local Residents',
        description: 'Confirmed by 15 local residential societies. Severe water loss reported.',
        timestamp: '2026-06-23T13:10:00+05:30',
        updatedBy: 'My Gwalior System'
      },
      {
        status: 'acknowledged',
        title: 'Acknowledged by GMC Jal Board',
        description: 'Gwalior Nagar Nigam Water Works (Jal Vibhag) has shut down regional feed valves and scheduled joint coupling welding.',
        timestamp: '2026-06-23T16:00:00+05:30',
        updatedBy: 'Jal Board Control Officer'
      }
    ],
    aiAnalysis: {
      visionIntake: {
        category: 'water_leakage',
        severity: 'high',
        confidence: 0.91,
        reasoning: 'Active high-volume pressurized discharge from service pipeline. Flooding borders the commercial sidewalk and threatens foundation erosion if left unchecked.'
      },
      duplicateCheck: {
        isDuplicate: false,
        explanation: 'No other pipe-burst reports logged on City Center main road. Assumed active unique incident.',
        nearbyCount: 0
      },
      priorityScoring: {
        baseScore: 75,
        bonusPoints: 7,
        finalScore: 82,
        reasoning: 'High drinking water waste during hot summer months elevates baseline. Accelerated due to rapid community support in City Center area.'
      },
      routingAndDrafting: {
        department: 'Gwalior Municipal Corporation - Water Works (Jal Board)',
        contactInfo: 'jalworks@gwaliornagar-nigam.gov.in | GMC Helpline: 1916',
        draftedLetter: 'URGENT WATER PIPELINE REPAIR\nTO: Superintendent Engineer, Jal Vibhag GMC\nSUBJECT: Main Pipeline Breach near City Center Mall (Ref: GW-JAL-4410)\n\nDear Sir,\n\nA critical water pipeline fracture has been reported and validated near City Center Mall, Gwalior (26.2144, 78.1969). Safe drinking water is leaking at high volume onto the public road.\n\nThis has caused major pressure drops in Patel Nagar and City Center offices. Kindly shut the main feed valve and dispatch the repair crew immediately.\n\nSincerely,\nMy Gwalior automated alert'
      },
      predictiveInsights: {
        historicalPattern: 'City Center infrastructure was updated in 2018, but joint degradation is common under increased traffic load on main ducts.',
        recommendation: 'Recommend checking pressure release valves to verify if sudden night spikes caused the weld fracture.',
        warningLevel: 'medium'
      },
      timestamp: '2026-06-23T11:20:05+05:30'
    },
    comments: []
  },
  {
    id: 'issue_3',
    title: 'Flickering and Broken Streetlights near Thatipur Square',
    description: 'Multiple streetlights are broken or flickering near the Thatipur square park area. The entire stretch becomes completely dark after 7 PM, creating a major safety risk for evening walkers and children visiting the garden.',
    category: 'streetlight',
    severity: 'medium',
    status: 'reported',
    latitude: 26.2155,
    longitude: 78.2059,
    ward: 'Morar Zone (Thatipur)',
    reporterName: 'Kabir Mehta',
    reporterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    reporterId: 'user_3',
    createdAt: '2026-06-25T01:30:00+05:30',
    updatedAt: '2026-06-25T01:30:00+05:30',
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
    confirmations: 8,
    confirmedBy: ['user_1'],
    priorityScore: 54,
    timeline: [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Streetlight failure registered near Thatipur park area.',
        timestamp: '2026-06-25T01:30:00+05:30',
        updatedBy: 'Kabir Mehta'
      }
    ],
    aiAnalysis: {
      visionIntake: {
        category: 'streetlight',
        severity: 'medium',
        confidence: 0.88,
        reasoning: 'Image analysis shows broken sodium lamps and complete local dark-zone on a secondary arterial road next to a public garden. Safety hazard confirmed.'
      },
      duplicateCheck: {
        isDuplicate: false,
        explanation: 'No duplicate complaints found for Thatipur main square within 100 meters.',
        nearbyCount: 0
      },
      priorityScoring: {
        baseScore: 50,
        bonusPoints: 4,
        finalScore: 54,
        reasoning: 'Base score 50 adjusted with +4 due to location bordering a family recreation park and vegetable vendor stalls.'
      },
      routingAndDrafting: {
        department: 'Gwalior Municipal Corporation - Electrical Department',
        contactInfo: 'gmc.electrical@gwaliornagar-nigam.gov.in | Central Ext: 105',
        draftedLetter: 'LIGHTING MAINTENANCE REQUEST\nTO: Assistant Engineer, Electrical GMC\nSUBJECT: Bulb Replacement on Thatipur Square Road\n\nDear Sir,\n\nWe request the replacement of three damaged sodium/LED lamp heads on Thatipur Square Road (26.2155, 78.2059). The lack of light creates safety and dark-zone concerns near the park.\n\nKindly dispatch a hydraulic ladder truck to replace the bulbs.\n\nSincerely,\nMy Gwalior Dispatch'
      },
      predictiveInsights: {
        historicalPattern: 'Streetlight complaints in Morar/Thatipur zone are resolved within an average of 3.8 days.',
        recommendation: 'Recommend replacing traditional sodium bulbs with durable smart LED heads to enable central status monitoring.',
        warningLevel: 'low'
      },
      timestamp: '2026-06-25T01:30:04+05:30'
    },
    comments: []
  },
  {
    id: 'issue_4',
    title: 'Overflowing Municipal Garbage Dustbins near Hazira Sabzi Mandi',
    description: 'The green community garbage bins behind the busy Hazira Sabzi Mandi have not been cleared by the GMC trucks for two days. Rotting organic waste is spilling on the road, creating a terrible stench and attracting stray cattle.',
    category: 'garbage',
    severity: 'high',
    status: 'resolved',
    latitude: 26.2335,
    longitude: 78.1754,
    ward: 'Fort & Old Town Area',
    reporterName: 'Priyansh Sharma',
    reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    reporterId: 'user_1',
    createdAt: '2026-06-18T10:00:00+05:30',
    updatedAt: '2026-06-20T17:15:00+05:30',
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
    confirmations: 55,
    confirmedBy: ['user_2', 'user_3', 'demo_3', 'demo_4'],
    priorityScore: 89,
    timeline: [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Solid waste overflow reported behind Hazira Market stalls.',
        timestamp: '2026-06-18T10:00:00+05:30',
        updatedBy: 'Priyansh Sharma'
      },
      {
        status: 'verified',
        title: 'Verified by Local Merchants',
        description: 'Endorsed by 30+ vegetable vendors. High bacterial and flies breeding hazard.',
        timestamp: '2026-06-18T13:00:00+05:30',
        updatedBy: 'My Gwalior System'
      },
      {
        status: 'acknowledged',
        title: 'Acknowledged by GMC Swachhata Division',
        description: 'Solid Waste Team dispatched. Work order #GMC-SAN-3301 issued.',
        timestamp: '2026-06-19T08:30:00+05:30',
        updatedBy: 'Sanitation Inspector, Ward 12'
      },
      {
        status: 'in_progress',
        title: 'Garbage Compactor On Site',
        description: 'GMC dumper truck is currently loading the waste. Bleaching powder spraying scheduled after completion.',
        timestamp: '2026-06-19T14:00:00+05:30',
        updatedBy: 'Swachhata Ground Supervisor'
      },
      {
        status: 'resolved',
        title: 'Resolved & Area Sanitized',
        description: 'Garbage completely removed, floor thoroughly washed, and disinfection bleach powder applied to stop odor.',
        timestamp: '2026-06-20T17:15:00+05:30',
        updatedBy: 'Sanitation Inspector, Ward 12',
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80'
      }
    ],
    aiAnalysis: {
      visionIntake: {
        category: 'garbage',
        severity: 'high',
        confidence: 0.94,
        reasoning: 'Severe volume of wet organic waste spilling from public bin. Immediate biological vector risk due to high moisture, hot weather, and stray animals.'
      },
      duplicateCheck: {
        isDuplicate: false,
        explanation: 'Unique report registered for Hazira Sabzi Mandi main back-gate.',
        nearbyCount: 0
      },
      priorityScoring: {
        baseScore: 78,
        bonusPoints: 11,
        finalScore: 89,
        reasoning: 'High base score due to heavy commercial footfall and vegetable market health hazard, combined with solid merchant verification speeds.'
      },
      routingAndDrafting: {
        department: 'Gwalior Municipal Corporation - Health & Sanitation (Swachh Gwalior)',
        contactInfo: 'swachh-gwalior@gwaliornagar-nigam.gov.in | Toll-Free: 1800-440-22',
        draftedLetter: 'URGENT CLEANUP ESCALATION\nTO: Health Officer, GMC Swachhata Division\nSUBJECT: Hazardous Waste Overflow - Hazira Sabzi Mandi (Ref: GW-SAN-3301)\n\nDear Sir,\n\nWe are formally registering an urgent health alert regarding unchecked solid waste accumulation at Hazira Mandi rear gate (26.2335, 78.1754). Over 3 tons of rotting vegetable refuse has spilled onto the roadway.\n\nPlease dispatch a garbage loader truck and order bleach powder spraying to maintain Swachh Gwalior hygiene standards.\n\nWarm regards,\nMy Gwalior Swachhata Desk'
      },
      predictiveInsights: {
        historicalPattern: 'Hazira Mandi bins show overloading every Tuesday and Saturday during weekend market rushes.',
        recommendation: 'Increase collection frequency to twice-daily on market days and install a secondary closed container.',
        warningLevel: 'high'
      },
      timestamp: '2026-06-18T10:00:04+05:30'
    },
    comments: [
      {
        id: 'c_shop',
        userId: 'demo_merchant',
        userName: 'Rajesh Fruit & Veg Store',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        text: 'The stink was unbearable and customers were avoiding our shops. Thanks to My Gwalior team, GMC cleared it and washed the spot with bleaching powder!',
        createdAt: '2026-06-20T18:00:00+05:30'
      }
    ]
  },
  {
    id: 'issue_5',
    title: 'Broken Paving Stones and Potholes near Gwalior Fort Entry Gate',
    description: 'The stone-paved entry road leading up to Gwalior Fort (near the historic Urvai Gate ramp) is severely broken with loose stones and massive potholes, creating a major slipping risk for auto-rickshaws, tourists, and two-wheelers.',
    category: 'road_damage',
    severity: 'medium',
    status: 'verified',
    latitude: 26.2309,
    longitude: 78.1691,
    ward: 'Fort & Old Town Area',
    reporterName: 'Priyansh Sharma',
    reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    reporterId: 'user_1',
    createdAt: '2026-06-24T09:00:00+05:30',
    updatedAt: '2026-06-24T12:00:00+05:30',
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop&q=80',
    confirmations: 12,
    confirmedBy: ['user_2', 'user_3'],
    priorityScore: 58,
    timeline: [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Urvai Gate Fort ramp road damage reported.',
        timestamp: '2026-06-24T09:00:00+05:30',
        updatedBy: 'Priyansh Sharma'
      },
      {
        status: 'verified',
        title: 'Verified by Local Guides',
        description: 'Verified by Fort tour guides and nearby residents. Risk of tourist vehicle damage noted.',
        timestamp: '2026-06-24T12:00:00+05:30',
        updatedBy: 'My Gwalior System'
      }
    ],
    aiAnalysis: {
      visionIntake: {
        category: 'road_damage',
        severity: 'medium',
        confidence: 0.89,
        reasoning: 'Broken interlocking concrete/stone blocks on a steep incline. Loose gravel creates high skid risks for descending light vehicles.'
      },
      duplicateCheck: {
        isDuplicate: false,
        explanation: 'Unique report on Urvai Gate incline road.',
        nearbyCount: 0
      },
      priorityScoring: {
        baseScore: 52,
        bonusPoints: 6,
        finalScore: 58,
        reasoning: 'Medium base severity, elevated to 58 because this is a primary tourist heritage corridor for Gwalior Fort.'
      },
      routingAndDrafting: {
        department: 'Gwalior Municipal Corporation - Heritage & PWD Division',
        contactInfo: 'pwd-heritage@gwaliornagar-nigam.gov.in | GMC Office: Ext 108',
        draftedLetter: 'HERITAGE ROAD RESTORATION ORDER\nTO: Executive Engineer, PWD GMC Gwalior\nSUBJECT: Loose Paving Stones at Urvai Gate Fort Ramp\n\nDear Sir,\n\nA damaged paving section has been validated on the steep Urvai Gate climb of Gwalior Fort (26.2309, 78.1691). Multiple tourists and auto-rickshaws have faced traction slippage on this incline.\n\nSince this is an iconic Gwalior tourism zone, urgent refitting of interlocking stones is requested.\n\nWarm regards,\nMy Gwalior Heritage Desk'
      },
      predictiveInsights: {
        historicalPattern: 'Fort incline pathways experience high stone dislocation due to braking forces of heavy commercial tempos.',
        recommendation: 'Recommend using high-strength cement grouting beneath paving blocks to resist heavy vehicle traction shear.',
        warningLevel: 'medium'
      },
      timestamp: '2026-06-24T09:00:04+05:30'
    },
    comments: []
  },
  {
    id: 'issue_6',
    title: 'Exposed High-Voltage Wires near Pinto Park Bus Shelter',
    description: 'A power feeder junction box near the Pinto Park school bus shelter has its metal door rusted completely open. Live 440V copper wires are exposed to the open, which is extremely dangerous as the area experiences waterlogging during monsoons.',
    category: 'streetlight',
    severity: 'critical',
    status: 'in_progress',
    latitude: 26.2415,
    longitude: 78.2312,
    ward: 'DD Nagar & Pinto Park',
    reporterName: 'Ananya Rao',
    reporterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    reporterId: 'user_2',
    createdAt: '2026-06-25T05:00:00+05:30',
    updatedAt: '2026-06-25T06:00:00+05:30',
    image: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=800&auto=format&fit=crop&q=80',
    confirmations: 18,
    confirmedBy: ['user_1', 'user_3'],
    priorityScore: 98,
    timeline: [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Exposed high-voltage wires logged at Pinto Park transit junction.',
        timestamp: '2026-06-25T05:00:00+05:30',
        updatedBy: 'Ananya Rao'
      },
      {
        status: 'verified',
        title: 'Emergency Safety Flagged',
        description: 'Lethal electrocution risk flagged by automated system. Routed to immediate power distribution team.',
        timestamp: '2026-06-25T05:15:00+05:30',
        updatedBy: 'My Gwalior AI Agent'
      },
      {
        status: 'acknowledged',
        title: 'Acknowledged by MPMKVV Electricity Board',
        description: 'Madhya Pradesh Central Zone Power Distribution (MPMKVV) has dispatched an emergency lineman crew to secure the box. Work order #MP-ELEC-0091.',
        timestamp: '2026-06-25T06:00:00+05:30',
        updatedBy: 'MPMKVV Grid Safety Officer'
      }
    ],
    aiAnalysis: {
      visionIntake: {
        category: 'streetlight',
        severity: 'critical',
        confidence: 0.98,
        reasoning: 'Lethal hazard. Rusted feeder box containing uninsulated 440V copper busbars is wide open next to a public school bus shelter. Direct threat of electrocution.'
      },
      duplicateCheck: {
        isDuplicate: false,
        explanation: 'No other active electrical hazards reported at Pinto Park Bus Shelter in the last 48 hours.',
        nearbyCount: 0
      },
      priorityScoring: {
        baseScore: 95,
        bonusPoints: 3,
        finalScore: 98,
        reasoning: 'Ranks at maximum safety hazard due to high-voltage exposure, water logging potential, and child footfall zone.'
      },
      routingAndDrafting: {
        department: 'Madhya Pradesh Madhya Kshetra Vidyut Vitaran (MPMKVV)',
        contactInfo: 'emergency-power@mpmkvv.co.in | Central Power Board: 1912',
        draftedLetter: 'EMERGENCY ELECTRICAL HAZARD ALERT\nTO: Division Manager, MPMKVV Gwalior East\nSUBJECT: Open 440V Feeder Box - Pinto Park Bus Shelter\n\nDear Sir,\n\nWe are issuing an immediate automated emergency dispatch regarding an unsecured live power feeder box at Pinto Park bus shelter (26.2415, 78.2312).\n\nChildren congregate at this spot daily for school buses. In wet monsoon conditions, this represents an immediate lethal hazard. Please isolate the line remotely or dispatch a repair crew instantly.\n\nRespectfully,\nMy Gwalior Emergency Dispatch'
      },
      predictiveInsights: {
        historicalPattern: 'Pinto Park area shows elevated moisture damage to street-level electrical boxes due to low ground levels and monsoon water pooling.',
        recommendation: 'Recommend elevating the feeder box structure to at least 4 feet above high watermarks and switching to plastic/composite locks.',
        warningLevel: 'high'
      },
      timestamp: '2026-06-25T05:00:05+05:30'
    },
    comments: [
      {
        id: 'c_elec1',
        userId: 'user_3',
        userName: 'Kabir Mehta',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        text: 'This is extremely scary! Kids play right next to this box in the evening. I put a wooden stick near it as a temporary warning, please fix this today!',
        createdAt: '2026-06-25T05:45:00+05:30'
      }
    ]
  }
];

export function getInitialImpactStats(issues: CivicIssue[]): ImpactStats {
  const categories = ['pothole', 'water_leakage', 'streetlight', 'garbage', 'road_damage', 'other'] as IssueCategory[];
  const dist: Record<IssueCategory, number> = {
    pothole: 0,
    water_leakage: 0,
    streetlight: 0,
    garbage: 0,
    road_damage: 0,
    other: 0
  };

  issues.forEach(iss => {
    dist[iss.category] = (dist[iss.category] || 0) + 1;
  });

  return {
    totalReported: issues.length + 150, // Base stats + demo
    totalResolved: issues.filter(i => i.status === 'resolved').length + 115,
    averageResolutionHours: 42.5,
    activeCitizens: 342,
    categoryDistribution: dist,
    wardLeaderboard: DEMO_WARDS
  };
}

export interface GwaliorLandmark {
  id: string;
  name: string;
  type: 'monument' | 'transit' | 'market' | 'nature' | 'worship';
  latitude: number;
  longitude: number;
  description: string;
  image: string;
}

export const GWALIOR_LANDMARKS: GwaliorLandmark[] = [
  {
    id: 'lm_fort',
    name: 'Gwalior Fort (Urvai Gate / Palace)',
    type: 'monument',
    latitude: 26.2300,
    longitude: 78.1690,
    description: 'Iconic 8th-century hilltop fortress complex with stunning blue tiled walls',
    image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'lm_bada',
    name: 'Maharaj Bada (Lashkar)',
    type: 'market',
    latitude: 26.2052,
    longitude: 78.1578,
    description: 'Historic public square & business heart of Gwalior featuring architectural styles from across Europe',
    image: 'https://images.unsplash.com/photo-1601342618821-2d2390a7674b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'lm_suntemple',
    name: 'Sun Temple (Surya Mandir)',
    type: 'worship',
    latitude: 26.2162,
    longitude: 78.2259,
    description: 'Sprawling red sandstone temple inspired by the Konark Sun Temple, set in beautiful gardens',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'lm_citycenter',
    name: 'City Center Gwalior',
    type: 'market',
    latitude: 26.2144,
    longitude: 78.1969,
    description: 'Major commercial, retail & corporate hub of modern Gwalior',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'lm_thatipur',
    name: 'Thatipur Square',
    type: 'transit',
    latitude: 26.2155,
    longitude: 78.2059,
    description: 'Key traffic and transit intersection in the busy Morar suburban zone',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'lm_tansen',
    name: 'Tansen Tomb (Hazira)',
    type: 'monument',
    latitude: 26.2371,
    longitude: 78.1812,
    description: 'Memorial site and tomb of the legendary Mughal court singer Tansen',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'lm_phoolbagh',
    name: 'Phool Bagh & Gwalior Zoo',
    type: 'nature',
    latitude: 26.2201,
    longitude: 78.1732,
    description: 'Beautiful historical palace gardens, zoo, and public recreation grounds',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'lm_pinto_park',
    name: 'Pinto Park Circle',
    type: 'transit',
    latitude: 26.2415,
    longitude: 78.2312,
    description: 'Busy commercial traffic roundabout and residential gateway in North-East Gwalior',
    image: 'https://images.unsplash.com/photo-1619542402915-dcaf30e4e2a1?w=600&auto=format&fit=crop&q=80'
  }
];


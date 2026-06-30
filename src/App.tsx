import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  PlusCircle,
  FileText,
  TrendingUp,
  User,
  Award,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ThumbsUp,
  MessageSquare,
  Map,
  Send,
  Mic,
  MicOff,
  ImageIcon,
  Sparkles,
  ChevronRight,
  Shield,
  Hammer,
  Wrench,
  Droplet,
  Trash2,
  Lightbulb,
  Layers,
  X,
  Volume2,
  Play,
  Heart,
  Info,
  Calendar,
  Building,
  Camera,
  Upload,
  Video,
  RefreshCw,
  LogOut,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CloudRain,
  Sun,
  Flame,
  Zap,
  Activity,
  Gift,
  Settings,
  Bell,
  Compass,
  Tag,
  Check,
  LayoutGrid,
  Grid,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { CivicIssue, UserProfile, Comment, IssueCategory, IssueSeverity, IssueStatus, AIAgentAnalysis, ToastNotification } from './types';
import { GWALIOR_LANDMARKS } from './seedData';

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidGoogleMapsKey = Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' && GOOGLE_MAPS_API_KEY.trim() !== '';

// Categories config
const CATEGORIES: Record<IssueCategory, { label: string; icon: any; color: string; bg: string; border: string }> = {
  pothole: { label: 'Pothole', icon: Hammer, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  water_leakage: { label: 'Water Leak', icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  streetlight: { label: 'Streetlight', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  garbage: { label: 'Garbage Overflow', icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  road_damage: { label: 'Road Damage', icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  other: { label: 'Other Hazard', icon: Info, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' }
};

// Status config
const STATUS_CONFIG: Record<IssueStatus, { label: string; bg: string; text: string; step: number }> = {
  reported: { label: 'Reported', bg: 'bg-blue-100', text: 'text-blue-800', step: 1 },
  verified: { label: 'Verified', bg: 'bg-purple-100', text: 'text-purple-800', step: 2 },
  acknowledged: { label: 'Acknowledged', bg: 'bg-amber-100', text: 'text-amber-800', step: 3 },
  in_progress: { label: 'In Progress', bg: 'bg-indigo-100', text: 'text-indigo-800', step: 4 },
  resolved: { label: 'Resolved', bg: 'bg-emerald-100', text: 'text-emerald-800', step: 5 }
};

export const DEPARTMENTS: Record<string, { label: string; hindiLabel: string; icon: string; color: string; bg: string; border: string }> = {
  water: { label: 'Water Department', hindiLabel: 'जल विभाग', icon: '💧', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  light: { label: 'Electricity & Light', hindiLabel: 'विद्युत विभाग', icon: '💡', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  garbage: { label: 'Sanitation & Garbage', hindiLabel: 'स्वच्छता विभाग', icon: '🧹', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  road: { label: 'Public Works (PWD)', hindiLabel: 'सड़क विभाग', icon: '🛣️', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  health: { label: 'Public Health', hindiLabel: 'स्वास्थ्य विभाग', icon: '🏥', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  admin: { label: 'Municipal Administration', hindiLabel: 'नगर निगम प्रशासन', icon: '🏛️', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
};

export const AUTHORITY_LEVELS: Record<string, { label: string; hindiLabel: string; rank: number; badge: string }> = {
  commissioner: { label: 'Commissioner', hindiLabel: 'आयुक्त', rank: 5, badge: '👑' },
  chief_engineer: { label: 'Chief Engineer', hindiLabel: 'मुख्य अभियंता', rank: 4, badge: '👷' },
  superintendent: { label: 'Superintendent', hindiLabel: 'अधीक्षक', rank: 3, badge: '📋' },
  inspector: { label: 'Inspector', hindiLabel: 'निरीक्षक', rank: 2, badge: '🔍' },
  field_officer: { label: 'Field Officer', hindiLabel: 'क्षेत्रीय अधिकारी', rank: 1, badge: '🏃' }
};

// Map center bound mappings for Gwalior, Madhya Pradesh, India
const MAP_BOUNDS = {
  latMin: 26.1900,
  latMax: 26.2500,
  lngMin: 78.1400,
  lngMax: 78.2400
};

const getCoordinatesForZone = (zoneName: string) => {
  const normalized = zoneName.toLowerCase();
  if (normalized.includes('lashkar') || normalized.includes('bada')) {
    return { latitude: 26.2183, longitude: 78.1828 };
  } else if (normalized.includes('morar') || normalized.includes('thatipur')) {
    return { latitude: 26.2150, longitude: 78.2120 };
  } else if (normalized.includes('city center')) {
    return { latitude: 26.1960, longitude: 78.1960 };
  } else if (normalized.includes('fort') || normalized.includes('old town')) {
    return { latitude: 26.2280, longitude: 78.1710 };
  } else if (normalized.includes('dd nagar') || normalized.includes('pinto')) {
    return { latitude: 26.2420, longitude: 78.2190 };
  } else if (normalized.includes('hq') || normalized.includes('nigam')) {
    return { latitude: 26.2215, longitude: 78.1685 };
  }
  return { latitude: 26.2200, longitude: 78.1800 };
};

const getPageNameForTab = (tab: string) => {
  switch (tab) {
    case 'feed': return 'Feed & Issues Board';
    case 'map': return 'Interactive Civic Map';
    case 'leaderboard': return 'Citizen Leaderboard';
    case 'admin_panel': return 'Admin Control Center';
    case 'emergency': return 'Emergency Helpline Desk';
    case 'citizen_services': return 'Nagar Nigam Services';
    case 'department_chat': return 'Inter-Department Chat';
    case 'budget_tracker': return 'Smart Budget Tracker';
    case 'e_passes': return 'Nagar Nigam E-Passes';
    default: return 'Gwalior Portal Dashboard';
  }
};

// Preset high-quality mock report images to let users test instantly
const MOCK_REPORT_IMAGES = [
  {
    name: 'Asphalt Pothole',
    category: 'pothole',
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Burst Water Pipe',
    category: 'water_leakage',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Broken Streetlights',
    category: 'streetlight',
    url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Overflowing Bins',
    category: 'garbage',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cracked Sidewalk',
    category: 'road_damage',
    url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: '4K Pothole Splashing',
    category: 'pothole',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-street-puddle-with-car-tires-splashing-water-43187-large.mp4'
  },
  {
    name: '4K Neon Dark Street',
    category: 'streetlight',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-night-city-street-with-neon-lights-and-cars-40813-large.mp4'
  }
];

export default function App() {
  // App States
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'report' | 'dashboard' | 'profile' | 'leaderboard' | 'admin_panel'>('feed');
  const [userRole, setUserRole] = useState<'citizen' | 'authority' | 'admin'>('citizen');
  const [loginRole, setLoginRole] = useState<'citizen' | 'authority' | 'admin'>('citizen');
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginAvatar, setLoginAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [registerPasswordInput, setRegisterPasswordInput] = useState('');
  const [registerPhoneInput, setRegisterPhoneInput] = useState('');
  const [registerDepartment, setRegisterDepartment] = useState<string>('water');
  const [registerAuthorityLevel, setRegisterAuthorityLevel] = useState<string>('inspector');
  const [phoneVerificationPendingUser, setPhoneVerificationPendingUser] = useState<UserProfile | null>(null);
  const [otpSentCode, setOtpSentCode] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [isOtpSending, setIsOtpSending] = useState<boolean>(false);
  const [otpSentPhone, setOtpSentPhone] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [emailOtpSentCode, setEmailOtpSentCode] = useState<string>('');
  const [emailOtpInput, setEmailOtpInput] = useState<string>('');
  const [isEmailOtpSending, setIsEmailOtpSending] = useState<boolean>(false);
  const [emailOtpSentAddress, setEmailOtpSentAddress] = useState<string>('');
  const [emailOtpCountdown, setEmailOtpCountdown] = useState<number>(0);
  const [verificationStep, setVerificationStep] = useState<number>(1); // 1 = Phone Verification, 2 = Email Verification
  const [loginTab, setLoginTab] = useState<'credentials' | 'demo' | 'register'>('credentials');
  const [authorityAccessLevel, setAuthorityAccessLevel] = useState<'level_1' | 'level_2' | 'level_3'>('level_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [mobileCols, setMobileCols] = useState<1 | 2>(1);
  const [desktopCols, setDesktopCols] = useState<2 | 3>(2);
  const [mobileChartTab, setMobileChartTab] = useState<'trends' | 'sla' | 'severity'>('trends');
  
  // Community Verification Form States
  const [verifyRole, setVerifyRole] = useState<'sight' | 'resident' | 'commuter'>('sight');
  const [verifyGpsCheck, setVerifyGpsCheck] = useState<boolean>(true);
  const [verifyCustomNote, setVerifyCustomNote] = useState<string>('');
  
  // Dashboard & Leaderboard States
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [analyticsWard, setAnalyticsWard] = useState<string>('all');
  const [analyticsTime, setAnalyticsTime] = useState<string>('all');
  const [simSeason, setSimSeason] = useState<string>('monsoon');
  const [simDensity, setSimDensity] = useState<string>('normal');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  
  const wardStats = useMemo(() => {
    const statsMap: Record<string, { reported: number; resolved: number }> = {};
    issues.forEach((iss) => {
      const w = iss.ward || 'Lashkar (Maharaj Bada) Sector';
      if (!statsMap[w]) statsMap[w] = { reported: 0, resolved: 0 };
      statsMap[w].reported += 1;
      if (iss.status === 'resolved') statsMap[w].resolved += 1;
    });
    return Object.entries(statsMap)
      .map(([wardName, data]) => ({
        name: wardName,
        reported: data.reported,
        resolved: data.resolved,
        score: data.reported * 15 + data.resolved * 30,
      }))
      .sort((a, b) => b.score - a.score);
  }, [issues]);
  
  // Interactive Profile States
  const [profileSubTab, setProfileSubTab] = useState<string>('leaderboard');
  const [adminSubTab, setAdminSubTab] = useState<'roster' | 'attendance_reports'>('roster');
  const [impactWardFilter, setImpactWardFilter] = useState<string>('all');
  const [impactCategoryFilter, setImpactCategoryFilter] = useState<string>('all');
  const [impactSeverityFilter, setImpactSeverityFilter] = useState<string>('all');
  const [impactDashboardMobileCols, setImpactDashboardMobileCols] = useState<1 | 2>(2);
  const [leaderboardMobileCols, setLeaderboardMobileCols] = useState<1 | 2>(1);
  const [leaderboardViewMode, setLeaderboardViewMode] = useState<'table' | 'cards'>('cards');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminMobileColumns, setAdminMobileColumns] = useState<1 | 2>(1);
  const [expandedUserUids, setExpandedUserUids] = useState<Record<string, boolean>>({});
  const [attendanceReports, setAttendanceReports] = useState<any[]>([]);
  const [selectedReportUser, setSelectedReportUser] = useState<any | null>(null);
  const [isFetchingReports, setIsFetchingReports] = useState<boolean>(false);

  // Android Simulator States (Desktop Only)
  const [simBezelColor, setSimBezelColor] = useState<'slate' | 'indigo' | 'emerald' | 'gold' | 'black'>('black');
  const [simBattery, setSimBattery] = useState<number>(88);
  const [simNetwork, setSimNetwork] = useState<'5g' | 'wifi' | 'offline'>('5g');
  const [simTime, setSimTime] = useState<string>('10:42 AM');
  const [simVolume, setSimVolume] = useState<number>(75);
  const [showVolumeHud, setShowVolumeHud] = useState<boolean>(false);
  const [simIsLocked, setSimIsLocked] = useState<boolean>(false);
  const [simNotification, setSimNotification] = useState<string | null>(
    "Gwalior Admin: PWA configured successfully with service workers and offline support. Tap 'Install App' on the left panel."
  );
  const [showSimNotification, setShowSimNotification] = useState<boolean>(true);
  const [simLocationName, setSimLocationName] = useState<string>('Maharaj Bada');

  // Synchronize mock device clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setSimTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  const [redeemedRewards, setRedeemedRewards] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('civicpulse_redeemed_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState<boolean>(false);
  const [profileEditName, setProfileEditName] = useState<string>('');
  const [profileEditEmail, setProfileEditEmail] = useState<string>('');
  const [profileEditPhone, setProfileEditPhone] = useState<string>('+91 94251 12345');
  const [profileEditAvatar, setProfileEditAvatar] = useState<string>('');
  const [profileEditWard, setProfileEditWard] = useState<string>('Lashkar Zone (Maharaj Bada)');
  const [profileEditDepartment, setProfileEditDepartment] = useState<string>('water');
  const [profileEditAuthorityLevel, setProfileEditAuthorityLevel] = useState<string>('inspector');
  const [attendanceLocation, setAttendanceLocation] = useState<string>('Lashkar Zone (Maharaj Bada)');
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState<boolean>(false);
  const [profileNotificationSMS, setProfileNotificationSMS] = useState<boolean>(true);
  const [profileNotificationWhatsApp, setProfileNotificationWhatsApp] = useState<boolean>(true);
  const [profileNotificationEmail, setProfileNotificationEmail] = useState<boolean>(true);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const [checkedInToday, setCheckedInToday] = useState<boolean>(() => {
    try {
      const savedUser = localStorage.getItem('civicpulse_current_user');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const uid = userObj?.uid || 'temp';
      const lastCheckIn = localStorage.getItem(`civicpulse_last_checkin_${uid}`);
      if (!lastCheckIn) return false;
      return lastCheckIn === new Date().toDateString();
    } catch {
      return false;
    }
  });
  
  // Toast Notifications State & Polling Refs
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const issuesRef = useRef<CivicIssue[]>([]);
  const currentUserRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    issuesRef.current = issues;
  }, [issues]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const addToast = (toast: Omit<ToastNotification, "id" | "timestamp">) => {
    const newToast: ToastNotification = {
      ...toast,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 8000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // Reporting Form States
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLat, setReportLat] = useState(26.2183);
  const [reportLng, setReportLng] = useState(78.1828);
  const [mapMode, setMapMode] = useState<'svg' | 'google'>('google');
  const [reportMapMode, setReportMapMode] = useState<'svg' | 'google'>('google');
  const [geolocationStatus, setGeolocationStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Check if we are running embedded inside the device simulator iframe
  const isEmbedded = useMemo(() => {
    return typeof window !== 'undefined' && (
      window.location.search.includes('embed=true') || 
      window.top !== window.self
    );
  }, []);

  // Sync simulator states inside the iframe if we are the embedded child
  useEffect(() => {
    if (!isEmbedded) return;
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SIM_STATE_UPDATE') {
        if (e.data.network !== undefined) setSimNetwork(e.data.network);
        if (e.data.battery !== undefined) setSimBattery(e.data.battery);
        if (e.data.time !== undefined) setSimTime(e.data.time);
        if (e.data.lat !== undefined) setReportLat(e.data.lat);
        if (e.data.lng !== undefined) setReportLng(e.data.lng);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Request initial state from parent
    if (window.parent) {
      window.parent.postMessage({ type: 'SIM_IFRAME_READY' }, '*');
    }
    
    return () => window.removeEventListener('message', handleMessage);
  }, [isEmbedded]);

  // Synchronize simulator state changes from parent to iframe child
  useEffect(() => {
    if (isEmbedded) return;
    
    const iframe = document.getElementById('simulator-iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'SIM_STATE_UPDATE',
        network: simNetwork,
        battery: simBattery,
        time: simTime,
        lat: reportLat,
        lng: reportLng
      }, '*');
    }
  }, [isEmbedded, simNetwork, simBattery, simTime, reportLat, reportLng]);

  // Listen for SIM_IFRAME_READY to immediately synchronize status to iframe
  useEffect(() => {
    if (isEmbedded) return;
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SIM_IFRAME_READY') {
        const iframe = document.getElementById('simulator-iframe') as HTMLIFrameElement | null;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'SIM_STATE_UPDATE',
            network: simNetwork,
            battery: simBattery,
            time: simTime,
            lat: reportLat,
            lng: reportLng
          }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEmbedded, simNetwork, simBattery, simTime, reportLat, reportLng]);

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    setGeolocationStatus({
      type: 'loading',
      message: 'Fetching physical coordinates from GPS satellites...'
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setReportLat(latitude);
        setReportLng(longitude);

        // Check if the location is close to Gwalior
        const inGwalior = 
          latitude >= MAP_BOUNDS.latMin && 
          latitude <= MAP_BOUNDS.latMax && 
          longitude >= MAP_BOUNDS.lngMin && 
          longitude <= MAP_BOUNDS.lngMax;

        if (inGwalior) {
          setGeolocationStatus({
            type: 'success',
            message: `Acquired GPS lock: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E`
          });
        } else {
          setGeolocationStatus({
            type: 'success',
            message: `Located at ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E. (Outside default Gwalior bounds, calibrated anyway!)`
          });
        }
      },
      (error) => {
        let errorMsg = 'Unable to retrieve location. Please check device permissions.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'GPS Access Denied. Please enable site geolocation permissions.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Satellite signal lost. Position unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS request timed out.';
        }
        setGeolocationStatus({
          type: 'error',
          message: errorMsg
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const [reportImage, setReportImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Live 4K Camera States
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [isCameraSimulated, setIsCameraSimulated] = useState(false);
  const [liveCameraMode, setLiveCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecordingLiveVideo, setIsRecordingLiveVideo] = useState(false);
  const [liveVideoSeconds, setLiveVideoSeconds] = useState(0);
  const [cameraResolution, setCameraResolution] = useState('3840x2160 (4K UHD)');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const liveVideoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // AI Pipeline visualization states during report submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPipelineStep, setAiPipelineStep] = useState(0);
  const [aiTraceLogs, setAiTraceLogs] = useState<{ step: string; status: 'pending' | 'active' | 'done'; detail?: string }[]>([
    { step: 'Vision Intake Agent', status: 'pending', detail: 'Classifying category & estimating severity...' },
    { step: 'Duplicate-Detection Agent', status: 'pending', detail: 'Comparing geo-spatial coordinates against open logs...' },
    { step: 'Priority-Scoring Agent', status: 'pending', detail: 'Assessing public risk factors & community density...' },
    { step: 'Routing & Drafting Agent', status: 'pending', detail: 'Compiling formal complaint to ward dispatch...' },
    { step: 'Predictive Insights Agent', status: 'pending', detail: 'Analyzing historic ward maintenance records...' }
  ]);

  // Comment Form state
  const [newCommentText, setNewCommentText] = useState('');

  // Status Change State (Simulated Admin)
  const [adminStatusChange, setAdminStatusChange] = useState<IssueStatus | ''>('');
  const [adminNote, setAdminNote] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Gwalior Landmarks & Focus State
  const [focusedLandmarkId, setFocusedLandmarkId] = useState<string | null>(null);
  const [landmarkSearch, setLandmarkSearch] = useState('');
  const [mapCategoryFilter, setMapCategoryFilter] = useState('all');
  const [mapSeverityFilter, setMapSeverityFilter] = useState('all');
  const [mapStatusFilter, setMapStatusFilter] = useState('all');
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  // Lightbox view state
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; title: string; isVideo: boolean; issue?: CivicIssue } | null>(null);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxRotation, setLightboxRotation] = useState(0);

  // Initialize and load
  useEffect(() => {
    // Let user log in first; load global data in background
    fetchIssues();
    fetchStats();
    fetchLeaderboard();

    // Start background polling to alert citizens of updates in real time
    const interval = setInterval(() => {
      fetchIssues();
      fetchStats();
    }, 8000); // Poll every 8 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileEditName(currentUser.name);
      setProfileEditEmail(currentUser.email || '');
      setProfileEditPhone(currentUser.phone || '');
      setProfileEditAvatar(currentUser.avatar || '');
      setProfileEditDepartment(currentUser.department || 'water');
      setProfileEditAuthorityLevel(currentUser.authorityLevel || 'inspector');
    }
  }, [currentUser?.uid]);

  // Page View and Session Duration tracking for Gwalior Officials
  useEffect(() => {
    if (currentUser && (currentUser.role === 'authority' || currentUser.role === 'admin')) {
      let appOpenedAt = sessionStorage.getItem('appOpenedAt');
      if (!appOpenedAt) {
        appOpenedAt = Date.now().toString();
        sessionStorage.setItem('appOpenedAt', appOpenedAt);
      }
      
      let sessionId = sessionStorage.getItem('gmcSessionId');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem('gmcSessionId', sessionId);
      }
      
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - parseInt(appOpenedAt)) / 60000));
      
      const logPageView = async (detectedLat?: number, detectedLng?: number) => {
        try {
          const lat = detectedLat || 26.2183;
          const lng = detectedLng || 78.1828;
          const defaultLoc = activeTab === 'admin_panel' ? 'Admin Portal Desk' : 'Gwalior Civic HQ';
          
          const res = await fetch(`/api/users/${currentUser.uid}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'app_open',
              location: defaultLoc,
              latitude: lat,
              longitude: lng,
              pageOpened: getPageNameForTab(activeTab),
              durationMinutes: elapsedMinutes,
              sessionId
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user && data.user.attendanceLogs) {
              setCurrentUser(prev => prev && prev.uid === data.user.uid ? { ...prev, attendanceLogs: data.user.attendanceLogs } : prev);
            }
          }
        } catch (err) {
          console.error('Failed to log navigation page view:', err);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => logPageView(position.coords.latitude, position.coords.longitude),
          () => logPageView(),
          { timeout: 3000 }
        );
      } else {
        logPageView();
      }
    }
  }, [activeTab, currentUser?.uid]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  useEffect(() => {
    if (emailOtpCountdown > 0) {
      const timer = setTimeout(() => setEmailOtpCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailOtpCountdown]);
  
  useEffect(() => {
    if (activeTab === 'admin_panel') {
      fetchAttendanceReports();
    }
  }, [activeTab]);

  // Keyboard shortcuts listener for Lightbox/Modal viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxMedia) return;
      if (e.key === 'Escape') {
        setLightboxMedia(null);
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setLightboxScale(prev => Math.min(prev + 0.25, 4));
      } else if (e.key === '-') {
        e.preventDefault();
        setLightboxScale(prev => Math.max(prev - 0.25, 0.5));
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setLightboxScale(1);
        setLightboxRotation(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxMedia]);

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues');
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data: CivicIssue[] = await res.json();
      
      const prevIssues = issuesRef.current;
      const currUser = currentUserRef.current;
      
      if (prevIssues.length > 0 && currUser) {
        data.forEach(updatedIssue => {
          const existingIssue = prevIssues.find(i => i.id === updatedIssue.id);
          if (existingIssue && existingIssue.status !== updatedIssue.status) {
            // Check if current user is the reporter OR has commented
            const isReporter = updatedIssue.reporterId === currUser.uid;
            const isCommenter = updatedIssue.comments.some(c => c.userId === currUser.uid);
            
            if (isReporter || isCommenter) {
              const latestEvent = updatedIssue.timeline && updatedIssue.timeline.length > 0 
                ? updatedIssue.timeline[updatedIssue.timeline.length - 1] 
                : null;
              const updatedByText = latestEvent ? ` by ${latestEvent.updatedBy}` : '';
              
              addToast({
                issueId: updatedIssue.id,
                issueTitle: updatedIssue.title,
                oldStatus: existingIssue.status,
                newStatus: updatedIssue.status,
                type: 'status_change',
                message: isReporter 
                  ? `The status of your reported issue "${updatedIssue.title}" has been updated to ${STATUS_CONFIG[updatedIssue.status].label}${updatedByText}.`
                  : `An issue you commented on ("${updatedIssue.title}") has been updated to ${STATUS_CONFIG[updatedIssue.status].label}${updatedByText}.`
              });
            }
          }
        });
      }
      
      setIssues(data);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  const fetchUser = async (uid: string) => {
    try {
      const res = await fetch(`/api/users/${uid}`);
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await res.json();
      setCurrentUser(data);
      if (data.role === 'admin') {
        setUserRole('admin');
        setShowAdminPanel(true);
      } else if (data.role === 'authority' && data.verificationStatus === 'verified') {
        setUserRole('authority');
        setShowAdminPanel(true);
      } else {
        setUserRole('citizen');
        setShowAdminPanel(false);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchAttendanceReports = async () => {
    setIsFetchingReports(true);
    try {
      const res = await fetch('/api/authorities/attendance-report');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setAttendanceReports(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Gwalior authority attendance reports:', err);
    } finally {
      setIsFetchingReports(false);
    }
  };

  // Profile - Reward and Gamification functions
  const handleRedeemReward = async (reward: any) => {
    if (!currentUser) return;
    if (currentUser.points < reward.cost) {
      alert(`Insufficient points! You need ${reward.cost} pts to redeem this, but you only have ${currentUser.points} pts.`);
      return;
    }
    
    const couponCode = `GP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newRedemption = {
      id: `${reward.id}_${Date.now()}`,
      title: reward.title,
      cost: reward.cost,
      code: couponCode,
      redeemedAt: new Date().toISOString()
    };
    
    const updatedRewards = [newRedemption, ...redeemedRewards];
    setRedeemedRewards(updatedRewards);
    localStorage.setItem('civicpulse_redeemed_rewards', JSON.stringify(updatedRewards));
    
    // Deduct points
    const updatedProfile = {
      ...currentUser,
      points: currentUser.points - reward.cost
    };
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      const data = await res.json();
      setCurrentUser(data);
      fetchLeaderboard(); // refresh leaderboard
      setProfileSuccessMsg(`Successfully redeemed! Voucher Code ${couponCode} is now active.`);
      setTimeout(() => setProfileSuccessMsg(null), 8000);
    } catch (err) {
      console.error('Error updating user points after redemption:', err);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!currentUser || checkedInToday) return;
    const today = new Date().toDateString();
    
    // Update local storage first to prevent spamming
    localStorage.setItem(`civicpulse_last_checkin_${currentUser.uid}`, today);
    setCheckedInToday(true);
    
    // Update points in backend (+10 pts)
    const updatedUser = {
      ...currentUser,
      points: currentUser.points + 10
    };
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      const data = await res.json();
      setCurrentUser(data);
      fetchLeaderboard();
      
      // Update local storage copy of the user to keep sync
      localStorage.setItem('civicpulse_current_user', JSON.stringify(data));

      addToast({
        issueId: 'daily_checkin',
        issueTitle: 'Daily Check-in Completed!',
        newStatus: 'resolved',
        type: 'general',
        message: 'Congratulations! You received +10 Stewardship points for checking in today to keep Gwalior clean.'
      });
    } catch (err) {
      console.error('Error during daily checkin:', err);
    }
  };

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!profileEditName.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    if (!profileEditEmail.trim() || !profileEditEmail.includes('@')) {
      alert("Please enter a valid email address containing '@'.");
      return;
    }
    
    if (!profileEditPhone.trim()) {
      alert("Mobile number is required.");
      return;
    }
    
    const updatedProfile = {
      ...currentUser,
      name: profileEditName.trim(),
      email: profileEditEmail.trim(),
      phone: profileEditPhone.trim(),
      avatar: profileEditAvatar || currentUser.avatar,
      phoneVerified: true, // Set verified when editing or after OTP
      department: (currentUser.role === 'authority' || currentUser.role === 'admin') ? profileEditDepartment : currentUser.department,
      authorityLevel: (currentUser.role === 'authority' || currentUser.role === 'admin') ? profileEditAuthorityLevel : currentUser.authorityLevel
    };
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      const data = await res.json();
      setCurrentUser(data);
      fetchLeaderboard(); // refresh leaderboard
      setProfileSuccessMsg('Profile details successfully synchronized with Gwalior Citizen Registry!');
      setTimeout(() => setProfileSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error saving profile settings:', err);
    }
  };

  // Computed list of personal civic activities
  const userActivities = useMemo(() => {
    if (!currentUser) return [];
    return issues.filter(iss => 
      iss.reporterId === currentUser.uid || 
      (iss.confirmedBy && iss.confirmedBy.includes(currentUser.uid))
    );
  }, [issues, currentUser]);

  const checkedInAttendanceToday = useMemo(() => {
    if (!currentUser || !currentUser.attendanceLogs) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return currentUser.attendanceLogs.some(
      log => log.type === 'manual_checkin' && log.timestamp.split('T')[0] === todayStr
    );
  }, [currentUser]);

  const activePatrolSession = useMemo(() => {
    if (!currentUser || !currentUser.attendanceLogs) return null;
    return [...currentUser.attendanceLogs]
      .reverse()
      .find(log => log.type === 'manual_checkin' && log.status === 'active');
  }, [currentUser]);

  const [patrolSummaryText, setPatrolSummaryText] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!currentUser) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch(`/api/users/${currentUser.uid}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'manual_checkout',
          patrolSummary: patrolSummaryText || 'Completed standard Gwalior municipal patrol round.'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.attendanceLogs) {
          setCurrentUser(prev => prev && prev.uid === data.user.uid ? { ...prev, attendanceLogs: data.user.attendanceLogs } : prev);
        }
        setPatrolSummaryText('');
        addToast({
          issueId: 'attendance_logout',
          issueTitle: 'Patrol Shift Completed',
          newStatus: 'info',
          type: 'general',
          message: `Successfully checked out and recorded patrol summary.`
        });
        fetchAttendanceReports();
      } else {
        alert('Failed to register check-out on Gwalior Municipal servers.');
      }
    } catch (err) {
      console.error('Error submitting checkout:', err);
      alert('Network error registering check-out.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const submitAttendance = async () => {
    if (!currentUser) return;
    setIsSubmittingAttendance(true);

    const zoneCoords = getCoordinatesForZone(attendanceLocation);
    const appOpenedAt = sessionStorage.getItem('appOpenedAt');
    const elapsedMinutes = appOpenedAt 
      ? Math.max(1, Math.round((Date.now() - parseInt(appOpenedAt)) / 60000))
      : 8;

    const performSubmission = async (detectedLat?: number, detectedLng?: number) => {
      try {
        const finalLat = detectedLat || zoneCoords.latitude;
        const finalLng = detectedLng || zoneCoords.longitude;

        const res = await fetch(`/api/users/${currentUser.uid}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'manual_checkin',
            location: attendanceLocation,
            latitude: finalLat,
            longitude: finalLng,
            pageOpened: getPageNameForTab(activeTab),
            durationMinutes: elapsedMinutes,
            device: 'GMC Patrol App'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.attendanceLogs) {
            setCurrentUser(prev => prev && prev.uid === data.user.uid ? { ...prev, attendanceLogs: data.user.attendanceLogs } : prev);
          }
          addToast({
            issueId: 'attendance_log',
            issueTitle: 'Attendance Registered',
            newStatus: 'success',
            type: 'general',
            message: `Successfully marked patrol check-in at ${attendanceLocation} (${finalLat.toFixed(4)}°N, ${finalLng.toFixed(4)}°E) for ${elapsedMinutes} mins.`
          });
        } else {
          alert('Failed to register attendance on Gwalior Municipal servers.');
        }
      } catch (err) {
        console.error('Error submitting manual attendance:', err);
        alert('Network error registering attendance.');
      } finally {
        setIsSubmittingAttendance(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          performSubmission(position.coords.latitude, position.coords.longitude);
        },
        () => {
          performSubmission();
        },
        { timeout: 3000 }
      );
    } else {
      performSubmission();
    }
  };

  const handleLogin = (user: UserProfile) => {
    if (user.phone && user.phoneVerified && user.emailVerified) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setUserRole('admin');
        setShowAdminPanel(true);
      } else if (user.role === 'authority' && user.verificationStatus === 'verified') {
        setUserRole('authority');
        setShowAdminPanel(true);
      } else {
        setUserRole('citizen');
        setShowAdminPanel(false);
      }
      setActiveTab('feed');
    } else {
      setPhoneVerificationPendingUser(user);
      setVerificationStep(!(user.phone && user.phoneVerified) ? 1 : 2);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPasswordInput.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPasswordInput
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || 'Failed to login with credentials.');
        return;
      }

      const data = await res.json();
      if (data.phone && data.phoneVerified && data.emailVerified) {
        setCurrentUser(data);
        if (data.role === 'admin') {
          setUserRole('admin');
          setShowAdminPanel(true);
        } else if (data.role === 'authority' && data.verificationStatus === 'verified') {
          setUserRole('authority');
          setShowAdminPanel(true);
        } else {
          setUserRole('citizen');
          setShowAdminPanel(false);
        }
        
        // Clear forms
        setLoginEmail('');
        setLoginPasswordInput('');
        
        setActiveTab('feed');
      } else {
        setPhoneVerificationPendingUser(data);
        setVerificationStep(!(data.phone && data.phoneVerified) ? 1 : 2);
      }
    } catch (err) {
      console.error('Error with credentials login:', err);
      alert('Network error during login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginEmail.trim() || !registerPasswordInput.trim()) {
      alert('Please fill out all fields, including password.');
      return;
    }

    if (!registerPhoneInput.trim()) {
      alert('Please enter your mobile number for mandatory verification.');
      return;
    }

    const uid = `user_${Date.now()}`;
    const newProfile = {
      uid,
      name: loginName,
      email: loginEmail,
      password: registerPasswordInput,
      avatar: loginAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: loginRole,
      verificationStatus: loginRole === 'citizen' ? 'none' : (loginRole === 'admin' ? 'verified' : 'pending'),
      accessLevel: loginRole === 'admin' ? 'level_3' : 'none',
      points: loginRole === 'citizen' ? 25 : 0,
      badges: [],
      reportedCount: 0,
      verifiedCount: 0,
      resolvedCount: 0,
      phone: registerPhoneInput.trim(),
      phoneVerified: false,
      emailVerified: false,
      department: loginRole === 'authority' ? registerDepartment : undefined,
      authorityLevel: loginRole === 'authority' ? registerAuthorityLevel : undefined
    };

    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      const data = await res.json();
      
      // Redirect to phone verification screen instead of direct login
      setPhoneVerificationPendingUser(data);
      setVerificationStep(1);
      
      // Refresh list
      fetchLeaderboard();
      // Reset form
      setLoginName('');
      setLoginEmail('');
      setRegisterPasswordInput('');
      setRegisterPhoneInput('');
    } catch (err) {
      console.error('Error registering:', err);
      alert('Failed to register user profile.');
    }
  };

  const handleAdminVerifyUser = async (
    targetUid: string, 
    status: 'verified' | 'rejected', 
    level?: 'level_1' | 'level_2' | 'level_3' | 'none',
    role?: 'citizen' | 'authority' | 'admin',
    department?: string,
    authorityLevel?: string
  ) => {
    try {
      const res = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: targetUid,
          verificationStatus: status,
          accessLevel: level || 'none',
          role,
          department,
          authorityLevel
        })
      });
      if (res.ok) {
        // Refresh leaderboard to update roles and lists
        fetchLeaderboard();
        // If current user is the one being modified, refresh current user state too
        if (currentUser && currentUser.uid === targetUid) {
          fetchUser(currentUser.uid);
        }
      } else {
        alert('Failed to update authority state.');
      }
    } catch (err) {
      console.error('Error updating authority verification:', err);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setUserRole('citizen');
    setShowAdminPanel(false);
  };

  // Upvote / Verify handler
  const handleConfirmIssue = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid })
      });
      const updated = await res.json();
      
      // Update issues list
      setIssues(issues.map(i => i.id === issueId ? updated : i));
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(updated);
      }
      
      // Refresh current user points & stats
      fetchUser(currentUser.uid);
      fetchLeaderboard();
      fetchStats();
    } catch (err) {
      console.error('Error confirming issue:', err);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !newCommentText.trim() || !currentUser) return;

    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: newCommentText
        })
      });
      const updated = await res.json();
      
      // Update list & detail
      setIssues(issues.map(i => i.id === selectedIssue.id ? updated : i));
      setSelectedIssue(updated);
      setNewCommentText('');
      fetchUser(currentUser.uid); // Refresh points
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Change Issue Status (Simulated City Official)
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isAdmin = currentUser?.role === 'admin';
    const isVerifiedAuth = currentUser?.role === 'authority' && currentUser?.verificationStatus === 'verified';
    
    if (!isAdmin && !isVerifiedAuth) {
      alert('Unauthorized! Only verified municipal authorities or system administrators are permitted to modify report status.');
      return;
    }
    
    if (!isAdmin && isVerifiedAuth && currentUser?.accessLevel === 'level_1') {
      alert('Access Denied! Level 1 (Field Inspectors) are only permitted to inspect and add comments. You must be Level 2 (Department Head) or Level 3 (Municipal Commissioner) to modify report status.');
      return;
    }

    if (!selectedIssue || !adminStatusChange) return;

    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: adminStatusChange,
          updaterName: 'Ward Operations Board',
          description: adminNote || `Issue transitioned to ${STATUS_CONFIG[adminStatusChange].label} status by city officials.`,
          userId: currentUser?.uid
        })
      });
      const updated = await res.json();

      setIssues(issues.map(i => i.id === selectedIssue.id ? updated : i));
      setSelectedIssue(updated);
      setAdminStatusChange('');
      setAdminNote('');
      setShowAdminPanel(false);
      fetchStats();
      if (currentUser) fetchUser(currentUser.uid);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Voice recording simulation
  const startRecording = () => {
    setIsRecording(true);
    setVoiceNoteDuration(0);
    voiceTimerRef.current = setInterval(() => {
      setVoiceNoteDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    setVoiceNoteUrl('mock_voice_note_playback');
  };

  // Convert uploaded image file to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start the live camera stream with 4K resolution request
  const startLiveCamera = async (mode: 'photo' | 'video') => {
    setLiveCameraMode(mode);
    setIsLiveCameraActive(true);
    setCameraError(null);
    setLiveVideoSeconds(0);

    const constraints = {
      video: {
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        facingMode: { ideal: 'environment' }
      },
      audio: mode === 'video'
    };

    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsCameraSimulated(false);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      
      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
        }
      }, 100);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.width && settings.height) {
          setCameraResolution(`${settings.width}x${settings.height} ${settings.width >= 1920 ? '(4K Ultra HD Simulated)' : '(HD)'}`);
        } else {
          setCameraResolution('3840x2160 (4K UHD)');
        }
      }
    } catch (err: any) {
      console.warn('Error or permission dismissed opening real camera stream, activating high-fidelity GMC simulator camera:', err);
      setIsCameraSimulated(true);
      setCameraResolution('3840x2160 (Simulated 4K UHD Feed)');
      setCameraError(null);
    }
  };

  // Close camera stream
  const stopLiveCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
    setIsRecordingLiveVideo(false);
    if (liveVideoTimerRef.current) {
      clearInterval(liveVideoTimerRef.current);
      liveVideoTimerRef.current = null;
    }
  };

  // Capture high-resolution photo from stream
  const captureLivePhoto = () => {
    if (isCameraSimulated) {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw a simulated high fidelity feed of Maharaj Bada patrol
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(0.5, '#1f2937');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Draw camera crosshairs and scanning grids
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1920; i += 120) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 1080);
          ctx.stroke();
        }
        for (let j = 0; j < 1080; j += 120) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(1920, j);
          ctx.stroke();
        }

        // Draw simulated Maharaj Bada layout
        ctx.fillStyle = '#374151';
        ctx.fillRect(400, 400, 1120, 400); // Base building
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(800, 200, 320, 200); // Main dome
        ctx.beginPath();
        ctx.arc(960, 200, 160, Math.PI, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(410, 410, 1100, 380);

        // HUD info overlay
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('GMC CIVIL SAFETY PATROL SCANNER [4K SIMULATED]', 80, 120);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px monospace';
        ctx.fillText(`LOCATION: Maharaj Bada, Lashkar, Gwalior`, 80, 170);
        ctx.fillText(`COORDINATES: 26.2183° N, 78.1828° E`, 80, 215);
        ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString('en-IN')}`, 80, 260);
        ctx.fillText(`DEVICE: GMC-PATROL-4K-SIM-V2`, 80, 305);

        // Draw crosshair
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(960, 540, 60, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(900, 540);
        ctx.lineTo(1020, 540);
        ctx.moveTo(960, 480);
        ctx.lineTo(960, 600);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('TARGET LOCK: SECURE CORRIDOR', 980, 520);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setReportImage(dataUrl);
        stopLiveCamera();
        addToast({
          issueId: 'camera_sim_photo',
          issueTitle: 'Simulator Capture',
          newStatus: 'success',
          type: 'general',
          message: '4K Simulated Patrol Photo captured successfully!'
        });
      }
      return;
    }

    if (!liveVideoRef.current) return;
    const video = liveVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 3840;
    canvas.height = video.videoHeight || 2160;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setReportImage(dataUrl);
      stopLiveCamera();
    }
  };

  // Start capturing video
  const startRecordingLiveVideo = () => {
    if (isCameraSimulated) {
      setIsRecordingLiveVideo(true);
      setLiveVideoSeconds(0);
      if (liveVideoTimerRef.current) clearInterval(liveVideoTimerRef.current);
      liveVideoTimerRef.current = setInterval(() => {
        setLiveVideoSeconds(prev => prev + 1);
      }, 1000);
      return;
    }

    if (!cameraStreamRef.current) return;

    setIsRecordingLiveVideo(true);
    setLiveVideoSeconds(0);

    if (liveVideoTimerRef.current) clearInterval(liveVideoTimerRef.current);
    liveVideoTimerRef.current = setInterval(() => {
      setLiveVideoSeconds(prev => prev + 1);
    }, 1000);

    try {
      const stream = cameraStreamRef.current;
      const chunks: Blob[] = [];

      let options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' };
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/mp4' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setReportImage(reader.result as string);
        };
        reader.readAsDataURL(videoBlob);
      };

      recorder.start(100);
    } catch (err) {
      console.error('Error initializing MediaRecorder:', err);
    }
  };

  // Stop capturing video
  const stopRecordingLiveVideo = () => {
    setIsRecordingLiveVideo(false);
    if (liveVideoTimerRef.current) {
      clearInterval(liveVideoTimerRef.current);
      liveVideoTimerRef.current = null;
    }

    if (isCameraSimulated) {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#1e293b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('GMC LIVE PATROL VIDEO RECORDING [SIMULATED]', 80, 120);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px monospace';
        ctx.fillText(`LOCATION: Maharaj Bada, Lashkar, Gwalior`, 80, 170);
        ctx.fillText(`DURATION: ${liveVideoSeconds} seconds`, 80, 215);
        ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString('en-IN')}`, 80, 260);

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(960, 540, 80, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(940, 500);
        ctx.lineTo(1000, 540);
        ctx.lineTo(940, 580);
        ctx.fill();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setReportImage(dataUrl);
        addToast({
          issueId: 'camera_sim_video',
          issueTitle: 'Video Captured',
          newStatus: 'success',
          type: 'general',
          message: '4K Simulated Patrol Video clip compiled successfully!'
        });
      }
      stopLiveCamera();
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopLiveCamera();
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (liveVideoTimerRef.current) {
        clearInterval(liveVideoTimerRef.current);
      }
    };
  }, []);

  // Submitting report: Multi-Agent Pipeline Visualization
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportImage || !currentUser) return;

    setIsSubmitting(true);
    setAiPipelineStep(0);

    // Reset log states
    const steps = [
      'Vision Intake Agent',
      'Duplicate-Detection Agent',
      'Priority-Scoring Agent',
      'Routing & Drafting Agent',
      'Predictive Insights Agent'
    ];
    
    setAiTraceLogs(steps.map(step => ({ step, status: 'pending' })));

    // Sequential fake progress visualization for the multi-step trace logs
    for (let i = 0; i < steps.length; i++) {
      setAiPipelineStep(i);
      setAiTraceLogs(prev => prev.map((item, idx) => {
        if (idx < i) return { ...item, status: 'done' as const };
        if (idx === i) return { ...item, status: 'active' as const, detail: 'Executing real-time inference model...' };
        return item;
      }));
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          description: reportDesc,
          latitude: reportLat,
          longitude: reportLng,
          image: reportImage,
          reporterId: currentUser.uid,
          reporterName: currentUser.name,
          reporterAvatar: currentUser.avatar,
          voiceNoteUrl: voiceNoteUrl
        })
      });

      const result = await response.json();

      setAiTraceLogs(prev => prev.map(item => ({ ...item, status: 'done' as const })));
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsSubmitting(false);

      // Clean up fields
      setReportTitle('');
      setReportDesc('');
      setReportImage(null);
      setVoiceNoteUrl(null);
      setVoiceNoteDuration(0);

      // Refresh data
      fetchIssues();
      fetchUser(currentUser.uid);
      fetchStats();
      fetchLeaderboard();

      if (result.merged) {
        setSelectedIssue(result.issue);
        setActiveTab('feed');
        alert(result.message);
      } else {
        setSelectedIssue(result.issue);
        setActiveTab('feed');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setIsSubmitting(false);
    }
  };

  // Helper: map ward colors
  const getWardColor = (ward: string) => {
    switch (ward) {
      case 'Downtown Core': return 'from-teal-500/20 to-teal-500/30 border-teal-500';
      case 'Preston Heights': return 'from-amber-500/20 to-amber-500/30 border-amber-500';
      case 'Eastside Waterfront': return 'from-blue-500/20 to-blue-500/30 border-blue-500';
      case 'South Greenwood': return 'from-emerald-500/20 to-emerald-500/30 border-emerald-500';
      case 'Oakridge District': return 'from-purple-500/20 to-purple-500/30 border-purple-500';
      default: return 'from-slate-500/20 to-slate-500/30 border-slate-500';
    }
  };

  // Helper: check if media is video
  const isMediaVideo = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('data:video/') || 
           url.includes('.mp4') || 
           url.includes('.webm') || 
           url.includes('.ogg') || 
           url.includes('mixkit') || 
           url.startsWith('data:application/octet-stream');
  };

  // Filter Issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            issue.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            issue.ward.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [issues, searchQuery, selectedCategory, selectedStatus]);

  // Deterministic background history generator for analytics
  const simulatedHistory = useMemo(() => {
    const list = [];
    const categories: IssueCategory[] = ['pothole', 'water_leakage', 'streetlight', 'garbage', 'road_damage', 'other'];
    const wards = [
      'Lashkar Zone (Maharaj Bada)',
      'Morar Zone (Thatipur)',
      'City Center Gwalior',
      'Fort & Old Town Area',
      'DD Nagar & Pinto Park'
    ];
    const severities: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];
    const statuses: IssueStatus[] = ['reported', 'verified', 'acknowledged', 'in_progress', 'resolved'];

    // Generate 150 items deterministically
    for (let i = 0; i < 150; i++) {
      const category = categories[i % categories.length];
      const ward = wards[(i * 3) % wards.length];
      const severity = severities[(i * 7) % severities.length];
      const status = statuses[(i * 11) % statuses.length];
      
      // spread in last 30 days
      const daysAgo = (i * 0.18) + 0.2; // 0.2 to 27.2 days ago
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      list.push({
        id: `sim_issue_${i}`,
        category,
        ward,
        severity,
        status,
        createdAt,
        resolutionHours: 12 + ((i * 13) % 48), // 12h to 60h
        confirmations: (i * 7) % 25
      });
    }
    return list;
  }, []);

  // Combined actual + background simulated issues
  const allAnalyticsIssues = useMemo(() => {
    const actual = issues.map(iss => ({
      id: iss.id,
      category: iss.category,
      ward: iss.ward,
      severity: iss.severity,
      status: iss.status,
      createdAt: iss.createdAt,
      resolutionHours: iss.status === 'resolved' ? 28 : 0,
      confirmations: iss.confirmations
    }));
    return [...actual, ...simulatedHistory];
  }, [issues, simulatedHistory]);

  // Filtered issues based on analytics interactive settings
  const filteredAnalyticsIssues = useMemo(() => {
    return allAnalyticsIssues.filter(iss => {
      if (analyticsWard !== 'all' && iss.ward !== analyticsWard) return false;
      
      if (analyticsTime !== 'all') {
        const issDate = new Date(iss.createdAt);
        const now = new Date();
        const diffDays = (now.getTime() - issDate.getTime()) / (1000 * 60 * 60 * 24);
        if (analyticsTime === '24hrs' && diffDays > 1) return false;
        if (analyticsTime === '7days' && diffDays > 7) return false;
        if (analyticsTime === '30days' && diffDays > 30) return false;
      }
      return true;
    });
  }, [allAnalyticsIssues, analyticsWard, analyticsTime]);

  // Key performance indicators derived dynamically from filtered analytics list
  const dynamicAnalyticsStats = useMemo(() => {
    const total = filteredAnalyticsIssues.length;
    const resolved = filteredAnalyticsIssues.filter(i => i.status === 'resolved').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    // avg resolution time of resolved items
    const resolvedItems = filteredAnalyticsIssues.filter(i => i.status === 'resolved' && i.resolutionHours > 0);
    const avgHours = resolvedItems.length > 0 
      ? Math.round(resolvedItems.reduce((acc, curr) => acc + curr.resolutionHours, 0) / resolvedItems.length)
      : 36; // default fallback
      
    // total community actions (engagement)
    const engagements = filteredAnalyticsIssues.reduce((acc, curr) => acc + (curr.confirmations || 0), 0) + (total * 2.5);

    return {
      totalReported: total,
      totalResolved: resolved,
      resolutionRate: rate,
      averageResolutionHours: avgHours,
      activeCitizens: Math.max(12, Math.round(engagements / 4))
    };
  }, [filteredAnalyticsIssues]);

  // Replaces the original static category distribution
  const categoryChartData = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredAnalyticsIssues.forEach(iss => {
      const label = CATEGORIES[iss.category]?.label || iss.category;
      dist[label] = (dist[label] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [filteredAnalyticsIssues]);

  // Severity breakdown (PieChart)
  const severityChartData = useMemo(() => {
    const dist: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    filteredAnalyticsIssues.forEach(iss => {
      dist[iss.severity] = (dist[iss.severity] || 0) + 1;
    });
    return [
      { name: 'Critical', value: dist.critical, color: '#EF4444' },
      { name: 'High', value: dist.high, color: '#F97316' },
      { name: 'Medium', value: dist.medium, color: '#EAB308' },
      { name: 'Low', value: dist.low, color: '#3B82F6' }
    ].filter(item => item.value > 0);
  }, [filteredAnalyticsIssues]);

  // Resolution speed vs target SLA (Radar/Bar comparison)
  const slaChartData = useMemo(() => {
    // Target SLAs: Pothole: 48, Water Leakage: 24, Streetlight: 24, Garbage: 12, Road Damage: 72, Other: 48
    const targets: Record<IssueCategory, number> = {
      pothole: 48,
      water_leakage: 24,
      streetlight: 24,
      garbage: 12,
      road_damage: 72,
      other: 48
    };

    const accum: Record<IssueCategory, { sum: number; count: number }> = {
      pothole: { sum: 0, count: 0 },
      water_leakage: { sum: 0, count: 0 },
      streetlight: { sum: 0, count: 0 },
      garbage: { sum: 0, count: 0 },
      road_damage: { sum: 0, count: 0 },
      other: { sum: 0, count: 0 }
    };

    filteredAnalyticsIssues.forEach(iss => {
      if (iss.status === 'resolved' && iss.resolutionHours > 0) {
        accum[iss.category].sum += iss.resolutionHours;
        accum[iss.category].count += 1;
      }
    });

    return Object.entries(targets).map(([cat, targetVal]) => {
      const label = CATEGORIES[cat as IssueCategory]?.label || cat;
      const dataPoint = accum[cat as IssueCategory];
      const avgActual = dataPoint.count > 0 
        ? Math.round(dataPoint.sum / dataPoint.count)
        : Math.round(targetVal * 0.85); // fallback realistic mock speed based on target

      return {
        category: label,
        Actual: avgActual,
        Target: targetVal
      };
    });
  }, [filteredAnalyticsIssues]);

  // Historical trend of reported vs resolved (AreaChart)
  const historicalTrendData = useMemo(() => {
    // We group by days (if last 7 days or last 24 hrs) or by dates
    // For a consistent gorgeous chart, let's create a 10-day running series tailored to the filters
    const daysToShow = analyticsTime === '7days' ? 7 : analyticsTime === '24hrs' ? 1 : 12;
    const trend = [];
    const now = Date.now();

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      
      // Filter issues on this particular day
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();
      
      const onDay = filteredAnalyticsIssues.filter(iss => {
        const issTime = new Date(iss.createdAt).getTime();
        return issTime >= dayStart && issTime <= dayEnd;
      });

      // Scale calculations for beautiful line movement
      const reported = onDay.length + Math.round((i * 1.5) % 4) + 1;
      const resolved = Math.max(0, onDay.filter(iss => iss.status === 'resolved').length + Math.round((i * 1.1) % 3));

      trend.push({
        date: dateStr,
        Reported: reported,
        Resolved: resolved
      });
    }
    return trend;
  }, [filteredAnalyticsIssues, analyticsTime]);

  const COLORS = ['#F59E0B', '#3B82F6', '#EAB308', '#10B981', '#8B5CF6', '#64748B'];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
      // Simulate predictions based on selected simSeason and simDensity
      let spikePercentage = 0;
      let highestRiskCategory: IssueCategory = 'other';
      let highestRiskWard = '';
      let recommendations: string[] = [];
      let predictedLoadFactor = 1.0;
      let preventiveOrders = '';

      if (simSeason === 'monsoon') {
        spikePercentage = 85;
        highestRiskCategory = 'pothole';
        highestRiskWard = 'City Center Gwalior';
        predictedLoadFactor = 1.85;
        recommendations = [
          'Pre-deploy rapid drainage pump crews at Urwai Gate, City Center underpasses, and Maharaj Bada circular loops.',
          'Issue proactive asphalt hot-mix patch orders for high-traffic Ward 3 & 4 corridors before expected heavy showers.',
          'Divert municipal maintenance personnel from non-urgent tasks to rapid-response water logging dispatch.'
        ];
        preventiveOrders = 'Deploy 4 high-capacity municipal suction pumps and activate rapid pothole patching crews around Maharaj Bada circular road.';
      } else if (simSeason === 'summer') {
        spikePercentage = 40;
        highestRiskCategory = 'water_leakage';
        highestRiskWard = 'DD Nagar & Pinto Park';
        predictedLoadFactor = 1.4;
        recommendations = [
          'Monitor high-pressure pipeline joints near DD Nagar for thermal expansion/contraction leaks.',
          'Optimize municipal tanker distribution rosters to prevent extreme scarcity and pressure surges in residential alleys.',
          'Launch community notification campaign encouraging immediate reporting of minor public tap and main valve seepages.'
        ];
        preventiveOrders = 'Put the Gwalior Water Supply Board rapid repair division on 24/7 standby for high-priority main-line fixes.';
      } else if (simSeason === 'festival') {
        spikePercentage = 125;
        highestRiskCategory = 'garbage';
        highestRiskWard = 'Lashkar Zone (Maharaj Bada)';
        predictedLoadFactor = 2.2;
        recommendations = [
          'Establish double-frequency waste collection shifts at Maharaj Bada and Lashkar market squares.',
          'Deploy 25 heavy-duty temporary steel containers with secondary collection crews near Gwalior Mela grounds.',
          'Coordinate with local merchant unions for zero-litter compliance zones.'
        ];
        preventiveOrders = 'Activate Gwalior Cleansing Drive. Dispatch 6 waste compactor trucks to Lashkar Zone on continuous 4-hour collection loops.';
      } else {
        spikePercentage = 15;
        highestRiskCategory = 'streetlight';
        highestRiskWard = 'Morar Zone (Thatipur)';
        predictedLoadFactor = 1.12;
        recommendations = [
          'Perform standard weekly dusk-to-dawn photosensor surveys across Gwalior.',
          'Ensure strict compliance with the general 24-hour streetlight SLA.',
          'Perform manual recalibration of solar charging controller modules.'
        ];
        preventiveOrders = 'Standard municipal preventive maintenance schedule active. No emergency redeployments required.';
      }

      if (simDensity === 'mela') {
        spikePercentage += 45;
        predictedLoadFactor += 0.45;
        recommendations.unshift('SADA Coordination: Set up a dedicated temporary Civic Services Help Desk inside Gwalior Mela Grounds.');
      } else if (simDensity === 'convoy') {
        recommendations.push('Security Protocol: Perform rapid manual inspection of streetlights, manhole covers, and potholes on the VIP convoy corridor.');
      }

      setSimulationResult({
        spikePercentage,
        highestRiskCategory,
        highestRiskWard,
        recommendations,
        predictedLoad: Math.round(filteredAnalyticsIssues.length * predictedLoadFactor),
        preventiveOrders
      });
      setIsSimulating(false);
    }, 1200);
  };

  // Map zoom and center calculations based on focused landmark
  const mainMapTransformStyle = useMemo(() => {
    const lm = GWALIOR_LANDMARKS.find(l => l.id === focusedLandmarkId);
    if (!lm) {
      return {
        transform: 'translate(0%, 0%) scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
      };
    }
    const pctX = (lm.longitude - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
    const pctY = (MAP_BOUNDS.latMax - lm.latitude) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);
    const translateX = (0.5 - pctX) * 100;
    const translateY = (0.5 - pctY) * 100;
    return {
      transform: `translate(${translateX}%, ${translateY}%) scale(2.2)`,
      transformOrigin: 'center center',
      transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
    };
  }, [focusedLandmarkId]);

  // Filter issues for the map tab
  const filteredMapIssues = useMemo(() => {
    return issues.filter(iss => {
      // 1. Category filter
      if (mapCategoryFilter !== 'all' && iss.category !== mapCategoryFilter) return false;
      // 2. Severity filter
      if (mapSeverityFilter !== 'all' && iss.severity !== mapSeverityFilter) return false;
      // 3. Status filter
      if (mapStatusFilter !== 'all' && iss.status !== mapStatusFilter) return false;
      // 4. Search query
      if (mapSearchQuery.trim() !== '') {
        const q = mapSearchQuery.toLowerCase();
        const matchesTitle = iss.title.toLowerCase().includes(q);
        const matchesDesc = iss.description.toLowerCase().includes(q);
        const matchesWard = (iss.wardName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesWard) return false;
      }
      return true;
    });
  }, [issues, mapCategoryFilter, mapSeverityFilter, mapStatusFilter, mapSearchQuery]);

  // Report map zoom and center calculations based on snap coordinate
  const reportMapTransformStyle = useMemo(() => {
    const snappedLandmark = GWALIOR_LANDMARKS.find(
      landmark => Math.abs(reportLat - landmark.latitude) < 0.001 && Math.abs(reportLng - landmark.longitude) < 0.001
    );
    if (!snappedLandmark) {
      return {
        transform: 'translate(0%, 0%) scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
      };
    }
    const pctX = (snappedLandmark.longitude - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
    const pctY = (MAP_BOUNDS.latMax - snappedLandmark.latitude) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);
    const translateX = (0.5 - pctX) * 100;
    const translateY = (0.5 - pctY) * 100;
    return {
      transform: `translate(${translateX}%, ${translateY}%) scale(2.0)`,
      transformOrigin: 'center center',
      transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
    };
  }, [reportLat, reportLng]);

  const renderAppContent = () => {
    return (
      <div className="flex-1 flex flex-col min-h-0 h-full relative overflow-hidden bg-slate-50 text-slate-800">
        {simNetwork === 'offline' && (
          <div className="bg-red-500 text-white text-[9px] font-black py-1 text-center uppercase tracking-widest shrink-0 z-50">
            ⚠ Offline Mode Enabled • Serving Offline PWA Cache
          </div>
        )}
        {phoneVerificationPendingUser ? (
        <div id="otp-container" className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-orange-950 text-white flex flex-col justify-between font-sans">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white p-2 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white font-display">
                  My Gwalior
                </h1>
                <p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider leading-none mt-0.5">Hyperlocal Community</p>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">🔐 GMC Security Clearance</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In compliance with GMC Security Directive, citizens and authorities must verify both their active mobile number and email address to access the portal.
                </p>
              </div>

              {/* Step Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${verificationStep >= 1 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
                  <div className={`h-0.5 w-10 ${verificationStep >= 2 ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${verificationStep >= 2 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-black px-6 uppercase tracking-wider">
                  <span className={verificationStep === 1 ? 'text-orange-400' : 'text-slate-500'}>1. Mobile Verification</span>
                  <span className={verificationStep === 2 ? 'text-orange-400' : 'text-slate-500'}>2. Email Verification</span>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Profile Identity</span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase">
                    {phoneVerificationPendingUser.role}
                  </span>
                </div>
                <div className="flex items-center space-x-3 pt-1">
                  <img src={phoneVerificationPendingUser.avatar} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{phoneVerificationPendingUser.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{phoneVerificationPendingUser.email}</p>
                  </div>
                </div>
              </div>

              {verificationStep === 1 ? (
                /* Step 1: Mobile OTP Verification */
                <div className="space-y-4">
                  {!otpSentCode ? (
                    <div className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Mobile Number (Indian Standard)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">+91</span>
                          <input
                            type="text"
                            maxLength={10}
                            placeholder="Enter 10-digit mobile number"
                            value={otpSentPhone || (phoneVerificationPendingUser.phone ? phoneVerificationPendingUser.phone.replace('+91 ', '') : '')}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setOtpSentPhone(val);
                            }}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-orange-500 text-white min-h-[44px]"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const num = otpSentPhone || (phoneVerificationPendingUser.phone ? phoneVerificationPendingUser.phone.replace('+91 ', '') : '');
                          if (num.length !== 10) {
                            alert("Please enter a valid 10-digit mobile number.");
                            return;
                          }
                          setIsOtpSending(true);
                          
                          // Simulate sending OTP SMS with a delay
                          setTimeout(() => {
                            const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
                            setOtpSentCode(randomCode);
                            setIsOtpSending(false);
                            setOtpCountdown(60);
                            
                            alert(`💬 Simulated SMS Dispatch: GMC security OTP code is [ ${randomCode} ] for cell +91 ${num}. This OTP is valid for 10 minutes.`);
                          }, 1200);
                        }}
                        disabled={isOtpSending}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-2 min-h-[44px]"
                      >
                        {isOtpSending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating Secure OTP Tunnel...</span>
                          </>
                        ) : (
                          <span>🔒 Send SMS OTP Verification</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Enter 6-Digit OTP Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP code"
                          value={otpInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setOtpInput(val);
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest focus:outline-none focus:border-orange-500 text-white min-h-[44px]"
                        />
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] p-3 rounded-xl leading-relaxed text-center">
                        💬 Simulated SMS OTP sent to <strong>+91 {otpSentPhone || (phoneVerificationPendingUser.phone ? phoneVerificationPendingUser.phone.replace('+91 ', '') : '')}</strong>.<br />
                        Use code <strong className="text-orange-400 underline">{otpSentCode}</strong> to verify!
                      </div>

                      <button
                        onClick={() => {
                          if (otpInput !== otpSentCode) {
                            alert("Invalid verification code. Please enter the correct code shown below.");
                            return;
                          }
                          
                          // Mobile is verified, advance to Step 2
                          const verifiedPhone = `+91 ${otpSentPhone || (phoneVerificationPendingUser.phone ? phoneVerificationPendingUser.phone.replace('+91 ', '') : '')}`;
                          setPhoneVerificationPendingUser(prev => prev ? {
                            ...prev,
                            phone: verifiedPhone,
                            phoneVerified: true
                          } : null);
                          setVerificationStep(2);
                          setOtpSentCode('');
                          setOtpInput('');
                          addToast({
                            issueId: 'mobile_step',
                            issueTitle: 'Mobile Verified',
                            newStatus: 'success',
                            type: 'general',
                            message: 'Mobile number verification complete. Proceeding to Email Verification.'
                          });
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-2 min-h-[44px]"
                      >
                        <span>🔐 Verify Mobile & Next Step</span>
                      </button>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <button
                          onClick={() => {
                            setOtpSentCode('');
                            setOtpInput('');
                          }}
                          className="hover:text-white underline"
                        >
                          Change Number
                        </button>
                        <span>
                          Resend OTP in <strong className="text-orange-400">{otpCountdown}s</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Email OTP Verification */
                <div className="space-y-4">
                  {!emailOtpSentCode ? (
                    <div className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Email Address</label>
                        <input
                          type="email"
                          placeholder="your.email@domain.com"
                          value={emailOtpSentAddress || phoneVerificationPendingUser.email}
                          onChange={(e) => setEmailOtpSentAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-orange-500 text-white min-h-[44px]"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const emailAddr = emailOtpSentAddress || phoneVerificationPendingUser.email;
                          if (!emailAddr.trim() || !emailAddr.includes('@')) {
                            alert("Please enter a valid email address.");
                            return;
                          }
                          setIsEmailOtpSending(true);
                          
                          // Simulate sending Email OTP with a delay
                          setTimeout(() => {
                            const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
                            setEmailOtpSentCode(randomCode);
                            setIsEmailOtpSending(false);
                            setEmailOtpCountdown(60);
                            
                            alert(`📧 Simulated Email Dispatch: Gwalior Municipal Corporation (GMC) safety verification code is [ ${randomCode} ] dispatched to ${emailAddr}.`);
                          }, 1200);
                        }}
                        disabled={isEmailOtpSending}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-2 min-h-[44px]"
                      >
                        {isEmailOtpSending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating Secure Email Link...</span>
                          </>
                        ) : (
                          <span>📧 Send Email OTP Verification</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Enter 6-Digit Email Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit Email code"
                          value={emailOtpInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setEmailOtpInput(val);
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest focus:outline-none focus:border-orange-500 text-white min-h-[44px]"
                        />
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] p-3 rounded-xl leading-relaxed text-center">
                        📧 Simulated Verification Code dispatched to <strong>{emailOtpSentAddress || phoneVerificationPendingUser.email}</strong>.<br />
                        Use code <strong className="text-orange-400 underline">{emailOtpSentCode}</strong> to verify!
                      </div>

                      <button
                        onClick={async () => {
                          if (emailOtpInput !== emailOtpSentCode) {
                            alert("Invalid email verification code. Please enter the correct code shown below.");
                            return;
                          }

                          // Both Phone and Email are verified! Commit to backend
                          try {
                            const finalUser = {
                              ...phoneVerificationPendingUser,
                              email: emailOtpSentAddress || phoneVerificationPendingUser.email,
                              emailVerified: true,
                              phoneVerified: true
                            };

                            const res = await fetch('/api/users/profile', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(finalUser)
                            });

                            if (res.ok) {
                              const data = await res.json();
                              setCurrentUser(data);
                              if (data.role === 'admin') {
                                setUserRole('admin');
                                setShowAdminPanel(true);
                              } else if (data.role === 'authority' && data.verificationStatus === 'verified') {
                                setUserRole('authority');
                                setShowAdminPanel(true);
                              } else {
                                setUserRole('citizen');
                                setShowAdminPanel(false);
                              }
                              setPhoneVerificationPendingUser(null);
                              setOtpSentCode('');
                              setOtpInput('');
                              setOtpSentPhone('');
                              setEmailOtpSentCode('');
                              setEmailOtpInput('');
                              setEmailOtpSentAddress('');
                              setVerificationStep(1);
                              setActiveTab('feed');
                              
                              addToast({
                                issueId: 'dual_verification',
                                issueTitle: 'Security Clearance Passed',
                                newStatus: 'success',
                                type: 'general',
                                message: 'Welcome to Gwalior Nagar Nigam! Your identity (Email & Mobile) has been successfully verified.'
                              });
                            } else {
                              alert("Failed to synchronize verification details with Gwalior database.");
                            }
                          } catch (err) {
                            console.error("Error finalizing verification:", err);
                            alert("Network error. Please try again.");
                          }
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-2 min-h-[44px]"
                      >
                        <span>🔐 Verify Email & Unlock Portal</span>
                      </button>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <button
                          onClick={() => {
                            setEmailOtpSentCode('');
                            setEmailOtpInput('');
                          }}
                          className="hover:text-white underline"
                        >
                          Change Email
                        </button>
                        <span>
                          Resend OTP in <strong className="text-orange-400">{emailOtpCountdown}s</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setPhoneVerificationPendingUser(null);
                  setOtpSentCode('');
                  setOtpInput('');
                  setOtpSentPhone('');
                  setEmailOtpSentCode('');
                  setEmailOtpInput('');
                  setEmailOtpSentAddress('');
                  setVerificationStep(1);
                }}
                className="text-[11px] text-slate-400 hover:text-white block mx-auto underline transition"
              >
                ← Cancel and Back to Sign In
              </button>

            </div>
          </div>

          <footer className="px-6 py-4 border-t border-white/5 text-center text-[10px] text-slate-500">
            Nagar Nigam Gwalior Citizen Portal © 2026. Made with ❤️ for community safety and digital governance.
          </footer>
        </div>
      ) : !currentUser ? (
        <div id="login-container" className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-orange-950 text-white flex flex-col justify-between font-sans">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white p-2 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white font-display">
                  My Gwalior
                </h1>
                <p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider leading-none mt-0.5">Hyperlocal Community</p>
              </div>
            </div>
          </header>

          {/* Content body */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-900/65 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
              
              {/* Left Info Column */}
              <div className="p-8 md:p-12 flex flex-col justify-between bg-gradient-to-b from-slate-900/50 to-slate-950/50 border-t md:border-t-0 md:border-r border-white/5 order-2 md:order-1">
                <div className="space-y-6">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    ⚡ AI-Driven Citizen Governance
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    Report, Track, and Resolve Civic Issues in Gwalior.
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Join Gwalior's smart Nagar Nigam portal where citizens can snap photos of local issues to automatically route reports to officials using real-time AI.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start space-x-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/8">
                    <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Citizens</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Report local issues, earn rewards, and secure Swachh steward achievements.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/8">
                    <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Municipal Authorities</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Review verified dispatch requests and transition official resolutions.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/8">
                    <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">System Admin</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Approve pending authorities, manage wards, and audit live GIS attendance.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Interactive Form Column */}
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-6 bg-slate-950/80 order-1 md:order-2">
                
                {/* Login Selector Tabs */}
                <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/5 space-x-1">
                  <button
                    type="button"
                    onClick={() => setLoginTab('credentials')}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition duration-150 cursor-pointer ${
                      loginTab === 'credentials' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Direct Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginTab('demo')}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition duration-150 cursor-pointer ${
                      loginTab === 'demo' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Quick Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginTab('register')}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition duration-150 cursor-pointer ${
                      loginTab === 'register' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {loginTab === 'credentials' && (
                  /* Credentials Login Panel */
                  <form onSubmit={handleCredentialsLogin} className="space-y-4">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Log In with Credentials</h3>
                      <p className="text-[11px] text-slate-500 mt-1">Enter your registered email and password below to log in securely.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g., piyush.admin@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-orange-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={loginPasswordInput}
                          onChange={(e) => setLoginPasswordInput(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-orange-500 text-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Quick Autofill Suggestion box for Piyush Admin */}
                    <div 
                      onClick={() => {
                        setLoginEmail('piyush.admin@gmail.com');
                        setLoginPasswordInput('Admin');
                      }}
                      className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl p-3 text-indigo-300 text-[11px] leading-relaxed cursor-pointer transition flex items-start space-x-2"
                    >
                      <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-indigo-200">🔒 System Admin Account (Quick Autofill)</p>
                        <p className="text-slate-400 mt-0.5">Email: <span className="font-mono text-white select-all">piyush.admin@gmail.com</span></p>
                        <p className="text-slate-400">Password: <span className="font-mono text-white select-all">Admin</span></p>
                        <span className="text-[10px] text-indigo-400 underline mt-1 block">Click here to auto-fill credentials</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <LogOut className="w-4 h-4 rotate-180" />
                      <span>Authenticate Securely</span>
                    </button>
                  </form>
                )}

                {loginTab === 'demo' && (
                  /* Demo login panel */
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Choose a Profile to Simulate</h3>
                      <p className="text-[11px] text-slate-500 mt-1">Select one of the configured profiles below to experience different roles and levels of access.</p>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {leaderboard.map((user) => {
                        const isAuthority = user.role === 'authority';
                        const isAdmin = user.role === 'admin';
                        let roleBadgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                        let roleLabel = 'Citizen';

                        if (isAdmin) {
                          roleBadgeColor = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                          roleLabel = 'System Admin';
                        } else if (isAuthority) {
                          const levelStr = user.accessLevel === 'level_3' ? 'L3 (Comm.)' : user.accessLevel === 'level_2' ? 'L2 (Head)' : user.accessLevel === 'level_1' ? 'L1 (Insp.)' : 'No Level';
                          roleBadgeColor = user.verificationStatus === 'verified' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                          roleLabel = user.verificationStatus === 'verified' ? `Auth • ${levelStr}` : 'Auth • Unverified';
                        }

                        return (
                          <div
                            key={user.uid}
                            onClick={() => handleLogin(user)}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 hover:bg-white/10 transition duration-150 cursor-pointer group"
                          >
                            <div className="flex items-center space-x-3">
                              <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-white/15 group-hover:border-orange-500/50"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition">{user.name}</h4>
                                <p className="text-[10px] text-slate-400">{user.email || 'No email provided'}</p>
                              </div>
                            </div>
                            
                            <div className="text-right flex flex-col items-end space-y-1">
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                                {roleLabel}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-bold">{user.points} pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {loginTab === 'register' && (
                  /* Registration / custom creation panel */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Register New Gwalior Account</h3>
                      <p className="text-[11px] text-slate-500 mt-1">Define your user type and register a local profile to experience the verification pipeline.</p>
                    </div>

                    {/* Role picker */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Select Profile Role Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setLoginRole('citizen')}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition text-center cursor-pointer ${
                            loginRole === 'citizen'
                              ? 'bg-blue-600/10 border-blue-500 text-white shadow-inner'
                              : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                          }`}
                        >
                          <User className="w-5 h-5 mb-1 text-blue-500" />
                          <span className="text-xs font-extrabold block">Gwalior Citizen</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">Report issues instantly</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setLoginRole('authority')}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition text-center cursor-pointer ${
                            loginRole === 'authority'
                              ? 'bg-red-600/10 border-red-500 text-white shadow-inner'
                              : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                          }`}
                        >
                          <Shield className="w-5 h-5 mb-1 text-red-500" />
                          <span className="text-xs font-extrabold block">Municipal Authority</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">Requires Admin Verification</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Priyansh Dixit"
                          value={loginName}
                          onChange={(e) => setLoginName(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-orange-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g., priyansh@gwaliorcity.gov.in"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-orange-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Password</label>
                        <input
                          type="password"
                          placeholder="Create a password"
                          value={registerPasswordInput}
                          onChange={(e) => setRegisterPasswordInput(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-orange-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Mandatory Mobile Number</label>
                        <input
                          type="text"
                          placeholder="e.g., +91 94251 12345"
                          value={registerPhoneInput}
                          onChange={(e) => setRegisterPhoneInput(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-orange-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Profile Photo</label>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={loginAvatar} 
                              alt="Avatar preview" 
                              className="w-11 h-11 rounded-xl object-cover border border-white/15 shadow-sm shrink-0"
                            />
                            <select
                              value={loginAvatar}
                              onChange={(e) => setLoginAvatar(e.target.value)}
                              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden text-white cursor-pointer font-bold"
                            >
                              <option value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80">Male Portrait (Priyansh)</option>
                              <option value="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80">Female Portrait (Ananya)</option>
                              <option value="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80">Male Portrait (Kabir)</option>
                              <option value="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80">Silhouette Placeholder</option>
                              {loginAvatar && !loginAvatar.startsWith('https://images.unsplash.com') && (
                                <option value={loginAvatar}>Custom Uploaded Photo</option>
                              )}
                            </select>
                          </div>
                          
                          <label className="cursor-pointer bg-slate-800 hover:bg-slate-750 text-slate-200 border border-white/10 hover:border-white/20 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center space-x-1.5 w-full">
                            <Upload className="w-4 h-4 text-orange-500" />
                            <span>Select Custom Photo from Gallery</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setLoginAvatar(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {loginRole === 'authority' && (
                      <div className="space-y-3 p-3 bg-slate-800/40 border border-white/5 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Department & Level (विभाग एवं पद)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-300 block">Department</label>
                            <select
                              value={registerDepartment}
                              onChange={(e) => setRegisterDepartment(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none min-h-[44px] font-semibold"
                            >
                              {Object.entries(DEPARTMENTS).map(([key, val]) => (
                                <option key={key} value={key} className="bg-slate-900 text-slate-200">{val.icon} {val.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-300 block">Proposed Level</label>
                            <select
                              value={registerAuthorityLevel}
                              onChange={(e) => setRegisterAuthorityLevel(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none min-h-[44px] font-semibold"
                            >
                              {Object.entries(AUTHORITY_LEVELS).map(([key, val]) => (
                                <option key={key} value={key} className="bg-slate-900 text-slate-200">{val.badge} {val.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {loginRole === 'authority' && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300 text-[11px] leading-relaxed">
                        ⚠️ <strong>Verification Notice:</strong> Logging in as an Authority starts your profile in the <strong>Pending</strong> state. You must log in as the <strong>System Admin</strong> (Piyush Admin) to approve and assign your required access levels.
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer"
                    >
                      Create and Enter Portal
                    </button>
                  </form>
                )}

              </div>

            </div>
          </div>

          {/* Footer */}
          <footer className="px-6 py-4 border-t border-white/5 text-center text-[10px] text-slate-500">
            Nagar Nigam Gwalior Citizen Portal © 2026. Made with ❤️ for community safety and digital governance.
          </footer>
        </div>
      ) : (
        <>
          {/* Top Header */}
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs px-4 py-3 md:px-8">
        <div className="w-full flex items-center justify-between">
          
          {/* Logo & App Brand */}
          <div id="brand-container" className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => { setActiveTab('feed'); setSelectedIssue(null); }}>
            <div className="hidden sm:block bg-gradient-to-tr from-orange-500 to-amber-500 text-white p-2 rounded-xl shadow-md relative shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse text-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-950 bg-clip-text text-transparent font-display">
                My Gwalior
              </h1>
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider leading-none mt-0.5">Hyperlocal Community</p>
            </div>
          </div>

          {/* Horizontal Navigation (Desktop Views) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-xs">
            <button 
              onClick={() => { setActiveTab('feed'); setSelectedIssue(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'feed' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Issues Feed</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'feed' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {issues.length}
              </span>
            </button>

            <button 
              onClick={() => { setActiveTab('map'); setSelectedIssue(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>

            <button 
              onClick={() => { setActiveTab('report'); setSelectedIssue(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'report' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-blue-600">Report Issue</span>
            </button>

            <button 
              onClick={() => { setActiveTab('dashboard'); setSelectedIssue(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => { setActiveTab('leaderboard'); setSelectedIssue(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'leaderboard' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
            >
              <Award className="w-3.5 h-3.5 text-yellow-500" />
              <span>Leaderboard</span>
            </button>

            <button 
              onClick={() => { setActiveTab('profile'); setSelectedIssue(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            {(currentUser?.role === 'admin' || (currentUser?.role === 'authority' && currentUser?.accessLevel === 'level_3')) && (
              <button 
                onClick={() => { setActiveTab('admin_panel'); setSelectedIssue(null); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'admin_panel' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-950 bg-indigo-50/50'}`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Active Mode Role Switcher / Session Indicator */}
          <div className="flex items-center space-x-2">
            {/* Enter Officer View button removed per user request */}
          </div>

          {/* User Profile Mini Badge & Sign Out */}
          {currentUser && (
            <div className="flex items-center space-x-2">
              <div 
                id="header-profile" 
                className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 p-1.5 rounded-xl transition duration-150 border border-transparent hover:border-slate-200"
                onClick={() => setActiveTab('profile')}
              >
                <div className="text-right flex flex-col items-end justify-center">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">{currentUser.name}</h4>
                  {currentUser.role === 'authority' ? (
                    <div className="text-[8px] sm:text-[9px] text-emerald-600 font-bold flex items-center justify-end gap-1 mt-0.5 font-sans">
                      <span>
                        {currentUser.accessLevel === 'level_3'
                          ? 'Municipal Commissioner'
                          : currentUser.accessLevel === 'level_2'
                          ? 'Dept Head'
                          : 'Field Inspector'}
                      </span>
                    </div>
                  ) : currentUser.role === 'admin' ? (
                    <div className="text-[9px] text-purple-600 font-bold flex items-center justify-end gap-1 mt-0.5 font-sans">
                      <span>System Admin</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end space-x-1.5 text-xs text-amber-600 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>{currentUser.points} pts</span>
                    </div>
                  )}
                </div>
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  referrerPolicy="no-referrer"
                  className={`w-10 h-10 rounded-xl object-cover shadow-xs border-2 ${
                    currentUser.role === 'admin' ? 'border-purple-500' : currentUser.role === 'authority' ? 'border-emerald-500' : 'border-blue-500'
                  }`} 
                />
              </div>

              {/* Sign out Button */}
              <button
                onClick={handleSignOut}
                title="Log Out / Change Profile"
                className="p-2.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 w-full pt-4 pb-4 px-0 md:pt-8 md:pb-8 md:px-0 flex flex-col gap-6">
        
        {/* Primary Dynamic Content Canvas */}
        <section className="w-full">
          
          <AnimatePresence mode="wait">
            
            {/* View 1: Feed tab */}
            {activeTab === 'feed' && !selectedIssue && (
              <motion.div 
                key="feed-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 px-[5px]"
              >
                {/* Search & Filters block - Box styling removed, elements rendered full size */}
                <div className="flex flex-col md:flex-row gap-3 items-center w-full">
                  <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search reported issues by ward, title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Filter category selector */}
                  <div className="flex gap-1.5 w-full md:w-auto shrink-0 overflow-x-auto pb-1.5 md:pb-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs shadow-xs flex-nowrap shrink-0 min-w-max">
                      <button 
                        onClick={() => setSelectedCategory('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                        All
                      </button>
                      {(['water_leakage', 'garbage', 'road_damage', 'pothole', 'streetlight', 'other'] as IssueCategory[]).map((cat) => {
                        const icon = CATEGORIES[cat];
                        return (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                          >
                            <span>{icon.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filter status selector */}
                  <div className="shrink-0 w-full md:w-auto">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700 shadow-xs cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Subtitle / Match summary & Grid Layout Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-3 bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl shadow-2xs">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                      <span className="pl-[2px]">{filteredIssues.length} matching incidents discovered</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 pl-[12px]">Automated citizen tracking and municipal response portal</p>
                  </div>
                  
                  {/* Grid View Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs w-full sm:w-auto">
                    {/* Mobile toggle controls - visible only on mobile */}
                    <div className="flex items-center space-x-2 md:hidden pl-[15px]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Layout:</span>
                      <div className="bg-white border border-slate-200 p-0.5 rounded-xl flex items-center shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setMobileCols(1)}
                          className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
                            mobileCols === 1 
                              ? 'bg-slate-900 text-white shadow-xs' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="1 Card Layout"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileCols(2)}
                          className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
                            mobileCols === 2 
                              ? 'bg-slate-900 text-white shadow-xs' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="2 Cards Parallel"
                        >
                          <Grid className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop toggle controls - visible only on desktop */}
                    <div className="hidden md:flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Grid View:</span>
                      <div className="bg-white border border-slate-200 p-0.5 rounded-xl flex items-center shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setDesktopCols(2)}
                          className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ${
                            desktopCols === 2 
                              ? 'bg-slate-900 text-white shadow-xs font-bold' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="2 Columns Layout"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span className="text-[10px]">2 Columns</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesktopCols(3)}
                          className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ${
                            desktopCols === 3 
                              ? 'bg-slate-900 text-white shadow-xs font-bold' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="3 Columns Layout"
                        >
                          <Grid className="w-3.5 h-3.5" />
                          <span className="text-[10px]">3 Columns</span>
                        </button>
                      </div>
                    </div>

                    {/* Report new button */}
                    <button 
                      onClick={() => setActiveTab('report')}
                      className="md:hidden flex items-center space-x-0.5 text-xs text-blue-600 font-bold hover:underline shrink-0"
                    >
                      <span>Report</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Issues Cards Grid */}
                {filteredIssues.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                    <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h4 className="font-bold text-slate-700 text-lg">No incidents reported</h4>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                      There are no active civic issues matching your search criteria. Switch filters or submit a new hazard.
                    </p>
                    <button 
                      onClick={() => setActiveTab('report')}
                      className="mt-4 px-5 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition"
                    >
                      Report a New Incident
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${
                    mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  } ${
                    desktopCols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                  }`}>
                    {filteredIssues.map((issue) => {
                      const catConfig = CATEGORIES[issue.category];
                      const statusConfig = STATUS_CONFIG[issue.status];
                      const CatIcon = catConfig.icon;

                      return (
                        <div 
                          key={issue.id}
                          className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition duration-200 flex flex-col overflow-hidden group cursor-pointer"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          {/* Image preview */}
                          <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0 group/img">
                            {isMediaVideo(issue.image) ? (
                              <video 
                                src={issue.image} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                autoPlay
                                loop
                                muted
                                playsInline
                              />
                            ) : (
                              <img 
                                src={issue.image} 
                                alt={issue.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />
                            )}

                            {/* Hover Expand Lightbox Button */}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxMedia({
                                    url: issue.image,
                                    title: issue.title,
                                    isVideo: isMediaVideo(issue.image),
                                    issue: issue
                                  });
                                  setLightboxScale(1);
                                  setLightboxRotation(0);
                                }}
                                className="p-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center border border-slate-200"
                                title="Expand image to full-screen"
                              >
                                <Maximize2 className="w-4 h-4 stroke-[2.5px]" />
                              </button>
                            </div>
                            
                            {/* Tags overlaid */}
                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
                              <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-xs bg-white/95 backdrop-blur-xs flex items-center space-x-1 ${catConfig.color}`}>
                                <CatIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                <span className={mobileCols === 2 ? 'hidden sm:inline' : 'inline'}>{catConfig.label}</span>
                              </span>
                            </div>

                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                              <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold shadow-xs flex items-center space-x-1 bg-white/95 backdrop-blur-xs border border-slate-100 ${statusConfig.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
                                  issue.status === 'resolved' ? 'bg-emerald-500' :
                                  issue.status === 'in_progress' ? 'bg-indigo-500' :
                                  issue.status === 'acknowledged' ? 'bg-amber-500' :
                                  issue.status === 'verified' ? 'bg-purple-500' : 'bg-blue-500'
                                }`}></span>
                                <span className={mobileCols === 2 ? 'max-w-[65px] truncate' : ''}>{statusConfig.label}</span>
                              </span>
                            </div>

                            {/* Ward banner bottom */}
                            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                              <span className="bg-slate-900/85 text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm backdrop-blur-xs flex items-center space-x-1 max-w-[120px] sm:max-w-none">
                                <MapPin className="w-2.5 h-2.5 text-red-400 shrink-0" />
                                <span className="truncate">{issue.ward}</span>
                              </span>
                            </div>

                            {/* Priority badge */}
                            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-red-600 text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm">
                              P: {issue.priorityScore}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition line-clamp-1 sm:line-clamp-2">
                                {issue.title}
                              </h4>
                              <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                                {issue.description}
                              </p>
                            </div>

                            {/* Interactions footer */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-xs">
                              {/* Reporter info */}
                              <div className="flex items-center space-x-2 text-slate-600">
                                <img 
                                  src={issue.reporterAvatar} 
                                  alt={issue.reporterName} 
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="font-medium truncate max-w-[110px]">{issue.reporterName}</span>
                              </div>

                              {/* Engagement counters */}
                              <div className="flex items-center space-x-3 text-slate-500">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmIssue(issue.id);
                                  }}
                                  className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg transition ${issue.confirmedBy.includes(currentUser?.uid || '') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100 text-slate-600'}`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>{issue.confirmations}</span>
                                </button>
                                
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{issue.comments.length}</span>
                                </div>
                              </div>

                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </motion.div>
            )}

            {/* View 2: Detailed Single Issue Inspection */}
            {selectedIssue && (
              <motion.div 
                key={`details-view-${selectedIssue.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Back button */}
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-semibold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Feed</span>
                </button>

                {/* Primary Card Block */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                  
                  {/* Left Column: Visuals & Core info */}
                  <div className="lg:col-span-7 border-r border-slate-100 flex flex-col">
                    <div className="h-80 md:h-96 relative group/img overflow-hidden">
                      {isMediaVideo(selectedIssue.image) ? (
                        <video 
                          src={selectedIssue.image} 
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => {
                            setLightboxMedia({
                              url: selectedIssue.image,
                              title: selectedIssue.title,
                              isVideo: true,
                              issue: selectedIssue
                            });
                            setLightboxScale(1);
                            setLightboxRotation(0);
                          }}
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img 
                          src={selectedIssue.image} 
                          alt={selectedIssue.title}
                          className="w-full h-full object-cover cursor-zoom-in group-hover/img:scale-102 transition duration-500"
                          onClick={() => {
                            setLightboxMedia({
                              url: selectedIssue.image,
                              title: selectedIssue.title,
                              isVideo: false,
                              issue: selectedIssue
                            });
                            setLightboxScale(1);
                            setLightboxRotation(0);
                          }}
                        />
                      )}

                      {/* Interactive Expand Overlay on Hover */}
                      <div className="absolute inset-0 bg-slate-900/10 group-hover/img:bg-slate-900/20 transition duration-300 pointer-events-none" />
                      
                      {/* Floating Expand HUD button */}
                      <div className="absolute bottom-4 right-4 z-10">
                        <button
                          onClick={() => {
                            setLightboxMedia({
                              url: selectedIssue.image,
                              title: selectedIssue.title,
                              isVideo: isMediaVideo(selectedIssue.image),
                              issue: selectedIssue
                            });
                            setLightboxScale(1);
                            setLightboxRotation(0);
                          }}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900/85 hover:bg-slate-900 text-white rounded-xl backdrop-blur-xs font-bold text-xs shadow-lg transition transform hover:scale-105"
                          title="Open Fullscreen Lightbox"
                        >
                          <Maximize2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                          <span>Expand</span>
                        </button>
                      </div>
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-white flex items-center space-x-2 ${CATEGORIES[selectedIssue.category].color}`}>
                          {React.createElement(CATEGORIES[selectedIssue.category].icon, { className: 'w-4 h-4' })}
                          <span>{CATEGORIES[selectedIssue.category].label}</span>
                        </span>
                        <span className="bg-slate-900/90 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span>{selectedIssue.ward}</span>
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${STATUS_CONFIG[selectedIssue.status].bg} ${STATUS_CONFIG[selectedIssue.status].text}`}>
                          {STATUS_CONFIG[selectedIssue.status].label}
                        </span>
                        <div className="bg-red-600 text-white text-sm font-black px-2.5 py-1.5 rounded-lg shadow-md flex items-center space-x-1">
                          <span>Priority Index:</span>
                          <strong>{selectedIssue.priorityScore}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 leading-tight">
                          {selectedIssue.title}
                        </h2>
                        
                        <div className="flex items-center space-x-3 text-slate-500 mt-3 text-xs border-b border-slate-100 pb-4">
                          <img 
                            src={selectedIssue.reporterAvatar} 
                            alt={selectedIssue.reporterName} 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span>Reported by <strong>{selectedIssue.reporterName}</strong></span>
                          <span>•</span>
                          <span>{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                        </div>

                        <p className="text-slate-600 text-sm mt-4 leading-relaxed whitespace-pre-line">
                          {selectedIssue.description}
                        </p>

                        {/* Voice Note Section if available */}
                        {selectedIssue.voiceNoteUrl && (
                          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-3">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                              <Volume2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-700">Voice Note Attachment</p>
                              <p className="text-[10px] text-slate-400">Recorded during submission</p>
                            </div>
                            <button className="bg-blue-600 text-white rounded-lg p-1.5 hover:bg-blue-700">
                              <Play className="w-4 h-4 fill-white" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Citizen Community Verification Hub */}
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 mt-6 space-y-5 shadow-xs">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                              <Shield className="w-4.5 h-4.5 text-blue-600" />
                              <span>Citizen Community Verification Hub</span>
                            </h4>
                            <p className="text-slate-500 text-[11px] leading-normal max-w-md">
                              Verify active reports to help city engineers act faster. Reports with 10+ citizen verifications are officially upgraded and prioritized.
                            </p>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md border border-blue-100">
                            +10 Points
                          </span>
                        </div>

                        {/* Progress Tracker */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-600">Verification Progress</span>
                            <span className="text-blue-600 font-bold">{selectedIssue.confirmations} / 10 Citizens</span>
                          </div>
                          
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min((selectedIssue.confirmations / 10) * 100, 100)}%` }}
                            />
                          </div>

                          {selectedIssue.confirmations >= 10 ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold mt-1 animate-pulse">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span>Official Community Verified Status Achieved! Priority escalated (+10 index).</span>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400">
                              Requires {10 - selectedIssue.confirmations} more nearby citizen validations to reach official verified status.
                            </p>
                          )}
                        </div>

                        {/* Interactive Verification Form */}
                        {currentUser ? (
                          selectedIssue.confirmedBy.includes(currentUser.uid) ? (
                            /* Already verified state */
                            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-3">
                              <div className="flex items-start gap-2.5">
                                <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full shrink-0">
                                  <Check className="w-4 h-4 stroke-[3px]" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-emerald-800">You verified this issue</p>
                                  <p className="text-[11px] text-emerald-600 leading-normal">
                                    Your spot verification is officially logged. You earned +10 Civic Points. Thank you for stewardship!
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await handleConfirmIssue(selectedIssue.id);
                                  }}
                                  className="text-[10px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  Retract Verification
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Verification form */
                            <div className="space-y-4">
                              {/* Pill selection */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Verification Role / Relationship
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {(['sight', 'resident', 'commuter'] as const).map((role) => (
                                    <button
                                      key={role}
                                      type="button"
                                      onClick={() => setVerifyRole(role)}
                                      className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold border transition cursor-pointer text-center ${
                                        verifyRole === role
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      {role === 'sight' && '👁️ Eye Witness'}
                                      {role === 'resident' && '🏠 Near My Area'}
                                      {role === 'commuter' && '🚗 Commuter'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* GPS Check-In Toggle */}
                              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 text-xs">
                                <div className="flex items-center gap-2">
                                  <MapPin className={`w-4 h-4 ${verifyGpsCheck ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
                                  <div className="text-left">
                                    <span className="font-bold text-slate-700 block text-[11px]">Secure GPS Spot Verification</span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      Coordinates match: ({selectedIssue.latitude.toFixed(4)}, {selectedIssue.longitude.toFixed(4)})
                                    </span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={verifyGpsCheck}
                                  onChange={(e) => setVerifyGpsCheck(e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500"
                                />
                              </div>

                              {/* Quick tags */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Quick Status Update Tag
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    '⚠️ Issue is active & dangerous',
                                    '🚧 Severe hazard to vehicles',
                                    '💧 Flooding / waste spreading',
                                    '❌ Not resolved yet'
                                  ].map((tag) => (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => setVerifyCustomNote(tag)}
                                      className="py-1 px-2.5 rounded-full text-[9px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom Note input */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Verification Note (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={verifyCustomNote}
                                  onChange={(e) => setVerifyCustomNote(e.target.value)}
                                  placeholder="Provide any helpful onsite observation..."
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition"
                                />
                              </div>

                              {/* Verification Action Button */}
                              <button
                                type="button"
                                onClick={async () => {
                                  // Submit the verification!
                                  const isCurrentlyConfirmed = selectedIssue.confirmedBy.includes(currentUser.uid);
                                  await handleConfirmIssue(selectedIssue.id);

                                  if (!isCurrentlyConfirmed) {
                                    let proofText = `📢 [COMMUNITY VERIFIED] `;
                                    if (verifyRole === 'sight') proofText += `Verified via eye witness site-inspection. `;
                                    if (verifyRole === 'resident') proofText += `Verified by local resident living nearby. `;
                                    if (verifyRole === 'commuter') proofText += `Verified by frequent commuter. `;

                                    if (verifyGpsCheck) {
                                      proofText += `📍 On-spot GPS check-in matched at (${selectedIssue.latitude.toFixed(4)}, ${selectedIssue.longitude.toFixed(4)}). `;
                                    }

                                    if (verifyCustomNote.trim()) {
                                      proofText += `\nObservation: "${verifyCustomNote.trim()}"`;
                                    } else {
                                      proofText += `\nObservation: "I confirm that this issue is active, unresolved, and requires attention."`;
                                    }

                                    try {
                                      await fetch(`/api/issues/${selectedIssue.id}/comments`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          userId: currentUser.uid,
                                          userName: currentUser.name,
                                          userAvatar: currentUser.avatar,
                                          text: proofText
                                        })
                                      });
                                      
                                      setVerifyCustomNote('');
                                      
                                      // Refetch issue to update comments feed in detail panel
                                      const res = await fetch(`/api/issues`);
                                      const allIssues = await res.json();
                                      const updatedIssue = allIssues.find((i: any) => i.id === selectedIssue.id);
                                      if (updatedIssue) {
                                        setIssues(allIssues);
                                        setSelectedIssue(updatedIssue);
                                      }
                                    } catch (err) {
                                      console.error('Error posting verification comment:', err);
                                    }
                                  }
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition transform hover:scale-[1.01]"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Submit Citizen Verification (+10 Points)</span>
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="bg-slate-100 text-slate-600 text-xs text-center py-3 px-4 rounded-xl border border-slate-200">
                            Please log in or register to verify reported community issues and earn Civic Points.
                          </div>
                        )}

                        {/* Avatar stack / proof feed */}
                        <div className="flex items-center gap-2 border-t border-slate-200/60 pt-3 text-[10px] text-slate-500">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            <img 
                              className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-white object-cover" 
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                              alt="Steward" 
                            />
                            <img 
                              className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-white object-cover" 
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                              alt="Steward" 
                            />
                            <img 
                              className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-white object-cover" 
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" 
                              alt="Steward" 
                            />
                          </div>
                          <span>
                            Verified by {selectedIssue.confirmations > 0 ? (
                              <>
                                <strong>Gwalior citizens</strong> and <strong>{selectedIssue.confirmations} steward{selectedIssue.confirmations > 1 ? 's' : ''}</strong>
                              </>
                            ) : (
                              "Gwalior local stewards"
                            )}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right Column: AI Analysis Trace Log & Letter Drafting */}
                  <div className="lg:col-span-5 flex flex-col h-[600px] lg:h-auto overflow-y-auto">
                    
                    {/* Header bar */}
                    <div className="bg-slate-900 text-slate-100 px-6 py-4 flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                      <h3 className="font-bold text-sm tracking-tight uppercase">Multi-Agent AI Analysis Trace</h3>
                    </div>

                    <div className="p-6 bg-slate-950 text-slate-300 space-y-6 flex-1 text-xs font-mono">
                      
                      {selectedIssue.aiAnalysis ? (
                        <>
                          {/* Trace 1: Vision Intake */}
                          <div className="space-y-1.5 border-l border-blue-500/30 pl-3 relative">
                            <div className="absolute left-[-5px] top-0.5 w-2 h-2 rounded-full bg-blue-500" />
                            <div className="flex items-center justify-between">
                              <span className="text-blue-400 font-bold text-[10px] uppercase">1. Vision Intake Agent</span>
                              <span className="text-slate-500 text-[10px]">Conf: {selectedIssue.aiAnalysis.visionIntake.confidence * 100}%</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                              {selectedIssue.aiAnalysis.visionIntake.reasoning}
                            </p>
                          </div>

                          {/* Trace 2: Duplicate Check */}
                          <div className="space-y-1.5 border-l border-emerald-500/30 pl-3 relative">
                            <div className="absolute left-[-5px] top-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-emerald-400 font-bold text-[10px] uppercase">2. Duplicate-Detection Agent</span>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                              {selectedIssue.aiAnalysis.duplicateCheck.explanation}
                            </p>
                          </div>

                          {/* Trace 3: Priority Scoring */}
                          <div className="space-y-1.5 border-l border-purple-500/30 pl-3 relative">
                            <div className="absolute left-[-5px] top-0.5 w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-purple-400 font-bold text-[10px] uppercase">3. Priority-Scoring Agent</span>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                              {selectedIssue.aiAnalysis.priorityScoring.reasoning}
                            </p>
                          </div>

                          {/* Trace 4: Routing & Letter Drafting */}
                          <div className="space-y-2 border-l border-amber-500/30 pl-3 relative">
                            <div className="absolute left-[-5px] top-0.5 w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-amber-400 font-bold text-[10px] uppercase">4. Routing & Drafting Agent</span>
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 max-h-40 overflow-y-auto text-slate-400 text-[10px] leading-relaxed">
                              <strong>Route:</strong> {selectedIssue.aiAnalysis.routingAndDrafting.department}
                              <div className="h-px bg-slate-800 my-1.5" />
                              {selectedIssue.aiAnalysis.routingAndDrafting.draftedLetter}
                            </div>
                          </div>

                          {/* Trace 5: Predictive Insights */}
                          <div className="space-y-1.5 border-l border-red-500/30 pl-3 relative">
                            <div className="absolute left-[-5px] top-0.5 w-2 h-2 rounded-full bg-red-500" />
                            <div className="flex items-center justify-between">
                              <span className="text-red-400 font-bold text-[10px] uppercase">5. Predictive Insights Agent</span>
                              <span className="text-red-500 text-[10px] font-bold">Risk: {selectedIssue.aiAnalysis.predictiveInsights.warningLevel.toUpperCase()}</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-[11px]">
                              <strong>Pattern:</strong> {selectedIssue.aiAnalysis.predictiveInsights.historicalPattern}
                            </p>
                            <p className="text-amber-400 text-[10px] italic">
                              <strong>Advice:</strong> {selectedIssue.aiAnalysis.predictiveInsights.recommendation}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p>AI intelligence logs not generated for this retro report.</p>
                        </div>
                      )}

                    </div>

                  </div>

                </div>

                {/* Status Timeline Progress & Simulated City Controls Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Public Progress Timeline */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-slate-500" />
                      <span>Resolution Audit Log & Timeline</span>
                    </h3>

                    <div className="space-y-6 pt-3 relative pl-4 before:content-[''] before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                      {selectedIssue.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                          <div className={`w-3 h-3 rounded-full absolute left-[-19px] top-1.5 border-2 border-white z-10 ${event.status === 'resolved' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          
                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-tight">
                                {event.title}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {event.description}
                            </p>
                            {event.imageUrl && (
                              <img 
                                src={event.imageUrl} 
                                alt="Timeline verification proof" 
                                className="w-full max-h-48 object-cover rounded-lg border mt-2"
                              />
                            )}
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                              <span>Actioned by: <strong>{event.updatedBy}</strong></span>
                              <span>{new Date(event.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Simulation trigger link */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
                      {userRole === 'citizen' ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-amber-800">
                          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">🔒 View Only Mode</p>
                            <p className="text-[11px] text-amber-700/90 mt-0.5">
                              Only verified Municipal Authorities can transition report status or post official dispatcher logs. If you are an authority, you must wait for the Admin to approve your profile and assign an access level from the Admin Panel.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <span>Authorized Municipal Access</span>
                          </span>
                          <button 
                            onClick={() => setShowAdminPanel(!showAdminPanel)}
                            className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 cursor-pointer"
                          >
                            <Building className="w-3.5 h-3.5" />
                            <span>{showAdminPanel ? 'Close Controller' : 'Open Dispatch Console'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Simulated Admin Control Form Panel */}
                    {userRole === 'authority' && showAdminPanel && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-slate-100 border border-slate-200 rounded-xl p-4 space-y-3 mt-4"
                        onSubmit={handleUpdateStatus}
                      >
                        <h4 className="font-bold text-xs text-slate-700 uppercase flex items-center space-x-1.5">
                          <Shield className="w-4 h-4 text-red-600" />
                          <span>Official Nagar Nigam Operator Console</span>
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Transition Status</label>
                            <select
                              value={adminStatusChange}
                              onChange={(e) => setAdminStatusChange(e.target.value as IssueStatus)}
                              className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden mt-1 cursor-pointer"
                              required
                            >
                              <option value="">Select Status</option>
                              <option value="verified">Verified</option>
                              <option value="acknowledged">Acknowledged</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Authorized Dispatcher</label>
                            <input 
                              type="text" 
                              value="Ward Operations Board"
                              disabled
                              className="w-full bg-slate-200 border rounded-lg px-2.5 py-1.5 text-xs mt-1 text-slate-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Timeline Status Update Note</label>
                          <textarea
                            placeholder="Enter description of dispatch status, crew assignments, or resolving actions..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden mt-1 h-16 resize-none"
                            required
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg transition shadow-xs cursor-pointer"
                        >
                          Submit Official Status Transition
                        </button>
                      </motion.form>
                    )}

                  </div>

                  {/* Public Discussions / Comments Section */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                        <MessageSquare className="w-5 h-5 text-slate-500" />
                        <span>Public Community Board ({selectedIssue.comments.length})</span>
                      </h3>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {selectedIssue.comments.length === 0 ? (
                          <div className="text-center py-10 text-slate-400 text-xs">
                            No community responses yet. Write the first message!
                          </div>
                        ) : (
                          selectedIssue.comments.map((comment) => (
                            <div key={comment.id} className="flex space-x-3 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <img 
                                src={comment.userAvatar} 
                                alt={comment.userName} 
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <strong className="text-slate-800">{comment.userName}</strong>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600">{comment.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* New Comment Submission form */}
                    <form onSubmit={handleAddComment} className="flex gap-2 border-t border-slate-100 pt-4 mt-4">
                      <input 
                        type="text" 
                        placeholder="Write a constructive community query..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
                        required
                      />
                      <button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center justify-center shadow-xs transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>

                </div>

              </motion.div>
            )}

            {/* View 3: Report an Issue tab */}
            {activeTab === 'report' && (
              <motion.div 
                key="report-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-5xl mx-auto text-left"
              >
                {/* Form column */}
                <form onSubmit={handleReportSubmit} className="w-full bg-white rounded-3xl border border-slate-200/80 pt-6 pb-6 pr-[5px] pl-[5px] md:pt-10 md:pb-10 md:pr-[5px] md:pl-[5px] shadow-sm flex flex-col space-y-8">
                  {/* Google style Header with vibrant banner badge */}
                  <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                          AI Smart Intake
                        </span>
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          <span>Auto-routed</span>
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-display pl-[5px] ml-[10px] mr-[10px]">Submit an Incident Report</h2>
                      <p className="text-[10.5px] text-slate-500 mt-1 ml-[15px] mr-[15px] pl-[6px]">Provide local evidence for real-time automated AI cataloging and multi-agent routing.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Grid Column: Details & Multimedia */}
                    <div className="space-y-6">
                      {/* SECTION 1: Core Incident Details */}
                  <div className="bg-slate-50/30 rounded-2xl border border-slate-100/50 pt-0 pr-[12px] pl-[12px] pb-0 ml-0 mr-0 mb-0 space-y-5 text-left">
                    <div className="flex items-center space-x-2.5 border-b border-slate-150 pb-2 mb-2">
                      <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-[12px] font-bold text-slate-800 tracking-tight font-display">1. Incident Details</h3>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[11.5px] font-bold text-slate-700 tracking-wide">Short Descriptive Title</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <Tag className="w-4 h-4" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="e.g. Dangerously deep pothole directly outside Greenwood High"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition duration-200"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 pl-[10px] pr-[10px]">Keep it clear and precise to improve automated department cataloging.</p>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-[11.5px] font-bold text-slate-700 tracking-wide">Context or Description</label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <textarea 
                          placeholder="Detail physical scale, safety issues, duration, or landmarks near the failure..."
                          value={reportDesc}
                          onChange={(e) => setReportDesc(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition duration-200 h-28 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Media Evidence Intake */}
                  <div className="bg-slate-50/30 rounded-2xl border border-slate-100/50 pt-[5px] pb-[5px] pl-[10px] pr-[10px] space-y-5 text-left">
                    <div className="flex items-center space-x-2.5 border-b border-slate-150 pb-2 mb-2">
                      <div className="p-1.5 bg-emerald-50 rounded-xl text-emerald-600">
                        <Camera className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display">2. Multimedia Evidence</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Visual Evidence <span className="text-red-500 font-bold">*</span>
                      </label>
                      
                      {reportImage ? (
                        <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center shadow-inner group">
                          {isMediaVideo(reportImage) ? (
                            <video 
                              src={reportImage} 
                              controls 
                              className="w-full h-full object-contain" 
                              autoPlay 
                              loop 
                              muted
                              playsInline
                            />
                          ) : (
                            <img src={reportImage} alt="Uploaded evidence" className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          
                          <button 
                            type="button"
                            onClick={() => setReportImage(null)}
                            className="absolute top-3.5 right-3.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-2 hover:scale-105 transition-all z-10 cursor-pointer shadow-md"
                            title="Remove image"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                          
                          <div className="absolute bottom-3.5 left-3.5 bg-slate-900/90 text-white text-[9px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center space-x-2 border border-white/10 shadow-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="uppercase tracking-wider font-mono">
                              {isMediaVideo(reportImage) ? '4K Live Video Loaded' : '4K Ultra HD Photo Loaded'}
                            </span>
                          </div>
                        </div>
                      ) : isLiveCameraActive ? (
                        <div className="relative h-96 rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 flex flex-col justify-between shadow-lg">
                          {/* Stream Viewport */}
                          {isCameraSimulated ? (
                            <div className="absolute inset-0 w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                              {/* Glowing digital radar backdrop */}
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-90"></div>
                              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(16,185,129,0.15)_50%,rgba(16,185,129,0.05)_55%,transparent_60%)] animate-[pulse_3s_infinite] pointer-events-none"></div>

                              {/* Target crosshair markers */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none flex items-center justify-center">
                                <div className="w-24 h-24 border border-dashed border-emerald-500/30 rounded-full"></div>
                              </div>

                              <div className="relative z-10 flex flex-col items-center space-y-3.5 max-w-xs">
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse flex items-center justify-center">
                                  <Camera className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-extrabold text-[12px] text-slate-100 uppercase tracking-widest">GMC Virtual Camera Simulator</h4>
                                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                    Iframe sandbox is active. The system has automatically fallback-synchronized with the Maharaj Bada central feed telemetry.
                                  </p>
                                </div>
                                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[9px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                  <span>Simulator Active</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <video 
                              ref={liveVideoRef} 
                              autoPlay 
                              playsInline 
                              muted 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          
                          {/* DSLR Style Grid Lines Overlay */}
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                            <div className="border-b border-r border-white/30"></div>
                            <div className="border-b border-r border-white/30"></div>
                            <div className="border-b border-white/30"></div>
                            <div className="border-b border-r border-white/30"></div>
                            <div className="border-b border-r border-white/30"></div>
                            <div className="border-b border-white/30"></div>
                            <div className="border-r border-white/30"></div>
                            <div className="border-r border-white/30"></div>
                            <div></div>
                          </div>

                          {/* Top HUD Bar */}
                          <div className="relative z-10 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white text-[10px] font-mono">
                            <div className="flex items-center space-x-2 bg-black/40 px-2 py-1 rounded-full">
                              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                              <span className="font-bold tracking-wider uppercase">{liveCameraMode === 'video' ? 'VIDEO REC' : 'PHOTO STANDBY'}</span>
                            </div>
                            <div className="bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full tracking-widest text-[8px] uppercase">
                              4K UHD
                            </div>
                            <div className="text-slate-300 bg-black/40 px-2 py-1 rounded-full">
                              {cameraResolution}
                            </div>
                          </div>

                          {/* Camera Error Alert if any */}
                          {cameraError && (
                            <div className="absolute inset-x-4 top-1/3 z-20 bg-red-950/95 border border-red-500/30 p-4 rounded-xl text-red-200 text-xs text-center shadow-md">
                              {cameraError}
                            </div>
                          )}

                          {/* Recording status overlay */}
                          {isRecordingLiveVideo && (
                            <div className="absolute inset-0 z-5 bg-red-500/5 animate-pulse pointer-events-none border-4 border-red-500 rounded-2xl"></div>
                          )}

                          {/* Bottom Control Bar */}
                          <div className="relative z-10 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col items-center space-y-3">
                            {isRecordingLiveVideo && (
                              <div className="text-white text-[10px] font-mono font-bold bg-red-600 px-3 py-1 rounded-full animate-pulse flex items-center space-x-1.5 shadow-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                <span>REC {Math.floor(liveVideoSeconds / 60)}:{(liveVideoSeconds % 60).toString().padStart(2, '0')}</span>
                              </div>
                            )}

                            <div className="w-full flex items-center justify-between">
                              {/* Toggle Mode */}
                              {!isRecordingLiveVideo ? (
                                <div className="bg-black/60 p-1 rounded-full flex border border-white/10 space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => startLiveCamera('photo')}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${liveCameraMode === 'photo' ? 'bg-white text-black' : 'text-slate-300 hover:text-white'}`}
                                  >
                                    <Camera className="w-3 h-3" />
                                    <span>Photo</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startLiveCamera('video')}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${liveCameraMode === 'video' ? 'bg-white text-black' : 'text-slate-300 hover:text-white'}`}
                                  >
                                    <Video className="w-3 h-3" />
                                    <span>Video</span>
                                  </button>
                                </div>
                              ) : (
                                <div />
                              )}

                              {/* Center Capture Shutter Trigger */}
                              <div className="flex items-center justify-center">
                                {liveCameraMode === 'photo' ? (
                                  <button
                                    type="button"
                                    onClick={captureLivePhoto}
                                    className="w-14 h-14 rounded-full border-4 border-white bg-white/20 hover:bg-white active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer"
                                    title="Capture 4K Photo"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-white shadow-inner"></div>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={isRecordingLiveVideo ? stopRecordingLiveVideo : startRecordingLiveVideo}
                                    className={`w-14 h-14 rounded-full border-4 transition-all active:scale-95 flex items-center justify-center shadow-lg cursor-pointer ${isRecordingLiveVideo ? 'border-red-500 bg-red-500/20' : 'border-white bg-white/20'}`}
                                    title={isRecordingLiveVideo ? 'Stop Recording' : 'Start 4K Recording'}
                                  >
                                    <div className={`rounded-sm transition-all duration-300 ${isRecordingLiveVideo ? 'w-4 h-4 bg-red-600 rounded' : 'w-10 h-10 bg-red-600 rounded-full'}`}></div>
                                  </button>
                                )}
                              </div>

                              {/* Exit / Cancel Stream */}
                              <button
                                type="button"
                                onClick={stopLiveCamera}
                                className="px-4 py-2 rounded-full text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center space-x-1 cursor-pointer border border-white/5"
                              >
                                <span>Exit</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            {/* Drag & Drop Manual file chooser */}
                            <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl p-6 text-center cursor-pointer flex flex-col justify-center items-center h-48 bg-slate-50/50 transition duration-300 group shadow-2xs">
                              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition duration-300">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                              <span className="text-sm font-bold text-slate-800">Upload Local Evidence</span>
                              <span className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">Drag files here, click to browse PNG, JPG, MP4</span>
                              <span className="inline-block mt-2.5 text-[9px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-bold">Max 50MB</span>
                              <input 
                                type="file" 
                                accept="image/*,video/*"
                                className="hidden" 
                                onChange={handleImageUpload}
                              />
                            </label>
                          </div>
                          
                           {/* Live Camera Actions Area */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => startLiveCamera('photo')}
                              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-98"
                            >
                              <Camera className="w-4 h-4 text-orange-400 animate-pulse" />
                              <span className="text-[10.5px] leading-[12px]">Take Live Photo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => startLiveCamera('video')}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl py-3 text-xs font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-98"
                            >
                              <Video className="w-4 h-4" />
                              <span className="text-[10.5px] h-[12px]">Record Live Video</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Voice Note Attachment Simulator */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 tracking-wide">Voice Note Explanation (Optional)</label>
                      <div className="border border-slate-200 bg-white rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                        {isRecording ? (
                          <div className="flex items-center space-x-3.5">
                            {/* Modern soundwave simulation */}
                            <div className="flex items-center space-x-0.5 h-6">
                              {Array.from({ length: 6 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-red-500 rounded-full"
                                  animate={{
                                    height: [6, 18, 6],
                                  }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 0.4 + i * 0.08,
                                    ease: "easeInOut",
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-mono font-black text-red-600 animate-pulse">Recording: {voiceNoteDuration}s</span>
                          </div>
                        ) : voiceNoteUrl ? (
                          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
                            <div className="p-1 bg-emerald-50 rounded-full">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <span>Voice instruction file attached successfully</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center space-x-1.5">
                            <Mic className="w-3.5 h-3.5 text-slate-400" />
                            <span>Capture local context or instructions instantly</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs active:scale-95 ${isRecording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'}`}
                        >
                          {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-blue-600" />}
                          <span>{isRecording ? 'Stop' : voiceNoteUrl ? 'Record Again' : 'Record'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                    </div> {/* Closes Left Grid Column: Details & Multimedia */}

                    {/* Right Grid Column: Location & Mapping */}
                    <div className="space-y-6">
                      {/* SECTION 3: Evidence Live GPS Capture */}
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-5 mb-[9px] space-y-4 text-left shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600">
                              <Compass className="w-4 h-4 animate-spin-slow" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display">3. Evidence Live GPS Capture</h3>
                              <p className="text-[10px] text-slate-500 font-medium">Verify actual on-field location for instant municipal action</p>
                            </div>
                          </div>
                          
                          {/* Live signal indicator */}
                          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
                            <span className="relative flex h-2 w-2">
                              {geolocationStatus.type === 'loading' ? (
                                <>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </>
                              ) : geolocationStatus.type === 'success' ? (
                                <>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </>
                              ) : geolocationStatus.type === 'error' ? (
                                <>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </>
                              ) : (
                                <>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                                </>
                              )}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                              {geolocationStatus.type === 'idle' && 'No Lock'}
                              {geolocationStatus.type === 'loading' && 'Locking...'}
                              {geolocationStatus.type === 'success' && 'GPS Live'}
                              {geolocationStatus.type === 'error' && 'Failed'}
                            </span>
                          </div>
                        </div>

                        {/* Displays coordinates as premium digital gauges */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col shadow-2xs relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Evidence Lat</span>
                            <span className="text-xs font-mono font-bold text-slate-800 mt-1">{reportLat.toFixed(5)}° N</span>
                          </div>
                          <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col shadow-2xs relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Evidence Lng</span>
                            <span className="text-xs font-mono font-bold text-slate-800 mt-1">{reportLng.toFixed(5)}° E</span>
                          </div>
                        </div>

                        {/* Informational guide */}
                        <p className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/30 border border-blue-100/50 rounded-xl p-3">
                          💡 <strong>Why this matters:</strong> By sharing your live location, you provide Gwalior authorities with verified satellite coordinates. This enables field engineers to navigate directly to the spot without delays.
                        </p>

                        {/* Action Button */}
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={handleGeoLocation}
                            className={`w-full flex items-center justify-center space-x-2.5 border font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition duration-300 cursor-pointer shadow-2xs active:scale-99 ${
                              geolocationStatus.type === 'loading'
                                ? 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse'
                                : geolocationStatus.type === 'success'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100/80'
                                : geolocationStatus.type === 'error'
                                ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100/80'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-sm'
                            }`}
                          >
                            <Compass className={`w-4 h-4 ${geolocationStatus.type === 'loading' ? 'animate-spin' : ''}`} />
                            <span className="text-[11px]">
                              {geolocationStatus.type === 'loading'
                                ? 'Connecting to GPS Satellites...'
                                : geolocationStatus.type === 'success'
                                ? 'GPS Signal Locked! Tap to Refresh'
                                : geolocationStatus.type === 'error'
                                ? 'GPS Blocked - Tap to Retry'
                                : 'Share Evidence Live GPS Location'}
                            </span>
                          </button>

                          {geolocationStatus.message && (
                            <div className={`p-2.5 rounded-lg text-[10px] font-bold text-center border ${
                              geolocationStatus.type === 'success'
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700'
                                : geolocationStatus.type === 'error'
                                ? 'bg-rose-50/50 border-rose-200 text-rose-700'
                                : 'bg-amber-50/50 border-amber-200 text-amber-700'
                            }`}>
                              {geolocationStatus.message}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SECTION 4: Digital Twin Pin Placement */}
                      <div className="bg-slate-50/30 rounded-2xl border border-slate-100/50 pl-[5px] pr-[5px] pt-[10px] pb-[5px] mb-[15px] space-y-4 text-left">
                        {/* Modern Google-style Header */}
                        <div className="flex items-center space-x-2.5 border-b border-slate-150 pb-2 mb-2">
                          <div className="p-1.5 bg-rose-50 rounded-xl text-rose-500">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-slate-800 text-sm tracking-tight font-display">4. Digital Twin Pin Placement</h3>
                          </div>
                        </div>
                    
                    <p className="text-[10.5px] text-slate-500 leading-relaxed text-left pl-[5px] ml-[5px] mb-[10px]">
                      Click anywhere on the styled map grid below to re-center the incident marker, or snap directly to a known landmark.
                    </p>

                    {/* Gwalior Reference Landmarks Quick Snap Selector */}
                    <div className="mb-5 bg-white border border-slate-200/60 pt-[13px] pl-[5px] pr-[5px] pb-4 rounded-2xl text-left shadow-2xs w-[340.333px]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                          <Building className="w-4 h-4 text-amber-500" />
                          <span className="text-[11px]">Gwalior Landmark References:</span>
                        </span>
                        {GWALIOR_LANDMARKS.some(l => Math.abs(reportLat - l.latitude) < 0.001 && Math.abs(reportLng - l.longitude) < 0.001) && (
                          <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Snapped
                          </span>
                        )}
                      </div>
                      
                      {/* Horizontally scrolling pill capsules */}
                      <div className="flex items-center space-x-2.5 overflow-x-auto pb-[5px] w-[330px] h-[57.8333px] pt-[5px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {GWALIOR_LANDMARKS.map(landmark => {
                          const isCurrentlySnapped = Math.abs(reportLat - landmark.latitude) < 0.001 && Math.abs(reportLng - landmark.longitude) < 0.001;
                          return (
                            <button
                              key={landmark.id}
                              type="button"
                              onClick={() => {
                                setReportLat(landmark.latitude);
                                setReportLng(landmark.longitude);
                              }}
                              className={`text-[11px] px-3.5 py-2 rounded-full border font-bold transition-all duration-300 flex items-center space-x-2 shrink-0 cursor-pointer shadow-2xs hover:scale-102 ${
                                isCurrentlySnapped
                                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 border-amber-600 text-white ring-4 ring-amber-500/10'
                                  : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                              }`}
                              title={landmark.description}
                            >
                              <img
                                src={landmark.image}
                                alt={landmark.name}
                                referrerPolicy="no-referrer"
                                className="w-4.5 h-4.5 rounded-full object-cover shrink-0 border border-white/20"
                              />
                              <span>{landmark.name.split(' (')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Map Mode Selector Tabs */}
                    <div className="flex items-center justify-between mb-3.5 bg-slate-100/80 p-1 pr-[13.25px] pl-[13.25px] rounded-xl border border-slate-200/50">
                      <span className="text-xs font-bold text-slate-600 ml-2.5">Mapping Engine:</span>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => setReportMapMode('svg')}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportMapMode === 'svg' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Concept Grid
                        </button>
                        <button
                          type="button"
                          onClick={() => setReportMapMode('google')}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportMapMode === 'google' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Live Google Map
                        </button>
                      </div>
                    </div>

                    {/* Interactive Mock Map Canvas or Google Map */}
                    {reportMapMode === 'google' && hasValidGoogleMapsKey ? (
                      <div className="h-[360px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-md relative">
                        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                          <GoogleMap
                            defaultCenter={{ lat: 26.2183, lng: 78.1828 }}
                            defaultZoom={13}
                            mapId="REPORT_MAP_ID_MOCK"
                            onClick={(e) => {
                              if (e.detail.latLng) {
                                setReportLat(e.detail.latLng.lat);
                                setReportLng(e.detail.latLng.lng);
                              }
                            }}
                            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                            style={{ width: '100%', height: '100%' }}
                          >
                            {/* Landmarks */}
                            {GWALIOR_LANDMARKS.map(lm => (
                              <AdvancedMarker
                                key={lm.id}
                                position={{ lat: lm.latitude, lng: lm.longitude }}
                                onClick={() => {
                                  setReportLat(lm.latitude);
                                  setReportLng(lm.longitude);
                                }}
                              >
                                <Pin background="#f59e0b" borderColor="#fff" glyphColor="#fff" scale={0.8} />
                              </AdvancedMarker>
                            ))}
                            
                            {/* Current Placed Pin */}
                            <AdvancedMarker
                              position={{ lat: reportLat, lng: reportLng }}
                              draggable={true}
                              onDragEnd={(e) => {
                                if (e.latLng) {
                                  setReportLat(e.latLng.lat());
                                  setReportLng(e.latLng.lng());
                                }
                              }}
                            >
                              <Pin background="#3b82f6" borderColor="#fff" glyphColor="#fff" />
                            </AdvancedMarker>
                          </GoogleMap>
                        </APIProvider>
                      </div>
                    ) : reportMapMode === 'google' ? (
                      <div className="h-[360px] rounded-3xl bg-slate-900 border border-slate-850 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                        <div className="p-3 bg-blue-950/50 rounded-full border border-blue-500/10">
                          <MapPin className="w-8 h-8 text-blue-400 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Google Maps API Key Required</h4>
                        <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                          To view the live Google Street and Satellite map overlay, configure a Google Maps Platform API Key in your AI Studio environment.
                        </p>
                        <div className="text-left bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[9px] text-slate-400 max-w-xs space-y-1 font-mono">
                          <p className="font-bold text-slate-200">🛠️ Quick Setup:</p>
                          <p>1. Open Settings (⚙️ top-right)</p>
                          <p>2. Go to Secrets</p>
                          <p>3. Create: <code className="text-blue-400 font-bold">GOOGLE_MAPS_PLATFORM_KEY</code></p>
                          <p>4. Paste key and hit Enter</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReportMapMode('svg')}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-all"
                        >
                          ← Back to Interactive Grid Map
                        </button>
                      </div>
                    ) : (
                      <div 
                        id="interactive-canvas-map"
                        className="h-[360px] bg-slate-950 border border-slate-900 rounded-3xl relative overflow-hidden flex items-center justify-center select-none cursor-crosshair shadow-lg"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pctX = (e.clientX - rect.left) / rect.width;
                          const pctY = (e.clientY - rect.top) / rect.height;
                          
                          // Map percent to custom lat/lng coordinates bounds
                          const lat = MAP_BOUNDS.latMax - (pctY * (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin));
                          const lng = MAP_BOUNDS.lngMin + (pctX * (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin));
                          
                          setReportLat(lat);
                          setReportLng(lng);
                        }}
                      >
                        {/* Zoomable & Centerable Map Layers Wrapper */}
                        <div style={reportMapTransformStyle} className="absolute inset-0 w-[359px] h-[359px]">
                          {/* Grid background lines */}
                          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.05] pointer-events-none">
                            {Array.from({ length: 36 }).map((_, i) => (
                              <div key={i} className="border border-white" />
                            ))}
                          </div>

                          {/* Map zones styling representing the wards */}
                          <div className="absolute inset-x-0 top-0 h-1/3 bg-teal-500/5 flex items-center justify-center border-b border-dashed border-teal-500/10 pointer-events-none">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-400/80 absolute top-2 font-display">Gwalior Fort & Old Town (Teal Sector)</span>
                          </div>
                          <div className="absolute left-0 bottom-0 w-1/2 h-2/3 bg-emerald-500/5 flex items-center justify-center border-r border-dashed border-emerald-500/10 pointer-events-none">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400/80 absolute bottom-2 font-display">Lashkar / Maharaj Bada</span>
                          </div>
                          <div className="absolute right-0 bottom-0 w-1/2 h-2/3 bg-purple-500/5 flex items-center justify-center pointer-events-none">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-purple-400/80 absolute bottom-2 font-display">City Center & Morar</span>
                          </div>

                          {/* Gwalior Reference Landmarks pins inside report picker map */}
                          {GWALIOR_LANDMARKS.map(landmark => {
                            const pctX = (landmark.longitude - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
                            const pctY = (MAP_BOUNDS.latMax - landmark.latitude) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);

                            const isCurrentlySnapped = Math.abs(reportLat - landmark.latitude) < 0.001 && Math.abs(reportLng - landmark.longitude) < 0.001;

                            return (
                              <div
                                key={landmark.id}
                                className="absolute cursor-pointer group z-10 transition-transform duration-200"
                                style={{ 
                                  left: `${pctX * 100}%`, 
                                  top: `${pctY * 100}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportLat(landmark.latitude);
                                  setReportLng(landmark.longitude);
                                }}
                              >
                                {/* Visual landmark pin */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm relative transition-all duration-200 ${
                                  isCurrentlySnapped 
                                    ? 'bg-amber-500 border-white text-white scale-110 ring-4 ring-amber-500/30' 
                                    : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:scale-110'
                                }`}>
                                  <Building className="w-3 h-3" />
                                  
                                  {/* Pulse wave behind selected landmark */}
                                  {isCurrentlySnapped && (
                                    <span className="absolute -inset-1 rounded-full bg-amber-400 opacity-20 animate-ping pointer-events-none" />
                                  )}
                                </div>

                                {/* Label box showing name */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap opacity-60 group-hover:opacity-100 transition duration-200 pointer-events-none flex flex-col items-center">
                                  <span>{landmark.name.split(' (')[0]}</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Existing active incidents plotted on map */}
                          {issues.map(iss => {
                            const pctX = (iss.longitude - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
                            const pctY = (MAP_BOUNDS.latMax - iss.latitude) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);

                            return (
                              <div
                                key={iss.id}
                                className="absolute w-2 h-2 rounded-full bg-red-500 border border-white animate-pulse z-5"
                                style={{ 
                                  left: `${pctX * 100}%`, 
                                  top: `${pctY * 100}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                                title={iss.title}
                              />
                            );
                          })}

                          {/* Current Draggable/Placed pin */}
                          {(() => {
                            const pctX = (reportLng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
                            const pctY = (MAP_BOUNDS.latMax - reportLat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);
                            
                            return (
                              <motion.div 
                                className="absolute z-20 pointer-events-none"
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ 
                                  left: `${pctX * 100}%`, 
                                  top: `${pctY * 100}%`,
                                  transform: 'translate(-50%, -100%)'
                                }}
                              >
                                <MapPin className="w-8 h-8 text-rose-500 fill-rose-500 filter drop-shadow-md" />
                              </motion.div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed text-left flex items-start space-x-2 shadow-2xs">
                    <div className="p-1 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong>Dynamic Calibration:</strong> Relocating the pin automatically updates the dispatch sector. This matches geographic coordinates to municipal responsibility domains, optimizing response times.
                    </span>
                  </div>
                    </div> {/* Closes Right Grid Column: Location & Mapping */}
                  </div> {/* Closes the main two-column grid */}

                  {/* Dispatch Button Footer */}
                  <div className="border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      disabled={!reportTitle.trim() || !reportImage}
                      className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200/60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-xs hover:shadow-sm cursor-pointer transition-all duration-300 flex items-center justify-center space-x-2 text-sm tracking-wide active:scale-[0.98]"
                    >
                      <Sparkles className={`w-4 h-4 ${(!reportTitle.trim() || !reportImage) ? 'text-slate-300' : 'text-amber-300 animate-pulse'}`} />
                      <span className="text-[11.37px]">Submit Report to Multi-Agent AI Pipeline</span>
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

            {/* View 4: Full Interactive Map Tab */}
            {activeTab === 'map' && (
              <motion.div 
                key="map-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 font-display">Gwalior Incident Grid & Landmark Navigator</h2>
                    <p className="text-xs text-slate-500">Live operational theater tracking unresolved civic issues with key reference landmarks.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1">
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                      <span>Critical Hotspots Active</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Column: Landmark Reference Navigator */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-2 pb-1.5 mb-1.5 font-display border-b border-slate-100">
                        <Building className="w-3.5 h-3.5 text-orange-500" />
                        <span>Gwalior Landmarks</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                        Select a landmark to highlight its location on the map grid and check active nearby issues.
                      </p>

                      <div className="relative mb-2">
                        <input
                          type="text"
                          placeholder="Search landmark..."
                          value={landmarkSearch}
                          onChange={(e) => setLandmarkSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      </div>
                      
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                        <button
                          onClick={() => setFocusedLandmarkId(null)}
                          className={`w-full text-left p-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-between cursor-pointer ${
                            !focusedLandmarkId 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>Show All Reference Points</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                            {GWALIOR_LANDMARKS.length}
                          </span>
                        </button>

                        {GWALIOR_LANDMARKS
                          .filter(l => 
                            l.name.toLowerCase().includes(landmarkSearch.toLowerCase()) || 
                            l.description.toLowerCase().includes(landmarkSearch.toLowerCase())
                          )
                          .map(landmark => {
                            const isFocused = focusedLandmarkId === landmark.id;
                            
                            // Count issues within ~0.015 coordinates range of this landmark (close proximity)
                            const nearbyCount = filteredMapIssues.filter(iss => 
                              Math.abs(iss.latitude - landmark.latitude) < 0.015 && 
                              Math.abs(iss.longitude - landmark.longitude) < 0.015
                            ).length;

                          return (
                            <button
                              key={landmark.id}
                              onClick={() => setFocusedLandmarkId(landmark.id)}
                              className={`w-full text-left p-1.5 rounded-xl border transition flex items-start space-x-2 cursor-pointer ${
                                isFocused 
                                  ? 'bg-gradient-to-tr from-orange-50 to-amber-50 border-orange-200 shadow-2xs ring-2 ring-orange-500/10' 
                                  : 'bg-white hover:bg-slate-50 border-slate-150'
                              }`}
                            >
                              <img
                                src={landmark.image}
                                alt={landmark.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 shadow-2xs"
                              />
                              <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-bold text-slate-800 text-[10px] truncate pr-1">{landmark.name.split(' (')[0]}</span>
                                  {nearbyCount > 0 && (
                                    <span className="text-[8px] bg-red-100 text-red-800 px-1 py-0.2 rounded-full font-bold shrink-0">
                                      {nearbyCount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-slate-400 line-clamp-1 leading-normal">{landmark.description}</p>
                                <div className="flex items-center space-x-1 text-[8px] text-slate-400 font-mono">
                                  <span>{landmark.latitude.toFixed(3)}°N</span>
                                  <span>•</span>
                                  <span>{landmark.longitude.toFixed(3)}°E</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {focusedLandmarkId && (
                      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
                        {(() => {
                          const lm = GWALIOR_LANDMARKS.find(l => l.id === focusedLandmarkId);
                          if (!lm) return null;
                          const nearby = filteredMapIssues.filter(iss => 
                            Math.abs(iss.latitude - lm.latitude) < 0.015 && 
                            Math.abs(iss.longitude - lm.longitude) < 0.015
                          );

                          return (
                            <div className="space-y-3">
                              <div className="relative rounded-xl overflow-hidden border border-orange-100 shadow-2xs">
                                <img 
                                  src={lm.image} 
                                  alt={lm.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-24 object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                                  <span className="text-white font-bold text-xs font-display">{lm.name}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-700">Proximity Health Check</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                  Analysis around <strong className="text-slate-700">{lm.name.split(' (')[0]}</strong>:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                  <div className="bg-white p-2 rounded-lg border">
                                    <div className="text-slate-400">Total Nearby</div>
                                    <div className="text-xs font-bold text-slate-800 mt-0.5">{nearby.length} issues</div>
                                  </div>
                                  <div className="bg-white p-2 rounded-lg border">
                                    <div className="text-slate-400">Max Severity</div>
                                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                                      {nearby.some(n => n.severity === 'critical') ? 'CRITICAL' : nearby.some(n => n.severity === 'high') ? 'HIGH' : nearby.length > 0 ? 'STANDARD' : 'NONE'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Main Large Interactive Map Canvas */}
                  <div className="lg:col-span-3 space-y-4 flex flex-col">
                    {/* Horizontal Landmark Quick Selection Row */}
                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                          <Building className="w-4 h-4 text-orange-500 animate-pulse" />
                          <span>Quick landmark focus:</span>
                        </span>
                        {focusedLandmarkId && (
                          <button
                            onClick={() => setFocusedLandmarkId(null)}
                            className="text-[10px] text-orange-600 hover:text-orange-700 font-extrabold cursor-pointer transition flex items-center space-x-1"
                          >
                            <span>Clear Focus</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          onClick={() => setFocusedLandmarkId(null)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                            !focusedLandmarkId 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span>Show All</span>
                        </button>
                        {GWALIOR_LANDMARKS.map(landmark => {
                          const isFocused = focusedLandmarkId === landmark.id;
                          const nearbyCount = filteredMapIssues.filter(iss => 
                            Math.abs(iss.latitude - landmark.latitude) < 0.015 && 
                            Math.abs(iss.longitude - landmark.longitude) < 0.015
                          ).length;
                          return (
                            <button
                              key={landmark.id}
                              onClick={() => setFocusedLandmarkId(landmark.id)}
                              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                                isFocused 
                                  ? 'bg-gradient-to-tr from-orange-50 to-amber-50 border-orange-500 text-orange-900 shadow-sm ring-2 ring-orange-500/10' 
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <img
                                src={landmark.image}
                                alt={landmark.name}
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-md object-cover shrink-0 border border-slate-200"
                              />
                              <span>{landmark.name.split(' (')[0]}</span>
                              {nearbyCount > 0 && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                                  isFocused ? 'bg-orange-500 text-white' : 'bg-red-100 text-red-800'
                                }`}>
                                  {nearbyCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Issue Filters Panel */}
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <div className="flex items-center space-x-2">
                          <Filter className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-700">Filter Incidents on Map:</span>
                        </div>
                        {/* Status Count badge */}
                        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                          <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                            Showing {filteredMapIssues.length} of {issues.length} Incidents
                          </span>
                          {(mapCategoryFilter !== 'all' || mapSeverityFilter !== 'all' || mapStatusFilter !== 'all' || mapSearchQuery !== '') && (
                            <button
                              onClick={() => {
                                setMapCategoryFilter('all');
                                setMapSeverityFilter('all');
                                setMapStatusFilter('all');
                                setMapSearchQuery('');
                              }}
                              className="text-[10px] text-red-600 hover:text-red-700 font-extrabold cursor-pointer transition"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter Controls Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search title, details, ward..."
                            value={mapSearchQuery}
                            onChange={(e) => setMapSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        {/* Category Dropdown */}
                        <div>
                          <select
                            value={mapCategoryFilter}
                            onChange={(e) => setMapCategoryFilter(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
                          >
                            <option value="all">All Categories</option>
                            {Object.entries(CATEGORIES).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Severity Dropdown */}
                        <div>
                          <select
                            value={mapSeverityFilter}
                            onChange={(e) => setMapSeverityFilter(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
                          >
                            <option value="all">All Severities</option>
                            <option value="critical">🔴 Critical</option>
                            <option value="high">🟠 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🔵 Low</option>
                          </select>
                        </div>

                        {/* Status Dropdown */}
                        <div>
                          <select
                            value={mapStatusFilter}
                            onChange={(e) => setMapStatusFilter(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700 cursor-pointer"
                          >
                            <option value="all">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Interface Mode Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-2 rounded-2xl">
                      <span className="text-xs font-bold text-slate-700 ml-2">GIS Visualization Mode:</span>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => setMapMode('svg')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${mapMode === 'svg' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Concept GIS Overlay
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapMode('google')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${mapMode === 'google' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Live Google Maps
                        </button>
                      </div>
                    </div>

                    {mapMode === 'google' && hasValidGoogleMapsKey ? (
                      <div className="h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
                        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                          <GoogleMap
                            defaultCenter={{ lat: 26.2183, lng: 78.1828 }}
                            defaultZoom={13}
                            mapId="MAIN_MAP_ID_MOCK"
                            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                            style={{ width: '100%', height: '100%' }}
                          >
                            {/* Landmarks Pin Overlay */}
                            {GWALIOR_LANDMARKS.map(lm => {
                              const isFocused = focusedLandmarkId === lm.id;
                              return (
                                <AdvancedMarker
                                  key={lm.id}
                                  position={{ lat: lm.latitude, lng: lm.longitude }}
                                  onClick={() => setFocusedLandmarkId(lm.id)}
                                >
                                  <Pin 
                                    background={isFocused ? '#f59e0b' : '#1e293b'} 
                                    borderColor={isFocused ? '#fff' : '#475569'}
                                    glyphColor="#fff"
                                  />
                                </AdvancedMarker>
                              );
                            })}

                            {/* Active Incidents Overlay */}
                            {filteredMapIssues.map(iss => {
                              const isSelected = selectedIssue?.id === iss.id;
                              const catConfig = CATEGORIES[iss.category];
                              return (
                                <AdvancedMarker
                                  key={iss.id}
                                  position={{ lat: iss.latitude, lng: iss.longitude }}
                                  onClick={() => setSelectedIssue(iss)}
                                >
                                  <Pin 
                                    background={iss.severity === 'critical' ? '#dc2626' : iss.severity === 'high' ? '#f97316' : '#3b82f6'} 
                                    borderColor="#fff"
                                    glyphColor="#fff"
                                    scale={isSelected ? 1.15 : 0.9}
                                  />
                                </AdvancedMarker>
                              );
                            })}
                          </GoogleMap>
                        </APIProvider>

                        {/* Float overlay showing Selected Issue inside Google Map */}
                        {selectedIssue && (
                          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl flex items-center justify-between space-x-4 max-w-lg mx-auto z-10">
                            <div className="text-left space-y-1 min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-xs text-slate-800 truncate block">{selectedIssue.title}</span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${selectedIssue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {selectedIssue.severity}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{selectedIssue.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                onClick={() => {
                                  setActiveTab('feed');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-lg transition cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIssue(null);
                                }}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                                title="Dismiss details"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : mapMode === 'google' ? (
                      <div className="h-[480px] rounded-3xl bg-slate-950 border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-inner">
                        <Map className="w-16 h-16 text-indigo-500 animate-pulse" />
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-white font-display">Gwalior Live GIS Interface</h4>
                          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                            Enable real-time satellite imagery, precise route mapping, and location-aware citizen telemetry by configuring your Google Maps API Key.
                          </p>
                        </div>
                        
                        <div className="text-left bg-slate-900 border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-300 max-w-sm space-y-2 font-mono leading-relaxed">
                          <p className="font-bold text-amber-400">🚀 To configure Google Maps Platform:</p>
                          <p>1. Open <strong className="text-white">Settings</strong> (⚙️ gear icon, top-right corner)</p>
                          <p>2. Go to the <strong className="text-white">Secrets</strong> tab</p>
                          <p>3. Add <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400">GOOGLE_MAPS_PLATFORM_KEY</code> as name</p>
                          <p>4. Paste your Google Cloud Maps API Key and hit Enter</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMapMode('svg')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
                        >
                          Use Vector Offline Overlay
                        </button>
                      </div>
                    ) : (
                      <div className="h-[480px] bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-inner">
                        
                        {/* Zoomable & Centerable Map Layers Wrapper */}
                        <div style={mainMapTransformStyle} className="absolute inset-0 w-full h-full">
                          {/* Styled Map Background details */}
                          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-5 pointer-events-none">
                            {Array.from({ length: 144 }).map((_, i) => (
                              <div key={i} className="border border-white" />
                            ))}
                          </div>

                          {/* Styled Neighborhood Boundaries overlays */}
                          <div className="absolute inset-x-0 top-0 h-1/3 bg-teal-500/5 border-b border-dashed border-teal-500/10 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-500/60 font-display">Gwalior Fort & Old Town Sector</span>
                          </div>
                          <div className="absolute left-0 bottom-0 w-1/2 h-2/3 bg-emerald-500/5 border-r border-dashed border-emerald-500/10 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500/60 font-display">Lashkar (Maharaj Bada) Sector</span>
                          </div>
                          <div className="absolute right-0 bottom-0 w-1/2 h-2/3 bg-purple-500/5 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-500/60 font-display">City Center & Morar (Thatipur) Sector</span>
                          </div>

                          {/* Gwalior Reference Landmarks pins */}
                          {GWALIOR_LANDMARKS.map(landmark => {
                            const pctX = (landmark.longitude - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
                            const pctY = (MAP_BOUNDS.latMax - landmark.latitude) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);

                            const isFocused = focusedLandmarkId === landmark.id;
                            
                            return (
                              <div
                                key={landmark.id}
                                onClick={() => setFocusedLandmarkId(landmark.id)}
                                className="absolute cursor-pointer group z-25 transition-transform duration-200"
                                style={{ 
                                  left: `${pctX * 100}%`, 
                                  top: `${pctY * 100}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
                                  isFocused 
                                    ? 'bg-amber-500 border-white text-white scale-125 ring-4 ring-amber-500/40 z-30' 
                                    : 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800 hover:scale-110 z-20'
                                }`}>
                                  <Building className="w-4 h-4" />
                                  
                                  {/* Glowing target rings for focused landmark */}
                                  {isFocused && (
                                    <span className="absolute -inset-2 rounded-full border border-amber-400 opacity-75 animate-ping pointer-events-none" />
                                  )}
                                </div>

                                {/* Tooltip Label */}
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white text-[9px] font-bold px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap transition pointer-events-none flex flex-col items-center ${
                                  isFocused ? 'opacity-100 scale-100 translate-y-0 z-40' : 'opacity-60 group-hover:opacity-100 group-hover:scale-105'
                                }`}>
                                  <span className="flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                    <span>{landmark.name}</span>
                                  </span>
                                  <span className="text-[7px] text-slate-400 font-normal mt-0.5">{landmark.description}</span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Pins mapping with full detailed click overlay popups */}
                          {filteredMapIssues.map(iss => {
                            const pctX = (iss.longitude - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
                            const pctY = (MAP_BOUNDS.latMax - iss.latitude) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);
                            
                            const isSelected = selectedIssue?.id === iss.id;
                            const catConfig = CATEGORIES[iss.category];

                            return (
                              <div
                                key={iss.id}
                                className="absolute cursor-pointer transition z-10"
                                style={{ 
                                  left: `${pctX * 100}%`, 
                                  top: `${pctY * 100}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                                onClick={() => setSelectedIssue(iss)}
                              >
                                {/* Interactive Dot marker */}
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md relative ${
                                  iss.severity === 'critical' ? 'bg-red-600 animate-pulse ring-2 ring-red-400' : iss.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                                }`}>
                                  {React.createElement(catConfig.icon, { className: 'w-2.5 h-2.5 text-white' })}
                                </div>
                                
                                {/* Hover Tooltip name box */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-sm opacity-0 hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                                  {iss.title}
                                </div>
                              </div>
                            );
                          })}

                          {/* Selected issue float overlay inside Concept GIS Map */}
                          {selectedIssue && (
                            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between space-x-4 max-w-lg mx-auto z-40">
                              <div className="text-left space-y-1 min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-xs text-white truncate block">{selectedIssue.title}</span>
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                                    selectedIssue.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  }`}>
                                    {selectedIssue.severity}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1">{selectedIssue.description}</p>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setActiveTab('feed');
                                  }}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black uppercase px-3 py-2 rounded-lg transition cursor-pointer"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIssue(null);
                                  }}
                                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
                                  title="Dismiss details"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                      <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-center space-x-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full shrink-0" />
                        <span className="font-bold text-slate-700">Critical Priority Hazards (Red)</span>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-xl flex items-center space-x-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full shrink-0" />
                        <span className="font-bold text-slate-700">High Utility Failures (Orange)</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex items-center space-x-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full shrink-0" />
                        <span className="font-bold text-slate-700">Standard Civic Incidents (Blue)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* View 5: Impact Stats Dashboard */}
            {activeTab === 'dashboard' && stats && (() => {
              // Scoped calculations
              const totalIncidents = issues.length;
              const resolvedIncidents = issues.filter(i => i.status === 'resolved');
              const openIncidents = issues.filter(i => i.status !== 'resolved');
              
              // Filtered issues
              const filteredList = issues.filter(iss => {
                const matchesWard = impactWardFilter === 'all' || iss.ward === impactWardFilter;
                const matchesCat = impactCategoryFilter === 'all' || iss.category === impactCategoryFilter;
                const matchesSev = impactSeverityFilter === 'all' || iss.severity === impactSeverityFilter;
                return matchesWard && matchesCat && matchesSev;
              });

              const fTotal = filteredList.length;
              const fResolved = filteredList.filter(i => i.status === 'resolved').length;
              const fOpen = fTotal - fResolved;
              const fRate = fTotal > 0 ? Math.round((fResolved / fTotal) * 100) : 0;

              // Calculate average resolution time in hours
              let avgResHours = 14.5;
              const resolvedWithTimestamps = filteredList.filter(i => i.status === 'resolved' && i.createdAt && i.updatedAt);
              if (resolvedWithTimestamps.length > 0) {
                const totalHours = resolvedWithTimestamps.reduce((sum, i) => {
                  const c = new Date(i.createdAt).getTime();
                  const u = new Date(i.updatedAt).getTime();
                  const diff = (u - c) / (1000 * 60 * 60);
                  return sum + Math.max(0.5, diff);
                }, 0);
                avgResHours = Math.round((totalHours / resolvedWithTimestamps.length) * 10) / 10;
              }

              // Total points allocated
              const totalCitizenPoints = leaderboard.reduce((sum, u) => sum + (u.points || 0), 0);
              const totalCivicUpvotes = filteredList.reduce((sum, i) => sum + (i.confirmations || 0), 0);
              const distinctReporters = new Set(filteredList.map(i => i.reporterId)).size;

              // Category Breakdown Chart Data
              const categoryChartData = Object.entries(
                filteredList.reduce((acc, i) => {
                  acc[i.category] = (acc[i.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([cat, count]) => {
                const resolved = filteredList.filter(iss => iss.category === cat && iss.status === 'resolved').length;
                const countNum = count as number;
                return {
                  category: cat.replace('_', ' ').toUpperCase(),
                  'Total Reported': countNum,
                  'Resolved Cases': resolved,
                  'Active Backlog': countNum - resolved
                };
              });

              // Status distribution for PieChart
              const statusDistribution = Object.entries(
                filteredList.reduce((acc, i) => {
                  const sLabel = i.status === 'in_progress' ? 'IN PROGRESS' : i.status.toUpperCase();
                  acc[sLabel] = (acc[sLabel] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([name, value]) => ({ name, value }));

              const STATUS_COLOR_MAP: Record<string, string> = {
                'RESOLVED': '#10b981',
                'IN PROGRESS': '#f59e0b',
                'ACKNOWLEDGED': '#3b82f6',
                'VERIFIED': '#6366f1',
                'REPORTED': '#64748b'
              };

              // Ward heat analysis
              const wardMetrics = Object.entries(
                filteredList.reduce((acc, i) => {
                  const w = i.ward || 'General Zone';
                  if (!acc[w]) acc[w] = { total: 0, resolved: 0, critical: 0 };
                  acc[w].total++;
                  if (i.status === 'resolved') acc[w].resolved++;
                  if (i.severity === 'critical' || i.severity === 'high') acc[w].critical++;
                  return acc;
                }, {} as Record<string, { total: number; resolved: number; critical: number }>)
              ).map(([name, data]) => {
                const d = data as { total: number; resolved: number; critical: number };
                return {
                  name,
                  total: d.total,
                  resolved: d.resolved,
                  critical: d.critical,
                  rate: d.total > 0 ? Math.round((d.resolved / d.total) * 105) : 0
                };
              }).map(w => ({
                ...w,
                rate: Math.min(100, w.rate)
              })).sort((a, b) => b.total - a.total);

              // Timeline trends for area chart
              const dayMap: Record<string, { reported: number; resolved: number }> = {};
              filteredList.forEach(i => {
                try {
                  const dLabel = new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  if (!dayMap[dLabel]) dayMap[dLabel] = { reported: 0, resolved: 0 };
                  dayMap[dLabel].reported++;
                  if (i.status === 'resolved') dayMap[dLabel].resolved++;
                } catch (e) {}
              });

              const timelineData = Object.entries(dayMap).map(([date, data]) => ({
                date,
                'Reports': data.reported,
                'Resolved': data.resolved
              })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);

              const triggerReportGeneration = () => {
                setIsGeneratingReport(true);
                setGeneratedReport(null);
                
                const stages = [
                  "Syncing census metrics from Gwalior Ward Registers...",
                  "Calculating zonal resolution speeds...",
                  "Aggregating category-level bottleneck coefficients...",
                  "Structuring municipal briefing docket..."
                ];

                let currentStage = 0;
                
                const interval = setInterval(() => {
                  if (currentStage < stages.length) {
                    setGeneratedReport({ stage: stages[currentStage] });
                    currentStage++;
                  } else {
                    clearInterval(interval);
                    
                    // Generate smart insights
                    const activeCriticalCount = filteredList.filter(i => i.status !== 'resolved' && (i.severity === 'critical' || i.severity === 'high')).length;

                    let dominantProblem = "garbage disposal";
                    let maxCount = 0;
                    filteredList.reduce((acc, i) => {
                      acc[i.category] = (acc[i.category] || 0) + 1;
                      if (acc[i.category] > maxCount) {
                        maxCount = acc[i.category];
                        dominantProblem = i.category.replace('_', ' ');
                      }
                      return acc;
                    }, {} as Record<string, number>);

                    const recommendations = [
                      `Zonal priority: Immediately deploy localized repair crews to ${wardMetrics[0]?.name || 'the primary zone'} which reports the highest civic load with ${wardMetrics[0]?.total || 0} registered incidents.`,
                      dominantProblem ? `Resource dispatch: Reallocate 15% of the general civic maintenance budget to address ${dominantProblem.toUpperCase()} issues, currently comprising the majority category bottleneck.` : null,
                      activeCriticalCount > 0 ? `Safety intervention: Mobilize urgent overnight response squads for ${activeCriticalCount} high/critical priority safety cases currently unresolved.` : "No outstanding critical incident backlogs exist, maintaining general municipal upkeep protocols."
                    ].filter(Boolean);

                    setGeneratedReport({
                      completed: true,
                      timestamp: new Date().toLocaleDateString('en-IN', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }),
                      docketNumber: `GMC-IMPACT-${Math.floor(100000 + Math.random() * 900000)}`,
                      summary: `Executive appraisal confirms Gwalior municipal resolution velocity is operating at ${fRate}% efficiency with an average case closure duration of ${avgResHours} hours. Zonal analysis flags ${wardMetrics[0]?.name || 'the primary ward'} as the primary hub of reporter engagement. Water/Sanitation represents the primary infrastructure load factor.`,
                      recommendations
                    });
                    setIsGeneratingReport(false);
                  }
                }, 800);
              };

              const triggerSquadAlert = (wardName: string, count: number) => {
                const toastMsg = `[Dispatch Directive] Live alert dispatched to ${wardName} Municipal Inspector Team! 🚀 Mobilizing immediate repair squads to clear ${count} active issues.`;
                
                const newNotif: ToastNotification = {
                  id: `notif_${Date.now()}`,
                  issueId: '',
                  issueTitle: `Emergency Patrol Dispatch: ${wardName}`,
                  newStatus: 'in_progress',
                  type: 'general',
                  message: `Executive commissioner has triggered priority sweep for ${wardName}. Ground personnel have been notified.`,
                  timestamp: new Date().toISOString()
                };

                const savedToasts = localStorage.getItem('civicpulse_toasts');
                try {
                  const curToasts = savedToasts ? JSON.parse(savedToasts) : [];
                  localStorage.setItem('civicpulse_toasts', JSON.stringify([newNotif, ...curToasts]));
                  window.dispatchEvent(new Event('civicpulse_notifications_updated'));
                } catch(e){}

                alert(toastMsg);
              };

              return (
                <motion.div 
                  key="dashboard-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 pb-20 md:pb-6"
                >
                  {/* Top Metric Header */}
                  <div className="bg-indigo-955 bg-indigo-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-md">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
                      <TrendingUp className="w-96 h-96" />
                    </div>
                    <div className="relative z-10 space-y-3 text-left">
                      <div className="inline-flex items-center space-x-2 bg-indigo-900/60 px-3.5 py-1.5 rounded-full border border-indigo-700/30">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                        <span className="text-[10px] font-black tracking-wider uppercase text-indigo-200">Gwalior Municipal Impact Analytics</span>
                      </div>
                      <h3 className="text-2xl font-black font-sans tracking-tight text-white">Gwalior Civic Impact & Analytics Dashboard</h3>
                      <p className="text-indigo-200/90 text-xs max-w-3xl leading-relaxed">
                        High-fidelity research portal evaluating municipal resolution compliance, citizen co-governance coefficients, and zonal backlog health.
                      </p>
                    </div>
                  </div>

                  {/* Filter Command Bar */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 shadow-3xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                        <Filter className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider text-left">Research Filters</h4>
                        <p className="text-[10px] text-slate-400 text-left">Drill down across wards, categories, and severity tiers</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-2.5">
                      {/* Ward Selector */}
                      <div className="flex flex-col space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase text-slate-400">Ward Zone</span>
                        <select
                          value={impactWardFilter}
                          onChange={(e) => setImpactWardFilter(e.target.value)}
                          className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 cursor-pointer min-h-[34px]"
                        >
                          <option value="all">All Wards ({issues.length})</option>
                          {Array.from(new Set(issues.map(i => i.ward))).filter(Boolean).map(w => (
                            <option key={w} value={w}>{w} ({issues.filter(i => i.ward === w).length})</option>
                          ))}
                        </select>
                      </div>

                      {/* Category Selector */}
                      <div className="flex flex-col space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase text-slate-400">Category Type</span>
                        <select
                          value={impactCategoryFilter}
                          onChange={(e) => setImpactCategoryFilter(e.target.value)}
                          className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 cursor-pointer min-h-[34px]"
                        >
                          <option value="all">All Categories ({issues.length})</option>
                          <option value="pothole">Pothole ({issues.filter(i => i.category === 'pothole').length})</option>
                          <option value="water_leakage">Water Leakage ({issues.filter(i => i.category === 'water_leakage').length})</option>
                          <option value="streetlight">Streetlight ({issues.filter(i => i.category === 'streetlight').length})</option>
                          <option value="garbage">Garbage & Sanitation ({issues.filter(i => i.category === 'garbage').length})</option>
                          <option value="road_damage">Road Damage ({issues.filter(i => i.category === 'road_damage').length})</option>
                          <option value="other">Other ({issues.filter(i => i.category === 'other').length})</option>
                        </select>
                      </div>

                      {/* Severity Selector */}
                      <div className="flex flex-col space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase text-slate-400">Incident Severity</span>
                        <select
                          value={impactSeverityFilter}
                          onChange={(e) => setImpactSeverityFilter(e.target.value)}
                          className="bg-white border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 cursor-pointer min-h-[34px]"
                        >
                          <option value="all">All Severities</option>
                          <option value="critical">🚨 Critical ({issues.filter(i => i.severity === 'critical').length})</option>
                          <option value="high">🟠 High ({issues.filter(i => i.severity === 'high').length})</option>
                          <option value="medium">🟡 Medium ({issues.filter(i => i.severity === 'medium').length})</option>
                          <option value="low">🔵 Low ({issues.filter(i => i.severity === 'low').length})</option>
                        </select>
                      </div>

                      {/* Customizable Column Toggle */}
                      <div className="flex flex-col space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase text-slate-400">Card Density</span>
                        <div className="flex items-center space-x-1 bg-white border border-slate-200 p-0.5 rounded-lg min-h-[34px]">
                          <button
                            type="button"
                            onClick={() => setImpactDashboardMobileCols(1)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${impactDashboardMobileCols === 1 ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            title="Set 1 column density on mobile"
                          >
                            1 Col
                          </button>
                          <button
                            type="button"
                            onClick={() => setImpactDashboardMobileCols(2)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${impactDashboardMobileCols === 2 ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            title="Set 2 column density on mobile"
                          >
                            2 Col
                          </button>
                        </div>
                      </div>

                      {/* Reset Filters */}
                      {(impactWardFilter !== 'all' || impactCategoryFilter !== 'all' || impactSeverityFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setImpactWardFilter('all');
                            setImpactCategoryFilter('all');
                            setImpactSeverityFilter('all');
                          }}
                          className="xl:mt-4 min-h-[34px] px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bento KPI Grid */}
                  <div className={`grid gap-4 ${impactDashboardMobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-4`}>
                    {/* KPI 1: Resolution Efficiency */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:shadow-xs transition duration-200 group relative overflow-hidden text-left">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resolution Efficiency</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-1.5 text-left">
                        <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                          {fRate}%
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          <strong>{fResolved}</strong> of {fTotal} logged cases cleared
                        </p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${fRate}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* KPI 2: Avg Case Resolution Lifecycle */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:shadow-xs transition duration-200 group relative overflow-hidden text-left">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Resolution Velocity</span>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-1.5 text-left">
                        <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                          {avgResHours} hrs
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          From initial intake to mechanical closure
                        </p>
                        <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          -1.4 hours vs baseline
                        </span>
                      </div>
                    </div>

                    {/* KPI 3: Open Case Strain Backlog */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:shadow-xs transition duration-200 group relative overflow-hidden text-left">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Backlog load</span>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-1.5 text-left">
                        <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                          {fOpen} issues
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Cases in triage or actively in-progress
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {['reported', 'verified', 'acknowledged', 'in_progress'].map(status => {
                            const c = filteredList.filter(i => i.status === status).length;
                            if (c === 0) return null;
                            return (
                              <span key={status} className="text-[8px] font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 uppercase">
                                {status.substring(0, 3)}: {c}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* KPI 4: Citizen Core Engagement Coefficient */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:shadow-xs transition duration-200 group relative overflow-hidden text-left">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Civic Co-Governance</span>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                          <Award className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-1.5 text-left">
                        <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                          {totalCivicUpvotes} Upvotes
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          By <strong>{distinctReporters}</strong> active neighborhood leaders
                        </p>
                        <span className="inline-flex items-center text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1">
                          {totalCitizenPoints} Points Disbursed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Charts Row */}
                  {fTotal === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-16 text-center space-y-3">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-sm">No Incidents Discovered</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        No incident reports match your active filter combinations. Try selecting "All Wards" or "All Categories" to view metrics.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Left Column: Trend Area Chart */}
                        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 text-left">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Municipal Case Timeline Velocity</h4>
                              <p className="text-[10px] text-slate-400">Historical trend showing incoming report velocity versus resolution rate</p>
                            </div>
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 uppercase font-mono">7-Day Sweep</span>
                          </div>
                          
                          <div className="h-[250px] md:h-[280px] w-full text-xs font-mono">
                            {timelineData.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-slate-450">Insufficient historical scatter data</div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="date" tickLine={false} axisLine={false} dy={5} stroke="#94a3b8" />
                                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
                                  <Legend verticalAlign="top" height={36} iconType="circle" />
                                  <Area type="monotone" dataKey="Reports" stroke="#4f46e5" fillOpacity={1} fill="url(#colorReported)" strokeWidth={2} />
                                  <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>

                        {/* Right Column: Status Pie Chart */}
                        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between text-left">
                          <div className="border-b border-slate-100 pb-3">
                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Docket Status Allocation</h4>
                            <p className="text-[10px] text-slate-400">Backlog composition breakdown</p>
                          </div>
                          
                          <div className="h-[200px] w-full flex items-center justify-center relative my-3">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={statusDistribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLOR_MAP[entry.name] || '#cbd5e1'} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-2xl font-black text-slate-800 tracking-tight">{fOpen}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Open</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-left text-[10px] font-semibold mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                            {statusDistribution.map((item) => (
                              <div key={item.name} className="flex items-center space-x-1.5 py-0.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR_MAP[item.name] || '#cbd5e1' }} />
                                <span className="text-slate-600 truncate max-w-[80px]">{item.name}</span>
                                <span className="font-extrabold text-slate-900 ml-auto">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bar chart - Departmental Loads */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 text-left">
                        <div className="border-b border-slate-100 pb-3">
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Departmental Backlog load analysis</h4>
                          <p className="text-[10px] text-slate-400">Direct volume comparison of reported, resolved, and active incidents categorized by municipal department</p>
                        </div>
                        
                        <div className="h-[250px] w-full text-xs font-mono">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="category" tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                              <Tooltip />
                              <Legend verticalAlign="top" height={36} iconType="circle" />
                              <Bar dataKey="Total Reported" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Resolved Cases" fill="#10b981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Active Backlog" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Zonal Heatmap & Ward performance Index table */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
                        {/* Ward index */}
                        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 flex flex-col justify-between">
                          <div className="text-left border-b border-slate-100 pb-3">
                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Gwalior Zonal resolution heatmap index</h4>
                            <p className="text-[10px] text-slate-400">Evaluating ward resolution efficiency with automated dispatch pathways</p>
                          </div>

                          <div className="overflow-hidden border border-slate-150 rounded-xl bg-white shadow-3xs">
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-250 text-[9px] uppercase tracking-wider">
                                    <th className="py-2.5 px-3 font-bold">Zone / Ward Name</th>
                                    <th className="py-2.5 px-3 text-center font-bold">Total Cases</th>
                                    <th className="py-2.5 px-3 text-center font-bold">Cleared</th>
                                    <th className="py-2.5 px-3 text-center font-bold">Resolution Rate</th>
                                    <th className="py-2.5 px-3 text-right font-bold">Action Directive</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {wardMetrics.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium font-mono uppercase tracking-wider">No Zone logs found</td>
                                    </tr>
                                  ) : (
                                    wardMetrics.map((w) => {
                                      let badgeBg = "bg-red-50 text-red-800 border-red-100";
                                      if (w.rate >= 75) badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-100";
                                      else if (w.rate >= 50) badgeBg = "bg-amber-50 text-amber-800 border-amber-100";
                                      
                                      const unres = w.total - w.resolved;

                                      return (
                                        <tr key={w.name} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                          <td className="py-3 px-3 font-bold text-slate-800 font-sans max-w-[150px] truncate" title={w.name}>
                                            {w.name}
                                          </td>
                                          <td className="py-3 px-3 text-center text-slate-700 font-mono font-extrabold">{w.total}</td>
                                          <td className="py-3 px-3 text-center text-emerald-600 font-mono font-extrabold">{w.resolved}</td>
                                          <td className="py-3 px-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeBg}`}>
                                              {w.rate}%
                                            </span>
                                          </td>
                                          <td className="py-3 px-3 text-right">
                                            <button
                                              onClick={() => triggerSquadAlert(w.name, unres)}
                                              disabled={unres === 0}
                                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                                                unres === 0
                                                  ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                                                  : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border-indigo-100 hover:border-indigo-600 cursor-pointer font-extrabold'
                                              }`}
                                            >
                                              {unres === 0 ? 'Optimal' : 'Dispatch Alert'}
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Executive AI Brief Report */}
                        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between text-left space-y-4">
                          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">AI Executive Appraisal Engine</h4>
                              <p className="text-[10px] text-slate-400">Generate instantly verifiable municipal briefing dockets</p>
                            </div>
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 flex-1 flex flex-col justify-center min-h-[220px]">
                            {isGeneratingReport ? (
                              <div className="text-center space-y-3.5 py-8">
                                <span className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block"></span>
                                <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest font-mono animate-pulse">
                                  {generatedReport?.stage || 'Preparing compiler...'}
                                </p>
                              </div>
                            ) : generatedReport?.completed ? (
                              <div className="space-y-3.5 text-left">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Docket: {generatedReport.docketNumber}</span>
                                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold uppercase">Ready</span>
                                </div>

                                <div className="space-y-1.5 text-left">
                                  <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-800 font-bold">Operational Summary</h5>
                                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-slate-150">
                                    {generatedReport.summary}
                                  </p>
                                </div>

                                <div className="space-y-2 text-left">
                                  <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-800 font-bold">Directive Guidelines</h5>
                                  <ul className="space-y-1.5">
                                    {generatedReport.recommendations.map((rec: string, i: number) => (
                                      <li key={i} className="text-[10px] text-slate-500 flex items-start space-x-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex items-center space-x-2 pt-2 border-t border-slate-150">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(JSON.stringify(generatedReport, null, 2));
                                      alert("Docket JSON copied successfully to clipboard!");
                                    }}
                                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition flex-1 cursor-pointer text-center font-bold"
                                  >
                                    Copy Docket
                                  </button>
                                  <button
                                    onClick={() => {
                                      alert("Executive appraisal report downloaded successfully to Gwalior Municipal Corporation Secure Ledger!");
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 rounded-lg text-[10px] font-bold transition flex-1 cursor-pointer text-center font-bold"
                                  >
                                    Simulate CSV Export
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center space-y-3 py-6">
                                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                                <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Summary Generation Required</h5>
                                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                                  Analyze current ward metrics, resolution rate bottlenecks, and user interaction volumes to formulate an executive strategic docket.
                                </p>
                              </div>
                            )}
                          </div>

                          {!generatedReport?.completed && !isGeneratingReport && (
                            <button
                              onClick={triggerReportGeneration}
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-indigo-200" />
                              <span>Execute Appraisal Compile</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* AI Predictive Smart-City Sandbox Playground */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 text-white relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center space-x-2 border-b border-white/10 pb-4 mb-4 text-left">
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                      <div>
                        <h4 className="font-extrabold text-xs uppercase text-yellow-400 tracking-wider font-display">Predictive Smart-City Simulation Sandbox</h4>
                        <p className="text-[10px] text-slate-300">Run calculations of environmental spikes or crowd movements to estimate high-threat zones and municipal pressure.</p>
                      </div>
                    </div>

                    {/* Settings grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-left">
                      
                      {/* Select Climate season */}
                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                          <span>Weather & Seasonal Cycle</span>
                        </label>
                        <select
                          value={simSeason}
                          onChange={(e) => setSimSeason(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                        >
                          <option value="monsoon">☔ Heavy Monsoon Rains (Water logging & pothole risk)</option>
                          <option value="summer">☀️ Peak Indian Summer (Pipeline pressure leakages)</option>
                          <option value="festival">🪔 Gwalior Mela & Festival Season (Garbage volume surge)</option>
                          <option value="normal">⛅ Standard Gwalior Climate (Average Loads)</option>
                        </select>
                      </div>

                      {/* Select Civic Crowd Intensity */}
                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                          <Activity className="w-3.5 h-3.5 text-orange-400" />
                          <span>Public Density Events</span>
                        </label>
                        <select
                          value={simDensity}
                          onChange={(e) => setSimDensity(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                        >
                          <option value="normal">🏙️ Standard City Mobility (Normal Footprint)</option>
                          <option value="mela">🎪 Historical Gwalior Trade Fair (Massive Tourist Crowd)</option>
                          <option value="convoy">🚘 VIP Convoy Corridor Sweep (High-safety patrol)</option>
                        </select>
                      </div>

                      {/* Run Trigger Button */}
                      <div className="md:col-span-4">
                        <button
                          onClick={handleRunSimulation}
                          disabled={isSimulating}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition shadow-md hover:shadow-orange-500/10 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSimulating ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-slate-955" />
                              <span>Computing Forecast...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 text-slate-955 fill-slate-955" />
                              <span>Run Load Simulation</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Simulated Results Output */}
                    <AnimatePresence>
                      {simulationResult && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-5 border-t border-white/10 pt-4 overflow-hidden text-left"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
                             
                            {/* Left Column: Metrics */}
                            <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2">
                              <h5 className="text-[10px] text-yellow-400 font-extrabold uppercase tracking-wider">Forecasted Severity Risk</h5>
                              <div className="flex items-baseline space-x-1">
                                <span className="text-2xl font-black text-white">+{simulationResult.spikePercentage}%</span>
                                <span className="text-[9px] text-slate-400">load surge expected</span>
                              </div>
                              <div className="text-[10px] space-y-1">
                                <p className="flex justify-between">
                                  <span className="text-slate-400">Highest Threat Category:</span>
                                  <span className="font-bold text-white uppercase">{CATEGORIES[simulationResult.highestRiskCategory as IssueCategory]?.label || simulationResult.highestRiskCategory}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="text-slate-400">High Risk Zone:</span>
                                  <span className="font-bold text-white">{simulationResult.highestRiskWard}</span>
                                </p>
                              </div>
                            </div>

                            {/* Center Column: Recommendations */}
                            <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2 col-span-1 md:col-span-2">
                              <h5 className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">AI Predictive Preventive Directives</h5>
                              <ul className="text-[11px] list-disc list-inside space-y-1 text-slate-200">
                                {simulationResult.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="leading-relaxed">
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                              <div className="h-px bg-white/5 my-2" />
                              <p className="text-[10px] text-slate-400 italic">
                                <strong>Nagar Nigam Orders:</strong> {simulationResult.preventiveOrders}
                              </p>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!simulationResult && !isSimulating && (
                      <div className="mt-4 flex items-center space-x-2 text-[10px] text-slate-400 bg-white/5 rounded-lg p-2.5 text-left">
                        <Info className="w-4 h-4 text-yellow-400 shrink-0" />
                        <span>Select weather and footfall configurations above to forecast risk surge, estimate high-threat zones, and generate dynamic pre-emptive action rosters.</span>
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })()}

            {/* View 6: Profile & Gamification */}
            {activeTab === 'profile' && currentUser && (
              <motion.div 
                key="profile-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                
                {/* Left Profile Panel */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-4 text-center">
                    <div 
                      onClick={() => {
                        setProfileEditName(currentUser.name);
                        setProfileEditEmail(currentUser.email || '');
                        setProfileEditPhone(currentUser.phone || '');
                        setProfileEditAvatar(currentUser.avatar || '');
                        setIsProfileEditModalOpen(true);
                      }}
                      className="relative w-24 h-24 mx-auto cursor-pointer group"
                    >
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-md group-hover:opacity-85 transition duration-150"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition duration-150">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-1.5 rounded-full shadow-md z-10">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-slate-800 text-base">{currentUser.name}</h3>
                      <p className="text-xs text-slate-400">{currentUser.email || 'priyansh@civicpulse.org'}</p>
                      {currentUser.phone && (
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">{currentUser.phone}</p>
                      )}
                      <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
                        <span className="inline-block bg-blue-50 text-blue-700 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-100">
                          {currentUser.role === 'citizen'
                            ? 'Citizen Steward'
                            : currentUser.role === 'admin'
                            ? 'System Administrator'
                            : currentUser.accessLevel === 'level_3'
                            ? 'Municipal Commissioner'
                            : currentUser.accessLevel === 'level_2'
                            ? 'Dept Head'
                            : 'Field Inspector'}
                        </span>
                        <span className="inline-block bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-100">
                          Level {Math.floor(currentUser.points / 150) + 1}
                        </span>
                      </div>
                      
                      {/* Direct Edit Trigger */}
                      <button
                        onClick={() => {
                          setProfileEditName(currentUser.name);
                          setProfileEditEmail(currentUser.email || '');
                          setProfileEditPhone(currentUser.phone || '');
                          setProfileEditAvatar(currentUser.avatar || '');
                          setIsProfileEditModalOpen(true);
                        }}
                        className="mt-3.5 w-full inline-flex items-center justify-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 hover:border-blue-200 font-extrabold text-xs uppercase py-2.5 rounded-xl transition duration-200 cursor-pointer shadow-3xs min-h-[44px]"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>

                      {/* Log Out Button immediately after Edit Profile */}
                      <button
                        onClick={handleSignOut}
                        className="mt-2 w-full inline-flex items-center justify-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 font-extrabold text-xs uppercase py-2.5 rounded-xl transition duration-200 cursor-pointer shadow-3xs min-h-[44px]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>

                    <div className="h-px bg-slate-100 my-3" />

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <h4 className="font-black text-slate-700 text-sm">{currentUser.reportedCount}</h4>
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Reported</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <h4 className="font-black text-slate-700 text-sm">{currentUser.verifiedCount}</h4>
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Verified</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <h4 className="font-black text-slate-700 text-sm">{currentUser.resolvedCount}</h4>
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* Points Ledger card */}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-center justify-between text-left">
                    <div className="flex items-center space-x-2.5">
                      <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Steward Balance</p>
                        <p className="text-lg font-black text-amber-600">{currentUser.points} pts</p>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Activity Point Guide */}
                  <div className="space-y-3 text-left pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>Citizen Engagement Points</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your points (pts) grow dynamically based on real citizen activity and active community engagements.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">Report Civic Issue (+25 pts)</p>
                          <p className="text-[9px] text-slate-400 font-normal">Log a street, road, waste, water, or electric issue in Gwalior.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">Peer-Verify Issue (+10 pts)</p>
                          <p className="text-[9px] text-slate-400 font-normal">Help authorities verify complaints posted near you.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">Community Comment (+5 pts)</p>
                          <p className="text-[9px] text-slate-400 font-normal">Post supportive notes or information on issues.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">Issue Resolved Bonus (+50 pts)</p>
                          <p className="text-[9px] text-slate-400 font-normal">Bonus points awarded when your logged issue is solved!</p>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>

                {/* Right Interactive Dashboard Panel */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-5">
                  
                  {/* Citizen Stewardship Header */}
                  <div className="flex flex-col space-y-2 border-b border-slate-100 pb-3">
                    <div className="text-left">
                      <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
                        <span>Citizen Stewardship Portal</span>
                      </h3>
                      <p className="text-xs text-slate-400">Unlock municipal badges, track Gwalior leaderboard, redeem rewards, and manage your local profile details.</p>
                    </div>
                  </div>

                  {/* Profile sub-tabs navigator - Horizontal Scrollable with generous touch targets */}
                  <div className="flex items-center space-x-1 overflow-x-auto pb-1.5 scrollbar-none border-b border-slate-100">
                    <button
                      onClick={() => setProfileSubTab('leaderboard')}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                        profileSubTab === 'leaderboard'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Leaderboard</span>
                    </button>
                    <button
                      onClick={() => setProfileSubTab('rewards')}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                        profileSubTab === 'rewards'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                      <span>Redeem Rewards</span>
                    </button>
                    <button
                      onClick={() => setProfileSubTab('quests')}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                        profileSubTab === 'quests'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Daily Quests</span>
                    </button>
                    <button
                      onClick={() => setProfileSubTab('contributions')}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                        profileSubTab === 'contributions'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Activity Log</span>
                    </button>
                    <button
                      onClick={() => setProfileSubTab('settings')}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                        profileSubTab === 'settings'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    {currentUser && (currentUser.role === 'authority' || currentUser.role === 'admin') && (
                      <button
                        type="button"
                        onClick={() => setProfileSubTab('attendance')}
                        className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                          profileSubTab === 'attendance'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-emerald-50'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>Attendance Portal</span>
                      </button>
                    )}
                  </div>

                  {/* Sub-tab: Civic Leaderboard in Gamification */}
                  {profileSubTab === 'leaderboard' && (() => {
                    const sortedLeaderboard = [...leaderboard]
                      .filter(u => u.role === 'citizen')
                      .sort((a, b) => b.points - a.points);
                    
                    const myRankIndex = sortedLeaderboard.findIndex(u => u.uid === currentUser?.uid);
                    const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;
                    const userAbove = myRankIndex > 0 ? sortedLeaderboard[myRankIndex - 1] : null;
                    const ptsToOvertake = userAbove ? (userAbove.points - currentUser.points + 5) : 0;

                    return (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
                          <div className="space-y-1 text-left">
                            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                              <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />
                              <span>Citizen Engagement Leaderboard</span>
                            </h4>
                            <p className="text-xs text-slate-600">
                              Compete with Gwalior residents to maintain neighborhood hygiene, infrastructure, and fast peer verifications.
                            </p>
                          </div>
                          {myRank !== null && (
                            <div className="bg-white border border-blue-200 shadow-3xs rounded-xl px-4 py-2.5 flex items-center space-x-3 shrink-0">
                              <div className="text-center">
                                <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Your Rank</span>
                                <span className="font-black text-lg text-blue-600">#{myRank}</span>
                              </div>
                              <div className="h-8 w-px bg-slate-100" />
                              <div className="text-left">
                                <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Next Rank</span>
                                <p className="text-[10px] text-slate-600 font-medium">
                                  {userAbove ? (
                                    <>Earn <strong className="text-indigo-600">{ptsToOvertake} pts</strong> to surpass <span className="font-bold text-slate-800">{userAbove.name.split(' ')[0]}</span></>
                                  ) : (
                                    <span className="text-emerald-600 font-extrabold">👑 Leading the board!</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ward Championship Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Gwalior Ward Championships</h5>
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 font-black uppercase px-2 py-0.5 rounded-md animate-pulse">Live Scores</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {wardStats.slice(0, 3).map((w, idx) => (
                              <div key={w.name} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-2 right-2 text-slate-200 font-bold font-mono text-xl">
                                  #{idx + 1}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-black text-slate-800 text-xs truncate max-w-[150px]">{w.name}</p>
                                  <span className="text-[9px] text-slate-400 font-semibold">{w.reported} reported • {w.resolved} resolved</span>
                                </div>
                                <div className="mt-2.5">
                                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 mb-1">
                                    <span>Engagement</span>
                                    <span className="text-slate-800">{w.score} pts</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-indigo-500 rounded-full" 
                                      style={{ width: `${Math.min((w.score / (wardStats[0]?.score || 1)) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Players Table */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Honorary Leaderboard</h5>
                            <span className="text-[10px] text-slate-400 font-semibold">Updated live from citizen reports</span>
                          </div>

                          {/* Desktop View: Table */}
                          <div className="hidden sm:block border border-slate-150 rounded-2xl overflow-hidden shadow-3xs">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-400 font-bold border-b text-[9px] uppercase tracking-wider">
                                  <th className="py-2.5 px-3 text-center">Rank</th>
                                  <th className="py-2.5 px-3">Citizen Steward</th>
                                  <th className="py-2.5 px-3 text-center">Reports</th>
                                  <th className="py-2.5 px-3 text-center">Verifications</th>
                                  <th className="py-2.5 px-3 text-right">Points</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y text-slate-600 bg-white bg-opacity-100">
                                {sortedLeaderboard.map((user, idx) => {
                                  const isMe = user.uid === currentUser?.uid;
                                  return (
                                    <tr key={user.uid} className={`hover:bg-slate-50/50 transition ${isMe ? 'bg-blue-50/45 font-semibold' : ''}`}>
                                      <td className="py-3 px-3 text-center font-black">
                                        {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                                      </td>
                                      <td className="py-3 px-3 flex items-center space-x-2.5">
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border" referrerPolicy="no-referrer" />
                                        <div className="min-w-0">
                                          <div className="flex items-center space-x-1">
                                            <p className="font-bold text-slate-800 truncate text-xs">{user.name}</p>
                                            {isMe && <span className="bg-blue-100 text-blue-800 text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded">YOU</span>}
                                          </div>
                                          <span className="text-[9px] text-slate-400">Level {Math.floor(user.points / 150) + 1} Steward</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-3 text-center font-bold">{user.reportedCount}</td>
                                      <td className="py-3 px-3 text-center font-bold">{user.verifiedCount}</td>
                                      <td className="py-3 px-3 text-right font-black text-slate-800">{user.points} pts</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile View: Stack of elegant user list cards */}
                          <div className="block sm:hidden divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-3xs">
                            {sortedLeaderboard.map((user, idx) => {
                              const isMe = user.uid === currentUser?.uid;
                              return (
                                <div 
                                  key={user.uid} 
                                  className={`p-3 flex items-center justify-between gap-3 ${
                                    isMe ? 'bg-blue-50/40' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-3 min-w-0">
                                    {/* Rank badge */}
                                    <div className="w-8 shrink-0 text-center font-black text-xs text-slate-700">
                                      {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                    </div>
                                    {/* Avatar & Info */}
                                    <img 
                                      src={user.avatar} 
                                      alt={user.name} 
                                      className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="min-w-0 text-left">
                                      <div className="flex items-center space-x-1.5">
                                        <h5 className="font-bold text-slate-800 truncate text-xs leading-none">{user.name}</h5>
                                        {isMe && <span className="bg-blue-100 text-blue-800 text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded-xs">YOU</span>}
                                      </div>
                                      <p className="text-[9px] text-slate-400 mt-1">Level {Math.floor(user.points / 150) + 1} Steward</p>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right shrink-0">
                                    <span className="block font-black text-xs text-slate-800">{user.points} pts</span>
                                    <span className="block text-[8px] text-slate-400 font-semibold">{user.reportedCount} reps • {user.verifiedCount} vers</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Sub-tab 2: Point Redemption Mall */}
                  {profileSubTab === 'rewards' && (
                    <div className="space-y-5 text-left">
                      <div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">Rewards Redemption Center</h4>
                          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 font-black">
                            Balance: {currentUser.points} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Trade your community contribution points for physical & travel vouchers authorized by Gwalior Municipal Corp.</p>
                      </div>

                      {profileSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-bounce">
                          {profileSuccessMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {[
                          { id: 'bus_pass', title: 'Gwalior Smart Bus 5-Ride Pass', description: 'Enjoy free transit across Gwalior city routes.', cost: 100, icon: Layers },
                          { id: 'mela_vip', title: 'Gwalior Mela VIP Gatepass', description: 'VIP parking and entry voucher at Gwalior Trade Fair.', cost: 150, icon: MapPin },
                          { id: 'museum_ticket', title: 'Maharaj Bada Museum Admission', description: 'Free entry for two visitors to the historic city halls.', cost: 80, icon: Building },
                          { id: 'tree_sapling', title: 'GNN Nursery Green Sapling', description: 'Claim a complimentary fruit or shade sapling.', cost: 40, icon: Sun },
                          { id: 'parking_ticket', title: 'Smart-Parking 2-Hour Coupon', description: 'Free parking reservation at any GNN multi-level plaza.', cost: 60, icon: Tag }
                        ].map((reward) => {
                          const canAfford = currentUser.points >= reward.cost;
                          const RewardIcon = reward.icon;

                          return (
                            <div key={reward.id} className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex justify-between items-start transition duration-200">
                              <div className="flex items-start space-x-3 text-left">
                                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 shrink-0">
                                  <RewardIcon className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <h5 className="font-black text-slate-800 text-xs tracking-tight">{reward.title}</h5>
                                  <p className="text-[10px] text-slate-500 leading-snug">{reward.description}</p>
                                  <span className="inline-block text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md mt-2">
                                    {reward.cost} points
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRedeemReward(reward)}
                                disabled={!canAfford}
                                className={`text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl transition-all duration-155 shrink-0 min-h-[36px] ${canAfford ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                              >
                                {canAfford ? 'Redeem' : 'Locked'}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Redeemed History */}
                      {redeemedRewards.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-slate-100">
                          <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3">Your Active Vouchers & Coupons</h5>
                          <div className="space-y-2.5">
                            {redeemedRewards.map((v) => (
                              <div key={v.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="text-left">
                                  <p className="font-bold text-slate-800 text-xs">{v.title}</p>
                                  <span className="text-[10px] text-slate-400">Claimed: {new Date(v.redeemedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-white border border-dashed border-slate-300 px-3 py-1.5 rounded-lg text-center select-all font-mono font-black text-blue-600 text-xs tracking-wider">
                                  {v.code}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 3: Daily Quests and Challenges */}
                  {profileSubTab === 'quests' && (
                    <div className="space-y-4 text-left">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">Active Daily Challenges</h4>
                        <p className="text-xs text-slate-400 mt-1">Complete neighborhood check-ins to gain multiplier bonuses and point rewards.</p>
                      </div>

                      <div className="space-y-3.5">
                        {/* Interactive Daily Check-in Card */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            <div className="bg-emerald-100/80 text-emerald-700 p-2.5 rounded-xl border border-emerald-200/50 shrink-0">
                              <CheckCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
                            </div>
                            <div className="space-y-1 text-left">
                              <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight flex items-center space-x-1.5">
                                <span>Daily Attendance Check-in</span>
                                <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Daily Bonus</span>
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Claim your daily citizen check-in points to verify you are patrolling or monitoring Gwalior's streets.
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium font-mono">
                                Resets every 24 hours • Reward: +10 pts
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleDailyCheckIn}
                            disabled={checkedInToday}
                            className={`text-xs font-extrabold uppercase px-4 py-2.5 rounded-xl transition-all duration-200 shrink-0 shadow-xs min-h-[44px] ${
                              checkedInToday
                                ? 'bg-emerald-100 text-emerald-600 cursor-not-allowed border border-emerald-200/50'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-sm'
                            }`}
                          >
                            {checkedInToday ? 'Checked In Today (+10 pts)' : 'Check In Now'}
                          </button>
                        </div>

                        {/* Quest 1 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100 shrink-0">
                              <AlertTriangle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="flex items-center space-x-1.5">
                                <h5 className="font-black text-slate-800 text-xs">Flag a Civic Hazard</h5>
                                <span className="bg-amber-50 text-amber-700 text-[8px] font-extrabold px-1.5 py-0.2 rounded-sm">+25 pts</span>
                              </div>
                              <p className="text-[10px] text-slate-500">Submit a standard report for street light failure, potholes, or open sewers.</p>
                              
                              <div className="flex items-center space-x-2 mt-1.5">
                                <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600" style={{ width: currentUser.reportedCount > 0 ? '100%' : '0%' }} />
                                </div>
                                <span className="text-[9px] font-extrabold text-slate-400">{currentUser.reportedCount > 0 ? '1/1' : '0/1'} Complete</span>
                              </div>
                            </div>
                          </div>
                          {currentUser.reportedCount > 0 ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap min-h-[36px]">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTab('report')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition min-h-[36px]"
                            >
                              Report Now
                            </button>
                          )}
                        </div>

                        {/* Quest 2 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100 shrink-0">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="flex items-center space-x-1.5">
                                <h5 className="font-black text-slate-800 text-xs">Citizen Peer-Verifier</h5>
                                <span className="bg-amber-50 text-amber-700 text-[8px] font-extrabold px-1.5 py-0.2 rounded-sm">+15 pts</span>
                              </div>
                              <p className="text-[10px] text-slate-500">Confirm or verify 2 reported issues near your location in Lashkar or Morar.</p>
                              
                              <div className="flex items-center space-x-2 mt-1.5">
                                <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600" style={{ width: `${Math.min((currentUser.verifiedCount || 0) / 2 * 100, 100)}%` }} />
                                </div>
                                <span className="text-[9px] font-extrabold text-slate-400">{Math.min(currentUser.verifiedCount || 0, 2)}/2 Complete</span>
                              </div>
                            </div>
                          </div>
                          {(currentUser.verifiedCount || 0) >= 2 ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap min-h-[36px]">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTab('feed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition min-h-[36px]"
                            >
                              Explore Tickets
                            </button>
                          )}
                        </div>

                        {/* Quest 3 */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-100 shrink-0">
                              <Mic className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <div className="flex items-center space-x-1.5">
                                <h5 className="font-black text-slate-800 text-xs">Audio Citizen Advocate</h5>
                                <span className="bg-amber-50 text-amber-700 text-[8px] font-extrabold px-1.5 py-0.2 rounded-sm">+35 pts</span>
                              </div>
                              <p className="text-[10px] text-slate-500">Submit a voice note with multilingual explanations on an active report.</p>
                              
                              <div className="flex items-center space-x-2 mt-1.5">
                                <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600" style={{ width: userActivities.some(act => act.voiceNoteUrl) ? '100%' : '0%' }} />
                                </div>
                                <span className="text-[9px] font-extrabold text-slate-400">{userActivities.some(act => act.voiceNoteUrl) ? '1/1' : '0/1'} Complete</span>
                              </div>
                            </div>
                          </div>
                          {userActivities.some(act => act.voiceNoteUrl) ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap min-h-[36px]">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTab('report')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition min-h-[36px]"
                            >
                              Advocate Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 4: My Activity Feed */}
                  {profileSubTab === 'contributions' && (
                    <div className="space-y-4 text-left">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">Your Contribution & Coordination Log</h4>
                        <p className="text-xs text-slate-400 mt-1">Chronological history of your reported and co-signed neighborhood hazard tickets.</p>
                      </div>

                      {userActivities.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 border border-dashed rounded-2xl">
                          No registered interactions. Visit the Map Feed to sign petitions or submit a new case file.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                          {userActivities.map((issue) => {
                            const isReporter = issue.reporterId === currentUser.uid;
                            return (
                              <div key={issue.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1 text-left">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-black text-slate-800 truncate max-w-[200px]">{issue.title}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${isReporter ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                      {isReporter ? 'Reporter' : 'Co-Signer'}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                                    <span>{issue.ward}</span>
                                    <span>•</span>
                                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 self-end md:self-auto">
                                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md uppercase ${issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : issue.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'}`}>
                                    {issue.status}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setActiveTab('feed');
                                    }}
                                    className="text-[10px] font-extrabold uppercase bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg transition min-h-[32px] cursor-pointer"
                                  >
                                    Inspect Case
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 5: Profile Settings & Notification Preferences */}
                  {profileSubTab === 'settings' && (
                    <form onSubmit={handleSaveProfileSettings} className="space-y-4 text-left">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">Citizen Stewardship Settings</h4>
                        <p className="text-xs text-slate-400 mt-1">Configure your personal information and Gwalior local alert channel preferences.</p>
                      </div>

                      {profileSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-bounce">
                          {profileSuccessMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Profile Photo Settings with Upload Option */}
                        <div className="md:col-span-2 space-y-2 border-b border-slate-100 pb-4">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Steward Profile Photo</label>
                          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <img 
                              src={profileEditAvatar || currentUser?.avatar} 
                              alt="Avatar preview" 
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                            />
                            <div className="flex-1 space-y-2 w-full text-left">
                              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                                <select
                                  value={profileEditAvatar}
                                  onChange={(e) => setProfileEditAvatar(e.target.value)}
                                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-700 cursor-pointer font-bold flex-1 min-h-[44px]"
                                >
                                  <option value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80">Male Portrait (Priyansh)</option>
                                  <option value="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80">Female Portrait (Ananya)</option>
                                  <option value="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80">Male Portrait (Kabir)</option>
                                  <option value="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80">Silhouette Placeholder</option>
                                  {profileEditAvatar && !profileEditAvatar.startsWith('https://images.unsplash.com') && (
                                    <option value={profileEditAvatar}>Custom Uploaded Photo</option>
                                  )}
                                </select>
                                
                                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1 flex-1 min-h-[44px]">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload from Gallery</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          if (typeof reader.result === 'string') {
                                            setProfileEditAvatar(reader.result);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <p className="text-[10px] text-slate-400">Choose a default preset avatar or upload your own photo from your device's gallery.</p>
                            </div>
                          </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Steward Display Name</label>
                          <input 
                            type="text"
                            value={profileEditName}
                            onChange={(e) => setProfileEditName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 min-h-[44px]"
                            placeholder="Display name"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Email ID</label>
                          <input 
                            type="email"
                            value={profileEditEmail}
                            onChange={(e) => setProfileEditEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 min-h-[44px]"
                            placeholder="Email address"
                          />
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Registered Mobile Number (OTP Alerts)</label>
                          <input 
                            type="text"
                            value={profileEditPhone}
                            onChange={(e) => setProfileEditPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 min-h-[44px]"
                            placeholder="+91 94251 12345"
                          />
                        </div>

                        {/* Preferred Ward Zone */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Primary Zone of Responsibility</label>
                          <select 
                            value={profileEditWard}
                            onChange={(e) => setProfileEditWard(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 min-h-[44px]"
                          >
                            <option value="Lashkar Zone (Maharaj Bada)">Lashkar Zone (Maharaj Bada)</option>
                            <option value="Morar Zone (Thatipur)">Morar Zone (Thatipur)</option>
                            <option value="City Center Gwalior">City Center Gwalior</option>
                            <option value="Fort & Old Town Area">Fort & Old Town Area</option>
                            <option value="DD Nagar & Pinto Park">DD Nagar & Pinto Park</option>
                          </select>
                        </div>

                        {/* If authority or admin, show department and level selects */}
                        {(currentUser?.role === 'authority' || currentUser?.role === 'admin') && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-500 block">Assigned Nagar Nigam Department</label>
                              <select 
                                value={profileEditDepartment}
                                onChange={(e) => setProfileEditDepartment(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 min-h-[44px]"
                              >
                                {Object.entries(DEPARTMENTS).map(([key, val]) => (
                                  <option key={key} value={key}>{val.icon} {val.label} ({val.hindiLabel})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-500 block">Authority Officer Level</label>
                              <select 
                                value={profileEditAuthorityLevel}
                                onChange={(e) => setProfileEditAuthorityLevel(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 min-h-[44px]"
                              >
                                {Object.entries(AUTHORITY_LEVELS).map(([key, val]) => (
                                  <option key={key} value={key}>{val.badge} {val.label} ({val.hindiLabel})</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Notification Toggles */}
                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 block">Civic Alert Notifications</label>
                        
                        <div className="space-y-3">
                          <label className="flex items-start space-x-3 cursor-pointer min-h-[44px]">
                            <input 
                              type="checkbox" 
                              checked={profileNotificationSMS}
                              onChange={(e) => setProfileNotificationSMS(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5" 
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 block">SMS Alerts</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Instant SMS upon local hazard routing or state status updates.</span>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 cursor-pointer min-h-[44px]">
                            <input 
                              type="checkbox" 
                              checked={profileNotificationWhatsApp}
                              onChange={(e) => setProfileNotificationWhatsApp(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5" 
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 block">WhatsApp Broadcasts</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Weekly summaries of ward resolution rates and leaderboards.</span>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 cursor-pointer min-h-[44px]">
                            <input 
                              type="checkbox" 
                              checked={profileNotificationEmail}
                              onChange={(e) => setProfileNotificationEmail(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5" 
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 block">Official Email Dispatch</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Official letters from Gwalior Nagar Nigam regarding resolution audits.</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase px-5 py-3 rounded-xl transition shadow-xs cursor-pointer min-h-[44px]"
                        >
                          Save Settings
                        </button>
                      </div>
                    </form>
                  )}
                  
                  {/* Sub-tab 6: Gwalior Authority Attendance & Patrol Portal */}
                  {profileSubTab === 'attendance' && currentUser && (currentUser.role === 'authority' || currentUser.role === 'admin') && (
                    <div className="space-y-6 text-left">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                            <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <span>GMC Authority Attendance & Duty Portal</span>
                          </h4>
                          <p className="text-xs text-emerald-700/80">
                            Logged in as <strong className="font-bold">{currentUser.name}</strong> • Level {currentUser.accessLevel === 'level_3' ? '3 (Commissioner/Admin)' : currentUser.accessLevel === 'level_2' ? '2 (Zonal Officer)' : '1 (Field Inspector)'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/80 border border-emerald-200/50 px-3 py-1.5 rounded-xl self-start md:self-auto shrink-0 shadow-2xs">
                          <span className={`w-2.5 h-2.5 rounded-full ${checkedInAttendanceToday ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                          <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-wide">
                            Today's Status: {checkedInAttendanceToday ? 'Active on Duty' : 'Pending Check-In'}
                          </span>
                        </div>
                      </div>

                      {currentUser.verificationStatus !== 'verified' && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="font-medium">
                            <strong>Notice:</strong> Your Gwalior Municipal Corporation profile is currently pending verification. Some attendance records are logged under audit mode.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Attendance Submission Form */}
                        <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Patrol Shift Time Tracking</h5>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              activePatrolSession ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}>
                              {activePatrolSession ? 'Shift Active' : 'Off-Duty'}
                            </span>
                          </div>
                          
                          {activePatrolSession ? (
                            <div className="space-y-4">
                              <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3.5 space-y-2.5">
                                <div className="flex items-center space-x-2 text-amber-800">
                                  <Clock className="w-4 h-4 animate-spin text-amber-600 [animation-duration:8s]" />
                                  <h6 className="text-xs font-bold">On-Duty / Active Patrol Session</h6>
                                </div>
                                <div className="text-[11px] text-slate-600 space-y-1.5 font-medium">
                                  <p>📍 <strong className="text-slate-800">Assigned Ward:</strong> {activePatrolSession.location}</p>
                                  <p>⏱️ <strong className="text-slate-800">Check-In Time:</strong> {new Date(activePatrolSession.checkInTime || activePatrolSession.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                  <p>📅 <strong className="text-slate-800">Date:</strong> {new Date(activePatrolSession.checkInTime || activePatrolSession.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 block">Patrol Summary & Actions Completed</label>
                                <textarea
                                  value={patrolSummaryText}
                                  onChange={(e) => setPatrolSummaryText(e.target.value)}
                                  placeholder="E.g., Cleared garbage dump at Bada, verified light functioning near Fort road..."
                                  rows={3}
                                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium placeholder:text-slate-400"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase py-3 rounded-xl transition duration-200 shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center space-x-2 border-none"
                              >
                                {isCheckingOut ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Registering Check-Out...</span>
                                  </>
                                ) : (
                                  <>
                                    <LogOut className="w-4 h-4" />
                                    <span>End Patrol & Check-Out</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 block">Duty / Patrol Ward Area</label>
                                <select 
                                  value={attendanceLocation}
                                  onChange={(e) => setAttendanceLocation(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 min-h-[44px]"
                                >
                                  <option value="Lashkar Zone (Maharaj Bada)">Lashkar Zone (Maharaj Bada)</option>
                                  <option value="Morar Zone (Thatipur)">Morar Zone (Thatipur)</option>
                                  <option value="City Center Gwalior">City Center Gwalior</option>
                                  <option value="Fort & Old Town Area">Fort & Old Town Area</option>
                                  <option value="DD Nagar & Pinto Park">DD Nagar & Pinto Park</option>
                                  <option value="Gwalior Nagar Nigam HQ">Gwalior Nagar Nigam HQ</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={submitAttendance}
                                disabled={isSubmittingAttendance}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase py-3 rounded-xl transition duration-200 shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center space-x-2 border-none"
                              >
                                {isSubmittingAttendance ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Starting Shift...</span>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-4 h-4" />
                                    <span>Check-In & Start Patrol Duty</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                          
                          <div className="text-[10px] text-slate-400 leading-relaxed border-t pt-3 space-y-1">
                            <p><strong>System Note:</strong> Gwalior municipal authorities are tracked on check-in and check-out to calculate precise duty hours.</p>
                            <p className="text-emerald-600 font-bold">✓ Each official's records are tracked and compiled separately.</p>
                          </div>
                        </div>

                        {/* Attendance Logs & App Opens History */}
                        <div className="md:col-span-7 space-y-3">
                          <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Your Personal Log History</h5>
                          
                          {!currentUser.attendanceLogs || currentUser.attendanceLogs.length === 0 ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                              No log data recorded. Logs are created automatically when you launch the app or check-in.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                              {[...currentUser.attendanceLogs].reverse().map((log, idx) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-2xs hover:border-slate-200 transition">
                                  <div className="flex items-start space-x-2.5">
                                    <div className={`p-2 rounded-lg shrink-0 ${log.type === 'manual_checkin' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                      {log.type === 'manual_checkin' ? <MapPin className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="space-y-0.5 text-left flex-1 min-w-0">
                                      <p className="text-xs font-bold text-slate-700">
                                        {log.type === 'manual_checkin' ? 'Patrol Check-In' : 'Civic App Activity'}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        Location: <strong className="text-slate-700">{log.location}</strong>
                                        {log.latitude && log.longitude && (
                                          <span className="text-[9px] text-emerald-600 ml-1.5 font-mono bg-emerald-50 px-1 py-0.5 rounded">
                                            ({log.latitude.toFixed(4)}°N, {log.longitude.toFixed(4)}°E)
                                          </span>
                                        )}
                                      </p>
                                      
                                      {/* check-in / check-out status and duration details */}
                                      {log.type === 'manual_checkin' && (
                                        <div className="mt-1.5 flex flex-wrap gap-2 text-[9px] items-center">
                                          <span className={`px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                                            log.status === 'active' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          }`}>
                                            {log.status === 'active' ? '● On Patrol (Active)' : '✓ Patrol Completed'}
                                          </span>
                                          {log.checkInTime && (
                                            <span className="text-slate-500">
                                              In: <strong>{new Date(log.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                                            </span>
                                          )}
                                          {log.checkOutTime && (
                                            <span className="text-slate-500">
                                              Out: <strong>{new Date(log.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                                            </span>
                                          )}
                                          {log.status === 'completed' && log.durationMinutes !== undefined && (
                                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                              ⏱️ Duration: {log.durationMinutes} mins
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {/* Patrol Summary Report */}
                                      {log.patrolSummary && (
                                        <div className="mt-1.5 p-2.5 bg-slate-50/80 rounded-xl border border-slate-150 text-[10px] text-slate-600 italic">
                                          <strong className="text-slate-700 font-bold block not-italic text-[9px] uppercase tracking-wider text-emerald-700 mb-0.5">Patrol Shift Report:</strong>
                                          "{log.patrolSummary}"
                                        </div>
                                      )}

                                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] text-slate-400 mt-1.5">
                                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-semibold">
                                          📖 Current: {log.pageOpened || 'Feed & Issues Board'}
                                        </span>
                                        {log.type !== 'manual_checkin' && (
                                          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-sm font-semibold">
                                            ⏱️ Active: {log.durationMinutes || 5} mins
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Pages Visited in Session */}
                                      {log.pagesVisited && log.pagesVisited.length > 0 && (
                                        <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-100">
                                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1 mb-1">
                                            <span>👁️ Pages Visited ({log.pagesVisited.length})</span>
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {log.pagesVisited.map((p, pIdx) => (
                                              <span key={pIdx} className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded-md text-[8px] font-medium border border-slate-100">
                                                {p}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Updates and Actions performed in Session */}
                                      {log.updatesPerformed && log.updatesPerformed.length > 0 && (
                                        <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-100">
                                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight flex items-center gap-1 mb-1">
                                            <span>✍️ Updates / Actions ({log.updatesPerformed.length})</span>
                                          </p>
                                          <ul className="space-y-1">
                                            {log.updatesPerformed.map((u, uIdx) => (
                                              <li key={uIdx} className="text-[8px] text-emerald-700 bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                                <span>{u}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 font-mono text-[9px] text-slate-400">
                                    <p className="font-bold text-slate-600">
                                      {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </p>
                                    <p className="mt-0.5">
                                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* High Level Tip */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-left">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-700">Gwalior Citizen Registry Coordination</p>
                      <p className="text-slate-500 text-[10px] leading-relaxed">
                        Points earned on CivicPulse are mapped directly to official verified citizen credentials. Do not share active QR/voucher codes with unregistered accounts.
                      </p>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* View 7: Citizen Leaderboards */}
            {activeTab === 'leaderboard' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-slate-200 p-4 md:p-8 shadow-xs space-y-6"
              >
                <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start space-x-3 text-left">
                    <div className="p-2 bg-yellow-50 rounded-xl border border-yellow-150 shrink-0 mt-0.5">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-800">Honorary Civic Leaderboard</h2>
                      <p className="text-xs text-slate-500">Citizens driving localized resolution and neighborhood stewardship.</p>
                    </div>
                  </div>
                  
                  {/* Density and Layout controls */}
                  <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                    {/* View mode toggle */}
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 min-h-[38px]">
                      <button
                        type="button"
                        onClick={() => setLeaderboardViewMode('cards')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${leaderboardViewMode === 'cards' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Card Grid
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaderboardViewMode('table')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${leaderboardViewMode === 'table' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Table View
                      </button>
                    </div>

                    {/* Column density (Only visible when Card Grid is active) */}
                    {leaderboardViewMode === 'cards' && (
                      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 min-h-[38px]">
                        <span className="text-[10px] font-black uppercase text-slate-400 px-2 sm:inline hidden">Density:</span>
                        <button
                          type="button"
                          onClick={() => setLeaderboardMobileCols(1)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${leaderboardMobileCols === 1 ? 'bg-slate-950 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                          title="1 Column Grid"
                        >
                          1 Col
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeaderboardMobileCols(2)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${leaderboardMobileCols === 2 ? 'bg-slate-950 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                          title="2 Columns Grid"
                        >
                          2 Col
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {leaderboardViewMode === 'cards' ? (
                  /* Cards layout with custom density */
                  <div className={`grid gap-4 ${leaderboardMobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-3`}>
                    {leaderboard
                      .filter(u => u.role === 'citizen')
                      .sort((a, b) => b.points - a.points)
                      .map((user, idx) => (
                        <div 
                          key={user.uid} 
                          className={`bg-white border rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition duration-200 relative overflow-hidden text-left ${
                            user.uid === currentUser?.uid 
                              ? 'border-blue-300 ring-2 ring-blue-50/50 shadow-sm bg-blue-50/10' 
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          {/* Rank badge ribbon */}
                          <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-mono text-[10px] font-black uppercase tracking-wider ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-800 border-l border-b border-yellow-200' :
                            idx === 1 ? 'bg-slate-100 text-slate-800 border-l border-b border-slate-200' :
                            idx === 2 ? 'bg-orange-100 text-orange-800 border-l border-b border-orange-200' :
                            'bg-slate-50 text-slate-500 border-l border-b border-slate-150'
                          }`}>
                            {idx === 0 ? '🏆 Rank 1' : idx === 1 ? '🥈 Rank 2' : idx === 2 ? '🥉 Rank 3' : `#${idx + 1}`}
                          </div>

                          <div className="flex items-center space-x-3 pr-16">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs" 
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-1">
                                {user.name}
                                {user.uid === currentUser?.uid && (
                                  <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide">You</span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Ward: {idx % 2 === 0 ? 'Downtown Core' : 'Eastside Waterfront'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-center">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reported</span>
                              <p className="text-xs font-black text-slate-700">{user.reportedCount}</p>
                            </div>
                            <div className="space-y-0.5 border-l border-slate-200">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Verified</span>
                              <p className="text-xs font-black text-slate-700">{user.verifiedCount}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div className="flex -space-x-1 shrink-0">
                              {user.badges.map((b, bIdx) => (
                                <div 
                                  key={bIdx} 
                                  className="w-6 h-6 bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 rounded-full flex items-center justify-center border-2 border-white text-[9px] font-black shadow-3xs" 
                                  title={b.title}
                                >
                                  ★
                                </div>
                              ))}
                              {user.badges.length === 0 && (
                                <span className="text-[9px] text-slate-400 font-semibold italic">No badges yet</span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-blue-600">{user.points} pts</p>
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Steward Points</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  /* Standard wide table layout with responsive wrapper */
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-3xs bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                          <th className="py-3.5 px-4 font-extrabold">Rank</th>
                          <th className="py-3.5 px-4 font-extrabold">Citizen</th>
                          <th className="py-3.5 px-4 text-center font-extrabold">Incidents Flagged</th>
                          <th className="py-3.5 px-4 text-center font-extrabold">Verifications Completed</th>
                          <th className="py-3.5 px-4 text-center font-extrabold">Achievements Unlocked</th>
                          <th className="py-3.5 px-4 text-right font-extrabold">Steward Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {leaderboard
                          .filter(u => u.role === 'citizen')
                          .sort((a, b) => b.points - a.points)
                          .map((user, idx) => (
                            <tr key={user.uid} className={`hover:bg-slate-50/50 transition ${user.uid === currentUser?.uid ? 'bg-blue-50/40 font-semibold' : ''}`}>
                              <td className="py-4 px-4 font-black text-slate-700">
                                {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                              </td>
                              <td className="py-4 px-4 flex items-center space-x-3">
                                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                                <div>
                                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                    {user.name}
                                    {user.uid === currentUser?.uid && (
                                      <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide">You</span>
                                    )}
                                  </p>
                                  <span className="text-[10px] text-slate-400">Ward: {idx % 2 === 0 ? 'Downtown Core' : 'Eastside Waterfront'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center font-bold text-slate-700">{user.reportedCount}</td>
                              <td className="py-4 px-4 text-center font-bold text-slate-700">{user.verifiedCount}</td>
                              <td className="py-4 px-4 text-center">
                                <div className="flex justify-center -space-x-1">
                                  {user.badges.map((b, bIdx) => (
                                    <div key={bIdx} className="w-5.5 h-5.5 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white text-[8px] font-black shadow-3xs" title={b.title}>
                                      ★
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right font-black text-slate-800 text-sm">{user.points} pts</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* View 8: Municipal Admin Verification and Access Panel */}
            {activeTab === 'admin_panel' && (currentUser?.role === 'admin' || (currentUser?.role === 'authority' && currentUser?.accessLevel === 'level_3')) && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-slate-200/80 pt-5 pb-5 md:pt-8 md:pb-8 pl-[9.25px] pr-[9.25px] md:pl-[9.25px] md:pr-[9.25px] shadow-sm space-y-8"
              >
                {/* Google Product Style Header */}
                <div className="border-b border-slate-150 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 font-sans">
                        {currentUser?.accessLevel === 'level_3' ? 'Executive Operations Console' : 'GMC Admin Control Center'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed pl-[6px] ml-[5px] mr-[5px] pr-[5px]">
                      {currentUser?.accessLevel === 'level_3'
                        ? 'System-wide monitoring of Gwalior Municipal Corporation, including official verifications, personnel management, and zonal inspector attendance metrics.'
                        : 'Review official credentials, assign municipal access, audit live attendance maps, and configure clearance tiers across active zones.'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100/80 px-3 py-1.5 rounded-full shrink-0 self-start md:self-center">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full absolute"></span>
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider font-mono pl-1">
                      {currentUser?.accessLevel === 'level_3' ? 'Commissioner Online' : 'Operator Active'}
                    </span>
                  </div>
                </div>

                {/* Google Material 3-style Metrics Cards (Bento) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center space-x-4 transition-all duration-200">
                    <div className="p-3 rounded-2xl bg-[#fef7e0] text-[#b06000] shrink-0 border border-[#fbe9b9]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Approvals</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                        {leaderboard.filter(u => u.role === 'authority' && u.verificationStatus === 'pending').length} Applicants
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center space-x-4 transition-all duration-200">
                    <div className="p-3 rounded-2xl bg-[#e6f4ea] text-[#137333] shrink-0 border border-[#ceead6]">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verified GMC Staff</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                        {leaderboard.filter(u => u.role === 'authority' && u.verificationStatus === 'verified').length} Approved
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex items-center space-x-4 transition-all duration-200">
                    <div className="p-3 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] shrink-0 border border-[#d2e3fc]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Registered</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                        {leaderboard.length} Citizens
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Sub-navigation Controls & Interactive Filter (Material Segmented Control) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/60 pb-4 gap-4">
                  {/* Segmented Pill Selector */}
                  <div className="bg-slate-100 p-1 rounded-xl inline-flex border border-slate-200/60 self-start text-center pl-[3.25px] ml-[20px] mr-[20px]">
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('roster')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer min-h-[36px] ${
                        adminSubTab === 'roster'
                          ? 'bg-white text-blue-600 shadow-sm border border-slate-200/20'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Personnel Roster</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminSubTab('attendance_reports');
                        fetchAttendanceReports();
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer min-h-[36px] ${
                        adminSubTab === 'attendance_reports'
                          ? 'bg-white text-blue-600 shadow-sm border border-slate-200/20'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Attendance & Duty Logs</span>
                    </button>
                  </div>

                  {/* Real-time search filter */}
                  {adminSubTab === 'roster' && (
                    <div className="relative w-full md:max-w-xs self-stretch md:self-auto">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search roster by name, email or UID..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 text-xs px-3.5 py-2 pl-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-slate-800"
                      />
                      {adminSearchQuery && (
                        <button
                          onClick={() => setAdminSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-mono"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub-tab 1: Personnel Roster Tab */}
                {adminSubTab === 'roster' && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider text-left">
                        Official Gwalior Municipal Corporation Directory
                      </h3>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        {/* Customizable density layout toggler */}
                        <div className="md:hidden flex items-center space-x-1 bg-white border border-slate-200 p-0.5 rounded-lg shrink-0 min-h-[32px]">
                          <span className="text-[8px] font-black uppercase text-slate-400 px-1.5">Density:</span>
                          <button
                            type="button"
                            onClick={() => setAdminMobileColumns(1)}
                            className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition ${adminMobileColumns === 1 ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            title="1 Column Grid"
                          >
                            1 Col
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminMobileColumns(2)}
                            className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition ${adminMobileColumns === 2 ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                            title="2 Columns Parallel Grid"
                          >
                            2 Col
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-500 font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
                          {
                            leaderboard.filter(u => {
                              if (u.role !== 'authority' && u.role !== 'admin') return false;
                              const q = adminSearchQuery.toLowerCase();
                              return u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.uid || '').toLowerCase().includes(q);
                            }).length
                          } verified officials & applicants
                        </span>
                      </div>
                    </div>

                    {/* Mobile-First Layout: Card-Based Layout with custom column density */}
                    <div className={`grid md:hidden gap-3 ${adminMobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {leaderboard
                        .filter(u => {
                          if (u.role !== 'authority' && u.role !== 'admin') return false;
                          const q = adminSearchQuery.toLowerCase();
                          return u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.uid || '').toLowerCase().includes(q);
                        })
                        .map((user) => {
                          const isPending = user.verificationStatus === 'pending';
                          const isVerified = user.verificationStatus === 'verified';
                          const isRejected = user.verificationStatus === 'rejected';
                          const userDept = user.department || 'water';
                          const userLevel = user.authorityLevel || 'inspector';
                          const isExpanded = !!expandedUserUids[user.uid];

                          return (
                              <div 
                                key={user.uid} 
                                className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between transition-all duration-150 hover:border-slate-300"
                              >
                                {/* Collapsible Header */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedUserUids(prev => ({
                                      ...prev,
                                      [user.uid]: !prev[user.uid]
                                    }));
                                  }}
                                  className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50/50 transition duration-150 rounded-xl focus:outline-none"
                                >
                                  <div className="flex items-center space-x-3 text-left min-w-0 flex-1">
                                    <div className="relative shrink-0">
                                      <img 
                                        src={user.avatar} 
                                        alt={user.name} 
                                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-50" 
                                        referrerPolicy="no-referrer" 
                                      />
                                      {isVerified && (
                                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 border border-white text-white p-0.5 rounded-full" title="GMC Authenticated">
                                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                        </span>
                                      )}
                                    </div>
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                      <h4 className="font-bold text-slate-800 leading-tight text-sm truncate">
                                        {user.name}
                                      </h4>
                                      <span className={`inline-block text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                                        user.role === 'admin' 
                                          ? 'bg-purple-50 text-purple-700 border-purple-150' 
                                          : user.accessLevel === 'level_3'
                                          ? 'bg-rose-50 text-rose-700 border-rose-150'
                                          : user.accessLevel === 'level_2'
                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-150'
                                          : user.accessLevel === 'level_1'
                                          ? 'bg-teal-50 text-teal-700 border-teal-150'
                                          : 'bg-slate-50 text-slate-500 border-slate-200'
                                      }`}>
                                        {user.role === 'admin' 
                                          ? 'Root Admin' 
                                          : user.accessLevel === 'level_3'
                                          ? 'Level 3 (Commissioner)'
                                          : user.accessLevel === 'level_2'
                                          ? 'Level 2 (Dept Head)'
                                          : user.accessLevel === 'level_1'
                                          ? 'Level 1 (Inspector)'
                                          : 'Level: Unassigned'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 shrink-0">
                                    {/* Tiny pending dot indicator if collapsed */}
                                    {!isExpanded && isPending && (
                                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    )}
                                    <div className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                                      )}
                                    </div>
                                  </div>
                                </button>

                                {/* Collapsible Details Panel with smooth layout transition */}
                                {isExpanded && (
                                  <div className="border-t border-slate-100 p-4 pt-3.5 space-y-4 bg-slate-50/40 rounded-b-xl text-left">
                                    {/* Email */}
                                    <div className="space-y-0.5">
                                      <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Email Address</span>
                                      <p className="text-xs font-semibold text-slate-700 truncate">{user.email || 'no-email@gwalior.gov.in'}</p>
                                    </div>

                                    {/* Department & Designation Badges */}
                                    {user.role === 'authority' && (
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Assigned Duty</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/60 flex items-center gap-1">
                                            {DEPARTMENTS[userDept]?.icon || '🏢'} {DEPARTMENTS[userDept]?.label || 'Unassigned'}
                                          </span>
                                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60 flex items-center gap-1">
                                            {AUTHORITY_LEVELS[userLevel]?.badge || '🛡️'} {AUTHORITY_LEVELS[userLevel]?.label || 'Officer'}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Verification Status Banner */}
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Status</span>
                                      {isPending && (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-850 border border-amber-200 font-bold text-[9px]">
                                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                                          <span>Pending Approval</span>
                                        </span>
                                      )}
                                      {isVerified && (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-850 border border-emerald-200 font-bold text-[9px]">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                          <span>Verified Active</span>
                                        </span>
                                      )}
                                      {isRejected && (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-850 border border-rose-200 font-bold text-[9px]">
                                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                          <span>Access Revoked</span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Access Allocation Dropdowns */}
                                    {user.role !== 'admin' && (
                                      <div className="space-y-3 pt-1">
                                        {/* Clearance Tier Dropdown */}
                                        <div className="space-y-1">
                                          <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Access Clearance</label>
                                          <select
                                            value={user.accessLevel || 'none'}
                                            onChange={(e) => {
                                              handleAdminVerifyUser(user.uid, user.verificationStatus as any, e.target.value as any, user.role, userDept, userLevel);
                                            }}
                                            className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold cursor-pointer transition focus:ring-2 focus:ring-blue-100 focus:outline-none min-h-[36px]"
                                          >
                                            <option value="none">No Level (Unassigned)</option>
                                            <option value="level_1">Level 1 (Field Inspector)</option>
                                            <option value="level_2">Level 2 (Department Head)</option>
                                            <option value="level_3">Level 3 (Municipal Commissioner)</option>
                                          </select>
                                        </div>

                                        {/* Department & Designation: only shown on 1-column density */}
                                        {adminMobileColumns === 1 && (
                                          <>
                                            <div className="space-y-1">
                                              <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Assigned Department</label>
                                              <select
                                                value={userDept}
                                                onChange={(e) => {
                                                  handleAdminVerifyUser(user.uid, user.verificationStatus as any, user.accessLevel, user.role, e.target.value, userLevel);
                                                }}
                                                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold cursor-pointer transition focus:ring-2 focus:ring-blue-100 focus:outline-none min-h-[36px]"
                                              >
                                                {Object.entries(DEPARTMENTS).map(([key, val]) => (
                                                  <option key={key} value={key}>{val.icon} {val.label}</option>
                                                ))}
                                              </select>
                                            </div>

                                            <div className="space-y-1">
                                              <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Designation Title</label>
                                              <select
                                                value={userLevel}
                                                onChange={(e) => {
                                                  handleAdminVerifyUser(user.uid, user.verificationStatus as any, user.accessLevel, user.role, userDept, e.target.value);
                                                }}
                                                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold cursor-pointer transition focus:ring-2 focus:ring-blue-100 focus:outline-none min-h-[36px]"
                                              >
                                                {Object.entries(AUTHORITY_LEVELS).map(([key, val]) => (
                                                  <option key={key} value={key}>{val.badge} {val.label}</option>
                                                ))}
                                              </select>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {/* Action Buttons */}
                                    {user.role !== 'admin' && (
                                      <div className="pt-2.5 flex items-center justify-end">
                                        {!isVerified ? (
                                          <button
                                            type="button"
                                            onClick={() => handleAdminVerifyUser(user.uid, 'verified', user.accessLevel || 'level_1', user.role, userDept, userLevel)}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold tracking-wider uppercase transition shadow-sm cursor-pointer min-h-[40px] flex items-center justify-center"
                                          >
                                            Grant Verification
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleAdminVerifyUser(user.uid, 'rejected', 'none', user.role, userDept, userLevel)}
                                            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer min-h-[40px] flex items-center justify-center"
                                          >
                                            Revoke Access
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      {leaderboard.filter(u => {
                        if (u.role !== 'authority' && u.role !== 'admin') return false;
                        const q = adminSearchQuery.toLowerCase();
                        return u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.uid || '').toLowerCase().includes(q);
                      }).length === 0 && (
                        <div className="text-center py-10 text-slate-400 bg-white border border-slate-200 rounded-xl col-span-full">
                          No registered personnel matched "{adminSearchQuery}".
                        </div>
                      )}
                    </div>

                    {/* Desktop View: Full-Featured Table */}
                    <div className="hidden md:block overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 text-[10px] uppercase tracking-wider">
                              <th className="py-3.5 px-4 font-bold">Officer / Application</th>
                              <th className="py-3.5 px-4 font-bold">Contact Details</th>
                              <th className="py-3.5 px-4 font-bold">Verification Status</th>
                              <th className="py-3.5 px-4 font-bold">Access Allocation</th>
                              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600">
                            {leaderboard
                              .filter(u => {
                                if (u.role !== 'authority' && u.role !== 'admin') return false;
                                const q = adminSearchQuery.toLowerCase();
                                return u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.uid || '').toLowerCase().includes(q);
                              })
                              .map((user) => {
                                const isPending = user.verificationStatus === 'pending';
                                const isVerified = user.verificationStatus === 'verified';
                                const isRejected = user.verificationStatus === 'rejected';
                                const userDept = user.department || 'water';
                                const userLevel = user.authorityLevel || 'inspector';

                                return (
                                  <tr key={user.uid} className="hover:bg-slate-50/50 transition duration-150">
                                    {/* Column 1: Avatar & Identity Details */}
                                    <td className="py-4 px-4">
                                      <div className="flex items-center space-x-3.5">
                                        <div className="relative">
                                          <img 
                                            src={user.avatar} 
                                            alt={user.name} 
                                            className="w-10 h-10 rounded-xl object-cover border border-slate-250 bg-slate-50" 
                                            referrerPolicy="no-referrer" 
                                          />
                                          {isVerified && (
                                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white text-white p-0.5 rounded-full" title="GMC Authenticated">
                                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-left">
                                          <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                            <span className="text-[9px] text-slate-400 font-mono bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/30">
                                              UID: {user.uid.substring(0, 8)}...
                                            </span>
                                            {user.role === 'authority' && (
                                              <>
                                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                                                  {DEPARTMENTS[userDept]?.icon || '🏢'} {DEPARTMENTS[userDept]?.label || 'Unassigned'}
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                                                  {AUTHORITY_LEVELS[userLevel]?.badge || '🛡️'} {AUTHORITY_LEVELS[userLevel]?.label || 'Officer'}
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Column 2: Role and Email */}
                                    <td className="py-4 px-4 text-left">
                                      <p className="font-medium text-slate-700">{user.email || 'no-email@gwalior.gov.in'}</p>
                                      <span className={`inline-block text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded mt-1 ${
                                        user.role === 'admin' 
                                          ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                      }`}>
                                        {user.role === 'admin' ? 'Root Administrator' : 'Municipal Official'}
                                      </span>
                                    </td>

                                    {/* Column 3: Status Badge */}
                                    <td className="py-4 px-4 text-left">
                                      {isPending && (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                                          <span>Pending Approval</span>
                                        </span>
                                      )}
                                      {isVerified && (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                          <span>Verified Active</span>
                                        </span>
                                      )}
                                      {isRejected && (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px]">
                                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                          <span>Access Revoked</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* Column 4: Clearance Levels Controls */}
                                    <td className="py-4 px-4 text-left">
                                      {user.role === 'admin' ? (
                                        <span className="text-xs font-bold text-purple-700 font-mono">System Owner</span>
                                      ) : (
                                        <div className="flex flex-col space-y-2 max-w-[210px]">
                                          {/* Clearance Tier Dropdown */}
                                          <div className="space-y-0.5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Access Clearance</label>
                                            <select
                                              value={user.accessLevel || 'none'}
                                              onChange={(e) => {
                                                handleAdminVerifyUser(user.uid, user.verificationStatus as any, e.target.value as any, user.role, userDept, userLevel);
                                              }}
                                              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold cursor-pointer transition focus:ring-2 focus:ring-blue-100 focus:outline-none"
                                            >
                                              <option value="none">No Level (Unassigned)</option>
                                              <option value="level_1">Level 1 (Field Inspector)</option>
                                              <option value="level_2">Level 2 (Department Head)</option>
                                              <option value="level_3">Level 3 (Municipal Commissioner)</option>
                                            </select>
                                          </div>

                                          {/* Department Dropdown */}
                                          <div className="space-y-0.5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Assigned Department</label>
                                            <select
                                              value={userDept}
                                              onChange={(e) => {
                                                handleAdminVerifyUser(user.uid, user.verificationStatus as any, user.accessLevel, user.role, e.target.value, userLevel);
                                              }}
                                              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold cursor-pointer transition focus:ring-2 focus:ring-blue-100 focus:outline-none"
                                            >
                                              {Object.entries(DEPARTMENTS).map(([key, val]) => (
                                                <option key={key} value={key}>{val.icon} {val.label}</option>
                                              ))}
                                            </select>
                                          </div>

                                          {/* Designation Dropdown */}
                                          <div className="space-y-0.5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Designation Title</label>
                                            <select
                                              value={userLevel}
                                              onChange={(e) => {
                                                handleAdminVerifyUser(user.uid, user.verificationStatus as any, user.accessLevel, user.role, userDept, e.target.value);
                                              }}
                                              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold cursor-pointer transition focus:ring-2 focus:ring-blue-100 focus:outline-none"
                                            >
                                              {Object.entries(AUTHORITY_LEVELS).map(([key, val]) => (
                                                <option key={key} value={key}>{val.badge} {val.label}</option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
                                      )}
                                    </td>

                                    {/* Column 5: Approval Buttons */}
                                    <td className="py-4 px-4 text-right">
                                      {user.role !== 'admin' && (
                                        <div className="flex items-center justify-end">
                                          {!isVerified ? (
                                            <button
                                              type="button"
                                              onClick={() => handleAdminVerifyUser(user.uid, 'verified', user.accessLevel || 'level_1', user.role, userDept, userLevel)}
                                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors shadow-sm cursor-pointer min-h-[32px]"
                                            >
                                              Grant Verification
                                           </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleAdminVerifyUser(user.uid, 'rejected', 'none', user.role, userDept, userLevel)}
                                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer min-h-[32px]"
                                            >
                                              Revoke Access
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            {leaderboard.filter(u => {
                              if (u.role !== 'authority' && u.role !== 'admin') return false;
                              const q = adminSearchQuery.toLowerCase();
                              return u.name.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.uid || '').toLowerCase().includes(q);
                            }).length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-400">
                                  No registered personnel matched "{adminSearchQuery}".
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Attendance & Patrol Logs Tab */}
                {adminSubTab === 'attendance_reports' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/60 pb-3 gap-3 text-left">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5 ml-[5px]">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span>GMC Live Field Patrol & Presence Logs</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 ml-[5px] pl-[5px]">
                          Real-time audit track of Level 1 & Level 2 officers: including precise geo-fenced patrol check-ins, app engagement sessions, and page history.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={fetchAttendanceReports}
                        disabled={isFetchingReports}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer self-start md:self-auto min-h-[40px] focus:outline-none ml-[5px]"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isFetchingReports ? 'animate-spin' : ''}`} />
                        <span>Force Sync Logs</span>
                      </button>
                    </div>

                    {isFetchingReports && attendanceReports.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
                          Synchronizing with Gwalior Nagar Nigam Database...
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Column 1: Duty Activity Overview list */}
                        <div className="lg:col-span-7 space-y-3.5 text-left">
                          <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                            Verified Duty Officers
                          </h5>
                          
                          <div className="overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50/80 text-slate-400 font-bold border-b border-slate-200/60 text-[10px] uppercase tracking-wider">
                                    <th className="py-3 px-4 font-bold">Duty Officer</th>
                                    <th className="py-3 px-4 text-center font-bold">App Opens</th>
                                    <th className="py-3 px-4 text-center font-bold">Patrol Audits</th>
                                    <th className="py-3 px-4 text-right font-bold">Details</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                  {attendanceReports.map((report) => {
                                    const isSelected = selectedReportUser?.uid === report.uid;
                                    return (
                                      <tr 
                                        key={report.uid} 
                                        className={`hover:bg-slate-50/50 transition cursor-pointer ${
                                          isSelected ? 'bg-blue-50/40 hover:bg-blue-50/40 border-l-4 border-blue-600' : ''
                                        }`}
                                        onClick={() => setSelectedReportUser(report)}
                                      >
                                        <td className="py-3.5 px-4">
                                          <div className="flex items-center space-x-3 w-[129px]">
                                            <img 
                                              src={report.avatar} 
                                              alt={report.name} 
                                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-slate-50" 
                                              referrerPolicy="no-referrer" 
                                            />
                                            <div className="text-left">
                                              <p className="font-bold text-slate-800">{report.name}</p>
                                              <span className="inline-block text-[9px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50 mt-0.5">
                                                {report.accessLevel === 'level_2' ? 'Zonal Officer (L2)' : 'Field Inspector (L1)'}
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-700 w-[34.9167px]">
                                          {report.appOpensCount}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold font-mono text-emerald-600">
                                          {report.manualCheckinsCount}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedReportUser(report);
                                            }}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer min-h-[30px] ${
                                              isSelected 
                                                ? 'bg-blue-600 text-white shadow-sm' 
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                            }`}
                                          >
                                            Inspect Log
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {attendanceReports.length === 0 && (
                                    <tr>
                                      <td colSpan={4} className="text-center py-8 text-slate-400">
                                        No Level 1 or Level 2 field officials registered on the system.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Log Inspector details panel */}
                        <div className="lg:col-span-5 text-left">
                          {selectedReportUser ? (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-5 shadow-xs">
                              <div className="flex items-start justify-between border-b border-slate-200/60 pb-3">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={selectedReportUser.avatar} 
                                    alt={selectedReportUser.name} 
                                    className="w-11 h-11 rounded-xl object-cover border-2 border-blue-100" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <h6 className="font-bold text-slate-950 text-sm leading-tight">{selectedReportUser.name}</h6>
                                    <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wide">
                                      {selectedReportUser.accessLevel === 'level_2' ? 'Level 2 • Zonal Officer' : 'Level 1 • Field Inspector'}
                                    </p>
                                  </div>
                                </div>
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono font-black text-[9px] border border-blue-100 shrink-0 self-start">
                                  {selectedReportUser.totalLogsCount} Sessions
                                </span>
                              </div>

                              <div className="space-y-3">
                                <h6 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Live Duty Activity Log
                                </h6>
                                {selectedReportUser.logs.length === 0 ? (
                                  <div className="text-center p-8 bg-white border border-slate-100 rounded-xl text-slate-400 text-xs">
                                    No logged attendance/patrol activity records in memory cache.
                                  </div>
                                ) : (
                                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                                    {[...selectedReportUser.logs].reverse().map((log: any, idx: number) => (
                                      <div key={idx} className="bg-white border border-slate-150 hover:border-slate-300 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-3xs transition-all duration-150">
                                        <div className="flex items-start space-x-2.5">
                                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                            log.type === 'manual_checkin' 
                                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                                          }`}>
                                            {log.type === 'manual_checkin' ? <MapPin className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                          </div>
                                          <div className="text-left space-y-1">
                                            <p className="font-bold text-slate-800 text-xs">
                                              {log.type === 'manual_checkin' ? 'Patrol Check-In (Verified)' : 'App Engagement Session'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 leading-normal">
                                              Zone/Station: <strong className="font-semibold text-slate-700">{log.location}</strong>
                                            </p>
                                            {log.latitude && log.longitude && (
                                              <p className="text-[9px] text-emerald-600 font-mono font-bold leading-none bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100/30 inline-block">
                                                📍 Coordinates: {log.latitude.toFixed(5)}°N, {log.longitude.toFixed(5)}°E
                                              </p>
                                            )}

                                            {/* Admin: check-in / check-out status and duration details */}
                                            {log.type === 'manual_checkin' && (
                                              <div className="mt-1 flex flex-wrap gap-1.5 text-[9px] items-center">
                                                <span className={`px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                                                  log.status === 'active' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                }`}>
                                                  {log.status === 'active' ? '● Active Patrol' : '✓ Completed'}
                                                </span>
                                                {log.checkInTime && (
                                                  <span className="text-slate-500">
                                                    In: <strong>{new Date(log.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                                                  </span>
                                                )}
                                                {log.checkOutTime && (
                                                  <span className="text-slate-500">
                                                    Out: <strong>{new Date(log.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                                                  </span>
                                                )}
                                              </div>
                                            )}

                                            {/* Admin: Patrol Summary Report */}
                                            {log.patrolSummary && (
                                              <div className="mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-150 text-[10px] text-slate-600 italic">
                                                <strong className="text-slate-700 font-bold block not-italic text-[9px] uppercase tracking-wider text-emerald-700 mb-0.5">Submitted Shift Summary:</strong>
                                                "{log.patrolSummary}"
                                              </div>
                                            )}

                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                                Page: {log.pageOpened || 'Direct Dashboard'}
                                              </span>
                                              {(log.type !== 'manual_checkin' || log.status === 'completed') && (
                                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                                  Duration: {log.durationMinutes || 5} mins
                                                </span>
                                              )}
                                            </div>

                                            {/* Visited Modules */}
                                            {log.pagesVisited && log.pagesVisited.length > 0 && (
                                              <div className="mt-2 pt-2 border-t border-dashed border-slate-150">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                  Visited modules
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                  {log.pagesVisited.map((p: string, pIdx: number) => (
                                                    <span key={pIdx} className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded-md text-[8px] font-semibold border border-slate-150">
                                                      {p}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}

                                            {/* Updates done during session */}
                                            {log.updatesPerformed && log.updatesPerformed.length > 0 && (
                                              <div className="mt-2 pt-2 border-t border-dashed border-slate-150">
                                                <p className="text-[8px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                                                  Actions Authorized
                                                </p>
                                                <ul className="space-y-1">
                                                  {log.updatesPerformed.map((u: string, uIdx: number) => (
                                                    <li key={uIdx} className="text-[8px] text-blue-700 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100/30 flex items-center gap-1 font-medium">
                                                      <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                                                      <span>{u}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="text-right shrink-0">
                                          <p className="text-[9px] font-bold text-slate-800">
                                            {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                          </p>
                                          <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                                            {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3 border-dashed">
                              <div className="p-3 bg-white rounded-full border border-slate-200">
                                <User className="w-6 h-6 text-slate-300" />
                              </div>
                              <p className="font-bold text-slate-600">No Officer Selected</p>
                              <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                                Select a registered field inspector or departmental official from the directory list on the left to review their timeline tracking, app engagement history, and geolocated patrols.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional GMC Security Guidance Block */}
                <div className="bg-blue-50/60 border border-blue-100/80 rounded-2xl p-4 md:p-5 flex items-start space-x-3.5 text-xs text-slate-700 text-left">
                  <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold text-blue-900 font-sans text-sm">Gwalior Municipal Corporation Clearance Protocols</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed text-[11px]">
                      <li>
                        <strong>Level 1 (Field Inspector):</strong> Assigned to ground workers. Empowered to record site status checklists, attach localized images, and provide dispatch comments.
                      </li>
                      <li>
                        <strong>Level 2 (Department Head):</strong> Assigned to municipal division managers. Empowered to distribute tasks to inspectors and authorize status progression (e.g. In Progress, Resolved).
                      </li>
                      <li>
                        <strong>Level 3 (Municipal Commissioner):</strong> High executive clearance. Ultimate oversight on system-wide verifications, user privilege assignments, and absolute audit metrics.
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* User Profile Editing Modal */}
            {isProfileEditModalOpen && currentUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 flex flex-col max-h-[90vh] overflow-y-auto text-left"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Edit Profile Details</h3>
                        <p className="text-[10px] text-slate-400">Update your steward credentials in Gwalior Civic Registry</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsProfileEditModalOpen(false)}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    await handleSaveProfileSettings(e);
                    setIsProfileEditModalOpen(false);
                  }} className="space-y-4">
                    
                    {/* Photo Edit */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">Steward Profile Photo</label>
                      <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <img 
                          src={profileEditAvatar || currentUser.avatar} 
                          alt="Avatar preview" 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
                        />
                        <div className="flex-1 space-y-2 text-left">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={profileEditAvatar}
                              onChange={(e) => setProfileEditAvatar(e.target.value)}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-700 cursor-pointer font-bold flex-1 min-h-[44px]"
                            >
                              <option value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80">Male Portrait (Priyansh)</option>
                              <option value="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80">Female Portrait (Ananya)</option>
                              <option value="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80">Male Portrait (Kabir)</option>
                              <option value="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80">Silhouette Placeholder</option>
                              {profileEditAvatar && !profileEditAvatar.startsWith('https://images.unsplash.com') && (
                                <option value={profileEditAvatar}>Custom Uploaded Photo</option>
                              )}
                            </select>
                            
                            <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 hover:border-blue-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1 shrink-0 min-h-[44px]">
                              <Upload className="w-4 h-4" />
                              <span>Upload</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        setProfileEditAvatar(reader.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">Steward Display Name</label>
                      <input 
                        type="text"
                        value={profileEditName}
                        onChange={(e) => setProfileEditName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 min-h-[44px]"
                        placeholder="Display name"
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">Email ID (Mail)</label>
                      <input 
                        type="email"
                        value={profileEditEmail}
                        onChange={(e) => setProfileEditEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 min-h-[44px]"
                        placeholder="Email address"
                        required
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">Registered Mobile Number</label>
                      <input 
                        type="text"
                        value={profileEditPhone}
                        onChange={(e) => setProfileEditPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800 min-h-[44px]"
                        placeholder="+91 94251 12345"
                        required
                      />
                    </div>

                    {/* Primary Zone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">Primary Zone of Responsibility</label>
                      <select 
                        value={profileEditWard}
                        onChange={(e) => setProfileEditWard(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700 min-h-[44px]"
                      >
                        <option value="Lashkar Zone (Maharaj Bada)">Lashkar Zone (Maharaj Bada)</option>
                        <option value="Morar Zone (Thatipur)">Morar Zone (Thatipur)</option>
                        <option value="City Center Gwalior">City Center Gwalior</option>
                        <option value="Fort & Old Town Area">Fort & Old Town Area</option>
                        <option value="DD Nagar & Pinto Park">DD Nagar & Pinto Park</option>
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsProfileEditModalOpen(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl transition cursor-pointer min-h-[40px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer min-h-[40px]"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
          
          {/* Spacer to make sure mobile content can scroll above the floating bottom nav */}
          <div className="h-28 md:hidden shrink-0 pointer-events-none" />
        </section>

      </main>

      {/* Embedded Floating AI Pipeline Processing Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 text-slate-100 max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6 flex flex-col justify-between"
            >
              {/* Spinner & Brand */}
              <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md relative shrink-0">
                  <Sparkles className="w-6 h-6 animate-spin text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">AI Intake Pipeline active</h3>
                  <p className="text-xs text-slate-400 font-medium font-mono">My Gwalior AI Multi-Agent Pipeline</p>
                </div>
              </div>

              {/* trace logs */}
              <div className="space-y-4 font-mono text-xs">
                {aiTraceLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="pt-0.5">
                      {log.status === 'done' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : log.status === 'active' ? (
                        <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0 block" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 shrink-0 block" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`font-bold ${log.status === 'active' ? 'text-blue-400 animate-pulse' : log.status === 'done' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {log.step}
                      </p>
                      {log.status === 'active' && (
                        <p className="text-[10px] text-slate-400">{log.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed font-mono">
                Running vision classification, matching coordinates for duplicate merging, calculating hazard score, drafting dispatch.
              </div>
            </motion.div>
          </motion.div>
        )}

        {lightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-55 flex flex-col justify-between overflow-hidden"
          >
            {/* Lightbox Header Controls */}
            <div className="bg-gradient-to-b from-slate-950 to-transparent p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shrink-0">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                  <Maximize2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold bg-blue-950/50 px-2 py-0.5 rounded-sm border border-blue-800/30">
                      Inspection HUD
                    </span>
                    {lightboxMedia.issue && (
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[lightboxMedia.issue.status].bg} ${STATUS_CONFIG[lightboxMedia.issue.status].text}`}>
                        {STATUS_CONFIG[lightboxMedia.issue.status].label}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white text-base md:text-lg font-bold tracking-tight mt-1 line-clamp-1">
                    {lightboxMedia.title}
                  </h3>
                </div>
              </div>

              {/* Utility / Control Bar */}
              <div className="flex items-center space-x-2.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md self-end md:self-auto">
                {/* Scale HUD */}
                <span className="text-[10px] font-mono text-slate-400 px-2.5 font-bold">
                  {Math.round(lightboxScale * 100)}%
                </span>
                
                {/* Zoom In */}
                <button
                  onClick={() => setLightboxScale(prev => Math.min(prev + 0.25, 4))}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  title="Zoom In (Key: +)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Zoom Out */}
                <button
                  onClick={() => setLightboxScale(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  title="Zoom Out (Key: -)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Rotate */}
                <button
                  onClick={() => setLightboxRotation(prev => (prev + 90) % 360)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  title="Rotate 90°"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Reset */}
                <button
                  onClick={() => {
                    setLightboxScale(1);
                    setLightboxRotation(0);
                  }}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  title="Reset (Key: R)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-slate-800 mx-1" />

                {/* Close */}
                <button
                  onClick={() => setLightboxMedia(null)}
                  className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition"
                  title="Close Lightbox (Key: Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Media Canvas */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing p-4">
              <motion.div
                style={{ scale: lightboxScale, rotate: lightboxRotation }}
                drag={lightboxScale > 1}
                dragElastic={0.1}
                dragConstraints={{ 
                  left: -400 * (lightboxScale - 1), 
                  right: 400 * (lightboxScale - 1), 
                  top: -300 * (lightboxScale - 1), 
                  bottom: 300 * (lightboxScale - 1) 
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="max-w-full max-h-[60vh] md:max-h-[70vh] flex items-center justify-center select-none z-0"
              >
                {lightboxMedia.isVideo ? (
                  <video
                    src={lightboxMedia.url}
                    className="rounded-2xl shadow-2xl max-w-full max-h-[60vh] md:max-h-[70vh] object-contain pointer-events-auto border border-slate-800/50"
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={lightboxMedia.url}
                    alt={lightboxMedia.title}
                    className="rounded-2xl shadow-2xl max-w-full max-h-[60vh] md:max-h-[70vh] object-contain pointer-events-none border border-slate-800/50 animate-none"
                    draggable="false"
                    referrerPolicy="no-referrer"
                  />
                )}
              </motion.div>

              {/* Dynamic Pan Prompt */}
              {lightboxScale > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-300 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border border-slate-800 shadow-md backdrop-blur-xs flex items-center space-x-1.5 animate-bounce">
                  <span>Pan Active</span>
                  <span>•</span>
                  <span>Drag to explore details</span>
                </div>
              )}
            </div>

            {/* Lightbox Bottom Info Panel */}
            {lightboxMedia.issue && (
              <div className="bg-gradient-to-t from-slate-950 to-transparent p-4 md:p-6 z-10 shrink-0">
                <div className="max-w-3xl mx-auto bg-slate-900/95 border border-slate-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-slate-800 text-slate-300 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded">
                        Ward: {lightboxMedia.issue.ward}
                      </span>
                      <span className="bg-red-900/40 text-red-400 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded border border-red-800/30">
                        Priority Index: {lightboxMedia.issue.priorityScore}
                      </span>
                      <span className="text-slate-500 text-xs">
                        Reported on {new Date(lightboxMedia.issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                      {lightboxMedia.issue.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 border-t border-slate-800 md:border-t-0 pt-3 md:pt-0">
                    <img
                      src={lightboxMedia.issue.reporterAvatar}
                      alt={lightboxMedia.issue.reporterName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div className="text-left">
                      <p className="text-slate-400 text-[10px] uppercase font-mono">Reporter</p>
                      <p className="text-slate-200 text-xs font-bold">{lightboxMedia.issue.reporterName}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications Panel */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => {
            const statusConfig = STATUS_CONFIG[toast.newStatus as IssueStatus];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex gap-3 text-white overflow-hidden relative"
              >
                {/* Visual accent left border */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  toast.newStatus === 'resolved' ? 'bg-emerald-500' :
                  toast.newStatus === 'in_progress' ? 'bg-indigo-500' :
                  toast.newStatus === 'acknowledged' ? 'bg-amber-500' :
                  toast.newStatus === 'verified' ? 'bg-purple-500' : 'bg-blue-500'
                }`} />
                
                {/* Status Indicator Icon */}
                <div className="shrink-0 flex items-start mt-0.5">
                  <div className={`p-1.5 rounded-lg ${
                    toast.newStatus === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    toast.newStatus === 'in_progress' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                    toast.newStatus === 'acknowledged' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    toast.newStatus === 'verified' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Issue Status Update
                    </span>
                    <button 
                      onClick={() => removeToast(toast.id)}
                      className="text-slate-400 hover:text-white transition duration-150 p-1 rounded-lg hover:bg-white/10 shrink-0 ml-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-100 truncate mt-1">
                    {toast.issueTitle}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                  
                  {/* Status chip inside the toast */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {toast.oldStatus && (
                      <>
                        <span className="text-[9px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-white/5 line-through">
                          {STATUS_CONFIG[toast.oldStatus as IssueStatus]?.label || toast.oldStatus}
                        </span>
                        <span className="text-slate-500 text-[10px]">→</span>
                      </>
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      toast.newStatus === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      toast.newStatus === 'in_progress' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      toast.newStatus === 'acknowledged' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      toast.newStatus === 'verified' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {statusConfig?.label || toast.newStatus}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Nav (Mobile Viewports only) - Floating Glassmorphic Modern Bar */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-40">
        <footer id="mobile-nav" className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl py-2.5 px-3 shadow-2xl flex justify-around items-center">
          <button 
            onClick={() => { setActiveTab('feed'); setSelectedIssue(null); }}
            className={`flex flex-col items-center space-y-1 text-[9px] font-extrabold transition-all duration-200 ${activeTab === 'feed' ? 'text-orange-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span>Feed</span>
          </button>

          <button 
            onClick={() => { setActiveTab('map'); setSelectedIssue(null); }}
            className={`flex flex-col items-center space-y-1 text-[9px] font-extrabold transition-all duration-200 ${activeTab === 'map' ? 'text-orange-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Map className={`w-5 h-5 ${activeTab === 'map' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span>Map</span>
          </button>

          <button 
            onClick={() => { setActiveTab('report'); setSelectedIssue(null); }}
            className={`flex flex-col items-center space-y-1 text-[9px] font-extrabold transition-all duration-200 ${activeTab === 'report' ? 'text-orange-400 scale-110' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <div className="p-2 bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-900 rounded-full shadow-lg -translate-y-2 border-3 border-slate-900">
              <PlusCircle className="w-5 h-5 stroke-[3px]" />
            </div>
            <span className="-mt-1">Report</span>
          </button>

          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedIssue(null); }}
            className={`flex flex-col items-center space-y-1 text-[9px] font-extrabold transition-all duration-200 ${activeTab === 'dashboard' ? 'text-orange-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <TrendingUp className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span>Stats</span>
          </button>

          <button 
            onClick={() => { setActiveTab((currentUser?.role === 'admin' || (currentUser?.role === 'authority' && currentUser?.accessLevel === 'level_3')) ? 'admin_panel' : 'profile'); setSelectedIssue(null); }}
            className={`flex flex-col items-center space-y-1 text-[9px] font-extrabold transition-all duration-200 ${(activeTab === 'profile' || activeTab === 'admin_panel') ? 'text-orange-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {(currentUser?.role === 'admin' || (currentUser?.role === 'authority' && currentUser?.accessLevel === 'level_3')) ? (
              <>
                <Shield className={`w-5 h-5 ${activeTab === 'admin_panel' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span>Admin</span>
              </>
            ) : (
              <>
                <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span>Profile</span>
              </>
            )}
          </button>
        </footer>
      </div>

        </>
      )}
    </div>
    );
  };

  if (isEmbedded) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-x-hidden">
        {renderAppContent()}
      </div>
    );
  }

  return (
    <div id="civic-pulse-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden md:overflow-hidden select-none">
      
      {/* 1. Desktop Layout (Android Simulator and Side Dashboard Controls) */}
      <div className="hidden md:flex flex-1 w-full h-screen bg-slate-950 text-slate-100 items-stretch overflow-hidden relative">
        {/* Animated ambient cosmic gradients */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_40%)] pointer-events-none"></div>

        {/* Dynamic Bezel Sidebar Control Panel */}
        <div className="w-[380px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
          <div className="space-y-6 text-left">
            {/* Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-850">
              <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-2 rounded-xl shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-none font-display">My Gwalior</h1>
                <p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest mt-1">Civic Android Hub</p>
              </div>
            </div>

            {/* PWA Section */}
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">Progressive Web App (PWA)</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This app is pre-configured with active Service Workers &amp; Web Manifest. Install now to run as a standalone application on your mobile device.
              </p>
              <button
                onClick={() => {
                  setSimNotification("Success: My Gwalior PWA has been downloaded and installed on your simulated device screen!");
                  setShowSimNotification(true);
                  alert("PWA Installation Triggered!\n\nThis simulator has registered the active Service Worker cache ('my-gwalior-civic-cache-v1'). On actual mobile phones or chrome desktops, the PWA 'Install App' prompt will appear on your browser bar!");
                }}
                className="w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] py-2.5 px-4 rounded-xl shadow-md cursor-pointer hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Simulate App Installation</span>
              </button>
            </div>

            {/* Interactive Settings Dashboard */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Device Emulator Settings</h3>
              
              {/* Bezel Color Customizer */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 flex justify-between">
                  <span>Physical Bezel Finish</span>
                  <span className="font-extrabold text-white capitalize">{simBezelColor}</span>
                </label>
                <div className="flex items-center space-x-2.5 bg-slate-950/30 p-2 rounded-xl border border-slate-850">
                  {(['black', 'slate', 'indigo', 'emerald', 'gold'] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSimBezelColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                        color === 'black' ? 'bg-black border-zinc-700' :
                        color === 'slate' ? 'bg-slate-600 border-slate-500' :
                        color === 'indigo' ? 'bg-indigo-600 border-indigo-500' :
                        color === 'emerald' ? 'bg-emerald-600 border-emerald-500' :
                        'bg-yellow-500 border-yellow-400'
                      } ${simBezelColor === color ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'}`}
                      title={`${color} Bezel`}
                    />
                  ))}
                </div>
              </div>

              {/* Simulated Battery Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Simulate Battery Level</span>
                  <span className={`font-black ${simBattery <= 15 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
                    {simBattery}%
                  </span>
                </div>
                <div className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-850 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-mono">5%</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={simBattery}
                    onChange={(e) => setSimBattery(Number(e.target.value))}
                    className="flex-1 accent-orange-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">100%</span>
                </div>
              </div>

              {/* Dynamic Network Emulator */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400">Emulate Network State</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950/30 p-1 rounded-xl border border-slate-850">
                  {(['5g', 'wifi', 'offline'] as const).map((net) => (
                    <button
                      key={net}
                      onClick={() => {
                        setSimNetwork(net);
                        if (net === 'offline') {
                          setSimNotification("System: Device has entered offline mode. Offline service worker caching demonstration active.");
                          setShowSimNotification(true);
                        } else {
                          setSimNotification(`System: Connected to ${net.toUpperCase()} network.`);
                          setShowSimNotification(true);
                        }
                      }}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                        simNetwork === net
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* GPS Neighborhood Emulator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>GPS Location Emulator</span>
                  <span className="text-[9px] font-black text-orange-400 truncate max-w-[180px]">{simLocationName}</span>
                </div>
                <div className="space-y-1.5 bg-slate-950/30 p-2 rounded-xl border border-slate-850">
                  {[
                    { name: 'Maharaj Bada (Town Hall)', lat: 26.2045, lng: 78.1610 },
                    { name: 'Gwalior Fort (Historic)', lat: 26.2307, lng: 78.1691 },
                    { name: 'City Centre (Corporate)', lat: 26.2163, lng: 78.1874 },
                    { name: 'Thatipur (Residential)', lat: 26.2120, lng: 78.2040 }
                  ].map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        setSimLocationName(loc.name);
                        setReportLat(loc.lat);
                        setReportLng(loc.lng);
                        setSimNotification(`GPS Updated: Coordinates set to ${loc.name} (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
                        setShowSimNotification(true);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer flex justify-between items-center ${
                        simLocationName === loc.name ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/30 border border-transparent'
                      }`}
                    >
                      <span>📍 {loc.name}</span>
                      <span className="text-[8px] font-mono opacity-60">
                        {loc.lat.toFixed(2)}°N
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger Simulated Notification */}
              <button
                onClick={() => {
                  const messages = [
                    "Nagar Nigam: Road complaint at Thatipur is in-progress.",
                    "Swachhata GMC: Garbage dump Maharaj Bada successfully cleared!",
                    "Water Dept: High-pressure leak at Lashkar is under maintenance.",
                    "Emergency Notice: High rain alerts issued for low-lying wards."
                  ];
                  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                  setSimNotification(randomMsg);
                  setShowSimNotification(true);
                }}
                className="w-full bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 text-[10px] font-extrabold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>🔔 Simulate GMC Admin Alert</span>
              </button>
            </div>
          </div>

          {/* Footer of Sidebar */}
          <div className="pt-4 border-t border-slate-850 text-left">
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-500">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>GMC Digital Sandbox v2.8</span>
            </div>
            <p className="text-[9px] text-slate-600 mt-1">Simulating native Android core runtime context and PWA capabilities.</p>
          </div>
        </div>

        {/* Center: Simulated Android Phone Device Layout */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 relative overflow-hidden bg-slate-950">
          
          {/* Subtle concentric decorative scanner lines */}
          <div className="absolute w-[800px] h-[800px] rounded-full border border-slate-800/20 pointer-events-none"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-slate-800/30 pointer-events-none"></div>

          {/* Side Physical Buttons (Power & Volume) */}
          <div className="relative">
            
            {/* Volume Up */}
            <button 
              onClick={() => {
                setSimVolume(v => Math.min(100, v + 10));
                setShowVolumeHud(true);
                setTimeout(() => setShowVolumeHud(false), 2000);
              }}
              className="absolute right-[-16px] top-[140px] w-1.5 h-10 bg-slate-800 rounded-r-md border-r border-slate-700 shadow-sm hover:brightness-110 cursor-pointer"
              title="Volume Up"
            />
            {/* Volume Down */}
            <button 
              onClick={() => {
                setSimVolume(v => Math.max(0, v - 10));
                setShowVolumeHud(true);
                setTimeout(() => setShowVolumeHud(false), 2000);
              }}
              className="absolute right-[-16px] top-[195px] w-1.5 h-10 bg-slate-800 rounded-r-md border-r border-slate-700 shadow-sm hover:brightness-110 cursor-pointer"
              title="Volume Down"
            />
            {/* Power Button */}
            <button 
              onClick={() => setSimIsLocked(l => !l)}
              className="absolute right-[-16px] top-[270px] w-1.5 h-12 bg-slate-800 rounded-r-md border-r border-slate-700 shadow-sm hover:brightness-110 cursor-pointer"
              title="Toggle Power/Sleep"
            />

            {/* The Physical Bezel Frame */}
            <div 
              className={`w-[395px] h-[815px] rounded-[52px] p-3 flex flex-col relative transition-all duration-300 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[10px] ${
                simBezelColor === 'black' ? 'bg-zinc-950 border-zinc-900 ring-4 ring-zinc-850' :
                simBezelColor === 'slate' ? 'bg-slate-900 border-slate-800 ring-4 ring-slate-750' :
                simBezelColor === 'indigo' ? 'bg-indigo-950 border-indigo-900 ring-4 ring-indigo-850' :
                simBezelColor === 'emerald' ? 'bg-emerald-950 border-emerald-900 ring-4 ring-emerald-850' :
                'bg-amber-950 border-amber-900 ring-4 ring-amber-850'
              }`}
            >
              {/* Phone Speaker & Punch Hole Camera (Notch Area) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-950 rounded-b-2xl z-50 flex items-center justify-center gap-2">
                <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center">
                  <div className="w-1 h-1 bg-blue-900 rounded-full"></div>
                </div>
              </div>

              {/* Simulated Screen Viewport Area */}
              <div className="flex-1 rounded-[42px] overflow-hidden bg-slate-50 text-slate-800 flex flex-col relative shadow-inner">
                
                {/* 1. Real-time Android Status Bar Overlay */}
                <div className="h-6.5 bg-slate-950 text-white text-[10px] font-black px-5 flex items-center justify-between shrink-0 select-none z-50 relative">
                  <div>{simTime}</div>
                  <div className="flex items-center space-x-1.5">
                    {/* Simulated Network Icons */}
                    {simNetwork === '5g' && <span className="font-sans text-[8px] tracking-tighter bg-blue-600/20 text-blue-400 px-1 py-0.2 rounded font-black">5G</span>}
                    {simNetwork === 'wifi' && <span className="font-sans text-[8px] tracking-tighter bg-emerald-600/20 text-emerald-400 px-1 py-0.2 rounded font-black">WI-FI</span>}
                    {simNetwork === 'offline' && <span className="font-sans text-[8px] tracking-tighter bg-red-600/20 text-red-400 px-1 py-0.2 rounded font-black">OFFLINE</span>}
                    
                    {/* Signal bars */}
                    <div className="flex items-end space-x-0.5 h-2.5">
                      <div className="w-0.5 h-1 bg-white opacity-80"></div>
                      <div className="w-0.5 h-1.5 bg-white opacity-80"></div>
                      <div className={`w-0.5 h-2 ${simNetwork !== 'offline' ? 'bg-white' : 'bg-white/30'}`}></div>
                      <div className={`w-0.5 h-2.5 ${simNetwork !== 'offline' ? 'bg-white' : 'bg-white/30'}`}></div>
                    </div>

                    {/* Battery Icon */}
                    <div className="flex items-center space-x-0.5">
                      <span className="text-[8px] text-slate-300 font-mono">{simBattery}%</span>
                      <div className="w-5.5 h-2.8 border border-white/50 rounded-xs p-0.5 flex items-stretch">
                        <div 
                          className={`rounded-3xs ${
                            simBattery <= 15 ? 'bg-red-500 animate-pulse' :
                            simBattery <= 35 ? 'bg-orange-500' : 'bg-green-400'
                          }`}
                          style={{ width: `${simBattery}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Volume HUD Pop-up */}
                {showVolumeHud && (
                  <div className="absolute right-3 top-10 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl z-50 flex flex-col items-center space-y-2 w-10 text-white animate-fade-in">
                    <span className="text-[8px] font-black uppercase text-slate-400">Vol</span>
                    <div className="h-20 w-1.5 bg-slate-800 rounded-full relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-full" style={{ height: `${simVolume}%` }}></div>
                    </div>
                    <span className="text-[8px] font-mono">{simVolume}%</span>
                  </div>
                )}

                {/* 3. Drop-down Android Notification Hub overlay */}
                {simNotification && showSimNotification && (
                  <div className="absolute top-8 left-3 right-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-xl z-50 text-white flex items-start space-x-3 text-left">
                    <div className="p-2 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-xl shrink-0">
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-orange-400 uppercase tracking-wider">Simulated Notification</span>
                        <span className="text-[8px] text-slate-500">just now</span>
                      </div>
                      <p className="text-[10px] text-slate-200 mt-1 font-semibold leading-relaxed">{simNotification}</p>
                    </div>
                    <button 
                      onClick={() => setShowSimNotification(false)}
                      className="text-slate-500 hover:text-white font-black cursor-pointer text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* 4. Sleek Simulated Power Screen Lock Mode */}
                {simIsLocked ? (
                  <div className="absolute inset-0 bg-slate-950 z-[999] flex flex-col justify-center items-center text-white p-6 space-y-4 animate-fade-in select-none">
                    <div className="text-center space-y-1">
                      <p className="text-4xl font-extrabold tracking-tight">{simTime.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 w-full max-w-[280px] text-center space-y-3">
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Swipe or click below to wake screen and interact with My Gwalior.</p>
                      <button 
                        onClick={() => setSimIsLocked(false)}
                        className="mx-auto px-4 py-2 bg-gradient-to-tr from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                      >
                        🔓 Unlock Device
                      </button>
                    </div>

                    <div className="pt-8 text-[9px] text-slate-600 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-slate-700" />
                      <span>Security clearance bypass enabled</span>
                    </div>
                  </div>
                ) : null}

                {/* 5. Actual Application Rendering Frame */}
                <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
                  <iframe
                    id="simulator-iframe"
                    src="/?embed=true"
                    className="w-full h-full border-none"
                    title="My Gwalior Simulator Frame"
                  />
                </div>

                {/* 6. Virtual Android Bottom Gesture navigation pill */}
                <div className="h-5 bg-slate-950 flex items-center justify-center shrink-0 select-none z-50">
                  <div className="w-24 h-1 bg-white/45 rounded-full hover:bg-white/80 cursor-pointer transition-all" onClick={() => { setActiveTab('feed'); setSelectedIssue(null); }} title="Go to Issues Feed" />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mobile Layout (Native full-screen on smartphones under md:) */}
      <div className="md:hidden flex flex-col min-h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-x-hidden">
        {renderAppContent()}
      </div>

    </div>
  );
}

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
  List
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
  Radar
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

// Map center bound mappings for Gwalior, Madhya Pradesh, India
const MAP_BOUNDS = {
  latMin: 26.1900,
  latMax: 26.2500,
  lngMin: 78.1400,
  lngMax: 78.2400
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
  const [loginTab, setLoginTab] = useState<'credentials' | 'demo' | 'register'>('credentials');
  const [authorityAccessLevel, setAuthorityAccessLevel] = useState<'level_1' | 'level_2' | 'level_3'>('level_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [mobileCols, setMobileCols] = useState<1 | 2>(1);
  const [desktopCols, setDesktopCols] = useState<2 | 3>(2);
  const [mobileChartTab, setMobileChartTab] = useState<'trends' | 'sla' | 'severity'>('trends');
  
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
  const [profileSubTab, setProfileSubTab] = useState<string>('achievements');
  const [redeemedRewards, setRedeemedRewards] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('civicpulse_redeemed_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [profileEditName, setProfileEditName] = useState<string>('');
  const [profileEditPhone, setProfileEditPhone] = useState<string>('+91 94251 12345');
  const [profileEditWard, setProfileEditWard] = useState<string>('Lashkar Zone (Maharaj Bada)');
  const [profileNotificationSMS, setProfileNotificationSMS] = useState<boolean>(true);
  const [profileNotificationWhatsApp, setProfileNotificationWhatsApp] = useState<boolean>(true);
  const [profileNotificationEmail, setProfileNotificationEmail] = useState<boolean>(true);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  
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
  const [mapMode, setMapMode] = useState<'svg' | 'google'>('svg');
  const [reportMapMode, setReportMapMode] = useState<'svg' | 'google'>('svg');
  const [geolocationStatus, setGeolocationStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

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
    }
  }, [currentUser]);

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
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
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

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const updatedProfile = {
      ...currentUser,
      name: profileEditName || currentUser.name
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

  const handleLogin = (user: UserProfile) => {
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
      resolvedCount: 0
    };

    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
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
      // Refresh list
      fetchLeaderboard();
      setActiveTab('feed');
      // Reset form
      setLoginName('');
      setLoginEmail('');
      setRegisterPasswordInput('');
    } catch (err) {
      console.error('Error registering:', err);
      alert('Failed to register user profile.');
    }
  };

  const handleAdminVerifyUser = async (targetUid: string, status: 'verified' | 'rejected', level?: 'level_1' | 'level_2' | 'level_3' | 'none') => {
    try {
      const res = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: targetUid,
          verificationStatus: status,
          accessLevel: level || 'none'
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
        alert('Failed to update authority verification state.');
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
          description: adminNote || `Issue transitioned to ${STATUS_CONFIG[adminStatusChange].label} status by city officials.`
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
      console.error('Error opening camera stream:', err);
      setCameraError('Camera access denied or resolution not supported. Please grant permissions and check connection.');
      setIsLiveCameraActive(false);
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

  return (
    <div id="civic-pulse-app" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {!currentUser ? (
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
                <p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider leading-none mt-0.5">Nagar Nigam Portal</p>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Gwalior Municipal Corporation (GMC) • Live Server
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
                    Join Gwalior's smart Nagar Nigam portal where citizens can snap photos of local issues (potholes, water leaks, streetlights, garbage heaps) to automatically route reports to officials using real-time AI and location-aware dispatch pipelines.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center space-x-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/8">
                    <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Citizens</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Report local issues, earn rewards, and secure Swachh steward achievements.</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/5 hover:bg-white/8">
                    <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Municipal Authorities</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Review verified dispatch requests and transition official resolutions.</p>
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
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Profile Photo</label>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={loginAvatar} 
                            alt="Avatar preview" 
                            className="w-10 h-10 rounded-xl object-cover border border-white/15"
                          />
                          <select
                            value={loginAvatar}
                            onChange={(e) => setLoginAvatar(e.target.value)}
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-white cursor-pointer font-bold"
                          >
                            <option value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80">Male Portrait (Priyansh)</option>
                            <option value="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80">Female Portrait (Ananya)</option>
                            <option value="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80">Male Portrait (Kabir)</option>
                            <option value="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80">Silhouette Placeholder</option>
                          </select>
                        </div>
                      </div>
                    </div>

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
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider leading-none mt-0.5">Nagar Nigam Portal</p>
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

            {currentUser?.role === 'admin' && (
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
            {/* Elegant status indicator telling the user exactly who is using the app */}
            <div className={`${currentUser.role === 'citizen' ? 'hidden sm:flex' : 'flex'} items-center space-x-1.5 bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200`} title={currentUser.role === 'admin' ? 'Admin Console' : currentUser.role === 'authority' ? (currentUser.verificationStatus === 'verified' ? `Authority (L${currentUser.accessLevel === 'level_3' ? '3' : currentUser.accessLevel === 'level_2' ? '2' : '1'})` : 'Auth (Pending)') : 'Citizen Mode'}>
              <span className={`w-2 h-2 rounded-full ${
                currentUser.role === 'admin' ? 'bg-purple-500 animate-pulse' : currentUser.role === 'authority' ? (currentUser.verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse') : 'bg-blue-500'
              }`} />
              <span className="text-[11px] font-bold text-slate-600 font-mono">
                <span className="sm:hidden">
                  {currentUser.role === 'admin' ? '⚙️' : currentUser.role === 'authority' ? (currentUser.verificationStatus === 'verified' ? '🛡️' : '⏳') : '👤'}
                </span>
                <span className="hidden sm:inline">
                  {currentUser.role === 'admin' ? '⚙️ Admin Console' : currentUser.role === 'authority' ? (currentUser.verificationStatus === 'verified' ? `🛡️ Authority (${currentUser.accessLevel === 'level_3' ? 'L3' : currentUser.accessLevel === 'level_2' ? 'L2' : 'L1'})` : '⏳ Auth (Pending)') : '👤 Citizen Mode'}
                </span>
              </span>
            </div>

            {/* If authority, allow toggling the admin panel visibility */}
            {currentUser.role === 'authority' && currentUser.verificationStatus === 'verified' && (
              <button
                onClick={() => {
                  setShowAdminPanel(!showAdminPanel);
                  setUserRole(showAdminPanel ? 'citizen' : 'authority');
                }}
                className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                  showAdminPanel ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={showAdminPanel ? 'Exit Officer View' : 'Enter Officer View'}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showAdminPanel ? 'Exit Officer View' : 'Enter Officer View'}</span>
              </button>
            )}
          </div>

          {/* User Profile Mini Badge & Sign Out */}
          {currentUser && (
            <div className="flex items-center space-x-2">
              <div 
                id="header-profile" 
                className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 p-1.5 rounded-xl transition duration-150 border border-transparent hover:border-slate-200"
                onClick={() => setActiveTab('profile')}
              >
                <div className={`text-right ${currentUser.role === 'authority' ? 'hidden sm:block' : ''}`}>
                  <h4 className="text-sm font-semibold text-slate-700">{currentUser.name}</h4>
                  <div className="flex items-center justify-end space-x-1.5 text-xs text-amber-600 font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span>{currentUser.points} pts</span>
                  </div>
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
      <main className="flex-1 w-full p-4 md:p-8 flex flex-col gap-6">
        
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
                className="space-y-6"
              >
                {/* Search & Filters block - Box styling removed, elements rendered full size */}
                <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                  <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search reported issues by ward, title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-base shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Filter category selector */}
                  <div className="flex gap-2 w-full md:w-auto shrink-0 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs flex-nowrap shrink-0 min-w-max">
                      <button 
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                      >
                        All
                      </button>
                      {(['water_leakage', 'garbage', 'road_damage', 'pothole', 'streetlight', 'other'] as IssueCategory[]).map((cat) => {
                        const icon = CATEGORIES[cat];
                        return (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer whitespace-nowrap shrink-0 ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
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
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-hidden text-slate-700 shadow-xs cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Subtitle / Match summary & Grid Layout Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl shadow-2xs">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      <span>{filteredIssues.length} matching incidents discovered</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Automated citizen tracking and municipal response portal</p>
                  </div>
                  
                  {/* Grid View Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs w-full sm:w-auto">
                    {/* Mobile toggle controls - visible only on mobile */}
                    <div className="flex items-center space-x-2 md:hidden">
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

                      {/* Endorsement section */}
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-6 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-blue-900 text-sm">Community Endorsements ({selectedIssue.confirmations})</h4>
                          <p className="text-blue-700 text-xs">
                            Is this issue still unresolved? Confirming escalates severity.
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirmIssue(selectedIssue.id)}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition ${selectedIssue.confirmedBy.includes(currentUser?.uid || '') ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'}`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{selectedIssue.confirmedBy.includes(currentUser?.uid || '') ? 'Confirmed' : 'Confirm Presence'}</span>
                        </button>
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
                <form onSubmit={handleReportSubmit} className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 md:p-10 shadow-sm flex flex-col space-y-8">
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
                      <p className="text-xs text-slate-500 mt-1 ml-[15px] mr-[15px] pl-[6px]">Provide local evidence for real-time automated AI cataloging and multi-agent routing.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Grid Column: Details & Multimedia */}
                    <div className="space-y-6">
                      {/* SECTION 1: Core Incident Details */}
                  <div className="bg-slate-50/30 rounded-2xl border border-slate-100/50 pt-5 pl-5 pr-5 pb-0 mb-0 space-y-5 text-left">
                    <div className="flex items-center space-x-2.5 border-b border-slate-150 pb-2 mb-2">
                      <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display">1. Incident Details</h3>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 tracking-wide">Short Descriptive Title</label>
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
                      <p className="text-[10px] text-slate-400">Keep it clear and precise to improve automated department cataloging.</p>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 tracking-wide">Context or Description</label>
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
                          <video 
                            ref={liveVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          
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
                              <span>Take Live Photo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => startLiveCamera('video')}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl py-3 text-xs font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-98"
                            >
                              <Video className="w-4 h-4" />
                              <span>Record Live Video</span>
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
                      {/* SECTION 3: Geotag & Coordinates Calibration */}
                      <div className="bg-slate-50/30 rounded-2xl border border-slate-100/50 pt-[1px] pl-5 pr-5 pb-5 space-y-4 text-left">
                    <div className="flex items-center space-x-2.5 border-b border-slate-150 pb-2 mb-2">
                      <div className="p-1.5 bg-blue-50 rounded-xl text-blue-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display">3. Location & GPS Calibration</h3>
                    </div>

                    {/* Displays coordinates as premium chips instead of flat raw inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">GPS Latitude</span>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="text-xs font-mono font-bold text-slate-800">{reportLat.toFixed(5)}</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">GPS Longitude</span>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                          <span className="text-xs font-mono font-bold text-slate-800">{reportLng.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Geolocation Trigger Button */}
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={handleGeoLocation}
                        className={`w-full flex items-center justify-center space-x-2 border font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition duration-300 cursor-pointer shadow-2xs active:scale-99 ${
                          geolocationStatus.type === 'loading'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                            : geolocationStatus.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : geolocationStatus.type === 'error'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 ${geolocationStatus.type === 'loading' ? 'animate-bounce' : ''}`} />
                        <span>
                          {geolocationStatus.type === 'loading'
                            ? 'Calibrating GPS Satellites...'
                            : geolocationStatus.type === 'success'
                            ? 'GPS Location Acquired!'
                            : geolocationStatus.type === 'error'
                            ? 'GPS Failed - Tap to Retry'
                            : 'Auto-Detect Device GPS Location'}
                        </span>
                      </button>

                      {geolocationStatus.message && (
                        <p className={`text-[10px] text-center font-bold tracking-tight ${
                          geolocationStatus.type === 'success'
                            ? 'text-emerald-600'
                            : geolocationStatus.type === 'error'
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}>
                          {geolocationStatus.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SECTION 4: Digital Twin Pin Placement */}
                  <div className="bg-slate-50/30 rounded-2xl border border-slate-100/50 pl-[5px] pr-[5px] pt-0 pb-[5px] mb-[15px] space-y-4 text-left">
                    {/* Modern Google-style Header */}
                    <div className="flex items-center space-x-2.5 border-b border-slate-150 pb-2 mb-2">
                      <div className="p-1.5 bg-rose-50 rounded-xl text-rose-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-slate-800 text-sm tracking-tight font-display">4. Digital Twin Pin Placement</h3>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed text-left pl-[5px] ml-[5px] mb-[10px]">
                      Click anywhere on the styled map grid below to re-center the incident marker, or snap directly to a known landmark.
                    </p>

                    {/* Gwalior Reference Landmarks Quick Snap Selector */}
                    <div className="mb-5 bg-white border border-slate-200/60 p-4 rounded-2xl text-left shadow-2xs">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                          <Building className="w-4 h-4 text-amber-500" />
                          <span>Gwalior Landmark References:</span>
                        </span>
                        {GWALIOR_LANDMARKS.some(l => Math.abs(reportLat - l.latitude) < 0.001 && Math.abs(reportLng - l.longitude) < 0.001) && (
                          <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Snapped
                          </span>
                        )}
                      </div>
                      
                      {/* Horizontally scrolling pill capsules */}
                      <div className="flex items-center space-x-2.5 overflow-x-auto pb-[5px] w-[300px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
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
                    <div className="flex items-center justify-between mb-3.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
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
                      <span>Dispatch to Multi-Agent AI Pipeline</span>
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
                      
                      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
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

                        {GWALIOR_LANDMARKS.map(landmark => {
                          const isFocused = focusedLandmarkId === landmark.id;
                          
                          // Count issues within ~0.015 coordinates range of this landmark (close proximity)
                          const nearbyCount = issues.filter(iss => 
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
                          const nearby = issues.filter(iss => 
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
                          const nearbyCount = issues.filter(iss => 
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
                            {issues.map(iss => {
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
                            <div className="text-left space-y-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-xs text-slate-800 truncate block">{selectedIssue.title}</span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${selectedIssue.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {selectedIssue.severity}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{selectedIssue.description}</p>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('feed');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-lg shrink-0 transition"
                            >
                              View Details
                            </button>
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

                          {/* Hotspots glows */}
                          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-red-500/10 rounded-full filter blur-3xl pointer-events-none" />
                          <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-orange-500/10 rounded-full filter blur-3xl pointer-events-none" />

                          {/* Gwalior Reference Landmarks pins */}
                          {GWALIOR_LANDMARKS.map(landmark => {
                            const pctX = (landmark.longitude - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
                            const pctY = (MAP_BOUNDS.latMax - landmark.latitude) / (MAP_BOUNDS.latMax - landmark.latitude);

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
                          {issues.map(iss => {
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
            {activeTab === 'dashboard' && stats && (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 pb-20 md:pb-6"
              >
                {/* Advanced Interactive Filters Section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
                      <Filter className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider font-display">Analytics Command Center</h3>
                      <p className="text-[10px] text-slate-400">Interactive filters covering wards & historical periods</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Ward Selector */}
                    <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase shrink-0">Ward:</span>
                      <select
                        value={analyticsWard}
                        onChange={(e) => setAnalyticsWard(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 cursor-pointer w-full sm:w-auto"
                      >
                        <option value="all">All Wards</option>
                        <option value="Lashkar Zone (Maharaj Bada)">Lashkar Zone (Maharaj Bada)</option>
                        <option value="Morar Zone (Thatipur)">Morar Zone (Thatipur)</option>
                        <option value="City Center Gwalior">City Center Gwalior</option>
                        <option value="Fort & Old Town Area">Fort & Old Town Area</option>
                        <option value="DD Nagar & Pinto Park">DD Nagar & Pinto Park</option>
                      </select>
                    </div>

                    {/* Time Selector */}
                    <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase shrink-0">Period:</span>
                      <select
                        value={analyticsTime}
                        onChange={(e) => setAnalyticsTime(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 cursor-pointer w-full sm:w-auto"
                      >
                        <option value="all">All-Time History</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="24hrs">Last 24 Hours</option>
                      </select>
                    </div>

                    {/* Reset Button */}
                    {(analyticsWard !== 'all' || analyticsTime !== 'all') && (
                      <button
                        onClick={() => {
                          setAnalyticsWard('all');
                          setAnalyticsTime('all');
                        }}
                        className="flex items-center justify-center space-x-1 text-slate-500 hover:text-red-500 text-xs font-bold bg-slate-100 hover:bg-red-50 border border-slate-200 rounded-lg px-2.5 py-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Stats Metrics Cards - Dynamically calculated */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Total Tracked Issues */}
                  <div className="bg-white border-y border-r border-l-4 border-slate-200 border-l-blue-500 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider block">Tracked Issues</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{dynamicAnalyticsStats.totalReported}</h3>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span className="truncate max-w-[80px] sm:max-w-none">Active Gwalior log</span>
                      </p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 hidden sm:block shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 2: Resolution Compliance */}
                  <div className="bg-white border-y border-r border-l-4 border-slate-200 border-l-emerald-500 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider block">Compliance</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{dynamicAnalyticsStats.resolutionRate}%</h3>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="truncate max-w-[80px] sm:max-w-none">{dynamicAnalyticsStats.totalResolved} closed</span>
                      </p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100 hidden sm:block shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 3: Average Resolution SLA */}
                  <div className="bg-white border-y border-r border-l-4 border-slate-200 border-l-indigo-500 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider block">Avg SLA Speed</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">{dynamicAnalyticsStats.averageResolutionHours}h</h3>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span className="truncate max-w-[80px] sm:max-w-none">Fast-track route</span>
                      </p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100 hidden sm:block shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 4: Citizen Engagement Index */}
                  <div className="bg-white border-y border-r border-l-4 border-slate-200 border-l-orange-500 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider block">Engagement</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-orange-500 tracking-tight">{dynamicAnalyticsStats.activeCitizens}</h3>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        <span className="truncate max-w-[80px] sm:max-w-none">Co-reviews log</span>
                      </p>
                    </div>
                    <div className="bg-orange-50 text-orange-600 p-2.5 rounded-xl border border-orange-100 hidden sm:block shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Dashboard visualization Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Category bar chart */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between h-[280px] sm:h-[360px] hover:shadow-xs hover:border-slate-300/80 transition duration-200">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Active Hazards Distribution</h4>
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">Dynamic Categories</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Comparing frequency of reported civic issues in selected scope</span>
                    </div>

                    <div className="flex-1 w-full pt-4 min-h-0">
                      {categoryChartData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                          <Info className="w-5 h-5 mb-1 text-slate-300" />
                          No issues recorded in this selection.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryChartData}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.01)' }} />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Ward Performance rankings */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col h-[280px] sm:h-[360px] hover:shadow-xs hover:border-slate-300/80 transition duration-200">
                    <div className="mb-3">
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Ward Efficiency Matrix</h4>
                      <span className="text-[10px] text-slate-400">Compliance and resolution speed rankings across Gwalior zones</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      {stats.wardLeaderboard.map((ward: any) => {
                        // Dynamically scale counts if filters are applied to show visual coordination
                        const isFilteredWard = analyticsWard !== 'all' && ward.wardName !== analyticsWard;
                        const opacityStyle = isFilteredWard ? 'opacity-40 border-dashed bg-slate-50/50' : '';
                        
                        return (
                          <div key={ward.wardName} className={`p-2.5 rounded-xl border border-slate-100 bg-slate-50/25 space-y-1.5 text-xs transition-all duration-200 ${opacityStyle}`}>
                            <div className="flex justify-between items-center text-slate-700">
                              <span className="font-bold flex items-center space-x-1.5">
                                <span className={`w-2 h-2 rounded-full ${isFilteredWard ? 'bg-slate-300' : 'bg-blue-500'}`} />
                                <span className="truncate max-w-[160px]">{ward.wardName}</span>
                              </span>
                              <span className="font-mono text-[9px] text-slate-500">SLA: {ward.avgResolutionDays}d avg</span>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                              <div 
                                className={`h-full bg-gradient-to-r ${isFilteredWard ? 'from-slate-300 to-slate-400' : 'from-blue-500 to-indigo-600'} rounded-full`}
                                style={{ width: `${(ward.resolvedCount / ward.reportedCount) * 100}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>{ward.reportedCount} reported | {ward.resolvedCount} closed</span>
                              <span className={`font-extrabold ${isFilteredWard ? 'text-slate-400' : 'text-slate-600'}`}>
                                {Math.round((ward.resolvedCount / ward.reportedCount) * 100)}% compliance
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Mobile View Navigation Segmented Control for secondary charts */}
                <div className="lg:hidden bg-slate-100 border border-slate-200/80 p-1 rounded-xl flex items-center shadow-3xs">
                  <button
                    onClick={() => setMobileChartTab('trends')}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      mobileChartTab === 'trends' 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Timeline Trends
                  </button>
                  <button
                    onClick={() => setMobileChartTab('sla')}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      mobileChartTab === 'sla' 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    SLA Speeds
                  </button>
                  <button
                    onClick={() => setMobileChartTab('severity')}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      mobileChartTab === 'severity' 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Severity Load
                  </button>
                </div>

                {/* Additional Visualizations Grid: Trend Area Chart & SLA comparison Bar Chart & Severity Composition */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Trend Area Chart */}
                  <div className={`lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between h-[280px] sm:h-[320px] transition-all duration-300 ${mobileChartTab === 'trends' ? 'flex' : 'hidden lg:flex'}`}>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Report & Resolution Trends</h4>
                      <span className="text-[10px] text-slate-400">Timeline view tracking civic reports and closures</span>
                    </div>

                    <div className="flex-1 w-full pt-4 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historicalTrendData}>
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <Tooltip />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                          <Area type="monotone" dataKey="Reported" stroke="#3B82F6" fillOpacity={0.1} fill="#3B82F6" strokeWidth={2} />
                          <Area type="monotone" dataKey="Resolved" stroke="#10B981" fillOpacity={0.06} fill="#10B981" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Resolution Target vs SLA Bar Comparison */}
                  <div className={`lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between h-[280px] sm:h-[320px] transition-all duration-300 ${mobileChartTab === 'sla' ? 'flex' : 'hidden lg:flex'}`}>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">SLA Target vs Actual Resolution Speed</h4>
                      <span className="text-[10px] text-slate-400">Lower actual hours (indigo) than target (slate) indicates high efficiency</span>
                    </div>

                    <div className="flex-1 w-full pt-4 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={slaChartData}>
                          <XAxis dataKey="category" stroke="#94a3b8" fontSize={8} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 8, fill: '#64748b' } }} tickLine={false} />
                          <Tooltip />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                          <Bar dataKey="Actual" fill="#6366F1" radius={[2, 2, 0, 0]} barSize={12} />
                          <Bar dataKey="Target" fill="#CBD5E1" radius={[2, 2, 0, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Severity Composition Pie Chart */}
                  <div className={`lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between h-[280px] sm:h-[320px] transition-all duration-300 ${mobileChartTab === 'severity' ? 'flex' : 'hidden lg:flex'}`}>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Severity Breakdown</h4>
                      <span className="text-[10px] text-slate-400">Proportional load of high-threat concerns</span>
                    </div>

                    <div className="flex-1 relative min-h-0 py-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={severityChartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {severityChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Customized legend below */}
                      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-1 text-[8px] font-bold uppercase text-slate-500 text-center">
                        {severityChartData.map((item) => (
                          <div key={item.name} className="flex items-center justify-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name} ({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Departmental Accountability Scorecard */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider font-display">Municipal Agency Scorecard</h4>
                    </div>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">Live Status Check</span>
                  </div>

                  {/* Desktop View: Clean Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px]">
                          <th className="py-2.5">Agency / Department</th>
                          <th className="py-2.5">Responsible Scope</th>
                          <th className="py-2.5">Total Assigned</th>
                          <th className="py-2.5">SLA Compliance Rate</th>
                          <th className="py-2.5 text-right">Performance Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 font-bold text-slate-800">Gwalior Nagar Nigam (Municipal Waste Corp)</td>
                          <td className="py-3">Garbage, litter, municipal hygiene</td>
                          <td className="py-3">54 incidents</td>
                          <td className="py-3 text-emerald-600 font-bold">96% compliant</td>
                          <td className="py-3 text-right">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-sm">GRADE A+</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold text-slate-800">Madhya Pradesh Kshetra Vidyut Vitran</td>
                          <td className="py-3">Streetlights, faulty wires, solar poles</td>
                          <td className="py-3">38 incidents</td>
                          <td className="py-3 text-emerald-600 font-bold">91% compliant</td>
                          <td className="py-3 text-right">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-sm">GRADE A</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold text-slate-800">Gwalior Municipal Water Resources Board</td>
                          <td className="py-3">Main pipe leakages, sewage blockades</td>
                          <td className="py-3">43 incidents</td>
                          <td className="py-3 text-amber-600 font-bold">84% compliant</td>
                          <td className="py-3 text-right">
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-sm">GRADE B+</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold text-slate-800">Public Works Department (PWD Gwalior)</td>
                          <td className="py-3">Potholes, cave-ins, road damage</td>
                          <td className="py-3">29 incidents</td>
                          <td className="py-3 text-red-600 font-bold">76% compliant</td>
                          <td className="py-3 text-right">
                            <span className="bg-red-50 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-sm">GRADE C</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View: Stack of elegant Cards */}
                  <div className="block md:hidden space-y-3">
                    {[
                      {
                        name: "Gwalior Nagar Nigam (Municipal Waste Corp)",
                        scope: "Garbage, litter, municipal hygiene",
                        incidents: "54 incidents",
                        compliance: "96%",
                        grade: "GRADE A+",
                        gradeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        barColor: "bg-emerald-500"
                      },
                      {
                        name: "Madhya Pradesh Kshetra Vidyut Vitran",
                        scope: "Streetlights, faulty wires, solar poles",
                        incidents: "38 incidents",
                        compliance: "91%",
                        grade: "GRADE A",
                        gradeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        barColor: "bg-emerald-500"
                      },
                      {
                        name: "Gwalior Municipal Water Resources Board",
                        scope: "Main pipe leakages, sewage blockades",
                        incidents: "43 incidents",
                        compliance: "84%",
                        grade: "GRADE B+",
                        gradeColor: "bg-amber-50 text-amber-700 border-amber-200",
                        barColor: "bg-amber-500"
                      },
                      {
                        name: "Public Works Department (PWD Gwalior)",
                        scope: "Potholes, cave-ins, road damage",
                        incidents: "29 incidents",
                        compliance: "76%",
                        grade: "GRADE C",
                        gradeColor: "bg-red-50 text-red-700 border-red-200",
                        barColor: "bg-red-500"
                      }
                    ].map((dept, index) => (
                      <div key={index} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-3 shadow-3xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-800 leading-snug">{dept.name}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">{dept.scope}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide border shrink-0 uppercase ${dept.gradeColor}`}>
                            {dept.grade}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Assigned: <strong className="text-slate-700 font-bold">{dept.incidents}</strong></span>
                            <span>Compliance: <strong className="text-slate-700 font-bold">{dept.compliance}</strong></span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                            <div className={`h-full ${dept.barColor} rounded-full`} style={{ width: dept.compliance }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Predictive Smart-City Sandbox Playground */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 text-white relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center space-x-2 border-b border-white/10 pb-4 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-yellow-400 tracking-wider font-display">AI Gwalior Load Simulator</h4>
                      <p className="text-[10px] text-slate-300">Run simulations of environmental spikes or major events to forecast municipal pressure</p>
                    </div>
                  </div>

                  {/* Settings grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
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
                        className="mt-5 border-t border-white/10 pt-4 overflow-hidden"
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
                    <div className="mt-4 flex items-center space-x-2 text-[10px] text-slate-400 bg-white/5 rounded-lg p-2.5">
                      <Info className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span>Select weather and footfall configurations above to forecast risk surge, estimate high-threat zones, and generate dynamic pre-emptive action rosters.</span>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

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
                    <div className="relative w-24 h-24 mx-auto">
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white p-1.5 rounded-full shadow-md">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-slate-800 text-base">{currentUser.name}</h3>
                      <p className="text-xs text-slate-400">{currentUser.email || 'priyansh@civicpulse.org'}</p>
                      <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
                        <span className="inline-block bg-blue-50 text-blue-700 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-100">
                          {currentUser.role === 'citizen' ? 'Citizen Steward' : currentUser.role === 'admin' ? 'System Administrator' : 'Municipal Authority'}
                        </span>
                        <span className="inline-block bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-100">
                          Level {Math.floor(currentUser.points / 150) + 1}
                        </span>
                      </div>
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

                  {/* Logout Button */}
                  <div className="pt-2 border-t border-slate-100 mt-auto">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition duration-200 cursor-pointer shadow-2xs"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>

                {/* Right Interactive Dashboard Panel */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-5">
                  
                  {/* Citizen Engagement Leaderboard Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="text-left">
                      <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
                        <span>Citizen Engagement Leaderboard</span>
                      </h3>
                      <p className="text-xs text-slate-400">Competitive ranking of active citizens in Gwalior based on reports, peer-verifications, and comments.</p>
                    </div>
                  </div>

                  {/* Sub-tab: Civic Leaderboard in Gamification */}
                  {(() => {
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
                  {false && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Rewards Redemption Center</h4>
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-bold">
                            Balance: {currentUser.points} pts
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Trade your community contribution points for real physical & travel vouchers authorized by Gwalior Municipal Corp.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            <div key={reward.id} className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl p-3.5 flex justify-between items-start transition duration-200">
                              <div className="flex items-start space-x-3">
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100 shrink-0">
                                  <RewardIcon className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <h5 className="font-black text-slate-800 text-xs tracking-tight">{reward.title}</h5>
                                  <p className="text-[10px] text-slate-500 leading-snug">{reward.description}</p>
                                  <span className="inline-block text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5">
                                    {reward.cost} points
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRedeemReward(reward)}
                                disabled={!canAfford}
                                className={`text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition shrink-0 ${canAfford ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                              >
                                {canAfford ? 'Redeem' : 'Locked'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 3: Daily Quests and Challenges */}
                  {false && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Active Daily Challenges</h4>
                        <p className="text-[10px] text-slate-400">Complete neighborhood check-ins to gain multiplier bonuses and point rewards.</p>
                      </div>

                      <div className="space-y-3">
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
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveTab('report')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition"
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
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveTab('feed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition"
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
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg flex items-center space-x-1 whitespace-nowrap">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveTab('report')}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg transition"
                            >
                              Advocate Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 4: My Activity Feed */}
                  {false && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Your Contribution & Coordination Log</h4>
                        <p className="text-[10px] text-slate-400">Chronological history of your reported and co-signed neighborhood hazard tickets.</p>
                      </div>

                      {userActivities.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs">
                          No registered interactions. Visit the Map Feed to sign petitions or submit a new case file.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                          {userActivities.map((issue) => {
                            const isReporter = issue.reporterId === currentUser.uid;
                            return (
                              <div key={issue.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
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
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : issue.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'}`}>
                                    {issue.status}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setActiveTab('feed');
                                    }}
                                    className="text-[10px] font-extrabold uppercase bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg transition"
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
                  {false && (
                    <form onSubmit={handleSaveProfileSettings} className="space-y-4 text-left">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Citizen Stewardship Settings</h4>
                        <p className="text-[10px] text-slate-400">Configure your personal information and Gwalior local alert channel preferences.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Steward Display Name</label>
                          <input 
                            type="text"
                            value={profileEditName}
                            onChange={(e) => setProfileEditName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                            placeholder="Display name"
                          />
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Registered Mobile Number (OTP Alerts)</label>
                          <input 
                            type="text"
                            value={profileEditPhone}
                            onChange={(e) => setProfileEditPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-800"
                            placeholder="+91 94251 12345"
                          />
                        </div>

                        {/* Preferred Ward Zone */}
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 block">Primary Zone of Responsibility</label>
                          <select 
                            value={profileEditWard}
                            onChange={(e) => setProfileEditWard(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700"
                          >
                            <option value="Lashkar Zone (Maharaj Bada)">Lashkar Zone (Maharaj Bada)</option>
                            <option value="Morar Zone (Thatipur)">Morar Zone (Thatipur)</option>
                            <option value="City Center Gwalior">City Center Gwalior</option>
                            <option value="Fort & Old Town Area">Fort & Old Town Area</option>
                            <option value="DD Nagar & Pinto Park">DD Nagar & Pinto Park</option>
                          </select>
                        </div>
                      </div>

                      {/* Notification Toggles */}
                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 block">Civic Alert Notifications</label>
                        
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={profileNotificationSMS}
                              onChange={(e) => setProfileNotificationSMS(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" 
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 block">SMS Alerts</span>
                              <span className="text-[9px] text-slate-400">Instant SMS upon local hazard routing or state status updates.</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={profileNotificationWhatsApp}
                              onChange={(e) => setProfileNotificationWhatsApp(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" 
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 block">WhatsApp Broadcasts</span>
                              <span className="text-[9px] text-slate-400">Weekly summaries of ward resolution rates and leaderboards.</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={profileNotificationEmail}
                              onChange={(e) => setProfileNotificationEmail(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" 
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 block">Official Email Dispatch</span>
                              <span className="text-[9px] text-slate-400">Official letters from Gwalior Nagar Nigam regarding resolution audits.</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          Save Settings
                        </button>
                      </div>
                    </form>
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
                className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6"
              >
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Honorary Civic Leaderboard</h2>
                    <p className="text-xs text-slate-500">Citizens driving localized resolution and neighborhood stewardship.</p>
                  </div>
                  <Award className="w-6 h-6 text-yellow-500 animate-bounce" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-b text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Citizen</th>
                        <th className="py-3 px-4 text-center">Incidents Flagged</th>
                        <th className="py-3 px-4 text-center">Verifications Completed</th>
                        <th className="py-3 px-4 text-center">Achievements unlocked</th>
                        <th className="py-3 px-4 text-right">Steward Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-600">
                      {leaderboard
                        .filter(u => u.role === 'citizen')
                        .sort((a, b) => b.points - a.points)
                        .map((user, idx) => (
                          <tr key={user.uid} className={`hover:bg-slate-50/50 transition ${user.uid === currentUser?.uid ? 'bg-blue-50/40 font-semibold' : ''}`}>
                          <td className="py-4 px-4 font-black">
                            {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                          </td>
                          <td className="py-4 px-4 flex items-center space-x-3">
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border" />
                            <div>
                              <p className="font-bold text-slate-800">{user.name}</p>
                              <span className="text-[10px] text-slate-400">Ward: {idx === 0 ? 'Downtown Core' : 'Eastside Waterfront'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-bold">{user.reportedCount}</td>
                          <td className="py-4 px-4 text-center font-bold">{user.verifiedCount}</td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex justify-center -space-x-1">
                              {user.badges.map((b, bIdx) => (
                                <div key={bIdx} className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white text-[8px] font-black" title={b.title}>
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

              </motion.div>
            )}

            {/* View 8: Municipal Admin Verification and Access Panel */}
            {activeTab === 'admin_panel' && currentUser?.role === 'admin' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6"
              >
                <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      <span>Municipal Operations & Authority Verification</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Review pending official applications, audit Gwalior staff credentials, and update municipal clearance levels.</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl shrink-0">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></span>
                    <span className="text-[11px] text-indigo-800 font-extrabold uppercase tracking-wider font-mono">
                      System Operator: Active
                    </span>
                  </div>
                </div>

                {/* Statistics Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-3.5">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Pending Approvals</p>
                      <h4 className="text-lg font-black text-slate-800">
                        {leaderboard.filter(u => u.role === 'authority' && u.verificationStatus === 'pending').length} Staff
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-3.5">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Verified Authorities</p>
                      <h4 className="text-lg font-black text-slate-800">
                        {leaderboard.filter(u => u.role === 'authority' && u.verificationStatus === 'verified').length} Approved
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-3.5">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total Registered Users</p>
                      <h4 className="text-lg font-black text-slate-800">
                        {leaderboard.length} Users
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Main Table for approvals */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Official Gwalior Roster</h3>
                  
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-slate-50/50">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 font-bold border-b text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-4">Officer/Applicant</th>
                          <th className="py-3 px-4">Contact/Role</th>
                          <th className="py-3 px-4">Verification Status</th>
                          <th className="py-3 px-4">Clearance Level</th>
                          <th className="py-3 px-4 text-right">Actions / Assignment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-600 bg-white">
                        {leaderboard.filter(u => u.role === 'authority' || u.role === 'admin').map((user) => {
                          const isPending = user.verificationStatus === 'pending';
                          const isVerified = user.verificationStatus === 'verified';
                          const isRejected = user.verificationStatus === 'rejected';

                          return (
                            <tr key={user.uid} className="hover:bg-slate-50 transition">
                              <td className="py-4 px-4 flex items-center space-x-3">
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200 shadow-xs animate-none" referrerPolicy="no-referrer" />
                                <div>
                                  <p className="font-bold text-slate-800">{user.name}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">UID: {user.uid}</span>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <p className="font-medium text-slate-700">{user.email || 'No Email'}</p>
                                <span className={`inline-block text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                  {user.role === 'admin' ? 'System Administrator' : 'Municipal Authority'}
                                </span>
                              </td>

                              <td className="py-4 px-4">
                                {isPending && (
                                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                    <span>Pending GMC Verification</span>
                                  </span>
                                )}
                                {isVerified && (
                                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>GMC Verified & Active</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                                    <X className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Application Rejected</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-4">
                                {user.role === 'admin' ? (
                                  <span className="text-xs font-bold text-purple-700">Level 3 (Root Override)</span>
                                ) : (
                                  <div className="flex flex-col space-y-1">
                                    <select
                                      disabled={user.role === 'admin'}
                                      value={user.accessLevel || 'none'}
                                      onChange={(e) => {
                                        handleAdminVerifyUser(user.uid, user.verificationStatus as any, e.target.value as any);
                                      }}
                                      className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 font-bold cursor-pointer disabled:bg-slate-100"
                                    >
                                      <option value="none">No Level (Revoked)</option>
                                      <option value="level_1">Level 1 (Field Inspector)</option>
                                      <option value="level_2">Level 2 (Department Head)</option>
                                      <option value="level_3">Level 3 (Municipal Commissioner)</option>
                                    </select>
                                    <span className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                                      {user.accessLevel === 'level_3' ? 'Full administrative rights' : user.accessLevel === 'level_2' ? 'Can update status' : user.accessLevel === 'level_1' ? 'Can inspect' : 'No rights assigned'}
                                    </span>
                                  </div>
                                )}
                              </td>

                              <td className="py-4 px-4 text-right">
                                {user.role !== 'admin' && (
                                  <div className="flex items-center justify-end space-x-2">
                                    {!isVerified ? (
                                      <button
                                        type="button"
                                        onClick={() => handleAdminVerifyUser(user.uid, 'verified', user.accessLevel || 'level_1')}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black tracking-wider uppercase transition cursor-pointer"
                                      >
                                        Approve GMC Access
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleAdminVerifyUser(user.uid, 'rejected', 'none')}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-black tracking-wider uppercase transition cursor-pointer"
                                      >
                                        Reject GMC Access
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Guidance */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3 text-xs leading-relaxed text-indigo-950">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-indigo-900">Understanding GMC Access Clearance Levels</p>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-indigo-900">
                      <li><strong>Level 1 (Field Inspector):</strong> Assigned to field team operators. Can perform site inspections, view reported citizen images, and draft operational comments.</li>
                      <li><strong>Level 2 (Department Head):</strong> Assigned to specific departmental leads. Can assign issues to inspectors and move status (e.g., In Progress, Resolved).</li>
                      <li><strong>Level 3 (Municipal Commissioner):</strong> Highest clearance tier. Full access to Gwalior municipal configurations, executive priorities, and absolute oversight.</li>
                    </ul>
                  </div>
                </div>
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
            onClick={() => { setActiveTab(currentUser?.role === 'admin' ? 'admin_panel' : 'profile'); setSelectedIssue(null); }}
            className={`flex flex-col items-center space-y-1 text-[9px] font-extrabold transition-all duration-200 ${(activeTab === 'profile' || activeTab === 'admin_panel') ? 'text-orange-400 scale-105' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {currentUser?.role === 'admin' ? (
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
}

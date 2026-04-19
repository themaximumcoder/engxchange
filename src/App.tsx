import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MarketplaceFeed } from './components/MarketplaceFeed';
import { ListingForm } from './components/ListingForm';
import { Dashboard } from './components/Dashboard';
import { ForumFeed } from './components/ForumFeed';
import { ForumPostForm } from './components/ForumPostForm';
import { RegistrationForm } from './components/RegistrationForm';
import { Login } from './components/Login';
import { Footer } from './components/Footer';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { TermsPage, ContactPage, WorkWithUsPage, PrivacyPage } from './components/InfoPages';
import { MessagesInbox } from './components/MessagesInbox';
import { ItemDetails } from './components/ItemDetails';
import { NotificationsPage } from './components/NotificationsPage';
import { UpdatePassword } from './components/UpdatePassword';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { UNIVERSITY_PRESETS } from './lib/universityData';
import type { MarketplaceItem, ForumPost, Comment, Message, Notification, Project, SocietyName, EntryType } from './types';
import { supabase } from './lib/supabaseClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Session, RealtimeChannel } from '@supabase/supabase-js';
import { Analytics } from "@vercel/analytics/react";
import { APIProvider } from '@vis.gl/react-google-maps';
import './App.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const RequireAuth = ({ session, children }: { session: Session | null | undefined, children: React.ReactNode }) => {
  // If session is undefined (still loading), don't redirect yet
  if (session === undefined) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const mapItemFromDB = (row: Record<string, unknown>): MarketplaceItem => ({
  id: row.id as string,
  title: row.title as string,
  description: row.description as string,
  sellingPrice: row.price as number | undefined,
  originalPrice: row.original_price as number | undefined,
  sellerEmail: row.seller_email as string | undefined,
  society: row.society as SocietyName,
  type: row.type as EntryType,
  imageUrls: Array.isArray(row.image_urls) ? row.image_urls : (row.image_url ? [row.image_url as string] : []),
  imageUrl: row.image_url as string | undefined,
  deliveryMethod: row.delivery_method as "delivery" | "meetup" | "both" | undefined,
  meetupLocationName: row.meetup_location_name as string | undefined,
  meetupLat: row.meetup_lat as number | undefined,
  meetupLng: row.meetup_lng as number | undefined,
  sellerPhone: row.seller_phone as string | undefined,
  views: row.views as number | undefined,
  createdAt: row.created_at as string,
  isSold: row.is_sold as boolean | undefined,
  transactionMode: row.transaction_mode as 'sell' | 'trade' | 'both' | undefined,
  country: (row.country as string) || 'UK',
  points: row.points as number | undefined
});

const mapItemToDB = (item: Partial<MarketplaceItem>) => ({
  title: item.title,
  description: item.description,
  price: item.sellingPrice,
  original_price: item.originalPrice,
  society: item.society,
  type: item.type,
  image_urls: item.imageUrls || [],
  image_url: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : (item.imageUrl || null),
  delivery_method: item.deliveryMethod,
  meetup_location_name: item.meetupLocationName,
  meetup_lat: item.meetupLat,
  meetup_lng: item.meetupLng,
  seller_email: item.sellerEmail || 'student@ed.ac.uk',
  seller_phone: item.sellerPhone,
  is_sold: item.isSold || false,
  transaction_mode: item.transactionMode,
  country: item.country || 'UK'
});

const mapPostFromDB = (row: Record<string, unknown>): ForumPost => ({
  id: row.id as string,
  authorEmail: row.author_email as string,
  title: row.title as string,
  content: row.content as string,
  imageUrl: row.image_url as string | undefined,
  stlFileName: row.stl_file_name as string | undefined,
  stlFileUrl: row.stl_file_url as string | undefined,
  upvotes: row.upvotes as number,
  createdAt: row.created_at as string,
  tags: row.tags ? String(row.tags).split(',').map(t => t.trim()) : undefined
});

const mapPostToDB = (post: Partial<ForumPost>) => ({
  author_email: post.authorEmail,
  title: post.title,
  content: post.content,
  image_url: post.imageUrl,
  stl_file_name: post.stlFileName,
  stl_file_url: post.stlFileUrl,
  tags: post.tags ? post.tags.join(',') : null
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainApp() {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [globalProjects, setGlobalProjects] = useState<Project[]>([]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('selectedCountry') || 'UK');
  const [likedProjects, setLikedProjects] = useState<string[]>([]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const stored = localStorage.getItem('selectedCountry');
    if (!stored) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.country_code === 'MY') {
            setSelectedCountry('Malaysia');
          } else {
            setSelectedCountry('UK');
          }
        })
        .catch(() => {
          setSelectedCountry('UK');
        });
    }
  }, []);

  // SEEDING LOGIC - REMOVE AFTER USE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('seed') === 'true' && session) {
      console.log('Seeding items via frontend session...');
      const seedData = [
        { title: "Arduino Uno R3 Starter Kit", description: "Complete kit for first-year electronics. Includes breadboard and 20 sensors. Minor use.", price: 35.0, original_price: 55.0, society: "Precious Plastic", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600" },
        { title: "Raspberry Pi 4 Model B (8GB)", description: "Powerful single board computer. Barely used, perfect for capstone projects.", price: 75.0, original_price: 95.0, society: "CompSoc", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1563213123-01048b29e240?w=600" },
        { title: "PLA Filament Spool (White)", description: "Standard 1.75mm PLA. Vacuum sealed. Prints great on Ender 3.", price: 15.0, original_price: 20.0, society: "HumanEd", type: "Materials", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600" },
        { title: "PETG Filament (Blue)", description: "Tougher than PLA. 1kg spool, approx 90% left. High quality.", price: 18.0, original_price: 25.0, society: "Battleburgh", type: "Materials", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1572914191102-404390757858?w=600" },
        { title: "Digital Multimeter (Auto)", description: "Essential for any lab work. Reliable calibration, no blown fuses.", price: 25.0, original_price: 40.0, society: "Hyped", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1581092582845-a7b3703566fa?w=600" },
        { title: "Soldering Iron Kit (60W)", description: "Adjustable temp iron with 5 tips. Great for PCB assembly.", price: 20.0, original_price: 35.0, society: "Precious Plastic", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600" },
        { title: "Breadboard & Jumper Wires", description: "Standard 830 point breadboard with 65 jumper wires. Clean.", price: 8.0, original_price: 15.0, society: "BioBlocks", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600" },
        { title: "Ultrasonic Sensors x5", description: "HC-SR04 sensors for distance sensing. Bulk pack from robotics lab.", price: 10.0, original_price: 18.0, society: "Winds of Change (WoC)", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600" },
        { title: "Nema 17 Stepper Motor", description: "High torque motor for 3D printers or robotics projects. Tested.", price: 12.0, original_price: 20.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-15967534269ec1-5917893f72ba?w=600" },
        { title: "L298N Motor Driver", description: "Dual H-Bridge driver. Handles up to 2A per channel. Reliable.", price: 5.0, original_price: 10.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600" },
        { title: "Pyrex Beaker Set", description: "3 beakers (100ml, 250ml, 500ml). Borosilicate glass, heat resistant.", price: 20.0, original_price: 35.0, society: "Engineering 4 change (E4C)", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?w=600" },
        { title: "Erlenmeyer Flasks x3", description: "Standard lab flasks. Minor staining but fully functional.", price: 15.0, original_price: 28.0, society: "Precious Plastic", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600" },
        { title: "Precision Screwdriver Set", description: "24 piece magnetic driver set. Perfect for laptop or small tech repair.", price: 12.0, original_price: 22.0, society: "Battleburgh", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600" },
        { title: "Aluminum Extrusions (2020)", description: "4x 500mm slots for CNC or 3D printer frames. T-slot standard.", price: 30.0, original_price: 45.0, society: "Hyped", type: "Materials", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1558444029-019bb44818da?w=600" },
        { title: "Digital Caliper (Steel)", description: "High precision measuring tool. Auto shut-off, zeroing works well.", price: 25.0, original_price: 45.0, society: "Civil Engineering Society", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1504917595217-d4dc5f9c4739?w=600" },
        { title: "Portable Oscilloscope", description: "Single channel handheld scope. Great for debugging automotive sensors.", price: 60.0, original_price: 90.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1581092334651-ddf26d9a1930?w=600" },
        { title: "Lipo Battery 3S 2.2Ah", description: "Used for drone project. Balanced cells, storage charged properly.", price: 15.0, original_price: 28.0, society: "Hyped", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1579546673203-d247f1c3026e?w=600" },
        { title: "MG996R Robotics Servos", description: "High torque metal gear servos. 4 piece set for robot arm projects.", price: 25.0, original_price: 40.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600" },
        { title: "Lab Stand & Clamps", description: "Sturdy retort stand for titration or distillation setups. Like new.", price: 40.0, original_price: 65.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1581091870619-83bc93855173?w=600" },
        { title: "M3 Screw Box (300pc)", description: "Organized box of hex screws, nuts, and spacers. Very handy.", price: 10.0, original_price: 18.0, society: "HumanEd", type: "Materials", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1530124560677-bdaeaebef270?w=600" },
        { title: "ESP32 DevKit x2", description: "Wifi and Bluetooth enabled microcontrollers. Brand new in pack.", price: 14.0, original_price: 22.0, society: "CompSoc", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600" },
        { title: "Heat Shrink Bundle", description: "Assorted sizes from 2mm to 10mm. 150 pieces for wiring protection.", price: 5.0, original_price: 12.0, society: "HumanEd", type: "Materials", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1558444029-019bb44818da?w=600" },
        { title: "Wire Stripping Tool", description: "Automatic stripper, saves so much time on harness builds.", price: 18.0, original_price: 30.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1516216628859-9bccecad13ef?w=600" },
        { title: "Robotic Claw (Alu)", description: "Aluminum gripper for hobbyist robot arms. Strong and precise.", price: 45.0, original_price: 75.0, society: "Hyped", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=600" },
        { title: "Gear Motor Set (4pc)", description: "DC motors with yellow wheels for mobile robot chassis.", price: 12.0, original_price: 25.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?w=600" },
        { title: "3D Printer Resin (Grey)", description: "1kg bottle of standard UV resin. unopened. High resolution.", price: 25.0, original_price: 40.0, society: "Precious Plastic", type: "Materials", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1572914191102-404390757858?w=600" },
        { title: "Desoldering Vacuum", description: "Professional grade solder sucker. Makes PCB repairs 10x easier.", price: 15.0, original_price: 25.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600" },
        { title: "Bunsen Burner Kit", description: "With ceramic mat and tripod. Labs are clearing out old stock.", price: 20.0, original_price: 45.0, society: "Engineering 4 change (E4C)", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?w=600" },
        { title: "Buck Converter Module", description: "Step down voltage regulator. Efficient and easy to tune.", price: 6.0, original_price: 12.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "UK", image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600" },
        { title: "Lab Bench Supply", description: "Steady 0-30V 5A power supply. A bit heavy but very reliable.", price: 80.0, original_price: 130.0, society: "HumanEd", type: "Tools", seller_email: "admin@engxchange.com", is_sold: true, country: "Malaysia", image_url: "https://images.unsplash.com/photo-1581092334651-ddf26d9a1930?w=600" }
      ];

      Promise.all(seedData.map(item => supabase.from('items').insert([item])))
        .then(() => {
          alert('Success! 30 dummy items have been seeded.');
          window.location.href = '/';
        })
        .catch(err => alert('Seed failed: ' + err.message));
    }
  }, [session]);

  const loadData = useCallback(async () => {
    const { data: iData } = await supabase.from('items').select('*').order('created_at', { ascending: false });

    const { data: uData } = await supabase.from('users').select('email, university, degree, year_of_study, points, profile_picture_url, username');
    const userMap = new Map(uData?.map((u: Record<string, unknown>) => [u.email as string, { uni: u.university as string, deg: u.degree as string, yr: u.year_of_study as string, pts: (u.points as number) || 0, avatar: u.profile_picture_url as string, name: u.username as string }]) || []);

    setItems(iData?.map(row => {
      const item = mapItemFromDB(row);
      const u = userMap.get(item.sellerEmail || '');
      item.origin = u?.uni || '';
      item.degree = u?.deg || '';
      item.yearOfStudy = u?.yr || '';
      item.points = u?.pts || 0;
      item.sellerAvatar = u?.avatar || '';
      item.sellerName = u?.name || '';
      return item;
    }) || []);

    const { data: pData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (pData) {
      setPosts(pData.map(row => {
        const post = mapPostFromDB(row);
        const u = userMap.get(post.authorEmail || '');
        post.origin = u?.uni || '';
        post.degree = u?.deg || '';
        post.yearOfStudy = u?.yr || '';
        post.points = u?.pts || 0;
        post.authorName = u?.name || '';
        post.authorAvatar = u?.avatar || '';
        return post as ForumPost;
      }));
    }

    const { data: cData } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
    if (cData) {
      setComments(cData.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        postId: row.post_id as string,
        authorEmail: row.author_email as string,
        content: row.content as string,
        createdAt: row.created_at as string,
        points: (userMap.get(row.author_email as string)?.pts as number) || 0
      })));
    }

    const { data: projData } = await supabase.from('projects').select('*').eq('is_private', false).order('created_at', { ascending: false });
    if (projData) setGlobalProjects(projData);
  }, []);

  useEffect(() => {
    loadData();

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user?.id) {
        const stored = localStorage.getItem(`votes_${currentSession.user.id}`);
        setUserVotes(stored ? JSON.parse(stored) : {});
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user?.id) {
        const stored = localStorage.getItem(`votes_${currentSession.user.id}`);
        setUserVotes(stored ? JSON.parse(stored) : {});
      } else {
        setUserVotes({});
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [loadData]);

  useEffect(() => {
    let active = true;
    let msgSub: RealtimeChannel | null = null;
    let notifSub: RealtimeChannel | null = null;

    const fetchPrivates = async () => {
      if (!session?.user?.email) return;

      const { data: userData } = await supabase.from('users').select('profile_picture_url').eq('email', session.user.email).single();
      if (active && userData) setCurrentUserAvatar(userData.profile_picture_url || '');

      const { data: nData } = await supabase.from('notifications').select('*').eq('user_email', session.user.email).order('created_at', { ascending: false });
      if (active && nData) {
        setNotifications(nData.map((r: Record<string, unknown>) => ({
          id: r.id as string, userEmail: r.user_email as string, type: r.type as string, message: r.message as string, read: r.read as boolean, createdAt: r.created_at as string
        })));
      }

      const userEmail = session.user.email;
      const { data: mData, error: mError } = await supabase.from('messages')
        .select('*')
        .or(`sender_email.eq.${userEmail},receiver_email.eq.${userEmail}`)
        .order('created_at', { ascending: true });

      if (mError) {
        console.error("Message Fetch Error:", mError);
      }
      if (active && mData) {
        setMessages(mData.map((r: Record<string, unknown>) => ({
          id: r.id as string, 
          senderEmail: r.sender_email as string, 
          receiverEmail: r.receiver_email as string, 
          content: r.content as string, 
          read: r.read as boolean, 
          itemId: r.item_id as string,
          readAt: r.read_at as string,
          createdAt: r.created_at as string
        })));
      }

      const { data: sData } = await supabase.from('saved_items').select('item_id').eq('user_email', session.user.email);
      if (active && sData) {
        setSavedItems(sData.map((r: Record<string, unknown>) => r.item_id as string));
      }

      msgSub = supabase.channel('realtime-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const r = payload.new;
          if (r.sender_email === session.user.email || r.receiver_email === session.user.email) {
            setMessages(prev => [...prev.filter(m => m.id !== r.id), {
              id: r.id as string, 
              senderEmail: r.sender_email as string, 
              receiverEmail: r.receiver_email as string, 
              content: r.content as string, 
              read: r.read as boolean, 
              itemId: r.item_id as string,
              readAt: r.read_at as string,
              createdAt: r.created_at as string
            }]);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
          const r = payload.new;
          if (r.sender_email === session.user.email || r.receiver_email === session.user.email) {
            setMessages(prev => prev.map(m => m.id === r.id ? {
              ...m,
              read: r.read as boolean,
              readAt: r.read_at as string
            } : m));
          }
        })
        .subscribe();

      notifSub = supabase.channel('realtime-notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
          const r = payload.new;
          if (r.user_email === session.user.email) {
            setNotifications(prev => [{
              id: r.id, userEmail: r.user_email, type: r.type, message: r.message, read: r.read, createdAt: r.created_at
            }, ...prev.filter(n => n.id !== r.id)]);
          }
        }).subscribe();

    };
    fetchPrivates();
    return () => {
      active = false;
      if (msgSub) supabase.removeChannel(msgSub);
      if (notifSub) supabase.removeChannel(notifSub);
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let idleTimer: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        supabase.auth.signOut();
        window.location.href = '/login';
        alert('For security reasons, you have been automatically logged out after 1 hour of zero keyboard or mouse activity.');
      }, 3600000); // 1 hour
    };

    handleActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [session]);

  const currentUserEmail = session?.user?.email || '';

  const handleToggleSold = async (id: string, isSold: boolean) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isSold } : item));
    const { error } = await supabase.from('items').update({ is_sold: isSold }).eq('id', id);
    if (error) {
      console.error("Sold toggle failed:", error);
      alert('Update failed: ' + error.message);
    }
  };

  const handleDeleteListing = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateListing = (id: string, updates: Partial<MarketplaceItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleAddListing = async (newItemData: Omit<MarketplaceItem, 'id' | 'createdAt'>) => {
    const dbPayload = mapItemToDB(newItemData);
    const { data, error } = await supabase.from('items').insert([dbPayload]).select();
    if (!error && data && data.length > 0) {
      new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3').play().catch(() => { });
      setItems(prev => [mapItemFromDB(data[0]), ...prev]);
      navigate('/');
    } else {
      console.error(error);
      alert('Upload failed: ' + error?.message);
    }
  };

  const handleAddPost = async (newPostData: Omit<ForumPost, 'id' | 'createdAt' | 'upvotes'>) => {
    const dbPayload = mapPostToDB(newPostData);
    if (session) {
      const { data: userData } = await supabase.from('users').select('points').eq('email', session.user.email).single();
      await supabase.from('users').update({ points: (userData?.points || 0) + 10 }).eq('email', session.user.email);
    }
    const { data, error } = await supabase.from('posts').insert([dbPayload]).select();
    if (!error && data && data.length > 0) {
      new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3').play().catch(() => { });
      setPosts(prev => [mapPostFromDB(data[0]), ...prev]);
      navigate('/forum');
    } else {
      console.error(error);
      alert('Upload failed: ' + error?.message);
    }
  };

  const handleVote = async (postId: string, delta: number) => {
    if (!session?.user?.id) { alert('Please log in.'); navigate('/login'); return; }
    const currentVote = userVotes[postId] || 0;
    const newDelta = currentVote === delta ? -delta : delta - currentVote;
    const finalVoteStatus = currentVote === delta ? 0 : delta;

    if (delta > 0) new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3').play().catch(() => { });
    else new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3').play().catch(() => { });

    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const newVotesMap = { ...userVotes, [postId]: finalVoteStatus };
    setUserVotes(newVotesMap);
    localStorage.setItem(`votes_${session.user.id}`, JSON.stringify(newVotesMap));

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + newDelta } : p));
    await supabase.from('posts').update({ upvotes: currentPost.upvotes + newDelta }).eq('id', postId);

    if (delta > 0 && finalVoteStatus === 1 && currentPost.authorEmail !== session.user.email) {
      supabase.from('notifications').insert([{
        user_email: currentPost.authorEmail,
        type: 'like',
        message: `${session.user.email} upvoted your post: "${currentPost.title.substring(0, 20)}..."`
      }]).then();
    }
  };

  const handleFriendRequest = async (targetEmail: string) => {
    if (!session) { alert('Please login to add friends.'); return; }
    new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3').play().catch(() => { });
    const { error } = await supabase.from('notifications').insert([{
      user_email: targetEmail,
      type: 'friend_request',
      message: `${session.user.email} sent you a friend request.`
    }]);
    if (!error) {
      alert(`Friend request sent to ${targetEmail}!`);
      sendEmailNotification(targetEmail, session.user.email!, "Sent you a friend request on engXchange.");
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!session) return;
    const payload = { post_id: postId, author_email: session.user.email, content };
    const { data, error } = await supabase.from('comments').insert([payload]).select();
    if (!error && data && data.length > 0) {
      new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3').play().catch(() => { });
      const newComment = { id: data[0].id, postId: data[0].post_id, authorEmail: data[0].author_email, content: data[0].content, createdAt: data[0].created_at };
      setComments(prev => [...prev, newComment]);
      const postAuthor = posts.find(p => p.id === postId)?.authorEmail;
      if (postAuthor && postAuthor !== session.user.email) {
        supabase.from('notifications').insert([{ user_email: postAuthor, type: 'comment', message: `${session.user.email} commented on your post` }]).then();
        sendEmailNotification(postAuthor, session.user.email!, "Commented on your post: " + content);
      }
    }
  };

  const sendEmailNotification = async (to: string, sender: string, content: string, messageId?: string) => {
    let displayContent = content;
    
    // Sanitize trade proposal JSON for email body
    if (content.startsWith('[TRADE_V1]')) {
      displayContent = "Proposed a new trade for your item. Check your Inbox on engXchange to see the offer!";
    }

    // Direct Messages (with ID) have a suppression check
    if (messageId) {
       // Wait 15 seconds to see if recipient reads it
       setTimeout(async () => {
          const { data: checkData } = await supabase.from('messages').select('read').eq('id', messageId).single();
          if (checkData && !checkData.read) {
             try {
               await supabase.functions.invoke('send-email', {
                 body: { to, sender, content: displayContent }
               });
             } catch (err) {
               console.error('Email notification failed:', err);
             }
          }
       }, 15000);
    } else {
      // Immediate delivery for comments/requests
      try {
        await supabase.functions.invoke('send-email', {
          body: { to, sender, content: displayContent }
        });
      } catch (err) {
        console.error('Email notification failed:', err);
      }
    }
  };

  const handleSendMessage = useCallback(async (receiver: string, content: string, _itemId?: string) => {
    if (!session?.user?.email) return;
    
    // NOTE: item_id is removed because it's not in current DB schema
    const payload = { 
      sender_email: session.user.email, 
      receiver_email: receiver, 
      content,
      read: false
    };
    
    const { data, error } = await supabase.from('messages').insert([payload]).select();
    
    if (error) {
       console.error("Supabase Message Insert Error:", error);
       alert("Message failed to send. Please check your connection.");
       return;
    }

    if (!error && data && data.length > 0) {
      const r = data[0];
      const newMsg: Message = { 
        id: r.id as string, 
        senderEmail: r.sender_email as string, 
        receiverEmail: r.receiver_email as string, 
        content: r.content as string, 
        read: r.read as boolean, 
        createdAt: r.created_at as string 
      };
      setMessages(prev => [...prev, newMsg]);
      
      // Send in-app notification
      supabase.from('notifications').insert([{ 
        user_email: receiver, 
        type: 'message', 
        message: `${session.user.email} sent you a direct message` 
      }]).then();
      
      // Trigger email notification with suppression logic (15s delay)
      sendEmailNotification(receiver, session.user.email!, content, r.id);
    }
  }, [session]);

  const handleMarkMessagesAsRead = useCallback(async (senderEmail: string) => {
    if (!session?.user?.email) return;
    const now = new Date().toISOString();
    
    // Update local state first for snapiness
    setMessages(prev => prev.map(m => 
      (m.senderEmail === senderEmail && m.receiverEmail === session.user.email && !m.read)
        ? { ...m, read: true, readAt: now }
        : m
    ));

    // Update DB
    await supabase.from('messages')
      .update({ read: true, read_at: now })
      .eq('sender_email', senderEmail)
      .eq('receiver_email', session.user.email)
      .eq('read', false);
  }, [session]);

  const handleReport = useCallback(async (itemId: string, itemType: string, reason: string) => {
    if (!session) { alert('Authentication required.'); return; }
    const { error } = await supabase.from('reports').insert([{ item_id: itemId, item_type: itemType, reason, reported_by: session.user.email }]);
    if (!error) alert('Report submitted successfully.');
  }, [session]);

  const handleLikeItem = useCallback(async (itemId: string) => {
    if (!session) { alert('Please login to save items.'); return; }
    
    const isSaved = savedItems.includes(itemId);
    new Audio('https://www.soundjay.com/buttons/sounds/button-4.mp3').play().catch(() => { });

    const item = items.find(i => i.id === itemId);
    const currentPoints = item?.points || 0;

    if (isSaved) {
      setSavedItems(prev => prev.filter(id => id !== itemId));
      await supabase.from('saved_items').delete().eq('user_email', session.user.email!).eq('item_id', itemId);
      
      const newPoints = Math.max(0, currentPoints - 1);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, points: newPoints } : i));
      await supabase.from('marketplace_items').update({ points: newPoints }).eq('id', itemId);
    } else {
      setSavedItems(prev => [...prev, itemId]);
      const { error } = await supabase.from('saved_items').insert([{ user_email: session.user.email!, item_id: itemId }]);
      if (error) {
         console.error("Save failed:", error);
         setSavedItems(prev => prev.filter(id => id !== itemId));
         return;
      }
      
      if (item && item.sellerEmail && item.sellerEmail !== session.user.email!) {
        supabase.from('notifications').insert([{
          user_email: item.sellerEmail,
          type: 'like',
          message: `${session.user.email!.split('@')[0]} liked your listing: "${item.title}"`
        }]).then();
      }

      // Sync count in DB
      const newPoints = currentPoints + 1;
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, points: newPoints } : i));
      await supabase.from('marketplace_items').update({ points: newPoints }).eq('id', itemId);
    }
  }, [session, savedItems, items]);

  const handleLikeProject = useCallback(async (projectId: string) => {
    if (!session) { alert('Please login to like projects.'); return; }
    
    const isLiked = likedProjects.includes(projectId);
    const proj = globalProjects.find(p => p.id === projectId);
    if (!proj) return;

    if (isLiked) {
        setLikedProjects(prev => prev.filter(id => id !== projectId));
        const newPoints = Math.max(0, (proj.points || 0) - 1);
        setGlobalProjects(prev => prev.map(p => p.id === projectId ? { ...p, points: newPoints } : p));
        await supabase.from('projects').update({ points: newPoints }).eq('id', projectId);
    } else {
        setLikedProjects(prev => [...prev, projectId]);
        const newPoints = (proj.points || 0) + 1;
        setGlobalProjects(prev => prev.map(p => p.id === projectId ? { ...p, points: newPoints } : p));
        await supabase.from('projects').update({ points: newPoints }).eq('id', projectId);
        
        if (proj.user_email !== session.user.email!) {
            supabase.from('notifications').insert([{
                user_email: proj.user_email,
                type: 'like',
                message: `${session.user.email!.split('@')[0]} liked your project: "${proj.title}"`
            }]).then();
        }
    }
  }, [session, globalProjects, likedProjects]);

  const handleMarkNotificationRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredItems = items.filter(i =>
    i.country === selectedCountry &&
    (i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     i.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredPosts = posts.filter(p =>
    (p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredProjects = globalProjects.filter(p =>
    (p.country === undefined || p.country === selectedCountry) &&
    (p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currencySymbol = selectedCountry === 'Malaysia' ? 'RM' : '£';


  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="app-container" style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f8fafc',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '2.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Maps Key Missing</h2>
          <p style={{ color: '#64748b', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            The Google Maps API key is not yet configured or recognized.
          </p>
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>.env</code>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>
            If you just added it, please <strong>restart your development server</strong> (stop with Ctrl+C and run <code>npm run dev</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'marker']}>
      <div className="app-container">
        <Helmet>
          <title>engXchange | Engineering Marketplace & Forum</title>
          <meta name="description" content="The premier decentralized marketplace and social forum for engineering students." />
        </Helmet>

        <Navbar 
          isLoggedIn={!!session} 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          onLogoutClick={handleLogout}
          notifications={notifications}
          avatarUrl={currentUserAvatar}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          availableLocations={UNIVERSITY_PRESETS.filter(u => u.country === (selectedCountry || 'UK')).map(u => u.name)}
          suggestions={items.map(i => i.title)}
          currentUserEmail={currentUserEmail}
        />

        <main className="main-content container">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<MarketplaceFeed items={filteredItems} isLoggedIn={!!session} onReport={handleReport} onLikeItem={handleLikeItem} locationFilter={locationFilter} savedItems={savedItems} currencySymbol={currencySymbol} />} />
              <Route path="/item/:id" element={<ItemDetails items={items} isLoggedIn={!!session} currentUserEmail={currentUserEmail} currencySymbol={currencySymbol} />} />
              <Route path="/list" element={<RequireAuth session={session}><ListingForm onSubmit={handleAddListing} onCancel={() => navigate('/')} initialData={{ sellerEmail: currentUserEmail }} selectedCountry={selectedCountry} /></RequireAuth>} />
              <Route path="/dashboard" element={<RequireAuth session={session}><Dashboard items={items} currentUserEmail={currentUserEmail} onMarkSold={handleToggleSold} onDeleteListing={handleDeleteListing} onUpdateListing={handleUpdateListing} selectedCountry={selectedCountry} /></RequireAuth>} />
              <Route path="/inbox" element={<RequireAuth session={session}><MessagesInbox messages={messages} currentUserEmail={currentUserEmail} onSendMessage={handleSendMessage} onMarkAsRead={handleMarkMessagesAsRead} marketplaceItems={items} /></RequireAuth>} />
              <Route path="/notifications" element={<RequireAuth session={session}><NotificationsPage notifications={notifications} onMarkRead={handleMarkNotificationRead} /></RequireAuth>} />
              <Route path="/forum" element={<ForumFeed posts={filteredPosts} projects={filteredProjects} comments={comments} userVotes={userVotes} onCreatePost={() => { if (!session) { alert('Please log in.'); navigate('/login'); } else { navigate('/create-post'); } }} onVote={handleVote} onAddComment={handleAddComment} onFriendRequest={handleFriendRequest} currentUserEmail={session?.user?.email || ''} onReport={handleReport} onLikeProject={handleLikeProject} />} />
              <Route path="/create-post" element={<RequireAuth session={session}><ForumPostForm currentUserEmail={currentUserEmail} onSubmit={handleAddPost} onCancel={() => navigate('/forum')} selectedCountry={selectedCountry} /></RequireAuth>} />
              <Route path="/register" element={<RegistrationForm onComplete={() => navigate('/')} />} />
              <Route path="/login" element={<Login onLoginSuccess={() => navigate('/')} />} />
              <Route path="/profile" element={<RequireAuth session={session}><Profile session={session ?? null} onProfileUpdate={loadData} /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth session={session}>{ (session?.user?.email === 'engxedinburgh@gmail.com' || session?.user?.email === 's2788457@ed.ac.uk' || session?.user?.email === 'admin@engxchange.com') ? <AdminDashboard items={items} /> : <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}><h2>Access Denied</h2></div>}</RequireAuth>} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/work" element={<WorkWithUsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </ErrorBoundary>
        </main>

        {!(location.pathname === '/inbox' && window.innerWidth < 768) && <Footer />}

        {session !== undefined && session !== null && (
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link">🏠</Link>
            <Link to="/forum" className="mobile-nav-link">💬</Link>
            <Link to="/notifications" className="mobile-nav-link">🔔</Link>
            <Link to="/inbox" className="mobile-nav-link">📬</Link>
            <Link to="/profile" className="mobile-nav-link">👤</Link>
          </nav>
        )}
        <Analytics />
      </div>
    </APIProvider>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <MainApp />
      </Router>
    </HelmetProvider>
  );
}

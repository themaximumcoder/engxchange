import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { TermsPage, ContactPage, WorkWithUsPage } from './components/InfoPages';
import { MessagesInbox } from './components/MessagesInbox';
import { ItemDetails } from './components/ItemDetails';
import { NotificationsPage } from './components/NotificationsPage';
import { UpdatePassword } from './components/UpdatePassword';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { UNIVERSITY_PRESETS } from './types';
import type { MarketplaceItem, ForumPost, Comment, Message, Notification, Project, SocietyName, EntryType } from './types';
import { supabase } from './lib/supabaseClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Session, RealtimeChannel } from '@supabase/supabase-js';
import { Analytics } from "@vercel/analytics/react";
import './App.css';

const RequireAuth = ({ session, children }: { session: Session | null, children: React.ReactNode }) => {
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
  imageUrl: row.image_url as string | undefined,
  deliveryMethod: row.delivery_method as "delivery" | "meetup" | "both" | undefined,
  meetupLocationName: row.meetup_location_name as string | undefined,
  meetupLat: row.meetup_lat as number | undefined,
  meetupLng: row.meetup_lng as number | undefined,
  sellerPhone: row.seller_phone as string | undefined,
  views: row.views as number | undefined,
  createdAt: row.created_at as string,
  isSold: row.is_sold as boolean | undefined
});

const mapItemToDB = (item: Partial<MarketplaceItem>) => ({
  title: item.title,
  description: item.description,
  price: item.sellingPrice,
  original_price: item.originalPrice,
  society: item.society,
  type: item.type,
  image_url: item.imageUrl,
  delivery_method: item.deliveryMethod,
  meetup_location_name: item.meetupLocationName,
  meetup_lat: item.meetupLat,
  meetup_lng: item.meetupLng,
  seller_email: item.sellerEmail || 'student@ed.ac.uk',
  seller_phone: item.sellerPhone,
  is_sold: item.isSold || false
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
  const [session, setSession] = useState<Session | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [globalProjects, setGlobalProjects] = useState<Project[]>([]);
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const { data: iData } = await supabase.from('items').select('*').order('created_at', { ascending: false });

      const { data: uData } = await supabase.from('users').select('email, university, degree, year_of_study, points');
      const userMap = new Map(uData?.map((u: Record<string, unknown>) => [u.email as string, { uni: u.university as string, deg: u.degree as string, yr: u.year_of_study as string, pts: (u.points as number) || 0 }]) || []);

      if (active && iData) {
        setItems(iData.map(row => {
          const item = mapItemFromDB(row);
          const u = userMap.get(item.sellerEmail || '');
          item.origin = u?.uni || '';
          item.degree = u?.deg || '';
          item.yearOfStudy = u?.yr || '';
          item.points = u?.pts || 0;
          return item;
        }));
      }

      const { data: pData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (active && pData) {
        setPosts(pData.map(row => {
          const post = mapPostFromDB(row);
          const u = userMap.get(post.authorEmail || '');
          post.origin = u?.uni || '';
          post.degree = u?.deg || '';
          post.yearOfStudy = u?.yr || '';
          post.points = u?.pts || 0;
          return post as ForumPost;
        }));
      }

      const { data: cData } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
      if (active && cData) {
        setComments(cData.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          postId: row.post_id as string,
          authorEmail: row.author_email as string,
          content: row.content as string,
          createdAt: row.created_at as string,
          points: (userMap.get(row.author_email as string)?.pts as number) || 0
        })));
      }

      const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (active && projData) setGlobalProjects(projData);
    };
    loadData();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setSession(session);
        if (session?.user?.id) {
          const stored = localStorage.getItem(`votes_${session.user.id}`);
          setUserVotes(stored ? JSON.parse(stored) : {});
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setSession(session);
        if (session?.user?.id) {
          const stored = localStorage.getItem(`votes_${session.user.id}`);
          setUserVotes(stored ? JSON.parse(stored) : {});
        } else {
          setUserVotes({});
        }
      }
    });

    return () => { active = false; subscription.unsubscribe(); };
  }, []);

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

      const { data: mData } = await supabase.from('messages')
        .select('*')
        .or(`sender_email.eq.${session.user.email},receiver_email.eq.${session.user.email}`)
        .order('created_at', { ascending: true });
      if (active && mData) {
        setMessages(mData.map((r: Record<string, unknown>) => ({
          id: r.id as string, senderEmail: r.sender_email as string, receiverEmail: r.receiver_email as string, content: r.content as string, read: r.read as boolean, createdAt: r.created_at as string
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
              id: r.id as string, senderEmail: r.sender_email as string, receiverEmail: r.receiver_email as string, content: r.content as string, read: r.read as boolean, createdAt: r.created_at as string
            }]);
          }
        }).subscribe();

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
  const isStudentVerified = currentUserEmail.trim().toLowerCase().endsWith('.ac.uk') ||
    currentUserEmail.trim().toLowerCase().endsWith('.edu');

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
    if (!error) alert(`Friend request sent to ${targetEmail}!`);
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
      }
    }
  };

  const sendEmailNotification = async (to: string, sender: string, content: string) => {
    try {
      await supabase.functions.invoke('send-email', {
        body: { 
          to, 
          subject: `New Message from ${sender}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>New Message on engXchange</h2>
              <p><strong>From:</strong> ${sender}</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                ${content}
              </div>
              <p>Reply to this message on the <a href="https://engxchange.com/inbox">engXchange Inbox</a>.</p>
            </div>
          `
        }
      });
    } catch (err) {
      console.error('Email notification failed:', err);
    }
  };

  const handleSendMessage = async (receiver: string, content: string) => {
    if (!session) return;
    const payload = { sender_email: session.user.email, receiver_email: receiver, content };
    const { data, error } = await supabase.from('messages').insert([payload]).select();
    if (!error && data && data.length > 0) {
      const newMsg = { id: data[0].id, senderEmail: data[0].sender_email, receiverEmail: data[0].receiver_email, content: data[0].content, read: data[0].read, createdAt: data[0].created_at };
      setMessages(prev => [...prev, newMsg]);
      
      // Send in-app notification
      supabase.from('notifications').insert([{ user_email: receiver, type: 'message', message: `${session.user.email} sent you a direct message` }]).then();
      
      // Trigger email notification
      sendEmailNotification(receiver, session.user.email!, content);
    }
  };

  const handleReport = async (itemId: string, itemType: string, reason: string) => {
    if (!session) { alert('Authentication required.'); return; }
    const { error } = await supabase.from('reports').insert([{ item_id: itemId, item_type: itemType, reason, reported_by: session.user.email }]);
    if (!error) alert('Report submitted successfully.');
  };

  const handleLikeItem = async (itemId: string) => {
    if (!session) { alert('Please login to save items.'); return; }
    
    const isSaved = savedItems.includes(itemId);
    new Audio('https://www.soundjay.com/buttons/sounds/button-4.mp3').play().catch(() => { });

    if (isSaved) {
      setSavedItems(prev => prev.filter(id => id !== itemId));
      await supabase.from('saved_items').delete().eq('user_email', session.user.email!).eq('item_id', itemId);
    } else {
      setSavedItems(prev => [...prev, itemId]);
      const { error } = await supabase.from('saved_items').insert([{ user_email: session.user.email!, item_id: itemId }]);
      if (error) {
         console.error("Save failed:", error);
         setSavedItems(prev => prev.filter(id => id !== itemId));
         return;
      }
      
      const item = items.find(i => i.id === itemId);
      if (item && item.sellerEmail && item.sellerEmail !== session.user.email!) {
        supabase.from('notifications').insert([{
          user_email: item.sellerEmail,
          type: 'like',
          message: `${session.user.email!.split('@')[0]} liked your listing: "${item.title}"`
        }]).then();
      }
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredItems = items.filter(i =>
  (i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredPosts = posts.filter(p =>
  (p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredProjects = globalProjects.filter(p =>
  (p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  return (
    <div className="app-container">
      <Helmet>
        <title>engXchange | Engineering Marketplace & Forum</title>
        <meta name="description" content="The premier decentralized marketplace and social forum for engineering students." />
      </Helmet>

      <Navbar
        isLoggedIn={!!session}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        availableLocations={UNIVERSITY_PRESETS.map(u => u.name)}
        onLogoutClick={() => { supabase.auth.signOut(); navigate('/'); }}
        suggestions={items.map(i => i.title)}
        notifications={notifications}
        avatarUrl={currentUserAvatar}
      />

      <main className="main-content container">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<MarketplaceFeed items={filteredItems} isStudentVerified={isStudentVerified} isLoggedIn={!!session} onReport={handleReport} onLikeItem={handleLikeItem} locationFilter={locationFilter} savedItems={savedItems} />} />
            <Route path="/item/:id" element={<ItemDetails items={items} isLoggedIn={!!session} isStudentVerified={isStudentVerified} />} />
            <Route path="/list" element={<RequireAuth session={session}><ListingForm onSubmit={handleAddListing} onCancel={() => navigate('/')} initialData={{ sellerEmail: currentUserEmail }} /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth session={session}><Dashboard items={items} currentUserEmail={currentUserEmail} onMarkSold={handleToggleSold} onDeleteListing={handleDeleteListing} onUpdateListing={handleUpdateListing} /></RequireAuth>} />
            <Route path="/inbox" element={<RequireAuth session={session}><MessagesInbox messages={messages} currentUserEmail={currentUserEmail} onSendMessage={handleSendMessage} /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth session={session}><NotificationsPage notifications={notifications} onMarkRead={handleMarkNotificationRead} /></RequireAuth>} />
            <Route path="/forum" element={<ForumFeed posts={filteredPosts} projects={filteredProjects} comments={comments} userVotes={userVotes} onCreatePost={() => { if (!session) { alert('Please log in.'); navigate('/login'); } else { navigate('/create-post'); } }} onVote={handleVote} onAddComment={handleAddComment} onFriendRequest={handleFriendRequest} currentUserEmail={session?.user?.email || ''} onReport={handleReport} />} />
            <Route path="/create-post" element={<RequireAuth session={session}><ForumPostForm currentUserEmail={currentUserEmail} onSubmit={handleAddPost} onCancel={() => navigate('/forum')} /></RequireAuth>} />
            <Route path="/register" element={<RegistrationForm onComplete={() => navigate('/')} />} />
            <Route path="/login" element={<Login onLoginSuccess={() => navigate('/')} />} />
            <Route path="/profile" element={<RequireAuth session={session}><Profile session={session} /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth session={session}>{session?.user?.email === 'engxedinburgh@gmail.com' ? <AdminDashboard items={items} /> : <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}><h2>Access Denied</h2></div>}</RequireAuth>} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/work" element={<WorkWithUsPage />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <Footer />

      {session && (
        <nav className="mobile-nav">
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🏠</div>
          <div onClick={() => navigate('/forum')} style={{ cursor: 'pointer' }}>💬</div>
          <div onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>🔔</div>
          <div onClick={() => navigate('/inbox')} style={{ cursor: 'pointer' }}>📬</div>
          <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>👤</div>
        </nav>
      )}
      <Analytics />
    </div>
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

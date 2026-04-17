import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { NotificationsPage } from './components/NotificationsPage';
import { UpdatePassword } from './components/UpdatePassword';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import type { MarketplaceItem, ForumPost, Comment, Message, Notification } from './types';
import { supabase } from './lib/supabaseClient';
import './App.css';

const mapItemFromDB = (row: any): MarketplaceItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  sellingPrice: row.price,
  society: row.society,
  type: row.type,
  imageUrl: row.image_url,
  deliveryMethod: row.delivery_method,
  sellerPhone: row.seller_phone,
  views: row.views,
  createdAt: row.created_at
});

const mapItemToDB = (item: any) => ({
  title: item.title,
  description: item.description,
  price: item.sellingPrice,
  society: item.society,
  type: item.type,
  image_url: item.imageUrl,
  delivery_method: item.deliveryMethod,
  seller_email: item.sellerEmail || 'student@ed.ac.uk',
  seller_phone: item.sellerPhone
});

const mapPostFromDB = (row: any): ForumPost => ({
  id: row.id,
  authorEmail: row.author_email,
  title: row.title,
  content: row.content,
  imageUrl: row.image_url,
  stlFileName: row.stl_file_name,
  stlFileUrl: row.stl_file_url,
  upvotes: row.upvotes,
  createdAt: row.created_at,
  tags: row.tags ? String(row.tags).split(',').map(t => t.trim()) : undefined
});

const mapPostToDB = (post: any) => ({
  author_email: post.authorEmail,
  title: post.title,
  content: post.content,
  image_url: post.imageUrl,
  stl_file_name: post.stlFileName,
  stl_file_url: post.stlFileUrl,
  tags: post.tags ? post.tags.join(',') : null
});

function MainApp() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [session, setSession] = useState<any>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [globalProjects, setGlobalProjects] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      const { data: iData } = await supabase.from('items').select('*').order('created_at', { ascending: false });

      const { data: uData } = await supabase.from('users').select('email, university, degree, year_of_study, points');
      const userMap = new Map(uData?.map((u: any) => [u.email, { uni: u.university, deg: u.degree, yr: u.year_of_study, pts: u.points || 0 }]) || []);

      if (active && iData) {
        setItems(iData.map(row => {
          const item = mapItemFromDB(row);
          const u = userMap.get(item.sellerEmail);
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
          const u = userMap.get(post.authorEmail);
          post.origin = u?.uni || '';
          post.degree = u?.deg || '';
          post.yearOfStudy = u?.yr || '';
          post.points = u?.pts || 0;
          return post;
        }));
      }

      const { data: cData } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
      if (active && cData) {
        setComments(cData.map((row: any) => ({
          id: row.id,
          postId: row.post_id,
          authorEmail: row.author_email,
          content: row.content,
          createdAt: row.created_at,
          points: userMap.get(row.author_email)?.pts || 0
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
    let msgSub: any = null;
    let notifSub: any = null;

    const fetchPrivates = async () => {
      if (!session?.user?.email) return;

      const { data: userData } = await supabase.from('users').select('profile_picture_url').eq('email', session.user.email).single();
      if (active && userData) setCurrentUserAvatar(userData.profile_picture_url || '');

      const { data: nData } = await supabase.from('notifications').select('*').eq('user_email', session.user.email).order('created_at', { ascending: false });
      if (active && nData) {
        setNotifications(nData.map((r: any) => ({
          id: r.id, userEmail: r.user_email, type: r.type, message: r.message, read: r.read, createdAt: r.created_at
        })));
      }

      const { data: mData } = await supabase.from('messages')
        .select('*')
        .or(`sender_email.eq.${session.user.email},receiver_email.eq.${session.user.email}`)
        .order('created_at', { ascending: true });
      if (active && mData) {
        setMessages(mData.map((r: any) => ({
          id: r.id, senderEmail: r.sender_email, receiverEmail: r.receiver_email, content: r.content, read: r.read, createdAt: r.created_at
        })));
      }

      msgSub = supabase.channel('realtime-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const r = payload.new;
          if (r.sender_email === session.user.email || r.receiver_email === session.user.email) {
            setMessages(prev => [...prev.filter(m => m.id !== r.id), {
              id: r.id, senderEmail: r.sender_email, receiverEmail: r.receiver_email, content: r.content, read: r.read, createdAt: r.created_at
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
      }, 3600000); // 1 hour globally
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

  const handleMarkSold = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isSold: true } : item
    ));
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

    // Gamification Increment
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

    let newDelta = 0;
    let finalVoteStatus = 0;

    if (currentVote === delta) {
      newDelta = -delta;
      finalVoteStatus = 0;
    } else {
      newDelta = delta - currentVote;
      finalVoteStatus = delta;
    }

    if (delta > 0) new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3').play().catch(() => { });
    else new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3').play().catch(() => { });

    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const newVotesMap = { ...userVotes, [postId]: finalVoteStatus };
    setUserVotes(newVotesMap);
    localStorage.setItem(`votes_${session.user.id}`, JSON.stringify(newVotesMap));

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + newDelta } : p));
    await supabase.from('posts').update({ upvotes: currentPost.upvotes + newDelta }).eq('id', postId);
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!session) return;
    const payload = {
      post_id: postId,
      author_email: session.user.email,
      content: content
    };

    // Gamification Increment
    if (session) {
      const { data: userData } = await supabase.from('users').select('points').eq('email', session.user.email).single();
      await supabase.from('users').update({ points: (userData?.points || 0) + 5 }).eq('email', session.user.email);
    }

    const { data, error } = await supabase.from('comments').insert([payload]).select();
    if (!error && data && data.length > 0) {
      new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3').play().catch(() => { });
      const newComment = {
        id: data[0].id,
        postId: data[0].post_id,
        authorEmail: data[0].author_email,
        content: data[0].content,
        createdAt: data[0].created_at
      };
      setComments(prev => [...prev, newComment]);

      const postAuthor = posts.find(p => p.id === postId)?.authorEmail;
      if (postAuthor && postAuthor !== session.user.email) {
        supabase.from('notifications').insert([{ user_email: postAuthor, type: 'comment', message: `${session.user.email} commented on your post` }]).then();
      }

    } else {
      console.error(error);
      alert('Failed to post comment. Ensure the comments table exists in Supabase.');
    }
  };

  const handleSendMessage = async (receiver: string, content: string) => {
    if (!session) return;
    const payload = { sender_email: session.user.email, receiver_email: receiver, content };
    const { data, error } = await supabase.from('messages').insert([payload]).select();
    if (!error && data && data.length > 0) {
      const newMsg = { id: data[0].id, senderEmail: data[0].sender_email, receiverEmail: data[0].receiver_email, content: data[0].content, read: data[0].read, createdAt: data[0].created_at };
      setMessages(prev => [...prev, newMsg]);

      supabase.from('notifications').insert([{ user_email: receiver, type: 'message', message: `${session.user.email} sent you a direct message` }]).then();
    }
  };

  const handleReport = async (itemId: string, itemType: string, reason: string) => {
    if (!session) { alert('Logs require authentication.'); return; }
    const payload = { item_id: itemId, item_type: itemType, reason, reported_by: session.user.email };
    const { error } = await supabase.from('reports').insert([payload]);
    if (!error) alert('Report definitively submitted. Our administrators will review this safely shortly.');
    else alert('Failed to successfully submit report sequence. Database Error: ' + error.message);
  };

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <div className="app-container">
      <Helmet>
        <title>engXchange | Engineering Marketplace & Forum</title>
        <meta name="description" content="The premier decentralized marketplace and social forum designed specifically for engineering students to buy, sell, and collaborate on heavy projects." />
      </Helmet>

      <Navbar
        isLoggedIn={!!session}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogoutClick={() => { supabase.auth.signOut(); navigate('/'); }}
        suggestions={items.map(i => i.title)}
        notifications={notifications}
        avatarUrl={currentUserAvatar}
      />

      <main className="main-content container">
        <Routes>
          <Route path="/" element={<MarketplaceFeed items={filteredItems} isStudentVerified={isStudentVerified} isLoggedIn={!!session} onReport={handleReport} />} />
          <Route path="/list" element={
            <RequireAuth>
              <ListingForm onSubmit={handleAddListing} onCancel={() => navigate('/')} />
            </RequireAuth>
          } />
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard items={items} currentUserEmail={currentUserEmail} onMarkSold={handleMarkSold} />
            </RequireAuth>
          } />
          <Route path="/inbox" element={
            <RequireAuth>
              <MessagesInbox messages={messages} currentUserEmail={currentUserEmail} onSendMessage={handleSendMessage} />
            </RequireAuth>
          } />
          <Route path="/notifications" element={
            <RequireAuth>
              <NotificationsPage notifications={notifications} />
            </RequireAuth>
          } />
          <Route path="/forum" element={
            <ForumFeed posts={posts} projects={globalProjects} comments={comments} userVotes={userVotes} onCreatePost={() => {
              if (!session) { alert('Please log in.'); navigate('/login'); }
              else { navigate('/create-post'); }
            }} onVote={handleVote} onAddComment={handleAddComment} currentUserEmail={session?.user?.email || ''} onReport={handleReport} />
          } />
          <Route path="/create-post" element={
            <RequireAuth>
              <ForumPostForm currentUserEmail={currentUserEmail} onSubmit={handleAddPost} onCancel={() => navigate('/forum')} />
            </RequireAuth>
          } />
          <Route path="/register" element={<RegistrationForm onComplete={() => navigate('/')} />} />
          <Route path="/login" element={<Login onLoginSuccess={() => navigate('/')} />} />
          <Route path="/profile" element={
            <RequireAuth>
              <Profile session={session} />
            </RequireAuth>
          } />
          <Route path="/admin" element={
            <RequireAuth>
              {session?.user?.email === 'engxedinburgh@gmail.com' ? <AdminDashboard /> : <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}><h2>Access Completely Denied</h2><p>You do not have overriding administrative privileges to perform queue tracking here.</p></div>}
            </RequireAuth>
          } />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/work" element={<WorkWithUsPage />} />
        </Routes>
      </main>
      <Footer />
      {session && (
        <nav className="mobile-nav">
          <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem' }}>🏠</span><span style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 500 }}>Home</span>
          </div>
          <div onClick={() => navigate('/forum')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem' }}>💬</span><span style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 500 }}>Forum</span>
          </div>
          <div onClick={() => navigate('/notifications')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem', position: 'relative' }}>
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '0.1rem 0.3rem', borderRadius: '50%' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 500 }}>Alerts</span>
          </div>
          <div onClick={() => navigate('/inbox')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem' }}>📬</span><span style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 500 }}>DM</span>
          </div>
          <div onClick={() => navigate('/profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '1.2rem' }}>👤</span><span style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: 500 }}>Profile</span>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <MainApp />
      </Router>
    </HelmetProvider>
  );
}

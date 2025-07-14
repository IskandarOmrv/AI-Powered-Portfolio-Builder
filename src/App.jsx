import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

// PAGES
import MainPage from './pages/MainPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Login from './pages/Authorization/LogIn';
import SignUp from './pages/Authorization/SignUp';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/Authorization/ResetPassword';
import ForumPage from './pages/ForumPage';
import PortfolioPreview from './pages/PortfolioPerview'
import Settings from './pages/AccountSettings'
import UserManagement from './pages/admin/UserManagement'
import PortfolioManagement from './pages/admin/PortfolioManagement'
import Stats from './pages/admin/Stats'
import AdminNav from './pages/admin/AdminNav'
import Banned from './pages/Banned'
import Pricing from './pages/PricingPage'
import NotFound from './pages/NotFound'
import ForumCV from './pages/CV Builder/ForumPageResume'
import PDFView from './pages/CV Builder/ResumePDFview'
import BlogList from './pages/Blog/BlogList';
import BlogCreate from './pages/Blog/BlogCreate';
import BlogDetail from './pages/Blog/BlogDetail';


const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setProfile(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error) setProfile(data);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) await fetchUserProfile(session.user.id);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id).finally();
      else {
        setProfile(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/banned" element={<Banned />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forumpage" element={<ForumPage />} />
        <Route path="/blog" element={<BlogList currentUser={profile} />} />
        <Route path="/blog/new" element={<BlogCreate currentUser={profile} />} />
        <Route path="/blog/:id" element={<BlogDetail currentUser={profile} />} />
        <Route path="/forumpage_resume" element={<ForumCV />} />
        <Route path="/resume/view_resume/:id" element={<PDFView />} />
        <Route path="/portfolio-preview" element={<PortfolioPreview />} />
        <Route path="/portfolio/:id" element={<PortfolioPreview />} />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/dashboard"
          element={session ? <Dashboard profile={profile} /> : <MainPage />}
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={
          session && profile?.role === 'admin'
            ? <AdminNav />
            : <Dashboard />
        }>
          <Route index element={<UserManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="portfolios" element={<PortfolioManagement />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>

    </Router>
  );
};

export default App;

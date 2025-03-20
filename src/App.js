import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Account from './pages/Account';
import JobList from './pages/JobList';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/jobs" />} />
        <Route path="/account" element={session ? <Account session={session} /> : <Navigate to="/login" />} />
        <Route path="/jobs" element={session ? <JobList session={session} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

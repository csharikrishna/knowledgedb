import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import GraphExplorer from './pages/GraphExplorer';
import SearchInterface from './pages/SearchInterface';
import MemoryBrowser from './pages/MemoryBrowser';
import GraphRAGTester from './pages/GraphRAGTester';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Features from './pages/Features';
import GettingStarted from './pages/GettingStarted';
import APIReference from './pages/APIReference';
import Pricing from './pages/Pricing';
import Documentation from './pages/Documentation';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import License from './pages/License';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [dbName, setDbName] = useState(localStorage.getItem('dbName'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (userId) {
      localStorage.setItem('userId', userId);
    }
    if (dbName) {
      localStorage.setItem('dbName', dbName);
    }
  }, [token, userId, dbName]);

  return (
    <Router>
      <div className="app">
        {token && <Navbar token={token} onLogout={() => { setToken(null); localStorage.clear(); }} />}
        
        <main className={token ? "main-content" : ""}>
          <Routes>
            {/* Public routes - Marketing pages with footer */}
            <Route 
              path="/" 
              element={
                !token ? (
                  <div className="page-with-footer">
                    <Welcome />
                  </div>
                ) : (
                  <Navigate to="/dashboard" />
                )
              } 
            />
            <Route 
              path="/features" 
              element={
                <div className="page-with-footer">
                  <Features />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/getting-started" 
              element={
                <div className="page-with-footer">
                  <GettingStarted />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/api-reference" 
              element={
                <div className="page-with-footer">
                  <APIReference />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <div className="page-with-footer">
                  <Pricing />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/documentation" 
              element={
                <div className="page-with-footer">
                  <Documentation />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/support" 
              element={
                <div className="page-with-footer">
                  <Support />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/privacy" 
              element={
                <div className="page-with-footer">
                  <PrivacyPolicy />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/terms" 
              element={
                <div className="page-with-footer">
                  <TermsOfService />
                  <Footer />
                </div>
              } 
            />
            <Route 
              path="/license" 
              element={
                <div className="page-with-footer">
                  <License />
                  <Footer />
                </div>
              } 
            />
            
            {/* Auth routes */}
            <Route path="/login" element={!token ? <Login onLogin={(t, id) => { setToken(t); setUserId(id); }} /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/reset-password" element={!token ? <ResetPassword /> : <Navigate to="/dashboard" />} />
            
            {/* Protected routes - Dashboard and other authenticated pages */}
            {token ? (
              <>
                <Route path="/dashboard" element={<Dashboard token={token} userId={userId} dbName={dbName} onDbSelect={setDbName} />} />
                <Route path="/graph" element={<GraphExplorer token={token} userId={userId} dbName={dbName} />} />
                <Route path="/search" element={<SearchInterface token={token} userId={userId} dbName={dbName} />} />
                <Route path="/memory" element={<MemoryBrowser token={token} userId={userId} dbName={dbName} />} />
                <Route path="/ask" element={<GraphRAGTester token={token} userId={userId} dbName={dbName} />} />
                <Route path="/admin" element={<AdminPanel token={token} />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

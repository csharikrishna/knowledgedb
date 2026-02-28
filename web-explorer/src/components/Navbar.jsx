import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Network, Search, Brain, Zap, Settings, LogOut } from 'lucide-react';
import './Navbar.css';

function Navbar({ token, onLogout }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Brain size={24} /> KnowledgeDB Explorer
        </Link>
        
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={24} />
        </button>
        
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link">
            <Home size={18} /> Dashboard
          </Link>
          <Link to="/graph" className="nav-link">
            <Network size={18} /> Graph
          </Link>
          <Link to="/search" className="nav-link">
            <Search size={18} /> Search
          </Link>
          <Link to="/memory" className="nav-link">
            <Brain size={18} /> Memory
          </Link>
          <Link to="/ask" className="nav-link">
            <Zap size={18} /> GraphRAG
          </Link>
          <Link to="/admin" className="nav-link">
            <Settings size={18} /> Admin
          </Link>
          <button className="nav-link logout" onClick={() => { onLogout(); setMenuOpen(false); }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

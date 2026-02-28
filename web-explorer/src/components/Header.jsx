import React, { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Code, Zap } from 'lucide-react';
import './Header.css';

export default function Header({ 
  title = "Welcome to KnowledgeDB", 
  subtitle = "Transform Your Data Into Intelligent Knowledge",
  showCTA = true,
  ctaText = "Explore Now",
  ctaLink = "/features",
  height = "full"
}) {
  const headerRef = useRef(null);
  const canvasRef = useRef(null);

  // Animated background canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6'
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around canvas
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.radius, particle.radius);
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1;
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Mouse tracking effect (can be used for future interactive features)
  const handleMouseMove = () => {
    // Mouse tracking effect placeholder for future enhancements
  };

  const handleCtaClick = () => {
    if (ctaLink.startsWith('/')) {
      window.location.href = ctaLink;
    } else {
      window.open(ctaLink, '_blank');
    }
  };

  return (
    <div 
      className={`innovative-header header-${height}`}
      ref={headerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Canvas Background with Particles */}
      <canvas ref={canvasRef} className="header-canvas"></canvas>

      {/* Gradient Overlay */}
      <div className="header-gradient-overlay"></div>

      {/* Animated Background Orbs */}
      <div className="header-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb-glow"></div>
      </div>

      {/* Glassmorphic Content Container */}
      <div className="header-content">
        {/* Animated Top Badge */}
        <div className="header-badge">
          <Sparkles size={16} />
          <span>Next Generation Knowledge Platform</span>
          <Sparkles size={16} />
        </div>

        {/* Main Title with Animated Text */}
        <div className="header-title-wrapper">
          <h1 className="header-title">
            <span className="title-segment segment-1">{title.split(' ')[0]}</span>
            {title.includes(' ') && (
              <>
                <span className="title-segment segment-2">
                  {title.split(' ').slice(1, -2).join(' ')}
                </span>
                <span className="title-segment segment-3 gradient-text">
                  {title.split(' ').slice(-2).join(' ')}
                </span>
              </>
            )}
          </h1>
        </div>

        {/* Animated Subtitle */}
        <p className="header-subtitle">
          {subtitle.split(' ').map((word, idx) => (
            <span key={idx} style={{ '--delay': `${idx * 0.05}s` }}>
              {word}
            </span>
          ))}
        </p>

        {/* Stats Row */}
        <div className="header-stats-row">
          <div className="stat-item">
            <Code size={20} />
            <div>
              <span className="stat-value">22+</span>
              <span className="stat-label">APIs</span>
            </div>
          </div>
          <div className="stat-item">
            <Zap size={20} />
            <div>
              <span className="stat-value">&lt;50ms</span>
              <span className="stat-label">Response</span>
            </div>
          </div>
          <div className="stat-item">
            <Sparkles size={20} />
            <div>
              <span className="stat-value">100%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        {showCTA && (
          <div className="header-cta-group">
            <button className="cta-primary" onClick={handleCtaClick}>
              <span>{ctaText}</span>
              <ArrowRight size={18} />
            </button>
            <button className="cta-secondary">
              Watch Demo
            </button>
          </div>
        )}

        {/* Floating Code Example */}
        <div className="header-code-float">
          <div className="code-block">
            <div className="code-header">
              <span>api.ts</span>
              <span className="code-circle"></span>
            </div>
            <div className="code-content">
              <span className="code-keyword">const</span> result = <span className="code-keyword">await</span> kdb.<span className="code-function">search</span>('<span className="code-string">knowledge</span>');
              <br />
              <span className="code-comment">{'// AI-powered results'}</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-dot"></div>
          <p>Scroll to explore</p>
        </div>
      </div>

      {/* Animated Grid Background */}
      <div className="header-grid"></div>
    </div>
  );
}

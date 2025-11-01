import { useState, useEffect } from 'react';
import './Hero.css';
import AuthModal from '../components/AuthModal';
import aboutVideo from '../assets/map.mp4';
import { TextHoverEffect } from '../components/ui/text-hover-effect';

const Hero = ({ onEnterMap }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: '🗺️',
      title: 'AI-Powered Safe Routes',
      description: 'Gemini-powered AI analyzes real-time news and incidents to suggest the safest path to your destination',
    },
    {
      icon: '💬',
      title: 'Zero Friction Access',
      description: 'Share routes instantly via WhatsApp - no learning curve, just intuitive navigation everyone knows',
    },
    {
      icon: '🛡️',
      title: 'Safety Scoring',
      description: 'Real-time safety scores based on recent crime reports, accidents, and community incidents',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container">
      {/* Floating gradient orbs */}
      <div className="gradient-orb orb-1" style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}></div>
      <div className="gradient-orb orb-2" style={{ transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)` }}></div>
      <div className="gradient-orb orb-3" style={{ transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)` }}></div>

      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <span className="logo-text">PathSafe</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
            <a href="#pricing">Pricing</a>
            <button onClick={onEnterMap} className="nav-cta">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge fade-in">
            <span className="badge-dot"></span>
            AI-Powered Navigation
          </div>
          <h1 className="hero-title fade-in-delay-1">
            Navigate with
            <span className="gradient-text"> Confidence</span>
          </h1>
          <p className="hero-subtitle fade-in-delay-2">
            Your safety is our priority. Discover the safest routes powered by real-time AI analysis
            and seamless WhatsApp integration.
          </p>
          <div className="hero-cta fade-in-delay-3">
            <button onClick={onEnterMap} className="primary-btn">
              Start Exploring
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M10 5l5 5-5 5"/>
              </svg>
            </button>
            <button onClick={() => setShowAuthModal(true)} className="secondary-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
              </svg>
              Sign Up for Updates
            </button>
          </div>
        </div>

        {/* Globe Visualization */}
        <div className="hero-visual">
          <div className="globe-container">
            <div className="globe">
              <div className="globe-grid"></div>
              <div className="globe-grid globe-grid-2"></div>
              <div className="globe-points">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="globe-point"
                    style={{
                      '--angle': `${i * 45}deg`,
                      '--delay': `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
              <div className="globe-route"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">25+</div>
          <div className="stat-label">Safe Routes Generated</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">99%</div>
          <div className="stat-label">Safety Accuracy</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Real-Time Monitoring</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">10k+</div>
          <div className="stat-label">Cities Covered</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose PathSafe</h2>
          <p className="section-subtitle">
            Cutting-edge technology meets intuitive design for your peace of mind
          </p>
        </div>

        {/* Feature Carousel */}
        <div className="features-carousel">
          <div className="carousel-container">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${index === currentFeature ? 'active' : ''}`}
                style={{ '--index': index }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="carousel-indicators">
            {features.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentFeature ? 'active' : ''}`}
                onClick={() => setCurrentFeature(index)}
                aria-label={`Feature ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple, fast, and intelligent route planning</p>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">01</div>
            <h3 className="step-title">Enter Destination</h3>
            <p className="step-description">
              Simply type or select where you want to go on our interactive map
            </p>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">02</div>
            <h3 className="step-title">Fetch Incidents</h3>
            <p className="step-description">
              Fetch and Receive past safety specific incidents for calculating safety scores
            </p>
          </div>
          <div className="step-item">
            <div className="step-number">03</div>
            <h3 className="step-title">AI Analysis</h3>
            <p className="step-description">
              Our Gemini-powered AI analyzes multiple routes and safety data in real-time
            </p>
          </div>
          <div className="step-connector"></div>

          <div className="step-item">
            <div className="step-number">04</div>
            <h3 className="step-title">Safe Route</h3>
            <p className="step-description">
              Receive the safest route with detailed safety scores and recommendations
            </p>
          </div>
          <div className="step-connector"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-content">
          <div className="about-visual">
            <video src={aboutVideo} autoPlay loop muted playsInline className="about-video"/>
            {/* <div className="about-grid">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="grid-cell"></div>
              ))}
            </div> */}
            {/* <div className="about-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M40 5L70 25V55L40 75L10 55V25L40 5Z" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3"/>
                <circle cx="40" cy="40" r="15" fill="currentColor" opacity="0.6"/>
              </svg>
            </div> */}
          </div>
          <div className="about-text">
            <h2 className="section-title" style={{textAlign: 'left'}}>About PathSafe</h2>
            <p className="about-description">
              PathSafe represents a new era in navigation technology, where artificial intelligence 
              meets real-world safety concerns.  
            </p>
            <div className="about-features">
              <div className="about-feature-item">
                <div className="about-feature-icon">🔒</div>
                <div>
                  <h4>Privacy First</h4>
                  <p>Your location data remains secure and private at all times</p>
                </div>
              </div>
              <div className="about-feature-item">
                <div className="about-feature-icon">🌍</div>
                <div>
                  <h4>Global Reach</h4>
                  <p>Works seamlessly across cities worldwide with localized intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-subtitle">
            Flexible pricing options designed to keep you safe, wherever you go
          </p>
        </div>
        <div className="pricing-grid">
          {/* Free Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Free</h3>
              <div className="pricing-price">
                <span className="price-amount">₹0</span>
                <span className="price-period">/month</span>
              </div>
              <p className="pricing-description">Perfect for occasional travelers</p>
            </div>
            <ul className="pricing-features">
              <li>✅ Basic route planning</li>
              <li>✅ Safety scores</li>
              <li>✅ 10 routes per month</li>
            </ul>
            <button onClick={onEnterMap} className="pricing-btn secondary">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-header">
              <h3 className="pricing-title">Pro</h3>
              <div className="pricing-price">
                <span className="price-amount">₹999</span>
                <span className="price-period">/month</span>
              </div>
              <p className="pricing-description">For frequent travelers and commuters</p>
            </div>
            <ul className="pricing-features">
              <li>✅ Unlimited routes</li>
              <li>✅ Guardian support</li>
              <li>✅ Advanced AI analysis</li>
              <li>✅ Real-time updates</li>
              <li>✅ Priority support</li>

            </ul>
            <button onClick={() => window.open('https://wa.me/918688284400', '_blank')} className="pricing-btn primary" >
                Contact Sales
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Enterprise</h3>
              <div className="pricing-price">
                <span className="price-amount">₹3499</span>
                <span className="price-period">/month</span>
              </div>
              <p className="pricing-description">For teams and organizations</p>
            </div>
            <ul className="pricing-features">
              <li>✅ Everything in Pro</li>
              <li>✅ Team management</li>
              <li>✅ Custom integrations</li>
              <li>✅ Dedicated support</li>
              <li>✅ API access</li>
              <li>✅ Advanced analytics</li>
            </ul>
            <button onClick={() => window.open('https://wa.me/918688284400', '_blank')} className="pricing-btn secondary">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title ">PathSafe for Business: A Smarter Way to Safety</h2>
          <p className="cta-subtitle">
          Stay Safe. Save Money. Simplify Compliance. Get PathSafe
          </p>
          <button onClick={() => window.open('https://wa.me/918688284400', '_blank')} className="cta-button">
            Contact Us
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M10 5l5 5-5 5"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Text Hover Effect */}
      <section className="text-hover-section">
        <div className="text-hover-container">
          <TextHoverEffect text="PathSafe" duration={0.3} />
        </div>
      </section>        
      <div className="footer-bottom">
          <p>© 2025 PathSafe. All rights reserved.</p>
        </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(data) => {
          console.log('Auth success:', data);
          // Token is already stored in AuthModal component
          // Additional actions can be added here (e.g., redirect, update UI)
        }}
      />
    </div>
  );
};

export default Hero;


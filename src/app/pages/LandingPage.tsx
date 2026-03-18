import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

// SVG Icons for socials and arrows
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
);

const ChartUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-5.1-5.1" /><path d="M21 16v-6" /><path d="M21 16h-6" /><path d="M3 8c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5Z" /><path d="M9.8 12.3c-1.3-1.6-3.2-2.7-5.3-2.7H3" /></svg>
);


const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>
);

const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 12 12 17 22 12" /><polyline points="2 17 12 22 22 17" /></svg>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page-wrapper">
      <div className="hero-section">
        <div className="hero-accent"></div>

        {/* Background Image & Overlay */}
        <div className="hero-bg-image"></div>
        <div className="hero-bg-overlay"></div>

        {/* Navbar */}
        <nav className="hero-navbar">
          <Link to="/" className="hero-nav-logo">
            {/* Attempt to load Remsana logo or fallback */}
            <img src="/assets/remsana-logo.png" alt="Remsana" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = 'Remsana'; }} />
          </Link>

          <div className="hero-nav-links">
            <Link to="/" className="active">Home</Link>
            <Link to="#about">About Us</Link>
            <Link to="#services">Services</Link>
            <a href="#blog">Blog</a>
            <Link to="#contact">Contact</Link>
          </div>

          <div className="hero-nav-actions">
            <button className="btn-signin" onClick={() => navigate('/login')}>Sign in</button>
            <button className="btn-signup" onClick={() => navigate('/register')}>Sign up</button>
          </div>
        </nav>

        {/* Hero Split Content */}
        <main className="hero-content">
          <div className="hero-left-col">
            <div className="company-badge">Your Complete Business-Building Platform</div>

            <h1 className="hero-title">
              From Idea to <br />
              <span>Thriving Business</span> <br />
              in 100 Days
            </h1>

            <p className="hero-description">
              Remsana empowers African SMEs with everything needed to formalize, grow, and thrive business registration, banking, credit access, and expert guidance, all in one platform.
            </p>

            <div className="hero-actions-row">
              <a href="#register" className="btn-get-started">
                Get Started Free
              </a>
              <a href="#demo" className="btn-watch-demo">
                <PlayIcon /> Watch Demo
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h3>42M</h3>
                <p>SMEs in Nigeria</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <h3>80%</h3>
                <p>Still Unregistered</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <h3>$140B</h3>
                <p>Funding Gap</p>
              </div>
            </div>
          </div>
          {/* Right col is empty because the background image fills this space */}
        </main>
      </div>

      {/* Built for Real Impact Section */}
      <section className="impact-section" id="impact">
        <div className="impact-container">
          <div className="impact-header">
            <span className="section-badge">Impact</span>
            <h2>Built for <span>Real Impact</span></h2>
            <p className="section-subtitle">Everything you need to launch, manage, and scale your business seamlessly.</p>
          </div>

          {/* Row 1: Image Left + 2 Metrics Right */}
          <div className="impact-showcase">
            <div className="impact-image-block">
              <img
                src="/assets/impact-hero.png"
                alt="African woman entrepreneur working on her laptop"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800'; }}
              />
              <div className="image-accent-line"></div>
            </div>
            <div className="impact-metrics-stack">
              <div className="impact-metric">
                <div className="metric-number">100<span>Days</span></div>
                <h3>100 Days to Business Success</h3>
                <p>Our structured program gets you from zero to operational in just 100 days</p>
                {/* <a href="#learn-more" className="metric-link">Learn more <ArrowRight /></a> */}
              </div>
              <div className="metric-divider"></div>
              <div className="impact-metric">
                <div className="metric-number">₦5M</div>
                <h3>Available Credit Access</h3>
                <p>Through Bank of Industry partnerships and NYSC schemes</p>
                {/* <a href="#learn-more" className="metric-link">Learn more <ArrowRight /></a> */}
              </div>
            </div>
          </div>

          {/* Row 2: 2 Metrics Left + Image Right */}
          <div className="impact-showcase impact-showcase-reverse">
            <div className="impact-image-block">
              <img
                src="/assets/impact-team.png"
                alt="African entrepreneurs collaborating at a modern office"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1531123414780-e3746fe2dc25?auto=format&fit=crop&q=80&w=800'; }}
              />
              <div className="image-accent-line"></div>
            </div>
            <div className="impact-metrics-stack">
              <div className="impact-metric">
                <div className="metric-number">15%</div>
                <h3>Monthly Conversion</h3>
                <p>Free users becoming paid subscribers proof of value delivered</p>
                {/* <a href="#learn-more" className="metric-link">Learn more <ArrowRight /></a> */}
              </div>
              <div className="metric-divider"></div>
              <div className="impact-metric">
                <div className="metric-number">80%</div>
                <h3>Cost Savings</h3>
                <p>Compared to traditional consulting fees for business setup</p>
                {/* <a href="#learn-more" className="metric-link">Learn more <ArrowRight /></a> */}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Everything Your Business Needs Section */}
      <section className="business-needs-section" id="business-needs">
        <div className="needs-header">
          <h2>Everything Your Business Needs to Succeed</h2>
          <p>One integrated platform that removes the barriers between you and business success.</p>
        </div>

        <div className="needs-grid">
          {/* Card 1: Registration */}
          <div className="need-card">
            <div className="need-image">
              <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800" alt="Business Registration" />
            </div>
            <div className="need-content">
              <div className="need-icon-wrapper">
                <BuildingIcon />
              </div>
              <h3>Business Registration Made Simple</h3>
              <p>Guided step-by-step process to register with CAC. We handle the complexity, you focus on your vision.</p>
            </div>
          </div>

          {/* Card 2: Banking */}
          <div className="need-card">
            <div className="need-image">
              <img src="/assets/Instant-Banking.jpg" alt="Instant Banking Access" />
            </div>
            <div className="need-content">
              <div className="need-icon-wrapper">
                <WalletIcon />
              </div>
              <h3>Instant Banking Access</h3>
              <p>Seamless integration with ALAT Bank. Open a business account in minutes, not weeks.</p>
            </div>
          </div>

          {/* Card 3: Credit */}
          <div className="need-card">
            <div className="need-image">
              <img src="/assets/Credit-Facilitation.jpg" alt="Credit Facilitation" />
            </div>
            <div className="need-content">
              <div className="need-icon-wrapper">
                <ChartUpIcon />
              </div>
              <h3>Credit Facilitation</h3>
              <p>Access Bank of Industry loans (₦2B NYSC scheme) and other financing options tailored to your needs.</p>
            </div>
          </div>

          {/* Card 4: Coaching */}
          <div className="need-card">
            <div className="need-image">
              <img src="/assets/100-days-coaching.jpg" alt="Coaching Program" />
            </div>
            <div className="need-content">
              <div className="need-icon-wrapper">
                <GraduationCapIcon />
              </div>
              <h3>100-Day Coaching Program</h3>
              <p>Expert-guided daily lessons, tasks, and accountability to build a sustainable business foundation.</p>
            </div>
          </div>

          {/* Card 5: Operational Tools */}
          <div className="need-card">
            <div className="need-image">
              <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800" alt="Operational Tools" />
            </div>
            <div className="need-content">
              <div className="need-icon-wrapper">
                <LayersIcon />
              </div>
              <h3>Operational Excellence Tools</h3>
              <p>Branding, website builder, invoicing, bookkeeping—everything to run your business professionally.</p>
            </div>
          </div>

          {/* Card 6: Community */}
          <div className="need-card">
            <div className="need-image">
              <img src="/assets/Thriving-Community.jpg" alt="Thriving Community" />
            </div>
            <div className="need-content">
              <div className="need-icon-wrapper">
                <UsersIcon />
              </div>
              <h3>Thriving Community</h3>
              <p>Connect with fellow entrepreneurs, share experiences, find mentors, and grow together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey from Idea to Impact Section (Zigzag Layout) */}
      <section className="journey-zigzag-section" id="journey">
        <div className="section-container">
          <div className="journey-header">
            <span className="section-badge">How It Works</span>
            <h2>Your Journey From <span>Idea to Impact</span></h2>
            <p className="section-subtitle">We've streamlined the entire process into five clear milestones. No confusion, no delays—just results.</p>
          </div>

          <div className="zigzag-container">
            {/* Step 1 */}
            <div className="zigzag-row">
              <div className="zigzag-image-col">
                <div className="image-wrapper">
                  <img src="/assets/journey_step1_signup.png" alt="Sign Up & Assess" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800'; }} />
                  <div className="floating-number">01</div>
                </div>
              </div>
              <div className="zigzag-content-col">
                <div className="step-label">Initial Milestone</div>
                <h3>Sign Up & Assess</h3>
                <p>Create your free account and complete our business readiness assessment. Our AI-driven tool analyzes your idea and provides a personalized roadmap to success.</p>
                <div className="step-features">
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Readiness Audit</div>
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Growth Roadmap</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="zigzag-row">
              <div className="zigzag-image-col">
                <div className="image-wrapper">
                  <img src="/assets/journey_step2_register.png" alt="Register Your Business" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800'; }} />
                  <div className="floating-number">02</div>
                </div>
              </div>
              <div className="zigzag-content-col">
                <div className="step-label">Legal Foundation</div>
                <h3>Register Your Business</h3>
                <p>Follow our guided process to register with CAC. We simplify the complex legal paperwork, handle submissions, and ensure your business is formal and compliant.</p>
                <div className="step-features">
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> CAC Expert Filing</div>
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Tax Compliance</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="zigzag-row">
              <div className="zigzag-image-col">
                <div className="image-wrapper">
                  <img src="/assets/Connect-Banking-Credit.jpg" alt="Connect Banking & Credit" />
                  <div className="floating-number">03</div>
                </div>
              </div>
              <div className="zigzag-content-col">
                <div className="step-label">Financial Access</div>
                <h3>Connect Banking & Credit</h3>
                <p>Open your ALAT business account and apply for financing through Bank of Industry partnerships. We bridge the gap between your ambition and the capital you need.</p>
                <div className="step-features">
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Instant Onboarding</div>
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Low-Interest Credit</div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="zigzag-row">
              <div className="zigzag-image-col">
                <div className="image-wrapper">
                  <img src="/assets/journey_step4_launch.png" alt="Build & Launch" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800'; }} />
                  <div className="floating-number">04</div>
                </div>
              </div>
              <div className="zigzag-content-col">
                <div className="step-label">Market Entry</div>
                <h3>Build & Launch</h3>
                <p>Use our integrated tools to create your brand identity, build professional web presence, and set up your operational stack for immediate customer impact.</p>
                <div className="step-features">
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Brand Builder</div>
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Digital Storefront</div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="zigzag-row">
              <div className="zigzag-image-col">
                <div className="image-wrapper">
                  <img src="/assets/Grow-with-Guidance.jpg" alt="Grow with Guidance" />
                  <div className="floating-number">05</div>
                </div>
              </div>
              <div className="zigzag-content-col">
                <div className="step-label">Scale & Thrive</div>
                <h3>Grow with Guidance</h3>
                <p>Engage in our intensive 100-day coaching program. Benefit from 1:1 mentorship, shared community experiences, and systematic scaling strategies to ensure long-term sustainability.</p>
                <div className="step-features">
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Expert Mentorship</div>
                  <div className="feature-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Community Network</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Growth Path Section */}
      <section className="pricing-section" id="pricing">
        <div className="section-container">
          <div className="pricing-header">
            <span className="section-badge">Pricing Plans</span>
            <h2>Choose Your <span>Growth Path</span></h2>
            <p className="section-subtitle">Start free and scale as you grow. All plans include community support and core features to help you succeed.</p>
          </div>

          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">₦0<span>/forever</span></div>
              <p className="plan-desc">Perfect for exploring and planning your business</p>
              <button className="btn-pricing btn-outline">Get Started Free</button>
              <ul className="plan-features">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Business name registration guide</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Free website builder (1 page)</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom domain attachment</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Assessment quiz & sample coaching</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Community access</li>
              </ul>
            </div>

            {/* Starter Plan */}
            <div className="pricing-card featured">
              <div className="popular-badge">Most Popular</div>
              <div className="plan-name">Starter</div>
              <div className="plan-price">₦1,250<span>/month</span></div>
              <p className="plan-desc">For traders ready to formalize and grow</p>
              <button className="btn-pricing btn-primary">Start Growing</button>
              <ul className="plan-features">
                <li className="feature-group">Everything in Free, plus:</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Full 100-day coaching program</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Logo generator & branding tools</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Website builder (up to 5 pages)</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Basic invoicing (20/month)</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Business registration support</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card">
              <div className="plan-name">Pro</div>
              <div className="plan-price">₦4,999<span>/month</span></div>
              <p className="plan-desc">For scaling businesses seeking efficiency</p>
              <button className="btn-pricing btn-outline">Go Pro</button>
              <ul className="plan-features">
                <li className="feature-group">Everything in Starter, plus:</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Premium branding guidelines</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlimited website pages</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlimited invoicing</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Basic bookkeeping & P&L</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Mentorship matching</li>
              </ul>
            </div>

            {/* Business Plan */}
            <div className="pricing-card">
              <div className="plan-name">Business</div>
              <div className="plan-price">₦9,999<span>/month</span></div>
              <p className="plan-desc">For serious growth and credit access</p>
              <button className="btn-pricing btn-outline">Scale Up</button>
              <ul className="plan-features">
                <li className="feature-group">Everything in Pro, plus:</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Advanced bookkeeping & Tax filing</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> CRM with automation</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> BoI loan facilitation</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Dedicated Success coach</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Advanced analytics & API</li>
              </ul>
            </div>
          </div>

          <div className="pricing-footer">
            <p className="billing-note">All plans are billed monthly. Cancel anytime. Need custom enterprise solutions? <a href="#contact">Contact us</a></p>
            <div className="social-proof">
              <span className="sparkle">✨</span> Join 400,000+ African Entrepreneurs already growing with Remsana
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog-section" id="blog">
        <div className="blog-container">
          <div className="blog-header">
            <span className="section-badge">Blog & Insights</span>
            <h2>Latest from Our <span>Blog</span></h2>
            <p className="section-subtitle">Insights, tips, and stories to help African entrepreneurs build, fund, and grow their businesses.</p>
          </div>

          <div className="blog-grid">
            {/* Blog Post 1 */}
            <article className="blog-card">
              <div className="blog-image-wrapper">
                <img
                  src="/assets/blog-1.png"
                  alt="Black African businessman explaining formalization in an office"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800'; }}
                />
                <span className="blog-category">Guide</span>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">March 10, 2025</span>
                  <span className="blog-dot">·</span>
                  <span className="blog-read-time">5 min read</span>
                </div>
                <h3 className="blog-title">
                  <a href="#blog-post-1">How to Register Your Business in Nigeria: A Complete Guide</a>
                </h3>
                <p className="blog-excerpt">Everything you need to know about the CAC registration process, required documents, and how Remsana simplifies it all.</p>
                <a href="#blog-post-1" className="blog-link">Read article <ArrowRight /></a>
              </div>
            </article>

            {/* Blog Post 2 */}
            <article className="blog-card">
              <div className="blog-image-wrapper">
                <img
                  src="/assets/blog-2.png"
                  alt="Black African woman entrepreneur reviewing financial charts"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800'; }}
                />
                <span className="blog-category">Finance</span>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">March 5, 2025</span>
                  <span className="blog-dot">·</span>
                  <span className="blog-read-time">7 min read</span>
                </div>
                <h3 className="blog-title">
                  <a href="#blog-post-2">5 Funding Options Every Nigerian SME Should Know About</a>
                </h3>
                <p className="blog-excerpt">From BoI loans to angel investors, explore the funding landscape and discover which option is right for your business stage.</p>
                <a href="#blog-post-2" className="blog-link">Read article <ArrowRight /></a>
              </div>
            </article>

            {/* Blog Post 3 */}
            <article className="blog-card">
              <div className="blog-image-wrapper">
                <img
                  src="/assets/blog-3.png"
                  alt="Successful Black African male entrepreneur standing by his storefront"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1531123414780-e3746fe2dc25?auto=format&fit=crop&q=80&w=800'; }}
                />
                <span className="blog-category">Growth</span>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">February 28, 2025</span>
                  <span className="blog-dot">·</span>
                  <span className="blog-read-time">4 min read</span>
                </div>
                <h3 className="blog-title">
                  <a href="#blog-post-3">From Side Hustle to Full-Time: When to Make the Leap</a>
                </h3>
                <p className="blog-excerpt">Real stories from Remsana entrepreneurs who turned their side projects into thriving full-time businesses.</p>
                <a href="#blog-post-3" className="blog-link">Read article <ArrowRight /></a>
              </div>
            </article>
          </div>

          <div className="blog-actions">
            <a href="#all-posts" className="btn-view-all">View All Posts <ArrowRight /></a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div className="cta-container">
          <div className="cta-glow cta-glow-1"></div>
          <div className="cta-glow cta-glow-2"></div>
          <div className="cta-content">
            <h2>Ready to Build Your <span>Dream Business?</span></h2>
            <p>Start free today. No credit card required. Get access to expert guidance, powerful tools, and a supportive community—everything you need to succeed.</p>
            <div className="cta-buttons">
              <button className="cta-btn-primary" onClick={() => navigate('/register')}>
                Get Started Free
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              <button className="cta-btn-outline" onClick={() => navigate('#demo')}>Schedule a Demo</button>
            </div>
            <div className="cta-trust-badges">
              <span className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                No credit card required
              </span>
              <span className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Cancel anytime
              </span>
              <span className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand-col">
              <Link to="/" className="footer-logo">Remsana</Link>
              <p className="footer-brand-desc">Empowering African SMEs to formalize, grow, and thrive through integrated business solutions.</p>
              <div className="footer-socials">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter/X">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div className="footer-links-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#impact">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#journey">How It Works</a></li>
                <li><a href="#">Success Stories</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="footer-links-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Partners</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="footer-links-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">API Docs</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p>&copy; 2025 Remsana. All rights reserved.</p>
            <div className="footer-legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

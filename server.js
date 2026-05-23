<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="description" content="North Sky Drones - AI-powered drone inspections, mapping, and automation. Reduce costs, improve safety, and get actionable data in minutes." />
<title>North Sky Drones | AI Inspection & Automation</title>

<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-528699336"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-528699336');
</script>

<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

<style>
  :root {
    --bg-dark: #05060a;
    --bg-card: #0c0f17;
    --border: #1e2438;
    --accent: #4dd0e1;
    --accent-dark: #2ba0b3;
    --text: #ffffff;
    --text-dim: #a1a9c0;
    --gradient: linear-gradient(135deg, #4dd0e1 0%, #2b9bb0 100%);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg-dark);
    color: var(--text);
    line-height: 1.5;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 10% 20%, rgba(77, 208, 225, 0.08) 0%, rgba(5, 6, 10, 0) 70%);
    pointer-events: none;
    z-index: -1;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    position: sticky;
    top: 0;
    background: rgba(5, 6, 10, 0.85);
    backdrop-filter: blur(12px);
    z-index: 100;
    border-bottom: 1px solid rgba(30, 36, 56, 0.5);
  }

  .logo {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 2px;
    background: var(--gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .btn {
    padding: 10px 20px;
    border-radius: 40px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    font-family: inherit;
    font-size: 14px;
  }

  .btn-primary {
    background: var(--gradient);
    color: #000;
    box-shadow: 0 4px 12px rgba(77, 208, 225, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(77, 208, 225, 0.4);
  }

  .btn-outline {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
  }

  .btn-outline:hover {
    border-color: var(--accent);
    background: rgba(77, 208, 225, 0.1);
  }

  .btn-checkout {
    background: #00e676;
    color: #000;
    box-shadow: 0 4px 12px rgba(0, 230, 118, 0.3);
  }
  .btn-checkout:hover {
    background: #00c866;
    transform: translateY(-2px);
  }

  .hero {
    text-align: center;
    padding: 100px 20px 80px;
    position: relative;
  }

  .hero-badge {
    display: inline-block;
    background: rgba(77, 208, 225, 0.15);
    border: 1px solid rgba(77, 208, 225, 0.3);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 24px;
    color: var(--accent);
  }

  .hero h1 {
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #fff 60%, var(--accent) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .hero p {
    font-size: 18px;
    color: var(--text-dim);
    max-width: 720px;
    margin: 0 auto 32px;
    line-height: 1.6;
  }

  .section {
    padding: 80px 0;
  }

  .section-title {
    text-align: center;
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 28px;
  }

  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 28px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .card:hover {
    transform: translateY(-6px);
    border-color: var(--accent);
    box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.4);
  }

  .card-icon {
    font-size: 36px;
    margin-bottom: 16px;
    display: inline-block;
  }

  .card h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .card p {
    color: var(--text-dim);
    font-size: 14px;
    line-height: 1.6;
  }

  .cta-section {
    text-align: center;
    background: linear-gradient(135deg, rgba(13, 15, 24, 0.9) 0%, rgba(5, 6, 10, 0.95) 100%);
    border-radius: 40px;
    margin: 40px auto;
    padding: 60px 40px;
    border: 1px solid var(--border);
  }

  .cta-section h2 {
    font-size: clamp(28px, 5vw, 38px);
    font-weight: 700;
    margin-bottom: 16px;
  }

  .cta-section p {
    color: var(--text-dim);
    margin-bottom: 32px;
    font-size: 18px;
  }

  .score-badge {
    display: inline-block;
    background: rgba(0, 230, 118, 0.2);
    border: 1px solid #00e676;
    border-radius: 40px;
    padding: 4px 12px;
    font-size: 12px;
    font-family: monospace;
    margin-top: 12px;
  }

  .modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 32px;
    max-width: 480px;
    width: 90%;
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 20px;
    font-size: 24px;
    cursor: pointer;
    color: var(--text-dim);
    transition: color 0.2s;
  }

  .modal-close:hover {
    color: var(--accent);
  }

  .modal h3 {
    font-size: 26px;
    margin-bottom: 8px;
  }

  .modal p {
    color: var(--text-dim);
    margin-bottom: 24px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group input {
    width: 100%;
    padding: 14px 16px;
    background: #0f121c;
    border: 1px solid var(--border);
    border-radius: 14px;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    transition: border 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .btn-block {
    width: 100%;
    padding: 14px;
    font-size: 16px;
  }

  footer {
    text-align: center;
    padding: 60px 24px 40px;
    border-top: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 13px;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate {
    animation: fadeUp 0.6s ease forwards;
  }

  @media (max-width: 768px) {
    .nav {
      padding: 16px 24px;
    }
    .hero {
      padding: 60px 16px 40px;
    }
    .section {
      padding: 60px 0;
    }
    .cta-section {
      padding: 40px 24px;
    }
  }
</style>
</head>
<body>

<div class="nav">
  <div class="logo">NORTH SKY DRONES</div>
  <div style="display: flex; gap: 12px;">
    <button class="btn btn-outline" id="loginBtn">Login</button>
    <button class="btn btn-primary" id="purchaseBtn">Purchase <i class="fas fa-shopping-cart"></i></button>
  </div>
</div>

<main>
  <div class="hero">
    <div class="hero-badge">AI-POWERED INSPECTIONS</div>
    <h1>AI-powered drone inspections at scale</h1>
    <p>
      North Sky Drones automates aerial inspections, mapping, and data capture using intelligent flight systems and real-time AI analysis.
      Reduce field costs, improve safety, and get actionable data in minutes — not days.
    </p>
    <button class="btn btn-primary" id="demoBtn">Request Demo Flight <i class="fas fa-arrow-right" style="margin-left: 8px;"></i></button>
    <div id="scoreDisplay" class="score-badge" style="display: block; margin-top: 24px;">Loading session...</div>
  </div>

  <div class="container">
    <div class="section">
      <h2 class="section-title">What our drones do</h2>
      <div class="grid">
        <div class="card" data-track="click" data-label="infrastructure_card">
          <div class="card-icon">🏗️</div>
          <h3>Infrastructure Inspection</h3>
          <p>Inspect roofs, towers, pipelines, and assets without sending crews on-site.</p>
        </div>
        <div class="card" data-track="click" data-label="ai_damage_card">
          <div class="card-icon">🧠</div>
          <h3>AI Damage Detection</h3>
          <p>Automatically detect cracks, leaks, and structural issues in real time.</p>
        </div>
        <div class="card" data-track="click" data-label="mapping_card">
          <div class="card-icon">📍</div>
          <h3>Mapping & Surveying</h3>
          <p>Generate high-precision maps and 3D models instantly after flight.</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">How it works</h2>
      <div class="grid">
        <div class="card" data-track="click" data-label="step1_card">
          <div class="card-icon">1️⃣</div>
          <h3>Deploy</h3>
          <p>Launch a drone mission manually or automatically.</p>
        </div>
        <div class="card" data-track="click" data-label="step2_card">
          <div class="card-icon">2️⃣</div>
          <h3>Capture</h3>
          <p>High-resolution aerial data is collected in real time.</p>
        </div>
        <div class="card" data-track="click" data-label="step3_card">
          <div class="card-icon">3️⃣</div>
          <h3>Analyze</h3>
          <p>AI processes images and generates actionable reports.</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Why teams use North Sky</h2>
      <div class="grid">
        <div class="card" data-track="click" data-label="benefit_fast">
          <div class="card-icon">⚡</div>
          <h3>10x faster inspections</h3>
          <p>Cut field inspection time from hours to minutes.</p>
        </div>
        <div class="card" data-track="click" data-label="benefit_cost">
          <div class="card-icon">💰</div>
          <h3>Lower operational cost</h3>
          <p>Reduce labor, travel, and equipment expenses.</p>
        </div>
        <div class="card" data-track="click" data-label="benefit_safe">
          <div class="card-icon">🛡️</div>
          <h3>Safer operations</h3>
          <p>Remove humans from hazardous environments.</p>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <h2>Ready to modernize your inspections?</h2>
      <p>Book a live demo flight and see North Sky in action.</p>
      <button class="btn btn-primary" id="ctaBtn">Get Started <i class="fas fa-rocket" style="margin-left: 8px;"></i></button>
    </div>
  </div>
</main>

<footer>
  © 2026 North Sky Drones. All rights reserved.
</footer>

<!-- Demo Modal -->
<div id="demoModal" class="modal">
  <div class="modal-content">
    <span class="modal-close" id="closeModal">&times;</span>
    <h3>Request a demo flight</h3>
    <p>Our team will contact you within 24 hours to schedule a live flight demonstration.</p>
    <form id="demoForm">
      <div class="form-group">
        <input type="text" id="name" placeholder="Full name" required />
      </div>
      <div class="form-group">
        <input type="email" id="email" placeholder="Email address" required />
      </div>
      <div class="form-group">
        <input type="text" id="company" placeholder="Company name (optional)" />
      </div>
      <button type="submit" class="btn btn-primary btn-block">Submit request</button>
    </form>
  </div>
</div>

<script>
// ============================================================
// BACKEND INTEGRATION (Skymaster OS on port 3000)
// ============================================================
const API_BASE = 'http://localhost:3000'; // Change to your backend URL

// Session management
const SESSION_KEY = 'ns_session_id';
const USER_KEY = 'ns_user_id';

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
}

function getOrCreate(key) {
  let v = localStorage.getItem(key);
  if (!v) {
    v = uuid();
    localStorage.setItem(key, v);
  }
  return v;
}

const session_id = getOrCreate(SESSION_KEY);
const user_id = getOrCreate(USER_KEY);

// Track event to backend
async function trackEvent(eventName, eventData = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/hot-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        session_id: session_id,
        user_id: user_id,
        data: eventData
      })
    });
    const result = await response.json();
    if (result.success) {
      updateScoreDisplay(result.score, result.stage);
    }
    return result;
  } catch (err) {
    console.error('Tracking error:', err);
    return null;
  }
}

// Update UI with current score & stage
async function updateScoreDisplay(score, stage) {
  const el = document.getElementById('scoreDisplay');
  if (el) {
    el.textContent = `Engagement Score: ${score} (${stage})`;
    if (stage === 'HOT') {
      el.style.borderColor = '#4dd0e1';
      el.style.background = 'rgba(77, 208, 225, 0.2)';
    } else if (stage === 'WARM') {
      el.style.borderColor = '#fbbf24';
      el.style.background = 'rgba(251, 191, 36, 0.2)';
    } else {
      el.style.borderColor = '#a1a9c0';
      el.style.background = 'rgba(161, 169, 192, 0.1)';
    }
  }
}

// Load current session from backend (optional)
async function loadSession() {
  try {
    const res = await fetch(`${API_BASE}/api/session/${session_id}`);
    const data = await res.json();
    if (data && typeof data.score !== 'undefined') {
      updateScoreDisplay(data.score, data.stage);
    }
  } catch (err) {
    console.warn('Could not load session, tracking will still work');
  }
}

// Checkout flow
async function handleCheckout() {
  try {
    const res = await fetch(`${API_BASE}/api/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id })
    });
    if (res.status === 403) {
      const error = await res.json();
      alert(error.error || 'Not qualified for checkout yet. Engage more with the site (click around, request demo).');
    } else if (res.ok) {
      const { url } = await res.json();
      if (url) window.location.href = url;
      else alert('Checkout URL not available');
    } else {
      alert('Checkout error. Please try again.');
    }
  } catch (err) {
    console.error(err);
    alert('Network error during checkout');
  }
}

// ============================================================
// UI INTERACTIONS
// ============================================================
const modal = document.getElementById('demoModal');
const demoBtn = document.getElementById('demoBtn');
const ctaBtn = document.getElementById('ctaBtn');
const closeModal = document.getElementById('closeModal');
const loginBtn = document.getElementById('loginBtn');
const purchaseBtn = document.getElementById('purchaseBtn');

function openModal() {
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  trackEvent('click', { label: 'demo_modal_opened' });
}

function closeModalFunc() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

demoBtn?.addEventListener('click', openModal);
ctaBtn?.addEventListener('click', openModal);
closeModal?.addEventListener('click', closeModalFunc);
window.addEventListener('click', (e) => { if (e.target === modal) closeModalFunc(); });

loginBtn?.addEventListener('click', () => {
  trackEvent('click', { label: 'login_click' });
  alert('Login portal coming soon. Request a demo to get early access.');
});

purchaseBtn?.addEventListener('click', () => {
  trackEvent('stripe_click', { source: 'purchase_button' });
  handleCheckout();
});

// Form submission (demo request)
const form = document.getElementById('demoForm');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const company = document.getElementById('company').value.trim();

  if (!name || !email) {
    alert('Please fill in name and email.');
    return;
  }
  if (!email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  // Track the lead submission event (use 'click' with lead data)
  await trackEvent('click', { label: 'demo_submit', name, email, company });

  // Also send to GA4
  gtag('event', 'demo_form_submit', { event_category: 'conversion', event_label: 'demo_request', value: 1 });

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerText;
  submitBtn.disabled = true;
  submitBtn.innerText = 'Sending...';

  // Simulate network delay (replace with actual lead endpoint if needed)
  await new Promise(resolve => setTimeout(resolve, 1000));

  alert(`Thank you ${name}! We'll contact you at ${email} to schedule your demo flight.`);
  closeModalFunc();
  form.reset();
  submitBtn.disabled = false;
  submitBtn.innerText = originalText;
});

// Track card clicks
document.querySelectorAll('[data-track="click"]').forEach(el => {
  el.addEventListener('click', () => {
    const label = el.getAttribute('data-label') || 'card_click';
    trackEvent('click', { label });
  });
});

// Track page view on load
window.addEventListener('load', () => {
  trackEvent('page_view', { url: window.location.href });
  loadSession();
});
</script>
</body>
</html>
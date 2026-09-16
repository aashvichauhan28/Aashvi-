/**
 * AASHVI CHAUHAN — PORTFOLIO INTERACTIVITY SCRIPT
 * Handles mobile drawer, AURA breathing timer, Web Audio nature sound generator,
 * certificate modal & download generators, clipboard copying, and contact form toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Update Footer Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------
   * 1. MOBILE DRAWER NAVIGATION
   * ------------------------------------------------------------ */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-item, .drawer-close-trigger');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------
   * 2. SCROLL-SPY ACTIVE NAV HIGHLIGHTING
   * ------------------------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.desktop-nav .nav-item');

  function updateActiveNav() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 140;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  /* ------------------------------------------------------------
   * 3. AURA INTERACTIVE 4-4-4 BOX BREATHING ENGINE
   * ------------------------------------------------------------ */
  const bubble = document.getElementById('breathing-bubble');
  const statusEl = document.getElementById('breathing-status');
  const timerEl = document.getElementById('breathing-timer');
  const promptEl = document.getElementById('breathing-prompt');
  const startBtn = document.getElementById('start-breath-btn');
  const stopBtn = document.getElementById('stop-breath-btn');

  let breathInterval = null;
  let countdownInterval = null;
  let isBreathingActive = false;

  const breathPhases = [
    { name: 'Inhale', duration: 4, prompt: 'Breathe in slowly through your nose...', class: 'inhale' },
    { name: 'Hold', duration: 4, prompt: 'Hold your breath gently...', class: 'hold' },
    { name: 'Exhale', duration: 4, prompt: 'Release slowly through your mouth...', class: 'exhale' }
  ];

  function startBreathing() {
    if (isBreathingActive) return;
    isBreathingActive = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';

    let currentPhaseIdx = 0;

    function runPhase() {
      const phase = breathPhases[currentPhaseIdx];
      bubble.className = 'breathing-bubble ' + phase.class;
      statusEl.textContent = phase.name;
      promptEl.textContent = phase.prompt;

      let secondsLeft = phase.duration;
      timerEl.textContent = `${secondsLeft}s`;

      clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
          timerEl.textContent = `${secondsLeft}s`;
        }
      }, 1000);

      breathInterval = setTimeout(() => {
        currentPhaseIdx = (currentPhaseIdx + 1) % breathPhases.length;
        if (isBreathingActive) {
          runPhase();
        }
      }, phase.duration * 1000);
    }

    runPhase();
  }

  function stopBreathing() {
    isBreathingActive = false;
    clearTimeout(breathInterval);
    clearInterval(countdownInterval);
    startBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'none';

    bubble.className = 'breathing-bubble';
    statusEl.textContent = 'Restored';
    timerEl.textContent = 'Click Start';
    promptEl.textContent = 'Experience AURA’s 4-4-4 Box Breathing Technique';
  }

  if (startBtn && stopBtn) {
    startBtn.addEventListener('click', startBreathing);
    stopBtn.addEventListener('click', stopBreathing);
  }

  /* ------------------------------------------------------------
   * 4. AURA AMBIENT NATURE SOUND SYNTHESIZER (Web Audio API)
   * ------------------------------------------------------------ */
  const audioToggleBtn = document.getElementById('ambient-audio-toggle');
  const audioBtnText = document.getElementById('audio-btn-text');
  const audioBtnIcon = document.getElementById('audio-btn-icon');

  let audioCtx = null;
  let noiseNode = null;
  let filterNode = null;
  let gainNode = null;
  let isAudioPlaying = false;

  function initRainSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Create 5 seconds pink noise buffer
    const bufferSize = audioCtx.sampleRate * 4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04; // Gentle volume
      b6 = white * 0.115926;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filter to simulate soft rainfall / ocean breeze
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(850, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 1);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
  }

  function toggleNatureSound() {
    if (!isAudioPlaying) {
      if (!audioCtx) {
        initRainSound();
      } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      isAudioPlaying = true;
      audioBtnText.textContent = 'Mute Calming Rain';
      audioBtnIcon.className = 'fa-solid fa-volume-xmark';
      showToast('🌧️ Calming rain ambience playing from AURA soundscape.');
    } else {
      if (audioCtx) {
        audioCtx.suspend();
      }
      isAudioPlaying = false;
      audioBtnText.textContent = 'Play Calming Rain';
      audioBtnIcon.className = 'fa-solid fa-volume-high';
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleNatureSound);
  }

  /* ------------------------------------------------------------
   * 5. CERTIFICATE FILTERING
   * ------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.cert-filter-btn');
  const certCards = document.querySelectorAll('.cert-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      certCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ------------------------------------------------------------
   * 6. CERTIFICATE & RESUME MODAL VIEWER / DOWNLOAD GENERATOR
   * ------------------------------------------------------------ */
  const modal = document.getElementById('certificate-modal');
  const modalClose = document.getElementById('modal-close');
  const modalContent = document.getElementById('modal-content');
  const viewCertBtns = document.querySelectorAll('.view-cert-btn');
  const downloadCertBtns = document.querySelectorAll('.download-cert-btn');
  const previewResumeBtn = document.getElementById('quick-preview-resume-btn');

  // Certificate Registry
  const certRegistry = {
    karate: {
      title: 'National Karate Championship Certificate',
      organization: 'National Karate Federation of India',
      subtitle: 'Official Championship Record & Medalist Citation',
      recipient: 'Aashvi Chauhan',
      description: 'This is to certify that Aashvi Chauhan has exhibited exemplary martial discipline, technical kata precision, and competitive kumite spirit, officially representing at the National Karate Championship.',
      sealIcon: 'fa-hand-fist',
      sealColor: '#f43f5e',
      date: 'National Athletic Session 2023–2024',
      certId: 'NKFI-NAT-2024-AC07',
      signee: 'President, National Karate Federation',
      svgFile: 'assets/certificates/national_karate_certificate.svg'
    },
    swimming: {
      title: 'District Aquatics Swimming Championship',
      organization: 'District Aquatics & Swimming Association',
      subtitle: 'District Podium Honors & Athletic Endurance Award',
      recipient: 'Aashvi Chauhan',
      description: 'Awarded to Aashvi Chauhan in recognition of high-tier endurance, athletic focus, and outstanding podium performance across competitive sprint and medley swimming divisions.',
      sealIcon: 'fa-person-swimming',
      sealColor: '#0ea5e9',
      date: 'District Sports Meet 2023',
      certId: 'DASA-SWIM-2023-AC19',
      signee: 'Head Coach & Secretary, Aquatics Meet',
      svgFile: 'assets/certificates/district_swimming_certificate.svg'
    },
    python: {
      title: 'Python Programming & Algorithmic Logic',
      organization: 'JECRC University & Tech Academy',
      subtitle: 'BTech CSE Academic Certification of Excellence',
      recipient: 'Aashvi Chauhan',
      description: 'Successfully demonstrated proficiency in algorithmic problem solving, Python 3 syntax, structured programming, control systems, and computational data structures.',
      sealIcon: 'fa-brands fa-python',
      sealColor: '#eab308',
      date: 'Academic Year 2024–2025',
      certId: 'JECRC-CSE-PY-9821',
      signee: 'Head of Computer Science & Engineering',
      svgFile: 'assets/certificates/python_programming_certificate.svg'
    },
    'ai-web': {
      title: 'AI-Accelerated Web Engineering & Prototyping',
      organization: 'Modern AI Development Practicum',
      subtitle: 'Project Leadership Citation: AURA Wellness Platform',
      recipient: 'Aashvi Chauhan',
      description: 'Honored for building high-impact, empathetic web products leveraging Claude and modern web engineering tools, culminating in the architecture of the AURA stress-relief sanctuary.',
      sealIcon: 'fa-robot',
      sealColor: '#8b5cf6',
      date: 'Fall 2024 Project Sprint',
      certId: 'AIW-CLAUDE-AC-404',
      signee: 'Lead Mentor, AI Prototyping Lab',
      svgFile: 'assets/certificates/ai_web_engineering_certificate.svg'
    }
  };

  function openModalWithCert(certKey) {
    const cert = certRegistry[certKey];
    if (!cert) return;

    modalContent.innerHTML = `
      <div class="certificate-frame">
        <div class="cert-frame-header">
          <div class="cert-seal" style="background: ${cert.sealColor};">
            <i class="fa-solid ${cert.sealIcon}"></i>
          </div>
          <div class="cert-frame-org">${cert.organization}</div>
          <div class="cert-frame-sub">${cert.subtitle}</div>
        </div>

        <p class="cert-frame-present">This official credential proudly honors</p>
        <h2 class="cert-frame-recipient">${cert.recipient}</h2>
        <div class="cert-frame-award-title">${cert.title}</div>
        <p class="cert-frame-body">${cert.description}</p>

        <div class="cert-frame-footer">
          <div class="cert-signature">
            <div class="signature-line"></div>
            <div class="signature-name">${cert.signee}</div>
            <small style="color: #64748b;">Authorized Signatory</small>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-size: 0.78rem; color: #a78bfa;">ID: ${cert.certId}</div>
            <small style="color: #64748b;">Issued: ${cert.date}</small>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <a href="${cert.svgFile}" download="${certKey}_certificate_aashvi_chauhan.svg" class="btn btn-primary">
          <i class="fa-solid fa-download"></i> Download Vector SVG
        </a>
        <button class="btn btn-secondary" onclick="downloadCertificateFile('${certKey}')">
          <i class="fa-solid fa-file-arrow-down"></i> Download Printable Record
        </button>
        <button class="btn btn-outline-sm" onclick="window.print()">
          <i class="fa-solid fa-print"></i> Print
        </button>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function openResumePreview() {
    modalContent.innerHTML = `
      <div style="text-align: left; padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 1.8rem; margin: 0; color: #fff;">Aashvi Chauhan</h2>
            <p style="color: #06b6d4; margin: 4px 0 0; font-weight: 600;">First-Year BTech CSE Core &bull; JECRC University &bull; National Athlete</p>
          </div>
          <div style="text-align: right; font-size: 0.85rem; color: #94a3b8;">
            <div>📞 +91 7976201178</div>
            <div>✉️ theaashvi.chauhan@gmail.com</div>
            <div>📍 Jaipur, Rajasthan</div>
          </div>
        </div>

        <div style="margin-bottom: 18px;">
          <h4 style="color: #a78bfa; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; margin-bottom: 6px;">Academic Education</h4>
          <p style="color: #e2e8f0; margin: 0;"><strong>BTech in Computer Science & Engineering (Core)</strong></p>
          <p style="color: #94a3b8; font-size: 0.88rem; margin: 2px 0;">JECRC University, Jaipur &bull; Batch 2024–2028 (Year 1)</p>
        </div>

        <div style="margin-bottom: 18px;">
          <h4 style="color: #a78bfa; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; margin-bottom: 6px;">Key Technical Projects</h4>
          <p style="color: #e2e8f0; margin: 0;"><strong>AURA &mdash; The Stress-Relief Digital Sanctuary</strong></p>
          <p style="color: #94a3b8; font-size: 0.85rem; margin: 2px 0;">Built an interactive mental wellness platform featuring a guided meditation room, dynamic nature sound generator, manifesting desk, and box-breathing timer. Built with Python logic, modern web frontend, and prompt-driven rapid iteration using Claude.</p>
        </div>

        <div style="margin-bottom: 18px;">
          <h4 style="color: #a78bfa; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; margin-bottom: 6px;">Sports Honors & Discipline</h4>
          <ul style="color: #94a3b8; font-size: 0.85rem; padding-left: 18px; list-style-type: disc;">
            <li><strong>National-Level Karate:</strong> Competitor & medalist in National Karate Championship. Fosters intense focus and composure.</li>
            <li><strong>District-Level Swimming:</strong> Podium finalist in competitive sprint and endurance swimming meets.</li>
          </ul>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="color: #a78bfa; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; margin-bottom: 6px;">Skills & Competencies</h4>
          <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0;">Python &bull; HTML5 & CSS3 &bull; JavaScript DOM &bull; AI Prototyping (Claude) &bull; Prompt Engineering &bull; Mental Toughness &bull; Adaptability</p>
        </div>

        <div class="modal-actions" style="margin-top: 20px;">
          <a href="resume.html" target="_blank" class="btn btn-primary">
            <i class="fa-solid fa-file-pdf"></i> Open Dedicated ATS Resume
          </a>
          <button class="btn btn-secondary" onclick="window.print()">
            <i class="fa-solid fa-print"></i> Print Resume
          </button>
        </div>
      </div>
    `;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  viewCertBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const certKey = btn.getAttribute('data-cert');
      openModalWithCert(certKey);
    });
  });

  downloadCertBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const certKey = btn.getAttribute('data-cert');
      downloadCertificateFile(certKey);
    });
  });

  if (previewResumeBtn) {
    previewResumeBtn.addEventListener('click', openResumePreview);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  /* ------------------------------------------------------------
   * 7. CERTIFICATE FILE GENERATOR & DOWNLOADER
   * ------------------------------------------------------------ */
  window.downloadCertificateFile = function(certKey, format = 'svg') {
    const cert = certRegistry[certKey];
    if (!cert) return;

    if (format === 'svg' && cert.svgFile) {
      const a = document.createElement('a');
      a.href = cert.svgFile;
      a.download = `${certKey}_certificate_aashvi_chauhan.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`🎓 Official Vector Certificate for ${cert.title} downloaded!`);
      return;
    }

    // Create an elegant standalone printable HTML Certificate document
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${cert.title} - ${cert.recipient}</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      background: #090d16;
      color: #f8fafc;
      font-family: 'Georgia', serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .cert-container {
      width: 860px;
      border: 8px double #d4af37;
      padding: 50px 60px;
      text-align: center;
      background: #0d1322;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
      position: relative;
    }
    .seal {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: ${cert.sealColor};
      color: #fff;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-weight: bold;
    }
    .org {
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #fbbf24;
      margin-bottom: 6px;
    }
    .sub {
      font-size: 14px;
      color: #94a3b8;
      letter-spacing: 1px;
    }
    .honors {
      font-style: italic;
      font-size: 18px;
      color: #cbd5e1;
      margin: 30px 0 10px;
    }
    .name {
      font-size: 38px;
      font-weight: bold;
      color: #38bdf8;
      margin-bottom: 16px;
      letter-spacing: 1px;
    }
    .award {
      font-size: 24px;
      font-weight: bold;
      color: #fff;
      margin-bottom: 16px;
    }
    .body-text {
      font-size: 16px;
      line-height: 1.8;
      color: #cbd5e1;
      max-width: 680px;
      margin: 0 auto 40px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(255,255,255,0.15);
      padding-top: 24px;
      margin-top: 30px;
    }
    .sig-line {
      width: 180px;
      height: 1px;
      background: #94a3b8;
      margin-bottom: 8px;
    }
    .sig-name {
      font-size: 14px;
      font-weight: bold;
      color: #f1f5f9;
    }
    .id-tag {
      font-family: monospace;
      font-size: 13px;
      color: #a78bfa;
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .cert-container { background: #fff; color: #000; border-color: #333; box-shadow: none; width: 100%; }
      .org { color: #000; }
      .name { color: #000; }
      .award { color: #000; }
      .body-text { color: #222; }
      .id-tag { color: #333; }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="seal">★</div>
    <div class="org">${cert.organization}</div>
    <div class="sub">${cert.subtitle}</div>
    <p class="honors">This official credential proudly honors</p>
    <div class="name">${cert.recipient}</div>
    <div class="award">${cert.title}</div>
    <p class="body-text">${cert.description}</p>
    <div class="footer">
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">${cert.signee}</div>
        <small style="color: #64748b;">Authorized Signatory</small>
      </div>
      <div style="text-align: right;">
        <div class="id-tag">Verification ID: ${cert.certId}</div>
        <small style="color: #64748b;">Date: ${cert.date}</small>
      </div>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function(){ window.print(); }, 600); };<\/script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certKey}_certificate_aashvi_chauhan.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`🎓 Printable Certificate downloaded! Open to view or print.`);
  };

  /* ------------------------------------------------------------
   * 8. CLIPBOARD COPY UTILITY
   * ------------------------------------------------------------ */
  const copyBtns = document.querySelectorAll('.copy-btn');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`📋 Copied "${textToCopy}" to clipboard!`);
      }).catch(() => {
        // Fallback
        const tempInput = document.createElement('input');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast(`📋 Copied "${textToCopy}" to clipboard!`);
      });
    });
  });

  /* ------------------------------------------------------------
   * 9. CONTACT FORM SUBMISSION WITH VALIDATION
   * ------------------------------------------------------------ */
  const contactForm = document.getElementById('portfolio-contact-form');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');

      if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        showToast('⚠️ Please fill out all required fields.');
        return;
      }

      // Show submitting state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Message Dispatched!</span>`;

        showToast(`✨ Thank you, ${nameInput.value.trim()}! Aashvi received your message.`);
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>Send Message to Aashvi</span>`;
        }, 3500);
      }, 900);
    });
  }

  /* ------------------------------------------------------------
   * 10. TOAST NOTIFICATION UTILITY
   * ------------------------------------------------------------ */
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 400);
    }, 4000);
  }
});

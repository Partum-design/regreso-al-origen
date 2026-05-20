/* ══════════════════════════════════════════
   REGRESO AL ORIGEN — Interactions & Effects
   ══════════════════════════════════════════ */

// ═══ INIT LUCIDE ICONS ═══
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    initParticles();
    initScrollReveal();
    initFAQSearch();
});

// ═══════════════════════════════════════════
// PARTICLE SYSTEM (Floating leaves/dots)
// ═══════════════════════════════════════════
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = [
        'rgba(7,140,3,.12)',
        'rgba(22,64,24,.10)',
        'rgba(217,157,85,.10)',
        'rgba(242,226,5,.08)',
    ];

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 4 + 1.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.2;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.015;
            this.drift = Math.random() * 0.5 + 0.3;
        }
        update() {
            this.angle += this.spin;
            this.x += this.speedX + Math.sin(this.angle) * this.drift * 0.3;
            this.y += this.speedY + Math.cos(this.angle) * this.drift * 0.2;

            if (this.x < -20) this.x = canvas.width + 20;
            if (this.x > canvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = canvas.height + 20;
            if (this.y > canvas.height + 20) this.y = -20;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Leaf shape
            ctx.beginPath();
            ctx.moveTo(0, -this.size * 2);
            ctx.bezierCurveTo(this.size, -this.size, this.size, this.size, 0, this.size * 2);
            ctx.bezierCurveTo(-this.size, this.size, -this.size, -this.size, 0, -this.size * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    const count = Math.min(Math.floor(window.innerWidth / 25), 50);
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else animate();
    });
}

// ═══════════════════════════════════════════
// SCROLL REVEAL (IntersectionObserver)
// ═══════════════════════════════════════════
function initScrollReveal() {
    const els = document.querySelectorAll('.reveal-up');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger siblings
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.07}s`;
        obs.observe(el);
    });
}

// ═══════════════════════════════════════════
// FORM STEP NAVIGATION
// ═══════════════════════════════════════════
let currentStep = 1;
const totalSteps = 3;

function nextStep(from) {
    if (!validateStep(from)) return;
    switchStep(from, from + 1, 'forward');
}

function prevStep(from) {
    switchStep(from, from - 1, 'back');
}

function goToStep(target) {
    if (target === currentStep) return;
    // Only allow going back or to completed steps
    if (target > currentStep) return;
    switchStep(currentStep, target, target < currentStep ? 'back' : 'forward');
}

function switchStep(from, to, direction) {
    const fromEl = document.getElementById(`step-${from}`);
    const toEl = document.getElementById(`step-${to}`);
    if (!fromEl || !toEl) return;

    fromEl.classList.add('slide-out');

    setTimeout(() => {
        fromEl.classList.remove('active', 'slide-out');
        fromEl.style.animation = '';
        toEl.classList.add('active');
        toEl.style.animation = direction === 'forward'
            ? 'slideInRight .65s cubic-bezier(.16,1,.3,1) both'
            : 'slideInLeft .65s cubic-bezier(.16,1,.3,1) both';

        currentStep = to;
        updateProgress();

        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Re-init Lucide icons for new step
        if (window.lucide) lucide.createIcons();
    }, 320);
}

function updateProgress() {
    // Progress bar
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = `${(currentStep / totalSteps) * 100}%`;

    // Dots
    document.querySelectorAll('.step-dot').forEach((dot) => {
        const s = parseInt(dot.dataset.step);
        dot.classList.remove('active', 'completed');
        if (s === currentStep) dot.classList.add('active');
        else if (s < currentStep) {
            dot.classList.add('completed');
            dot.querySelector('.dot-num').textContent = '✓';
        }
        if (s >= currentStep) dot.querySelector('.dot-num').textContent = s;
    });
}

// ═══════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════
const fieldsMap = {
    1: [
        { id: 'nombre', msg: 'Ingresa tu nombre completo' },
        { id: 'edad', msg: 'Ingresa tu edad (1-120)', validate: v => v >= 1 && v <= 120 },
        { id: 'telefono', msg: 'Ingresa tu teléfono' },
        { id: 'domicilio', msg: 'Ingresa tu domicilio' },
    ],
    2: [
        { id: 'hermanos', msg: 'Indica cuántos hermanos tienes', validate: v => v >= 0 },
        { id: 'lugar', msg: 'Selecciona tu lugar entre hermanos' },
    ],
    3: [
        { id: 'terapia-antes', type: 'radio', name: 'terapia_antes', msg: 'Selecciona una opción' },
        { id: 'motivo', msg: 'Cuéntanos tu motivo de consulta' },
        { id: 'expectativas', msg: 'Comparte tus expectativas' },
    ]
};

function validateStep(stepNum) {
    let valid = true;
    const fields = fieldsMap[stepNum] || [];

    fields.forEach(f => {
        const group = document.getElementById(`group-${f.id}`);
        const errEl = document.getElementById(`error-${f.id}`);

        if (f.type === 'radio') {
            const checked = document.querySelector(`input[name="${f.name}"]:checked`);
            if (!checked) {
                setError(group, errEl, f.msg);
                valid = false;
            } else {
                clearError(group, errEl);
            }
        } else {
            const input = document.getElementById(f.id);
            const val = input.value.trim();
            let ok = val !== '';
            if (ok && f.validate) ok = f.validate(Number(val));

            if (!ok) {
                setError(group, errEl, f.msg);
                input.style.animation = 'shake .45s ease';
                setTimeout(() => input.style.animation = '', 450);
                valid = false;
            } else {
                clearError(group, errEl);
            }
        }
    });

    return valid;
}

function setError(group, errEl, msg) {
    if (group) group.classList.add('error');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
}

function clearError(group, errEl) {
    if (group) group.classList.remove('error');
    if (errEl) errEl.style.display = 'none';
}

// Clear errors on input
document.addEventListener('input', e => {
    const g = e.target.closest('.form-group');
    if (g?.classList.contains('error')) {
        g.classList.remove('error');
        const err = g.querySelector('.err');
        if (err) err.style.display = 'none';
    }
});
document.addEventListener('change', e => {
    if (e.target.type === 'radio') {
        const g = e.target.closest('.form-group');
        if (g?.classList.contains('error')) {
            g.classList.remove('error');
            const err = g.querySelector('.err');
            if (err) err.style.display = 'none';
        }
    }
});

// ═══════════════════════════════════════════
// FORM SUBMIT
// ═══════════════════════════════════════════
document.getElementById('therapy-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(3)) return;

    const btn = document.getElementById('btn-submit');
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        showModal();
    }, 2000);
});

function showModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    spawnConfetti();
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    document.getElementById('therapy-form').reset();
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
    currentStep = 1;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('success-modal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('success-modal').classList.contains('active')) closeModal();
});

// ═══════════════════════════════════════════
// CONFETTI 🎉
// ═══════════════════════════════════════════
function spawnConfetti() {
    const container = document.getElementById('confetti-burst');
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#078C03', '#164018', '#F2E205', '#D99D55', '#25D366'];

    for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        const size = Math.random() * 8 + 4;
        const angle = Math.random() * 360;
        const distance = Math.random() * 160 + 60;
        const duration = Math.random() * 0.8 + 0.8;
        const delay = Math.random() * 0.3;

        piece.style.cssText = `
            position:absolute;width:${size}px;height:${size}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
            left:50%;top:0;
            animation:confettiFly ${duration}s ${delay}s ease-out forwards;
            --angle:${angle}deg;--dist:${distance}px;
            opacity:0;
        `;
        container.appendChild(piece);
    }

    // Add confetti keyframes if not already added
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFly {
                0% { opacity:1; transform:translate(0,0) rotate(0deg) scale(1); }
                100% {
                    opacity:0;
                    transform: translate(
                        calc(cos(var(--angle)) * var(--dist)),
                        calc(sin(var(--angle)) * var(--dist) - 40px)
                    ) rotate(720deg) scale(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ═══════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════
function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const isActive = item.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item.active').forEach(faq => {
        faq.classList.remove('active');
        faq.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
    }
}

// ═══════════════════════════════════════════
// FAQ SEARCH
// ═══════════════════════════════════════════
function initFAQSearch() {
    const input = document.getElementById('faq-search-input');
    const clearBtn = document.getElementById('search-clear');
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        clearBtn.classList.toggle('show', query.length > 0);
        filterFAQ(query);
    });

    // Highlight search icon on focus (workaround for CSS sibling order)
    input.addEventListener('focus', () => {
        const icon = input.parentElement.querySelector('.search-icon');
        if (icon) icon.style.color = '#078C03';
    });
    input.addEventListener('blur', () => {
        const icon = input.parentElement.querySelector('.search-icon');
        if (icon) icon.style.color = '';
    });
}

function filterFAQ(query) {
    const items = document.querySelectorAll('.faq-item');
    const noResults = document.getElementById('faq-no-results');
    let visible = 0;

    items.forEach(item => {
        if (!query) {
            item.classList.remove('hidden');
            visible++;
            return;
        }

        const text = item.querySelector('.faq-q-text').textContent.toLowerCase();
        const keywords = (item.dataset.keywords || '').toLowerCase();
        const answer = item.querySelector('.faq-a-inner')?.textContent.toLowerCase() || '';
        const combined = text + ' ' + keywords + ' ' + answer;

        const words = query.split(/\s+/);
        const match = words.every(w => combined.includes(w));

        if (match) {
            item.classList.remove('hidden');
            item.classList.add('highlight');
            setTimeout(() => item.classList.remove('highlight'), 1000);
            visible++;
        } else {
            item.classList.add('hidden');
            item.classList.remove('active');
        }
    });

    if (noResults) noResults.classList.toggle('show', visible === 0 && query.length > 0);
}

function clearSearch() {
    const input = document.getElementById('faq-search-input');
    if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.focus();
    }
}

// ═══════════════════════════════════════════
// PARALLAX HERO
// ═══════════════════════════════════════════
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero-content');
            if (hero && scrolled < window.innerHeight) {
                const opacity = 1 - (scrolled / (window.innerHeight * 0.6));
                hero.style.opacity = Math.max(0, opacity);
                hero.style.transform = `translateY(${scrolled * 0.35}px)`;
            }
            ticking = false;
        });
        ticking = true;
    }
});

// ═══════════════════════════════════════════
// INPUT MICRO-INTERACTIONS
// ═══════════════════════════════════════════
document.querySelectorAll('.input-wrap input, .input-wrap textarea').forEach(input => {
    input.addEventListener('focus', () => {
        const g = input.closest('.form-group');
        if (g) {
            g.style.transform = 'scale(1.015)';
            g.style.transition = 'transform .35s cubic-bezier(.16,1,.3,1)';
        }
    });
    input.addEventListener('blur', () => {
        const g = input.closest('.form-group');
        if (g) g.style.transform = '';
    });
});

// ═══════════════════════════════════════════
// KEYBOARD NAVIGATION
// ═══════════════════════════════════════════
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        e.preventDefault();
        if (currentStep < totalSteps) nextStep(currentStep);
        else document.getElementById('btn-submit').click();
    }
});

// ═══════════════════════════════════════════
// SMOOTH SCROLL for SCROLL-CTA
// ═══════════════════════════════════════════
const scrollCta = document.getElementById('scroll-cta');
if (scrollCta) {
    scrollCta.addEventListener('click', () => {
        document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
    });
}

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Fish, ShoppingBag, Truck, Shield, ChevronRight, Scissors, ArrowDown, Heart, Users, Waves, Anchor, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import InstallBanner from '../../components/InstallBanner';

const features = [
  { icon: Fish, title: 'Fresh Daily', desc: 'Sourced fresh every morning from local markets', color: 'bg-sky-50 text-sky-600 border-sky-100', accent: '#0284c7' },
  { icon: Scissors, title: 'Custom Cuts', desc: 'Choose your preferred cutting style for each fish', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', accent: '#059669' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Delivery or pickup — your convenience', color: 'bg-amber-50 text-amber-600 border-amber-100', accent: '#d97706' },
  { icon: Shield, title: 'Quality Assured', desc: 'Verified vendors with quality-checked products', color: 'bg-violet-50 text-violet-600 border-violet-100', accent: '#7c3aed' },
];

const steps = [
  { num: '1', title: 'Enter Vendor Code', desc: 'Connect with your trusted local fish vendor', icon: ShoppingBag },
  { num: '2', title: 'Browse & Select', desc: 'Pick your fish and preferred cutting style', icon: Fish },
  { num: '3', title: 'Place Order', desc: 'Get it delivered fresh to your doorstep', icon: Truck },
];

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = '', direction = 'up' }) {
  const ref = useScrollReveal();
  const cls = direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : 'reveal';
  return <div ref={ref} className={`${cls} ${className}`}>{children}</div>;
}

function StaggerReveal({ children, className = '' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`stagger-children ${className}`}>{children}</div>;
}

// Animated counter
function Counter({ end, label, icon: Icon, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1500;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center group">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
        <Icon size={20} className="text-primary-200 md:w-[24px] md:h-[24px]" />
      </div>
      <div className="text-3xl md:text-5xl font-display font-black text-white tracking-tight">{count}{suffix}</div>
      <div className="text-[11px] md:text-sm text-primary-200/80 mt-1 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

// Gradient mesh orbs for hero atmosphere
function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full animate-mesh opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(2,132,199,0.15) 0%, rgba(14,165,233,0.05) 50%, transparent 70%)', '--duration': '15s', '--delay': '0s' }} />
      <div className="absolute -bottom-1/3 -left-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full animate-mesh opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(2,132,199,0.04) 50%, transparent 70%)', '--duration': '18s', '--delay': '3s' }} />
      <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full animate-mesh opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 60%)', '--duration': '20s', '--delay': '6s' }} />
    </div>
  );
}

// Realistic rising bubbles for hero
function HeroBubbles() {
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    left: `${5 + Math.random() * 90}%`,
    size: 3 + Math.random() * 8,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 10,
    wobble: -10 + Math.random() * 20,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full animate-hero-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 30% 30%, rgba(2,132,199,0.18), rgba(2,132,199,0.04) 60%, transparent 80%)`,
            border: '0.5px solid rgba(2,132,199,0.1)',
            '--duration': `${b.duration}s`,
            '--delay': `${b.delay}s`,
            '--wobble': `${b.wobble}px`,
          }}
        />
      ))}
    </div>
  );
}

// Water droplets for hero (very subtle, light colored)
function WaterDroplets() {
  const drops = Array.from({ length: 8 }, (_, i) => ({
    left: `${8 + Math.random() * 84}%`,
    top: `${10 + Math.random() * 80}%`,
    size: 3 + Math.random() * 5,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-droplet"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: 'radial-gradient(circle at 40% 30%, rgba(2,132,199,0.2), rgba(2,132,199,0.05))',
            '--duration': `${d.duration}s`,
            '--delay': `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Floating dots for features section (very faint)
function FloatingDots() {
  const dots = Array.from({ length: 6 }, (_, i) => ({
    left: `${5 + Math.random() * 90}%`,
    top: `${5 + Math.random() * 90}%`,
    size: 3 + Math.random() * 4,
    duration: 4 + Math.random() * 5,
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-dot"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: 'rgba(2,132,199,0.08)',
            '--duration': `${d.duration}s`,
            '--delay': `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Swimming fish across the full page
function SwimmingFish() {
  const fishes = [
    { top: '15%', duration: 20, delay: 0, size: 28, opacity: 0.06 },
    { top: '55%', duration: 28, delay: 4, size: 20, opacity: 0.05 },
    { top: '35%', duration: 24, delay: 9, size: 24, opacity: 0.04 },
    { top: '75%', duration: 32, delay: 14, size: 18, opacity: 0.05 },
    { top: '25%', duration: 26, delay: 18, size: 22, opacity: 0.04 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {fishes.map((f, i) => (
        <div
          key={i}
          className="absolute animate-swim"
          style={{
            top: f.top,
            '--duration': `${f.duration}s`,
            '--delay': `${f.delay}s`,
          }}
        >
          <svg width={f.size} height={f.size * 0.6} viewBox="0 0 40 24" fill="none" style={{ opacity: f.opacity }}>
            <path d="M2 12c4-5 10-9 18-9 3 0 6 1.5 8 4l3 5-3 5c-2 2.5-5 4-8 4-8 0-14-4-18-9z" fill="#0284c7" />
            <path d="M0 12c1-2 2-3 4-4l-3 4 3 4c-2-1-3-2-4-4z" fill="#0284c7" />
            <circle cx="28" cy="10.5" r="1.2" fill="#0369a1" />
            <path d="M10 8c2 2 4 3 7 3.5M10 16c2-2 4-3 7-3.5" stroke="#0369a1" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// Floating bubbles
function Bubbles() {
  const bubbles = Array.from({ length: 14 }, (_, i) => ({
    left: `${3 + Math.random() * 94}%`,
    size: 4 + Math.random() * 12,
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    drift: -15 + Math.random() * 30,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full animate-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), rgba(255,255,255,0.08) 60%, transparent)`,
            boxShadow: `inset 0 -1px 2px rgba(255,255,255,0.15), 0 0 ${b.size / 3}px rgba(255,255,255,0.05)`,
            '--duration': `${b.duration}s`,
            '--delay': `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Decorative wave separator
function WaveSeparator({ flip = false, color = 'white' }) {
  return (
    <div className={`absolute ${flip ? 'bottom-0 rotate-180' : 'top-0'} left-0 right-0 overflow-hidden leading-[0]`}>
      <svg viewBox="0 0 1440 80" fill="none" className="w-[200%] animate-wave-gentle" preserveAspectRatio="none" style={{ height: '40px' }}>
        <path d="M0 40c120-20 240 10 360 0s240-30 360-10 240 25 360 5 240-20 360-5v50H0z" fill={color} />
      </svg>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const { code: vendorCode } = useParams();
  const homeLink = isAuthenticated
    ? user?.role === 'vendor' ? '/vendor' : user?.role === 'admin' ? '/admin' : '/home'
    : '/login';
  const registerLink = vendorCode ? `/register/${vendorCode}` : '/register';

  return (
    <div className="min-h-[100dvh] bg-white overflow-x-hidden">
      <SwimmingFish />

      {/* ═══ HERO SECTION ═══ */}
      <div className="relative noise-overlay">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-primary-50/30 to-white" />
        <GradientMesh />
        <HeroBubbles />

        {/* Animated wave background */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-28 overflow-hidden opacity-[0.08]">
          <svg className="absolute bottom-0 w-[200%] h-full animate-wave" viewBox="0 0 2880 120" fill="none">
            <path d="M0 60c480-40 960 40 1440 0s960-40 1440 0v60H0z" fill="#0284c7" />
          </svg>
          <svg className="absolute bottom-0 w-[200%] h-[80%] animate-wave-slow" viewBox="0 0 2880 100" fill="none">
            <path d="M0 50c360 30 720-30 1080 0s720 30 1080 0 720-30 720 0v50H0z" fill="#0ea5e9" />
          </svg>
        </div>

        {/* Header */}
        <header className="relative z-50">
          <div className="flex items-center justify-between px-1 md:px-5 pt-3 pb-1 md:pt-4 md:pb-2 max-w-6xl mx-auto">
            <div className="flex items-center -ml-2 md:ml-0">
              <img src="/logo-transparent.png" alt="Ready Meen" className="h-24 w-24 md:h-36 md:w-36 object-contain drop-shadow -mr-3 md:-mr-6" />
              <div className="flex flex-col items-center">
                <span className="text-sm md:text-lg font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
                <span className="text-[8px] md:text-[10px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
              </div>
            </div>
            <Link to={homeLink}>
              <Button size="sm" className="min-h-[44px] px-4 md:px-6 text-xs md:text-sm rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:bg-primary-700 transition-all duration-300 hover:-translate-y-0.5">
                {isAuthenticated ? 'Open App' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <section className="relative px-4 pt-2 pb-14 md:pt-12 md:pb-32 overflow-hidden">
          {/* Swimming fish decorations */}
          <div className="absolute top-16 animate-swim-hero opacity-[0.08]" style={{ '--duration': '14s', '--delay': '0s' }}>
            <Fish size={44} className="text-primary-600" />
          </div>
          <div className="absolute top-40 animate-swim-hero opacity-[0.06]" style={{ '--duration': '18s', '--delay': '4s' }}>
            <Fish size={32} className="text-primary-500" />
          </div>
          <div className="absolute bottom-24 animate-swim-hero opacity-[0.05]" style={{ '--duration': '22s', '--delay': '8s' }}>
            <Fish size={38} className="text-primary-600" />
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            <h1 className="animate-fade-up text-[2.5rem] md:text-6xl lg:text-7xl font-display font-black text-gray-900 leading-[1.05] tracking-tight">
              Fresh Fish,<br />
              <span className="bg-gradient-to-r from-[#083850] via-primary-600 to-[#289098] bg-clip-text text-transparent text-shimmer-hover">
                Delivered to You
              </span>
            </h1>

            <p className="animate-fade-up delay-200 mt-4 md:mt-6 text-sm md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed px-2">
              Order fresh fish from trusted local vendors. Choose your cutting style and enjoy the freshest catch.
            </p>

            <div className="animate-fade-up delay-300 mt-7 md:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 px-2">
              <Link to={homeLink} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[50px] md:min-h-[54px] px-7 md:px-9 rounded-full text-sm md:text-base font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/35 transition-all duration-300 hover:-translate-y-1 animate-glow">
                  Start Shopping <ChevronRight size={16} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link to={registerLink} className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto min-h-[50px] md:min-h-[54px] px-7 md:px-9 rounded-full text-sm md:text-base font-semibold border border-gray-200/80 hover:border-primary-200 hover:bg-primary-50/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5">
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="animate-fade-in delay-700 mt-10 md:mt-16 flex flex-col items-center text-gray-300">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1.5 font-medium">Explore</span>
              <ArrowDown size={14} className="animate-bounce" />
            </div>
          </div>
        </section>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section className="relative px-4 py-12 md:py-28 bg-gradient-to-b from-gray-50/80 to-white overflow-hidden">
        <FloatingDots />
        <div className="relative max-w-6xl mx-auto">
          <RevealSection>
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl md:text-4xl font-display font-bold text-gray-900">
                Why{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#083850] via-primary-600 to-[#289098] bg-clip-text text-transparent">Ready മീൻ</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 8c30-6 60-4 96-2s68 2 100-2" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" className="opacity-30" />
                  </svg>
                </span>
                ?
              </h2>
              <p className="mt-3 text-sm md:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
                From <span className="text-primary-600 font-semibold">ocean to plate</span> — everything you need for the freshest fish, just a tap away
              </p>
            </div>
          </RevealSection>

          <StaggerReveal className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {features.map(({ icon: Icon, title, desc, color, accent }) => (
              <div key={title} className="group glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 hover:shadow-xl hover:shadow-primary-600/8 transition-all duration-500 hover:-translate-y-2 cursor-default h-full relative overflow-hidden">
                {/* Accent glow on hover */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" style={{ background: accent }} />
                <div className="relative">
                  <div className={`w-11 h-11 md:w-13 md:h-13 rounded-2xl flex items-center justify-center mb-3 md:mb-4 border ${color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                    <Icon size={20} className="md:w-[24px] md:h-[24px]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">{title}</h3>
                  <p className="text-[10.5px] md:text-sm text-gray-500 mt-1.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative py-14 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#062c43] via-[#054569] to-[#1a7a7a]" />
        <div className="absolute inset-0 noise-overlay" />
        <Bubbles />

        {/* Top wave */}
        <WaveSeparator color="white" />

        <div className="relative max-w-4xl mx-auto px-4 pt-6 md:pt-8">
          <RevealSection>
            <div className="text-center mb-8 md:mb-12">
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary-300/80 bg-white/10 px-3 py-1.5 rounded-full mb-3">
                <Anchor size={10} />
                Growing Every Day
              </span>
            </div>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-3 gap-6 md:gap-16">
              <Counter end={50} label="Fish Varieties" icon={Fish} />
              <Counter end={20} label="Trusted Vendors" icon={Users} />
              <Counter end={1000} label="Happy Customers" icon={Heart} suffix="+" />
            </div>
          </RevealSection>
        </div>

        {/* Bottom wave */}
        <WaveSeparator flip color="white" />
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-4 py-14 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-[#0c4a6e]" />
        <div className="absolute inset-0 noise-overlay" />
        <Bubbles />

        <div className="relative max-w-6xl mx-auto">
          <RevealSection>
            <div className="text-center mb-10 md:mb-14">
              <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary-200 bg-white/10 px-3.5 py-1.5 rounded-full mb-3">
                <Waves size={10} />
                Simple Process
              </span>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-white">How It Works</h2>
              <p className="mt-2.5 text-sm md:text-base text-primary-200/80 max-w-md mx-auto">Get fresh fish in 3 simple steps</p>
            </div>
          </RevealSection>

          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[58%] left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex flex-col md:flex-row gap-3.5 md:gap-6 max-w-3xl mx-auto">
            {steps.map(({ num, title, desc, icon: Icon }, i) => (
              <RevealSection key={num} className="flex-1" direction={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
                <div className="glass-card-dark rounded-2xl md:rounded-3xl p-5 md:p-7 hover:bg-white/15 hover:scale-[1.03] transition-all duration-500 h-full flex md:flex-col items-center md:items-start gap-4 md:gap-0">
                  <div className="flex items-center gap-3 md:mb-4">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white text-primary-700 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-base font-bold shadow-lg animate-pulse-dot">
                      {num}
                    </div>
                    <Icon size={20} className="text-primary-300/60 hidden md:block" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm md:text-lg">{title}</h3>
                    <p className="text-xs md:text-sm text-primary-200/70 mt-1">{desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative px-4 py-14 md:py-28 overflow-hidden">
        <WaterDroplets />
        <GradientMesh />
        <RevealSection className="relative">
          <div className="max-w-lg mx-auto text-center">
            <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-7 md:mb-9 animate-ripple">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-50 via-blue-50 to-cyan-50 p-1 md:p-1.5 shadow-2xl shadow-primary-600/15 animate-glow">
                <div className="w-full h-full rounded-full bg-white p-0.5 md:p-1 shadow-inner">
                  <img src="/logo-transparent.png" alt="Ready Meen" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-gray-900">Ready to get started?</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-500 max-w-sm mx-auto px-2 leading-relaxed">
              Join Ready മീൻ today and get the freshest fish delivered to your doorstep.
            </p>
            <div className="mt-7 md:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 px-2">
              <Link to={isAuthenticated ? homeLink : '/register'} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-h-[50px] md:min-h-[54px] px-7 md:px-9 rounded-full text-sm md:text-base font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/35 transition-all duration-300 hover:-translate-y-1"
                >
                  {isAuthenticated ? 'Go to App' : 'Create Free Account'} <ChevronRight size={16} className="ml-1.5" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto min-h-[50px] md:min-h-[54px] px-7 md:px-9 rounded-full text-sm md:text-base font-semibold border border-gray-200 hover:border-primary-200 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Install Banner */}
      <InstallBanner />

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-gray-100 bg-gray-50/50 py-6 md:py-8 pb-safe flex justify-center">
        <div className="flex items-center">
          <img src="/logo-transparent.png" alt="Ready Meen" className="h-10 md:h-12 w-auto object-contain opacity-60 -mr-5" />
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-400">Ready മീൻ &copy; {new Date().getFullYear()}</p>
            <p className="text-[10px] md:text-xs text-gray-300 mt-0.5">Fresh fish, delivered fast.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

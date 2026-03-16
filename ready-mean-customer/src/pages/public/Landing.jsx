import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fish, ShoppingBag, Truck, Shield, ChevronRight, Scissors, ArrowDown, Heart, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import InstallBanner from '../../components/InstallBanner';

const features = [
  { icon: Fish, title: 'Fresh Daily', desc: 'Sourced fresh every morning from local markets', color: 'bg-sky-50 text-sky-600 border-sky-100' },
  { icon: Scissors, title: 'Custom Cuts', desc: 'Choose your preferred cutting style for each fish', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Delivery or pickup — your convenience', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { icon: Shield, title: 'Quality Assured', desc: 'Verified vendors with quality-checked products', color: 'bg-violet-50 text-violet-600 border-violet-100' },
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

// Animated counter
function Counter({ end, label, icon: Icon }) {
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
          setCount(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-1.5">
        <Icon size={18} className="text-primary-200 md:w-[22px] md:h-[22px]" />
      </div>
      <div className="text-2xl md:text-4xl font-extrabold text-white">{count}+</div>
      <div className="text-[11px] md:text-sm text-primary-200 mt-0.5">{label}</div>
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

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const homeLink = isAuthenticated
    ? user?.role === 'vendor' ? '/vendor' : user?.role === 'admin' ? '/admin' : '/home'
    : '/login';

  return (
    <div className="min-h-[100dvh] bg-white overflow-x-hidden">
      <SwimmingFish />
      {/* Hero background that extends behind header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-primary-50/40 to-white" />

        {/* Animated wave background */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden opacity-[0.06]">
          <svg className="absolute bottom-0 w-[200%] h-full animate-wave" viewBox="0 0 2880 120" fill="none">
            <path d="M0 60c480-40 960 40 1440 0s960-40 1440 0v60H0z" fill="#0284c7" />
          </svg>
          <svg className="absolute bottom-0 w-[200%] h-[80%] animate-wave-slow" viewBox="0 0 2880 100" fill="none">
            <path d="M0 50c360 30 720-30 1080 0s720 30 1080 0 720-30 720 0v50H0z" fill="#0ea5e9" />
          </svg>
        </div>

        {/* Header */}
        <header className="relative z-50">
          <div className="flex items-center justify-between px-4 pt-3 pb-1 md:px-5 md:pt-4 md:pb-2 max-w-6xl mx-auto">
            <div className="flex items-center">
              <img src="/logo-transparent.png" alt="Ready Meen" className="h-24 w-24 md:h-36 md:w-36 object-contain drop-shadow -mr-3 md:-mr-6" />
              <div className="flex flex-col items-center">
                <span className="text-sm md:text-lg font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
                <span className="text-[8px] md:text-[10px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
              </div>
            </div>
            <Link to={homeLink}>
              <Button size="sm" className="min-h-[44px] px-4 md:px-6 text-xs md:text-sm rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:bg-primary-700 transition-all duration-300">
                {isAuthenticated ? 'Open App' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative px-4 pt-2 pb-10 md:pt-12 md:pb-28 overflow-hidden">
          <div className="absolute top-0 right-0 w-60 md:w-96 h-60 md:h-96 bg-primary-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 md:w-80 h-48 md:h-80 bg-blue-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          <WaterDroplets />

          {/* Floating decorations — hidden on small mobile */}
          <div className="hidden sm:block absolute top-20 left-[8%] animate-float opacity-10">
            <Fish size={48} className="text-primary-600" />
          </div>
          <div className="hidden sm:block absolute top-40 right-[10%] animate-float delay-300 opacity-10">
            <Fish size={36} className="text-primary-500 -scale-x-100" />
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            <h1 className="animate-fade-up text-3xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Fresh Fish,<br />
              <span className="bg-gradient-to-r from-[#083850] via-primary-600 to-[#289098] bg-clip-text text-transparent">
                Delivered to You
              </span>
            </h1>

            <p className="animate-fade-up delay-200 mt-3 md:mt-5 text-sm md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed px-2">
              Order fresh fish from trusted local vendors. Choose your cutting style and enjoy the freshest catch.
            </p>

            <div className="animate-fade-up delay-300 mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 px-2">
              <Link to={homeLink} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[48px] md:min-h-[52px] px-6 md:px-8 rounded-full text-sm md:text-base font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5 animate-glow">
                  Start Shopping <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto min-h-[48px] md:min-h-[52px] px-6 md:px-8 rounded-full text-sm md:text-base font-semibold border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300">
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="animate-fade-in delay-700 mt-8 md:mt-14 flex flex-col items-center text-gray-300">
              <span className="text-[10px] md:text-xs uppercase tracking-widest mb-1">Explore</span>
              <ArrowDown size={14} className="animate-bounce" />
            </div>
          </div>
        </section>
      </div>

      {/* Features */}
      <section className="relative px-4 py-10 md:py-24 bg-gradient-to-b from-gray-50/80 to-white overflow-hidden">
        <FloatingDots />
        <div className="relative max-w-6xl mx-auto">
          <RevealSection>
            <div className="text-center mb-8 md:mb-12">
              <span className="inline-block text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-2">Features</span>
              <h2 className="text-xl md:text-4xl font-bold text-gray-900">Why Ready മീൻ?</h2>
              <p className="mt-2 text-sm md:text-base text-gray-500 max-w-md mx-auto">Everything you need for the freshest fish</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-5">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <RevealSection key={title} direction={i < 2 ? 'left' : 'right'}>
                <div className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300 hover:-translate-y-1 cursor-default h-full">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-2.5 md:mb-4 border ${color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={18} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs md:text-base">{title}</h3>
                  <p className="text-[10px] md:text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-10 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#083850] via-primary-700 to-[#289098]" />
        <Bubbles />
        <div className="relative max-w-4xl mx-auto px-4">
          <RevealSection>
            <div className="grid grid-cols-3 gap-4 md:gap-12">
              <Counter end={50} label="Fish Varieties" icon={Fish} />
              <Counter end={20} label="Trusted Vendors" icon={Users} />
              <Counter end={1000} label="Happy Customers" icon={Heart} />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-10 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        <Bubbles />

        {/* Wave decoration top */}
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full text-white">
            <path d="M0 60V0c240 40 480 60 720 40S1200 0 1440 30v30H0z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto pt-4 md:pt-8">
          <RevealSection>
            <div className="text-center mb-8 md:mb-12">
              <span className="inline-block text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary-200 bg-white/10 px-3 py-1 rounded-full mb-2">Simple Process</span>
              <h2 className="text-xl md:text-4xl font-bold text-white">How It Works</h2>
              <p className="mt-2 text-sm md:text-base text-primary-200 max-w-md mx-auto">Get fresh fish in 3 simple steps</p>
            </div>
          </RevealSection>

          <div className="flex flex-col md:flex-row gap-3 md:gap-6 max-w-3xl mx-auto">
            {steps.map(({ num, title, desc, icon: Icon }, i) => (
              <RevealSection key={num} className="flex-1" direction={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 h-full flex md:flex-col items-center md:items-start gap-3 md:gap-0">
                  <div className="flex items-center gap-2.5 md:mb-3">
                    <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 bg-white text-primary-700 rounded-lg md:rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                      {num}
                    </div>
                    <Icon size={18} className="text-primary-200 hidden md:block" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm md:text-base">{title}</h3>
                    <p className="text-xs md:text-sm text-primary-200 mt-0.5">{desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>

        {/* Wave decoration bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full text-white">
            <path d="M0 0v60c240-40 480-60 720-40s480 40 720 10V0H0z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-10 md:py-24 overflow-hidden">
        <WaterDroplets />
        <RevealSection className="relative">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary-50 to-blue-50 p-1 md:p-1.5 mx-auto mb-6 md:mb-8 shadow-xl shadow-primary-600/10 animate-glow">
              <div className="w-full h-full rounded-full bg-white p-0.5 md:p-1 shadow-inner">
                <img src="/logo-transparent.png" alt="Ready Meen" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">Ready to get started?</h2>
            <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-500 max-w-sm mx-auto px-2">
              Join Ready മീൻ today and get the freshest fish delivered to your doorstep.
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 px-2">
              <Link to={isAuthenticated ? homeLink : '/register'} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] md:min-h-[52px] px-6 md:px-8 rounded-full text-sm md:text-base font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {isAuthenticated ? 'Go to App' : 'Create Free Account'} <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto min-h-[48px] md:min-h-[52px] px-6 md:px-8 rounded-full text-sm md:text-base font-semibold border border-gray-200 hover:border-primary-200 transition-all duration-300">
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

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/50 py-6 md:py-8 text-center pb-safe">
        <img src="/logo-transparent.png" alt="Ready Meen" className="h-10 md:h-12 w-auto object-contain mx-auto mb-2 opacity-60" />
        <p className="text-xs md:text-sm text-gray-400">Ready മീൻ &copy; {new Date().getFullYear()}</p>
        <p className="text-[10px] md:text-xs text-gray-300 mt-0.5">Fresh fish, delivered fast.</p>
      </footer>
    </div>
  );
}

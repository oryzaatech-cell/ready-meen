import { useState, useEffect } from 'react';
import { Camera, Share2, ShoppingBag, ChevronRight, X } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: 'Add Products',
    titleMl: 'ഉൽപ്പന്നങ്ങൾ ചേർക്കുക',
    description: 'Take a photo and add your fish products with price',
    descriptionMl: 'ഫോട്ടോ എടുത്ത് മീൻ ഉൽപ്പന്നങ്ങൾ വിലയോടെ ചേർക്കൂ',
    color: 'from-primary-400 to-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: Share2,
    title: 'Share Your Code',
    titleMl: 'കോഡ് ഷെയർ ചെയ്യൂ',
    description: 'Share your vendor code with customers so they can order from you',
    descriptionMl: 'നിങ്ങളുടെ വെണ്ടർ കോഡ് കസ്റ്റമേഴ്\u200Cസിന് ഷെയർ ചെയ്യൂ',
    color: 'from-violet-400 to-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: ShoppingBag,
    title: 'Get Orders',
    titleMl: 'ഓർഡറുകൾ സ്വീകരിക്കൂ',
    description: 'Customers will order and you\'ll see it in your Orders tab',
    descriptionMl: 'കസ്റ്റമേഴ്\u200Cസ് ഓർഡർ ചെയ്യും, ഓർഡറുകൾ ടാബിൽ കാണാം',
    color: 'from-amber-400 to-amber-600',
    bg: 'bg-amber-50',
  },
];

export default function Onboarding({ isOpen, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen && !localStorage.getItem('vendor_onboarding_done')) {
      setVisible(true);
      setCurrentStep(0);
      setFadeKey(0);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!visible) return null;

  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];
  const IconComponent = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setFadeKey(k => k + 1);
      setCurrentStep(s => s + 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('vendor_onboarding_done', 'true');
    setVisible(false);
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(18,24,32,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
        {/* Skip */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-surface-300 hover:text-surface-500 hover:bg-surface-100 transition-all"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center pt-8 pb-1">
          <img src="/logo-transparent.png" alt="Ready Meen" className="h-20 w-20 object-contain drop-shadow -mr-3" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-extrabold bg-gradient-to-r from-[#083850] via-[#286890] to-[#289098] bg-clip-text text-transparent leading-tight">Ready മീൻ</span>
            <span className="text-[7px] font-semibold text-primary-700 tracking-[0.25em] uppercase italic">ready.to.cook</span>
          </div>
        </div>

        {/* Step content */}
        <div key={fadeKey} className="px-8 pt-5 pb-6 flex flex-col items-center text-center" style={{ animation: 'onb-enter 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          {/* Icon */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6`} style={{ boxShadow: '0 8px 30px rgba(6,198,178,0.15)' }}>
            <IconComponent size={34} className="text-white" strokeWidth={1.7} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-surface-900 mb-1 leading-snug">{step.title}</h2>
          <p className="text-sm font-medium text-primary-600 mb-3">{step.titleMl}</p>

          {/* Description */}
          <p className="text-sm text-surface-500 leading-relaxed mb-1">{step.description}</p>
          <p className="text-[13px] text-surface-400 leading-relaxed">{step.descriptionMl}</p>
        </div>

        {/* Bottom bar */}
        <div className="px-8 pb-8 flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`block h-2 rounded-full transition-all duration-400 ${
                  idx === currentStep
                    ? 'w-7 bg-gradient-to-r from-primary-400 to-primary-600'
                    : idx < currentStep
                    ? 'w-2 bg-primary-200'
                    : 'w-2 bg-surface-200'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 active:scale-[0.97] transition-all"
          >
            {isLastStep ? (
              <span>Get Started · തുടങ്ങാം</span>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes onb-enter {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

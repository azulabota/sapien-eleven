import { useEffect, useRef, useState } from 'react';

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120);
            });
          }
        });
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative py-32 px-6"
    >
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(202,60,61,0.06) 0%, transparent 65%)',
        }}
      />
      <div className="gradient-line absolute top-0 left-0 right-0" />

      <div className="max-w-2xl mx-auto w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-5">
          <p className="section-label reveal">Early Access</p>
          <h2
            className="reveal font-display text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'rgba(235,235,235,0.97)' }}
          >
            Get updates{' '}
            <span className="text-glow" style={{ color: '#CA3C3D' }}>
              as we build.
            </span>
          </h2>
          <p
            className="reveal font-body text-lg leading-relaxed"
            style={{ color: 'rgba(120,120,120,1)' }}
          >
            Early access, milestones, and launch announcements — delivered as Sapien Eleven comes to life.
          </p>
        </div>

        {/* Form */}
        <div className="reveal">
          {submitted ? (
            <div
              className="p-8 rounded text-center"
              style={{
                background: 'rgba(202,60,61,0.04)',
                border: '1px solid rgba(202,60,61,0.2)',
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="node-dot" />
                <p
                  className="font-display text-sm tracking-wider"
                  style={{ color: '#CA3C3D', letterSpacing: '0.12em' }}
                >
                  YOU ARE CONNECTED.
                </p>
              </div>
              <p className="font-body text-sm" style={{ color: 'rgba(120,120,120,1)' }}>
                We have your email. You will hear from us when it matters.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-cyber flex-1"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Sign Up
              </button>
            </form>
          )}

          {error && (
            <p className="mt-3 font-ui text-xs" style={{ color: 'rgba(220,80,80,0.8)' }}>
              {error}
            </p>
          )}

          {!submitted && (
            <p
              className="mt-4 font-ui text-xs tracking-wider"
              style={{ color: 'rgba(90,90,90,1)', letterSpacing: '0.12em' }}
            >
              NO SPAM. EVER.
            </p>
          )}
        </div>

        {/* Node decoration */}
        <div className="reveal flex items-center justify-center gap-4 pt-4">
          <div className="gradient-line flex-1" />
          <div className="flex gap-2 items-center">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(160,160,160,0.25)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(202,60,61,0.7)', boxShadow: '0 0 8px rgba(202,60,61,0.5)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(160,160,160,0.25)' }} />
          </div>
          <div className="gradient-line flex-1" />
        </div>
      </div>
    </section>
  );
}

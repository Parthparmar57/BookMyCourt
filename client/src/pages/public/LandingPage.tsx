import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { crmApi } from '../../services/api';
import { MOCK_PLANS, MOCK_COURTS, MOCK_PRODUCTS } from '../../data/mockData';
import {
  Trophy,
  Calendar,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Utensils,
  Zap,
  Users,
  MapPin,
  Phone,
  Mail,
  Star,
  Play
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const { showSuccess, showError } = useToast();

  // Trial Booking Form State
  const [trialName, setTrialName] = useState('');
  const [trialPhone, setTrialPhone] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const [trialSport, setTrialSport] = useState<'Tennis' | 'Padel' | 'Badminton' | 'Squash'>('Tennis');
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);

  // Enquiry Form State
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialName || !trialPhone || !trialEmail) {
      showError('Please fill in all fields.');
      return;
    }
    setIsSubmittingTrial(true);
    try {
      await crmApi.createLead({
        name: trialName,
        phone: trialPhone,
        email: trialEmail,
        source: 'trial',
        interestSport: trialSport,
        assignedStaff: 'Ananya Deshmukh'
      });
      showSuccess('Trial Session Requested!', 'Our team will contact you within 2 hours to confirm your court slot.');
      setTrialName('');
      setTrialPhone('');
      setTrialEmail('');
    } catch (err: any) {
      showError('Failed to submit trial booking', err.message);
    } finally {
      setIsSubmittingTrial(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName || !enquiryPhone) {
      showError('Please enter your name and phone number.');
      return;
    }
    setIsSubmittingEnquiry(true);
    try {
      await crmApi.createLead({
        name: enquiryName,
        phone: enquiryPhone,
        email: 'enquiry@championsclub.in',
        source: 'website',
        interestSport: 'Tennis',
        assignedStaff: 'Ananya Deshmukh',
        notes: enquiryMessage
      });
      showSuccess('Enquiry Submitted!', 'Thank you for reaching out to Champions Club.');
      setEnquiryName('');
      setEnquiryPhone('');
      setEnquiryMessage('');
    } catch (err: any) {
      showError('Submission failed', err.message);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* 1. GLASSMOPHIC PUBLIC NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/80 h-20 px-6 lg:px-12 flex items-center justify-between shadow-2xs">
        {/* Brand Logo: Desktop (Full Logo) & Mobile (Favicon/Short Logo) */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img
            src="/bookmycourt_logo.jpg"
            alt="BookMyCourt"
            className="h-10 sm:h-12 w-auto object-contain hidden sm:block"
          />
          <img
            src="/my_fevicon_logo.png"
            alt="BookMyCourt"
            className="h-10 w-10 object-contain sm:hidden"
          />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
          <a href="#sports" className="hover:text-primary transition-colors">Sports & Courts</a>
          <a href="#availability" className="hover:text-primary transition-colors">Live Availability</a>
          <a href="#membership" className="hover:text-primary transition-colors">Membership Tiers</a>
          <a href="#shop" className="hover:text-primary transition-colors">Gear Shop</a>
          <a href="#experience" className="hover:text-primary transition-colors">Club Experience</a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              switchRole('member');
              navigate('/member');
            }}
          >
            Member Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              switchRole('frontdesk');
              navigate('/staff/frontdesk/bookings');
            }}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Book a Court
          </Button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface/60 via-white to-white py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>The Premier Sports & Racquet OS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              YOUR GAME.<br />
              YOUR CLUB.<br />
              <span className="text-primary">YOUR SPACE.</span>
            </h1>

            <p className="text-lg text-text-secondary max-w-xl font-normal leading-relaxed">
              Book world-class courts, explore dynamic membership plans, order pro gear, and experience seamless cafeteria tabs — all unified in one digital operating system.
            </p>

            {/* Quick Status Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="p-3 rounded-lg bg-surface border border-border">
                <div className="text-xs text-text-muted font-medium">Courts Available</div>
                <div className="text-lg font-extrabold text-primary font-mono mt-0.5">6 Courts</div>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border">
                <div className="text-xs text-text-muted font-medium">Active Members</div>
                <div className="text-lg font-extrabold text-foreground font-mono mt-0.5">400+</div>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border">
                <div className="text-xs text-text-muted font-medium">Double Bookings</div>
                <div className="text-lg font-extrabold text-emerald-600 font-mono mt-0.5">Strictly 0</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                variant="primary"
                size="hero"
                onClick={() => {
                  switchRole('frontdesk');
                  navigate('/staff/frontdesk/bookings');
                }}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Book Court Now
              </Button>
              <a href="#membership">
                <Button variant="secondary" size="hero">
                  Explore Memberships
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Hero Real Sports Photography Composite */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800"
                alt="Tennis Match at Champions Club"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <Badge variant="accent" size="sm" className="w-fit mb-2">Center Court 01</Badge>
                <h3 className="text-xl font-bold">State-of-the-Art Racquet Arena</h3>
                <p className="text-xs text-white/80 mt-1">LED Championship Lighting • Climate Control • Shock-Absorbent Turf</p>
              </div>
            </div>

            {/* Overlay Badge Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-border flex items-center gap-3.5 hidden sm:flex">
              <div className="p-3 bg-accent-muted text-primary rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Instant Desk Check-In</div>
                <div className="text-[11px] text-text-muted">Sub-second Member QR Scanning</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. SPORTS & COURTS SHOWCASE */}
      <section id="sports" className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="success">World-Class Arenas</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Configured for Multi-Sport Excellence
            </h2>
            <p className="text-sm text-text-secondary">
              Professional courts designed for tournament play, casual matches, and Friday Social Play gatherings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Tennis Courts',
                rate: '₹800 / hr',
                desc: 'Championship hard and clay courts equipped with automated 30-minute interval grid management.',
                img: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?auto=format&fit=crop&q=80&w=600',
                tag: '2 Courts'
              },
              {
                title: 'Padel Glass Courts',
                rate: '₹1,200 / hr',
                desc: 'Panoramic glass padel arenas with integrated Friday Social Play multi-player session features.',
                img: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600',
                tag: '2 Courts'
              },
              {
                title: 'Badminton Arenas',
                rate: '₹500 / hr',
                desc: 'High-visibility wooden flooring with BWF-compliant synthetic mats and high-bay lighting.',
                img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
                tag: '2 Arenas'
              }
            ].map((sport, idx) => (
              <Card key={idx} hoverable className="p-0 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={sport.img}
                    alt={sport.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-foreground">
                    {sport.tag}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{sport.title}</h3>
                    <span className="text-sm font-extrabold text-primary font-mono">{sport.rate}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{sport.desc}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 text-primary font-bold hover:bg-transparent"
                    onClick={() => {
                      switchRole('frontdesk');
                      navigate('/staff/frontdesk/bookings');
                    }}
                  >
                    View Availability Grid ➔
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE AVAILABILITY PREVIEW */}
      <section id="availability" className="py-16 px-6 lg:px-12 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="success">Live Slot Matrix</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-2">
                Real-Time Court Availability
              </h2>
              <p className="text-xs text-text-muted mt-1">30-minute interval start times • Instant booking collision check</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                switchRole('frontdesk');
                navigate('/staff/frontdesk/bookings');
              }}
            >
              Open Full Booking Grid
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_COURTS.slice(0, 6).map(court => (
              <Card key={court.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{court.name}</h4>
                    <span className="text-xs text-text-muted">{court.sport}</span>
                  </div>
                  <Badge variant={court.status === 'open' ? 'success' : 'neutral'}>
                    {court.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-text-muted uppercase">Today's Slots</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['06:00 AM', '07:00 AM', '06:00 PM'].map((slot, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          switchRole('frontdesk');
                          navigate('/staff/frontdesk/bookings');
                        }}
                        className="p-1.5 rounded text-[11px] font-mono font-bold text-center bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white cursor-pointer transition-all"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MEMBERSHIP TIERS SHOWCASE */}
      <section id="membership" className="py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="accent">Membership Tiers</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Choose Your Champions Plan
            </h2>
            <p className="text-sm text-text-secondary">
              Dynamic plan benefits auto-apply discounts across Court Reservations, Gear Shop, and Cafeteria Tabs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {MOCK_PLANS.map(plan => (
              <Card
                key={plan.id}
                className={`p-6 flex flex-col justify-between relative ${
                  plan.popular ? 'border-2 border-primary shadow-xl ring-2 ring-primary/20' : 'border border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    MOST POPULAR
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">{plan.name} Plan</h3>
                    <p className="text-xs text-text-muted mt-1">{plan.description}</p>
                  </div>

                  <div className="border-y border-border py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold font-mono text-foreground">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-text-muted font-medium">/ month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-text-secondary">
                    <li className="flex items-center gap-2 font-semibold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{plan.courtDiscountPercent}% Discount on Court Rates</span>
                    </li>
                    <li className="flex items-center gap-2 font-semibold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{plan.shopDiscountPercent}% Off at Gear Shop</span>
                    </li>
                    <li className="flex items-center gap-2 font-semibold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{plan.barDiscountPercent}% Off at Bar & Cafeteria</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Max {plan.maxBookingsPerDay} Reservations / Day</span>
                    </li>
                    {plan.ageLimitMax && (
                      <li className="flex items-center gap-2 text-warning font-bold">
                        <CheckCircle2 className="w-4 h-4 text-warning shrink-0" />
                        <span>Strictly Under {plan.ageLimitMax + 1} Years Only</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-border">
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => {
                      switchRole('member');
                      navigate('/member');
                    }}
                  >
                    Select {plan.name} Plan
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. GEAR SHOP PREVIEW */}
      <section id="shop" className="py-16 px-6 lg:px-12 bg-surface">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <Badge variant="success">Omnichannel Retail</Badge>
              <h2 className="text-2xl font-extrabold text-foreground mt-1">Official Gear Shop</h2>
              <p className="text-xs text-text-muted">Shared inventory pool across Counter POS and Online Store</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/shop')}>
              Browse Full Shop ➔
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_PRODUCTS.slice(0, 4).map(prod => (
              <Card key={prod.id} hoverable className="p-3.5 flex flex-col justify-between">
                <div>
                  <div className="h-36 rounded-lg overflow-hidden bg-white mb-3">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <Badge variant="neutral" size="sm">{prod.category}</Badge>
                  <h4 className="text-xs font-bold text-foreground mt-2 line-clamp-2">{prod.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                  <span className="text-sm font-extrabold font-mono text-primary">₹{prod.price.toLocaleString('en-IN')}</span>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Buy</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRIAL BOOKING LEAD CAPTURE FORM */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-[#1C1F1D] to-[#2B302D] text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Badge variant="accent">Free Trial Session</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight">Experience Champions Club</h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Request a free 30-minute court trial session. Our front desk staff will contact you to confirm court availability.
            </p>
            <div className="space-y-2 text-xs text-white/80 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Complimentary racket & ball rental included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>Full access to cafeteria & fresh juice bar</span>
              </div>
            </div>
          </div>

          <Card className="p-6 bg-white text-foreground">
            <form onSubmit={handleTrialSubmit} className="space-y-4">
              <h3 className="text-lg font-bold">Book a Trial Session</h3>
              <Input
                label="Full Name *"
                placeholder="e.g. Siddharth Roy"
                value={trialName}
                onChange={e => setTrialName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Phone *"
                  placeholder="+91 98765 43210"
                  value={trialPhone}
                  onChange={e => setTrialPhone(e.target.value)}
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="siddharth@gmail.com"
                  value={trialEmail}
                  onChange={e => setTrialEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-text-secondary">Select Sport</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Tennis', 'Padel', 'Badminton', 'Squash'] as const).map(sport => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => setTrialSport(sport)}
                      className={`py-1.5 px-2 rounded text-xs font-bold border ${
                        trialSport === sport ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="primary" type="submit" className="w-full" isLoading={isSubmittingTrial}>
                Request Trial Session
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#141615] text-white/80 py-12 px-6 lg:px-12 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/bookmycourt_logo.jpg"
                alt="BookMyCourt"
                className="h-10 w-auto object-contain bg-white p-1 rounded-md"
              />
            </div>
            <p className="text-white/60 leading-relaxed">
              Digital Club Operating System for modern racquet & sports clubs.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Quick Links</h4>
            <ul className="space-y-1.5 text-white/60">
              <li><a href="#sports" className="hover:text-primary">Sports & Arenas</a></li>
              <li><a href="#availability" className="hover:text-primary">Live Availability</a></li>
              <li><a href="#membership" className="hover:text-primary">Membership Plans</a></li>
              <li><a href="#shop" className="hover:text-primary">Gear Shop</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Sports Configured</h4>
            <ul className="space-y-1.5 text-white/60">
              <li>Tennis (Center Court 01 & Hard Court)</li>
              <li>Padel (Glass Courts 01 & 02)</li>
              <li>Badminton (Arenas A & B)</li>
              <li>Squash & Table Tennis</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Contact & Location</h4>
            <p className="text-white/60">Champions Sports Complex, Worli, Mumbai, Maharashtra 400018</p>
            <p className="text-white/60">Phone: +91 98200 11223</p>
            <p className="text-white/60">Email: info@championsclub.in</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/10 text-center text-white/40 text-[11px]">
          © 2026 Champions Club (Digital Club OS). Inspired by CourtReserve UX. Built with PERN Architecture.
        </div>
      </footer>
    </div>
  );
};

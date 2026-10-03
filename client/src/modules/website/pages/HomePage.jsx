import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  ShoppingBag,
  Coffee,
  Lightbulb,
  CalendarBlank,
  EnvelopeSimple,
  CaretRight,
  CheckCircle,
  Star,
  Sparkle,
  PaperPlaneRight,
  WarningCircle,
  CircleNotch,
  Bank,
  Globe,
  GraduationCap,
  ChartBar,
  DeviceMobile,
  Receipt,
  LockKey,
  Stack,
  TrendUp,
  CreditCard
} from '@phosphor-icons/react';
import {
  usePublicPlans,
  usePublicShop,
  usePublicAvailability,
  useBookTrial,
  useSubmitEnquiry
} from '../../../hooks/useCrm';
import { formatCurrency } from '../../../shared/utils/formatters';

export const HomePage = () => {
  // Section 4: Public Plans Data
  const plansQuery = usePublicPlans();
  const fallbackPlans = [
    {
      id: 'gold',
      name: 'Gold Membership',
      price: 2999,
      durationMonths: 1,
      courtRate: 0,
      shopDiscountPct: 20,
      barDiscountPct: 20,
      maxBookingsDay: 4,
      popular: true,
      perks: ['100% Free Court Bookings', '20% Off Gear Shop Purchases', '20% Off Bar & Cafeteria', '14-Day Advance Reservation Window', '4 Daily Booking Slots']
    },
    {
      id: 'silver',
      name: 'Silver Membership',
      price: 1499,
      durationMonths: 1,
      courtRate: 200,
      shopDiscountPct: 10,
      barDiscountPct: 10,
      maxBookingsDay: 2,
      popular: false,
      perks: ['Discounted Court Rate (₹200/hr)', '10% Off Gear Shop Purchases', '10% Off Bar & Cafeteria', '7-Day Advance Reservation Window', '2 Daily Booking Slots']
    },
    {
      id: 'junior',
      name: 'Junior Membership',
      price: 999,
      durationMonths: 1,
      courtRate: 150,
      shopDiscountPct: 15,
      barDiscountPct: 10,
      maxAge: 18,
      popular: false,
      perks: ['Special Junior Court Rate (₹150/hr)', 'For Players Under 18 Years', '15% Off Gear Shop', '10% Off Bar & Cafeteria', 'Access to Weekend Junior Mixers']
    }
  ];
  const plans = plansQuery.data?.length ? plansQuery.data : fallbackPlans;

  // Section 5: Availability Matrix State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const availabilityQuery = usePublicAvailability({ date: selectedDate });
  const liveCourts = availabilityQuery.data || [];

  // Use the live availability grid when the backend returns data; otherwise fall
  // back to the static marketing preview below so the section never looks empty.
  const hasLive = liveCourts.length > 0;
  const liveColumns = (liveCourts[0]?.slots || [])
    .filter((s) => s.slotTime.endsWith(':00'))
    .map((s) => s.slotTime);

  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '17:00', '18:00', '19:00', '20:00'];

  const defaultMatrix = [
    { courtId: 'c1', courtName: 'Center Court 1', sport: 'Tennis', walkInRate: 800 },
    { courtId: 'c2', courtName: 'Indoor Padel Bay 1', sport: 'Padel', walkInRate: 1000 },
    { courtId: 'c3', courtName: 'Badminton Arena 1', sport: 'Badminton', walkInRate: 500 },
  ];

  // Section 6: Shop Preview Data
  const shopQuery = usePublicShop();
  const fallbackProducts = [
    {
      id: 'p1',
      name: 'Wilson Pro Staff v14 Tennis Racket',
      category: 'Rackets',
      price: 18499,
      stock: 12,
      sku: 'WIL-PS14-PRO',
      imageUrl: '/photo-1622279457486-62dcc4a431d6.avif'
    },
    {
      id: 'p2',
      name: 'Babolat Team Championship Tennis Balls (3-Pack)',
      category: 'Balls',
      price: 649,
      stock: 48,
      sku: 'BAB-BALL-3P',
      imageUrl: '/photo-1595435934249-5df7ed86e1c0.avif'
    },
    {
      id: 'p3',
      name: 'Bullpadel Hack 03 Pro Padel Racket',
      category: 'Padel',
      price: 22999,
      stock: 6,
      sku: 'BULL-HACK-03',
      imageUrl: '/photo-1554068865-24cecd4e34b8.avif'
    },
    {
      id: 'p4',
      name: 'Yonex Astrox 99 Pro Badminton Racket',
      category: 'Badminton',
      price: 15999,
      stock: 8,
      sku: 'YON-AST99-PRO',
      imageUrl: '/photo-1626248801379-51a0748a5f96.avif'
    }
  ];
  const products = (shopQuery.data && shopQuery.data.length > 0) ? shopQuery.data : fallbackProducts;

  // Section 7 & 8: Trial & Enquiry Form State
  const [formType, setFormType] = useState('TRIAL'); // 'TRIAL' | 'ENQUIRY'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    sport: 'Tennis',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '18:00',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const bookTrial = useBookTrial();
  const submitEnquiry = useSubmitEnquiry();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.email?.trim()) {
      setFormError('Please provide your Full Name, 10-digit Phone Number, and Email Address.');
      return;
    }

    try {
      if (formType === 'TRIAL') {
        await bookTrial.mutateAsync({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          sport: formData.sport,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime
        });
      } else {
        await submitEnquiry.mutateAsync({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          interest: formData.sport,
          message: formData.message?.trim() || `General enquiry regarding ${formData.sport} membership at BookMyCourt.`
        });
      }
      setFormSubmitted(true);

    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
        err?.message ||
        'Submission could not be completed. Please check details and try again.'
      );
    }
  };


  const ITEM_PRODUCT_IMAGES = {
    racket_tennis: 'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?auto=format&fit=crop&q=80&w=600',
    racket_padel: 'https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?auto=format&fit=crop&q=80&w=600',
    racket_badminton: 'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&q=80&w=600',
    balls: 'https://images.unsplash.com/photo-1530915536647-759c9044a7b7?auto=format&fit=crop&q=80&w=600',
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    apparel: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600',
    bags: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
    accessories: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=600'
  };

  const getProductImage = (prod, idx = 0) => {
    const name = (prod?.name || '').toLowerCase();
    const cat = (prod?.category || '').toLowerCase();

    // Direct valid non-people equipment URL
    const url = prod?.imageUrl;
    if (url && typeof url === 'string' && url.trim().length > 0 && !url.includes('.avif') && !url.includes('undefined')) {
      return url;
    }

    // 1. Tennis Balls
    if (name.includes('ball') || cat.includes('ball')) {
      return ITEM_PRODUCT_IMAGES.balls;
    }

    // 2. Shoes
    if (name.includes('shoe') || cat.includes('shoe')) {
      return ITEM_PRODUCT_IMAGES.shoes;
    }

    // 3. Apparel
    if (name.includes('apparel') || name.includes('polo') || name.includes('shirt') || cat.includes('apparel')) {
      return ITEM_PRODUCT_IMAGES.apparel;
    }

    // 4. Bags
    if (name.includes('bag') || cat.includes('bag')) {
      return ITEM_PRODUCT_IMAGES.bags;
    }

    // 5. Overgrip / Strings / Accessories
    if (name.includes('grip') || name.includes('string') || name.includes('overgrip') || cat.includes('accessor')) {
      return ITEM_PRODUCT_IMAGES.accessories;
    }

    // 6. Rackets
    if (name.includes('padel') || cat.includes('padel')) {
      return ITEM_PRODUCT_IMAGES.racket_padel;
    }
    if (name.includes('badminton') || name.includes('astrox') || cat.includes('badminton')) {
      return ITEM_PRODUCT_IMAGES.racket_badminton;
    }
    if (name.includes('tennis') || name.includes('pro staff') || name.includes('pure aero') || cat.includes('racket')) {
      const racketVariations = [
        ITEM_PRODUCT_IMAGES.racket_tennis,
        ITEM_PRODUCT_IMAGES.racket_padel,
        ITEM_PRODUCT_IMAGES.racket_badminton,
        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600'
      ];
      return racketVariations[idx % racketVariations.length];
    }

    const allEquipment = Object.values(ITEM_PRODUCT_IMAGES);
    return allEquipment[idx % allEquipment.length];
  };

  return (
    <div className="bg-white overflow-hidden font-sans text-slate-900 selection:bg-[#4A812F] selection:text-white">
      {/* 2. HERO SECTION */}
      <section className="py-8 lg:py-16 px-4 sm:px-8 max-w-7xl mx-auto" id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column (60%) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.16em] uppercase text-[#1f2125] font-mono flex items-center gap-2">
              <span>BOOKINGS • PAYMENTS • MEMBERSHIPS • EVENTS • MOBILE APP</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black text-[#1f2125] tracking-tight leading-[1.08]">
              The future of <br className="hidden sm:inline" />club growth starts here
            </h1>

            <p className="text-base sm:text-lg text-gray-700 font-normal leading-relaxed max-w-xl">
              Join the industry's top club management platform reshaping the way you connect with players and grow your business.
            </p>

            {/* CTAs matching Image 2 reference */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#trial"
                className="px-7 py-3.5 bg-[#1f2125] text-white text-base font-extrabold hover:bg-black transition-all inline-flex items-center gap-2 shadow-md active:scale-95"
              >
                <span>Book a Trial</span>
                <CaretRight weight="bold" className="w-4 h-4 text-emerald-400" />
              </a>

              <a
                href="#plans"
                className="px-7 py-3.5 bg-white text-[#1f2125] border border-[#1f2125] text-base font-extrabold hover:bg-gray-50 transition-all inline-flex items-center gap-2 active:scale-95 shadow-2xs"
              >
                <span>View Plans</span>
                <CaretRight weight="bold" className="w-4 h-4 text-gray-700" />
              </a>
            </div>
          </div>

          {/* Right Column: Hero Graphic Composite */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden bg-white border border-gray-200 shadow-2xl hover:shadow-3xl transition-shadow">
              <img
                src="/9923a9a7-ccb8-44f4-b085-21df8fc8691d.png"
                alt="BookMyCourt Courts & Management System"
                className="w-full h-auto max-h-[480px] object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SUB-HERO STATS RIBBON */}
      <section className="py-12 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#121212] tracking-tight">
            Built for racquet & paddle sports enthusiasts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-[#121212] tracking-tight">
                12 Pro Courts
              </div>
              <div className="text-sm font-bold text-gray-500">
                Tennis, Padel & Badminton
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-[#4A812F] tracking-tight">
                6,000+
              </div>
              <div className="text-sm font-bold text-gray-500">
                Active Club Members
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-[#121212] tracking-tight">
                100% Guaranteed
              </div>
              <div className="text-sm font-bold text-gray-500">
                Zero Double Bookings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT THE CLUB & FACILITIES SECTION */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-14" id="about">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black tracking-widest text-[#4A812F] uppercase font-mono bg-[#EBF7E7] px-3.5 py-1.5 inline-block">
            ABOUT THE CLUB
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#121212] tracking-tight leading-tight">
            Welcome to BookMyCourt
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
            Experience our 3 world-class facilities designed for elite athletic performance, premium equipment, and post-game social relaxation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Facility 1: Courts (Duotone Phosphor Icon) */}
          <div className="bg-white p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#EBF7E7] text-[#4A812F] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <Trophy weight="duotone" className="w-8 h-8 text-[#4A812F]" />
              </div>
              <h3 className="text-2xl font-black text-[#121212] tracking-tight">
                1. World-Class Courts
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                12 professional courts featuring floodlit outdoor acrylic Tennis courts, climate-controlled indoor Padel bays, and BWF-certified Badminton courts.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#4A812F]">
              <span>Tennis • Padel • Badminton</span>
              <CaretRight weight="bold" className="w-4 h-4" />
            </div>
          </div>

          {/* Facility 2: Gear Shop (Duotone Phosphor Icon) */}
          <div className="bg-white p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <ShoppingBag weight="duotone" className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-black text-[#121212] tracking-tight">
                2. Pro Gear Shop
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Fully stocked pro shop carrying Wilson, Babolat, Head, and Bullpadel rackets, court shoes, apparel, balls, and custom stringing services.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Pro Rackets • Shoes • Stringing</span>
              <CaretRight weight="bold" className="w-4 h-4" />
            </div>
          </div>

          {/* Facility 3: Bar & Cafeteria (Duotone Phosphor Icon) */}
          <div className="bg-white p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <Coffee weight="duotone" className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-[#121212] tracking-tight">
                3. Bar & Cafeteria
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Social lounge and cafeteria serving artisan coffee, cold-pressed juices, protein smoothies, and wholesome athlete recovery meals after matches.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Fresh Juices • Coffee • Smoothies</span>
              <CaretRight weight="bold" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEMBERSHIP PLANS & PRICING SECTION */}
      <section className="py-20 px-4 sm:px-8 bg-gray-50 border-t border-gray-200" id="plans">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black tracking-widest text-[#4A812F] uppercase font-mono bg-white border border-gray-200 px-3.5 py-1.5 inline-block">
              MEMBERSHIP PLANS & PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#121212] tracking-tight leading-tight">
              Transparent Club Plans & Privileges
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
              Unlock free court reservations, pro shop discounts, and cafeteria privileges with our membership tiers.
            </p>
          </div>

          {/* 3 Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan) => {
              const isGold = plan.name?.toLowerCase().includes('gold') || plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`p-8 flex flex-col justify-between transition-all relative ${isGold
                      ? 'bg-[#121212] text-white shadow-2xl border-2 border-[#4A812F] transform md:-translate-y-2'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-lg hover:shadow-xl'
                    }`}
                >
                  {isGold && (
                    <div className="absolute -top-4 right-8 bg-[#4A812F] text-white text-xs font-black px-4 py-1.5 shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <Star weight="fill" className="w-3.5 h-3.5 text-white" /> MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-2xl font-black ${isGold ? 'text-white' : 'text-[#121212]'}`}>
                        {plan.name}
                      </h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className={`text-4xl sm:text-5xl font-black ${isGold ? 'text-white' : 'text-[#121212]'}`}>
                          {formatCurrency(Number(plan.price))}
                        </span>
                        <span className={`text-xs font-bold ${isGold ? 'text-gray-400' : 'text-gray-500'}`}>
                          / month
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200/40 space-y-3 text-sm">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle weight="fill" className="w-5 h-5 text-[#4A812F]" />
                        <span>
                          Court Rate:{' '}
                          {Number(plan.courtRate) === 0 ? (
                            <strong className="text-emerald-500 uppercase">100% Free</strong>
                          ) : (
                            `${formatCurrency(Number(plan.courtRate))}/hr`
                          )}
                        </span>
                      </div>

                      {plan.shopDiscountPct > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle weight="fill" className="w-5 h-5 text-[#4A812F]" />
                          <span>Pro Shop Discount: <strong>{plan.shopDiscountPct}% OFF</strong></span>
                        </div>
                      )}

                      {plan.barDiscountPct > 0 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle weight="fill" className="w-5 h-5 text-[#4A812F]" />
                          <span>Bar & Cafeteria: <strong>{plan.barDiscountPct}% OFF</strong></span>
                        </div>
                      )}

                      {plan.maxBookingsDay && (
                        <div className="flex items-center gap-2">
                          <CheckCircle weight="fill" className="w-5 h-5 text-[#4A812F]" />
                          <span>Up to {plan.maxBookingsDay} bookings per day</span>
                        </div>
                      )}

                      {plan.maxAge && (
                        <div className="flex items-center gap-2">
                          <CheckCircle weight="fill" className="w-5 h-5 text-[#4A812F]" />
                          <span>Eligible for players under {plan.maxAge} years</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-8">
                    <a
                      href="#trial"
                      className={`w-full py-3.5 font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${isGold
                          ? 'bg-[#1f2125] text-white hover:bg-black'
                          : 'bg-white text-[#1f2125] border border-[#1f2125] hover:bg-gray-50'
                        }`}
                    >
                      <span>Choose {plan.name}</span>
                      <CaretRight weight="bold" className={`w-4 h-4 ${isGold ? 'text-emerald-400' : 'text-gray-700'}`} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Walk-in Rate Comparison Banner */}
          <div className="max-w-4xl mx-auto bg-white border-2 border-[#4A812F]/40 hover:border-[#4A812F] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#EBF7E7] text-[#4A812F] flex items-center justify-center font-extrabold shrink-0 shadow-2xs">
                <Lightbulb weight="duotone" className="w-6 h-6 text-[#4A812F]" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#1f2125] tracking-tight">Walk-in Guest Rate</h4>
                <p className="text-xs font-semibold text-gray-600 mt-0.5">
                  Non-members pay full walk-in rate of <strong className="text-[#4A812F] font-extrabold">₹800 / hour</strong> per court session.
                </p>
              </div>
            </div>
            <a
              href="#trial"
              className="px-6 py-3 bg-[#1f2125] hover:bg-black text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
            >
              <span>Get Member Discounts</span>
              <CaretRight weight="bold" className="w-4 h-4 text-emerald-400" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. COURT AVAILABILITY THIS WEEK SECTION */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12" id="availability">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black tracking-widest text-[#4A812F] uppercase font-mono bg-[#EBF7E7] px-3.5 py-1.5 inline-block">
            COURT AVAILABILITY THIS WEEK
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight">
            Live Weekly Schedule & Free Slots
          </h2>
          <p className="text-base text-gray-600">
            Read-only grid matrix showing free sessions per court (1-hour slots starting every 30 mins/hourly).
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <label className="text-xs font-bold text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 px-3.5 py-2 text-xs font-extrabold focus:border-[#4A812F] focus:outline-none bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* Weekly Read-only Grid Table */}
        <div className="bg-white border border-gray-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121212] text-white text-xs uppercase font-mono tracking-wider">
                  <th className="p-4 sticky left-0 bg-[#121212] z-10">Court Name</th>
                  <th className="p-4">Sport</th>
                  <th className="p-4">Rate</th>
                  {(hasLive ? liveColumns : timeSlots).map((time) => (
                    <th key={time} className="p-4 whitespace-nowrap text-center">{time}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {(hasLive ? liveCourts : defaultMatrix).map((court) => {
                  return (
                    <tr key={court.courtId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-extrabold text-[#121212] sticky left-0 bg-white shadow-2xs">
                        {court.courtName}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-[11px] font-extrabold">
                          {court.sport}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-[#4A812F]">
                        ₹{court.walkInRate}/hr
                      </td>
                      {(hasLive ? liveColumns : timeSlots).map((time) => {
                        // LIVE grid: look up the real slot for this time and show its true state.
                        if (hasLive) {
                          const slot = court.slots.find((s) => s.slotTime === time);
                          if (!slot) return <td key={time} className="p-3 text-center text-gray-300">—</td>;
                          if (!slot.isAvailable) {
                            const social = slot.bookingType === 'SOCIAL';
                            return (
                              <td key={time} className="p-3 text-center">
                                <span className={`px-2.5 py-1.5 font-extrabold text-[10px] block border ${social
                                  ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                                  : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                                  {social ? 'Social Play' : 'Booked'}
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={time} className="p-3 text-center">
                              <a
                                href="#trial"
                                className="px-2.5 py-1.5 bg-[#EBF7E7] border border-[#d6ebd3] text-[#2d6215] font-extrabold text-[10px] block hover:bg-[#4A812F] hover:text-white transition-colors"
                              >
                                Free Slot
                              </a>
                            </td>
                          );
                        }

                        // FALLBACK preview (no live data yet): illustrative sample cells.
                        const isFridaySocial = time === '18:00' && court.sport === 'Padel';
                        const isBooked = (time === '09:00' || time === '17:00') && court.sport === 'Tennis';

                        if (isFridaySocial) {
                          return (
                            <td key={time} className="p-3 text-center">
                              <span className="px-2.5 py-1.5 bg-indigo-100 border border-indigo-300 text-indigo-900 font-extrabold text-[10px] inline-flex items-center gap-1 shadow-2xs">
                                <CalendarBlank weight="duotone" className="w-4 h-4 text-indigo-700" />
                                <span>Friday Social Play</span>
                              </span>
                            </td>
                          );
                        }

                        if (isBooked) {
                          return (
                            <td key={time} className="p-3 text-center">
                              <span className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] block">
                                Booked
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={time} className="p-3 text-center">
                            <a
                              href="#trial"
                              className="px-2.5 py-1.5 bg-[#EBF7E7] border border-[#d6ebd3] text-[#2d6215] font-extrabold text-[10px] block hover:bg-[#4A812F] hover:text-white transition-colors"
                            >
                              Free Slot
                            </a>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1.5">
              <Sparkle weight="fill" className="w-4 h-4 text-[#4A812F]" />
              <span>Friday Social Play is open to all members & trial guests from 6:00 PM onwards.</span>
            </span>
            <Link to="/availability" className="text-[#4A812F] underline hover:text-[#3d6b27]">
              View Full Live Interactive Grid →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SHOP PREVIEW SECTION */}
      <section className="py-20 px-4 sm:px-8 bg-gray-50 border-t border-gray-200" id="shop">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black tracking-widest text-[#4A812F] uppercase font-mono bg-white border border-gray-200 px-3.5 py-1.5 inline-block">
                PRO SHOP PREVIEW
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight">
                Gear, Rackets & Apparel
              </h2>
              <p className="text-base text-gray-600 max-w-xl">
                Product categories: Rackets, Balls, Shoes, Accessories & Apparel available in-club and online.
              </p>
            </div>

            <Link
              to="/shop"
              className="px-6 py-3.5 bg-[#1f2125] hover:bg-black text-white font-extrabold text-sm flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
            >
              <span>Visit Gear Shop</span>
              <CaretRight weight="bold" className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>

          {/* Featured Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {products.slice(0, 4).map((prod, idx) => (
              <div
                key={prod.id}
                className="bg-white border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={getProductImage(prod, idx)}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#121212] text-white text-[10px] font-black px-2.5 py-1 uppercase font-mono shadow-md">
                    {prod.category}
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block">SKU: {prod.sku}</span>
                    <h4 className="font-extrabold text-[#121212] text-base line-clamp-2 mt-0.5">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-[#121212]">
                        {formatCurrency(Number(prod.price))}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-800">
                        {prod.stock} In Stock
                      </span>
                    </div>

                    <Link
                      to="/shop"
                      className="w-full py-2.5 bg-[#EBF7E7] hover:bg-[#4A812F] text-[#2d6215] hover:text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag weight="duotone" className="w-4 h-4" />
                      <span>View Product</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 & 8. BOOK A TRIAL / CONTACT & ENQUIRY SECTION */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto" id="trial">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-2xl p-8 sm:p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs font-black tracking-widest text-[#4A812F] uppercase font-mono bg-[#EBF7E7] px-3.5 py-1.5 inline-block">
              BOOK A TRIAL & ENQUIRIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight">
              Get Started at BookMyCourt
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Submit your request on the spot. Saved directly to our concierge team so someone gets in touch immediately!
            </p>

            {/* Toggle Tabs */}
            <div className="inline-flex p-1 bg-gray-100 border border-gray-200 mt-2">
              <button
                type="button"
                onClick={() => setFormType('TRIAL')}
                className={`px-6 py-2.5 font-extrabold text-xs transition-all flex items-center gap-2 ${formType === 'TRIAL'
                    ? 'bg-[#4A812F] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <CalendarBlank weight="duotone" className="w-4 h-4" />
                <span>Book a Trial Session</span>
              </button>
              <button
                type="button"
                onClick={() => setFormType('ENQUIRY')}
                className={`px-6 py-2.5 font-extrabold text-xs transition-all flex items-center gap-2 ${formType === 'ENQUIRY'
                    ? 'bg-[#4A812F] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <EnvelopeSimple weight="duotone" className="w-4 h-4" />
                <span>General Enquiry</span>
              </button>
            </div>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4 animate-in fade-in">
              <CheckCircle weight="fill" className="w-16 h-16 text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-black text-gray-900">
                {formType === 'TRIAL' ? 'Trial Request Saved!' : 'Enquiry Received!'}
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Thank you, <strong>{formData.name}</strong>. Our staff has been notified and will call you on <strong>{formData.phone}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', sport: 'Tennis', preferredDate: new Date().toISOString().split('T')[0], preferredTime: '18:00', message: '' });
                }}
                className="px-6 py-2.5 bg-[#4A812F] text-white font-extrabold text-xs hover:bg-[#3d6b27] transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs font-semibold text-gray-800" id="contact">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 flex items-center gap-3">
                  <WarningCircle weight="fill" className="w-5 h-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1.5 font-extrabold text-[#121212]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 focus:border-[#4A812F] focus:outline-none bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-extrabold text-[#121212]">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9820011223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 focus:border-[#4A812F] focus:outline-none bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1.5 font-extrabold text-[#121212]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 focus:border-[#4A812F] focus:outline-none bg-white text-sm"
                  />
                </div>


                <div>
                  <label className="block mb-1.5 font-extrabold text-[#121212]">
                    Preferred Sport
                  </label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 focus:border-[#4A812F] focus:outline-none bg-white text-sm"
                  >
                    <option value="Tennis">Tennis</option>
                    <option value="Padel">Padel</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Pickleball">Pickleball</option>
                  </select>
                </div>
              </div>

              {formType === 'TRIAL' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1.5 font-extrabold text-[#121212]">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-3 focus:border-[#4A812F] focus:outline-none bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-extrabold text-[#121212]">
                      Preferred Time Slot *
                    </label>
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-3 focus:border-[#4A812F] focus:outline-none bg-white text-sm"
                    >
                      <option value="07:00">07:00 AM Morning</option>
                      <option value="09:00">09:00 AM Morning</option>
                      <option value="17:00">05:00 PM Evening</option>
                      <option value="18:00">06:00 PM Evening</option>
                      <option value="19:00">07:00 PM Evening</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block mb-1.5 font-extrabold text-[#121212]">
                    Enquiry Message / Questions *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your requirements or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 focus:border-[#4A812F] focus:outline-none bg-white text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={bookTrial.isPending || submitEnquiry.isPending}
                className="w-full py-4 bg-[#1f2125] hover:bg-black text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {bookTrial.isPending || submitEnquiry.isPending ? (
                  <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                ) : (
                  <PaperPlaneRight weight="fill" className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {formType === 'TRIAL' ? 'Submit Trial Session Request' : 'Send General Enquiry'}
                </span>
                <CaretRight weight="bold" className="w-4 h-4 text-emerald-400" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 4. DARK CHARCOAL CARD CONTAINER & TRAILER VIDEO */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="bg-[#1c1d1f] text-white p-8 sm:p-12 lg:p-16 max-w-6xl mx-auto shadow-2xl space-y-12 border border-gray-800/80">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              See what you can do <br className="hidden sm:block" /> with BookMyCourt
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Court Reservations', icon: Bank, link: '#availability' },
              { name: 'Public Booking', icon: Globe, link: '#availability' },
              { name: 'Lessons & Trials', icon: GraduationCap, link: '#trial' },
              { name: 'Events & Programming', icon: CalendarBlank, link: '#trial' },
              { name: 'Memberships', icon: CreditCard, link: '#plans' },
              { name: 'Leagues & Ladders', icon: ChartBar, link: '#trial' },
              { name: 'Branded Mobile App', icon: DeviceMobile, link: '#trial' },
              { name: 'Invoicing & Batch Billing', icon: Receipt, link: '/admin' },
              { name: 'Pro Shop & POS', icon: ShoppingBag, link: '#shop' },
              { name: 'Access Control', icon: LockKey, link: '/admin' },
              { name: 'Integrations', icon: Stack, link: '#trial' },
              { name: 'Reporting', icon: TrendUp, link: '/admin' },
            ].map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <a
                  key={idx}
                  href={feat.link}
                  className="bg-[#2d3036] hover:bg-[#383b42] border border-gray-700/60 p-4 px-6 flex items-center gap-4 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-[#4A812F] transition-colors shadow-2xs">
                    <IconComponent weight="duotone" className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                    {feat.name}
                  </span>
                </a>
              );
            })}
          </div>

          {/* Video Container with Autoplay & Mouse Hover Effect */}
          <div className="pt-4">
            <div className="relative border-2 border-white/90 hover:border-[#4A812F] bg-[#0c0d0f] overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(74,129,47,0.3)] aspect-video max-w-4xl mx-auto transition-all duration-500 transform hover:scale-[1.02] group">
              <video
                src="/gemini_generated_video_8dec1fae.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
              >
                Your browser does not support HTML5 video player.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* PLAYER EXPERIENCE SECTION */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white">
        <div className="bg-[#f0f7ef] text-gray-900 p-8 sm:p-14 max-w-6xl mx-auto shadow-xs border border-[#d6ebd3] space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black tracking-widest text-[#2d6215] uppercase font-mono block">
              PLAYER EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#121212] tracking-tight leading-tight">
              Players feel the BookMyCourt difference
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto items-end pt-4">
            <div className="text-center space-y-4 group">
              <h3 className="text-xl font-extrabold text-[#121212]">Book</h3>
              <img
                src="/Homepage-Mobile-Images_CourtReserve_Book.png"
                alt="Book Court Mobile Screen"
                className="w-full max-w-[240px] mx-auto drop-shadow-xl group-hover:-translate-y-2 transition-transform"
              />
            </div>

            <div className="text-center space-y-4 group">
              <h3 className="text-xl font-extrabold text-[#121212]">Pay</h3>
              <img
                src="/Homepage-Mobile-Images_CourtReserve_Pay.png"
                alt="Payment Mobile Screen"
                className="w-full max-w-[240px] mx-auto drop-shadow-xl group-hover:-translate-y-2 transition-transform"
              />
            </div>

            <div className="text-center space-y-4 group">
              <h3 className="text-xl font-extrabold text-[#121212]">Replay</h3>
              <img
                src="/Homepage-Mobile-Images_CourtReserve_Replay.png"
                alt="Replay Screen"
                className="w-full max-w-[240px] mx-auto drop-shadow-xl group-hover:-translate-y-2 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CTA BANNER */}
      <section className="py-16 sm:py-20 px-6 lg:px-16 bg-[#18191c] text-white border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.08]">
              Grow your club on <br className="hidden sm:inline" />BookMyCourt
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
              Bookings, memberships, shop POS & court scheduling — all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto shrink-0 justify-center lg:justify-end">
            <a
              href="#trial"
              className="bg-[#1f2125] hover:bg-black text-white p-6 w-full sm:w-60 h-40 flex flex-col justify-end transition-all transform hover:-translate-y-1 shadow-2xl group border border-gray-800"
            >
              <div className="flex items-center justify-between text-xl font-black text-white">
                <span>Book a Trial</span>
                <CaretRight weight="bold" className="w-6 h-6 text-emerald-400 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </a>

            <a
              href="#plans"
              className="bg-white hover:bg-gray-100 text-[#1f2125] p-6 w-full sm:w-60 h-40 flex flex-col justify-end transition-all transform hover:-translate-y-1 shadow-2xl group border border-gray-200"
            >
              <div className="flex items-center justify-between text-xl font-black text-[#1f2125]">
                <span>See Plans</span>
                <CaretRight weight="bold" className="w-6 h-6 text-gray-700 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

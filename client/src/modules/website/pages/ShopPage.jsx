import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicShop } from '../../../hooks/useCrm';
import { useCreateShopOrder } from '../../../hooks/useShop';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../shared/utils/formatters';
import {
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Loader2,
  Truck,
  Store,
  CheckCircle2,
  Search,
  Sparkles,
  Shirt,
  Briefcase,
  Trophy,
  CircleDot,
  Footprints,
  Layers,
  Grid,
  Tag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const EQUIPMENT_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?auto=format&fit=crop&q=80&w=600', // Racket
  'https://images.unsplash.com/photo-1530915536647-759c9044a7b7?auto=format&fit=crop&q=80&w=600', // Balls
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', // Shoes
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600', // Apparel
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600', // Bag
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=600', // Grip
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600', // Bottle
  'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&q=80&w=600', // Shuttles / Gear
];

export const SafeProductImage = ({ prod, idx }) => {
  const name = (prod?.name || '').toLowerCase();
  const cat = (prod?.category || '').toLowerCase();

  let initialSrc = prod?.imageUrl || EQUIPMENT_IMAGE_POOL[idx % EQUIPMENT_IMAGE_POOL.length];
  if (!prod?.imageUrl) {
    if (name.includes('ball') || cat.includes('ball') || name.includes('shuttle')) initialSrc = EQUIPMENT_IMAGE_POOL[1];
    else if (name.includes('shoe') || cat.includes('shoe') || cat.includes('footwear')) initialSrc = EQUIPMENT_IMAGE_POOL[2];
    else if (name.includes('polo') || name.includes('jersey') || name.includes('short') || cat.includes('apparel') || cat.includes('cloth')) initialSrc = EQUIPMENT_IMAGE_POOL[3];
    else if (name.includes('bag') || name.includes('combi')) initialSrc = EQUIPMENT_IMAGE_POOL[4];
    else if (name.includes('bottle') || name.includes('thermal') || name.includes('flask')) initialSrc = EQUIPMENT_IMAGE_POOL[6];
    else if (name.includes('grip') || name.includes('wristband') || cat.includes('accessor')) initialSrc = EQUIPMENT_IMAGE_POOL[5];
    else if (name.includes('racket') || cat.includes('racket') || cat.includes('padel') || cat.includes('badminton')) initialSrc = EQUIPMENT_IMAGE_POOL[0];
  }

  const [src, setSrc] = React.useState(initialSrc);

  return (
    <img
      src={src}
      alt={prod?.name || 'Sports Item'}
      onError={() => setSrc(`https://picsum.photos/seed/gear-${prod?.id || idx}-safe/600/600`)}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
    />
  );
};

// Normalized category mapping
export const CATEGORY_DEFINITIONS = [
  {
    id: 'ALL',
    label: 'All Products',
    shortLabel: 'All',
    icon: Layers,
    description: 'Browse all club equipment, sportswear, rackets, and court accessories',
    badgeStyle: 'bg-slate-900 text-white',
  },
  {
    id: 'ACCESSORIES',
    label: 'Sports Accessories',
    shortLabel: 'Accessories',
    icon: Briefcase,
    description: 'Tournament bags, overgrips, thermal bottles, wristbands, and string reels',
    badgeStyle: 'bg-purple-100 text-purple-900 border border-purple-200',
  },
  {
    id: 'APPAREL',
    label: 'Clothes & Apparel',
    shortLabel: 'Cloths',
    icon: Shirt,
    description: 'Match jerseys, court shorts, athletic polos, tracksuits, and dry-fit wear',
    badgeStyle: 'bg-blue-100 text-blue-900 border border-blue-200',
  },
  {
    id: 'RACKETS',
    label: 'Rackets & Paddles',
    shortLabel: 'Rackets',
    icon: Trophy,
    description: 'Tour-grade tennis rackets, padel blades, and professional badminton rackets',
    badgeStyle: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
  },
  {
    id: 'BALLS',
    label: 'Balls & Shuttles',
    shortLabel: 'Balls',
    icon: CircleDot,
    description: 'ITF certified tennis ball cans, padel balls, and tournament nylon shuttles',
    badgeStyle: 'bg-amber-100 text-amber-900 border border-amber-200',
  },
  {
    id: 'SHOES',
    label: 'Footwear & Shoes',
    shortLabel: 'Shoes',
    icon: Footprints,
    description: 'Pro indoor and hardcourt tennis shoes with non-marking grip soles',
    badgeStyle: 'bg-rose-100 text-rose-900 border border-rose-200',
  },
];

export const getNormalizedCategory = (rawCategory, name = '') => {
  const cat = (rawCategory || '').toUpperCase().trim();
  const n = (name || '').toLowerCase();

  if (
    cat === 'ACCESSORIES' ||
    cat === 'BAGS' ||
    cat.includes('ACCESSOR') ||
    n.includes('grip') ||
    n.includes('bottle') ||
    n.includes('wristband') ||
    n.includes('bag') ||
    n.includes('string') ||
    n.includes('towel')
  ) {
    return 'ACCESSORIES';
  }

  if (
    cat === 'APPAREL' ||
    cat === 'CLOTHING' ||
    cat === 'CLOTHS' ||
    cat.includes('CLOTH') ||
    n.includes('jersey') ||
    n.includes('short') ||
    n.includes('polo') ||
    n.includes('apparel') ||
    n.includes('suit') ||
    n.includes('shirt')
  ) {
    return 'APPAREL';
  }

  if (
    cat === 'RACKETS' ||
    cat === 'PADEL' ||
    cat === 'BADMINTON' ||
    cat.includes('RACKET') ||
    n.includes('racket') ||
    n.includes('padel') ||
    n.includes('badminton') ||
    n.includes('blade')
  ) {
    return 'RACKETS';
  }

  if (
    cat === 'BALLS' ||
    cat.includes('BALL') ||
    n.includes('ball') ||
    n.includes('shuttle')
  ) {
    return 'BALLS';
  }

  if (
    cat === 'SHOES' ||
    cat === 'FOOTWEAR' ||
    cat.includes('SHOE') ||
    n.includes('shoe') ||
    n.includes('cushion')
  ) {
    return 'SHOES';
  }

  return 'ACCESSORIES';
};

const FALLBACK_PRODUCTS = [
  // Rackets & Paddles
  { id: 'p1', name: 'Wilson Pro Staff v14 Tennis Racket', category: 'Rackets', price: 18499, stock: 12, sku: 'WIL-PS14-PRO' },
  { id: 'p3', name: 'Bullpadel Hack 03 Pro Padel Racket', category: 'Padel', price: 22999, stock: 6, sku: 'BULL-HACK-03' },
  { id: 'p4', name: 'Yonex Astrox 99 Pro Badminton Racket', category: 'Badminton', price: 15999, stock: 8, sku: 'YON-AST99-PRO' },
  { id: 'p13', name: 'Babolat Pure Aero 2026 Spin Edition', category: 'Rackets', price: 16500, stock: 5, sku: 'BAB-AERO-26' },

  // Clothes & Apparel
  { id: 'p6', name: 'NikeCourt Dri-FIT Advantage Tennis Apparel', category: 'Apparel', price: 3499, stock: 25, sku: 'NIKE-POLO-DF' },
  { id: 'p9', name: 'BookMyCourt Dry-Fit Match Jersey', category: 'Apparel', price: 1299, stock: 28, sku: 'APP-DRY-01' },
  { id: 'p10', name: 'Nike Court Athletic Pro Shorts', category: 'Apparel', price: 999, stock: 32, sku: 'APP-NIK-02' },
  { id: 'p14', name: 'Pro Arena All-Weather Warmup Tracksuit', category: 'Apparel', price: 4499, stock: 15, sku: 'APP-TRK-03' },

  // Sports Accessories
  { id: 'p7', name: 'Head Tour Team 12R Monstercombi Bag', category: 'Accessories', price: 7499, stock: 9, sku: 'HEAD-BAG-12R' },
  { id: 'p8', name: 'Luxilon ALU Power 125 Tennis String Reel', category: 'Accessories', price: 14999, stock: 14, sku: 'LUX-ALU-125' },
  { id: 'p11', name: 'Tourna Grip Original Overgrip (Pack of 3)', category: 'Accessories', price: 450, stock: 45, sku: 'ACC-TRN-03' },
  { id: 'p12', name: 'Wilson Sweat Absorption Wristbands (Pair)', category: 'Accessories', price: 299, stock: 35, sku: 'ACC-WIL-WR' },
  { id: 'p15', name: 'BookMyCourt Insulated Thermal Bottle (750ml)', category: 'Accessories', price: 899, stock: 20, sku: 'ACC-BOT-01' },

  // Balls & Shuttles
  { id: 'p2', name: 'Babolat Team Championship Tennis Balls (3-Pack)', category: 'Balls', price: 649, stock: 48, sku: 'BAB-BALL-3P' },
  { id: 'p16', name: 'Dunlop Fort All-Court Match Balls (Can of 4)', category: 'Balls', price: 650, stock: 16, sku: 'BALL-DUN-04' },
  { id: 'p17', name: 'Yonex Mavis 350 Nylon Shuttles (Tube of 6)', category: 'Balls', price: 750, stock: 24, sku: 'BALL-YON-06' },

  // Footwear & Shoes
  { id: 'p18', name: 'Asics Gel-Resolution 9 Tennis Shoes', category: 'Shoes', price: 11999, stock: 7, sku: 'SHOE-ASC-09' },
  { id: 'p19', name: 'Babolat Jet Mach 3 All-Court Shoes', category: 'Shoes', price: 8500, stock: 5, sku: 'SHOE-BAB-03' },
  { id: 'p20', name: 'Yonex Power Cushion 65 Z3 Court Shoes', category: 'Shoes', price: 10499, stock: 6, sku: 'SHOE-YON-65' },
];

export const ShopPage = () => {
  const shopQuery = usePublicShop();
  const { user } = useAuth();
  const createOrder = useCreateShopOrder();

  // Live catalog when available; otherwise a static preview (public visitors).
  const hasLiveData = Boolean(shopQuery.data && shopQuery.data.length > 0);
  const rawProducts = hasLiveData ? shopQuery.data : FALLBACK_PRODUCTS;

  // Normalized product objects
  const products = useMemo(() => {
    return rawProducts.map((p, idx) => ({
      ...p,
      sku: p.sku || `SKU-${(p.name || '').slice(0, 3).toUpperCase()}-${idx + 10}`,
      normalizedCategory: getNormalizedCategory(p.category, p.name),
    }));
  }, [rawProducts]);

  // Filters & View State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('SEPARATED'); // 'SEPARATED' | 'GRID'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('FEATURED'); // 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC'

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (prod.name || '').toLowerCase().includes(q) ||
        (prod.category || '').toLowerCase().includes(q) ||
        (prod.sku || '').toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'ALL' || prod.normalizedCategory === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, selectedCategory, searchQuery]);

  // Grouped products by category for separated view
  const groupedProducts = useMemo(() => {
    const map = {};
    const relevantCategories = CATEGORY_DEFINITIONS.filter((c) => c.id !== 'ALL');
    relevantCategories.forEach((cat) => {
      map[cat.id] = [];
    });

    products.forEach((prod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (prod.name || '').toLowerCase().includes(q) ||
        (prod.category || '').toLowerCase().includes(q) ||
        (prod.sku || '').toLowerCase().includes(q);

      if (matchesSearch && map[prod.normalizedCategory]) {
        map[prod.normalizedCategory].push(prod);
      }
    });

    return map;
  }, [products, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: products.length };
    CATEGORY_DEFINITIONS.forEach((c) => {
      if (c.id !== 'ALL') {
        counts[c.id] = products.filter((p) => p.normalizedCategory === c.id).length;
      }
    });
    return counts;
  }, [products]);

  // Ordering is only enabled for signed-in users browsing the real catalog
  const canOrder = Boolean(user) && hasLiveData;

  // ---- Cart state: [{ product, qty }] ----
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [fulfilment, setFulfilment] = useState('PICKUP'); // PICKUP | DELIVERY
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // UPI | CARD | CASH
  const [orderError, setOrderError] = useState('');
  const [placedOrderNo, setPlacedOrderNo] = useState('');

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.qty + 1, product.stock);
        return prev.map((c) => (c.product.id === product.id ? { ...c, qty: nextQty } : c));
      }
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.product.id !== productId) return c;
          const nextQty = Math.min(Math.max(c.qty + delta, 0), c.product.stock);
          return { ...c, qty: nextQty };
        })
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((c) => c.product.id !== productId));

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, c) => sum + Number(c.product.price) * c.qty, 0),
    [cart]
  );

  const placeOrder = async () => {
    setOrderError('');
    if (!cart.length) return;
    if (fulfilment === 'DELIVERY' && (!deliveryAddress.trim() || !/^\d{6}$/.test(pinCode.trim()))) {
      setOrderError('A delivery address and a valid 6-digit PIN code are required for delivery.');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        items: cart.map((c) => ({ productId: c.product.id, quantity: c.qty })),
        channel: 'ONLINE',
        fulfilment,
        ...(fulfilment === 'DELIVERY'
          ? { deliveryAddress: deliveryAddress.trim(), pinCode: pinCode.trim() }
          : {}),
        paymentMode,
      });
      setPlacedOrderNo(order?.orderNo || 'Confirmed');
      setCart([]);
      setDeliveryAddress('');
      setPinCode('');
    } catch (err) {
      setOrderError(err?.message || 'Could not place the order. Please try again.');
    }
  };

  // Product Card Renderer
  const renderProductCard = (prod, idx) => {
    const inStock = prod.stock > 0;
    const catDef = CATEGORY_DEFINITIONS.find((c) => c.id === prod.normalizedCategory) || {
      label: prod.category || 'Gear',
      badgeStyle: 'bg-slate-900 text-white',
    };

    return (
      <div
        key={prod.id || idx}
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
      >
        <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
          <SafeProductImage prod={prod} idx={idx} />

          {/* Category Tag on Image */}
          <span
            className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-md uppercase font-mono shadow-xs ${catDef.badgeStyle}`}
          >
            {catDef.shortLabel || prod.category}
          </span>

          {/* Stock Tag on Top Right */}
          <span
            className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
              inStock ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {inStock ? `${prod.stock} in stock` : 'Sold Out'}
          </span>
        </div>

        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400">SKU: {prod.sku}</span>
            <h4 className="font-extrabold text-[#121212] text-sm line-clamp-2 group-hover:text-[#4A812F] transition-colors">
              {prod.name}
            </h4>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-[#121212]">
                {formatCurrency(Number(prod.price))}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Incl. Taxes</span>
            </div>

            {!inStock ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <span>Out of Stock</span>
              </button>
            ) : canOrder ? (
              <button
                onClick={() => addToCart(prod)}
                className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full bg-[#1f2125] hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign in to Buy</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-black tracking-widest text-[#4A812F] uppercase font-mono bg-[#EBF7E7] px-3.5 py-1.5 rounded-full inline-block">
          BOOK MY COURT · PRO SHOP
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight">
          Sports Accessories, Clothes & <span className="text-[#4A812F]">Pro Gear</span>
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Explore specialized category gear: tournament rackets, dri-fit sportswear & apparel, high-traction court footwear, and sports accessories.
        </p>

        {/* Member Order & Tracking Quick Link */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/member/orders"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>My Orders & Track Journey</span>
          </Link>
        </div>
      </div>

      {/* Member Exclusive Discount Notice */}
      {user && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border border-emerald-800/40">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-300">Member Privilege Tier Active</div>
              <div className="text-[11px] text-slate-300">
                Exclusive member discount (up to 20% OFF) and Click & Collect pickup applied automatically!
              </div>
            </div>
          </div>
          <Link
            to="/member/orders"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
          >
            <span>View Past Receipts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ─── CATEGORY-WISE NAVIGATION & FILTER PILLS ─── */}
      <div className="space-y-4 bg-white border border-gray-200 p-4 sm:p-6 rounded-3xl shadow-xs">
        {/* Top Control Bar: Category Filter Pills */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#4A812F]" />
            <span className="text-xs font-mono font-black uppercase text-slate-900 tracking-wider">
              Browse by Category
            </span>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setViewMode('SEPARATED');
                setSelectedCategory('ALL');
              }}
              className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'SEPARATED' && selectedCategory === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="View products categorized in separate sections"
            >
              <Layers className="w-3.5 h-3.5 text-[#4A812F]" />
              <span className="hidden sm:inline">Category Sections</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="View products in uniform grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_DEFINITIONS.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] || 0;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== 'ALL') setViewMode('GRID');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-[#4A812F] text-white border-[#4A812F] shadow-sm scale-102'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gear, shirts, rackets, balls, grips…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:border-[#4A812F] text-slate-900"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items in catalog
          </div>
        </div>
      </div>

      {/* ─── PRODUCTS PRESENTATION ─── */}
      {viewMode === 'SEPARATED' && selectedCategory === 'ALL' ? (
        /* SEPARATED CATEGORY SECTIONS (Requirement: "give category wise sepration also like sport accessories , cloths and all type") */
        <div className="space-y-12">
          {CATEGORY_DEFINITIONS.filter((c) => c.id !== 'ALL').map((cat) => {
            const catProducts = groupedProducts[cat.id] || [];
            if (catProducts.length === 0) return null;

            const Icon = cat.icon;

            return (
              <section
                key={cat.id}
                id={`cat-${cat.id}`}
                className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#4A812F] flex items-center justify-center shrink-0 border border-emerald-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          {cat.label}
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {catProducts.length} items
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setViewMode('GRID');
                    }}
                    className="text-xs font-bold text-[#4A812F] hover:text-[#3b6725] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <span>View all {cat.shortLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {catProducts.map((prod, idx) => renderProductCard(prod, idx))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* FILTERED GRID VIEW (When a specific category tab is selected or in Grid view) */
        <div className="space-y-6">
          {/* Active Category Header */}
          {selectedCategory !== 'ALL' && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Category Filter Active
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {CATEGORY_DEFINITIONS.find((c) => c.id === selectedCategory)?.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="text-xs font-bold text-[#4A812F] hover:underline cursor-pointer"
              >
                Clear Filter (View All)
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No gear items matched your search query. Try clearing the filter or search term.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="bg-[#4A812F] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          )}
        </div>
      )}

      {/* Floating cart button (signed-in shoppers) */}
      {canOrder && cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#4A812F] hover:bg-[#3b6725] text-white rounded-full shadow-xl px-5 py-3.5 flex items-center gap-2 font-extrabold text-sm transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>
            {cartCount} item{cartCount > 1 ? 's' : ''}
          </span>
          <span className="opacity-80">·</span>
          <span>{formatCurrency(cartSubtotal)}</span>
        </button>
      )}

      {/* Cart / checkout drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col font-sans">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#4A812F]" /> Your Cart
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Success state */}
            {placedOrderNo ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                <h4 className="font-black text-xl text-slate-900">Order Placed!</h4>
                <p className="text-sm text-slate-600">
                  Your order <span className="font-mono font-bold">{placedOrderNo}</span> is confirmed.
                  {fulfilment === 'DELIVERY'
                    ? ' We will deliver it to your address.'
                    : ' Collect it at the club front desk.'}
                </p>
                <div className="flex flex-col items-center gap-2 pt-2 w-full">
                  <Link
                    to="/member/orders"
                    className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white text-xs font-extrabold py-3 rounded-xl shadow-xs text-center"
                  >
                    View My Shop Orders & Track Journey →
                  </Link>
                  <button
                    onClick={() => {
                      setPlacedOrderNo('');
                      setCartOpen(false);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p className="text-sm font-semibold">Your cart is empty.</p>
              </div>
            ) : (
              <>
                {/* Line items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {cart.map((c) => (
                    <div
                      key={c.product.id}
                      className="flex items-center gap-3 border border-slate-100 rounded-2xl p-3 bg-slate-50/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {c.product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(Number(c.product.price))} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => changeQty(c.product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{c.qty}</span>
                        <button
                          onClick={() => changeQty(c.product.id, 1)}
                          disabled={c.qty >= c.product.stock}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(c.product.id)}
                        className="text-slate-300 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Checkout Section */}
                <div className="border-t border-slate-100 p-5 space-y-4">
                  {/* Fulfilment choice */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fulfilment</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFulfilment('PICKUP')}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          fulfilment === 'PICKUP'
                            ? 'border-[#4A812F] bg-emerald-50 text-[#4A812F]'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Store className="w-4 h-4" /> Click & Collect (Desk)
                      </button>
                      <button
                        onClick={() => setFulfilment('DELIVERY')}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          fulfilment === 'DELIVERY'
                            ? 'border-[#4A812F] bg-emerald-50 text-[#4A812F]'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <Truck className="w-4 h-4" /> Home Delivery
                      </button>
                    </div>
                  </div>

                  {/* Delivery address */}
                  {fulfilment === 'DELIVERY' && (
                    <div className="space-y-2">
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Complete Street / Apartment Delivery Address"
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#4A812F] focus:outline-none"
                      />
                      <input
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="6-digit Postal PIN code (e.g. 560001)"
                        inputMode="numeric"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-[#4A812F] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Payment mode */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Payment Mode</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['UPI', 'CARD', 'CASH'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setPaymentMode(mode)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            paymentMode === mode
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {orderError && (
                    <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold">
                      {orderError}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm font-black text-slate-900">
                    <span>Estimated Subtotal</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Member tier discounts and GST invoice generated automatically upon placement.
                  </p>

                  <button
                    onClick={placeOrder}
                    disabled={createOrder.isPending}
                    className="w-full bg-[#4A812F] hover:bg-[#3b6725] disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    {createOrder.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Confirm & Place Pro Shop Order</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

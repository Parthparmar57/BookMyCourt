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
} from 'lucide-react';

const EQUIPMENT_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1530915536647-759c9044a7b7?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&q=80&w=600'
];

export const SafeProductImage = ({ prod, idx }) => {
  const name = (prod?.name || '').toLowerCase();
  const cat = (prod?.category || '').toLowerCase();

  let initialSrc = EQUIPMENT_IMAGE_POOL[idx % EQUIPMENT_IMAGE_POOL.length];
  if (name.includes('ball') || cat.includes('ball')) initialSrc = EQUIPMENT_IMAGE_POOL[1];
  else if (name.includes('shoe') || cat.includes('shoe')) initialSrc = EQUIPMENT_IMAGE_POOL[2];
  else if (name.includes('polo') || cat.includes('apparel')) initialSrc = EQUIPMENT_IMAGE_POOL[3];
  else if (name.includes('bag') || cat.includes('bag')) initialSrc = EQUIPMENT_IMAGE_POOL[4];
  else if (name.includes('grip') || cat.includes('accessor')) initialSrc = EQUIPMENT_IMAGE_POOL[5];

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

const FALLBACK_PRODUCTS = [
  { id: 'p1', name: 'Wilson Pro Staff v14 Tennis Racket', category: 'Rackets', price: 18499, stock: 12, sku: 'WIL-PS14-PRO' },
  { id: 'p2', name: 'Babolat Team Championship Tennis Balls (3-Pack)', category: 'Balls', price: 649, stock: 48, sku: 'BAB-BALL-3P' },
  { id: 'p3', name: 'Bullpadel Hack 03 Pro Padel Racket', category: 'Padel', price: 22999, stock: 6, sku: 'BULL-HACK-03' },
  { id: 'p4', name: 'Yonex Astrox 99 Pro Badminton Racket', category: 'Badminton', price: 15999, stock: 8, sku: 'YON-AST99-PRO' },
  { id: 'p6', name: 'NikeCourt Dri-FIT Advantage Tennis Apparel', category: 'Apparel', price: 3499, stock: 25, sku: 'NIKE-POLO-DF' },
  { id: 'p7', name: 'Head Tour Team 12R Monstercombi Bag', category: 'Bags', price: 7499, stock: 9, sku: 'HEAD-BAG-12R' },
  { id: 'p8', name: 'Luxilon ALU Power 125 Tennis String Reel', category: 'Accessories', price: 14999, stock: 14, sku: 'LUX-ALU-125' }
];

export const ShopPage = () => {
  const shopQuery = usePublicShop();
  const { user } = useAuth();
  const createOrder = useCreateShopOrder();

  // Live catalog when available; otherwise a static preview (public visitors).
  const hasLiveData = Boolean(shopQuery.data && shopQuery.data.length > 0);
  const products = hasLiveData ? shopQuery.data : FALLBACK_PRODUCTS;

  // Ordering is only enabled for signed-in users browsing the real catalog
  // (fallback products have fake ids that don't exist in the backend).
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
        // Don't let cart quantity exceed available stock.
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

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black tracking-widest text-[#4A812F] uppercase font-mono bg-[#EBF7E7] px-3.5 py-1.5 rounded-full inline-block">
          PRO GEAR & EQUIPMENT SHOP
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight">Gear, Rackets & Apparel</h1>
        <p className="text-sm text-gray-600">
          Shared stock pool synchronized live between counter retail POS and online member store.
        </p>

        {canOrder && (
          <div className="pt-2">
            <Link
              to="/member/orders"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold px-4 py-2 rounded-xl transition-colors border border-slate-200"
            >
              <ShoppingBag className="w-4 h-4 text-[#4A812F]" />
              <span>View My Shop Orders & Tracking</span>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((prod, idx) => {
          const inStock = prod.stock > 0;
          return (
            <div key={prod.id || idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                <SafeProductImage prod={prod} idx={idx} />
                <span className="absolute top-3 left-3 bg-[#121212] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase font-mono shadow-md">
                  {prod.category}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400">SKU: {prod.sku}</span>
                  <h4 className="font-extrabold text-[#121212] text-sm line-clamp-2">{prod.name}</h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#121212]">{formatCurrency(Number(prod.price))}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {inStock ? `${prod.stock} In Stock` : 'Out of Stock'}
                    </span>
                  </div>

                  {!inStock ? (
                    <button disabled className="w-full bg-gray-300 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                      <span>Out of Stock</span>
                    </button>
                  ) : canOrder ? (
                    <button
                      onClick={() => addToCart(prod)}
                      className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full bg-[#1f2125] hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sign in to Buy</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart button (signed-in shoppers) */}
      {canOrder && cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#4A812F] hover:bg-[#3b6725] text-white rounded-full shadow-xl px-5 py-3.5 flex items-center gap-2 font-extrabold text-sm transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
          <span className="opacity-80">·</span>
          <span>{formatCurrency(cartSubtotal)}</span>
        </button>
      )}

      {/* Cart / checkout drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#4A812F]" /> Your Cart
              </h3>
              <button onClick={() => setCartOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {/* Success state */}
            {placedOrderNo ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                <h4 className="font-black text-xl text-slate-900">Order Placed!</h4>
                <p className="text-sm text-slate-600">
                  Your order <span className="font-mono font-bold">{placedOrderNo}</span> is confirmed.
                  {fulfilment === 'DELIVERY' ? ' We will deliver it to your address.' : ' Collect it at the club front desk.'}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/member/orders"
                    className="bg-[#4A812F] hover:bg-[#3b6725] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    View My Shop Orders →
                  </Link>
                  <button
                    onClick={() => { setPlacedOrderNo(''); setCartOpen(false); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl"
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
                    <div key={c.product.id} className="flex items-center gap-3 border border-slate-100 rounded-2xl p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{c.product.name}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(Number(c.product.price))} each</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => changeQty(c.product.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{c.qty}</span>
                        <button onClick={() => changeQty(c.product.id, 1)} disabled={c.qty >= c.product.stock} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(c.product.id)} className="text-slate-300 hover:text-rose-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Checkout */}
                <div className="border-t border-slate-100 p-5 space-y-4">
                  {/* Fulfilment choice */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fulfilment</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFulfilment('PICKUP')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${fulfilment === 'PICKUP' ? 'border-[#4A812F] bg-emerald-50 text-[#4A812F]' : 'border-slate-200 text-slate-600'}`}
                      >
                        <Store className="w-4 h-4" /> Pickup
                      </button>
                      <button
                        onClick={() => setFulfilment('DELIVERY')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${fulfilment === 'DELIVERY' ? 'border-[#4A812F] bg-emerald-50 text-[#4A812F]' : 'border-slate-200 text-slate-600'}`}
                      >
                        <Truck className="w-4 h-4" /> Delivery
                      </button>
                    </div>
                  </div>

                  {/* Delivery address */}
                  {fulfilment === 'DELIVERY' && (
                    <div className="space-y-2">
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Delivery address"
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#4A812F] focus:outline-none"
                      />
                      <input
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="6-digit PIN code"
                        inputMode="numeric"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#4A812F] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Payment mode */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Payment</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['UPI', 'CARD', 'CASH'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setPaymentMode(mode)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${paymentMode === mode ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {orderError && <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold">{orderError}</div>}

                  <div className="flex items-center justify-between text-sm font-black text-slate-900">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Member discount & taxes are applied at checkout by the club.</p>

                  <button
                    onClick={placeOrder}
                    disabled={createOrder.isPending}
                    className="w-full bg-[#4A812F] hover:bg-[#3b6725] disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {createOrder.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Place Order
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

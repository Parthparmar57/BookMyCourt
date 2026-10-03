import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicShop } from '../../../hooks/useCrm';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { ShoppingBag } from 'lucide-react';

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

export const ShopPage = () => {
  const shopQuery = usePublicShop();
  const fallbackProducts = [
    {
      id: 'p1',
      name: 'Wilson Pro Staff v14 Tennis Racket',
      category: 'Rackets',
      price: 18499,
      stock: 12,
      sku: 'WIL-PS14-PRO'
    },
    {
      id: 'p2',
      name: 'Babolat Team Championship Tennis Balls (3-Pack)',
      category: 'Balls',
      price: 649,
      stock: 48,
      sku: 'BAB-BALL-3P'
    },
    {
      id: 'p3',
      name: 'Bullpadel Hack 03 Pro Padel Racket',
      category: 'Padel',
      price: 22999,
      stock: 6,
      sku: 'BULL-HACK-03'
    },
    {
      id: 'p4',
      name: 'Yonex Astrox 99 Pro Badminton Racket',
      category: 'Badminton',
      price: 15999,
      stock: 8,
      sku: 'YON-AST99-PRO'
    },
    {
      id: 'p6',
      name: 'NikeCourt Dri-FIT Advantage Tennis Apparel',
      category: 'Apparel',
      price: 3499,
      stock: 25,
      sku: 'NIKE-POLO-DF'
    },
    {
      id: 'p7',
      name: 'Head Tour Team 12R Monstercombi Bag',
      category: 'Bags',
      price: 7499,
      stock: 9,
      sku: 'HEAD-BAG-12R'
    },
    {
      id: 'p8',
      name: 'Luxilon ALU Power 125 Tennis String Reel',
      category: 'Accessories',
      price: 14999,
      stock: 14,
      sku: 'LUX-ALU-125'
    }
  ];
  const products = (shopQuery.data && shopQuery.data.length > 0) ? shopQuery.data : fallbackProducts;

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
                  {inStock ? (
                    <Link
                      to="/login"
                      className="w-full bg-[#1f2125] hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sign in to Buy</span>
                    </Link>
                  ) : (
                    <button disabled className="w-full bg-gray-300 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                      <span>Out of Stock</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

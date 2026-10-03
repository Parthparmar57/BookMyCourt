import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicShop } from '../../../hooks/useCrm';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { ShoppingBag } from 'lucide-react';

export const ShopPage = () => {
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
    },
    {
      id: 'p6',
      name: 'NikeCourt Dri-FIT Advantage Tennis Apparel',
      category: 'Apparel',
      price: 3499,
      stock: 25,
      sku: 'NIKE-POLO-DF',
      imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'p7',
      name: 'Head Tour Team 12R Monstercombi Bag',
      category: 'Bags',
      price: 7499,
      stock: 9,
      sku: 'HEAD-BAG-12R',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'p8',
      name: 'Luxilon ALU Power 125 Tennis String Reel',
      category: 'Accessories',
      price: 14999,
      stock: 14,
      sku: 'LUX-ALU-125',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=600'
    }
  ];
  const products = (shopQuery.data && shopQuery.data.length > 0) ? shopQuery.data : fallbackProducts;

  const getProductImage = (prod) => {
    if (prod?.imageUrl && typeof prod.imageUrl === 'string' && prod.imageUrl.trim().length > 0) {
      return prod.imageUrl;
    }
    const name = (prod?.name || '').toLowerCase();
    const cat = (prod?.category || '').toLowerCase();

    if (name.includes('racket') || cat.includes('racket')) {
      return '/photo-1622279457486-62dcc4a431d6.avif';
    }
    if (name.includes('ball') || cat.includes('ball')) {
      return '/photo-1595435934249-5df7ed86e1c0.avif';
    }
    if (name.includes('shoe') || cat.includes('shoe')) {
      return '/photo-1554068865-24cecd4e34b8.avif';
    }
    return '/photo-1626248801379-51a0748a5f96.avif';
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((prod) => {
          const inStock = prod.stock > 0;
          const imgSrc = getProductImage(prod);
          return (
            <div key={prod.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                <img src={imgSrc} alt={prod.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
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

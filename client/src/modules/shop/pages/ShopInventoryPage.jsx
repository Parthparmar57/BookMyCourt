import React, { useState, useMemo } from 'react';
import { useProducts, useStockIn, useInventoryLogs } from '../../../hooks/useShop';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import {
  ShoppingBag,
  AlertTriangle,
  Plus,
  Loader2,
  X,
  CheckCircle2,
  PackageCheck,
  Search,
  Filter,
  ArrowUpDown,
  Boxes,
  History,
  TrendingUp,
  Tag,
  BarChart2,
  XCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ShopInventoryPage = () => {
  const productsQuery = useProducts();
  const lowStockQuery = useLowStock();
  const inventoryLogsQuery = useInventoryLogs();
  const shopOrdersQuery = useShopOrders();

  const stockIn = useStockIn();
  const logsQuery = useInventoryLogs();

  const [stockTarget, setStockTarget] = useState(null); // product being restocked
  const [form, setForm] = useState({ quantity: 10, cost: '', supplier: '' });
  const [error, setError] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, LOW, OUT

  const products = productsQuery.data || [];
  const logs = logsQuery.data || [];

  // Derived Categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'LOW') {
        matchesStock = p.stock > 0 && p.stock <= p.reorderLevel;
      } else if (stockFilter === 'OUT') {
        matchesStock = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Inventory Health Counters
  const totalSkus = products.length;
  const inStockCount = products.filter((p) => p.stock > p.reorderLevel).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const openStockIn = (p) => {
    setStockError('');
    setStockForm({ quantity: 10, cost: '', supplier: '' });
    setStockTarget(p);
  };

  const submitStockIn = async (e) => {
    e.preventDefault();
    setStockError('');
    try {
      await stockIn.mutateAsync({
        productId: stockTarget.id,
        quantity: Number(stockForm.quantity),
        ...(stockForm.cost ? { cost: Number(stockForm.cost) } : {}),
        ...(stockForm.supplier ? { supplier: stockForm.supplier } : {}),
      });
      setStockTarget(null);
    } catch (err) {
      setStockError(err?.message || 'Could not record stock.');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          sku: productForm.sku,
          name: productForm.name,
          category: productForm.category,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          reorderLevel: Number(productForm.reorderLevel),
          imageUrl: productForm.imageUrl,
          description: productForm.description,
        });
      } else {
        await createProduct.mutateAsync({
          sku: productForm.sku,
          name: productForm.name,
          category: productForm.category,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          reorderLevel: Number(productForm.reorderLevel),
          imageUrl: productForm.imageUrl,
          description: productForm.description,
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (err) {
      alert(err?.message || 'Error saving product.');
    }
  };

  const exportStockCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Price', 'Stock', 'Reorder Level'];
    const rows = products.map((p) => [p.sku, p.name, p.category, p.price, p.stock, p.reorderLevel]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Shop_Stock_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#4A812F] flex items-center gap-2">
            <Boxes className="w-3.5 h-3.5" />
            <span>RETAIL INVENTORY CONTROL</span>
            <span>•</span>
            <span>OMNICHANNEL STOCK POOL</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Pro Shop Inventory & <span className="text-[#4A812F]">Stock Audit</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            Audit catalog SKUs, track real-time stock levels, filter low stock warnings, and record new shipments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/staff/shop"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-2 transition-colors shrink-0"
          >
            <BarChart2 className="w-4 h-4 text-slate-600" />
            View Analytics Dashboard
          </Link>
          <span className="bg-emerald-50 text-[#4A812F] border border-emerald-200 text-xs font-extrabold px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-2xs shrink-0">
            <ShoppingBag className="w-4 h-4 text-[#4A812F]" />
            OMNICHANNEL POOL LIVE
          </span>
        </div>
      </div>

      {/* Visual Stock Diagnostics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Total SKUs</div>
            <div className="text-xl font-black text-slate-900">{totalSkus}</div>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={() => setStockFilter(stockFilter === 'ALL' ? 'ALL' : 'ALL')}
          className={`bg-white border p-4 rounded-2xl shadow-2xs text-left transition-all ${stockFilter === 'ALL' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-600">Optimal Stock</div>
              <div className="text-xl font-black text-emerald-800">{inStockCount}</div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setStockFilter(stockFilter === 'LOW' ? 'ALL' : 'LOW')}
          className={`bg-white border p-4 rounded-2xl shadow-2xs text-left transition-all ${stockFilter === 'LOW' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-amber-600">Low Stock Alert</div>
              <div className="text-xl font-black text-amber-800">{lowStockCount}</div>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setStockFilter(stockFilter === 'OUT' ? 'ALL' : 'OUT')}
          className={`bg-white border p-4 rounded-2xl shadow-2xs text-left transition-all ${stockFilter === 'OUT' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-rose-600">Out of Stock</div>
              <div className="text-xl font-black text-rose-800">{outOfStockCount}</div>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, Product Name or Category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white text-xs font-mono uppercase tracking-wider">
                <th className="p-4">SKU</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Level Indicator</th>
                <th className="p-4">Reorder Target</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              <QueryState
                query={productsQuery}
                loading={<tr><td colSpan={7} className="p-6 text-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading inventory database…</td></tr>}
                empty={<tr><td colSpan={7} className="p-6 text-center text-slate-400">No products found.</td></tr>}
                emptyWhen={() => filteredProducts.length === 0}
              >
                {() => filteredProducts.map((p) => {
                  const isLowStock = p.stock > 0 && p.stock <= p.reorderLevel;
                  const isOutOfStock = p.stock === 0;

                  // Stock indicator percentage
                  const maxDisplayStock = Math.max(p.stock, p.reorderLevel * 2, 20);
                  const stockPercent = Math.min(100, Math.round((p.stock / maxDisplayStock) * 100));

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{p.sku}</td>
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="block font-extrabold text-slate-900">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900">{formatCurrency(Number(p.price))}</td>
                      <td className="p-4 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${isOutOfStock
                                ? 'bg-rose-100 text-rose-800'
                                : isLowStock
                                  ? 'bg-amber-100 text-amber-900 flex items-center gap-1'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                              {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                              {isOutOfStock ? 'Out of Stock' : `${p.stock} Units`}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{stockPercent}%</span>
                          </div>

                          {/* Visual Stock Level Progress Bar */}
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${isOutOfStock
                                  ? 'bg-rose-500'
                                  : isLowStock
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              style={{ width: `${Math.max(4, stockPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{p.reorderLevel} Units</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => openStockIn(p)}
                            className="px-3.5 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold flex items-center gap-1.5 text-[11px] shadow-xs transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> Stock In
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </QueryState>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In Movement History Log Visual Widget */}
      {logs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Recent Inventory Audit Logs & Stock Additions
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {logs.length} Recent Records
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.slice(0, 5).map((log, idx) => (
              <div key={log.id || idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{log.productName || log.productId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Supplier: {log.supplier || 'Standard Shipment'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    +{log.quantity} Units Added
                  </span>
                  {log.createdAt && (
                    <span className="block text-[10px] text-slate-400 font-mono mt-1">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock In modal */}
      {stockTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Stock In — {stockTarget.name}</h3>
              <button onClick={() => setStockTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {stockError && <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold">{stockError}</div>}
            <form onSubmit={submitStockIn} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Quantity to Add *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-1">Unit Cost (₹) (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={stockForm.cost}
                  onChange={(e) => setStockForm({ ...stockForm, cost: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  placeholder="₹ Cost price"
                />
              </div>
              <div>
                <label className="block mb-1">Supplier Name (Optional)</label>
                <input
                  value={stockForm.supplier}
                  onChange={(e) => setStockForm({ ...stockForm, supplier: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  placeholder="e.g. Yonex Official Vendor"
                />
              </div>
              <button
                type="submit"
                disabled={stockIn.isPending}
                className="w-full bg-[#4A812F] hover:bg-[#3b6725] disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {stockIn.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Record Stock In Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Pro Shop Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">SKU *</label>
                  <input
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                    placeholder="e.g. RAK-001"
                  />
                </div>
                <div>
                  <label className="block mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  >
                    <option value="RACKETS">Rackets & Paddles</option>
                    <option value="BALLS">Balls & Shuttles</option>
                    <option value="SHOES">Court Shoes</option>
                    <option value="APPAREL">Apparel & Jerseys</option>
                    <option value="ACCESSORIES">Accessories & Grips</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Product Name *</label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  placeholder="e.g. Yonex Astrox 99 Pro Racket"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.reorderLevel}
                    onChange={(e) => setProductForm({ ...productForm, reorderLevel: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Product Image URL</label>
                <input
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#4A812F] focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm cursor-pointer mt-2"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

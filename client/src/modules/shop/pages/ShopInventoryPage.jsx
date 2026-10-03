import React, { useState } from 'react';
import { 
  useProducts, 
  useStockIn, 
  useLowStock, 
  useInventoryLogs, 
  useShopOrders, 
  useUpdateShopOrderStatus,
  useCreateProduct,
  useUpdateProduct
} from '../../../hooks/useShop';
import { formatCurrency } from '../../../shared/utils/formatters';
import { QueryState } from '../../../shared/components/DataState';
import { 
  ShoppingBag, 
  AlertTriangle, 
  Plus, 
  Loader2, 
  X, 
  CheckCircle2, 
  Download, 
  Search, 
  Package, 
  Receipt, 
  Edit, 
  FileText,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const ShopInventoryPage = () => {
  const productsQuery = useProducts();
  const lowStockQuery = useLowStock();
  const inventoryLogsQuery = useInventoryLogs();
  const shopOrdersQuery = useShopOrders();

  const stockIn = useStockIn();
  const updateOrderStatus = useUpdateShopOrderStatus();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Active view tab
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'lowstock' | 'orders' | 'logs'

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Stock In Modal State
  const [stockTarget, setStockTarget] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: 10, cost: '', supplier: '' });
  const [stockError, setStockError] = useState('');

  // Add / Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    category: 'RACKETS',
    price: '',
    stock: 10,
    reorderLevel: 5,
    imageUrl: '',
    description: '',
  });

  const products = productsQuery.data || [];
  const lowStockItems = lowStockQuery.data || products.filter((p) => p.stock <= p.reorderLevel);
  const logs = inventoryLogsQuery.data || [];
  const shopOrders = shopOrdersQuery.data?.items || shopOrdersQuery.data || [];

  // Filtered Products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate stats
  const totalValuation = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="text-xs font-mono font-black tracking-widest uppercase text-[#4A812F] flex items-center gap-2">
            <span>PRO SHOP INVENTORY MANAGEMENT</span>
            <span>•</span>
            <span>OMNICHANNEL STOCK POOL</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gear Shop & <span className="text-[#4A812F]">Retail Inventory</span>
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            Single shared stock pool synchronized live between counter POS and online member shop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'inventory' ? 'bg-[#4A812F] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" /> Stock Catalog
          </button>
          <button
            onClick={() => setActiveTab('lowstock')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'lowstock' ? 'bg-[#4A812F] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" /> Low Stock Alerts ({lowStockItems.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'orders' ? 'bg-[#4A812F] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" /> Retail Orders ({shopOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'logs' ? 'bg-[#4A812F] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Stock Audit Logs
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>TOTAL CATALOG ITEMS</span>
            <Package className="w-4 h-4 text-[#4A812F]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{products.length} SKUs</p>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Total {totalStockCount} units in stock
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>LOW STOCK ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{lowStockItems.length}</p>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Below reorder threshold
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>STOCK POOL VALUATION</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalValuation)}</p>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            Retail inventory asset total
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>RETAIL ORDERS</span>
            <ShoppingBag className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{shopOrders.length}</p>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            Counter POS & Click-and-Collect
          </span>
        </div>
      </div>

      {/* TAB 1: INVENTORY STOCK CATALOG */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SKU or Product Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4A812F]"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4A812F]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>Category: {c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={exportStockCSV}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ sku: '', name: '', category: 'Rackets', price: '', stock: 10, reorderLevel: 5, imageUrl: '', description: '' });
                  setShowProductModal(true);
                }}
                className="bg-[#4A812F] hover:bg-[#3b6725] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-mono uppercase tracking-wider">
                    <th className="p-4">SKU</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Retail Price</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Reorder Level</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  <QueryState
                    query={productsQuery}
                    loading={<tr><td colSpan={7} className="p-6 text-center text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading inventory catalog…</td></tr>}
                    empty={<tr><td colSpan={7} className="p-6 text-center text-slate-400">No products found.</td></tr>}
                    emptyWhen={(d) => !d?.length}
                  >
                    {() =>
                      filteredProducts.map((p) => {
                        const isLow = p.stock <= p.reorderLevel;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-mono font-extrabold text-slate-900">{p.sku}</td>
                            <td className="p-4 font-extrabold text-slate-900 flex items-center gap-3">
                              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />}
                              <div>
                                <div>{p.name}</div>
                                {p.description && <div className="text-[10px] text-slate-400 font-normal">{p.description}</div>}
                              </div>
                            </td>
                            <td className="p-4 text-slate-600">{p.category}</td>
                            <td className="p-4 font-black text-slate-900">{formatCurrency(Number(p.price))}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                                isLow ? 'bg-amber-100 text-amber-900 flex items-center gap-1 w-fit' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                                {p.stock} Units
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">{p.reorderLevel} Units</td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openStockIn(p)}
                                  className="px-3 h-8 rounded-xl bg-[#4A812F] hover:bg-[#3b6725] text-white font-extrabold flex items-center gap-1 text-[11px] shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Stock In
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setProductForm({
                                      sku: p.sku,
                                      name: p.name,
                                      category: p.category,
                                      price: p.price,
                                      stock: p.stock,
                                      reorderLevel: p.reorderLevel,
                                      imageUrl: p.imageUrl || '',
                                      description: p.description || '',
                                    });
                                    setShowProductModal(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </QueryState>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOW STOCK ALERTS */}
      {activeTab === 'lowstock' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Low-Stock Alert & Reorder Thresholds
              </h3>
              <p className="text-xs text-slate-500 font-medium">Items that have fallen below minimum safety stock levels</p>
            </div>
            <span className="text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl">
              {lowStockItems.length} Products Require Restock
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((p) => (
              <div key={p.id} className="bg-amber-50/50 border border-amber-200 p-5 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-900">{p.sku}</span>
                  <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                    LOW STOCK
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                  <div className="text-xs text-slate-600 mt-1">
                    Current: <strong className="text-amber-800">{p.stock} Units</strong> (Min Threshold: {p.reorderLevel})
                  </div>
                </div>
                <button
                  onClick={() => openStockIn(p)}
                  className="w-full bg-[#4A812F] hover:bg-[#3b6725] text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Restock Items Now
                </button>
              </div>
            ))}
            {!lowStockItems.length && (
              <div className="text-center py-12 col-span-full space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-extrabold text-slate-700">All retail inventory items are above safety stock levels!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RETAIL ORDERS & POS SALES */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Pro Shop Orders & POS Transactions</h3>
              <p className="text-xs text-slate-500 font-medium">Counter sales and online click-and-collect orders</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-mono uppercase">
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer / Member</th>
                  <th className="p-3.5">Fulfillment</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {shopOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">#{o.id.slice(-6)}</td>
                    <td className="p-3.5 text-slate-800">{o.member?.name || o.customerName || 'Walk-in Member'}</td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        {o.fulfillmentType || 'COUNTER_POS'}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-slate-900">{formatCurrency(Number(o.totalAmount || o.total || 0))}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                        o.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {o.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {o.status !== 'FULFILLED' && (
                        <button
                          onClick={() => updateOrderStatus.mutateAsync({ id: o.id, status: 'FULFILLED' })}
                          className="bg-[#4A812F] hover:bg-[#3b6725] text-white text-[10px] font-bold px-3 py-1 rounded-lg"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!shopOrders.length && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No retail shop orders recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900">Stock In Adjustment Audit Logs</h3>
              <p className="text-xs text-slate-500 font-medium">Historical audit trail of supplier stock-ins and inventory entries</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-mono uppercase">
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Quantity Added</th>
                  <th className="p-3.5">Unit Cost</th>
                  <th className="p-3.5">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold text-slate-900">{l.product?.name || 'Product'}</td>
                    <td className="p-3.5 text-emerald-700 font-black">+{l.quantity} Units</td>
                    <td className="p-3.5 text-slate-800">{l.cost ? formatCurrency(Number(l.cost)) : '—'}</td>
                    <td className="p-3.5 text-slate-600">{l.supplier || 'Direct Restock'}</td>
                  </tr>
                ))}
                {!logs.length && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No stock adjustment logs available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: STOCK IN ADJUSTMENT */}
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

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAtom } from 'jotai';
import { authState } from '../state/authAtom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, ShoppingBag, Plus, Search, Filter, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw icon
import AddSweetModal from '../components/AddSweetModal';
import PurchaseModal from '../components/PurchaseModal';
import RestockModal from '../components/RestockModal'; // NEW IMPORT

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

const Dashboard = () => {
  const [auth, setAuth] = useAtom(authState);
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false); // NEW STATE
  const [selectedSweet, setSelectedSweet] = useState(null);

  const [notification, setNotification] = useState(null);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(200);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // LOGOUT & FETCH (Existing logic kept same)
  const performLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ isAuthenticated: false, token: null, user: null, isAdmin: false });
    navigate('/login');
  };

  const handleLogout = async () => {
    try { await axios.post('http://localhost:5000/api/auth/logout'); }
    catch (error) { console.error("Logout error", error); }
    finally { performLogout(); }
  };

  const fetchSweets = useCallback(async (query = '') => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const url = query.trim()
        ? `http://localhost:5000/api/sweets/search?q=${query}`
        : 'http://localhost:5000/api/sweets';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setSweets(res.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) performLogout();
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => { fetchSweets(debouncedSearchTerm); }, [debouncedSearchTerm, fetchSweets]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- ACTION HANDLERS ---
  const openPurchaseModal = (sweet) => {
    setSelectedSweet(sweet);
    setPurchaseModalOpen(true);
  };

  const openRestockModal = (sweet) => { // NEW HANDLER
    setSelectedSweet(sweet);
    setRestockModalOpen(true);
  };

  const handlePurchaseConfirm = async (sweetId, quantity) => {
    try {
      await axios.post(`http://localhost:5000/api/sweets/${sweetId}/purchase`, { quantity }, { headers: { Authorization: `Bearer ${auth.token}` } });
      setSweets(prev => prev.map(s => s.id === sweetId ? { ...s, quantity: s.quantity - quantity } : s));
      showNotification(`Purchased ${quantity} items!`, "success");
      setPurchaseModalOpen(false);
    } catch (error) {
      showNotification(error.response?.data?.error || "Purchase failed.", "error");
    }
  };

  const handleRestockConfirm = async (sweetId, amount) => { // NEW HANDLER
    try {
      await axios.post(`http://localhost:5000/api/sweets/${sweetId}/restock`,
        { amount },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      // Optimistic Update
      setSweets(prev => prev.map(s => s.id === sweetId ? { ...s, quantity: s.quantity + amount } : s));
      showNotification(`Restocked ${amount} items!`, "success");
      setRestockModalOpen(false);
    } catch (error) {
      showNotification(error.response?.data?.error || "Restock failed.", "error");
    }
  };

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchSweets(searchQuery); };

  const categories = useMemo(() => {
    const cats = sweets.map(s => s.category);
    return ['All', ...new Set(cats)];
  }, [sweets]);

  const filteredSweets = useMemo(() => {
    return sweets.filter(sweet => {
      const matchesCategory = selectedCategory === 'All' || sweet.category === selectedCategory;
      const matchesPrice = parseFloat(sweet.price) <= maxPrice;
      return matchesCategory && matchesPrice;
    });
  }, [sweets, selectedCategory, maxPrice]);


  return (
    <div className="min-h-screen bg-dark text-white relative">
      {/* NOTIFICATION */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[120] flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 ${
          notification.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSearchQuery(''); fetchSweets(''); }}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center"><span className="font-bold text-white">S</span></div>
          <span className="font-bold text-xl tracking-tight">SweetShop</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden md:block">{auth.user?.email} {auth.isAdmin && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/50">ADMIN</span>}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg transition-all text-sm font-medium"><LogOut size={16} /> Logout</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Sweet Inventory</h1>
            <div className="flex gap-3 w-full md:w-auto">
               <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-80 group"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sweets..." className="w-full bg-card border border-white/10 rounded-lg py-2 pl-4 pr-12 text-sm focus:border-primary outline-none transition-colors" /><button type="submit" className="absolute right-1 top-1 p-1.5 bg-white/5 hover:bg-primary hover:text-white rounded-md text-gray-400 transition-all">{loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}</button></form>
               <button onClick={() => setIsFilterVisible(!isFilterVisible)} className={`p-2 rounded-lg border transition-colors ${isFilterVisible ? 'bg-primary text-white border-primary' : 'bg-card border-white/10 text-gray-400 hover:text-white'}`}><Filter size={20} /></button>
               {auth.isAdmin && (<button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"><Plus size={16} /> <span className="hidden sm:inline">Add</span></button>)}
            </div>
          </div>
          {isFilterVisible && (
            <div className="bg-card/50 border border-white/5 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row gap-6 items-end">
                <div className="w-full sm:w-1/3"><label className="text-xs text-gray-400 mb-1.5 block uppercase font-bold">Category</label><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary outline-none text-gray-300">{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div className="w-full sm:w-1/3"><div className="flex justify-between text-xs text-gray-400 mb-1.5"><span className="uppercase font-bold">Max Price</span><span className="text-primary font-bold">${maxPrice}</span></div><input type="range" min="0" max="200" step="5" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" /></div>
                <button onClick={() => { setSelectedCategory('All'); setMaxPrice(200); setSearchQuery(''); }} className="px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">Reset</button>
              </div>
            </div>
          )}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && sweets.length === 0 ? (<div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>) : filteredSweets.length === 0 ? (<div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500"><ShoppingBag size={48} className="mb-4 opacity-20" /><p>No sweets found.</p><button onClick={() => {setSearchQuery(''); fetchSweets('');}} className="mt-4 text-primary text-sm hover:underline">Clear Search</button></div>) : (
            filteredSweets.map((sweet) => (
              <div key={sweet.id} className="bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all group shadow-lg shadow-black/20 flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img src={sweet.imageUrl || "https://placehold.co/400x300?text=Sweet"} alt={sweet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white border border-white/10">{sweet.category}</div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate pr-2 text-white">{sweet.name}</h3>
                    <span className="text-primary font-bold text-lg">${parseFloat(sweet.price).toFixed(2)}</span>
                  </div>
                  <div className="mt-auto flex justify-between items-center pt-4">
                    <span className={`text-xs px-2 py-1 rounded-md border font-medium ${sweet.quantity > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {sweet.quantity > 0 ? `${sweet.quantity} left` : 'Out of Stock'}
                    </span>

                    <div className="flex gap-2">
                      {/* ADMIN RESTOCK BUTTON */}
                      {auth.isAdmin && (
                        <button
                          onClick={() => openRestockModal(sweet)}
                          className="p-2 bg-gray-800 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                          title="Restock"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}

                      {/* PURCHASE BUTTON */}
                      <button
                        onClick={() => openPurchaseModal(sweet)}
                        disabled={sweet.quantity === 0}
                        className={`p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center
                          ${sweet.quantity === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODALS */}
      {auth.isAdmin && <AddSweetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSweetAdded={() => fetchSweets(searchQuery)} />}
      <PurchaseModal isOpen={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} sweet={selectedSweet} onConfirm={handlePurchaseConfirm} />

      {/* RESTOCK MODAL - Admin Only */}
      {auth.isAdmin && (
        <RestockModal
          isOpen={restockModalOpen}
          onClose={() => setRestockModalOpen(false)}
          sweet={selectedSweet}
          onConfirm={handleRestockConfirm}
        />
      )}

    </div>
  );
};

export default Dashboard;
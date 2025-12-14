import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Loader2 } from 'lucide-react';

const PurchaseModal = ({ isOpen, onClose, sweet, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !sweet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Determine the actual number to buy
    const amount = parseInt(quantity);
    await onConfirm(sweet.id, amount);
    setLoading(false);
    setQuantity(1); // Reset
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="text-primary" size={20} />
              Purchase Sweet
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">

            {/* Sweet Info */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={sweet.imageUrl}
                alt={sweet.name}
                className="w-16 h-16 rounded-lg object-cover border border-white/10"
              />
              <div>
                <h3 className="font-bold text-white">{sweet.name}</h3>
                <p className="text-sm text-gray-400">${sweet.price} / each</p>
                <p className="text-xs text-primary mt-1">{sweet.quantity} items in stock</p>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={sweet.quantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-primary outline-none text-center text-xl font-bold"
              />
            </div>

            {/* Total Price Calculation */}
            <div className="flex justify-between items-center mb-6 p-3 bg-white/5 rounded-lg">
              <span className="text-gray-400 text-sm">Total Cost:</span>
              <span className="text-xl font-bold text-white">
                ${(sweet.price * quantity).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || quantity < 1 || quantity > sweet.quantity}
                className="py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PurchaseModal;
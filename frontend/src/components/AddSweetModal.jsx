import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, DollarSign, Layers, Hash, Type } from 'lucide-react';
import axios from 'axios';
import { useAtomValue } from 'jotai';
import { authState } from '../state/authAtom';

const AddSweetModal = ({ isOpen, onClose, onSweetAdded }) => {
  const auth = useAtomValue(authState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // MUST use FormData for file uploads
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('quantity', quantity);
      if (imageFile) {
        formData.append('image', imageFile); // 'image' matches backend upload.single('image')
      }

      await axios.post('http://localhost:5000/api/sweets', formData, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'multipart/form-data', // Crucial
        },
      });

      // Reset and Close
      setName('');
      setCategory('');
      setPrice('');
      setQuantity('');
      setImageFile(null);
      setPreviewUrl(null);
      onSweetAdded(); // Refresh parent list
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add sweet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-bold text-white">Add New Sweet</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Image Upload Area */}
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`h-40 w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${previewUrl ? 'border-primary/50 bg-primary/5' : 'border-gray-700 bg-white/5 hover:border-gray-500'}`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-sm text-gray-400">Click to upload image</p>
                  </>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="relative">
              <Type className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Sweet Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-primary outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="relative">
                <Layers className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-primary outline-none"
                  required
                />
              </div>

              {/* Price */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-primary outline-none"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                type="number"
                placeholder="Quantity in Stock"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-primary outline-none"
                required
              />
            </div>

            {/* Footer */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add to Inventory'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddSweetModal;
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAtomValue } from 'jotai'; // CHANGED: Recoil -> Jotai
import { authState } from '../state/authAtom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Protect Route: If already logged in, go to dashboard
  const auth = useAtomValue(authState); // CHANGED: useRecoilValue -> useAtomValue
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/sweets');
    }
  }, [auth.isAuthenticated, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        isAdmin
      });

      // Redirect to Login on success
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-dark text-white overflow-hidden">

      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Join the Sweetness
            </h2>
            <p className="text-gray-400">Create your account to start ordering</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            <div className="relative group">
              <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-dark/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            <div className="flex items-center space-x-2 p-2 bg-dark/30 rounded-lg border border-gray-700/50">
              <input
                type="checkbox"
                id="adminCheck"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 text-primary rounded focus:ring-primary bg-gray-700 border-gray-600"
              />
              <label htmlFor="adminCheck" className="text-sm text-gray-400 select-none cursor-pointer">
                Register as Admin (For Testing)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/80 hover:to-primary/80 text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE - HERO IMAGE */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 relative bg-black items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1965&auto=format&fit=crop"
          alt="Sweet Donuts"
          className="object-cover w-full h-full opacity-90"
        />
        <div className="absolute z-20 p-12 top-20 right-0 text-right">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
            Indulge Yourself
          </h1>
          <p className="text-lg text-gray-200 max-w-md ml-auto drop-shadow-md">
            Join our community of sweet lovers. Unlock exclusive flavors and fast delivery.
          </p>
        </div>
      </motion.div>

    </div>
  );
};

export default Register;
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Giriş başarılı!', {
        description: 'Yönlendiriliyorsunuz...',
      });
      router.push('/market');
    } else {
      const errorMessage = result.error || 'Giriş başarısız';
      setError(errorMessage);
      toast.error('Giriş başarısız', {
        description: errorMessage,
      });
    }

    setIsLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Mobile Logo - Only visible on small screens */}
      <motion.div
        variants={itemVariants}
        className="lg:hidden flex justify-center mb-8"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-white"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            PharmaB2B
          </span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hos Geldiniz</h1>
        <p className="text-gray-600">Hesabiniza giris yapin</p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-posta Adresi
          </Label>
          <div className="relative">
            <motion.div
              animate={{
                scale: focusedField === 'email' ? 1 : 0.95,
                opacity: focusedField === 'email' ? 1 : 0
              }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm -z-10"
            />
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="ornek@eczane.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                className="h-12 pl-12 pr-4 bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
              />
            </div>
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Sifre
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Sifremi Unuttum
            </Link>
          </div>
          <div className="relative">
            <motion.div
              animate={{
                scale: focusedField === 'password' ? 1 : 0.95,
                opacity: focusedField === 'password' ? 1 : 0
              }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm -z-10"
            />
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                className="h-12 pl-12 pr-12 bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            disabled={isLoading}
            className="relative w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: '-100%' }}
              animate={isLoading ? { x: '100%' } : { x: '-100%' }}
              transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Giris Yapiliyor...</span>
                </>
              ) : (
                <>
                  <span>Giris Yap</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </span>
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-gray-50 to-white text-gray-500">veya</span>
          </div>
        </motion.div>

        {/* Register Link */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-gray-600">
            Hesabiniz yok mu?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors relative group"
            >
              <span>Kayit Olun</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>
        </motion.div>
      </form>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="mt-8 pt-6 border-t border-gray-100 text-center"
      >
        <p className="text-xs text-gray-400">
          Giris yaparak{' '}
          <Link href="/legal/kvkk" className="text-emerald-600 hover:underline">
            Gizlilik Politikasi
          </Link>
          {' '}ve{' '}
          <Link href="/legal/uyelik-sozlesmesi" className="text-emerald-600 hover:underline">
            Kullanim Sartlari
          </Link>
          'ni kabul etmis olursunuz.
        </p>
      </motion.div>
    </motion.div>
  );
}

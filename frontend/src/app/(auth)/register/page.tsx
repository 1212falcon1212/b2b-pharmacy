'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api, authApi, RegisterData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Step configuration
const steps = [
  { id: 1, title: 'GLN Dogrulama', description: 'Eczane GLN kodunuzu dogrulayin' },
  { id: 2, title: 'Kisisel Bilgiler', description: 'Iletisim bilgilerinizi girin' },
  { id: 3, title: 'Sifre Belirleme', description: 'Guvenli bir sifre olusturun' },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward
  const [glnCode, setGlnCode] = useState('');
  const [glnVerified, setGlnVerified] = useState(false);
  const [pharmacyInfo, setPharmacyInfo] = useState<{
    pharmacy_name?: string;
    city?: string;
    address?: string;
  }>({});

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { setUser } = useAuth();
  const router = useRouter();

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleGlnVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    if (glnCode.length !== 13) {
      setFieldErrors({ gln: 'GLN kodu 13 haneli olmalidir' });
      setIsLoading(false);
      return;
    }

    const response = await authApi.verifyGln(glnCode);

    if (response.data?.valid) {
      if (response.data.already_registered) {
        setError('Bu GLN kodu zaten kayitli. Giris yapabilirsiniz.');
      } else {
        setGlnVerified(true);
        setPharmacyInfo({
          pharmacy_name: response.data.pharmacy_name,
          city: response.data.city,
          address: response.data.address,
        });
        goToStep(2);
      }
    } else {
      setError(response.data?.message || response.error || 'GLN kodu dogrulanamadi');
    }

    setIsLoading(false);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'E-posta adresi gerekli';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Gecerli bir e-posta adresi girin';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    goToStep(3);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (formData.password.length < 8) {
      errors.password = 'Sifre en az 8 karakter olmalidir';
    }

    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Sifreler eslesmiyor';
    }

    if (!acceptedTerms) {
      errors.terms = 'Sozlesmeleri kabul etmelisiniz';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    const registerData: RegisterData = {
      ...formData,
      gln_code: glnCode,
      pharmacy_name: pharmacyInfo.pharmacy_name,
      city: pharmacyInfo.city,
      address: pharmacyInfo.address,
    };

    const response = await authApi.register(registerData);

    if (response.data) {
      api.setToken(response.data.token);
      setUser(response.data.user);
      router.push('/documents');
    } else {
      setError(response.error || 'Kayit basarisiz');
    }

    setIsLoading(false);
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    setError('');
    setFieldErrors({});
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Zayif';
    if (passwordStrength <= 50) return 'Orta';
    if (passwordStrength <= 75) return 'Iyi';
    return 'Guclu';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Mobile Logo */}
      <motion.div
        variants={itemVariants}
        className="lg:hidden flex justify-center mb-6"
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

      {/* Progress Bar */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {currentStep > step.id ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
                {currentStep === step.id && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-500"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <div className="w-12 sm:w-20 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
                    initial={{ width: '0%' }}
                    animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
          <p className="text-sm text-gray-500">{steps[currentStep - 1].description}</p>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden"
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

      {/* Form Steps */}
      <div className="relative overflow-hidden min-h-[380px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {/* Step 1: GLN Verification */}
          {currentStep === 1 && (
            <motion.form
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" as const }}
              onSubmit={handleGlnVerify}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="gln" className="text-sm font-medium text-gray-700">
                  GLN Kodu (13 Haneli)
                </Label>
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: focusedField === 'gln' ? 1 : 0.95,
                      opacity: focusedField === 'gln' ? 1 : 0
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm -z-10"
                  />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <Input
                      id="gln"
                      type="text"
                      placeholder="8680000000001"
                      value={glnCode}
                      onChange={(e) => setGlnCode(e.target.value.replace(/\D/g, '').slice(0, 13))}
                      onFocus={() => setFocusedField('gln')}
                      onBlur={() => setFocusedField(null)}
                      maxLength={13}
                      required
                      className={`h-14 pl-12 text-center text-xl tracking-[0.3em] font-mono bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 ${
                        fieldErrors.gln ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                </div>
                {fieldErrors.gln && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {fieldErrors.gln}
                  </motion.p>
                )}
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  GLN kodunuz eczane belgenizde bulunmaktadir.
                </p>
              </div>

              {/* GLN Visual Helper */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Guvenli Dogrulama</h4>
                    <p className="text-xs text-gray-500">ITS sistemi uzerinden dogrulanir</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(13)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex-1 h-2 rounded-full ${
                        i < glnCode.length ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {glnCode.length}/13 karakter
                </p>
              </motion.div>

              <Button
                type="submit"
                disabled={isLoading || glnCode.length !== 13}
                className="relative w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Dogrulaniyor...</span>
                    </>
                  ) : (
                    <>
                      <span>GLN Dogrula</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </Button>

              <p className="text-sm text-center text-gray-600">
                Zaten hesabiniz var mi?{' '}
                <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Giris yapin
                </Link>
              </p>
            </motion.form>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <motion.form
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" as const }}
              onSubmit={handleStep2Submit}
              className="space-y-5"
            >
              {/* Verified GLN Info */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{pharmacyInfo.pharmacy_name}</p>
                    <p className="text-sm text-emerald-700">{pharmacyInfo.city}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-mono bg-emerald-100/50 rounded px-2 py-1 inline-block">
                  GLN: {glnCode}
                </p>
              </motion.div>

              {/* Email Field */}
              <div className="space-y-2">
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-12 pl-12 bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 ${
                        fieldErrors.email ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                </div>
                {fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefon <span className="text-gray-400 font-normal">(Istege Bagli)</span>
                </Label>
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: focusedField === 'phone' ? 1 : 0.95,
                      opacity: focusedField === 'phone' ? 1 : 0
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm -z-10"
                  />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0555 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className="h-12 pl-12 bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep(1)}
                  className="flex-1 h-12 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Geri
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 group"
                >
                  Devam
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </div>
            </motion.form>
          )}

          {/* Step 3: Password */}
          {currentStep === 3 && (
            <motion.form
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" as const }}
              onSubmit={handleRegister}
              className="space-y-5"
            >
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Sifre
                </Label>
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      minLength={8}
                      className={`h-12 pl-12 pr-12 bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 ${
                        fieldErrors.password ? 'border-red-500' : ''
                      }`}
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
                {fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {fieldErrors.password}
                  </motion.p>
                )}

                {/* Password Strength */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map((threshold) => (
                        <div
                          key={threshold}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= threshold ? getStrengthColor() : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength >= 75 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      Sifre gucu: {getStrengthText()}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                  Sifre Tekrar
                </Label>
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: focusedField === 'password_confirmation' ? 1 : 0.95,
                      opacity: focusedField === 'password_confirmation' ? 1 : 0
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-sm -z-10"
                  />
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      onFocus={() => setFocusedField('password_confirmation')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-12 pl-12 pr-12 bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 ${
                        fieldErrors.password_confirmation ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
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
                    {formData.password_confirmation && formData.password === formData.password_confirmation && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-12 text-emerald-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </div>
                {fieldErrors.password_confirmation && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {fieldErrors.password_confirmation}
                  </motion.p>
                )}
              </div>

              {/* Terms Checkbox */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  fieldErrors.terms ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <Label htmlFor="terms" className="text-sm font-normal text-gray-600 leading-relaxed cursor-pointer">
                  <Link href="/legal/kvkk" target="_blank" className="font-medium text-emerald-600 hover:text-emerald-700 underline">
                    KVKK Aydinlatma Metni
                  </Link>
                  'ni ve{' '}
                  <Link href="/legal/uyelik-sozlesmesi" target="_blank" className="font-medium text-emerald-600 hover:text-emerald-700 underline">
                    Uyelik Sozlesmesi
                  </Link>
                  'ni okudum, onayliyorum.
                </Label>
              </motion.div>
              {fieldErrors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 -mt-3"
                >
                  {fieldErrors.terms}
                </motion.p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToStep(2)}
                  className="flex-1 h-12 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Geri
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 group"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kayit Yapiliyor...
                    </>
                  ) : (
                    <>
                      Kayit Ol
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

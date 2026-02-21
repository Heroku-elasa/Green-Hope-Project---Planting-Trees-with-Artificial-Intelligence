import React, { useState, useEffect } from 'react';
import { useLanguage } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '', verification: '' });
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setVerificationCode('');
      setErrors({ name: '', email: '', password: '', confirmPassword: '', verification: '' });
      setMode('login'); // Default to login when opened
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  const validate = (): boolean => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '', verification: '' };
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register' && !name.trim()) {
      newErrors.name = t('validation.nameRequired');
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = t('validation.required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = t('validation.email');
      isValid = false;
    }

    if (!password) {
      newErrors.password = t('validation.required');
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = t('validation.passwordLength');
      isValid = false;
    }
    
    if (mode === 'register') {
        if (!confirmPassword) {
            newErrors.confirmPassword = t('validation.required');
            isValid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = t('validation.passwordMismatch');
            isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
  };
  
  const handleEmailBlur = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: t('validation.required') }));
    } else if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: t('validation.email') }));
    } else {
      setErrors(prev => ({ ...prev, email: '' })); // Clear error if valid
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (mode === 'login') {
        onLogin();
      } else {
        setMode('verify');
        setErrors({ name: '', email: '', password: '', confirmPassword: '', verification: '' });
      }
    }
  };
  
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded verification code for demo
    if (verificationCode === '123456') {
        onRegister();
    } else {
        setErrors(prev => ({ ...prev, verification: t('validation.invalidCode') }));
    }
  };

  const switchMode = () => {
      setMode(prev => prev === 'login' ? 'register' : 'login');
      setErrors({ name: '', email: '', password: '', confirmPassword: '', verification: '' });
  };
  
  const SocialButton: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; className?: string }> = ({ icon, text, onClick, className }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md text-sm font-medium transition-colors shadow-sm ${className}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );

  const getModalTitle = () => {
    if (mode === 'login') return t('loginModal.title');
    if (mode === 'register') return t('loginModal.registerTitle');
    return t('loginModal.verifyTitle');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div
        className="bg-slate-800 text-white rounded-lg shadow-xl w-full max-w-sm mx-4 border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-5 border-b border-slate-700 flex justify-between items-center">
          <h2 id="login-modal-title" className="text-xl font-bold">{getModalTitle()}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {mode === 'verify' ? (
             <main className="p-8 space-y-6">
                <p className="text-center text-gray-300" dangerouslySetInnerHTML={{ __html: t('loginModal.verifyInstructions').replace('{email}', `<span class="font-bold text-white">${email}</span>`) }} />
                <p className="text-center text-sm text-yellow-300 bg-yellow-900/50 p-2 rounded-md" dangerouslySetInnerHTML={{ __html: t('loginModal.demoCodeNotice').replace('{code}', '123456') }} />
                <form onSubmit={handleVerificationSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="verification-code" className="sr-only">{t('loginModal.verificationCodePlaceholder')}</label>
                    <input 
                      type="text" 
                      id="verification-code" 
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        if (errors.verification) setErrors(p => ({ ...p, verification: '' }));
                      }}
                      placeholder={t('loginModal.verificationCodePlaceholder')}
                      className={`w-full bg-slate-700 rounded-md p-3 text-center text-lg tracking-[0.5em] focus:outline-none transition-colors ${errors.verification ? 'border border-red-500 ring-2 ring-red-500/50' : 'border border-slate-600 focus:ring-2 focus:ring-pink-500'}`}
                      maxLength={6}
                      required 
                    />
                    {errors.verification && <p className="mt-2 text-sm text-red-400 animate-fade-in">{errors.verification}</p>}
                  </div>
                  <button type="submit" className="w-full py-3 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 transition-colors">
                    {t('loginModal.verifyButton')}
                  </button>
                </form>
                <div className="text-center text-sm pt-2">
                    <button onClick={() => setMode('register')} className="text-gray-400 hover:text-white hover:underline transition-colors">
                        {t('loginModal.backToRegister')}
                    </button>
                </div>
              </main>
        ) : (
            <main className="p-8 space-y-6">
            <div className="space-y-3">
                <SocialButton
                onClick={onLogin}
                icon={<svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 30.618 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>}
                text={t('loginModal.google')}
                className="bg-white text-gray-700 hover:bg-gray-200"
                />
            </div>

            <div className="flex items-center text-xs text-gray-400">
                <div className="flex-grow border-t border-slate-600"></div>
                <span className="flex-shrink mx-4">{t('loginModal.or')}</span>
                <div className="flex-grow border-t border-slate-600"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                <div>
                    <label htmlFor="name" className="sr-only">{t('loginModal.namePlaceholder')}</label>
                    <input 
                    type="text" 
                    id="name" 
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(p => ({ ...p, name: '' }));
                    }}
                    placeholder={t('loginModal.namePlaceholder')} 
                    className={`w-full bg-slate-700 rounded-md p-3 focus:outline-none transition-colors ${errors.name ? 'border border-red-500 ring-2 ring-red-500/50' : 'border border-slate-600 focus:ring-2 focus:ring-pink-500'}`}
                    required 
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-400 animate-fade-in">{errors.name}</p>}
                </div>
                )}
                <div>
                <label htmlFor="email" className="sr-only">{t('loginModal.emailPlaceholder')}</label>
                <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(p => ({ ...p, email: '' }));
                    }}
                    onBlur={handleEmailBlur}
                    placeholder={t('loginModal.emailPlaceholder')} 
                    className={`w-full bg-slate-700 rounded-md p-3 focus:outline-none transition-colors ${errors.email ? 'border border-red-500 ring-2 ring-red-500/50' : 'border border-slate-600 focus:ring-2 focus:ring-pink-500'}`}
                    required 
                />
                {errors.email && <p className="mt-2 text-sm text-red-400 animate-fade-in">{errors.email}</p>}
                </div>
                <div>
                <label htmlFor="password" className="sr-only">{t('loginModal.passwordPlaceholder')}</label>
                <input 
                    type="password" 
                    id="password" 
                    value={password}
                    onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(p => ({ ...p, password: '' }));
                    }}
                    placeholder={t('loginModal.passwordPlaceholder')} 
                    className={`w-full bg-slate-700 rounded-md p-3 focus:outline-none transition-colors ${errors.password ? 'border border-red-500 ring-2 ring-red-500/50' : 'border border-slate-600 focus:ring-2 focus:ring-pink-500'}`}
                    required 
                />
                {errors.password && <p className="mt-2 text-sm text-red-400 animate-fade-in">{errors.password}</p>}
                </div>
                {mode === 'register' && (
                <div>
                    <label htmlFor="confirmPassword" className="sr-only">{t('loginModal.confirmPasswordPlaceholder')}</label>

                    <input 
                    type="password" 
                    id="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: '' }));
                    }}
                    placeholder={t('loginModal.confirmPasswordPlaceholder')} 
                    className={`w-full bg-slate-700 rounded-md p-3 focus:outline-none transition-colors ${errors.confirmPassword ? 'border border-red-500 ring-2 ring-red-500/50' : 'border border-slate-600 focus:ring-2 focus:ring-pink-500'}`}
                    required 
                    />
                    {errors.confirmPassword && <p className="mt-2 text-sm text-red-400 animate-fade-in">{errors.confirmPassword}</p>}
                </div>
                )}
                <button type="submit" className="w-full py-3 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 transition-colors">
                {mode === 'login' ? t('loginModal.loginButton') : t('loginModal.registerButton')}
                </button>
            </form>

            <div className="text-center text-sm pt-2">
                    <button onClick={switchMode} className="text-gray-400 hover:text-white hover:underline transition-colors">
                        {mode === 'login' ? t('loginModal.switchToRegister') : t('loginModal.switchToLogin')}
                    </button>
                </div>
            </main>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
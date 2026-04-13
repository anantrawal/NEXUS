import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const formCard = {
  minHeight: '100vh',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '2rem',
  background: 'var(--bg-primary)',
  position: 'relative',
  overflow: 'hidden',
};

export function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div style={formCard}>
      <Glow />
      <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none' }}>NEXUS</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to continue shopping</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <FormField label="Password" type={showPass ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Your password"
              suffix={
                <button type="button" onClick={() => setShowPass((v) => !v)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            {error && <p style={{ fontSize: '0.8rem', color: 'var(--red)', textAlign: 'center' }}>{error}</p>}
            <SubmitBtn loading={loading} label="SIGN IN" />
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create one →</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [showPass, setShowPass] = useState(false);
  const { register: registerAction } = require('../store/slices/authSlice');

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerAction(form));
    if (registerAction.fulfilled.match(result)) {
      toast.success('Account created! Welcome to NEXUS.');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={formCard}>
      <Glow />
      <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none' }}>NEXUS</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Create account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join thousands of shoppers</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <FormField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="John" />
              <FormField label="Last Name"  value={form.lastName}  onChange={set('lastName')}  placeholder="Doe"  />
            </div>
            <FormField label="Username" value={form.username} onChange={set('username')} placeholder="johndoe" />
            <FormField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            <FormField label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters"
              suffix={
                <button type="button" onClick={() => setShowPass((v) => !v)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            {error && <p style={{ fontSize: '0.8rem', color: 'var(--red)', textAlign: 'center' }}>{error}</p>}
            <SubmitBtn loading={loading} label="CREATE ACCOUNT" />
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange, placeholder, suffix }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={{ paddingRight: suffix ? '2.5rem' : undefined }} required />
        {suffix && (
          <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '0.85rem',
      marginTop: '0.5rem',
      background: loading ? 'rgba(232,213,176,0.5)' : 'var(--accent)',
      color: '#000', border: 'none',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-display)',
      fontWeight: 700, fontSize: '0.9rem',
      letterSpacing: '0.05em',
      cursor: loading ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      transition: 'opacity 0.2s',
    }}>
      {loading
        ? <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
        : <>{label} <ArrowRight size={15} /></>
      }
    </button>
  );
}

function Glow() {
  return (
    <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(232,213,176,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
  );
}

export default LoginPage;

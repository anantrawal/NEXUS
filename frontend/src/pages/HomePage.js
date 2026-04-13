import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { productAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

const CATEGORIES = [
  { name: 'Electronics', emoji: '⚡', color: '#5c9fe0' },
  { name: 'Clothing',    emoji: '👗', color: '#e05c8a' },
  { name: 'Books',       emoji: '📚', color: '#5ce08a' },
  { name: 'Home',        emoji: '🏠', color: '#e0b85c' },
  { name: 'Sports',      emoji: '🏃', color: '#c05ce0' },
  { name: 'Beauty',      emoji: '✨', color: '#e05c5c' },
];

const FEATURES = [
  { icon: Truck,  title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: Shield, title: 'Secure Payments', desc: 'End-to-end encryption' },
  { icon: Zap,    title: 'Fast Delivery',  desc: '2-3 business days' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured]   = useState([]);
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    productAPI.getFeatured()
      .then((r) => setFeatured(r.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex', alignItems: 'center',
        padding: '4rem 2rem',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(232,213,176,0.06) 0%, transparent 70%)',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(232,213,176,0.2)',
            borderRadius: '20px',
            padding: '0.35rem 0.9rem',
            marginBottom: '2rem',
            animation: 'fadeIn 0.6s ease',
          }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.05em' }}>
              NEW SEASON COLLECTION
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            animation: 'fadeIn 0.6s 0.1s ease both',
          }}>
            <span style={{ display: 'block' }}>SHOP THE</span>
            <span style={{ display: 'block', color: 'var(--accent)' }}>FUTURE</span>
            <span style={{ display: 'block', color: 'var(--text-muted)' }}>OF COMMERCE</span>
          </h1>

          <p style={{
            maxWidth: '480px',
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
            animation: 'fadeIn 0.6s 0.2s ease both',
          }}>
            A microservices-powered marketplace. Real-time inventory, distributed payments, and enterprise-grade architecture — all wrapped in a seamless experience.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', animation: 'fadeIn 0.6s 0.3s ease both' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.9rem 2rem',
                background: 'var(--accent)',
                color: '#000',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '0.95rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,213,176,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              EXPLORE SHOP <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '0.9rem 2rem',
                background: 'none',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontWeight: 600, fontSize: '0.95rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          position: 'absolute', bottom: '2rem', right: '2rem',
          display: 'flex', gap: '2rem',
          animation: 'fadeIn 0.6s 0.4s ease both',
        }}>
          {[['6', 'Services'], ['99.9%', 'Uptime'], ['<50ms', 'Latency']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '44px', height: '44px', flexShrink: 0,
                background: 'var(--accent-dim)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Browse by
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Categories
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.name} cat={cat} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section style={{ padding: '0 2rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Hand-picked
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Featured
              </h2>
            </div>
            <button
              onClick={() => navigate('/products')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem', color: 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              VIEW ALL <ArrowRight size={13} />
            </button>
          </div>

          {loading ? (
            <ProductSkeleton />
          ) : featured.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <EmptyState navigate={navigate} />
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ cat, navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => navigate(`/products?category=${cat.name}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '1.5rem 1rem',
        background: hovered ? 'var(--bg-elevated)' : 'var(--bg-card)',
        border: '1px solid ' + (hovered ? 'var(--border-hover)' : 'var(--border)'),
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer', transition: 'all 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
      }}
    >
      <span style={{ fontSize: '2rem' }}>{cat.emoji}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        {cat.name}
      </span>
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ aspectRatio: '1', background: 'var(--bg-elevated)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ height: '10px', background: 'var(--bg-elevated)', borderRadius: '4px', width: '40%', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '14px', background: 'var(--bg-elevated)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '14px', background: 'var(--bg-elevated)', borderRadius: '4px', width: '70%', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <p style={{ marginBottom: '1.5rem' }}>No featured products yet. Start shopping!</p>
      <button onClick={() => navigate('/products')} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        Browse All Products
      </button>
    </div>
  );
}

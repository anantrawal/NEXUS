import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ShoppingBag, Star, Package, ChevronRight } from 'lucide-react';
import { productAPI } from '../services/api';
import { addToCart, openCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [product, setProduct] = useState(null);
  const [loading,  setLoading] = useState(true);
  const [qty,      setQty]     = useState(1);
  const [adding,   setAdding]  = useState(false);
  const [activeImg,setActiveImg]= useState(0);

  useEffect(() => {
    setLoading(true);
    productAPI.getById(id)
      .then((r) => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await dispatch(addToCart({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity: qty,
        category: product.category,
      })).unwrap();
      dispatch(openCart());
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add'); }
    finally   { setAdding(false); }
  };

  if (loading) return <LoadingSkeleton />;
  if (!product) return null;

  const images = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: 0 }}>
          <ArrowLeft size={13} /> Products
        </button>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-secondary)' }}>{product.category}</span>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

        {/* Images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            aspectRatio: '1', background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={80} color="var(--text-muted)" strokeWidth={1} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: '64px', height: '64px', flexShrink: 0,
                  borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  border: '2px solid ' + (activeImg === i ? 'var(--accent)' : 'var(--border)'),
                  cursor: 'pointer', padding: 0, background: 'var(--bg-elevated)',
                }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            {product.brand ? `${product.brand} · ` : ''}{product.category}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '1rem' }}>
            {product.name}
          </h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(product.rating) ? 'var(--accent-bright)' : 'none'} color="var(--accent-bright)" />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800 }}>
              ${product.price?.toFixed(2)}
            </span>
            {discount && <>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ${product.originalPrice?.toFixed(2)}
              </span>
              <span style={{ background: 'rgba(245,200,66,0.15)', color: 'var(--accent-bright)', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                -{discount}%
              </span>
            </>}
          </div>

          {/* Description */}
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            {product.description}
          </p>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div style={{ marginBottom: '1.75rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Specifications</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {Object.entries(product.attributes).map(([k, v]) => (
                  <div key={k} style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                    <span style={{ fontWeight: 500 }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add to cart */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: '40px', height: '48px', background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.15s' }}>−</button>
              <span style={{ width: '44px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, background: 'var(--bg-card)' }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} style={{ width: '40px', height: '48px', background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.15s' }}>+</button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                flex: 1, height: '48px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: adding ? 'rgba(232,213,176,0.6)' : 'var(--accent)',
                color: '#000', border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em',
                cursor: adding ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {adding
                ? <span style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                : <><ShoppingBag size={16} /> ADD TO CART</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        <div style={{ aspectRatio: '1', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '2rem' }}>
          {[30, 80, 50, 100, 70, 90, 60].map((w, i) => (
            <div key={i} style={{ height: i === 2 ? '40px' : '16px', background: 'var(--bg-elevated)', borderRadius: '6px', width: `${w}%`, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

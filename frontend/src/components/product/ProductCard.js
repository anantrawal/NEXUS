import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { addToCart, openCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await dispatch(addToCart({
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity: 1,
        category: product.category,
      })).unwrap();
      dispatch(openCart());
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid ' + (hovered ? 'var(--border-hover)' : 'var(--border)'),
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        position: 'relative',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        aspectRatio: '1',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)',
          }}>
            <ShoppingBag size={40} color="var(--text-muted)" strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {discount && (
            <span style={{
              background: 'var(--accent-bright)', color: '#000',
              fontSize: '0.7rem', fontWeight: 700,
              padding: '0.2rem 0.5rem', borderRadius: '4px',
            }}>-{discount}%</span>
          )}
          {product.featured && (
            <span style={{
              background: 'rgba(92,159,224,0.2)', color: 'var(--blue)',
              border: '1px solid rgba(92,159,224,0.3)',
              fontSize: '0.7rem', fontWeight: 600,
              padding: '0.2rem 0.5rem', borderRadius: '4px',
            }}>Featured</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
          style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(8,8,8,0.7)',
            border: '1px solid var(--border)',
            borderRadius: '50%', cursor: 'pointer',
            transition: 'all 0.2s',
            opacity: hovered || liked ? 1 : 0,
          }}
        >
          <Heart
            size={14}
            fill={liked ? 'var(--red)' : 'none'}
            color={liked ? 'var(--red)' : 'var(--text-secondary)'}
          />
        </button>

        {/* Quick add overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0.75rem',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.25s ease',
        }}>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              width: '100%', padding: '0.65rem',
              background: adding ? 'rgba(232,213,176,0.7)' : 'var(--accent)',
              color: '#000',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '0.8rem',
              letterSpacing: '0.05em',
              cursor: adding ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}
          >
            {adding ? (
              <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : (
              <><ShoppingBag size={13} /> ADD TO CART</>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '0.9rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
          {product.category}
        </div>
        <div style={{
          fontSize: '0.9rem', fontWeight: 500,
          marginBottom: '0.6rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', lineHeight: 1.4,
        }}>{product.name}</div>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.6rem' }}>
            <Star size={12} fill="var(--accent-bright)" color="var(--accent-bright)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
            ${product.price?.toFixed(2)}
          </span>
          {discount && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              ${product.originalPrice?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

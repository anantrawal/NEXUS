import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { closeCart, updateQty, removeFromCart, selectCartTotal } from '../../store/slices/cartSlice';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isOpen } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => dispatch(closeCart())}
          style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(420px, 95vw)',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        zIndex: 200,
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={18} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              Your Cart
            </span>
            <span style={{
              background: 'var(--accent-dim)', color: 'var(--accent)',
              fontSize: '0.75rem', fontWeight: 600,
              padding: '0.15rem 0.5rem', borderRadius: '20px',
            }}>{items.length}</span>
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            style={{
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          ><X size={15} /></button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '60%', gap: '1rem',
              color: 'var(--text-muted)',
            }}>
              <ShoppingBag size={48} strokeWidth={1} />
              <span style={{ fontSize: '0.9rem' }}>Your cart is empty</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item) => (
                <CartItem key={item.productId} item={item} dispatch={dispatch} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              style={{
                width: '100%', padding: '0.9rem',
                background: 'var(--accent)',
                color: '#000',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '0.9rem',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              CHECKOUT →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartItem({ item, dispatch }) {
  return (
    <div style={{
      display: 'flex', gap: '0.85rem',
      padding: '0.85rem',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Image */}
      <div style={{
        width: '64px', height: '64px', flexShrink: 0,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={20} color="var(--text-muted)" />
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.85rem', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '0.3rem',
        }}>{item.productName}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>
          ${(item.price * item.quantity).toFixed(2)}
        </div>

        {/* Qty controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => dispatch(updateQty({ productId: item.productId, quantity: item.quantity - 1 }))}
            style={{
              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          ><Minus size={11} /></button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
            {item.quantity}
          </span>
          <button
            onClick={() => dispatch(updateQty({ productId: item.productId, quantity: item.quantity + 1 }))}
            style={{
              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          ><Plus size={11} /></button>
          <button
            onClick={() => dispatch(removeFromCart(item.productId))}
            style={{
              marginLeft: 'auto',
              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          ><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { updateQty, removeFromCart, clearCart as clearCartAction, selectCartTotal } from '../store/slices/cartSlice';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── CartPage ────────────────────────────────────────────────────

export function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const total     = useSelector(selectCartTotal);
  const shipping  = total >= 50 ? 0 : 5.99;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <EmptyCart navigate={navigate} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item) => (
              <div key={item.productId} style={{
                display: 'flex', gap: '1rem', padding: '1.25rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', animation: 'fadeIn 0.2s ease',
              }}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={24} color="var(--text-muted)" /></div>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{item.productName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{item.category}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => dispatch(updateQty({ productId: item.productId, quantity: item.quantity - 1 }))} style={qtyBtn}><Minus size={12} /></button>
                    <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => dispatch(updateQty({ productId: item.productId, quantity: item.quantity + 1 }))} style={qtyBtn}><Plus size={12} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button onClick={() => dispatch(removeFromCart(item.productId))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', position: 'sticky', top: '80px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Order Summary</div>
            <SummaryRow label="Subtotal" value={`$${total.toFixed(2)}`} />
            <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`} valueColor={shipping === 0 ? 'var(--green)' : undefined} />
            {shipping > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Free shipping on orders over $50</div>}
            <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 0', paddingTop: '1rem' }}>
              <SummaryRow label="Total" value={`$${(total + shipping).toFixed(2)}`} bold />
            </div>
            <button
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', padding: '0.85rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.04em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              PROCEED TO CHECKOUT <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CheckoutPage ────────────────────────────────────────────────

export function CheckoutPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const { user }  = useSelector((s) => s.auth);
  const total     = useSelector(selectCartTotal);
  const shipping  = total >= 50 ? 0 : 5.99;
  const [placing, setPlacing] = useState(false);
  const [placed,  setPlaced]  = useState(null);
  const [address, setAddress] = useState({ fullName: '', street: '', city: '', state: '', postalCode: '', country: 'US', phone: '' });
  const setA = (k) => (e) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, productName: i.productName, imageUrl: i.imageUrl, unitPrice: i.price, quantity: i.quantity })),
        shippingAddress: address,
        paymentToken: 'tok_visa',   // stub — in production: Stripe.js PaymentMethod ID
        paymentMethod: 'CARD',
      };
      const { data } = await orderAPI.placeOrder(payload);
      setPlaced(data);
      dispatch(clearCartAction());
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) return <OrderSuccess order={placed} navigate={navigate} />;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '2rem' }}>Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          {/* Shipping form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.75rem' }}>
            <SectionTitle>Shipping Address</SectionTitle>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <FormInput label="Full Name" value={address.fullName} onChange={setA('fullName')} required />
              <FormInput label="Street Address" value={address.street} onChange={setA('street')} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormInput label="City" value={address.city} onChange={setA('city')} required />
                <FormInput label="State" value={address.state} onChange={setA('state')} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormInput label="Postal Code" value={address.postalCode} onChange={setA('postalCode')} required />
                <FormInput label="Country" value={address.country} onChange={setA('country')} required />
              </div>
              <FormInput label="Phone (optional)" type="tel" value={address.phone} onChange={setA('phone')} />
            </div>

            <SectionTitle style={{ marginTop: '2rem' }}>Payment</SectionTitle>
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              🔒 Test mode — using Stripe test card (tok_visa). No real charge will occur.
            </div>
          </div>

          {/* Order summary */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem' }}>Order ({items.length} items)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {items.map((item) => (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.productName} × {item.quantity}</span>
                    <span style={{ fontWeight: 500 }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <SummaryRow label="Subtotal" value={`$${total.toFixed(2)}`} />
                <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`} valueColor={shipping === 0 ? 'var(--green)' : undefined} />
                <SummaryRow label="Total" value={`$${(total + shipping).toFixed(2)}`} bold />
              </div>
            </div>
            <button type="submit" disabled={placing || items.length === 0} style={{ width: '100%', padding: '0.9rem', background: placing ? 'rgba(232,213,176,0.6)' : 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', cursor: placing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {placing ? <Spinner /> : <>PLACE ORDER <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── OrdersPage ──────────────────────────────────────────────────

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    orderAPI.getUserOrders({ page: 0, size: 20 })
      .then((r) => setOrders(r.data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '2rem' }}>My Orders</h1>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: '100px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
          <Package size={60} strokeWidth={1} style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>No orders yet</p>
          <button onClick={() => navigate('/products')} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.map((order) => <OrderRow key={order.id} order={order} navigate={navigate} />)}
        </div>
      )}
    </div>
  );
}

// ─── OrderDetailPage ─────────────────────────────────────────────

export function OrderDetailPage() {
  const { id }   = require('react-router-dom').useParams();
  const navigate = useNavigate();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    orderAPI.getOrder(id)
      .then((r) => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
    <div style={{ height: '400px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
  </div>;
  if (!order) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        ← Back to Orders
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Order #{order.id?.slice(-8).toUpperCase()}</h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.createdAt && new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {(order.items || []).map((item, i) => (
            <div key={item.productId} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="var(--text-muted)" /></div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.productName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>${item.totalPrice?.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Payment</div>
            <SummaryRow label="Subtotal"  value={`$${order.subtotal?.toFixed(2)}`} />
            <SummaryRow label="Shipping"  value={order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`} />
            <SummaryRow label="Total"     value={`$${order.totalAmount?.toFixed(2)}`} bold />
          </div>
          {order.shippingAddress && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Shipping To</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{order.shippingAddress.fullName}</div>
                <div>{order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared components ───────────────────────────────────────────

function OrderRow({ order, navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid ' + (hovered ? 'var(--border-hover)' : 'var(--border)'),
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: hovered ? 'translateX(4px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '44px', height: '44px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={20} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>#{order.id?.slice(-8).toUpperCase()}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {order.items?.length || 0} items · {order.createdAt && new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>${order.totalAmount?.toFixed(2)}</span>
        <StatusBadge status={order.status} small />
        <ArrowRight size={16} color="var(--text-muted)" />
      </div>
    </div>
  );
}

function StatusBadge({ status, small }) {
  const map = {
    PENDING:           { color: 'var(--blue)',   bg: 'rgba(92,159,224,0.1)', icon: Clock },
    PAYMENT_INITIATED: { color: 'var(--blue)',   bg: 'rgba(92,159,224,0.1)', icon: Clock },
    PAYMENT_COMPLETED: { color: 'var(--blue)',   bg: 'rgba(92,159,224,0.1)', icon: Clock },
    INVENTORY_RESERVED:{ color: 'var(--accent)', bg: 'var(--accent-dim)',    icon: Clock },
    CONFIRMED:         { color: 'var(--green)',  bg: 'rgba(92,224,138,0.1)', icon: CheckCircle },
    PROCESSING:        { color: 'var(--accent)', bg: 'var(--accent-dim)',    icon: Clock },
    SHIPPED:           { color: 'var(--accent)', bg: 'var(--accent-dim)',    icon: Package },
    DELIVERED:         { color: 'var(--green)',  bg: 'rgba(92,224,138,0.1)', icon: CheckCircle },
    CANCELLED:         { color: 'var(--red)',    bg: 'rgba(224,92,92,0.1)',  icon: XCircle },
    PAYMENT_FAILED:    { color: 'var(--red)',    bg: 'rgba(224,92,92,0.1)',  icon: XCircle },
    REFUNDED:          { color: 'var(--text-secondary)', bg: 'var(--bg-elevated)', icon: XCircle },
  };
  const cfg = map[status] || map.PENDING;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: small ? '0.2rem 0.6rem' : '0.3rem 0.8rem',
      background: cfg.bg, color: cfg.color,
      borderRadius: '20px',
      fontSize: small ? '0.72rem' : '0.8rem',
      fontWeight: 600, letterSpacing: '0.02em',
    }}>
      <Icon size={small ? 11 : 13} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

function OrderSuccess({ order, navigate }) {
  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ width: '72px', height: '72px', background: 'rgba(92,224,138,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <CheckCircle size={36} color="var(--green)" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Order Placed!</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your order #{order.id?.slice(-8).toUpperCase()} has been received.</p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Processing via distributed Saga — you'll be notified once confirmed.</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button onClick={() => navigate('/orders')} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          View Orders
        </button>
        <button onClick={() => navigate('/products')} style={{ padding: '0.75rem 1.5rem', background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
          Keep Shopping
        </button>
      </div>
    </div>
  );
}

function EmptyCart({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
      <ShoppingBag size={64} strokeWidth={1} style={{ marginBottom: '1.5rem' }} />
      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Your cart is empty</p>
      <button onClick={() => navigate('/products')} style={{ padding: '0.8rem 1.75rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        Start Shopping
      </button>
    </div>
  );
}

function SummaryRow({ label, value, bold, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: bold ? 'var(--font-display)' : undefined, fontWeight: bold ? 700 : 500, color: valueColor || 'var(--text-primary)', fontSize: bold ? '1rem' : '0.9rem' }}>{value}</span>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', ...style }}>{children}</div>;
}

function FormInput({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} required={required} />
    </div>
  );
}

function Spinner() {
  return <span style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />;
}

const qtyBtn = { width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' };

export default CartPage;

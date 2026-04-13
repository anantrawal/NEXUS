import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest' },
  { value: 'price,asc',      label: 'Price: Low to High' },
  { value: 'price,desc',     label: 'Price: High to Low' },
  { value: 'rating,desc',    label: 'Top Rated' },
];

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(0);
  const [totalPages,setTotalPages]= useState(0);
  const [total,     setTotal]     = useState(0);
  const [search,    setSearch]    = useState(searchParams.get('search') || '');
  const [category,  setCategory]  = useState(searchParams.get('category') || '');
  const [sort,      setSort]      = useState('createdAt,desc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortDir] = sort.split(',');
      let response;
      if (search.trim()) {
        response = await productAPI.search(search.trim(), { page, size: 12 });
      } else if (category) {
        response = await productAPI.getCategory(category, { page, size: 12 });
      } else {
        response = await productAPI.getAll({ page, size: 12, sortBy, sortDir });
      }
      const data = response.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotal(data.totalElements || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(0); }, [search, category, sort]);

  const clearFilters = () => { setSearch(''); setCategory(''); setSort('createdAt,desc'); setSearchParams({}); };

  const hasFilters = search || category || sort !== 'createdAt,desc';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {category || 'All Products'}
        </h1>
        {total > 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{total} items</p>}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            style={{ paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : '0.9rem' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ width: 'auto', minWidth: '180px' }}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.65rem 1rem',
            background: filtersOpen ? 'var(--accent-dim)' : 'var(--bg-elevated)',
            border: '1px solid ' + (filtersOpen ? 'rgba(232,213,176,0.3)' : 'var(--border)'),
            borderRadius: 'var(--radius-sm)',
            color: filtersOpen ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>

        {hasFilters && (
          <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
            <X size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Category filter panel */}
      {filtersOpen && (
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Category</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <FilterChip label="All" active={!category} onClick={() => setCategory('')} />
            {CATEGORIES.map((c) => <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(category === c ? '' : c)} />)}
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <LoadingGrid />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No products found</p>
          <p style={{ fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          <PaginationBtn label="←" disabled={page === 0} onClick={() => setPage((p) => p - 1)} />
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const pageNum = totalPages <= 7 ? i : i;
            return (
              <PaginationBtn key={i} label={pageNum + 1} active={pageNum === page} onClick={() => setPage(pageNum)} />
            );
          })}
          <PaginationBtn label="→" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} />
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.85rem',
        background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
        border: '1px solid ' + (active ? 'rgba(232,213,176,0.3)' : 'var(--border)'),
        borderRadius: '20px',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: '0.8rem', fontWeight: active ? 600 : 400,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >{label}</button>
  );
}

function PaginationBtn({ label, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '36px', height: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--accent)' : 'var(--bg-elevated)',
        border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
        borderRadius: 'var(--radius-sm)',
        color: active ? '#000' : disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontWeight: active ? 700 : 400, fontSize: '0.875rem',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >{label}</button>
  );
}

function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ aspectRatio: '1', background: 'var(--bg-elevated)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[40, 100, 70, 50].map((w, j) => (
              <div key={j} style={{ height: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', width: `${w}%`, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

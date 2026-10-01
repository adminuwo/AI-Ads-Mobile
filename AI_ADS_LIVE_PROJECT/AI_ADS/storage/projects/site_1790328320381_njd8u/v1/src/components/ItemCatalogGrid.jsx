import React, { useState } from 'react';
import { Search, ShoppingBag, Plus, Minus, Check, X, Sparkles, Heart, ArrowRight, Play, Bookmark, Film, Star, Clock } from 'lucide-react';

export default function ItemCatalogGrid({ section, paymentSpec }) {
  const items = section.items || [];
  const rawCategories = section.categories && section.categories.length > 0
    ? section.categories
    : [...new Set(items.map(i => i.category).filter(Boolean))];
  const categories = ['All', ...rawCategories.filter(c => c && c.toLowerCase().trim() !== 'all')];

  const isMediaMode = section.actionType === 'WATCH_STREAM';
  const actionLabel = section.actionLabel || (isMediaMode ? 'Watch Now' : 'Add to Cart');
  const drawerTitle = section.drawerTitle || (isMediaMode ? 'My Watchlist' : 'Your Shopping Cart');

  const displaySubtitle = section.subheadline || section.contentSpec?.subheadline || (
    section.purpose && !section.purpose.toLowerCase().includes('equipped with') && !section.purpose.toLowerCase().includes('present a reactive') && !section.purpose.toLowerCase().includes('render a') && !section.purpose.toLowerCase().includes('what this')
      ? section.purpose
      : (isMediaMode ? 'The highest rated, trending titles available to stream right now.' : 'Explore our latest arrivals, featured selections, and exclusive deals.')
  );

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [activeMediaItem, setActiveMediaItem] = useState(null);

  const filteredItems = items.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id || item.name]: {
        item,
        qty: (prev[item.id || item.name]?.qty || 0) + 1
      }
    }));
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const currentQty = prev[id]?.qty || 0;
      const nextQty = currentQty + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: {
          ...prev[id],
          qty: nextQty
        }
      };
    });
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cartItemsList = Object.values(cart);
  const totalCartCount = cartItemsList.reduce((sum, entry) => sum + entry.qty, 0);

  const calculateTotal = () => {
    let sum = 0;
    cartItemsList.forEach(({ item, qty }) => {
      const numericPrice = parseFloat((item.price || '').replace(/[^0-9.]/g, '')) || 9.99;
      sum += numericPrice * qty;
    });
    return sum.toFixed(2);
  };

  return (
    <section className="section-block item-catalog-section" style={{ position: 'relative' }}>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">{section.title}</h2>
            {displaySubtitle && <p className="section-purpose">{displaySubtitle}</p>}
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
          >
            {isMediaMode ? <Bookmark size={18} /> : <ShoppingBag size={18} />}
            <span>{isMediaMode ? 'Watchlist' : 'Cart'} ({totalCartCount})</span>
            {totalCartCount > 0 && (
              <span style={{ backgroundColor: 'var(--accent-color, #F59E0B)', color: '#000', fontSize: '0.75rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '999px' }}>
                {totalCartCount}
              </span>
            )}
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, titles, or genres..."
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                background: 'var(--input-bg, rgba(255,255,255,0.05))',
                color: 'var(--text-color)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: activeCategory === cat ? 'var(--primary-color)' : 'var(--card-border)',
                    backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'transparent',
                    color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid-cards">
        {filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
            No titles or items matching "{searchQuery}".
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const itemId = item.id || item.name;
            const inCartEntry = cart[itemId];
            const isFav = favorites[itemId];

            return (
              <div
                key={itemId || idx}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  position: 'relative',
                  padding: 0
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  />
                  {item.badge && (
                    <span style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      backgroundColor: 'var(--primary-color)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase'
                    }}>
                      {item.badge}
                    </span>
                  )}

                  <button
                    onClick={() => toggleFavorite(itemId)}
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      borderRadius: '999px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isFav ? '#EF4444' : '#fff'
                    }}
                  >
                    <Heart size={16} fill={isFav ? '#EF4444' : 'none'} />
                  </button>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{item.name}</h3>
                      <span style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.95rem' }}>
                        {item.price || (isMediaMode ? 'FREE' : '$19.99')}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {item.description}
                    </p>
                  </div>

                  {isMediaMode ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setActiveMediaItem(item)}
                        className="btn btn-primary"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', borderRadius: '999px' }}
                      >
                        <Play size={14} fill="currentColor" /> Watch Now
                      </button>
                      <button
                        onClick={() => addToCart(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.6rem', borderRadius: '999px' }}
                        title="Add to Watchlist"
                      >
                        <Bookmark size={16} fill={inCartEntry ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  ) : inCartEntry ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem' }}>
                      <button onClick={() => updateQty(itemId, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)', padding: '0.25rem' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{inCartEntry.qty} in cart</span>
                      <button onClick={() => updateQty(itemId, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)', padding: '0.25rem' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', borderRadius: '999px' }}
                    >
                      <Plus size={14} /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeMediaItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: '720px', backgroundColor: '#090D16', border: '1px solid #1E293B', borderRadius: '1.5rem', overflow: 'hidden', color: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9)' }}>
            <div style={{ position: 'relative', height: '320px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={activeMediaItem.imageUrl} alt={activeMediaItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
              <button
                onClick={() => alert('Streaming simulated playback for "' + activeMediaItem.name + '" in 4K Ultra HD!')}
                style={{ position: 'absolute', width: '64px', height: '64px', borderRadius: '999px', background: 'var(--primary-color)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 30px var(--primary-color)' }}
              >
                <Play size={28} fill="#fff" style={{ marginLeft: '4px' }} />
              </button>
              <button
                onClick={() => setActiveMediaItem(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px', borderRadius: '999px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
              <span style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.7)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                4K HDR • Dolby Atmos
              </span>
            </div>

            <div style={{ padding: '1.5rem', spaceY: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{activeMediaItem.name}</h3>
                <span style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '0.9rem' }}>FREE STREAMING</span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {activeMediaItem.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #1E293B', paddingTop: '1rem' }}>
                <button
                  onClick={() => { addToCart(activeMediaItem); setActiveMediaItem(null); }}
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: '999px' }}
                >
                  + Add to My Watchlist
                </button>
                <button
                  onClick={() => setActiveMediaItem(null)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '999px', color: '#fff', borderColor: '#334155' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '100%', maxWidth: '420px', height: '100%', backgroundColor: 'var(--card-bg, #0F172A)', borderLeft: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', color: 'var(--text-color)', boxShadow: '-10px 0 25px rgba(0,0,0,0.5)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isMediaMode ? <Bookmark size={20} color="var(--primary-color)" /> : <ShoppingBag size={20} color="var(--primary-color)" />}
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{drawerTitle}</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {isCheckoutSuccess ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '999px', background: 'rgba(16,185,129,0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Check size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Order Placed Successfully!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thank you for your simulated purchase. Your order receipt is ready.</p>
                  <button onClick={() => { setIsCheckoutSuccess(false); setCart({}); setIsCartOpen(false); }} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    Continue Shopping
                  </button>
                </div>
              ) : cartItemsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.6 }}>
                  {isMediaMode ? <Film size={36} style={{ margin: '0 auto 1rem' }} /> : <ShoppingBag size={36} style={{ margin: '0 auto 1rem' }} />}
                  <p>{isMediaMode ? 'Your watchlist is empty. Add titles to watch later.' : 'Your cart is empty.'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto' }}>
                  {cartItemsList.map(({ item, qty }) => (
                    <div key={item.id || item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>{item.price || (isMediaMode ? 'FREE' : '$19.99')}</div>
                        </div>
                      </div>

                      {isMediaMode ? (
                        <button
                          onClick={() => { setActiveMediaItem(item); setIsCartOpen(false); }}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '999px' }}
                        >
                          ▶ Play
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => updateQty(item.id || item.name, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Minus size={12} /></button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{qty}</span>
                          <button onClick={() => updateQty(item.id || item.name, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Plus size={12} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isMediaMode && cartItemsList.length > 0 && !isCheckoutSuccess && (
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--primary-color)' }}>$${calculateTotal()}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutSuccess(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

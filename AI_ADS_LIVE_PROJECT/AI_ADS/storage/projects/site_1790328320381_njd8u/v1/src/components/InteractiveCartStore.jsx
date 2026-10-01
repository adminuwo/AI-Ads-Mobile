import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';

export default function InteractiveCartStore({ section }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const products = section.products || section.items || [
    { id: 1, name: 'Artisanal Product A', price: 29.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', desc: 'Handcrafted luxury item.' },
    { id: 2, name: 'Artisanal Product B', price: 49.99, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80', desc: 'Premium material edition.' },
  ];

  const addToCart = (prod) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === prod.id);
      if (existing) {
        return prev.map(item => item.id === prod.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...prod, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2);

  return (
    <section className="section-block p-6 rounded-3xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-color)' }}>{section.title || 'Product Collection'}</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{section.purpose || 'Explore items and add to cart'}</p>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative px-3.5 py-2 rounded-xl bg-brand-600 text-white font-extrabold text-xs flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" /> Cart ({totalItems})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(prod => (
          <div key={prod.id} className="p-4 rounded-2xl border bg-slate-900/60 border-slate-800 flex flex-col justify-between">
            {prod.image && <img src={prod.image} alt={prod.name} className="w-full h-40 object-cover rounded-xl mb-3" />}
            <div>
              <h3 className="font-extrabold text-sm text-white">{prod.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{prod.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-extrabold text-emerald-400">${prod.price}</span>
              <button onClick={() => addToCart(prod)} className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-400" /> Your Shopping Cart
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {cart.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Your cart is currently empty.</p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <div>
                        <h4 className="text-xs font-extrabold text-white">{item.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-bold">${item.price} each</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded bg-slate-700 text-white"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-extrabold text-white px-2">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded bg-slate-700 text-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex justify-between text-sm font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">${totalPrice}</span>
                </div>
                <button onClick={() => { alert('Order checkout confirmed!'); setCart([]); setIsCartOpen(false); }} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

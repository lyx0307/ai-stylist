import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { Profile } from './views/Profile';
import { Styling } from './views/Styling';
import { api } from './api';

export interface UserProfile {
  id?: string;
  name: string;
  height: string;
  weight: string;
  isRegistered: boolean;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'styling' | 'profile'>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '刘宇翔',
    height: '165',
    weight: '48',
    isRegistered: false
  });
  const [cartItems, setCartItems] = useState<any[]>([]);

  const handleAddToCart = (product: any, color: string, size: string) => {
    setCartItems(prev => [...prev, { ...product, cartItemId: Date.now(), selectedColor: color, selectedSize: size }]);
    alert('已成功加入购物车！');
  };

  const handleRemoveFromCart = (cartItemId: number) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  useEffect(() => {
    // Fetch mock user configuration from backend
    api.getUser().then(data => {
      if (data) {
        setUserProfile({
          id: data.id,
          name: data.name || '刘宇翔',
          height: data.height || '165',
          weight: data.weight || '48',
          isRegistered: data.is_registered
        });
      }
    }).catch(err => console.error('Failed to fetch user:', err));
  }, []);

  const handleLogout = () => {
    // Only locally log out for the mock user update logic
    setUserProfile({
      name: '刘宇翔',
      height: '165',
      weight: '48',
      isRegistered: false
    });
    api.updateUser({ ...userProfile, is_registered: false }).then(() => {
      window.location.reload(); // Force reload to clear any cached states
    }).catch(err => {
      console.error(err);
      setCurrentView('home');
    });
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
      {currentView === 'home' && <Home onNavigateToStyling={() => setCurrentView('styling')} onAddToCart={handleAddToCart} />}
      {currentView === 'styling' && <Styling onAddToCart={handleAddToCart} />}
      {currentView === 'profile' && (
        <Profile
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
        />
      )}
    </Layout>
  );
}

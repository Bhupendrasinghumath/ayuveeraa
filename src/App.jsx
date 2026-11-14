import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from "./pages/Home";
import Products from './pages/Products'; 
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import Shop from './pages/Shop';
import Checkouts from './pages/Checkouts';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Account from './pages/Account';

import WeightManagement from './pages/categories/weight-management';
import HairCare from './pages/categories/hair-care';
import SkinCare from './pages/categories/skin-care';
import StressManagement from './pages/categories/stress-management';
import BloodPurifier from './pages/categories/blood-purifier';
import DigestionSupport from './pages/categories/digestion-support';
import EyeCare from './pages/categories/eye-care';
import HeartCare from './pages/categories/heart-care';
import MigraineSupport from './pages/categories/migraine-support';
import HerbalShots from './pages/categories/herbal-shots';
import PlantProtein from './pages/categories/plant-protein-supplement';
import SugarManagement from './pages/categories/sugar-management';

import FAQs from './pages/customerServices/FAQs';
import TrackOrder from './pages/customerServices/TrackOrder';
import ReferFriend from './pages/customerServices/ReferFriend';
import PrivacyPolicy from './pages/TermsAndCondition/PrivacyPolicy';
import ShippingPolicy from './pages/TermsAndCondition/ShippingPolicy';
import TermsAndCondition from './pages/TermsAndCondition/TermsAndCondition';
import { useProducts } from './context/useProducts';
import { hasProductsInCategory } from './data/categories';
import Admin from './pages/Admin';

function AvailableCategoryRoute({ category, children }) {
  const { products, loading } = useProducts();

  if (loading) return null;
  if (!hasProductsInCategory(products, category)) {
    return <Navigate to="/products" replace />;
  }
  return children;
}

function App() {
  const { products, catalogError } = useProducts();
  const location = useLocation();
  const isAdmin = location.pathname === '/adminayuveera2026';

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app">
      {!isAdmin && <Navbar />}
      {!isAdmin && catalogError && (
        <p role="status" className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          {products.length
            ? 'Showing saved products; latest updates are unavailable:'
            : 'Product catalog unavailable:'} {catalogError}
        </p>
      )}
      <Routes>
        <Route path="/adminayuveera2026" element={<Admin />} />
        <Route path="/" element={<Home />} />
        
        {/* ALL PRODUCTS */}
        <Route path="/products" element={<Products />} />

        {/*  12 CATEGORIES */}
        <Route path="/products/weight-management" element={<AvailableCategoryRoute category="Weight Management"><WeightManagement /></AvailableCategoryRoute>} />
        <Route path="/products/hair-care" element={<AvailableCategoryRoute category="Hair Care"><HairCare /></AvailableCategoryRoute>} />
        <Route path="/products/skin-care" element={<AvailableCategoryRoute category="Skin Care"><SkinCare /></AvailableCategoryRoute>} />
        <Route path="/products/stress-management" element={<AvailableCategoryRoute category="Stress Management"><StressManagement /></AvailableCategoryRoute>} />
        <Route path="/products/blood-purifier" element={<AvailableCategoryRoute category="Blood Purifier"><BloodPurifier /></AvailableCategoryRoute>} />
        <Route path="/products/digestion-support" element={<AvailableCategoryRoute category="Digestion Support"><DigestionSupport /></AvailableCategoryRoute>} />
        <Route path="/products/eye-care" element={<AvailableCategoryRoute category="Eye Care"><EyeCare /></AvailableCategoryRoute>} />
        <Route path="/products/heart-care" element={<AvailableCategoryRoute category="Heart Care"><HeartCare /></AvailableCategoryRoute>} />
        <Route path="/products/migraine-support" element={<AvailableCategoryRoute category="Migraine Support"><MigraineSupport /></AvailableCategoryRoute>} />
        <Route path="/products/herbal-shots" element={<AvailableCategoryRoute category="Herbal Shots"><HerbalShots /></AvailableCategoryRoute>} />
        <Route path="/products/plant-protein-supplement" element={<AvailableCategoryRoute category="Plant Protein Supplement"><PlantProtein /></AvailableCategoryRoute>} />
        <Route path="/products/sugar-management" element={<AvailableCategoryRoute category="Sugar Management"><SugarManagement /></AvailableCategoryRoute>} />
        
        {/* DETAIL -  */}
        <Route path="/product/:id" element={<ProductDetails />} />
        
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkouts />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs/:slug" element={<BlogArticle />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />

        <Route path="/faqs" element={<FAQs />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/refer-friend" element={<ReferFriend />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndCondition />} />

        <Route path="*" element={<main className="page-content p-10"><h2>404 - Page Not Found</h2><Link to="/" className="underline">Return Home</Link></main>} />
      </Routes>
      {!isAdmin && <Footer/>}
    </div>
  );
}
export default App;
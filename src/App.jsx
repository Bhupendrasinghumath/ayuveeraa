import { Routes, Route, Link } from 'react-router-dom';
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
import Shop from './pages/Shop';
import Checkouts from './pages/Checkouts';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';

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

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* ALL PRODUCTS */}
        <Route path="/products" element={<Products />} />

        {/*  12 CATEGORIES */}
        <Route path="/products/weight-management" element={<WeightManagement />} />
        <Route path="/products/hair-care" element={<HairCare />} />
        <Route path="/products/skin-care" element={<SkinCare />} />
        <Route path="/products/stress-management" element={<StressManagement />} />
        <Route path="/products/blood-purifier" element={<BloodPurifier />} />
        <Route path="/products/digestion-support" element={<DigestionSupport />} />
        <Route path="/products/eye-care" element={<EyeCare />} />
        <Route path="/products/heart-care" element={<HeartCare />} />
        <Route path="/products/migraine-support" element={<MigraineSupport />} />
        <Route path="/products/herbal-shots" element={<HerbalShots />} />
        <Route path="/products/plant-protein-supplement" element={<PlantProtein />} />
        <Route path="/products/sugar-management" element={<SugarManagement />} />
        
        {/* DETAIL -  */}
        <Route path="/product/:id" element={<ProductDetails />} />
        
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkouts />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<main className="page-content p-10"><h2>404 - Page Not Found</h2><Link to="/" className="underline">Return Home</Link></main>} />
      </Routes>
      <Footer/>
    </div>
  );
}
export default App;
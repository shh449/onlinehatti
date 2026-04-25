
import ProductState from '../context/ProductState'
import './App.css'

import Cart from './components/Cart'
import Home from './components/Home'
import Login from './components/Login'

import Productlist from './components/Productlist'
import Signup from './components/Signup'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51TERBxF7ycBL1svCdzB7YymZKlEKNfJQmiOZuCAyRaESYRCBWk7cCY3BZ68lXUyh5OmtswZGvQoCfNfRY0KHUVOq00vLw4Lzta');
import Admindashboard from "./components/Admindashboard";
import Orders from "./components/admin/Order";
import Products from "./components/admin/Products";
import Users from "./components/admin/Users";
import Stats from "./components/admin/Stats";
import AdminRoute from "./components/AdminRoutes";
import MyOrders from "./components/MyOrders";
import ProductDetails from "./components/ProductDetails";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PrivacyPolicy from "./components/Privacy";
import RefundPolicy from "./components/Refund";
import ShippingPolicy from "./components/Shipping";
import Terms from "./components/Terms";
import Contact from "./components/Contact";

import {
  BrowserRouter as Router,
  Routes,
  Route,

} from "react-router-dom";



function App() {


  return (
    <>
      <Router>
        <Elements stripe={stripePromise}>
          <ProductState>
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Productlist />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/shipping" element={<ShippingPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/myorders" element={<MyOrders />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/resetpassword/:token" element={<ResetPassword />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute><Admindashboard /></AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute><Orders /></AdminRoute>
              } />
              <Route path="/admin/products" element={
                <AdminRoute><Products /></AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute><Users /></AdminRoute>
              } />
              <Route path="/admin/stats" element={
                <AdminRoute><Stats /></AdminRoute>
              } />

            </Routes>
          </ProductState>
        </Elements>
      </Router>
    </>
  )
}

export default App

import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import Dashboard from './pages/seller/Dashboard';
import AddProduct from './pages/seller/AddProduct';
import AddCategory from './pages/seller/AddCategory';
import CategoryList from './pages/seller/CategoryList';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import AdminManagement from './pages/seller/AdminManagement';
import Loading from './components/Loading';
import Contact from './pages/Contact';
import { Show, RedirectToSignIn } from '@clerk/react'
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");
  const { isSeller } = useAppContext()

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>

     {isSellerPath ? null : <Navbar/>} 

     <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/products' element={<AllProducts/>} />
          <Route path='/products/:category' element={<ProductCategory/>} />
          <Route path='/products/:category/:id' element={<ProductDetails/>} />
          
          <Route path='/cart' element={
            <>
              <Show when="signed-in"><Cart /></Show>
              <Show when="signed-out"><RedirectToSignIn /></Show>
            </>
          } />
          
          <Route path='/add-address' element={
            <>
              <Show when="signed-in"><AddAddress /></Show>
              <Show when="signed-out"><RedirectToSignIn /></Show>
            </>
          } />
          
          <Route path='/my-orders' element={
            <>
              <Show when="signed-in"><MyOrders /></Show>
              <Show when="signed-out"><RedirectToSignIn /></Show>
            </>
          } />

          <Route path='/contact' element={<Contact/>} />
          <Route path='/loader' element={<Loading/>} />
          <Route path='/payment-success' element={<PaymentSuccess/>} />
          <Route path='/payment-failure' element={<PaymentFailure/>} />
          
          <Route path='/seller' element={isSeller ? <SellerLayout/> : <SellerLogin/>}>
            <Route index element={isSeller ? <Dashboard/> : null} />
            <Route path='dashboard' element={<Dashboard/>} />
            <Route path='add-product' element={<AddProduct/>} />
            <Route path='product-list' element={<ProductList/>} />
            <Route path='edit-product/:productId' element={<AddProduct/>} />
            <Route path='category-list' element={<CategoryList/>} />
            <Route path='add-category' element={<AddCategory/>} />
            <Route path='edit-category/:categoryId' element={<AddCategory/>} />
            <Route path='orders' element={<Orders/>} />
            <Route path='admins' element={<AdminManagement/>} />
          </Route>
        </Routes>
      </div>
     {!isSellerPath && <Footer/>}
    </div>
  )
}

export default App

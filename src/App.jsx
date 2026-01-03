import { useState, useEffect } from 'react'
import ProductDetails from './lib/components/productDetails'
import OrderDetails from './pages/orderDetails';
import Homepage from './pages/homepage';
import Registered from './pages/registered';
import Whislistpage from './pages/whislistpage';
import Cartpage from './pages/cartpage';
import CheckOutPage from './pages/checkoutpage';
import ProfilePage from './pages/profilepage';
import OrderHistory from './pages/orderHistory'
import NotFound from './pages/pageNotFound';
import { Routes, Route } from 'react-router-dom'
import { ToastContainer, toast, Slide } from 'react-toastify'; 
import Loader from './lib/ui/loader'

function App() {
const [products, setProducts] = useState([]);
const [ordersDetail, setOrdersDetails] = useState([]);
const [appReady, setAppReady] = useState(false);

useEffect(() => {
    const timer = setTimeout(() => {
        setAppReady(true);
    }, 800);

    return () => clearTimeout(timer);
}, []);
if (!appReady) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <Loader />
      </div>
    );
}

  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage products={products} setProducts={setProducts}/>}/>
        <Route path='/signup' element={<Registered />}/>
        <Route path='/wishlist' element={<Whislistpage />}/>
        <Route path='/cart' element={<Cartpage />}/>
        <Route path='/checkout' element={<CheckOutPage />}/>
        <Route path='/profile' element={<ProfilePage />}/>
        <Route path='/order-history' element={<OrderHistory ordersDetail={ordersDetail} setOrdersDetails={setOrdersDetails}/>}/>
        <Route path="/product-details/:id" element={<ProductDetails products={products}/>}/>
        <Route path="/order/:id" element={<OrderDetails ordersDetail={ordersDetail} />}/>
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        limit={1}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />

    </>
  )
}

export default App

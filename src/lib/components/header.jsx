import { FiShoppingCart } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { GiConverseShoe, GiRunningShoe } from "react-icons/gi";
import { Link } from "react-router-dom";
import { useAuth } from "../../firebase/authContext.jsx";
import { auth } from "../../firebase/config.js";
import { TiUser } from "react-icons/ti";
import { IoIosHeartEmpty } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import { collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db } from "../../firebase/config.js";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';

export default function Header(){
    const {checkAuth, loading} = useAuth();
    const [wishlistIds, setWishlistIds] = useState([]);
    const [cartIds, setCartIds] = useState([]);

    useEffect(() => {
            if (!checkAuth) return;
    
            const wishlistRef = collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "wishlist-db");
    
            const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
                const ids = snapshot.docs.map((doc) => doc.id);
                setWishlistIds(ids);
            });
    
            return () => unsubscribe();
    }, [checkAuth]);
        
    useEffect(() => {
            if (!checkAuth) return;
            const cartRef = collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db");
    
            const unsubscribe = onSnapshot(cartRef, (snapshot) => {
                const datas = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
                setCartIds(datas);
            });
            return () => unsubscribe();
    },[checkAuth]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Successfully signed out");
        } catch (error) {
            toast.error("Error signing out. Please try again.");
            console.error("Sign out error:", error.message);
        }
    };
    return(<>
        <header className="w-full flex items-center justify-between lg:px-10 px-2 py-2 lg:py-6 sticky top-0 z-50 bg-white">
            <div className="lg:w-[10%] w-[30%] flex items-center gap-1">
                <h1 className="lg:text-4xl md:text-4xl text-2xl font-bold tracking-wider font-[Cabin]">
                    <span className="text-black">M</span>
                    <span className="text-red-600">W</span>
                </h1>
                <GiConverseShoe size={34}/>
            </div>


            {!loading && checkAuth === null ? (
                <div className="lg:w-[20%] w-[50%] flex items-center justify-end gap-5">
                    <Link to="/signup" className="lg:text-lg text-base font-[Montserrat] font-normal tracking-wide text-[#fff] hover:text-[#f4f4f4] transition-colors duration-300 bg-[#212121] rounded-lg py-2 px-8">Sign In</Link>
                    {/* <Link to="/cart" className="border p-2 border-gray-300 rounded-md cursor-pointer text-[#212121] hover:text-[#8d8c8c] transition-colors duration-300 relative">
                        <FiShoppingCart size={20} className=""/>
                    </Link> */}
                </div>
            ) : (
                <div className="lg:w-[20%] w-full flex items-center justify-end gap-5">
                    <Link to="/profile" className="text-lg font-[Montserrat] font-normal tracking-wide text-[#212121] hover:text-[#8d8c8c] transition-colors duration-300 border p-2 border-gray-300 rounded-md"><TiUser /></Link>

                    <Link to="/wishlist" className="border p-2 border-gray-300 rounded-md cursor-pointer text-[#212121] hover:text-[#8d8c8c] transition-colors duration-300 relative">
                        <IoIosHeartEmpty size={20} className=""/>
                        {wishlistIds.length > 0 ? (
                           <span className="w-2 h-2 bg-red-500 absolute top-0 right-0 rounded-full"></span>
                        ) : (null
                        )}
                        
                    </Link>
                    <Link to="/cart" className="border p-2 border-gray-300 rounded-md cursor-pointer text-[#212121] hover:text-[#8d8c8c] transition-colors duration-300 relative">
                        <FiShoppingCart size={20} className=""/>
                        {cartIds.length > 0 ? (
                           <span className="w-5 h-5 bg-red-500 absolute -top-2 -right-2 rounded-full text-[5px] text-white font-[Cabin] flex items-center justify-center">{String(cartIds.length).padStart("2",0)}</span>
                        ) : (null
                        )}

                    </Link>
                    <button onClick={handleLogout} className="border p-2 border-gray-300 rounded-md cursor-pointer text-[#212121] hover:text-[#8d8c8c] transition-colors duration-300">
                        <LuLogOut size={20} className=""/>
                    </button>
                </div>
            )}
        </header>
    </>)
}
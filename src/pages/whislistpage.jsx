import React from "react";
import {useNavigate, Link} from "react-router-dom";
import { toast } from 'react-toastify';
import { db, auth } from "../firebase/config";
import { collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../firebase/authContext.jsx";
import { useEffect, useState } from "react";
import Header from "../lib/components/header.jsx";
import Footer from "../lib/components/footer.jsx"
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdHome } from "react-icons/md";
import { TbCurrencyNaira } from "react-icons/tb";
import { BiCartAdd } from "react-icons/bi";
import { IoMdHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";

export default function Whislistpage(){

    const {checkAuth, loading} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistItemsFilter, setWishlistItemsFilter] = useState([]);

    const navigate = useNavigate();
    
    const fetchWishlistItems = async (product) => {
        if (!checkAuth) {
            toast.error("You must be logged in to view your wishlist.");
            return;
        };

        setIsLoading(true);

        try {
            const wishlistRef = query(collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "wishlist-db"), orderBy("addedAt", "desc"));

            const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
                const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setWishlistItems(items);
                setWishlistItemsFilter(items);
                console.log("Wishlist items fetched: ", items);
            })
            return unsubscribe;
        } catch (error) {
            toast.error("Error fetching wishlist items: " + error.message);
            console.log("Error fetching wishlist items: ", error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const toggleFavorite = async (item) => {
        if (!checkAuth) {
            toast.error("Please log in to manage wishlist.");
            return;
        }

        const itemRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "wishlist-db", item.id);

        try {
            const existing = await getDoc(itemRef);

            if (existing.exists()) {
                await deleteDoc(itemRef);
                toast.success("Removed from wishlist");
            } 
            // else {
            //     await setDoc(itemRef, {
            //         ...item,
            //         addedAt: serverTimestamp(),
            //     });
            //     toast.success("Added to wishlist");
            // }
        } catch (error) {
            toast.error("Error updating wishlist");
            console.log(error);
        }
    };


    useEffect(() => {
        if (!checkAuth) return;

        const unsubscribe = fetchWishlistItems();
        return () => unsubscribe;
    }, [checkAuth]);

    const addToCart = async (item) => {
            if (!checkAuth) {
              toast.error("You must be logged in to add items to the cart.");
              return;
            }
            const quantity = 1;
            const size = "N/A";
            try{
                const cartRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db", item.id);
                const existingDoc = await getDoc(cartRef);
    
                if(existingDoc.exists()){
                    const newQuantity = existingDoc.data().quantity + 1;
                    await updateDoc(cartRef, {
                        quantity: newQuantity,
                    });
                    toast.info("Product quantity Increased");
                }else{
                    await setDoc(cartRef, {
                        ...item,
                        quantity: quantity,
                        size: size || "N/A",
                        addedAt: serverTimestamp()
                    });
                    toast.success("Added to cart");
                }
            }catch (error) {  
                console.log(error);
                toast.error("Error adding to cart");
            }
    }

    return(<>
        <Header />
        <h1 className="ml-10 font-[Montserrat] text-3xl font-bold uppercase text-[#212121] tracking-wider">Wishlist</h1>

        <section className="w-[95%] md:w-[90%] mx-auto pt-10 pb-4 text-sm font-[Cabin] flex items-center gap-2">
            <button className="flex items-center gap-1 underline text-[#5f5e5e] hover:text-black transition cursor-pointer font-[Cabin]" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}>
                <IoIosArrowRoundBack size={22}/>
                Back
            </button>
            <span>/</span>
            <Link className="flex items-center gap-1 underline text-[#5f5e5e] hover:text-black transition cursor-pointer font-[Cabin]" to="/">
                <MdHome size={22}/>
                Shop
            </Link>
            <span>/</span>
            <p className="text-[#777]">my-whislist ({String(wishlistItems.length).padStart("2",0)})</p>
        </section>

        <section className="w-full flex flex-wrap items-center justify-start gap-6 px-4 lg:px-10 py-6 mt-6">
            {isLoading ? (
                <p className="w-full text-center text-lg font-[Montserrat] text-[#212121]">Loading wishlist items...</p>
            ) : wishlistItemsFilter.length === 0 ? (
                    <p className="w-full text-center text-lg font-[Montserrat] text-[#212121]">Your wishlist is empty.</p>)
                : (<>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 lg:gap-6 gap-4">
                    {wishlistItemsFilter.map((item) => (
                        <div key={item.id} className="h-auto border-gray-300 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out relative group" tabIndex="0">
                            <div className="absolute right-1 top-1 w-6 h-6 cursor-pointer rounded-full flex items-center justify-center bg-white opacity-0 group-hover:opacity-100 focus:opacity-100 group-focus:opacity-100 transition-all duration-300 ease-in-out z-10" onClick={() => toggleFavorite(item)}>
                                {wishlistItems.some(wish => wish.id === item.id) ? (
                                    <IoMdHeart size={20} className="text-red-600"/>
                                ) : (
                                    <CiHeart size={20} className="w-full h-full"/>
                                )}
                            </div>
                            <div className="w-full h-48 ">
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-all ease-in-out duration-300 focus:scale-110 group-focus:scale-110" loading="lazy"/>
                            </div>
                            <div className="p-4">
                                <h3 className="font-[Montserrat] font-semibold text-lg text-[#212121] mb-2 capitalize">{item.productName}</h3>
                                <p className="font-[Montserrat] font-normal text-sm text-[#757575] mb-4">{item.productDescription.length >= 50 ? (<>
                                    {item.productDescription.slice(0, 50)}...
                                    <Link to={`/product-details/${item.id}`} className="text-blue-600 text-xs ">view details</Link>
                                </>) :  item.productDescription} </p>
                                <div className="flex items-center justify-between">
                                    <span className="font-[Montserrat] font-bold text-base text-[#212121] flex items-center"><TbCurrencyNaira size={22}/>{Number(item.productPrice).toLocaleString("en-us", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}</span>

                                    <div>
                                        <button onClick={() => addToCart(item)} className="flex items-center gap-1 text-base font-[Cabin] text-white px-4 py-2 bg-[#212121] cursor-pointer rounded"><BiCartAdd/> Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </>)
            }
        </section>
        <Footer />
    </>)
}
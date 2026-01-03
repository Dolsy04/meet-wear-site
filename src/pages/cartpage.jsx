    import React from "react";
    import Header from "../lib/components/header";
    import Footer from "../lib/components/footer";
    import {useNavigate, Link} from "react-router-dom";
    import { toast } from 'react-toastify';
    import { db } from "../firebase/config";
    import { collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
    import { useAuth } from "../firebase/authContext.jsx";
    import { useEffect, useState } from "react";
    import { MdHome } from "react-icons/md";
    import { FaAngleRight } from "react-icons/fa";
    import { IoIosArrowRoundBack } from "react-icons/io";
    import { TbCurrencyNaira } from "react-icons/tb";
    import { IoCloseCircleSharp } from "react-icons/io5";
    import { GoPlus } from "react-icons/go";
    import { FiMinus } from "react-icons/fi";
    import Loader from "../lib/ui/loader.jsx";

    export default function Cartpage(){
        const {checkAuth, loading} = useAuth();
        const [isLoading, setIsLoading] = useState(false);
        const [isCheckOutLoading, setIsCheckOutLoading] = useState(false);
        const [cartListItems, setCartListItems] = useState([]);
        const [cartListItemsFilter, setCartListItemsFilter] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const navigate = useNavigate();

        const handleProceedToCheckout = async () => {
            if (!checkAuth) {
                toast.error("Please log in to continue.");
                return;
            }

            if (cartListItemsFilter.length === 0) {
                toast.error("Your cart is empty.");
                return;
            }

            try {
                setIsCheckOutLoading(true);

                const userCheckoutRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "checkout-db", "current-checkout"); 

                const subtotal = cartListItemsFilter.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0);
                const total = subtotal;

                const checkoutData = {
                    items: cartListItemsFilter.map((item) => ({
                        id: item.id || null,
                        productName: item.productName || "",
                        productImage: item.productImage || "",
                        productDescription: item.productDescription || "",
                        productPrice: item.productPrice || 0,
                        quantity: item.quantity || 0,
                        size: item.size || "",
                        productCategory: item.productCategory || "",
                    })),
                    subtotal: subtotal || 0,
                    total: total || 0,
                    updatedAt: serverTimestamp(),
                };

                const existingCheckout = await getDoc(userCheckoutRef);
                if (existingCheckout.exists()) {
                    await updateDoc(userCheckoutRef, checkoutData);
                }else{
                    checkoutData.createdAt = serverTimestamp();
                    await setDoc(userCheckoutRef, checkoutData);
                }
                navigate("/checkout");

            } catch (error) {
                toast.error("Checkout error: " + error.message);
            } finally {
                setIsCheckOutLoading(false);
            }
        };

        const fetchCartListItems = async () => {
            if (!checkAuth) {
                toast.error("You must be logged in to view your cartList.");
                return;
            };

            setIsLoading(true);

            try {
                const CartListRef = query(collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db"), orderBy("createdAt", "desc"));

                const unsubscribe = onSnapshot(CartListRef, (snapshot) => {
                    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setCartListItems(items);
                    setCartListItemsFilter(items);
                    console.log("CartList items fetched: ", items);
                    setIsLoading(false);
                })
                return unsubscribe;
            } catch (error) {
                toast.error("Error fetching CartList items: " + error.message);
                console.log("Error fetching CartList items: ", error.message);
                setIsLoading(false);
            }
        }

        const handleDeleteCartItem = async (item) => {
            if (!checkAuth) {
                toast.error("Please log in to manage your cart.");
                return;
            }
            const itemRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db", item.id);

            try {
                await deleteDoc(itemRef);
                toast.success("Item removed from cart.");
            } catch (error) {
                toast.error("Error removing item from cart: " + error.message);
                console.log("Error removing item from cart: ", error.message);
            }
        }

        const increaseQuantity = async (item) => {
            if (!checkAuth) {
                toast.error("Please log in to manage your cart.");
                return;
            }
            const itemRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db", item.id);

            try {
                await updateDoc(itemRef, {
                    quantity: item.quantity + 1,
                });
                toast.success("Increased item quantity.");
            } catch (error) {
                toast.error("Error increasing item quantity: " + error.message);
                console.log("Error increasing item quantity: ", error.message);
            }
        }
        const decreaseQuantity = async (item) => {
            if (!checkAuth) {
                toast.error("Please log in to manage your cart.");
                return;
            }
            const itemRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db", item.id);

            try {
                if (item.quantity > 1) {
                    await updateDoc(itemRef, {
                        quantity: item.quantity - 1,
                    });
                    toast.success("Decreased item quantity.");
                } else if(item.quantity === 1){
                    await deleteDoc(itemRef);
                    toast.success("Item removed from cart.");
                }
            } catch (error) {
                toast.error("Error decreasing item quantity: " + error.message);
                console.log("Error decreasing item quantity: ", error.message);
            }
        }

        useEffect(() => {
            const loadCartList = fetchCartListItems();
            return () => loadCartList;
        }, [checkAuth]);

        const paginatedPage = cartListItemsFilter.slice((currentPage - 1) * 10, currentPage * 10)
        const totalPages = Math.ceil(cartListItemsFilter.length / 10);
        
        useEffect(() => {
            if (currentPage > totalPages) {
                setCurrentPage(totalPages || 1);
            }
        }, [cartListItemsFilter, totalPages]);

        return(<>
            <Header />

            <section className="w-[95%] md:w-[90%] lg:w-full h-[250px] mx-auto pt-10 pb-4 text-sm font-[Cabin] flex items-center justify-center flex-col gap-12 border bg-[#212121]">
                <div>
                    <h1 className="font-[Montserrat] text-xl lg:text-3xl font-bold uppercase text-white tracking-wider text-center">Shopping Carts ({String(cartListItemsFilter.length).padStart("2",0)})</h1>
                </div>
                <div className="flex items-center gap-3 text-center">
                    <button className="flex items-center gap-1 underline text-[#f5f2f2] hover:text-gray-300 transition cursor-pointer font-[Cabin]" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}>
                        <IoIosArrowRoundBack size={22}/>
                        Back
                    </button>
                    <span className="text-[#a7a1a1] text-xs"><FaAngleRight /> </span>
                    <Link className="flex items-center gap-1 underline text-[#f5f2f2] hover:text-gray-300 transition cursor-pointer font-[Cabin]" to="/">
                        <MdHome size={22}/>
                        Shop
                    </Link>
                    <span className="text-[#a7a1a1] text-xs"><FaAngleRight /> </span>
                    <p className="text-[#a7a1a1] text-sm">Shopping Cart</p>
                </div>
            </section>

            {/* cart */}

            {isLoading ? (
                <div className="w-full flex items-center justify-center py-20">
                    <Loader />
                    <p className="font-[Montserrat] text-sm text-gray-600">
                        fetching your cart...
                    </p>
                </div>
            ) : cartListItemsFilter.length === 0 ? (
                <div className="w-full flex items-center justify-center flex-col py-20 gap-2">
                    <p className="font-[Montserrat] text-lg text-[#212121]">Your cart is empty.</p>
                    
                    <Link className="font-[Cabin] text-base text-white bg-blue-600 py-2 px-4 rounded-lg tracking-wide" to="/">Start Shopping</Link>
                </div>) : (<>
                        <div className="hidden md:hidden lg:block w-full py-10">
                        <table className="w-[90%] mx-auto my-10">
                            <thead className="bg-blue-600">
                                <tr className="bg-[#f8f8f8] shadow-sm text-center w-full">
                                    <th className="py-4 text-center font-[Montserrat] text-sm text-[#555] px-4">Product</th>
                                    <th className="py-4 text-center font-[Montserrat] text-sm text-[#555] px-4">Price</th>
                                    <th className="py-4 text-center font-[Montserrat] text-sm text-[#555] px-4">Quantity</th>
                                    <th className="py-4 text-center font-[Montserrat] text-sm text-[#555] px-4">Total</th>
                                    <th className="py-4 text-center font-[Montserrat] text-sm text-[#555] px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPage.map((item) => (
                                    <tr key={item.id} className="bg-white shadow-md hover:shadow-lg transition rounded-xl border-b border-gray-300">
                                        <td className="py-4 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20">
                                                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-md"/>
                                                </div>
                                                <div>
                                                    <p className="font-[Montserrat] font-semibold text-[#212121] text-sm">{item.productName}</p>
                                                    <p className="font-[Montserrat] font-normal text-[#524a4a] text-sm py-1">Categories:  
                                                        <span className="font-semibold text-[#212121] text-sm pl-2">{item.productCategory}</span>
                                                    </p>
                                                    <p className="font-[Montserrat] font-normal text-[#524a4a] text-sm py-1">Size:  
                                                        <span className="font-semibold text-[#212121] text-sm pl-2">{item.size}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 text-center font-[Montserrat] text-[#212121] text-sm font-semibold">
                                            <div className="flex items-center justify-center">
                                                <TbCurrencyNaira size={22}/> 
                                                {Number(item.productPrice).toLocaleString("en-us",{
                                                    maximumFractionDigits: 2,
                                                    minimumFractionDigits: 2
                                                })}
                                            </div>
                                        </td>
                                            
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={()=> decreaseQuantity(item)} className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 transition font-bold text-lg cursor-pointer">
                                                    <FiMinus />
                                                </button>

                                                <p className="font-[Montserrat] text-sm">{item.quantity}</p>

                                                <button onClick={()=> increaseQuantity(item)} className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 transition font-bold text-lg cursor-pointer">
                                                    <GoPlus />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4  text-center font-[Montserrat] text-[#212121] font-semibold">
                                            <div className="flex items-center justify-center">
                                                <TbCurrencyNaira size={22}/>
                                                {Number(item.productPrice * item.quantity).toLocaleString("en-us",{
                                                    maximumFractionDigits: 2,
                                                    minimumFractionDigits: 2
                                                })}
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 text-center">
                                            <IoCloseCircleSharp size={24} onClick={()=> handleDeleteCartItem(item)} className="mx-auto text-red-600 cursor-pointer hover:text-red-800 transition"/>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {cartListItems.length > 10 && (<>
                            <div className="w-[90%] mx-auto my-10 border">
                                
                                <div className="w-full flex items-center justify-center gap-3 mt-6">
                                    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 font-[Cabin] text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50 cursor-pointer">Previous</button>
                                    <span className="font-medium font-[Cabin] text-sm text-[#212121] tracking-wide">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 font-[Cabin] text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50 cursor-pointer">Next</button>
                                </div>
                            </div>
                        </>)}
                        </div>
                        {/* MOBILE VIEW */}
                        <div className="lg:hidden w-[95%] mx-auto my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paginatedPage.map((item) => (
                            <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-md p-4"
                            >
                            {/* IMAGE + NAME */}
                            <div className="flex gap-4">
                                <img
                                src={item.productImage}
                                className="w-24 h-24 object-cover rounded"
                                />
                                <div>
                                <p className="font-semibold">{item.productName}</p>
                                <p className="text-sm text-gray-500">
                                    Category: {item.productCategory}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Size: {item.size}
                                </p>
                                </div>
                            </div>

                            {/* PRICE */}
                            <div className="flex justify-between mt-4 text-sm">
                                <span>Price</span>
                                <span className="font-semibold flex items-center">
                                <TbCurrencyNaira />
                                {item.productPrice.toLocaleString()}
                                </span>
                            </div>

                            {/* QUANTITY */}
                            <div className="flex justify-between items-center mt-3">
                                <span>Quantity</span>
                                <div className="flex gap-3">
                                <button onClick={() => decreaseQuantity(item)}>
                                    <FiMinus />
                                </button>
                                {item.quantity}
                                <button onClick={() => increaseQuantity(item)}>
                                    <GoPlus />
                                </button>
                                </div>
                            </div>

                            {/* TOTAL */}
                            <div className="flex justify-between mt-3 font-semibold">
                                <span>Total</span>
                                <span className="flex items-center">
                                <TbCurrencyNaira />
                                {(item.productPrice * item.quantity).toLocaleString()}
                                </span>
                            </div>

                            {/* DELETE */}
                            <button
                                onClick={() => handleDeleteCartItem(item)}
                                className="mt-4 w-full text-red-600 border border-red-500 py-2 rounded"
                            >
                                Remove Item
                            </button>
                            </div>
                        ))}
                        </div>
                    </>
            )}

            {cartListItemsFilter.length === 0 ? null : (
                <section className="lg:w-[500px] w-full h-auto rounded-lg my-10 flex items-center justify-end ml-auto mr-15 bg-[#f5f5f5] p-2">
                    <div className="w-full h-full">
                        <h1 className="font-bold font-[montserrat] text-lg p-2 text-[#212121] tracking-wide border-b border-gray-300 ">Cart Summary</h1>

                        <div className="flex items-center justify-between px-4 pt-3 text-lg font-[montserrat] text-[#212121] font-normal">
                            <p className="font-normal">
                                Total Items:
                            </p>
                            <p>
                                ({String(cartListItemsFilter.length).padStart("2",0)} items)
                            </p>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 font-normal text-lg font-[montserrat] text-[#212121] border-b">
                            <p className="font-normal">
                                Sub Amount: 
                            </p>
                            <p className="flex items-center justify-center">
                                <TbCurrencyNaira size={22}/>
                                {cartListItemsFilter.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0).toLocaleString("en-us",{
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2
                                })}
                            </p>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 text-lg font-[montserrat] text-[#212121] font-bold">
                            <p>
                                Total: 
                            </p>
                            <p className="flex items-center justify-center">
                                <TbCurrencyNaira size={22}/>
                                {cartListItemsFilter.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0).toLocaleString("en-us",{
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2
                                })}
                            </p>
                        </div>

                        <button disabled={isCheckOutLoading} onClick={() => handleProceedToCheckout()} className={`w-full py-3 rounded-lg font-[montserrat]  font-semibold ${isCheckOutLoading ? "bg-transparent border-t border-[#212121] rounded-none text-[#212121] cursor-not-allowed" : "bg-[#212121] text-white cursor-pointer"}`}>{isCheckOutLoading ? (<div className="w-full h-full pt-2 flex items-center justify-center gap-2">
                            <Loader />
                            <p className="text-sm font-[Cabin] font-semibold">checking out.... </p>
                        </div>) : "Proceed to Checkout"}</button>
                    </div>
                </section>
            )}

            <Footer />
        </>);
    }
import { IoFilterOutline } from "react-icons/io5";
import { TbCurrencyNaira } from "react-icons/tb";
import { BiCartAdd } from "react-icons/bi";
import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../firebase/authContext";
import { Link } from "react-router-dom";
import { CiHeart } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import Loader from "../ui/loader.jsx";
import { ToastContainer, toast } from 'react-toastify'; 

export default function Shop({ setProducts }) {
    const [activeFilter, setActiveFilter] = useState("All");
    const [isloading, setLoading] = useState(false);
    const [filterShoeproduct, setFliteredShoeProduct] = useState([]);
    const [allShoeProducts, setAllShoeProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    const {checkAuth, loading} = useAuth();
    const [wishlistIds, setWishlistIds] = useState([]);

    

    const addToCart = async (product) => {
        if (!checkAuth) {
          toast.error("You must be logged in to add items to the cart.");
          return;
        }

        try{
            const cartRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db", product.id);
            const existingDoc = await getDoc(cartRef);

            if(existingDoc.exists()){
                const newQuantity = existingDoc.data().quantity + 1;
                await updateDoc(cartRef, {
                    quantity: newQuantity,
                });
                toast.info("Increased product quantity in cart");
            }else{
                await setDoc(cartRef, {
                    ...product,
                    quantity: 1,
                    size: product.availableSizes ? product.availableSizes[0] : "N/A",
                    addedAt: serverTimestamp()
                });
                toast.success("Added to cart");
            }
        }catch (error) {  
            console.log(error);
            toast.error("Error adding to cart");
        }
    }

    const toggleFavorite = async (product) => {
        if (!checkAuth) {
          toast.error("You must be logged in to favorite a product.");
          return;
        }

        try {
            const wishlistRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "wishlist-db", product.id);
            
            const existingDoc = await getDoc(wishlistRef);

            if (existingDoc.exists()) {
                setWishlistIds(prev => prev.filter(id => id !== product.id));
                await deleteDoc(wishlistRef);
            } else {
                setWishlistIds(prev => [...prev, product.id]);
                await setDoc(wishlistRef, {
                    ...product,
                    addedAt: serverTimestamp()
                });
                toast.success("Added to wishlist");
            }
        }catch (error) {  
            console.log(error);
            toast.error("Error updating wishlist");
          }

    }

    useEffect(() => {
        if (!checkAuth) return;

        const wishlistRef = collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "wishlist-db");

        const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
            const ids = snapshot.docs.map((doc) => doc.id);
            setWishlistIds(ids);
        });

        return () => unsubscribe();
    }, [checkAuth]);


    const fetchShoeProduct =  () => {
      setLoading(true);
      
      const getProductRef = query(collection(db, "shoeproductDB"), orderBy("createdAt", "desc"));
      const productSnapShot =  onSnapshot(getProductRef, (snapshot) => {
         const productsList = snapshot.docs.map(doc =>({
               id: doc.id, ...doc.data(),
         }));
        //  products(productsList)
         setProducts(productsList)
         setFliteredShoeProduct(productsList);
         setAllShoeProducts(productsList);
         setLoading(false)
      },(error) => {
        toast(`Error occured: ${error.message}`)
        console.error(error);
        setLoading(false)
      })
      return productSnapShot
    };

   useEffect(() => {
      const getProduct = fetchShoeProduct()
      return () => {
         getProduct();
      }
   },[]);

   useEffect(()=>{
    if(activeFilter === "All"){
        setFliteredShoeProduct(allShoeProducts)
    } else {
        const filteredProducts = allShoeProducts.filter((product) => product.productCategory === activeFilter);
        setFliteredShoeProduct(filteredProducts)
    }
   },[activeFilter, allShoeProducts])
   const paginatedPage = filterShoeproduct.slice((currentPage - 1) * 12, currentPage * 12)
   const totalPages = Math.ceil(filterShoeproduct.length / 12);

  if(loading){
        return <Loader />
  }

    return (<>
        <section className="w-full bg-[#f5f5f5] my-10">
            <div className="w-[95%] mx-auto h-full py-4 flex lg:items-center items-start lg:flex-row gap-3">
                <div className="w-[15%] flex items-center flex-wrap lg:flex-row gap-2">
                    <IoFilterOutline size={25}/>
                    <span className="font-[Montserrat] font-semibold text-[#212121] tracking-wide">Filter By:</span>
                </div>
                <div className="w-full h-full lg:flex lg:items-center lg:flex-nowrap lg:gap-10 lg:justify-between grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button onClick={()=> setActiveFilter("All")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "All" ? "underline text-gray-500" : "no-underline"}`}>All</button>
                    <button onClick={()=> setActiveFilter("Sneaker")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "Sneaker" ? "underline text-gray-500" : "no-underline"}`}>Sneakers</button>
                    <button onClick={()=> setActiveFilter("Tennis")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "Tennis" ? "underline text-gray-500" : "no-underline"}`}>Tennis Shoes</button>
                    <button onClick={()=> setActiveFilter("Running")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "Running" ? "underline text-gray-500" : "no-underline"}`}>Running Shoes</button>
                    <button onClick={()=> setActiveFilter("Loafers")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "Loafers" ? "underline text-gray-500" : "no-underline"}`}>Loafers</button>
                    <button onClick={()=> setActiveFilter("Boots")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "Boots" ? "underline text-gray-500" : "no-underline"}`}>Boots</button>
                    <button onClick={()=> setActiveFilter("Sandals")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "Sandals" ? "underline text-gray-500" : "no-underline"}`}>Sandals</button>
                    <button onClick={()=> setActiveFilter("Slippers")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out hover:text-gray-500 font-[Montserrat] text-sm text-[#212121] font-semibold ${activeFilter === "Slippers" ? "underline text-gray-500" : "no-underline"}`}>Slippers</button>
                    {/* {activeFilter} */}
                </div>
            </div>
        </section>

        <section className="w-full my-10">
            <div className="w-[95%] mx-auto">
                <div className="w-full mb-10">
                    {isloading ? (<div className="w-full flex items-center justify-center py-20 gap-4">
                        <Loader />
                        <p className="font-[Montserrat] font-medium text-base text-[#212121]">Loading products...</p>
                    </div>
                    ) : filterShoeproduct.length === 0 ? (
                        <div className="w-full text-center">
                            <p className="font-[Montserrat] font-medium text-base text-red-500 ">No products available.</p>
                        </div>
                    ) : (<>
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                            {paginatedPage.map((product) => (
                            <div key={product.id} tabIndex="0" className=" bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out relative group">
                                <div className="absolute right-1 top-1 w-6 h-6 cursor-pointer rounded-full flex items-center justify-center bg-white opacity-0 group-hover:opacity-100 focus:opacity-100 group-focus:opacity-100 transition-all duration-300 ease-in-out z-10" onClick={() => toggleFavorite(product)}>
                                    {wishlistIds.includes(product.id) ? (
                                        <IoMdHeart size={20} className="text-red-600"/>
                                    ) : (
                                        <CiHeart size={20} className="w-full h-full"/>
                                    )
                                    }
                                </div>
                                <div className="w-full h-48 ">
                                    <Link to={`/product-details/${product.id}`}>
                                        <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover group-hover:scale-110 transition-all ease-in-out duration-300 focus:scale-110 group-focus:scale-110" loading="lazy"/>
                                    </Link>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-[Montserrat] font-semibold text-lg text-[#212121] mb-2 capitalize">{product.productName}</h3>
                                    <p className="font-[Montserrat] font-normal text-sm text-[#757575] mb-4">{product.productDescription.length >= 50 ? (<>
                                        {product.productDescription.slice(0, 50)}...
                                        <Link to={`/product-details/${product.id}`} className="text-blue-600 text-xs ">view details</Link>
                                    </>) :  product.productDescription} </p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-[Montserrat] font-bold text-base text-[#212121] flex items-center"><TbCurrencyNaira size={22}/>{Number(product.productPrice).toLocaleString("en-us", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}</span>

                                        <div>
                                            
                                            <button className="flex items-center gap-1 text-base font-[Cabin] text-white px-4 py-2 bg-[#212121] cursor-pointer rounded" onClick={() => addToCart(product)}><BiCartAdd/> Add to Cart</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                        <div className="w-full mt-10">
                            <div className="w-full flex items-center justify-center gap-3 mt-6">
                                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 font-[Cabin] text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50 cursor-pointer">Previous</button>
                                <span className="font-medium font-[Cabin] text-sm text-[#212121] tracking-wide">Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 font-[Cabin] text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50 cursor-pointer">Next</button>
                            </div>
                        </div>
                    </>)}
                </div>
            </div>
        </section>
    </>)
}
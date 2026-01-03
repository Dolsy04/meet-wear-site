import { useParams, Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { TbCurrencyNaira } from "react-icons/tb";
import { BiCartAdd } from "react-icons/bi";
import { CiHeart } from "react-icons/ci";
import { MdHome } from "react-icons/md";
import Header from "./header";
import Footer from "./footer";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDoc, getDocs, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../firebase/authContext";
import { IoMdHeart } from "react-icons/io";
import { toast } from 'react-toastify'; 

export default function ProductDetails({ products }) {
  
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { checkAuth } = useAuth();
  const [size, setSize] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length > 0) {
      setLoading(true);
      const found = products.find((p) => String(p.id) === id);
      setProduct(found || null);
      setLoading(false);
    }
  }, [products, id]);

  // fetch single product if products prop is empty
  useEffect(() => {
  if (products.length === 0) {
    setLoading(true);

    const fetchSingleProduct = async () => {
      try {
        const ref = doc(db, "shoeproductDB", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        } else {
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSingleProduct();
  }
}, [products, id]);

// fetch wishlist ids
useEffect(() => {
  if (!checkAuth) return;

  const wishlistRef = collection(
    db,
    "meet-wear-buyer-users-db",
    checkAuth.uid,
    "wishlist-db"
  );

  const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
    const ids = snapshot.docs.map(doc => doc.id);
    setWishlistIds(ids);
  });

  return () => unsubscribe();
}, [checkAuth]);



const addToCart = async (product) => {
        if (!checkAuth) {
          toast.error("You must be logged in to add items to the cart.");
          return;
        }
        

        if (quantity < 1) {
          toast.error("Invalid quantity");
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
                toast.info("Product quantity Increased");
            }else{
                await setDoc(cartRef, {
                    ...product,
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

  return (
    <>
      <Header />

      {loading ? (<h1 className="text-center py-20">Loading...</h1>) : product === null ? (<h1 className="text-center py-20">Product not found</h1>) : (<>
        <section className="w-[95%] md:w-[90%] mx-auto pt-10 pb-4 text-sm font-[Cabin] flex items-center gap-2">
          <Link className="flex items-center gap-1 underline text-[#5f5e5e] hover:text-black transition cursor-pointer font-[Cabin]" to="/">
            <MdHome size={22}/>
            Home
          </Link>
          <span>/</span>
          <p className="text-[#777]">product-details / {product.id}</p>
        </section>
        <section className="w-[95%] md:w-[90%] mx-auto pt-10 text-3xl font-[Montserrat] font-bold text-[#212121] tracking-wide uppercase">
          <h3>Product Details</h3>
        </section>

        {/* Product Section */}
        <section className="w-[95%] md:w-[90%] mx-auto py-8">

          <div className="w-full flex items-start lg:flex-row flex-col gap-10">
            {/* PRODUCT IMAGE */}
            <div className="w-[50%] h-[350px] md:h-[450px] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-full h-full object-cover hover:scale-105 transition duration-300 ease-in-out"
              />
            </div>

            {/* PRODUCT INFO */}
            <div className="flex flex-col justify-start">
              <h1 className="text-3xl font-bold mb-3 font-[Montserrat] uppercase text-[#212121] tracking-wide">
                {product.productName}
              </h1>

              {/* PRICE */}
              <p className="text-3xl font-bold text-[#0000ff] flex items-center mb-4">
                <TbCurrencyNaira size={28} />
                {Number(product.productPrice).toLocaleString("en-us", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              
              {/* AVAILABILITY */}
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-red-400 font-[Cabin] capitalize font-semibold">{product.productAvalability || "Unknow Avalability"}</p>
                <p className="bg-[#f8f2f2] px-4 py-0.5 rounded-full w-fit text-sm text-red-400 font-[Cabin] capitalize font-semibold">{product.productAvalability === "Avaliable" ? "In Stock" : product.productAvalability === "Unavaliable" ? "Out of Stock" : "Unknow Avalability"}</p>
              </div>


              {/* CATEGORY */}
              <div className="font-semibold font-[Cabin] my-6 flex gap-2">
                <p className="text-[#212121] text-base">Category:</p>
                <p className="text-[#212121] bg-[#f8f2f2] px-4 py-0.5 rounded-full w-fit h-fit text-sm">{product.productCategory || "No category"}</p>
              </div>

              {/* QUANTITY and SIZE */}
              <div className="flex items-center text-lg font-semibold font-[Cabin]  gap-4">
                  <div className="flex items-center text-lg font-semibold font-[Cabin] mb-6 gap-4">
                      <p className="text-[#212121]">Quantity:</p>
                      <div className="w-20 h-10 border border-gray-300 rounded-lg flex items-center justify-center">
                          <input className="text-[#555] px-2 py-1 rounded-lg w-full h-full border-0 outline-0 text-sm font-[Cabin] font-normal" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)}/>
                      </div>
                  </div>
                  <div className="flex items-center text-lg font-semibold font-[Cabin] mb-6 gap-4">
                      <p className="text-[#212121]">Size:</p>
                      <div className="w-20 h-10 border border-gray-300 rounded-lg flex items-center justify-center">
                          <input className="text-[#555] w-full h-full px-2 py-1 rounded-lg border-0 outline-0 text-sm font-[Cabin] font-normal" type="text"  value={size} onChange={(e) => setSize(e.target.value)}/>
                      </div>
                  </div>
              </div>

              <div className="w-full flex items-center gap-5">
              {/* ADD TO CART BUTTON */}
                  <button onClick={() => addToCart(product)} className="w-[200px] py-3 bg-[#0000ff] text-white rounded-lg text-base font-[Cabin] shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-5 cursor-pointer"><BiCartAdd size={22}/> Add to Cart</button>

                  {/* ADD TO WISHLIST BUTTON */}
                  <button onClick={() => toggleFavorite(product)} className={`w-[200px] py-3 bg-[#dd0808] text-white rounded-lg text-base shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-5 cursor-pointer
                  ${wishlistIds.includes(product.id) ? "bg-gray-600" : "bg-[#dd0808]"}`}>
                  {wishlistIds.includes(product.id) ? (<IoMdHeart size={22}/>) : (<CiHeart size={22}/>)}
                  {wishlistIds.includes(product.id) ? "Remove Favourite" : "Add to Favourite"}
                </button>
              </div>

              {/* REVIEW */}
              {/* <div className="mt-6">
                <p className="text-lg font-semibold font-[Cabin]">Reviews</p>
                <button className="bg-[#ebe4e4] py-3 px-8 cursor-pointer font-[Cabin] font-semibold text-sm">Write a review</button>
              </div> */}

            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
              <p className="font-[montserrat] font-semibold text-lg">Product Description </p>
              <p className="text-gray-700 leading-relaxed mt-1 font-[Cabin] tracking-wide">{product.productDescription}</p>
          </div>
          
        </section>
      </>)}

      <Footer />
    </>
  );
}

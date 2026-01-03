import Header from "../lib/components/header";
import Footer from "../lib/components/footer";
import {Link, useNavigate} from "react-router-dom";
import { MdHome } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa";
import { TbCurrencyNaira } from "react-icons/tb";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { db } from "../firebase/config";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, setDoc, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../firebase/authContext.jsx";
import Loader from "../lib/ui/loader.jsx";

export default function CheckOutPage() {
    const {checkAuth, loading} = useAuth();
    const [checkoutItem, setCheckoutItem] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [isOrderLoading, setIsOrderLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("")
    const [isPayment, setIsPayment] = useState(false)
    const delivery = 2000
    const [nameInput, setNameInput] = useState("")
    const [emailInput, setEmailInput] = useState("")
    const [phoneNumberInput, setPhoneNumberInput] = useState("")
    const [cityInput, setCityInput] = useState("")
    const [addressInput, setAddressInput] = useState("")
    const [landMarkInput, setLandMarkInput] = useState("")
    const navigate = useNavigate()

    const fectchCheckoutItems = () => {
        if (!checkAuth) {
            toast.error("You must be logged in to view your checkout.");
            return;
        };
        setIsLoading(true)
        try {
            const checkoutRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "checkout-db", "current-checkout")

            const unsub = onSnapshot(checkoutRef, (snapshot) => {

                if (snapshot.exists()){
                    const data = snapshot.data()
                    setCheckoutItem(data.items)
                }else{
                    setCheckoutItem([])
                }
                setIsLoading(false)
            });
            return unsub
        } catch (error) {
            toast.error("Failed to fetch checkout items. Please try again later.");
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if(!checkAuth) return;
        const unsub = fectchCheckoutItems()
        return () => {
            if(unsub) unsub();
        }
    },[checkAuth])

    const addToOrder = async () =>{
        if (!checkAuth) {
            toast.error("You must be logged in to placed order.");
            return;
        };
        if(!nameInput || !emailInput || !phoneNumberInput || !cityInput || !addressInput){
            toast.error("All inputs are requried")
            return;
        }
        if(!paymentMethod){
            toast.error("Select a payment method")
            return;
        }
        setIsOrderLoading(true)

        try{
            const userOrderRef = collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "order-db");

            const subTotal = checkoutItem.reduce((acc, item) => acc + (item.productPrice * item.quantity), 0)
            const trackingNumber = ({
                brand = "MW",
                uid = "",
            })=> {
                const timestamp = Date.now().toString().slice(-2)
                // const random = Math.floor(100 + Math.random() * 900)
                const userUid = uid ? uid.slice(-2).toUpperCase() : "";
                return `${brand}-${timestamp}${userUid}`
            }
            const orderNo = Math.floor(10 + Math.random() * 90) + Date.now().toString().slice(-2);

            const orderItem = {
                order: checkoutItem.map((item)=>({
                    id: item.id || null,
                    productName: item.productName || "",
                    productImage: item.productImage || "",
                    productDescription: item.productDescription || "",
                    productPrice: item.productPrice || 0,
                    quantity: item.quantity || 0,
                    size: item.size || "",
                    productCategory: item.productCategory || "",
                })),
                deliveryInfo: {
                    fullName: nameInput,
                    userEmail: emailInput,
                    phoneNumber: phoneNumberInput,
                    userCity: cityInput,
                    userAddress: addressInput,
                    userLandMark: landMarkInput,
                },
                paymentMethod: paymentMethod,
                deliveryFee: delivery,
                status: "pending",
                trackingStatus: "preparing",
                trackingID: trackingNumber({brand: "MW", uid: checkAuth.uid}),
                orderId: orderNo,
                subTotal: subTotal || 0,
                Total: subTotal + delivery || 0,
                createdAt: serverTimestamp()
            }

            await addDoc(userOrderRef, orderItem)

            await deleteDoc(doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "checkout-db", "current-checkout"))

            const clearCart = collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "cart-db")
            const cartSnapShot = await getDocs(clearCart)
            const deleteCart = cartSnapShot.docs.map(items => deleteDoc(items.ref))
            await Promise.all(deleteCart);

            toast.success("order placed sucessfully")
            setTimeout(()=>{
                navigate("/")
            },2000)
        }catch (error){
            toast.error(error.message)
            console.log("order error:" + error.message)
            setIsOrderLoading(false)
        }finally{
            setIsOrderLoading(false)
        }
    }


    return (<>
        <Header />  
         <section className="w-[95%] md:w-[90%] lg:w-full h-[250px] mx-auto pt-10 pb-4 text-sm font-[Cabin] flex items-center justify-center flex-col gap-12 border bg-[#212121]">
            <div>
                <h1 className="font-[Montserrat] text-3xl font-bold uppercase text-white tracking-wider text-center">Checkout</h1>
            </div>
            <div className="flex items-center gap-3 text-center">
                <Link className="flex items-center gap-1 underline text-[#ffffff] hover:text-[#f5f5f5] transition cursor-pointer font-[Cabin] text-xs" to="/">
                    <MdHome size={20}/>
                    Home
                </Link>
                <span className="text-[#a7a1a1] text-xs"><FaAngleRight /> </span>
                <Link to="/cart" className="text-[#ffffff] hover:text-[#f5f5f5] font-[cabin] text-xs">Shopping Cart</Link>
                <span className="text-[#a7a1a1] text-xs"><FaAngleRight /> </span>
                <p className="text-[#a7a1a1] text-xs">Checkout</p>
            </div>
        </section>


        <section className="w-full h-auto">
            {isLoading ? (
                <div className="w-full h-[250px] flex items-center justify-center">
                    <Loader />
                </div>
            ) : checkoutItem.length === 0 ? (<div className="w-full h-[250px] flex items-center justify-center flex-col gap-3">
                <p className="text-base font-[cabin] text-[#212121]">Add product to cart</p>
                <Link to="/" className="bg-blue-600 text-white font-[cabin] font-semibold text-base tracking-wide py-2 px-4 rounded-lg">Shop Now</Link>
            </div>) : (
                <div className="w-[95%] mx-auto h-full flex items-start justify-center flex-col md:flex-row md:items-start md:justify-between md:gap-6 lg:gap-12">

                    {/* delivery */}
                    <div className="w-full md:w-[60%] lg:w-[50%] my-12 p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-[Montserrat] tracking-wide font-bold text-[#212121] border-0 border-gray-300 pb-3 mb-6">
                            Delivery Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-600 font-[cabin]">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your full name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-600 font-[cabin]">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-600 font-semibold">Phone Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="Enter your phone number"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base"
                                    value={phoneNumberInput}
                                    onChange={(e) => setPhoneNumberInput(e.target.value)}
                                />
                            </div>

                            {/* Delivery City */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-gray-600 font-semibold">City</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your city"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base"
                                    value={cityInput}
                                    onChange={(e) => setCityInput(e.target.value)}
                                />
                            </div>

                            {/* Delivery Address */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm text-gray-600 font-semibold">Delivery Address</label>
                                <div className="w-full h-[130px] border border-gray-300 rounded-lg focus-within:outline-none outline-none focus-within:border-blue-500">
                                    <textarea 
                                        placeholder="Enter your full delivery address"
                                        className="w-full h-full p-3 rounded-lg outline-none  font-[Cabin] text-base resize-none"
                                        value={addressInput}
                                        onChange={(e) => setAddressInput(e.target.value)}
                                        ></textarea>
                                </div>
                            </div>

                            {/* Landmark */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm text-gray-600 font-semibold">Nearest Landmark (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="E.g: Opposite UBA Bank"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base"
                                    value={landMarkInput}
                                    onChange={(e) => setLandMarkInput(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* order summary */}
                    <div className="w-full md:w-[40%] lg:w-[50%] my-12 p-6 rounded-lg shadow-sm bg-[#f9f9f9]">
                        <h2 className="text-2xl font-[Montserrat] font-bold text-[#212121] mb-6">
                            Order Summary
                        </h2>

                        {/* Items */}
                        <div className="flex flex-col gap-4 max-h-[260px] overflow-y-auto pr-2">
                            {checkoutItem.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 border-b pb-4">
                                    <div className="flex-1 flex gap-2 items-center">
                                        <p className="font-[Cabin] font-semibold text-sm text-[#212121] capitalize">
                                            {item.productName}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Size: {item.size} • Qty: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-[Cabin] text-sm font-semibold text-[#212121] flex items-center">
                                        <TbCurrencyNaira size={20}/>{Number(item.productPrice * item.quantity).toLocaleString("en-us", {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Price Summary */}
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="flex justify-between text-sm font-[Cabin] text-gray-700">
                                <span>Subtotal</span>
                                <span className="flex items-center">
                                    <TbCurrencyNaira size={20}/>
                                    {Number(checkoutItem.reduce((acc, item) => acc + item.productPrice * item.quantity, 0)).toLocaleString("en-us", {
                                        maximumFractionDigits:2,
                                        minimumFractionDigits:2,
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm font-[Cabin] text-gray-700">
                                <span>Delivery Fee</span>
                                <span className="flex items-center"><TbCurrencyNaira size={20}/> {Number(delivery).toLocaleString("en-us",{maximumFractionDigits:2, minimumFractionDigits:2})}</span>
                            </div>

                            <div className="border-t pt-4 flex justify-between font-[Montserrat] font-bold text-base text-[#212121]">
                                <span>Total</span>
                                <span className="flex items-center">
                                    <TbCurrencyNaira size={20}/>
                                    {Number(checkoutItem.reduce((acc, item) => (acc + item.productPrice * item.quantity), 0 + delivery)).toLocaleString("en-us", {maximumFractionDigits: 2, minimumFractionDigits:2})}
                                </span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-8">
                            <h3 className="font-[Montserrat] font-bold text-lg text-[#212121] mb-4">
                                Select Payment Method
                            </h3>

                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-3 p-4 border border-gray-400 rounded-lg bg-white cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="accent-blue-600"
                                        value="delivery"
                                        checked={paymentMethod === "delivery"}
                                        onChange={() => setPaymentMethod("delivery")}
                                    />
                                    <span className="font-[Cabin] text-sm text-[#212121]">
                                        Pay on Delivery
                                    </span>
                                </label>
                                    
                                <label className="flex items-center gap-3 p-4 border border-gray-400 rounded-lg bg-white cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="accent-blue-600"
                                        value="transfer"
                                        checked={paymentMethod === "transfer"}
                                        onChange={() => setPaymentMethod("transfer")}
                                    />
                                    <span className="font-[Cabin] text-sm text-[#212121]">
                                        Bank Transfer
                                    </span>
                                </label>

                                {paymentMethod === "transfer" && (<div className="w-full h-auto bg-[#212121] rounded-lg p-4">
                                    <h3 className="text-white font-[cabin] tracking-wide text-lg">Payment Transfer Details</h3>
                                    <hr className="border-b border-[#f4f4f469]"/>
                                    <div className="mt-3">
                                        <div className="w-full flex items-center mb-3">
                                            <p className="text-blue-400 font-[cabin] tracking-wide text-base flex-1">Account Number:</p>
                                            <p className="text-white font-[cabin] tracking-wider text-base ">2208112213</p>
                                        </div>
                                        <div className="w-full flex items-center mb-3">
                                            <p className="text-blue-400 font-[cabin] tracking-wide text-base flex-1">Bank:</p>
                                            <p className="text-white font-[cabin] tracking-wide text-base">United Bank for Africa (UBA)</p>
                                        </div>
                                        <div className="w-full flex items-center">
                                            <p className="text-blue-400 font-[cabin] tracking-wide text-base flex-1">Account Name:</p>
                                            <p className="text-white font-[cabin] tracking-wide text-base">Lamidi Abdulrahman Oyedele</p>
                                        </div>

                                        <p className="text-blue-400 font-[cabin] tracking-wide text-sm mt-4">Please transfer the total amount and keep your payment receipt. Your order will be processed after payment confirmation.</p>
                                    </div>
                                </div>)}
                            </div>

                            {/* Checkout Button */}
                            <button
                                className={`w-full mt-8 text-white font-[Montserrat] font-semibold py-3 rounded-lg transition ${isOrderLoading ? "cursor-not-allowed bg-[#21212183]" : "cursor-pointer bg-[#212121] hover:bg-black"}`}
                                onClick={addToOrder}
                                disabled={isOrderLoading}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
        <Footer />
    </>);
}
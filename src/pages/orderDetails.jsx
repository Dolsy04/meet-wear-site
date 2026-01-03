import Header from "../lib/components/header"
import Footer from "../lib/components/footer"
import { useParams, Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { TbCurrencyNaira } from "react-icons/tb";
import { BiCartAdd } from "react-icons/bi";
import { CiHeart } from "react-icons/ci";
import { MdHome } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../firebase/authContext.jsx";
import { toast } from 'react-toastify';
import Loader from "../lib/ui/loader.jsx";

export default function OrderDetails({ordersDetail}){
    const { checkAuth, loading } = useAuth();
    const { id } = useParams();
    const [orders, setOrders] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState("order");
    const navigate = useNavigate();

  useEffect(() => {
      if(!checkAuth || !id){
          toast.error('Login to view order details')
          return;
      }
      const fetchOrders = async () => {
          
          setIsLoading(true);
          try{
              const ordersRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid, "order-db", id)
              const getRef = await getDoc(ordersRef)
    
              if(getRef.exists()){
                  setOrders({id: getRef.id , ...getRef.data() })
              }else{
                  setOrders(null)
                  toast.error("order not found")
              }
          }catch (error){
              toast.error("Error fetching orders")
              console.log("error fetching order details" + error.message)
          }finally{
              setIsLoading(false)
          }
      }

      fetchOrders()
  },[checkAuth, id])


    return(
        <>
            <Header />
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
                <p className="text-[#777]">Order Details</p>
            </section>


            <section className="w-[95%] md:w-[90%] mx-auto pt-10 pb-4 text-sm font-[Cabin] flex items-center gap-2">
                <div className="w-full">
                      {isLoading ? (<div className="w-full h-10 flex items-center justify-center"><Loader /></div>) : (<div className="w-full">
                        <h2 className="text-2xl font-[Montserrat] font-bold mb-6 flex items-center gap-2">Order Details - #{!isLoading && orders && (<p>{orders.orderId}</p>)}</h2>

                        <div className="flex items-center gap-4 text-base font-[cabin] tracking-wide text-gray-700">
                            <button onClick={()=> setPage("order")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out font-[cabin] text-sm font-semibold ${page === "order" ? "underline text-gray-200 bg-[#212121] py-1 px-3 rounded-full hover:text-gray-300" : "bg-none hover:text-gray-500 p-0 text-[#212121] no-underline"}`}>Orders</button>
                            <button onClick={()=> setPage("delivery")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out font-[cabin] text-sm font-semibold ${page === "delivery" ? "underline text-gray-200 bg-[#212121] py-1 px-3 rounded-full hover:text-gray-300" : "bg-none hover:text-gray-500 p-0 text-[#212121] no-underline"}`}>Delivery Information</button>
                            <button onClick={()=> setPage("status")} className={`h-full cursor-pointer transition-all duration-300 ease-in-out font-[cabin] text-sm font-semibold ${page === "status" ? "underline text-gray-200 bg-[#212121] py-1 px-3 rounded-full hover:text-gray-300" : "bg-none hover:text-gray-500 p-0 text-[#212121] no-underline"}`}>Others</button>
                        </div>

                        {!isLoading && orders && ( 
                            <div className="mt-6">
                                <div className="hidden lg:block">
                                    {page === "order" && (
                                        <div>
                                            {orders.order?.map((item, index) => (<>
                                                <div key={index}>
                                                    <div className="flex gap-4 p-3 rounded">
                                                        <div className="w-[120px] h-[100px] ">
                                                            <img src={item.productImage} alt={item.productName}/>
                                                        </div>
                                                        <div className="flex items-start justify-between w-full h-full gap-6">
                                                            <div>
                                                                <h3 className="text-lg font-semibold tracking-wide capitalize">{item.productName}</h3>
                                                                <p className="text-sm font-semibold">
                                                                    <span className="text-gray-500">Size:</span> {item.size || "Not provided"}
                                                                </p>
                                                                {/* <p className="text-sm font-semibold">
                                                                    <span className="text-gray-500">Quantity:</span>  {item.quantity || "Not provided"}
                                                                </p>
                                                                */}
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-semibold">
                                                                    <span className="text-gray-500">Quantity:</span>  {item.quantity || "Not provided"}
                                                                </p>
                                                                
                                                                <p className="text-sm font-semibold flex items-center">
                                                                    <span className="text-gray-500">Amount:</span><TbCurrencyNaira size={20}/> {Number(item.productPrice || "Not provided").toLocaleString("en-us",{maximumFractionDigits: 2, minimumFractionDigits: 2})} 
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold flex items-center">
                                                                <TbCurrencyNaira size={20}/> {Number(item.productPrice || "Not provided").toLocaleString("en-us",{maximumFractionDigits: 2, minimumFractionDigits: 2})} 
                                                                </p>
                                                                <span> x </span>
                                                                <p className="text-base font-semibold">{item.quantity || "Not provided"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold flex items-center">
                                                                    <span className="text-gray-500">Total:</span><TbCurrencyNaira size={20}/> {Number(item.productPrice * item.quantity || "Not provided").toLocaleString("en-us",{maximumFractionDigits: 2, minimumFractionDigits: 2})} 
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>))}
                                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mt-6">
                                            <h2 className="font-semibold text-lg mb-3">Order Summary</h2>

                                            {/* PAYMENT */}
                                            <div className="flex justify-between items-center mb-3 text-sm">
                                                <span className="text-gray-600">Payment Method</span>
                                                {orders.paymentMethod === "delivery" ? (
                                                <span className="text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                                    Payment on delivery
                                                </span>
                                                ) : (
                                                <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                                    Transfer from bank
                                                </span>
                                                )}
                                            </div>

                                            {/* SUBTOTAL */}
                                            <div className="flex justify-between mb-2 text-sm">
                                                <span className="text-gray-600">Sub-Total</span>
                                                <span className="flex items-center font-medium">
                                                <TbCurrencyNaira />
                                                {Number(orders.subTotal).toLocaleString("en-us", {
                                                    maximumFractionDigits: 2,
                                                    minimumFractionDigits: 2,
                                                })}
                                                </span>
                                            </div>

                                            {/* DELIVERY */}
                                            <div className="flex justify-between mb-2 text-sm">
                                                <span className="text-gray-600">Delivery Fee</span>
                                                <span className="flex items-center font-medium">
                                                <TbCurrencyNaira />
                                                {Number(orders.deliveryFee).toLocaleString("en-us", {
                                                    maximumFractionDigits: 2,
                                                    minimumFractionDigits: 2,
                                                })}
                                                </span>
                                            </div>

                                            {/* TOTAL */}
                                            <div className="flex justify-between font-bold text-base pt-3 border-t">
                                                <span>Total</span>
                                                <span className="flex items-center">
                                                <TbCurrencyNaira />
                                                {Number(orders.Total).toLocaleString("en-us", {
                                                    maximumFractionDigits: 2,
                                                    minimumFractionDigits: 2,
                                                })}
                                                </span>
                                            </div>
                                        </div>
                                        </div>
                                    )}
                                </div>
                                <div className="block lg:hidden">
                                    {page === "order" && (
                                        <div className="space-y-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {orders.order?.map((item, index) => (
                                            <div
                                                key={index}
                                                className="w-full bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                                            >
                                                {/* IMAGE + NAME */}
                                                <div className="flex gap-3">
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    className="w-24 h-24 object-cover rounded-md"
                                                />

                                                <div className="flex-1">
                                                    <h3 className="text-base md:text-lg font-semibold capitalize">
                                                    {item.productName}
                                                    </h3>

                                                    <p className="text-sm mt-1">
                                                    <span className="text-gray-500">Size:</span>{" "}
                                                    {item.size || "Not provided"}
                                                    </p>

                                                    <p className="text-sm">
                                                    <span className="text-gray-500">Quantity:</span>{" "}
                                                    {item.quantity || "Not provided"}
                                                    </p>
                                                </div>
                                                </div>

                                                {/* PRICE BREAKDOWN */}
                                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Unit Price</span>
                                                    <span className="flex items-center font-medium">
                                                    <TbCurrencyNaira />
                                                    {Number(item.productPrice).toLocaleString("en-us", {
                                                        maximumFractionDigits: 2,
                                                        minimumFractionDigits: 2,
                                                    })}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Quantity</span>
                                                    <span className="font-medium">{item.quantity}</span>
                                                </div>

                                                <div className="flex justify-between font-semibold text-base">
                                                    <span>Total</span>
                                                    <span className="flex items-center">
                                                    <TbCurrencyNaira />
                                                    {Number(item.productPrice * item.quantity).toLocaleString(
                                                        "en-us",
                                                        {
                                                        maximumFractionDigits: 2,
                                                        minimumFractionDigits: 2,
                                                        }
                                                    )}
                                                    </span>
                                                </div>
                                                </div>
                                            </div>
                                            ))}

                                            {/* ORDER SUMMARY */}
                                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mt-6">
                                                <h2 className="font-semibold text-lg mb-3">Order Summary</h2>

                                                {/* PAYMENT */}
                                                <div className="flex justify-between items-center mb-3 text-sm">
                                                    <span className="text-gray-600">Payment Method</span>
                                                    {orders.paymentMethod === "delivery" ? (
                                                    <span className="text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                                        Payment on delivery
                                                    </span>
                                                    ) : (
                                                    <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                                        Transfer from bank
                                                    </span>
                                                    )}
                                                </div>

                                                {/* SUBTOTAL */}
                                                <div className="flex justify-between mb-2 text-sm">
                                                    <span className="text-gray-600">Sub-Total</span>
                                                    <span className="flex items-center font-medium">
                                                    <TbCurrencyNaira />
                                                    {Number(orders.subTotal).toLocaleString("en-us", {
                                                        maximumFractionDigits: 2,
                                                        minimumFractionDigits: 2,
                                                    })}
                                                    </span>
                                                </div>

                                                {/* DELIVERY */}
                                                <div className="flex justify-between mb-2 text-sm">
                                                    <span className="text-gray-600">Delivery Fee</span>
                                                    <span className="flex items-center font-medium">
                                                    <TbCurrencyNaira />
                                                    {Number(orders.deliveryFee).toLocaleString("en-us", {
                                                        maximumFractionDigits: 2,
                                                        minimumFractionDigits: 2,
                                                    })}
                                                    </span>
                                                </div>

                                                {/* TOTAL */}
                                                <div className="flex justify-between font-bold text-base pt-3 border-t">
                                                    <span>Total</span>
                                                    <span className="flex items-center">
                                                    <TbCurrencyNaira />
                                                    {Number(orders.Total).toLocaleString("en-us", {
                                                        maximumFractionDigits: 2,
                                                        minimumFractionDigits: 2,
                                                    })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {page === "delivery" && (
                                    <div>
                                        <div className="mb-6 flex flex-col gap-4">
                                            <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Name:</strong> {orders.deliveryInfo.fullName}</p>
                                            <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Email:</strong> {orders.deliveryInfo.userEmail}</p>
                                            <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Phone:</strong> {orders.deliveryInfo.phoneNumber}</p>
                                            <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Address:</strong> {orders.deliveryInfo.userAddress}</p>
                                            <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Nearest Landmark:</strong> {orders.deliveryInfo.userLandMark || "Not provided"}</p>
                                        </div>
                                    </div>
                                )}
                                {page === "status" && (
                                    <div>
                                        <div className="mb-6 flex flex-col gap-3">

                                             <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Order Date:</strong> {new Date(orders.createdAt.seconds * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true, })}</p>
                                            <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Order ID:</strong> {orders.orderId}</p>

                                            <div className="flex items-center gap-4">
                                                <p className="font-[cabin] lg:text-lg text-base tracking-wide capitalize"><strong>Order Status:</strong></p>
                                                <p className={`py-3 text-[#212121] font-[cabin] lg:text-lg text-base tracking-wide capitalize`}>
                                                    {orders.status === "pending" ? (<span className="py-1 px-4 bg-yellow-100 text-yellow-700 rounded-full">pending</span>) : orders.status === "accepted" ? (<span className="py-1 px-4 bg-green-100 text-green-700 rounded-full">accepted</span>) : orders.status === "cancel" ? (<span className="py-1 px-4 bg-red-100 text-red-700 rounded-full">cancel</span>) : "--"}
                                                </p>
                                            </div>

                                            <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Tracking ID:</strong> {orders.trackingID}</p>

                                            <div className="flex items-center gap-4">
                                                <p className="font-[cabin] lg:text-lg text-base tracking-wide capitalize"><strong>Tracking Status:</strong></p>
                                                <p className={`py-3 text-[#212121] font-[cabin] lg:text-lg text-base tracking-wide capitalize`}>
                                                    {orders.trackingStatus === "preparing" ? (<span className="py-1 px-4 bg-gray-100 text-gray-700 rounded-full">preparing</span>) : orders.trackingStatus === "transmit" ? (<span className="py-1 px-4 bg-indigo-100 text-indigo-700 rounded-full">transmit</span>) : orders.trackingStatus === "delivered" ? (<span className="py-1 px-4 bg-green-100 text-green-700 rounded-full">delivered</span>) : "--"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                      </div>)}
                </div>
            </section>
            <Footer />
        </>
    )
}

//  <p className="font-[cabin] lg:text-lg text-base tracking-wide"><strong>Payment Method:</strong> {orders.paymentMethod === "delivery" ? (<span className="text-purple-600 bg-purple-100 py-1 px-4 rounded-full">Payment on delivery</span>) : (<span  className="text-blue-600 bg-blue-100 py-1 px-4 rounded-full">Transfer from bank</span>)}</p>

//                                             <p className="font-[cabin] lg:text-lg text-base tracking-wide flex items-center"><strong>Total Amount:</strong> <TbCurrencyNaira size={20}/> {Number(orders.Total).toLocaleString("en-us",{maximumFractionDigits: 2, minimumFractionDigits: 2})}</p>
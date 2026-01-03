import Header from "../lib/components/header"
import Footer from "../lib/components/footer"
import Card from "../lib/ui/Card.jsx"
import {Link, useNavigate} from "react-router-dom";
import { MdHome } from "react-icons/md";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { TbCurrencyNaira } from "react-icons/tb";
import { IoIosArrowRoundBack } from "react-icons/io";
import { PiShoppingBagOpenDuotone } from "react-icons/pi";
import { MdCheckCircle, MdCancel, MdOutlinePendingActions } from "react-icons/md";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { db } from "../firebase/config";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "../firebase/authContext.jsx";
import Loader from "../lib/ui/loader.jsx";


export default function OrderHistory({setOrdersDetails}){
    const { checkAuth, loading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filterOrder, setFliterOrder] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(false)
     const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        if(!checkAuth){
            toast.error('Login to view order history')
            return;
        }
        
        setIsProfileLoading(true)
        // try{
            const ordersRef = query(collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "order-db"),orderBy("createdAt", "desc"))

            const unsub = onSnapshot(ordersRef, (snapshot)=> {
                const orderList = snapshot.docs.map((doc)=> ({
                    id: doc.id,
                    ...doc.data(),
                }))
                setOrders(orderList)
                setOrdersDetails(orderList)
                setIsProfileLoading(false)
                },
                (error)=>{
                    toast.error("Error fetching orders")
                }
            )
            return unsub
    }

    useEffect(()=>{
        if(!checkAuth) return;
        const loadOrder = fetchOrders()
        return () => loadOrder
    },[checkAuth])

    const pendingOrder = orders.filter(order => order.status?.toLowerCase() === "pending").length
    const completeOrder = orders.filter(order => order.status?.toLowerCase() === "accepted").length
    const cancelOrder = orders.filter(order => order.status?.toLowerCase() === "cancel").length

    useEffect(()=>{
        if(activeFilter === "all"){
            setFliterOrder(orders)
        }else{
            const filterOrder = orders.filter((order)=> order.status === activeFilter)
            setFliterOrder(filterOrder)
        }
    },[activeFilter, orders])
    const paginatedPage = filterOrder.slice((currentPage - 1) * 12, currentPage * 12)
    const totalPages = Math.ceil(filterOrder.length / 12);

    return(<>
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
          <p className="text-[#777]">Order History</p>
        </section>

        <section className="w-[95%] md:w-[90%] mx-auto pt-10 pb-4 text-sm font-[Cabin]">
            <h3 className="font-[Montserrat] font-bold text-3xl text-[#212121]">My Orders History</h3>
            <div className="lg:flex lg:items-center lg:flex-row grid grid-cols-1 md:grid-cols-2 gap-9 mt-6">
                <Card  tabIndex="0" className={`bg-[#f5f5f5] w-full lg:w-[220px] h-[100px] md-auto flex items-center px-4 rounded-lg focus-visible:bg-[#212121] focus-visible:text-white active:bg-[#212121] active:text-white hover:shadow-sm hover:bg-[#212121] hover:text-white transition-all ease-in-out duration-300 cursor-pointer`}>
                    <div className="flex-1">
                        <h2 className="mb-4 text-lg font-normal">All Order</h2>
                        <div className="text-3xl font-extrabold">{isProfileLoading ? (<p className="italic text-xs">Loading...</p>) : (<div>
                            {String(orders.length).padStart("2",0)}
                        </div>)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                        <PiShoppingBagOpenDuotone className="text-blue-700" size={24}/>
                    </div>
                </Card>
                <Card  tabIndex="0" className={`bg-[#f5f5f5] w-full lg:w-[220px] h-[100px] md-auto flex items-center px-4 rounded-lg focus-visible:bg-[#212121] focus-visible:text-white active:bg-[#212121] active:text-white hover:shadow-sm hover:bg-[#212121] hover:text-white transition-all ease-in-out duration-300 cursor-pointer`}>
                    <div className="flex-1">
                        <h2 className="mb-4 text-lg font-normal">Accepted Order</h2>
                        <div className="text-3xl font-extrabold">{isProfileLoading ? (<p className="text-xs italic">loading...</p>): (<>
                            {String(completeOrder).padStart("2",0)}
                        </>)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                        <MdCheckCircle className="text-green-700" size={24}/>
                    </div>
                </Card>
                <Card  tabIndex="0" className={`bg-[#f5f5f5] w-full lg:w-[220px] h-[100px] md-auto flex items-center px-4 rounded-lg focus-visible:bg-[#212121] focus-visible:text-white active:bg-[#212121] active:text-white hover:shadow-sm hover:bg-[#212121] hover:text-white transition-all ease-in-out duration-300 cursor-pointer`}>
                    <div className="flex-1">
                        <h2 className="mb-4 text-lg font-normal">Pending Order</h2>
                        <div className="text-3xl font-extrabold">{isProfileLoading ? (<p className="text-xs italic">loading...</p>): (<>
                            {String(pendingOrder).padStart("2",0)}
                        </>)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                        <MdOutlinePendingActions className="text-yellow-400" size={24}/>
                    </div>
                </Card>
                <Card  tabIndex="0" className={`bg-[#f5f5f5] w-full lg:w-[220px] h-[100px] md-auto flex items-center px-4 rounded-lg focus-visible:bg-[#212121] focus-visible:text-white active:bg-[#212121] active:text-white hover:shadow-sm hover:bg-[#212121] hover:text-white transition-all ease-in-out duration-300 cursor-pointer`}>
                    <div className="flex-1">
                        <h2 className="mb-4 text-lg font-normal">Cancel Order</h2>
                        <div className="text-3xl font-extrabold">{isProfileLoading ? (<p className="text-xs italic">loading...</p>): (<>
                            {String(cancelOrder).padStart("2",0)}
                        </>)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white">
                        <MdCancel className="text-red-600" size={24}/>
                    </div>
                </Card>
            </div>
        </section>

        <section className="w-[95%] md:w-[90%] mx-auto pt-10 pb-4 text-sm font-[Cabin]">
            <div className="w-full">
                <h3 className="mb-4 text-xl font-[cabin]">Recent Orders</h3>
                <div className="flex gap-4">
                    <p className="text-base font-[cabin] tracking-wide text-gray-700">Filter by:</p>
                    <div className="flex items-center gap-4 text-base font-[cabin] tracking-wide text-gray-700">
                        <button className={`h-full cursor-pointer transition-all duration-300 ease-in-out font-[cabin] text-sm font-semibold ${activeFilter === "all" ? "underline text-gray-200 bg-[#212121] py-1 px-3 rounded-full hover:text-gray-300" : "bg-none hover:text-gray-500 p-0 text-[#212121] no-underline"}`} onClick={() => setActiveFilter("all")}>All</button>

                        <button className={`h-full cursor-pointer transition-all duration-300 ease-in-out font-[cabin] text-sm text-[#212121] font-semibold ${activeFilter === "pending" ? "underline text-gray-200 bg-[#212121] py-1 px-3 rounded-full hover:text-gray-300" : "bg-none hover:text-gray-500 p-0 text-[#212121] no-underline"}`} onClick={() => setActiveFilter("pending")}>Pending order</button>

                        <button className={`h-full cursor-pointer transition-all duration-300 ease-in-out font-[cabin] text-sm text-[#212121] font-semibold ${activeFilter === "accepted" ? "underline text-gray-200 bg-[#212121] py-1 px-3 rounded-full hover:text-gray-300" : "bg-none hover:text-gray-500 p-0 text-[#212121] no-underline"}`} onClick={() => setActiveFilter("accepted")}>Accepted order</button>

                        <button className={`h-full cursor-pointer transition-all duration-300 ease-in-out font-[cabin] text-sm text-[#212121] font-semibold ${activeFilter === "cancel" ? "underline text-gray-200 bg-[#212121] py-1 px-3 rounded-full hover:text-gray-300" : "bg-none hover:text-gray-500 p-0 text-[#212121] no-underline"}`} onClick={() => setActiveFilter("cancel")}>Cancel order</button>
                    </div>
                </div>

                {isProfileLoading ? (<div className="w-full h-[30px] flex items-center justify-center">
                        <Loader />
                    </div>) : orders.length >= 1 ? (<>
                    <div className="w-full mt-3 border border-gray-200 rounded-lg hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 font-semibold text-sm text-zinc-500 font-[Montserrat]">#Order ID</th>
                                    <th className="py-3 font-semibold text-sm text-zinc-500 font-[Montserrat]">Payment Method</th>
                                    <th className="py-3 font-semibold text-sm text-zinc-500 font-[Montserrat]">Total</th>
                                    <th className="py-3 font-semibold text-sm text-zinc-500 font-[Montserrat]">Order Status</th>
                                    <th className="py-3 font-semibold text-sm text-zinc-500 font-[Montserrat]">Tracking Status</th>
                                    <th className="py-3 font-semibold text-sm text-zinc-500 font-[Montserrat]">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPage.map(order => (
                                    <tr key={order.id} className="border-b border-gray-300 text-center">
                                        <td className="text-sm font-[cabin] text-[#212121] py-3">{order.orderId}</td>

                                        <td className="text-sm font-[cabin] py-3">{order.paymentMethod === "delivery" ? (<span className="text-purple-600 bg-purple-100 py-1 px-4 rounded-full">Payment on delivery</span>) : (<span  className="text-blue-600 bg-blue-100 py-1 px-4 rounded-full">Transfer from bank</span>)}</td>

                                        <td className="text-sm font-[cabin] py-3 text-[#212121] flex items-center justify-center">
                                            <span>
                                                <TbCurrencyNaira size={24}/>
                                            </span>
                                            {Number(order.Total).toLocaleString("en-us",{maximumFractionDigits: 2, minimumFractionDigits: 2})}</td>

                                        <td className={`text-sm font-[cabin] py-3 text-[#212121] capitalize`}>
                                            {order.status === "pending" ? (<span className="py-1 px-4 bg-yellow-100 text-yellow-700 rounded-full">pending</span>) : order.status === "accepted" ? (<span className="py-1 px-4 bg-green-100 text-green-700 rounded-full">accepted</span>) : order.status === "cancel" ? (<span className="py-1 px-4 bg-red-100 text-red-700 rounded-full">cancel</span>) : "--"}
                                        </td>

                                        <td className={`text-sm font-[cabin] py-3 text-[#212121] capitalize`}>
                                            {order.trackingStatus === "preparing" ? (<span className="py-1 px-4 bg-gray-100 text-gray-700 rounded-full">preparing</span>) : order.trackingStatus === "transmit" ? (<span className="py-1 px-4 bg-indigo-100 text-indigo-700 rounded-full">transmit</span>) : order.trackingStatus === "delivered" ? (<span className="py-1 px-4 bg-green-100 text-green-700 rounded-full">delivered</span>) : "--"}
                                        </td>

                                        <td className="text-sm font-[cabin] py-3"><Link to={`/order/${order.id}`}>
                                            <span className="py-2 px-4 font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition">View details</span>
                                        </Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* MOBILE + TABLET CARDS */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 space-y-4 lg:hidden">
                    {paginatedPage.map(order => (
                        <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                        >
                        {/* ORDER ID */}
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-medium">{order.orderId}</span>
                        </div>

                        {/* PAYMENT */}
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500">Payment</span>
                            {order.paymentMethod === "delivery" ? (
                            <span className="text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                Payment on delivery
                            </span>
                            ) : (
                            <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                Transfer from bank
                            </span>
                            )}
                        </div>

                        {/* TOTAL */}
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500">Total</span>
                            <span className="flex items-center font-semibold">
                            <TbCurrencyNaira />
                            {Number(order.Total).toLocaleString("en-us", {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                            })}
                            </span>
                        </div>

                        {/* ORDER STATUS */}
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-500">Order Status</span>
                            {order.status === "pending" ? (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                pending
                            </span>
                            ) : order.status === "accepted" ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                accepted
                            </span>
                            ) : (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                                cancel
                            </span>
                            )}
                        </div>

                        {/* TRACKING */}
                        <div className="flex justify-between items-center text-sm mb-4">
                            <span className="text-gray-500">Tracking</span>
                            {order.trackingStatus === "preparing" ? (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                preparing
                            </span>
                            ) : order.trackingStatus === "transmit" ? (
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                                transmit
                            </span>
                            ) : (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                delivered
                            </span>
                            )}
                        </div>

                        {/* ACTION */}
                        <Link
                            to={`/order/${order.id}`}
                            className="block text-center border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                        >
                            View details
                        </Link>
                        </div>
                    ))}
                    </div>

                    
                    {/* pagination control */}
                    <div className={`w-full`}>
                        <div className={`w-full flex items-center justify-start gap-2 mt-2`}>
                            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-1.5 font-[Cabin] text-sm bg-gray-300 flex items-center text-gray-700 rounded disabled:opacity-50 ${currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}><FaAngleLeft/> Back</button>
                            <span className="font-medium font-[Cabin] text-xs text-[#212121] tracking-wide">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-4 py-1.5 font-[Cabin] text-sm bg-gray-300 flex items-center text-gray-700 rounded disabled:opacity-50 ${currentPage === totalPages ? "cursor-not-allowed" : "cursor-pointer"}`}>Next <FaAngleRight/> </button>
                        </div>
                    </div>
                </>) : (<>
                    <div className="w-full h-10 flex items-center justify-center flex-col gap-2 my-4">
                        <p className="text-lg font-[cabin] font-semibold text-red-600">No Order history</p>
                        <p className="text-base font-[cabin] font-semibold text-gray-600"><Link to="/" className="bg-blue-600 text-white py-2 px-6 rounded-lg">Shop Now</Link></p>
                    </div>
                </>)}
            </div>
        </section>

        <Footer />
    </>
    )
}
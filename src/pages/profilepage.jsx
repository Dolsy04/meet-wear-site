import Header from "../lib/components/header"
import Footer from "../lib/components/footer"
import {Link, useNavigate} from "react-router-dom";
import { MdHome } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa";
import { TbCurrencyNaira } from "react-icons/tb";
import { IoIosArrowRoundBack } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { MdOutlineEdit } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { PiShoppingBagOpenDuotone } from "react-icons/pi";
import { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import { toast } from 'react-toastify';
import { db } from "../firebase/config";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, setDoc, addDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuth } from "../firebase/authContext.jsx";
// import Loader from "../lib/ui/loader.jsx";
import Loader from "../lib/ui/loader.jsx";

export default function ProfilePage(){
    const { checkAuth, loading } = useAuth();
    const [isEdit, setIsEdit] = useState(false)
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [editData, setEditData] = useState({name: "", phoneNumber: "", address: "", country: "", state: "", city: ""})
    const navigate = useNavigate()
    const countries = Country.getAllCountries();
    const states = State.getStatesOfCountry(editData.country);
    const cities = City.getCitiesOfState(editData.country, editData.state);
    

    const fetchProfile = async () =>{
        if(!checkAuth){
            toast.error("Login to view your profile details")
            return;
        }
        setIsProfileLoading(true);
        try{
            const userProfileDetails = doc(db, "meet-wear-buyer-users-db", checkAuth.uid)
            const docSnap = await getDoc(userProfileDetails);
    
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserInfo(data);
            }else {
                toast.error("User profile not found");
            }
        }catch (error){
            toast.error("Something went wrong")
        }finally{
            setIsProfileLoading(false);
        }
    }
    useEffect(() => {
        if(!checkAuth) return;
        fetchProfile()
    },[checkAuth])

//    fetching orders
    useEffect(() => {
    if (!checkAuth) return;

    const orderRef = collection(
      db,
      "meet-wear-buyer-users-db",
      checkAuth.uid,
      "order-db"
    );

    const q = query(orderRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(orderList);
    });

    return () => unsubscribe();
    }, [checkAuth]);

    const fetchWishlistItems = async () => {
        if (!checkAuth) {
            toast.error("You must be logged in to view your wishlist.");
            return;
        };

        setIsLoading(true);

        try {
            const wishlistRef = query(collection(db, "meet-wear-buyer-users-db", checkAuth.uid, "wishlist-db"), orderBy("addedAt", "desc"));

            const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
                const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setWishlistItems(items)
            })
            return unsubscribe;
        } catch (error) {
            toast.error("Error fetching wishlist items: " + error.message);
            console.log("Error fetching wishlist items: ", error.message);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        const loadWhishlist = fetchWishlistItems();
        return () => loadWhishlist;
    }, [checkAuth]);
    
    const updateProfile = async (e) =>{
        e.preventDefault();
        if(!checkAuth){
            toast.error("Log-in to update your profile")
            return;
        }

        setIsLoading(true);

        try{
            const updateProfileRef = doc(db, "meet-wear-buyer-users-db", checkAuth.uid)
            await updateDoc(updateProfileRef, {
                name: editData.name || "",
                phoneNumber: editData.phoneNumber || "",
                address: editData.address || "",
                country: editData.country || "",
                state: editData.state || "",
                city: editData.city || ""
            }, {merge: true})
            toast.success("Profile updated successfully")
            setEditData("")
            fetchProfile();
            setIsEdit(false)
        }catch (error){
            toast.error("something went wrong. Try again later")
            setIsLoading(false)
        }finally{
            setIsLoading(false)
        }
    }
    
    const handleEditClick = () => {
        if (!userInfo) return;
        setEditData({
            name: userInfo.name || "",
            phoneNumber: userInfo.phoneNumber || "",
            address: userInfo.address || "",
            country: userInfo.country || "",
            state: userInfo.state || "",
            city: userInfo.city || ""
        });
    };

    const countryName = userInfo?.country ? Country.getAllCountries().find(country => country.isoCode === userInfo.country)?.name : "Not Provided";
    const stateName =  userInfo?.country ? State.getStatesOfCountry(userInfo.country).find(state => state.isoCode === userInfo.state)?.name : "Not Provided";

    const toOrderHistory = () => {
        navigate("/order-history")
    }
    const toMyWishlist = () => {
        navigate("/wishlist")
    }

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
          <p className="text-[#777]">my-profile</p>
        </section>

        <section className="w-full h-auto mt-10">
            <div className="w-[90%] mx-auto">
                <h3 className="font-[Montserrat] font-bold text-3xl text-[#212121]">My Profile</h3>
                <p className="font-[Montserrat] font-normal text-lg text-[#212121] mt-2">Manage your account and view your activity</p>

                {isProfileLoading ? (<div className="w-full h-[250px] flex items-center justify-center">
                    <Loader />
                </div>) : (
                    <div className="mt-8 w-full h-auto border border-gray-300 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-[Montserrat] font-semibold text-[#212121] text-xl">Personal Infomation</h3>
                        <button className="border border-gray-300 px-4 py-2 rounded-lg font-[Montserrat] font-semibold cursor-pointer" onClick={() => {
                            if(!isEdit){
                                handleEditClick()
                            }
                            setIsEdit(!isEdit)
                        }}>{isEdit ? (<div className="flex items-center gap-2">
                            <IoIosClose size={24}/> <span>Cancel</span>
                        </div>) : (<div className="flex items-center gap-2">
                            <MdOutlineEdit size={20}/> <span>Edit</span>
                        </div>)}
                        </button>
                    </div>

                    <hr className="border-b border-gray-300 mt-2"/>

                    {/* personal profile */}
                    {isProfileLoading ? (<div>
                        <Loader/>
                    </div>) : (<>
                        <div className="">
                            {isEdit ? (
                                <div className="mt-3">
                                    <form className="" onSubmit={updateProfile}>
                                        <div className="w-full flex items-start lg:items-center flex-col lg:flex-row gap-2">
                                            <div className="w-full flex-1 ">
                                                <label className="text-sm text-gray-600 font-semibold">Name</label>
                                                <input type="text" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base mt-2" placeholder="John Doe"
                                                value={editData.name}
                                                onChange={(e) => setEditData({...editData, name:e.target.value})}
                                                />
                                            </div>
                                            <div className="w-full flex-1">
                                                <label className="text-sm text-gray-600 font-semibold">Phone Number</label>
                                                <input type="tel" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base mt-2" placeholder="+234 0000000000"
                                                value={editData.phoneNumber}
                                                onChange={(e) => setEditData({...editData, phoneNumber:e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full flex items-start lg:items-center flex-col lg:flex-row gap-2 mt-3">
                                            <div className="w-full flex-1">
                                                <label className="text-sm text-gray-600 font-semibold">Country</label>
                                                <select className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base mt-2"
                                                value={editData.country}
                                                onChange={(e) => setEditData({...editData, country:e.target.value, state: "", city: ""})}
                                                >
                                                <option value="">Select Country</option>
                                                {countries.map((country) => (
                                                    <option key={country.name} value={country.isoCode}>
                                                        {country.name}
                                                    </option>
                                                ))}
                                                </select>
                                            </div>

                                            <div className="w-full flex-1">
                                                <label className="text-sm text-gray-600 font-semibold">State</label>
                                                <select className={`w-full p-3 border-2 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base mt-2 ${!editData.country ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" : "border-gray-300 cursor-pointer"}`}
                                                disabled={!editData.country}
                                                value={editData.state}
                                                onChange={(e) => setEditData({...editData, state:e.target.value, city: ""})}
                                                >
                                                <option value="">Select State (Pick a country to select state)</option>
                                                {states.map((state) => (
                                                    <option key={state.name} value={state.isoCode}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-start lg:items-center flex-col lg:flex-row gap-2 mt-3">
                                            <div className="w-full flex-1">
                                                <label className="text-sm text-gray-600 font-semibold">City</label>
                                                <select className={`w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base mt-2 ${!editData.state ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" : "border-gray-300 cursor-pointer"}`}
                                                disabled={!editData.state}
                                                value={editData.city}
                                                onChange={(e) => setEditData({...editData, city:e.target.value})}
                                                >
                                                <option value="">Select City (pick a state to select a city)</option>
                                                {cities.map((city) => (
                                                <option key={city.name} value={city.name}>
                                                    {city.name}
                                                </option>
                                                ))}
                                                </select>
                                            </div>
                                            <div className="w-full flex-1">
                                                <label className="text-sm text-gray-600 font-semibold">Delivery Address</label>
                                                <input type="text" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none outline-none focus:border-blue-500 font-[Cabin] text-base mt-2"
                                                value={editData.address}
                                                onChange={(e) => setEditData({...editData, address:e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className={`mt-4 bg-gray-800 text-white px-6 py-2 font-[Cabin] rounded-lg ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>{isLoading ? "Loading..." : "Save Change"}</button>
                                    </form>
                                </div>
                            ) : (
                            <div className="mt-3">
                                {isLoading ? (<div className="w-full h-[30px] flex items-center justify-center">
                                    <Loader />
                                </div>) : (<div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-[cabin] font-normal text-base text-[#212121d0]">Full Name:</p>
                                        <p className="font-[cabin] font-semibold text-base tracking-wide text-gray-700 capitalize">{userInfo?.name || "Not Provided"}</p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="font-[cabin] font-normal text-base text-[#212121d0]">Email:</p>
                                        <p className="font-[cabin] font-semibold text-base tracking-wide text-gray-700">{userInfo?.email || "Not Provided"}</p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="font-[cabin] font-normal text-base text-[#212121d0]">Phone Number:</p>
                                        <p className="font-[cabin] font-semibold text-base tracking-wide text-gray-700">{userInfo?.phoneNumber || "Not Provided"}</p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="font-[cabin] font-normal text-base text-[#212121d0] capitalize">Address:</p>
                                        <p className="font-[cabin] font-semibold text-base tracking-wide text-gray-700">{userInfo?.address || "Not Provided"}</p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="font-[cabin] font-normal text-base text-[#212121d0]">Country:</p>
                                        <p className="font-[cabin] font-semibold text-base tracking-wide text-gray-700 capitalize">{countryName}</p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="font-[cabin] font-normal text-base text-[#212121d0]">State:</p>
                                        <p className="font-[cabin] font-semibold text-base tracking-wide text-gray-700 capitalize">{stateName}</p>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <p className="font-[cabin] font-normal text-base text-[#212121d0]">City:</p>
                                        <p className="font-[cabin] font-semibold text-base tracking-wide text-gray-700 capitalize">{userInfo?.city || "Not Provided"}</p>
                                    </div>
                                </div>)}
                            </div>
                            )}
                        </div>
                    </>)}
                    <hr className="border-b border-gray-300 mt-3"/>
                    {/* order history and wishlist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-3">
                        <div className="w-full border rounded-lg border-gray-300 py-4 px-6 bg-[#f5f5f5]">
                            <h3 className="font-[Montserrat] font-semibold text-[#212121] text-xl flex items-center gap-2"><PiShoppingBagOpenDuotone size={24}/> My Orders</h3>
                            <p className="font-extrabold text-2xl font-[Cabin] mt-5">{String(orders.length).padStart("2", 0)}</p>
                            <p className="text-base font-[cabin] font-normal text-gray-600">Total orders placed</p>
                            <button onClick={toOrderHistory} className="text-white bg-[#1E2939] capitalize  text-sm tracking-wide cursor-pointer font-[cabin] w-full rounded-lg mt-5 py-2">View orders history</button>
                        </div>
                        <div className="w-full border rounded-lg border-gray-300 py-4 px-6 bg-[#f5f5f5]">
                            <h3 className="font-[Montserrat] font-semibold text-[#212121] text-xl flex items-center gap-2"><CiHeart size={24}/> My wishlist</h3>
                            <p className="font-extrabold text-2xl font-[Cabin] mt-5">{String(wishlistItems.length).padStart("2", 0)}</p>
                            <p className="text-base font-[cabin] font-normal text-gray-600">Item in wishlist</p>
                            <button onClick={toMyWishlist} className="text-white bg-[#1E2939] capitalize text-sm tracking-wide cursor-pointer font-[cabin] w-full rounded-lg mt-5 py-2">View wishlist</button>
                        </div>
                    </div>
                </div>
                )}

            </div>
        </section>
        <Footer />
    </>)
}
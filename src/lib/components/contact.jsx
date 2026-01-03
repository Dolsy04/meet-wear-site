import { React } from "react";
import { FaInstagram } from "react-icons/fa6";
import { RiTwitterXFill } from "react-icons/ri";
import { IoLogoWhatsapp } from "react-icons/io5";
import { MdLocalPhone, MdLocationPin, MdMailOutline} from "react-icons/md";
import { toast } from 'react-toastify';
import { db } from "../../firebase/config";
import { collection,  setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import Loader from "../ui/loader";
export default function Contact() {
    const [firstName, setFirstName] = useState("")
    const [otherName, setOtherName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleMessage = async (e) => {
        e.preventDefault();
        if(!firstName || !otherName || !email || !message){
            toast.info("Fields are required")
            return;
        }
        setLoading(true)
        const messageId = Date.now().toString();
        try{
            await setDoc(doc(db, "meet-wear-buyer-users-db", "contact", "message-db",  messageId),{
                firstName: firstName,
                otherName: otherName,
                email: email,
                message: message,
                type: "contact-message",
                sendAt: serverTimestamp()
            })
            toast.success("Message sent successfully!");
            setFirstName("")
            setOtherName("")
            setEmail("")
            setMessage("")
        }catch (error){
            toast.error("Could not sent message, try again later");
            console.log("Error sending message: ", error.message);
        }finally{
            setLoading(false)
        }
    }
    return (<>
        <section className="w-full bg-[#f5f5f5] my-10">
            <div className="w-[95%] mx-auto h-full py-10 flex flex-col lg:flex-row items-center justify-center lg:items-start gap-4">
                <div className="lg:w-[50%] w-full flex flex-col items-center lg:items-start gap-2">
                    <h2 className="font-[Montserrat] font-bold text-3xl text-[#212121]">Contact Us</h2>
                    <p className="font-[Montserrat] font-normal text-sm lg:text-left text-[#424242] md:w-[80%] w-full text-center lg:w-[60%]">Have questions or need assistance? We're here to help! Reach out to our support team and we'll get back to you as soon as possible.</p>

                    <div className="flex flex-col gap-3 my-8 md:w-[80%] w-full lg:w-[60%]">
                        <p className="flex items-center gap-2">
                            <MdLocationPin className="inline-block text-[#212121] text-lg" />
                            <span className="text-[#212121] font-[Cabin] text-base">
                                Alaba Junction abba road off igbona, Lagos, Nigeria
                            </span>
                        </p>
                        <p className="flex items-center gap-2">
                            <MdLocalPhone className="inline-block text-[#212121] text-lg" />
                            <a href="tel:+08156789091" className="text-[#212121] hover:underline font-[Cabin] text-base">+2348156789091</a>
                        </p>
                        <p className="flex items-center gap-2">
                            <MdMailOutline className="inline-block text-[#212121] text-lg" />
                            <a href="mailto:inquery@meetwear.com" className="text-[#212121] hover:underline font-[Cabin] text-base">inquery@meetwear.com</a>
                        </p>
                    </div>
                    <div className="flex lg:items-center md:w-[80%] w-full lg:w-[60%] items-start gap-4 lg:mt-6 mt-0">
                        <a href="https://www.instagram.com/meetwear" target="_blank" rel="noopener noreferrer" className="text-[#212121] text-2xl hover:text-[#1DA1F2]">
                            <FaInstagram />
                        </a>
                        <a href="https://twitter.com/meetwear" target="_blank" rel="noopener noreferrer" className="text-[#212121] text-2xl hover:text-[#1DA1F2]">
                            <RiTwitterXFill />
                        </a>
                        <a href="https://wa.me/2348156789091" target="_blank" rel="noopener noreferrer" className="text-[#212121] text-2xl hover:text-[#1DA1F2]">
                            <IoLogoWhatsapp />
                        </a>
                    </div>
                </div>
                <div className="lg:w-[50%] md:w-[80%] w-full flex flex-col items-center lg:items-start gap-4 lg:mt-0 mt-10">
                    <div>
                        <h3 className="font-[Montserrat] font-semibold text-xl text-[#212121]">Drop a message for us</h3>
                    </div>

                    <form className="w-full flex flex-col" onSubmit={handleMessage}>
                        {/* name */}
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mb-4 w-full">
                            {/* f-name */}
                            <div>
                                <label htmlFor="firstName" className="font-[Cabin] font-normal text-base">First Name</label>
                                <input disabled={loading} type="text" id="firstName" placeholder="Your First Name" className={`w-full h-10 font-[Cabin] text-base px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "text-gray-400" : "text-[#212121]"}`} value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                            </div>
                            {/* s-name */}
                            <div>
                                <label htmlFor="otherName" className="font-[Cabin] font-normal text-base">Other Name</label>
                                <input disabled={loading} type="text" id="otherName" value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="Your Other Name" className={`w-full h-10 font-[Cabin] text-base px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "text-gray-400" : "text-[#212121]"}`}/>
                            </div>
                        </div>
                        <div className="w-full h-auto mb-4">
                            <label htmlFor="email" className="font-[Cabin] font-normal text-base">Email</label>
                            <input disabled={loading} type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" className={`w-full h-10 font-[Cabin] text-base px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "text-gray-400" : "text-[#212121]"}`}/>
                        </div>
                        <div className="w-full h-auto">
                            <label htmlFor="message" className="font-[Cabin] font-normal text-base">Message</label>
                            <div className="w-full h-[100px]">
                                <textarea disabled={loading} type="text" id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type Your Message" className={`w-full h-full p-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none font-[Cabin] text-base resize-none ${loading ? "text-gray-400" : "text-[#212121]"}`}></textarea>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className={`mt-4 w-full h-10 rounded-md text-base text-white font-[Cabin] font-semibold transition-colors duration-300 ${loading ? "bg-blue-300 cursor-not-allowed hover:bg-blue-300" : "bg-blue-500 hover:bg-blue-700 cursor-pointer"}`}>{loading ? (<div className="w-full h-full flex items-center justify-center">
                            <Loader/>
                        </div>) : "Send Message"}</button>
                    </form>
                </div>
            </div>
        </section>
    </>)
}

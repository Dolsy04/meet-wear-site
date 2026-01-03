import { toast } from 'react-toastify';
import { db } from "../../firebase/config";
import { collection,  setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import Loader from "../ui/loader";

export default function NewsLetters() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleNewsLetter = async (e) => {
        e.preventDefault();
        if(!email){
            toast.info("Fields is required")
            return;
        }
        setLoading(true)
        const ID = Date.now().toString();
        try{
            await setDoc(doc(db, "meet-wear-buyer-users-db", "newsLetter", "newsLetter-db",  ID),{
                email: email,
                type: "newsLetter",
                sendAt: serverTimestamp()
            })
            toast.success("Email sent successfully!");
            setEmail("")
        }catch (error){
            toast.error("Could not sent message, try again later");
        }finally{
            setLoading(false)
        }
    }
    return (<>
        <section className="w-full bg-[#f5f5f5] my-10">
            <div className="w-[95%] mx-auto h-full py-10 flex flex-col items-center gap-4">
                <h2 className="font-[Montserrat] font-bold text-3xl text-[#212121] text-center">Subscribe to our Newsletter</h2>
                <p className="font-[Montserrat] font-normal text-sm text-center text-[#424242] w-full lg:w-[60%]">Stay updated with the latest news, exclusive offers, and special promotions directly in your inbox. Join our newsletter today!</p>
                <div className="w-full flex items-center justify-center lg:flex-row flex-col">
                    <form onSubmit={handleNewsLetter} className="w-full flex items-center justify-center lg:flex-row flex-col">
                        <input disabled={loading} type="email" placeholder="Enter your email address" className={`w-full lg:w-[40%] h-10 px-4 border border-gray-300 rounded-lg lg:rounded-l-md lg:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "text-gray-400" : "text-[#212121]"}`}  value={email} onChange={(e) => setEmail(e.target.value)} />
                        <button disabled={loading} type="submit" className={`h-10 text-white px-6 rounded-lg lg:rounded-r-md lg:rounded-l-none transition-colors duration-300 lg:mt-0 mt-2 ${loading ? "bg-blue-300 cursor-not-allowed hover:bg-blue-300" : "bg-blue-500 cursor-pointer hover:bg-blue-700"}`}>{loading ? "Loading..." : "Subscribe"}</button>
                    </form>
                </div>
            </div>
        </section>
    </>)
}
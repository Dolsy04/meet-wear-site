import { GiConverseShoe } from "react-icons/gi";
import { useState, useEffect } from "react";
import {useNavigate, Link} from "react-router-dom";
import { toast } from 'react-toastify';
import { db, auth } from "../firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail} from "firebase/auth";
import { collection, setDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { BiArrowBack } from "react-icons/bi";
export default function Registered(){
    const [registerationMode, setRegisterationMode] = useState(false);
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [resetEmail, setResetEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const Navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);


    const signupUser = async (e) => {
        e.preventDefault();
        if(!name || !email || !password || (registerationMode && !confirmPassword)){
            toast.error("Please fill in all the fields.");
            return;
        }
        if(registerationMode && password !== confirmPassword){
            toast.error("Passwords do not match.");
            return;
        }
        setLoading(true);
        toast.loading("Registering user...");
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "meet-wear-buyer-users-db", user.uid), {
                name: name,
                email: email,
                phone: "",
                role: "buyer",
                createdAt: serverTimestamp()
            });
            toast.dismiss();
            toast.success("User registered successfully!", {autoClose: 2000});
            clearinputs();

            setTimeout(()=>{
                Navigate("/")
            },2000)
        } catch (error) {
            toast.dismiss()
            toast.error("Error registering user: " + error.message);
            console.log("Error registering user: ", error);
        }finally {
            setLoading(false);
        }
    }


    const logInUser = async (e) => {
        e.preventDefault();

        if (!email || !password) {
        toast.error("Please fill in all the fields.");
        return;
        }

        setLoading(true);
        const toastId = toast.loading("Signing in...");

        try {
        const userInfo = await signInWithEmailAndPassword(auth, email, password);
        const user = userInfo.user;
        
        const userDocRef = doc(db, "meet-wear-buyer-users-db", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
           const userData = userDoc.data();

           if(userData.role === "buyer"){
            // User is authorized as a buyer
             toast.update(toastId, {
                    render: "Login successful!",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });

                clearinputs();

                setTimeout(() => {
                    Navigate("/");
                }, 2000);
            }else{
                throw new Error("Unauthorized access. This account is not registered as a buyer.");
            }
        }else{
            throw new Error("No user data found!");
            await signOut(auth);
        }
        } catch (error) {
        toast.update(toastId, {
            render: error.message,
            type: "error",
            isLoading: false,
            autoClose: 3000,
        });
        } finally {
        setLoading(false);
        }
    };

    const forgotPassword = async (e) => {
        e.preventDefault();

        if (!resetEmail) {
            toast.error("Please enter your email address.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Sending password reset email...");

        try {
            await sendPasswordResetEmail(auth, resetEmail);

            toast.update(toastId, {
                render: "Password reset email sent! Check your inbox.",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
            setResetEmail("")
            setOpenModal(false);
            clearinputs();
        } catch (error) {
            toast.update(toastId, {
                render: error.message,
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const clearinputs = () => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    return(<>
        <section className="w-full h-screen flex items-center flex-col gap-6 justify-center bg-[#f5f5f5]">
            <div className="w-full h-full py-4 overflow-y-auto flex items-center flex-col justify-center bg-[#f5f5f5]">
                <div className="w-full flex items-center justify-center gap-1">
                    <h1 className="text-4xl font-bold tracking-wider font-[Cabin]">
                        <span className="text-black">M</span>
                        <span className="text-red-600">W</span>
                    </h1>
                    <GiConverseShoe size={34}/>
                </div>

                <div className="w-[90%] md:w-[50%] lg:w-[30%] bg-white p-6 rounded-md shadow-md">
                    <div>
                        <h1 className="text-2xl text-[#212121] font-bold font-[Montserrat]">{registerationMode ? "Create an account" : "Welcome back !"}</h1>
                        <p className="text-sm text-[#757575] font-[Montserrat] mb-4">{registerationMode ? "Please fill in the details to create an account." : "Please login to your account."}</p>
                    </div>

                    <div className="w-full">
                        <form className="w-full flex flex-col gap-3" onSubmit={registerationMode ? signupUser : logInUser}>
                            <div className={`${registerationMode ? "block" : "hidden"}`}>
                                <label className="font-sm font-[Cabin] tracking-wider font-normal" htmlFor="name">Name</label> <br />
                                <input disabled={loading} className={`w-full h-8 border border-gray-300 px-2 rounded-md font-[Cabin] text-sm outline-0 focus:border-blue-600 ${loading ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-[#212121]"}`} type="text" id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}/>
                            </div>

                            <div>
                                <label className="font-sm font-[Cabin] tracking-wider font-normal" htmlFor="email">Email</label> <br />
                                <input disabled={loading} className={`w-full h-8 border border-gray-300 px-2 rounded-md font-[Cabin] text-sm outline-0 focus:border-blue-600 ${loading ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-[#212121]"}`} type="email" id="email" placeholder="your@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>

                            <div>
                                <label className="font-sm font-[Cabin] tracking-wider font-normal" htmlFor="password">Password</label> <br />
                                <input disabled={loading} className={`w-full h-8 border border-gray-300 px-2 rounded-md font-[Cabin] text-sm outline-0 focus:border-blue-600 ${loading ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-[#212121]"}`} type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>

                            <div className={`${registerationMode ? "block" : "hidden"}`}>
                                <label className="font-sm font-[Cabin] tracking-wider font-normal" htmlFor="cPassword">Confirm Password</label> <br />
                                <input disabled={loading} className={`w-full h-8 border border-gray-300 px-2 rounded-md font-[Cabin] text-sm outline-0 focus:border-blue-600 ${loading ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-[#212121]"}`} type="password" id="cPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                            </div>

                            <div className={`${registerationMode ? "hidden" : "block"}`}>
                                <span onClick={()=> {setOpenModal(true), clearinputs()}} className="text-sm font-[cabin] text-blue-500 cursor-pointer">Forgotten Password</span>
                            </div>

                            <button disabled={loading} type="submit" className={`w-full text-white font-[Montserrat] font-semibold text-base py-2 rounded-md hover:bg-[#333333] transition-colors duration-300 ${loading ? "cursor-not-allowed bg-[#58585886]" : "bg-[#212121] cursor-pointer"}`}>{registerationMode ? "Register" : "Login"}</button>

                            <p className="font-[Montserrat] font-normal text-sm text-center text-[#757575]">{registerationMode ? "Already have an account?" : "Don't have an account?"} 
                            <span onClick={() => {setRegisterationMode(!registerationMode), clearinputs()}} className="text-blue-600 cursor-pointer hover:underline">{registerationMode ? "Login here" : "Register here"}</span></p>
                        </form>
                    </div>
                </div>

                <Link to="/" className="flex items-center justify-center mt-2 gap-1 text-sm font-[cabin] text-blue-600">
                    <BiArrowBack />
                    <span className="">Go Back</span>
                </Link>
            </div>

        </section>

        {openModal && (<>
            <div className="w-full h-screen fixed top-0 left-0 bg-white bg-opacity-50 bg-blur-2xl flex items-center justify-center flex-col gap-4 z-50">
                <div className="w-full flex items-center justify-center gap-1">
                    <h1 className="text-4xl font-bold tracking-wider font-[Cabin]">
                        <span className="text-black">M</span>
                        <span className="text-red-600">W</span>
                    </h1>
                    <GiConverseShoe size={34}/>
                </div>
                <div className="w-[90%] md:w-[50%] lg:w-[30%] bg-white p-6 rounded-md shadow-md">
                    <h2 className="text-xl font-bold mb-4 font-[Montserrat]">Password Reset</h2>
                    <p className="text-sm text-[#757575] font-[Montserrat] mb-4">Enter your registered email address to receive a password reset link.</p>
                    <form onSubmit={forgotPassword} className="flex flex-col gap-3">
                        <input disabled={loading} type="email" className="w-full h-8 border border-gray-300 px-2 rounded-md font-[Cabin] text-sm outline-0 focus:border-blue-600" value={resetEmail} onChange={(e)=> setResetEmail(e.target.value)}/>
                        <button type="submit" disabled={loading} className={`w-full h-10 rounded-lg font-[cabin] text-white  ${loading ? "cursor-not-allowed bg-zinc-400" : "cursor-pointer bg-[#212121]"}`}>Reset Password</button>
                    </form>
                    <button onClick={()=> {setOpenModal(false), clearinputs()}} className="w-full cursor-pointer flex items-center justify-center mt-2 gap-1 text-sm font-[cabin] text-blue-600">
                    <BiArrowBack />
                    <span className="">Go Back</span>
                    </button> 
                </div>
            </div>
        </>)}
    </>)
}




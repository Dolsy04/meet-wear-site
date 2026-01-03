import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [checkAuth, setCheckAuth] = useState(null);
    const [loading, setLoading] = useState(true);


     useEffect(()=>{
        const notLoggedIn = onAuthStateChanged(auth, (user)=>{
            setCheckAuth(user);
            setLoading(false);
        });

        return ()=> notLoggedIn();
    }, []);



    return (
        <AuthContext.Provider value={{checkAuth, loading}}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const context = useContext(AuthContext);
     if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
"use client"

import { createContext, useState, useContext, useCallback, ReactNode } from "react";
import { User } from "@/types/User"

interface AuthContextType {
    isAuthenticated: boolean;
    setLoginState: (userData:User) => void;
    setLogoutState: () => void;
    user: User | null | undefined;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User|null|undefined>(null);


    const setLoginState = useCallback((userData:User) =>{
        setIsAuthenticated(true);
        setUser(userData);
    }, [])
    const setLogoutState = useCallback(() =>{
        setIsAuthenticated(false);
        setUser(null);
    }, [])

    const value ={
        isAuthenticated,
        setLoginState,
        setLogoutState,
        user
    }
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () =>{
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context
}
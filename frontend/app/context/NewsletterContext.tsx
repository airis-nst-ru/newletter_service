"use client"

import { createContext, useState, useContext, ReactNode } from "react";
import { Newsletter } from "@/types/Newsletter";

export interface INewsletterContext{
    data : Newsletter | undefined;
}

export const NewsletterContext = createContext<Newsletter | undefined>(undefined)

export const NewsletterProvider = ({children}: {children: ReactNode}) =>{
    return (
        <NewsletterContext.Provider value={undefined}>
            {children}
        </NewsletterContext.Provider>
    )
}

export const useNewsletter = () =>{
    const context = useContext(NewsletterContext)
    if (!context) {
        throw new Error("useNewsletter must be used within NewsletterProvider");
    }
    return context
}
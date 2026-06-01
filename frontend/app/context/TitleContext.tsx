// TitleContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

interface ITitleContext{
  pageTitle : string,
  setPageTitle : (pageTitle : string) => void
}

export function TitleProvider({ children }: { children: React.ReactNode }) {
    const [pageTitle, setPageTitle] = useState("Airis Chronicle");

  return (
    <TitleContext.Provider value={{setPageTitle, pageTitle}}>
      {children}
    </TitleContext.Provider>
  );
}

const TitleContext = createContext<ITitleContext | undefined>(undefined);

export function useTitle() {
    const context = useContext(TitleContext);
    if (!context){
        throw new Error("useTitle must be used within TitleProvider");
    }
  return context;
}
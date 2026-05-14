"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

function Home() {
    const router = useRouter();
    return(
        <div className="bg-[rgba(255, 255, 255, 0.04)] w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-center">AIRIS Chronicle</h1>
        <p className="text-xl text-center">The official newsletter service by AIRIS.</p>
        <div className="border border-white rounded-lg px-6 py-4">
            <p className="text-2xl font-semibold text-center p-4">Login</p>
            <div className="flex gap-4 items-center justify-between p-4">
                <label htmlFor="email">Email:</label>
                <input type="text" placeholder="Enter your email" name="email"  className="border border-white py-2 px-3 rounded-lg bg-transparent"/>
            </div>
            <div className="flex gap-4 items-center justify-between p-4">
                <label htmlFor="password">Password:</label>
                <input type="password" placeholder="Enter your password" name="password"  className="border border-white py-2 px-3 rounded-lg bg-transparent"/>
            </div>
            <div className="flex items-center justify-end p-4">
                <Button buttonName="Login" onClick={() => { }} buttonType="Primary" className="w-full cursor-pointer"/>
            </div>

        </div>
    </div>
    )
}

export default Home;
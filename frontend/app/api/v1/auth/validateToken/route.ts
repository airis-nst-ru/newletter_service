// app/api/v1/auth/validateToken/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function GET(){
    try{
        const cookieStore = await cookies()
        const token = cookieStore.get("token");

        if(!token){
            return NextResponse.json(
                {
                    success:false,
                    message:"Token is not found"
                },
                { status: 404 }
            )
        }

        const decodedToken = jwt.verify(token.value, process.env.JWT_SECRET!)

        if(!decodedToken){
            return NextResponse.json(
                {
                    success:false,
                    message:"Token is not valid"
                },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success:true,
                message:"Token is valid",
                data:decodedToken
            },
            { status: 200 }
        )
        
    }catch(error){
        console.log(error)
        return NextResponse.json(
            {
                success:false,
                message:"Token is not valid"
            },
            { status: 401 }
        )
    }
}
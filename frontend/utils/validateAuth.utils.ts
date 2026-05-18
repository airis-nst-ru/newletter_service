import type {User} from "@/types/User"

export async function checkToken(){
    const response = await fetch("/api/v1/auth/validateToken")
    const data = await response.json()
    return data
}

export async function validateAuth(){
    try{
        const data = await checkToken()
        if(data.success){
            const user : User = {
                id : data.data?.id,
                email : data.data?.email,
                username : data.data?.username,
                accountType : data.data?.accountType
            }
            return user
        }
        return false
    }catch(err){
        console.error(err)
        return false
    }
}

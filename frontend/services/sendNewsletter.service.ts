import { prisma } from "@/lib/prisma";

// Caution: this is an extremely sensitive function which sends emails to all the recipients in the database. Double check the 
// changes before pushing to production. Also, make sure to test it thoroughly in the staging environment before deploying to 
// production. Always use a test email list when testing this function to avoid spamming real users.
export async function sendNewsletter(apiKey: string, editionNumber: string, emails: string[]) {
    
    let recipients : string[];
    if (!emails?.length) {
        recipients = await getAllEmails();
    } else {
        recipients = emails.filter((email) => email.trim());
    }

    const { subject, newsLetterContents } = await getSubjectAndContentOfNewsletter(editionNumber);

    const response = await fetch(`${process.env.LOCAL_BACKEND_URL}/api/v1/email/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        },
        body: JSON.stringify({
            recipients,
            newsLetterContents,
            subject
        })
    })

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send newsletter");
    }

    const data = await response.json();
    return data;
}


export async function getAllEmails(): Promise<string[]> {
    const recipients = await prisma.recipients.findMany({
        where: {
            isSubscribed: true
        }, select: {
            email: true
        }
    })
    // convert the recipcipents to an array of emails from array of objects of emails.
    // TODO: fix the backend to use the array of objects of emails
    const emails = recipients.map(
        (recipient) => recipient.email
    );
    return emails;
}

export async function getSubjectAndContentOfNewsletter(editionNumber: string){
    if (!editionNumber) {
        throw new Error("Edition number is required");
    }
    const newsletter = await prisma.newsletter.findFirst({
        where:{
            editionNumber: parseInt(editionNumber)
        },
        include:{
            content: true
        }
    })
    if(!newsletter){
        throw new Error("Newsletter not found for the given edition number");
    }
    
    const subject = newsletter.content?.title;
    const newsLetterContents = newsletter.content?.content;
    return { subject, newsLetterContents };
}
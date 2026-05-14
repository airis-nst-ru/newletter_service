type ButtonProps = {
    onClick: () => void;
    buttonType: "Primary" | "Secondary" | "Destructive";
    buttonName: string;
    className?: string;
}

function button({ buttonName, onClick, buttonType = "Primary", className = "" }: ButtonProps) {

    if (buttonType === "Primary") {
        return (
            <button onClick={onClick} className={`${className} bg-[#B654A7] text-white px-4 py-2 rounded-lg font-medium`}>{buttonName}</button>
        )
    }
    else if (buttonType === "Secondary") {
        return (
            <button onClick={onClick} className={`${className} bg-gray-500 text-white px-4 py-2 rounded-lg font-medium`}>{buttonName}</button>
        )
    }
    else if (buttonType === "Destructive") {
        return (
            <button onClick={onClick} className={`${className} bg-red-500 text-white px-4 py-2 rounded-lg font-medium`}>{buttonName}</button>
        )
    }
}

export default button
type ButtonProps = {
    onClick: () => void;
    buttonType: "Primary" | "Secondary" | "Destructive";
    buttonName: string;
    className?: string;
    onKeyDown?:(e:React.KeyboardEvent<HTMLButtonElement>)=>void;
}

function button({ buttonName, onClick, buttonType = "Primary", className = "" ,onKeyDown}: ButtonProps) {

    if (buttonType === "Primary") {
        return (
            <button onClick={onClick} onKeyDown={onKeyDown} className={`${className} bg-[#B654A7] text-white px-4 py-2 rounded-lg font-medium`}>{buttonName}</button>
        )
    }
    else if (buttonType === "Secondary") {
        return (
            <button onClick={onClick} onKeyDown={onKeyDown} className={`${className} bg-gray-500 text-white px-4 py-2 rounded-lg font-medium`}>{buttonName}</button>
        )
    }
    else if (buttonType === "Destructive") {
        return (
            <button onClick={onClick} onKeyDown={onKeyDown} className={`${className} bg-red-500 text-white px-4 py-2 rounded-lg font-medium`}>{buttonName}</button>
        )
    }
}

export default button
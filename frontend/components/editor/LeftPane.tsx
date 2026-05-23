export default function LeftPane({children}: {children: React.ReactNode}) {
    return (
        <div className="w-1/4 border-r p-4">
            <h2 className="text-xl font-bold mb-4">Components</h2>
            {children}
        </div>
    )
}
function ComponentCard({children}: {children: React.ReactNode}) {
    return (
        <div className="border rounded-lg p-4 shadow-sm flex flex-col gap-4 border-[#B654A7]">
            {children}
        </div>
    )
}

export default ComponentCard
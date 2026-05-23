
function InputBox({ label, placeholder, value, onChange, className }: { label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void , className?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={label.toLowerCase().replace(" ", "-")}>{label}</label>
      <input 
        className={`${className} border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#ffffff]`}
        id={label.toLowerCase().replace(" ", "-")} 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default InputBox
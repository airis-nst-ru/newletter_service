"use client"
import{ useState } from 'react'
import InputBox from "@/components/ui/InputBox";
import ComponentCard from "@/components/ui/ComponentCard";

function Header() {
  const [title, setTitle] = useState('')
  return (
    <ComponentCard>
      <h1 className="text-2xl font-bold">Newsletter Header</h1>
      <InputBox
        label="Newsletter Title"
        placeholder="Enter newsletter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </ComponentCard>
  )
}

export default Header

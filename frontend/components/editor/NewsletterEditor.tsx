import React from "react";

// layout components
import LeftPane from "@/components/editor/LeftPane";

// newsletter editor component
import Header from "@/components/template/Header";

function NewsletterEditor() {
  return (
    <div className="flex">
      <LeftPane>
        <Header />
      </LeftPane>
    </div>
  )
}

export default NewsletterEditor

import { useState } from "react"
import Sidebar from "../Dashboard/Sidebar"
import ReviewsManagement from "./ReviewsManagement"

const Reviews = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="h-full shrink-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex flex-col flex-1 h-full overflow-y-auto">
        <ReviewsManagement onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  )
}

export default Reviews

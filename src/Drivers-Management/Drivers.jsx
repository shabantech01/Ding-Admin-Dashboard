import Sidebar from "../Dashboard/Sidebar"
import { useState } from "react"
import DriverManagement from "./DriverManagement"

const Drivers = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <div className="h-full shrink-0">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>
            <div className="flex flex-col flex-1 h-full overflow-y-auto">
                <DriverManagement onMenuClick={() => setSidebarOpen(true)} />
            </div>
        </div>
    )
}

export default Drivers
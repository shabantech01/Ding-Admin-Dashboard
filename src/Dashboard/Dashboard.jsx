import { useState } from "react"
import Sidebar from "../Dashboard/Sidebar"
import Dashboard from "./DashboardData"

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex w-full h-screen overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 h-full overflow-y-auto">
                <Dashboard onMenuClick={() => setSidebarOpen(true)} />
            </div>
        </div>
    )
}

export default AdminDashboard
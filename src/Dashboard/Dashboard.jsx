import Sidebar from "./Sidebar"

const Dashboard = () => {
    return (
        <div className="flex w-full h-screen">
            <div className="h-full shrink-0">
                <Sidebar/>
            </div>
            <div className="flex-1 p-4">
                <p>Dashboard</p>
            </div>
        </div>
    )
}

export default Dashboard
import Sidebar from "../Dashboard/Sidebar"
import OrderManagement from "./OrderOversight"

const Orders = () => {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <div className="h-full shrink-0">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 h-full overflow-y-auto">
                <OrderManagement />
            </div>
        </div>
    )
}

export default Orders
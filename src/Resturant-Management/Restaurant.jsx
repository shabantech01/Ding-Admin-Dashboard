import Sidebar from "../Dashboard/Sidebar"
import RestaurantManagement from "./RestaurantManagement"

const Restaurants = () => {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <div className="h-full shrink-0">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 h-full overflow-y-auto">
                <RestaurantManagement />
            </div>
        </div>
    )
}

export default Restaurants
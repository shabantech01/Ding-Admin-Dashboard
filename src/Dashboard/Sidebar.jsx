import { NavLink } from "react-router-dom"
import home from "../assets/home.svg"
import users from "../assets/users.svg"
import resturant from "../assets/resturant.svg"
import drivers from "../assets/drivers.svg"
import orders from "../assets/orders.svg"
import logo from "../assets/logo.png"

const Sidebar = () => {
    const sidebarData = [
        { image: home, title: "Dashboard", path: "/dashboard" },
        { image: users, title: "Users", path: "/users" },
        { image: resturant, title: "Restaurants", path: "/restaurant" },
        { image: drivers, title: "Drivers", path: "/drivers" },
        { image: orders, title: "Orders", path: "/orders" },
    ]

    const currentUser = {
        name: "Rayden Cole",
        email: "rayden.colex@gmail.com",
    }

    const getInitials = (name) =>
        name
            .split(" ") 
            .map((word) => word[0])
            .join("")
            .toUpperCase()

    return (
        <div className="flex flex-col w-[239px] h-full bg-[##FAFAFA] border-r border-[#EDEDED] py-6">
            <img src={logo} alt="Ding logo" className="w-28 sm:w-32 h-auto self-center mb-8" />

            <nav className="flex flex-col gap-1 px-4 flex-1">
                {sidebarData.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm sm:text-base transition-colors ${
                                isActive
                                    ? "bg-[#765AB8] text-white font-semibold"
                                    : "text-[#5C5C5C] hover:bg-[#F9F9F9]"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <img
                                    src={item.image}
                                    alt=""
                                    className={`w-5 h-5 ${isActive ? "brightness-0 invert" : ""}`}
                                />
                                <span>{item.title}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="flex items-center gap-3 px-4 pt-4 border-t border-[#EDEDED] mt-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#765AB8] text-white text-xs font-semibold shrink-0">
                    {getInitials(currentUser.name)}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-[#000000] truncate">
                        {currentUser.name}
                    </p>
                    <p className="text-xs text-[#8C8C8C] truncate">
                        {currentUser.email}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
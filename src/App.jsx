import Dashboard from './Dashboard/Dashboard'
import Drivers from './Drivers-Management/Drivers'
import Login from './Login/Login'
import Orders from './Orders-Oversight/Orders'
import Restaurants from './Resturant-Management/Restaurant'
import Users from './User-Management/Users'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login/>
    },
    {
      path: "/users",
      element: <Users/>
    },
    {
      path: "/dashboard",
      element: <Dashboard/>
    },
    {
      path: "/restaurant",
      element: <Restaurants/>
    },
    {
      path: "/drivers",
      element: <Drivers/>
    },
    {
      path: "/orders",
      element: <Orders/>
    }
  ])

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App

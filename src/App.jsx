import AdminDashboard from './Dashboard/Dashboard'
import Drivers from './Drivers-Management/Drivers'
import Login from './Login/Login'
import Orders from './Orders-Oversight/Orders'
import Restaurants from './Resturant-Management/Restaurant'
import Users from './User-Management/Users'
import ProtectedRoute from './ProtectedRoutes'
import OfflineBanner from './components/OfflineBanner'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />
    },
    {
      path: "/users",
      element: (
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      )
    },
    {
      path: "/restaurants",
      element: (
        <ProtectedRoute>
          <Restaurants />
        </ProtectedRoute>
      )
    },
    {
      path: "/drivers",
      element: (
        <ProtectedRoute>
          <Drivers />
        </ProtectedRoute>
      )
    },
    {
      path: "/orders",
      element: (
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      )
    }
  ])

  return (
    <>
      <OfflineBanner />
      <RouterProvider router={router} />
    </>
  )
}

export default App
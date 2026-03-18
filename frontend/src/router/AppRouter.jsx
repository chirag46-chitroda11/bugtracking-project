import { BrowserRouter, Routes, Route } from "react-router-dom"
import Register from "../pages/Register"

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
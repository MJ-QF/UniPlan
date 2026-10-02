import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-layout-content">
        <Outlet />
      </main>
    </div>
  );
}
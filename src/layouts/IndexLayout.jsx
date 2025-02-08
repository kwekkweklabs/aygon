import { Outlet } from "react-router";

export default function IndexLayout() {
  return (
    <div className="bg-black font-poppins">
      <Outlet />
    </div>
  );
}

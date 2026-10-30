import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileQuestion, CheckCircle, XCircle, BarChart3, PlugZap } from "lucide-react";

const Sidebar = () => {
  const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/questions", label: "Questions", icon: FileQuestion },
    { to: "/ai-validation", label: "AI Validation", icon: CheckCircle },
    { to: "/failed-questions", label: "Failed Questions", icon: XCircle },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/settings", label: "AI Integration", icon: PlugZap },
  ];
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900 leading-tight">iLearn AI Question Validator</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold" : "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

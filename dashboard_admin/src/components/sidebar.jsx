import { NavLink } from "react-router-dom"

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: "▦",
  },
  {
    name: "Users",
    path: "/users",
    icon: "♙",
  },
  {
    name: "Agents",
    path: "/agents",
    icon: "✦",
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: "✓",
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: "▥",
  },
  {
    name: "Logs",
    path: "/logs",
    icon: "≡",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "⚙",
  },
]

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-slate-800 bg-slate-950">

      {/* LOGO */}

      <div className="border-b border-slate-800 px-5 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            AI
          </div>

          <div>
            <h1 className="text-sm font-semibold text-white">
              Agentic AI
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Admin Dashboard
            </p>
          </div>

        </div>

      </div>


      {/* MENU */}

      <nav className="flex-1 space-y-1 px-3 py-5">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              [
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              ].join(" ")
            }
          >

            <span className="flex w-5 items-center justify-center text-sm">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>

          </NavLink>

        ))}

      </nav>


      {/* BOTTOM PROFILE */}

      <div className="border-t border-slate-800 p-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            A
          </div>

          <div className="min-w-0 flex-1">

            <p className="truncate text-xs font-semibold text-white">
              Admin
            </p>

            <p className="truncate text-[10px] text-slate-500">
              admin@example.com
            </p>

          </div>

        </div>

      </div>

    </aside>
  )
}

export default Sidebar
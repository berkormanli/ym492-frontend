"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BrainCircuit, Database } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Dataset",
      href: "/admin/dataset",
      icon: Database,
    },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-emerald-600" />
          <span className="font-bold text-xl">MRI Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>


    </div>
  )
}

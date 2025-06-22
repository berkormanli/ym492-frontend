"use client"

import type React from "react"

import { AdminNav } from "@/components/admin/nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Always show the admin layout - no authentication required
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminNav />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}

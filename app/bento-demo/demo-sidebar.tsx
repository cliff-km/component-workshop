"use client"

import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { useBentoGrid } from "@/components/scroll-bento"

export function DemoSidebar({ count }: { count: number }) {
  const { scrollTo } = useBentoGrid()
  return (
    <Sidebar className="p-2">
      <SidebarMenu>
        {Array.from({ length: count }, (_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton onClick={() => scrollTo(String(i + 1))}>
              {i + 1}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  )
}

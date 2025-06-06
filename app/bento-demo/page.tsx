import { BentoGridProvider, BentoGrid, BentoBox } from "@/components/scroll-bento"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DemoSidebar } from "./demo-sidebar"

export default function BentoDemoPage() {
  const boxes = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1) }))
  const colors = [
    "bg-red-300",
    "bg-blue-300",
    "bg-green-300",
    "bg-yellow-300",
    "bg-purple-300",
    "bg-pink-300",
    "bg-orange-300",
  ]

  return (
    <BentoGridProvider>
      <SidebarProvider defaultOpen>
        <div className="flex h-svh">
          <DemoSidebar count={boxes.length} />
          <div className="flex-1 overflow-hidden p-4">
            <BentoGrid rows={4} className="h-full min-w-max" style={{ scrollSnapType: "x mandatory" }}>
              {boxes.map((box, idx) => (
                <BentoBox
                  key={box.id}
                  id={box.id}
                  rowSpan={(idx % 3) + 1}
                  colSpan={idx % 2 === 0 ? 2 : 1}
                  className={`${colors[idx % colors.length]} flex items-center justify-center rounded-md text-xl font-bold min-w-32 min-h-20`}
                >
                  {box.id}
                </BentoBox>
              ))}
            </BentoGrid>
          </div>
        </div>
      </SidebarProvider>
    </BentoGridProvider>
  )
}

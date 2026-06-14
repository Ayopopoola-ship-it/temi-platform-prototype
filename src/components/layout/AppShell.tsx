import { useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  EXPERIENCE_BASE,
  EXPERIENCE_LANDING,
  usePersona,
} from "@/context/PersonaContext"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { GroupSidebar } from "./GroupSidebar"
import { EntitySidebar } from "./EntitySidebar"
import { TopHeader } from "./TopHeader"

/**
 * The adaptive app shell (CLAUDE.md §5 - three experiences, one shell). The
 * sidebar and content switch on the active persona's experience, and the route
 * is kept in sync with the persona so the whole console changes on switch.
 */
export function AppShell() {
  const { persona } = usePersona()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const hasSidebar = persona.experience !== "customer"

  // Keep the route in sync with the active persona. Switching persona (or
  // landing on a foreign URL) redirects to that experience's landing page.
  if (!location.pathname.startsWith(EXPERIENCE_BASE[persona.experience])) {
    return <Navigate to={EXPERIENCE_LANDING[persona.experience]} replace />
  }

  const renderSidebar = (onNavigate?: () => void) =>
    persona.experience === "group" ? (
      <GroupSidebar onNavigate={onNavigate} />
    ) : (
      <EntitySidebar onNavigate={onNavigate} />
    )

  return (
    <div className="flex min-h-svh flex-col bg-fcmb-offwhite">
      <TopHeader hasSidebar={hasSidebar} onMenuClick={() => setMobileOpen(true)} />

      <div className="flex flex-1">
        {hasSidebar && (
          <>
            {/* Desktop sidebar */}
            <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 border-r border-border lg:block">
              {renderSidebar()}
            </aside>

            {/* Mobile sidebar drawer */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetContent
                side="left"
                className="w-72 gap-0 p-0 sm:max-w-72"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Primary navigation for the console.
                </SheetDescription>
                {renderSidebar(() => setMobileOpen(false))}
              </SheetContent>
            </Sheet>
          </>
        )}

        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

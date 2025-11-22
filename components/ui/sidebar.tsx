import * as React from "react"
import { cn } from "@/lib/utils"

type SidebarState = 'expanded' | 'collapsed'

const SidebarContext = React.createContext<{
  isMobile: boolean;
  state: SidebarState;
  toggleSidebar: () => void;
}>({ isMobile: false, state: 'expanded', toggleSidebar: () => {} })

const SidebarProvider = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => {
  const [isMobile, setIsMobile] = React.useState(false)
  const [state, setState] = React.useState<SidebarState>('expanded')
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => setState((s) => (s === 'expanded' ? 'collapsed' : 'expanded'))

  return (
    <SidebarContext.Provider value={{ isMobile, state, toggleSidebar }}>
      <div style={style}>{children}</div>
    </SidebarContext.Provider>
  )
}

const useSidebar = () => React.useContext(SidebarContext)

const Sidebar = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & any) => (
  <aside className={cn("border-r bg-sidebar", className)} {...props}>{children}</aside>
)

const SidebarHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-4", className)}>{children}</div>
)

const SidebarContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex-1 overflow-auto", className)}>{children}</div>
)

const SidebarFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-4 border-t", className)}>{children}</div>
)

const SidebarInset = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <main className={cn("flex-1 overflow-auto", className)}>{children}</main>
)

const SidebarMenu = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <nav className={cn("space-y-1", className)}>{children}</nav>
)

const SidebarMenuItem = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("", className)}>{children}</div>
)

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
  tooltip?: string;
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
      className
    )}
    {...props}
  />
))
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("p-2 rounded-md hover:bg-accent", className)}
    {...props}
  />
))
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}



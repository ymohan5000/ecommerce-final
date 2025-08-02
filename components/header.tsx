import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Package, SearchIcon } from "lucide-react";
import Link from "next/link";
import type React from "react";
import CartDrawer from "./cart-drawer";

export default function Header({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 m-auto">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <span className="font-extrabold text-2xl text-gray-900">Ecom-shop</span>
          <span className="text-xl font-semibold text-gray-900"></span>
        </Link>
        <div className="relative flex-1 max-w-md mx-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          />
        </div>
        <nav className="flex items-center gap-4">
          {!user ? (
            <Link href="/login" passHref>
              <Button variant="ghost" className="flex font-semibold  items-center gap-2">
                <LogIn className="h-[24px!important] w-[24px!important] " />
                Login
              </Button>
            </Link>
          ) : user.role === "admin" ? (
            <>
              <Link href="/dashboard" passHref>
                <Button variant="ghost" className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
              <Button onClick={logout} variant="ghost" className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline font-medium">
                      {user.email?.split("@")[0] || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}

// src/otherComponents/navBar.jsx
import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-200">
              <Leaf className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              WASTELESS
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700"
          >
            TEAM Zero0ne
          </Badge>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
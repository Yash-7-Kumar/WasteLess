import React from 'react';
import { Leaf } from 'lucide-react';
import TeamLogo from '../assets/TeamLogo.svg'

function NavBar() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600">
                <Leaf className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-gray-900 leading-tight">
                    WASTELESS
                </span>
            </div>
            <div className="flex text-lg font-bold self-center">
                TEAM Zero0ne 
            </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
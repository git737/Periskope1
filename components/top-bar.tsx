'use client';

import { Button } from "@/components/ui/button";
import { RefreshCcw, HelpCircle } from "lucide-react";
import { LuMessageCircleMore } from "react-icons/lu";
import { VscDesktopDownload } from "react-icons/vsc";
import { MdInstallDesktop } from "react-icons/md";
import { FaBellSlash } from "react-icons/fa6";
import { FcTodoList } from "react-icons/fc";
import { IoIosList } from "react-icons/io";
import { BsChatDotsFill, BsStars } from "react-icons/bs";

export const TopBar = () => {
 return (
    <div className="fixed top-0 left-0 z-50 w-[calc(100%-64px)] ml-16 h-12 bg-white border-b flex justify-between items-center px-4">
      
      {/* Left side: Chat label with icon */}
      <div className="flex items-center space-x-2 text-gray-700 font-medium">
        <BsChatDotsFill className="w-3 h-3" />
        <span className="text-xs">chats</span>
      </div>

      {/* Right side: Refresh and Help buttons */}
      <div className="flex space-x-2">
        <div className="border border-gray-300 rounded-md h-8 flex items-center px-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.reload()} 
            className="h-6 px-2 py-0 flex items-center space-x-1 text-sm"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="border border-gray-300 rounded-md h-8 flex items-center px-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 py-0 flex items-center space-x-1 text-sm"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help</span>
          </Button>
        </div>

        <div className="border border-gray-300 rounded-md h-8 flex items-center px-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 py-0 flex items-center space-x-1 text-sm"
          >
            {/* Glowing sun icon */}
            <span className="flex items-center mr-1">
              <svg
                className="h-4 w-4 text-yellow-400 animate-pulse drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="4" />
                <g stroke="currentColor" strokeWidth="1.5">
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="10" y1="16" x2="10" y2="19" />
                  <line x1="1" y1="10" x2="4" y2="10" />
                  <line x1="16" y1="10" x2="19" y2="10" />
                  <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                  <line x1="13.66" y1="13.66" x2="15.78" y2="15.78" />
                  <line x1="4.22" y1="15.78" x2="6.34" y2="13.66" />
                  <line x1="13.66" y1="6.34" x2="15.78" y2="4.22" />
                </g>
              </svg>
            </span>
            <span>5 / 6 phones</span>
          </Button>
        </div>
             <div className="border border-gray-300 rounded-md h-8 flex items-center px-2">
                 <Button
                     variant="ghost"
                     size="sm"
                     className="h-6 px-2 py-0 flex items-center space-x-1 text-sm"
                 >

                     <MdInstallDesktop className="h-5 w-5 text-gray-900" />

                 </Button>
             </div>
             <div className="border border-gray-300 rounded-md h-8 flex items-center px-2">
                 <Button
                     variant="ghost"
                     size="sm"
                     className="h-6 px-2 py-0 flex items-center space-x-1 text-sm"
                 >

                     <FaBellSlash className="h-5 w-5" />

                 </Button>
             </div>
             <div className="border border-gray-300 rounded-md h-8 flex items-center px-2">
  <Button
    variant="ghost"
    size="sm"
    className="h-6 px-2 py-0 flex items-center space-x-1 text-sm"
  >
    {/* Glitter icon (using a star as an example) */}
     <BsStars className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
    <IoIosList className="h-5 w-5" />
  </Button>
</div>
      </div>
    </div>
  );
};

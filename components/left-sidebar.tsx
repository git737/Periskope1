import { FaHome, FaUser, FaComments, FaCog } from 'react-icons/fa';
import { IoMdHome } from "react-icons/io";
import { VscGraphLine } from "react-icons/vsc";
import { MdFormatListBulleted } from "react-icons/md";
import { HiSpeakerphone } from "react-icons/hi";
import { RiContactsBookFill, RiFolderImageFill } from "react-icons/ri";
import { FaImage } from "react-icons/fa6";
import { FcTodoList } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";
import { LuMessageCircleMore } from "react-icons/lu";
import { IoTicketSharp } from "react-icons/io5";
import { TiFlowMerge } from "react-icons/ti";
import { MdOutlineChecklist } from "react-icons/md";
import { TbStarsFilled } from "react-icons/tb";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { BsChatDotsFill, BsStars } from "react-icons/bs";


export const IconBar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-14 bg-white text-gray-500 flex flex-col justify-between items-center py-3 shadow-lg">
      {/* Top icons */}
      <div className="flex flex-col items-center space-y-4">
        <img
          src="/logo.PNG"
          alt="Logo"
          className="w-8 h-8 hover:opacity-80 cursor-pointer"
        />
        <IoMdHome className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
         <BsChatDotsFill className="w-4 h-4 text-gray-500 hover:text-green-600 hover:fill-green-600 transition-colors duration-200 cursor-pointer"/>
        <IoTicketSharp className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
       
        <VscGraphLine className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
        <MdFormatListBulleted className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
        <HiSpeakerphone className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
       <div className="flex items-center ml-2">
    <TiFlowMerge className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
    <BsStars className="w-2 h-2 text-yellow-400 fill-yellow-400" />
  </div>
        <RiContactsBookFill className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
        <RiFolderImageFill className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
        <MdOutlineChecklist className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
        <IoMdSettings className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      </div>
      {/* Bottom icons */}
      <div className="flex flex-col items-center space-y-4 mb-2">
        <TbStarsFilled className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
        <TbLayoutSidebarLeftExpandFilled className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      </div>
    </div>
  );
};



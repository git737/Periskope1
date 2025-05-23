import { FaHome, FaUser, FaComments, FaCog } from 'react-icons/fa';
import { IoMdHome } from "react-icons/io";
import { VscGraphLine } from "react-icons/vsc";
import { MdFormatListBulleted } from "react-icons/md";
import { HiSpeakerphone } from "react-icons/hi";
import { RiContactsBookFill } from "react-icons/ri";
import { FaImage } from "react-icons/fa6";
import { FcTodoList } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";
import { LuMessageCircleMore } from "react-icons/lu";
import { LuRefreshCw } from "react-icons/lu";
import { FiEdit3 } from "react-icons/fi";
import { FaBarsStaggered } from "react-icons/fa6";
import { TbListDetails } from "react-icons/tb";
import { FaUsers } from "react-icons/fa";
import { FaAt } from "react-icons/fa6";
import { RiFolderImageFill } from "react-icons/ri";
import { RiListSettingsLine } from "react-icons/ri";
import { TbLayoutSidebarRightExpandFilled } from "react-icons/tb";
import { SiHubspot } from "react-icons/si";


export const RightSideBar = () => {
  return (
    <div className="fixed top-0 right-0 h-screen w-14 bg-white text-gray-400 flex flex-col items-center py-4 space-y-5">
      <TbLayoutSidebarRightExpandFilled className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <TbLayoutSidebarRightExpandFilled className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <LuRefreshCw className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <FiEdit3 className="w-4 h-4 text-gray-400 hover:text-green-600 hover:fill-green-600 transition-colors duration-200 cursor-pointer"/>      
      <FaBarsStaggered className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <TbListDetails className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <SiHubspot className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <FaUsers className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <FaAt className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <RiFolderImageFill className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
      <RiListSettingsLine className="w-4 h-4 hover:text-green-600 cursor-pointer"/>
    </div>
  );
};



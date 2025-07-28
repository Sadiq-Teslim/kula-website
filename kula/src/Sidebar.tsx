type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // --- Base styles for navigation links for consistency ---
  const navLinkClasses = "flex items-center py-3 px-4 text-gray-700 hover:bg-teal-50 rounded-lg transition-colors duration-200";
  const activeNavLinkClasses = "bg-teal-100 text-[#4AA8A4] font-bold";

  return (
    // The main container includes the new "frosted glass" overlay
    <div 
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    >
      {/* --- THIS IS THE FIX: The Modern "Frosted Glass" Overlay --- */}
      {/* We use a much lighter opacity and add the backdrop-blur utility from Tailwind CSS. */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"></div>

      {/* The actual sidebar panel with an upgraded look */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      >
        {/* --- Branded Header --- */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <img src="/kula-logo.png" alt="Kula Logo" className="w-10 h-10" />
          <h2 className="text-xl font-bold text-[#4AA8A4] ml-3">Kula</h2>
        </div>
        
        {/* --- Main Navigation Area --- */}
        <nav className="p-4 flex-grow">
          <a href="#" className={`${navLinkClasses} ${activeNavLinkClasses}`}>
            <img src="/home-icon.png" alt="Home" className="w-5 h-5 mr-3" />
            <span>Home</span>
          </a>
          <a href="#" className={navLinkClasses}>
            <img src="/history-icon.png" alt="History" className="w-5 h-5 mr-3" />
            <span>Analysis History (Soon)</span>
          </a>
          <a href="#" className={navLinkClasses}>
            <img src="/settings-icon.png" alt="Settings" className="w-5 h-5 mr-3" />
            <span>Settings (Soon)</span>
          </a>
          <a href="#" className={navLinkClasses}>
            <img src="/support-icon.png" alt="Support" className="w-5 h-5 mr-3" />
            <span>Contact Support (Soon)</span>
          </a>
        </nav>

        {/* --- Footer Area --- */}
        <div className="p-4 border-t border-gray-200">
            <a href="#" className={navLinkClasses}>
                <img src="/logout-icon.png" alt="Logout" className="w-5 h-5 mr-3" />
                <span>Logout (Soon)</span>
            </a>
        </div>
      </div>
    </div>
  );
}
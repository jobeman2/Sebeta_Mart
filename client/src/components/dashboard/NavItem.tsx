"use client";

interface NavItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
        active
          ? "bg-[#e6f0ff] text-[#3399FF] font-medium"
          : "hover:bg-gray-50 text-gray-700"
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? "text-[#3399FF]" : "text-gray-500"}`} />
      <span>{label}</span>
    </button>
  );
};

export default NavItem;

"use client";

interface MetricCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg bg-[#cce0ff] flex items-center justify-center">
      <Icon className="w-5 h-5 text-[#3399FF]" />
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  </div>
);

export default MetricCard;

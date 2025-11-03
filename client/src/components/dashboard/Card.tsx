"use client";

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">{children}</div>
);

export default Card;

import { Facebook, Twitter } from "lucide-react";

export default function SocialButtons() {
  return (
    <div className="flex flex-col text-sm sm:flex-row gap-3">
      <button className="flex-1 flex items-center justify-center bg-white text-gray-500 border border-gray-200 py-2 rounded-lg hover:bg-gray-100 transition duration-200 gap-2">
        <Facebook className="w-5 h-5 text-gray-500" />
        Google
      </button>
      <button className="flex-1 flex items-center justify-center bg-white text-gray-500 border border-gray-200 py-2 rounded-lg hover:bg-gray-100 transition duration-200 gap-2">
        <Facebook className="w-5 h-5 text-gray-500" />
        Facebook
      </button>
      <button className="flex-1 flex items-center justify-center bg-white text-gray-500 border border-gray-200 py-2 rounded-lg hover:bg-gray-100 transition duration-200 gap-2">
        <Twitter className="w-5 h-5 text-gray-500" />
        Twitter
      </button>
    </div>
  );
}

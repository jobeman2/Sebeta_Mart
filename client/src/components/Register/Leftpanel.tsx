import Link from "next/link";

export default function LeftPanel() {
  return (
    <div
      className="lg:w-1/2 relative flex flex-col justify-center p-10 bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/pix.jpg")' }}
    >
      <div className="absolute inset-0 bg-black/50 rounded-l-2xl"></div>
      <div className="relative text-white text-center font-dm-sans lg:text-left space-y-4">
        <h2 className="text-4xl font-bold">Welcome to Sebeta Market</h2>
        <p className="text-gray-200 text-lg">
          Create an account to enjoy exclusive deals, track your orders, and manage your cart seamlessly.
        </p>
        <p className="text-gray-300 font-josefin-sans">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

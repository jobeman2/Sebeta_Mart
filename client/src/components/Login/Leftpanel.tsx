import Link from "next/link";

export default function LeftPanel() {
  return (
    <div
      className="lg:w-1/2 relative flex flex-col justify-center p-10 bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/pix.jpg")' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 rounded-l-2xl"></div>

      {/* Text content */}
      <div className="relative text-white text-center font-dm-sans lg:text-left space-y-4">
        <h2 className="text-4xl font-bold">Welcome Back!</h2>
        <p className="text-gray-200 text-lg">
          Login to Sebeta Market and continue shopping with ease. Access your order history, manage your cart, and enjoy exclusive deals.
        </p>
        <p className="text-gray-300 font-josefin-sans">
          Don’t have an account yet?{" "}
          <Link href="/auth/register" className="text-blue-400 hover:underline font-medium">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}

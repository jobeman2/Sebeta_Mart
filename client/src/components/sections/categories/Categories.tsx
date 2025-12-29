"use client";

import Link from "next/link";
import Image from "next/image";

// Type for a category
interface Category {
  id: number;
  name: string;
  image: string;
}

// Properly type the categories array
const categories: Category[] = [
  { id: 1, name: "Electronics", image: "/images/cat/1.png" },
  { id: 2, name: "Mobile Phones", image: "/images/cat/3.png" },
  { id: 3, name: "Clothing", image: "/images/cat/p.jpg" },
  { id: 4, name: "Home & Living", image: "/images/cat/2.png" },
  { id: 5, name: "Gifts", image: "/images/cat/pp.jpg" },
  { id: 6, name: "Favorites", image: "/images/cat/3.png" },
];

export default function Categories() {
  return (
    <section className="bg-white py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-10">
        {/* Section Title and Subtitle */}
        <div className="text-center">
          <h3 className="text-lg sm:text-3xl text-[#333333] font-dm-sans font-extrabold text-gray-900">
            Categories
          </h3>
          <p className="mt-2 text-md text-[#333333]">
            Explore our wide range of products across different categories.
          </p>
        </div>

        {/* Categories List */}
        <div className="flex gap-12 overflow-x-auto scrollbar-hide justify-center w-full">
          {categories.map((category) => (
            <Link
              key={category.id}
              href="#"
              className="flex flex-col items-center justify-center hover:bg-blue-50 transition-colors rounded-lg px-6 py-4 min-w-[150px] flex-shrink-0 cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 80px, 96px"
                  priority
                />
              </div>
              <span className="mt-3 text-base font-medium text-gray-700 text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

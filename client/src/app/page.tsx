import Footer from "@/components/Layout/Footer/Footer";
import ImageComponent from "@/components/Layout/CtaSection";
import Navbar from "@/components/Layout/Navbar/Navbar";
import ShopSocial from "@/components/Layout/ShopSocial";
import TopHeader from "@/components/Layout/Topheader/Topheader";
import DeliveryBanner from "@/components/Layout/banner";
import Header from "@/context/UI/header";
import Hero from "@/components/sections/Hero/Hero";
import Categories from "@/components/sections/categories/Categories";
import ProductsGrid from "@/components/sections/products/Products";
import CtaSection from "@/components/Layout/CtaSection";

export default function Home() {
  return (
    <div className="font-dm-sans ">
      <Hero />
      <Categories />
      <ProductsGrid />
      <CtaSection />
      <DeliveryBanner />
      <ShopSocial />
    </div>
  );
}

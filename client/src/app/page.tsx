import Footer from "@/components/Layout/Footer/Footer";
import Navbar from "@/components/Layout/Navbar/Navbar";
import TopHeader from "@/components/Layout/Topheader/Topheader";
import Header from "@/components/UI/header";
import Hero from "@/components/sections/Hero/Hero";
import Categories from "@/components/sections/categories/Categories";
import ProductsGrid from "@/components/sections/products/Products";



export default function Home() {
  return (
    <div className="font-dm-sans ">
    
    
     
      <Hero/>
      <Categories/>
      <ProductsGrid/>
  
  
   
    </div>
  );
}

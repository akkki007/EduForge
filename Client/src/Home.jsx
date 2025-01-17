"use client";

import Bento from "./components/Bento";
import Colleges from "./components/Colleges";
import Cta from "./components/Cta";
import FAQ from "./components/FAQ";
import { FooterWithSocialLinks } from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
export default function Home() {
  return (
    <div className="bg-white">
      <Header />;
      <Hero />
      <Cta />
      <Bento />
      <Colleges />
      <FAQ />
      <FooterWithSocialLinks />
    </div>
  );
}

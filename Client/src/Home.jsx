"use client";

import { Provider, useSelector } from "react-redux";
import Bento from "./components/Bento";
import Colleges from "./components/Colleges";
import Cta from "./components/Cta";
import FAQ from "./components/FAQ";
import { FooterWithSocialLinks } from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import store from "./redux/store";
import { useEffect } from "react";

export default function Home() {
  const isTeacher = useSelector((state) => state.role.isTeacher);

  useEffect(() => {
    console.log(isTeacher);
  }, [isTeacher]);

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

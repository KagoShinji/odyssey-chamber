import React from "react";
import { ServicesSection } from "../components/sections/Sections";
import { CtaSection } from "../components/sections/MoreSections";

const Services: React.FC = () => {
  return (
    <div className="flex flex-col w-full pt-20">
      <ServicesSection />
      <CtaSection />
    </div>
  );
};

export default Services;

import React from "react";
import { AboutSection } from "../components/sections/Sections";
import { CtaSection } from "../components/sections/MoreSections";

const About: React.FC = () => {
  return (
    <div className="flex flex-col w-full pt-20">
      <AboutSection />
      <CtaSection />
    </div>
  );
};

export default About;

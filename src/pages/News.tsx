import React from "react";
import { NewsSection } from "../components/sections/MoreSections";
import { CtaSection } from "../components/sections/MoreSections";

const News: React.FC = () => {
  return (
    <div className="flex flex-col w-full pt-20">
      <NewsSection />
      <CtaSection />
    </div>
  );
};

export default News;

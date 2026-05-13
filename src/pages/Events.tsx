import React from "react";
import { EventsSection } from "../components/sections/MoreSections";
import { CtaSection } from "../components/sections/MoreSections";

const Events: React.FC = () => {
  return (
    <div className="flex flex-col w-full pt-20">
      <EventsSection />
      <CtaSection />
    </div>
  );
};

export default Events;

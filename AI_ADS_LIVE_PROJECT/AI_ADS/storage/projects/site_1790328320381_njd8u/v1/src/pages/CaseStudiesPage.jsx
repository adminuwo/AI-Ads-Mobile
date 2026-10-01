import React from 'react';
import SectionRenderer from '../components/SectionRenderer';

export default function CaseStudiesPage({ page, setActivePage, siteData }) {
  const sections = page?.sections || [];

  return (
    <div className="page-container page-page_case_studies">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id || Math.random().toString()}
          section={section}
          setActivePage={setActivePage}
          siteData={siteData}
        />
      ))}
    </div>
  );
}

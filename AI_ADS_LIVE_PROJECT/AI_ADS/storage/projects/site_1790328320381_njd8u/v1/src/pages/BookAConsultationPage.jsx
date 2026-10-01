import React from 'react';
import SectionRenderer from '../components/SectionRenderer';

export default function BookAConsultationPage({ page, setActivePage, siteData }) {
  const sections = page?.sections || [];

  return (
    <div className="page-container page-page_book_a_consultation">
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

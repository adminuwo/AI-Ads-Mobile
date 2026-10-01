import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { siteData } from './data/siteData';
import HomePage from './pages/HomePage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import BookAConsultationPage from './pages/BookAConsultationPage';

export default function App() {
  const [activePage, setActivePage] = useState('Home');

  const pageMap = (siteData.pages || []).reduce((acc, p) => {
    acc[p.name] = p;
    return acc;
  }, {});

  const renderActivePage = () => {
    switch (activePage) {
      case 'Home':
        return <HomePage page={pageMap['Home']} setActivePage={setActivePage} siteData={siteData} />;
      case 'Case Studies':
        return <CaseStudiesPage page={pageMap['Case Studies']} setActivePage={setActivePage} siteData={siteData} />;
      case 'Book a Consultation':
        return <BookAConsultationPage page={pageMap['Book a Consultation']} setActivePage={setActivePage} siteData={siteData} />;
      default:
        return <HomePage page={pageMap['Home']} setActivePage={setActivePage} siteData={siteData} />;
    }
  };

  return (
    <div className="app-root">
      <Navbar siteData={siteData} activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {renderActivePage()}
      </main>
      <Footer siteData={siteData} setActivePage={setActivePage} />
    </div>
  );
}

import React from 'react';
import HeroBanner from './HeroBanner';
import HeroSplit from './HeroSplit';
import HeroMinimal from './HeroMinimal';
import ItemCatalogGrid from './ItemCatalogGrid';
import RestaurantMenuCard from './RestaurantMenuCard';
import PortfolioGallery from './PortfolioGallery';
import PricingPlansGrid from './PricingPlansGrid';
import FeatureGrid from './FeatureGrid';
import HowItWorksGrid from './HowItWorksGrid';
import TestimonialsCarousel from './TestimonialsCarousel';
import GuideAccordion from './GuideAccordion';
import ContactInquiryForm from './ContactInquiryForm';
import CustomOrderForm from './CustomOrderForm';
import BookingForm from './BookingForm';
import ServicesGrid from './ServicesGrid';
import StatsCounter from './StatsCounter';
import CallToActionBanner from './CallToActionBanner';
import ContentSectionCard from './ContentSectionCard';
import LocationHoursCard from './LocationHoursCard';
import TeamGrid from './TeamGrid';
import InteractiveExplorer from './InteractiveExplorer';
import ExperimentQuestTracker from './ExperimentQuestTracker';
import InteractiveQuizApp from './InteractiveQuizApp';
import InteractiveCartStore from './InteractiveCartStore';
import ReservationBookingApp from './ReservationBookingApp';

export default function SectionRenderer({ section, setActivePage, siteData }) {
  if (!section) return null;

  switch (section.type) {
    case 'InteractiveExplorer':
    case 'TopicExplorer':
    case 'ScienceExplorer':
      return <InteractiveExplorer section={section} />;
    case 'ExperimentQuestTracker':
    case 'ProgressTracker':
    case 'QuestTracker':
      return <ExperimentQuestTracker section={section} />;
    case 'InteractiveQuizApp':
    case 'QuizApp':
      return <InteractiveQuizApp section={section} />;
    case 'InteractiveCartStore':
    case 'ShoppingCartApp':
      return <InteractiveCartStore section={section} />;
    case 'ReservationBookingApp':
    case 'TableReservationApp':
      return <ReservationBookingApp section={section} />;
    case 'HeroBanner':
      return <HeroBanner section={section} setActivePage={setActivePage} />;
    case 'HeroSplit':
      return <HeroSplit section={section} setActivePage={setActivePage} />;
    case 'HeroMinimal':
      return <HeroMinimal section={section} setActivePage={setActivePage} />;
    case 'ItemCatalogGrid':
    case 'FeaturedItemsGrid':
      return <ItemCatalogGrid section={section} paymentSpec={siteData?.paymentCheckoutSpec} />;
    case 'RestaurantMenuCard':
      return <RestaurantMenuCard section={section} />;
    case 'PortfolioGallery':
      return <PortfolioGallery section={section} />;
    case 'PricingPlansGrid':
      return <PricingPlansGrid section={section} />;
    case 'FeatureGrid':
    case 'ValuePropositionGrid':
      return <FeatureGrid section={section} />;
    case 'HowItWorksGrid':
    case 'ProcessSteps':
      return <HowItWorksGrid section={section} />;
    case 'TestimonialsCarousel':
    case 'ReviewsGrid':
      return <TestimonialsCarousel section={section} />;
    case 'GuideAccordion':
    case 'FAQAccordion':
      return <GuideAccordion section={section} />;
    case 'TeamGrid':
    case 'FacultyGrid':
      return <TeamGrid section={section} setActivePage={setActivePage} />;
    case 'ContactInquiryForm':
      return <ContactInquiryForm section={section} hasWhatsApp={siteData?.contactRequirements?.hasWhatsApp} />;
    case 'CustomOrderForm':
      return <CustomOrderForm section={section} />;
    case 'BookingForm':
    case 'DemoRequestForm':
      return <BookingForm section={section} />;
    case 'ServicesGrid':
      return <ServicesGrid section={section} />;
    case 'StatsCounter':
      return <StatsCounter section={section} />;
    case 'CallToActionBanner':
      return <CallToActionBanner section={section} setActivePage={setActivePage} />;
    case 'LocationHoursCard':
      return <LocationHoursCard section={section} />;
    case 'ContentSectionCard':
    default:
      return <ContentSectionCard section={section} />;
  }
}

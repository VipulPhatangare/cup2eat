import OfferBar from '../components/layout/OfferBar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FloatingActions from '../components/layout/FloatingActions';
import ScrollStory from '../components/sections/ScrollStory';
import WhyUs from '../components/sections/WhyUs';
import Products from '../components/sections/Products';
import Calculator from '../components/sections/Calculator';
import UseCases from '../components/sections/UseCases';
import PlasticVsCup from '../components/sections/PlasticVsCup';
import Reviews from '../components/sections/Reviews';
import Gallery from '../components/sections/Gallery';
import Founder from '../components/sections/Founder';
import FAQ from '../components/sections/FAQ';
import Contact from '../components/sections/Contact';

export default function Landing() {
  return (
    <>
      <OfferBar />
      <Header />
      <main>
        <ScrollStory />
        <WhyUs />
        <Products />
        <Calculator />
        <UseCases />
        <PlasticVsCup />
        <Reviews />
        <Gallery />
        <Founder />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}

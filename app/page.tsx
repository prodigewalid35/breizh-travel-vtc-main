import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import VehicleSection from '@/components/home/VehicleSection';
import BookingSection from '@/components/home/BookingSection';
import ContactSection from '@/components/home/ContactSection';
import GallerySection from '@/components/home/GallerySection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <VehicleSection />
      <BookingSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
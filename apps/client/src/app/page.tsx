import { NavBar } from '@/src/components/sections/NavBar';
import { Hero } from '@/src/components/sections/Hero';
import { Stats } from '@/src/components/sections/Stats';
import { Features } from '@/src/components/sections/Features';
import { Roles } from '@/src/components/sections/Roles';
import { Footer } from '@/src/components/sections/Footer';

export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Roles />
      </main>
      <Footer />
    </>
  );
}
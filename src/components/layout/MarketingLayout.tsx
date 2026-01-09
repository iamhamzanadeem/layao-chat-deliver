import { Header } from './Header';
import { Footer } from './Footer';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

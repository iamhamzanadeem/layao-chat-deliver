import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import Auth from "./pages/app/Auth";
import AppLayout from "./components/app/AppLayout";
import Chat from "./pages/app/Chat";
import Profile from "./pages/app/Profile";
import AdminLayout from "./components/admin/AdminLayout";
import AdminAuth from "./pages/admin/Auth";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Errands from "./pages/admin/Errands";
import PartnerRestaurants from "./pages/admin/PartnerRestaurants";
import Customers from "./pages/admin/Customers";
import Analytics from "./pages/admin/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Marketing Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/install" element={<Install />} />
              
              {/* App Routes */}
              <Route path="/app/auth" element={<Auth />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/chat" replace />} />
                <Route path="chat" element={<Chat />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="errands" element={<Errands />} />
              <Route path="restaurants" element={<PartnerRestaurants />} />
              <Route path="customers" element={<Customers />} />
              <Route path="analytics" element={<Analytics />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LocationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

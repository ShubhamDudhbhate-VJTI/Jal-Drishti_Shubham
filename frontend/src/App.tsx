import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";

import { LanguageProvider } from "@/context/LanguageContext";

import { AuthProvider } from "@/context/AuthContext";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index.tsx";

import { LoginPage } from "./pages/LoginPage";

import NotFound from "./pages/NotFound.tsx";



const queryClient = new QueryClient();



const App = () => (

  <QueryClientProvider client={queryClient}>

    <AuthProvider>

      <LanguageProvider>

        <TooltipProvider>

          <Toaster />

          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>

    </AuthProvider>

  </QueryClientProvider>

);



export default App;


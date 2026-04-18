import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, Waves, Leaf, MapPin, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication (accept any username/password)
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", username || "User");
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      setIsLoading(false);
      // Navigate to the dashboard
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Welcome Content */}
          <div className="text-center md:text-left space-y-6">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                <Droplets className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Jal Drishti
              </h1>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800">
              Groundwater Monitoring & Prediction System
            </h2>
            
            <p className="text-gray-600 leading-relaxed">
              Empowering Maharashtra communities with AI-powered groundwater insights. 
              Monitor historical trends, predict future water levels, and make informed decisions 
              for sustainable water management.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">3,338+ Villages</h3>
                  <p className="text-sm text-gray-600">Complete Maharashtra coverage</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">ML Predictions</h3>
                  <p className="text-sm text-gray-600">2024-2025 water level forecasts</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Shield className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Risk Analysis</h3>
                  <p className="text-sm text-gray-600">Water scarcity assessment</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sustainable</h3>
                  <p className="text-sm text-gray-600">Eco-friendly water management</p>
                </div>
              </div>
            </div>

            {/* Water Stats */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">10</div>
                  <div className="text-sm text-gray-600">Years of Data</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-600">36</div>
                  <div className="text-sm text-gray-600">Districts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-600">AI</div>
                  <div className="text-sm text-gray-600">Powered</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full w-fit">
                  <Waves className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your credentials to access the groundwater monitoring system
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter any username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter any password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Demo Mode: Any username/password will work
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 text-blue-100 opacity-30" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
}

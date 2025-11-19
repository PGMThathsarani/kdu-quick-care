import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeBgImg from '../../assets/home_back.jpg';
import { Stethoscope, ArrowRight, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const navigate = useNavigate();

  const handleEmergencyCall = () => {
    // Make a local call to the emergency number
    window.location.href = 'tel:+94112044555';
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HomeBgImg})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KDU Health</h1>
                <p className="text-xs text-gray-500">QuickCare Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/about')}
                className="gap-2"
              >
                Learn More
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="bg-black hover:bg-gray-800 gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white drop-shadow-lg">
              Welcome to QuickCare
            </h1>
            <p className="text-2xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
              Your trusted partner in healthcare solutions
            </p>
            <p className="text-lg text-white/80 drop-shadow-md max-w-xl mx-auto">
              Connect with qualified doctors, manage appointments, and access quality healthcare anytime, anywhere
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/about')}
              className="bg-white text-black hover:bg-gray-100 gap-2 px-8 py-6 text-lg font-semibold shadow-xl"
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-black hover:bg-gray-800 text-white gap-2 px-8 py-6 text-lg font-semibold shadow-xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Emergency Call Button */}
          <div className="pt-8">
            <div className="inline-block">
              <div className="bg-red-500/10 backdrop-blur-sm border-2 border-red-500 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white drop-shadow-md">
                        Medical Emergency?
                      </h3>
                      <p className="text-sm text-white/80 drop-shadow">
                        Get immediate assistance
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={handleEmergencyCall}
                    className="bg-red-500 hover:bg-red-600 text-white gap-3 px-8 py-6 text-lg font-bold shadow-xl w-full transition-all hover:scale-105"
                  >
                    <Phone className="w-6 h-6" />
                    Call Emergency: +94 112044555
                  </Button>
                  
                  <p className="text-xs text-white/70 drop-shadow text-center max-w-md">
                    Available 24/7 for urgent medical situations. Connect instantly to UHKDU Werahara emergency services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 backdrop-blur-sm text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="w-5 h-5" />
            <span className="font-semibold">KDU Health - QuickCare</span>
          </div>
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} QuickCare. Your trusted healthcare partner.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
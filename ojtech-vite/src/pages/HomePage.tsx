import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../providers/AuthProvider';
import { ArrowRight, Briefcase, Brain, UserCheck, Award, Rocket, CheckCircle, ChevronRight, Star, ExternalLink, Building2 } from 'lucide-react';
import { WaveyHeroHeader } from '../components/ui/WaveyHeroHeader';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Partner companies with names, website URLs, and logo paths
  const partnerCompanies = [
    { name: "ALLIANCE SOFTWARE, INC.", website: "https://www.alliancesoftware.com.ph", logo: "/logos/alliance.png" },
    { name: "CODECHUM SOFTWARE SOLUTIONS INCORPORATED", website: "https://www.codechum.com", logo: "/logos/codechum.png" },
    { name: "GO VIRTUAL ASSISTANTS INC.", website: "https://govirtualassistants.com", logo: "/logos/govirtual.png" },
    { name: "HATCHIT SOLUTIONS", website: "https://hatchitsolutions.com", logo: "/logos/hatchit.png" },
    { name: "INTERNS HUB", website: "https://internshub.com", logo: "/logos/internshub.png" },
    { name: "KYOCERA DOCUMENT SOLUTIONS DEVELOPMENT PHIL., INC", website: "https://www.kyoceradocumentsolutions.com", logo: "/logos/kyocera.png" },
    { name: "NG KHAI DEVELOPMENT CORPORATION", website: "https://ngkhai.com", logo: "/logos/ngkhai.png" },
    { name: "OLLOPA CORPORATION", website: "https://ollopa.com", logo: "/logos/ollopa.png" },
    { name: "OPTOGROW OPERATIONS MANAGEMENT SERVICES", website: "https://optogrow.com", logo: "/logos/optogrow.png" },
    { name: "PIXEL8 WEB SOLUTIONS & CONSULTANCY INC.", website: "https://pixel8.ph", logo: "/logos/pixel8.png" },
    { name: "SOFTWARE+ AT ITS BEST", website: "https://softwareplus.com", logo: "/logos/softwareplus.png" },
    { name: "SUGBODOC TECHNOLOGIES INC.", website: "https://sugbodoc.com", logo: "/logos/sugbodoc.png" },
    { name: "SYMPH, INC.", website: "https://symph.co", logo: "/logos/symph.png" },
    { name: "TALLECO.COM INC.", website: "https://talleco.com", logo: "/logos/talleco.png" },
    { name: "UMONICS METHOD", website: "https://umonicsmethod.com", logo: "/logos/umonics.png" },
    { name: "VADE S-SOLUTIONS COMPANY", website: "https://vade-solutions.com", logo: "/logos/vade.png" },
    { name: "WORLDTECH INFORMATION SOLUTION, INC.", website: "https://worldtechis.com", logo: "/logos/worldtech.png" },
    { name: "WALTER COMPUTER SYSTEM INC.", website: "https://waltercomputersystem.com", logo: "/logos/walter.png" },
    { name: "WELQOM INC.", website: "https://welqom.com", logo: "/logos/welqom.png" }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero section with wavy background - full-width background with containerized content */}
      <div className="w-full h-[70vh] mb-40">
        <WaveyHeroHeader 
          title="Find Your Perfect <br /> Internship Match"
          subtitle="Our AI-powered matching connects you with relevant job opportunities that align with your skills and aspirations."
          primaryButtonText="Explore Opportunities"
          primaryButtonUrl="/opportunities"
          secondaryButtonText="Upload Resume"
          secondaryButtonUrl="/profile"
          imageSrc="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
        />
      </div>

      {/* About section with mission statement */}
      <section className="py-20 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#111] opacity-70"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 rounded-full border border-gray-800 bg-gray-900/50">
              <span className="text-sm font-medium text-gray-300">Top-rated job matching platform</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Connecting Talented Students with Industry Opportunities
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              OJTech bridges the gap between academic learning and professional experience,
              using AI-powered matching to create meaningful connections between students and employers.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/opportunities">
                <Button className="group bg-gray-200 text-black hover:bg-gray-300 px-6 rounded-full">
                  Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        <div className="absolute -left-20 top-1/4 w-40 h-40 rounded-full bg-gray-900/20 blur-3xl"></div>
        <div className="absolute -right-20 bottom-1/4 w-40 h-40 rounded-full bg-gray-900/20 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How OJTech Works</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-gray-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#111111] p-8 rounded-xl border border-[#222222] transform transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              <div className="bg-[#0A0A0A] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6 border border-gray-800">
                <UserCheck className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-300 mb-4">
                Upload your resume and complete your profile. Our AI analyzes your skills, experience, 
                and educational background.
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white mr-2">1</span>
                Step One
              </div>
            </div>
            
            <div className="bg-[#111111] p-8 rounded-xl border border-[#222222] transform transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              <div className="bg-[#0A0A0A] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6 border border-gray-800">
                <Brain className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
              <p className="text-gray-300 mb-4">
                Our intelligent algorithm matches your profile with internship opportunities 
                that align with your skills and career goals.
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white mr-2">2</span>
                Step Two
              </div>
            </div>
            
            <div className="bg-[#111111] p-8 rounded-xl border border-[#222222] transform transition-all duration-300 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              <div className="bg-[#0A0A0A] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6 border border-gray-800">
                <Briefcase className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Apply with Confidence</h3>
              <p className="text-gray-300 mb-4">
                Review your matches, apply to positions with a single click, and track 
                your application status in real-time.
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white mr-2">3</span>
                Step Three
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose OJTech</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-gray-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
            <div className="flex gap-5 items-start group">
              <div className="p-3 rounded-md bg-gray-900 border border-gray-800 group-hover:border-gray-700 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-200 transition-colors">Personalized Matching</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Our AI understands your unique skills and preferences to suggest only relevant opportunities.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5 items-start group">
              <div className="p-3 rounded-md bg-gray-900 border border-gray-800 group-hover:border-gray-700 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-200 transition-colors">Verified Employers</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  All companies on our platform are thoroughly vetted to ensure legitimate opportunities.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5 items-start group">
              <div className="p-3 rounded-md bg-gray-900 border border-gray-800 group-hover:border-gray-700 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-200 transition-colors">Streamlined Applications</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Apply to multiple positions with just a few clicks - no repetitive form filling.
                </p>
              </div>
            </div>
            
            <div className="flex gap-5 items-start group">
              <div className="p-3 rounded-md bg-gray-900 border border-gray-800 group-hover:border-gray-700 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-200 transition-colors">Real-time Updates</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Receive instant notifications about application status, interview requests, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Partners</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">We collaborate with top companies across various industries to provide quality internship opportunities</p>
            <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-gray-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {partnerCompanies.map((company, index) => (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                key={index} 
                className="bg-[#111111] p-5 rounded-xl border border-[#222222] flex items-center transform transition-all duration-300 hover:border-gray-600 hover:bg-[#151515] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] group"
              >
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-900 rounded-md flex items-center justify-center mr-4 border border-gray-800">
                    {/* Replace this with actual logo if available, otherwise show placeholder */}
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={`${company.name} logo`} 
                        className="max-w-full max-h-full p-1 object-contain"
                        onError={(e) => {
                          // If image fails to load, show a fallback building icon
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling;
                          if (nextElement && nextElement instanceof HTMLElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-gray-500" />
                    )}
                    <Building2 className="w-7 h-7 text-gray-500" style={{display: 'none'}} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm font-medium group-hover:text-gray-100 transition-colors">{company.name}</p>
                    {/* <div className="flex items-center mt-1 text-gray-500 group-hover:text-gray-400 transition-colors">
                      <span className="text-xs">Visit website</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </div> */}
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          {/* <div className="mt-16 text-center">
            <Link to="/partners">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-900 transition-all duration-300">
                View All Partners
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* Improved CTA section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0a]"></div>
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-2xl p-10 border border-gray-800 shadow-[0_20px_80px_-10px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-10">
              <div className="flex justify-center">
                <div className="inline-flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-gray-500" fill="#555" />
                  ))}
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 inline-block text-transparent bg-clip-text">
                Ready to Launch Your Career?
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of students who have found their perfect internship match with OJTech.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <Link to="/register" className="w-full">
                  <Button className="bg-gray-200 text-black hover:bg-gray-300 w-full text-base py-6 rounded-xl shadow-lg group transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                    <span>Sign Up Free</span>
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/opportunities" className="w-full">
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-900 w-full text-base py-6 rounded-xl shadow-lg transition-all duration-300">
                    Browse Opportunities
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center items-center space-x-1 text-sm text-gray-600">
              <span>No credit card required</span>
              <span>•</span>
              <span>Free forever</span>
              <span>•</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer with subtle gradient border */}
    
    </div>
  );
} 
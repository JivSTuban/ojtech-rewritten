import React, { Component, createRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { Skeleton } from "../../components/ui/Skeleton";
import { FileText, Download, Eye, Mail, CheckCircle, XCircle, FileDown, Printer } from "lucide-react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import jobApplicationService from "../../lib/api/jobApplicationService";
import { JobApplication, ApplicationStatus } from "../../lib/types/application";
import { cn } from "../../lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "../../components/ui/Dialog";
import { ScrollArea } from "../../components/ui/ScrollArea";
import html2pdf from 'html2pdf.js';

// CV Modal Component
interface CVModalProps {
  cvId: string;
  studentName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CVModalState {
  cv: any;
  loading: boolean;
  error: string | null;
  showRawData: boolean;
  zoomLevel: number;
  currentPage: number;
  totalPages: number;
}

class CVModal extends Component<CVModalProps, CVModalState> {
  private resumeRef = createRef<HTMLDivElement>();
  
  constructor(props: CVModalProps) {
    super(props);
    this.state = {
      cv: null,
      loading: true,
      error: null,
      showRawData: false,
      zoomLevel: 100,
      currentPage: 1,
      totalPages: 1
    };
  }

  componentDidMount() {
    if (this.props.isOpen) {
      this.fetchCVData();
    }
    
    // Add print styles
    this.addPrintStyles();
  }

  componentDidUpdate(prevProps: CVModalProps) {
    // Load CV data when the modal opens
    if (!prevProps.isOpen && this.props.isOpen) {
      this.fetchCVData();
    }
  }

  componentWillUnmount() {
    // Remove print styles
    this.removePrintStyles();
  }

  addPrintStyles() {
    const styleId = 'cv-print-styles';
    
    // Check if styles already exist
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        
        .resume-container, .resume-container * {
          visibility: visible;
          color: black !important;
        }
        
        .resume-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background-color: white !important;
          padding: 20mm !important;
          box-shadow: none !important;
        }
        
        .resume-container h1, .resume-container h2 {
          color: black !important;
        }
        
        .resume-container pre {
          background-color: #f8f8f8 !important;
          border: 1px solid #dddddd !important;
        }
        
        .resume-container .flex.flex-wrap.gap-2 span {
          background-color: #f0f0f0 !important;
          color: #333333 !important;
        }
        
        .dark\\:bg-gray-800, .dark\\:bg-gray-700, .dark\\:bg-gray-900 {
          background-color: white !important;
        }
        
        .dark\\:text-gray-100, .dark\\:text-gray-200, .dark\\:text-gray-300, .dark\\:text-gray-400 {
          color: black !important;
        }
        
        .dark\\:border-gray-700, .dark\\:border-gray-800 {
          border-color: #dddddd !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  removePrintStyles() {
    const styleId = 'cv-print-styles';
    const style = document.getElementById(styleId);
    if (style) {
      document.head.removeChild(style);
    }
  }

  fetchCVData = async () => {
    const { cvId } = this.props;
    
    try {
      console.log("Fetching CV data for ID:", cvId);
      this.setState({ loading: true, error: null });
      
      const cvData = await jobApplicationService.getEmployerCVDetails(cvId);
      console.log("CV data received from API:", cvData);
      
      if (!cvData) {
        throw new Error("No CV data returned from API");
      }
      
      // Clean up parsedResume if it's double-encoded
      if (cvData.parsedResume && typeof cvData.parsedResume === 'string') {
        try {
          // First parse attempt - handle if it's a JSON string
          const parsed = JSON.parse(cvData.parsedResume);
          
          // Check if the result is still a string that looks like JSON (double-encoded)
          if (typeof parsed === 'string' && (parsed.startsWith('{') || parsed.startsWith('['))) {
            try {
              // Second parse attempt for double-encoded JSON
              const doubleParsed = JSON.parse(parsed);
              cvData.parsedResume = doubleParsed;
            } catch (e) {
              // If second parse fails, use the result of the first parse
              cvData.parsedResume = parsed;
            }
          } else {
            // If first parse result is not a string, use it directly
            cvData.parsedResume = parsed;
          }
        } catch (e) {
          // If parsing fails, keep the original string
          console.error("Error parsing resume JSON:", e);
        }
      }
      
      this.setState({ cv: cvData, loading: false });
    } catch (error) {
      console.error("Error fetching CV:", error);
      this.setState({ 
        loading: false, 
        error: typeof error === 'string' ? error : 
               error instanceof Error ? error.message : 
               "Failed to load CV" 
      });
    }
  };

  // Helper function to format complex data for display
  formatComplexData(value: any): React.ReactNode {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      
      return (
        <ul className="list-disc pl-5 space-y-1">
          {value.map((item, index) => (
            <li key={index}>
              {typeof item === 'object' ? this.formatComplexData(item) : String(item)}
            </li>
          ))}
        </ul>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div className="pl-2 border-l-2 border-gray-200 mt-1 space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="text-sm">
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
              {this.formatComplexData(val)}
            </div>
          ))}
        </div>
      );
    }
    
    return JSON.stringify(value);
  }

  renderParsedResume() {
    const { cv } = this.state;
    if (!cv) {
      console.log("CV data is null or undefined");
      return null;
    }
    
    console.log("CV data received:", cv);
    
    if (!cv.parsedResume) {
      console.log("parsedResume is null or undefined");
      return (
        <div className="space-y-4">
          <p>No parsed resume data available.</p>
        </div>
      );
    }

    try {
      // Parse the JSON string if it's a string, otherwise use it directly
      let parsedData;
      if (typeof cv.parsedResume === 'string') {
        parsedData = JSON.parse(cv.parsedResume);
      } else {
        parsedData = cv.parsedResume;
      }
      
      console.log("Parsed resume data:", parsedData);
      
      // Get all keys from the parsed data
      const keys = Object.keys(parsedData);
      
      return (
        <div className="space-y-6 print:text-black">
          {/* Header with name */}
          {parsedData.name && (
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {parsedData.name}
              </h1>
              
              {/* Contact info row if available */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                {parsedData.email && (
                  <span>{parsedData.email}</span>
                )}
                {parsedData.phone && (
                  <span>{parsedData.phone}</span>
                )}
                {parsedData.location && (
                  <span>{parsedData.location}</span>
                )}
              </div>
            </div>
          )}
          
          {/* Professional Summary if available */}
          {parsedData.summary && (
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">{parsedData.summary}</p>
            </div>
          )}
          
          {/* Display education information in a professional format */}
          {(parsedData.education || parsedData.major || parsedData.graduationYear) && (
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-1 text-sm">
                {parsedData.education && (
                  <div className="flex justify-between">
                    <p className="font-medium">{parsedData.education}</p>
                    {parsedData.graduationYear && (
                      <p className="text-gray-500">Class of {parsedData.graduationYear}</p>
                    )}
                  </div>
                )}
                {parsedData.major && (
                  <p className="text-gray-700 dark:text-gray-300">{parsedData.major}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Display skills in a professional format */}
          {parsedData.skills && (
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {typeof parsedData.skills === 'string' ? 
                  parsedData.skills.split(',').map((skill: string) => (
                    <span key={skill.trim()} className="px-2.5 py-0.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {skill.trim()}
                    </span>
                  )) : 
                  this.formatComplexData(parsedData.skills)
                }
              </div>
            </div>
          )}
          
          {/* Display all other fields in a professional format */}
          {keys.filter(key => 
            !['name', 'email', 'phone', 'location', 'summary', 'education', 'major', 'graduationYear', 'skills', 'seedData'].includes(key) && 
            parsedData[key] !== null && 
            parsedData[key] !== undefined
          ).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {keys.filter(key => 
                  !['name', 'email', 'phone', 'location', 'summary', 'education', 'major', 'graduationYear', 'skills', 'seedData'].includes(key) && 
                  parsedData[key] !== null && 
                  parsedData[key] !== undefined
                ).map(key => (
                  <div key={key}>
                    <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {this.formatComplexData(parsedData[key])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.error("Error parsing resume data:", e);
      return <p>Error parsing resume data: {String(e)}</p>;
    }
  }

  renderExperiences() {
    const { cv } = this.state;
    if (!cv) return null;
    
    console.log("Experiences data:", cv.experiences);
    
    if (!cv.experiences || cv.experiences.length === 0) {
      return (
        <div className="mt-6">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
            Experience
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">No experience data available.</p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
          Experience
        </h2>
        <div className="space-y-4">
          {cv.experiences.map((exp: any, index: number) => (
            <div key={index} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="flex justify-between items-start">
                <p className="font-medium">{exp.title || 'Unknown Position'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {exp.startDate || 'Unknown Start Date'} - {exp.endDate || 'Present'}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{exp.company || 'Unknown Company'}</p>
              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{exp.description || 'No description available.'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderCertifications() {
    const { cv } = this.state;
    if (!cv) return null;
    
    console.log("Certifications data:", cv.certifications);
    
    if (!cv.certifications || cv.certifications.length === 0) {
      return (
        <div className="mt-6">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
            Certifications
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">No certification data available.</p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
          Certifications
        </h2>
        <div className="space-y-3">
          {cv.certifications.map((cert: any, index: number) => (
            <div key={index} className="pb-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="flex justify-between items-start">
                <p className="font-medium">{cert.name || 'Unknown Certification'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{cert.issueDate || 'Unknown Date'}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer || 'Unknown Issuer'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  toggleRawData = () => {
    this.setState(prevState => ({
      showRawData: !prevState.showRawData
    }));
  }

  renderRawData() {
    const { cv } = this.state;
    if (!cv || !cv.parsedResume) return null;

    let parsedData;
    try {
      if (typeof cv.parsedResume === 'string') {
        parsedData = JSON.parse(cv.parsedResume);
      } else {
        parsedData = cv.parsedResume;
      }
      
      // Create a clean object with only the resume data
      const cleanData = {
        ...parsedData
      };
      
      // Delete metadata fields if they exist
      delete cleanData.id;
      delete cleanData.seedData;
      
      return (
        <div className="mt-6">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
            Raw Resume Data
          </h2>
          <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            {JSON.stringify(cleanData, null, 2)}
          </pre>
        </div>
      );
    } catch (e) {
      return <p>Error parsing raw resume data</p>;
    }
  }

  handleDownloadPdf = () => {
    if (!this.resumeRef.current || !this.state.cv) return;
    
    const { studentName } = this.props;
    
    // Create a clone of the resume content for PDF generation
    const resumeContent = this.resumeRef.current.cloneNode(true) as HTMLElement;
    
    // Apply specific PDF styles
    const pdfStyles = `
      .resume-container {
        font-family: 'Arial', sans-serif;
        color: black;
        background-color: white;
        padding: 20px;
      }
      .resume-container h1 {
        color: black;
        font-size: 24px;
        margin-bottom: 8px;
      }
      .resume-container h2 {
        color: black;
        font-size: 18px;
        margin-top: 16px;
        margin-bottom: 8px;
        border-bottom: 1px solid #dddddd;
        padding-bottom: 4px;
      }
      .resume-container p {
        margin: 4px 0;
        color: black;
      }
      .resume-container .text-gray-500, 
      .resume-container .text-gray-400, 
      .resume-container .text-gray-600,
      .resume-container .text-gray-700 {
        color: #666666;
      }
      .resume-container pre {
        background-color: #f8f8f8;
        border: 1px solid #dddddd;
        padding: 8px;
        font-size: 11px;
        overflow-x: auto;
      }
      .resume-container .flex.flex-wrap.gap-2 span {
        display: inline-block;
        background-color: #f0f0f0;
        color: #333333;
        padding: 2px 8px;
        margin: 2px;
        border-radius: 4px;
      }
    `;
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = pdfStyles;
    resumeContent.prepend(styleElement);
    
    // Ensure white background and black text for PDF
    resumeContent.style.backgroundColor = 'white';
    resumeContent.style.color = 'black';
    
    // Find all elements and ensure they have appropriate print colors
    const allElements = resumeContent.querySelectorAll('*');
    allElements.forEach(el => {
      if ((el as HTMLElement).style) {
        // Remove dark mode classes
        (el as HTMLElement).classList.remove(
          'dark:bg-gray-800', 'dark:bg-gray-700', 'dark:bg-gray-900',
          'dark:text-gray-100', 'dark:text-gray-200', 'dark:text-gray-300', 'dark:text-gray-400',
          'dark:border-gray-700', 'dark:border-gray-800'
        );
      }
    });
    
    const options = {
      margin: [15, 15, 15, 15] as [number, number, number, number],
      filename: `${studentName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as 'portrait',
        compress: true
      }
    };
    
    // Use the clone for PDF generation
    html2pdf().from(resumeContent).set(options).save();
  }

  handleZoomIn = () => {
    this.setState(prevState => ({
      zoomLevel: Math.min(prevState.zoomLevel + 10, 200)
    }));
  };

  handleZoomOut = () => {
    this.setState(prevState => ({
      zoomLevel: Math.max(prevState.zoomLevel - 10, 50)
    }));
  };

  handleNextPage = () => {
    this.setState(prevState => ({
      currentPage: Math.min(prevState.currentPage + 1, prevState.totalPages)
    }));
  };

  handlePrevPage = () => {
    this.setState(prevState => ({
      currentPage: Math.max(prevState.currentPage - 1, 1)
    }));
  };

  handlePrint = () => {
    window.print();
  }

  render() {
    const { studentName, isOpen, onOpenChange } = this.props;
    const { cv, loading, error, showRawData, zoomLevel, currentPage, totalPages } = this.state;

    console.log("CVModal render - cv data:", cv);
    console.log("CVModal render - loading:", loading);
    console.log("CVModal render - error:", error);

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0">
          {/* PDF Viewer-like Header */}
          <div className="bg-gray-100 dark:bg-gray-800 border-b flex items-center justify-between p-2 sticky top-0 z-10">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-sm">{studentName}'s Resume</span>
            </div>
            
            <div className="flex items-center gap-2">
              
              <Button 
                variant="default" 
                size="sm"
                className="h-8" 
                onClick={this.handleDownloadPdf}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onOpenChange(false)}
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </Button>
            </div>
          </div>
          
          {/* PDF Viewer-like Toolbar */}
          <div className="bg-gray-50 dark:bg-gray-800 border-b flex items-center justify-between px-4 py-1 sticky top-[40px] z-10">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={this.handlePrevPage}
                disabled={currentPage <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"></path></svg>
                <span className="sr-only">Previous page</span>
              </Button>
              
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={this.handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"></path></svg>
                <span className="sr-only">Next page</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={this.handleZoomOut}
                disabled={zoomLevel <= 50}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14"></path></svg>
                <span className="sr-only">Zoom out</span>
              </Button>
              
              <span className="text-sm w-16 text-center">
                {zoomLevel}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={this.handleZoomIn}
                disabled={zoomLevel >= 200}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
                <span className="sr-only">Zoom in</span>
              </Button>
            </div>
          </div>
          
          {/* PDF Viewer-like Content */}
          <div className="flex h-[calc(90vh-88px)]">
            {/* Main Content Area with Shadow */}
            <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 p-6">
              {loading ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-4xl mx-auto p-8 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : error ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-4xl mx-auto p-8">
                  <div className="text-center text-red-500 py-4">
                    {error}
                  </div>
                </div>
              ) : !cv ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-4xl mx-auto p-8">
                  <div className="text-center py-4">
                    <p>No resume data available.</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={this.resumeRef} 
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-lg max-w-5xl mx-auto p-8 transition-transform duration-200"
                  style={{ 
                    minHeight: "calc(100% - 2rem)",
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center'
                  }}
                >
                  <div className="resume-container">
                    {this.renderParsedResume() || <p>No parsed resume data available.</p>}
                    {this.renderExperiences()}
                    {this.renderCertifications()}
                    {showRawData && this.renderRawData()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

interface ApplicationsPageState {
  applications: JobApplication[];
  loading: boolean;
  error: string | null;
  selectedCV: {
    cvId: string;
    studentName: string;
    isModalOpen: boolean;
  } | null;
  coverLetterDialog: {
    isOpen: boolean;
    content: string;
    studentName: string;
  };
  skillsDialog: {
    isOpen: boolean;
    skills: string;
    studentName: string;
  };
  filters: {
    status: ApplicationStatus | 'ALL';
    searchTerm: string;
    sortBy: 'date' | 'matchScore' | 'name';
    sortDirection: 'asc' | 'desc';
  };
}

interface JobApplicationsPageProps {
  jobId: string;
  onBackToJobs: () => void;
}

class JobApplicationsPageClass extends Component<JobApplicationsPageProps, ApplicationsPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: JobApplicationsPageProps) {
    super(props);
    console.log("JobApplicationsPageClass - Constructor - jobId:", props.jobId);
    this.state = {
      applications: [],
      loading: true,
      error: null,
      selectedCV: null,
      coverLetterDialog: {
        isOpen: false,
        content: "",
        studentName: ""
      },
      skillsDialog: {
        isOpen: false,
        skills: "",
        studentName: ""
      },
      filters: {
        status: 'ALL',
        searchTerm: '',
        sortBy: 'date',
        sortDirection: 'desc'
      }
    };
  }
  
  componentDidMount() {
    console.log("JobApplicationsPageClass - componentDidMount - jobId:", this.props.jobId);
    this.fetchApplications();
  }
  
  async fetchApplications() {
    const { jobId } = this.props;
    console.log("JobApplicationsPageClass - fetchApplications - jobId:", jobId);
    
    try {
      // Fetch applications for this job using the service
      console.log("JobApplicationsPageClass - Calling jobApplicationService.getJobApplications with jobId:", jobId);
      const applications = await jobApplicationService.getJobApplications(jobId);
      console.log("JobApplicationsPageClass - API response:", applications);
      
      this.setState({
        applications,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      this.setState({ 
        loading: false,
        error: typeof error === 'string' ? error : "Failed to load applications" 
      });
    }
  }
  
  handleUpdateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      // Call the API to update status
      await jobApplicationService.updateApplicationStatus(applicationId, { status: newStatus });
      
      // Update the local state
      this.setState(prevState => ({
        applications: prevState.applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      }));
    } catch (error) {
      console.error(`Error updating application status to ${newStatus}:`, error);
    }
  }
  
  handleViewCV = (cvId: string, studentName: string) => {
    this.setState({
      selectedCV: {
        cvId,
        studentName,
        isModalOpen: true
      }
    });
  };

  handleCloseModal = () => {
    this.setState({
      selectedCV: null
    });
  };
  
  getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Pending</span>;
      case 'REVIEWED':
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Reviewed</span>;
      case 'INTERVIEW':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Interview</span>;
      case 'ACCEPTED':
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Accept</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">Reject</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">{status}</span>;
    }
  }
  
  render() {
    // Remove comment markers for auth checks
    const { user } = this.context || {};
    const { applications, loading, error, selectedCV, coverLetterDialog, skillsDialog } = this.state;
    const { onBackToJobs } = this.props;
    const jobTitle = applications.length > 0 ? applications[0].jobTitle : "Job";
    
    // Remove comment markers for auth redirects
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return (
      <div className="space-y-6">
        {selectedCV && (
          <CVModal
            cvId={selectedCV.cvId}
            studentName={selectedCV.studentName}
            isOpen={selectedCV.isModalOpen}
            onOpenChange={(open) => {
              if (!open) this.handleCloseModal();
            }}
          />
        )}
        
        <Dialog open={coverLetterDialog.isOpen} onOpenChange={(open) => {
          if (!open) this.handleCloseCoverLetterDialog();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{coverLetterDialog.studentName}'s Cover Letter</DialogTitle>
              <DialogDescription>
                Review the applicant's cover letter below
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] mt-4">
              <div className="space-y-4 p-2">
                <p className="text-sm whitespace-pre-wrap">{coverLetterDialog.content}</p>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog open={skillsDialog.isOpen} onOpenChange={(open) => {
          if (!open) this.handleCloseSkillsDialog();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{skillsDialog.studentName}'s Skills</DialogTitle>
              <DialogDescription>
                Complete list of applicant skills
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {skillsDialog.skills && skillsDialog.skills.split(',').map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {loading ? (
              <Skeleton className="h-8 w-72 mb-2" />
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight">{jobTitle} - Applications</h1>
                <p className="text-muted-foreground">
                  Manage applications for this position
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBackToJobs}>
              Back to Jobs
            </Button>
            <Button onClick={() => this.fetchApplications()}>
              Refresh
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                {error}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                <p className="text-lg font-medium">No applications yet</p>
                <p className="text-sm">Applications will appear here when candidates apply for this position.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-4">
                  {/* Search and filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by name, university, major, or skills..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={this.state.filters.searchTerm}
                        onChange={this.handleSearchChange}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="relative">
                        <select 
                          className="appearance-none bg-background border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={this.state.filters.status}
                          onChange={(e) => this.handleStatusFilterChange(e.target.value as ApplicationStatus | 'ALL')}
                        >
                          <option value="ALL">All Status</option>
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      <div className="relative">
                        <select 
                          className="appearance-none bg-background border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={this.state.filters.sortBy}
                          onChange={(e) => this.handleSortChange(e.target.value as 'date' | 'matchScore' | 'name')}
                        >
                          <option value="date">Sort by Date</option>
                          <option value="matchScore">Sort by Match</option>
                          <option value="name">Sort by Name</option>
                        </select>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => this.handleSortChange(this.state.filters.sortBy)}
                        title={`Sort ${this.state.filters.sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
                      >
                        {this.state.filters.sortDirection === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Status filter pills */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={this.state.filters.status === 'ALL' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => this.handleStatusFilterChange('ALL')}
                    >
                      All
                    </Button>
                    <Button
                      variant={this.state.filters.status === 'PENDING' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => this.handleStatusFilterChange('PENDING')}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={this.state.filters.status === 'REVIEWED' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => this.handleStatusFilterChange('REVIEWED')}
                    >
                      Reviewed
                    </Button>
                    <Button
                      variant={this.state.filters.status === 'INTERVIEW' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => this.handleStatusFilterChange('INTERVIEW')}
                    >
                      Interview
                    </Button>
                    <Button
                      variant={this.state.filters.status === 'ACCEPTED' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => this.handleStatusFilterChange('ACCEPTED')}
                    >
                      Accepted
                    </Button>
                    <Button
                      variant={this.state.filters.status === 'REJECTED' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-full"
                      onClick={() => this.handleStatusFilterChange('REJECTED')}
                    >
                      Rejected
                    </Button>
                    
                    {(this.state.filters.status !== 'ALL' || 
                      this.state.filters.searchTerm !== '' || 
                      this.state.filters.sortBy !== 'date' || 
                      this.state.filters.sortDirection !== 'desc') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full ml-auto"
                        onClick={this.handleResetFilters}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reset Filters
                      </Button>
                    )}
                  </div>
                  
                  {/* Results count */}
                  <div className="text-sm text-muted-foreground">
                    Showing {this.getFilteredApplications().length} of {applications.length} applications
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {this.getFilteredApplications().map(application => (
                    <div key={application.id} className="bg-background border rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                            {application.studentFirstName?.charAt(0)}{application.studentLastName?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{application.studentFullName}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {application.studentUniversity} - {application.studentMajor}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Match Score</span>
                              <span className="text-sm font-medium">{application.matchScore ? application.matchScore.toFixed(2) : '0'}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                              <div 
                                className="h-2.5 rounded-full bg-primary" 
                                style={{ width: `${application.matchScore || 0}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {application.studentSkills && application.studentSkills.split(',').slice(0, 8).map((skill, index) => (
                                <span key={index} className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full">
                                  {skill.trim()}
                                </span>
                              ))}
                              {application.studentSkills && application.studentSkills.split(',').length > 8 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-xs p-0 h-auto"
                                  onClick={() => this.handleViewSkills(application.studentSkills, application.studentFullName)}
                                >
                                  +{application.studentSkills.split(',').length - 8} more
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Cover Letter</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {application.coverLetter || "No cover letter provided"}
                            </p>
                            {application.coverLetter && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs p-0 h-auto mt-1"
                                onClick={() => this.handleViewCoverLetter(application.coverLetter, application.studentFullName)}
                              >
                                Read full cover letter
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              title="View CV"
                              onClick={() => this.handleViewCV(application.cvId, application.studentFullName)}
                              className="rounded-full"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View CV
                            </Button>
                            
                            <div className="ml-auto flex flex-wrap gap-2">
                              
                              <Button
                                variant="outline"
                                size="sm"
                                title="Contact Applicant"
                                onClick={() => window.location.href = `mailto:${application.studentFirstName}.${application.studentLastName}@example.com`}
                                className="rounded-full"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Contact
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {application.status === 'PENDING' && (
                              <Button
                                variant="default"
                                size="sm"
                                title="Mark as Reviewed"
                                onClick={() => this.handleUpdateStatus(application.id, 'REVIEWED')}
                                className="rounded-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            )}
                            
                            {(application.status === 'PENDING' || application.status === 'REVIEWED') && (
                              <Button
                                variant="default"
                                size="sm"
                                className="rounded-full bg-blue-600 hover:bg-blue-700"
                                title="Schedule Interview"
                                onClick={() => this.handleUpdateStatus(application.id, 'INTERVIEW')}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Interview
                              </Button>
                            )}
                            
                            {(application.status === 'PENDING' || application.status === 'REVIEWED' || application.status === 'INTERVIEW') && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="rounded-full bg-green-600 hover:bg-green-700"
                                  title="Accept Application"
                                  onClick={() => this.handleUpdateStatus(application.id, 'ACCEPTED')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="rounded-full"
                                  title="Reject Application"
                                  onClick={() => this.handleUpdateStatus(application.id, 'REJECTED')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm text-muted-foreground">
                                {this.formatDate(application.appliedAt)}
                              </span>
                            </div>
                            {this.getStatusLabel(application.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  handleDownloadCV = (cvId: string) => {
    window.open(`/api/cvs/${cvId}/download`, '_blank');
  };

  handleViewCoverLetter = (content: string, studentName: string) => {
    this.setState({
      coverLetterDialog: {
        isOpen: true,
        content,
        studentName
      }
    });
  };

  handleCloseCoverLetterDialog = () => {
    this.setState({
      coverLetterDialog: {
        isOpen: false,
        content: "",
        studentName: ""
      }
    });
  };

  handleViewSkills = (skills: string, studentName: string) => {
    this.setState({
      skillsDialog: {
        isOpen: true,
        skills,
        studentName
      }
    });
  };

  handleCloseSkillsDialog = () => {
    this.setState({
      skillsDialog: {
        isOpen: false,
        skills: "",
        studentName: ""
      }
    });
  };

  formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  handleFilterChange = (filterType: keyof ApplicationsPageState['filters'], value: any) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [filterType]: value
      }
    }));
  };

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.handleFilterChange('searchTerm', e.target.value);
  };

  handleStatusFilterChange = (status: ApplicationStatus | 'ALL') => {
    this.handleFilterChange('status', status);
  };

  handleSortChange = (sortBy: 'date' | 'matchScore' | 'name') => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        sortBy,
        sortDirection: prevState.filters.sortBy === sortBy && prevState.filters.sortDirection === 'desc' ? 'asc' : 'desc'
      }
    }));
  };

  handleResetFilters = () => {
    this.setState({
      filters: {
        status: 'ALL',
        searchTerm: '',
        sortBy: 'date',
        sortDirection: 'desc'
      }
    });
  };

  getFilteredApplications = () => {
    const { applications } = this.state;
    const { status, searchTerm, sortBy, sortDirection } = this.state.filters;

    // First filter by status and search term
    let filtered = applications.filter(app => {
      // Filter by status
      if (status !== 'ALL' && app.status !== status) {
        return false;
      }

      // Filter by search term
      if (searchTerm && !this.matchesSearchTerm(app, searchTerm)) {
        return false;
      }

      return true;
    });

    // Then sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
          break;
        case 'matchScore':
          comparison = (a.matchScore || 0) - (b.matchScore || 0);
          break;
        case 'name':
          comparison = a.studentFullName.localeCompare(b.studentFullName);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  matchesSearchTerm = (application: JobApplication, searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return (
      application.studentFullName.toLowerCase().includes(term) ||
      application.studentUniversity.toLowerCase().includes(term) ||
      application.studentMajor.toLowerCase().includes(term) ||
      (application.studentSkills && application.studentSkills.toLowerCase().includes(term))
    );
  };
}

// Wrapper component to provide URL params and navigation
export const JobApplicationsPage: React.FC = () => {
  const params = useParams();
  const jobId = params.jobId;
  const navigate = useNavigate();
  
  console.log("JobApplicationsPage - Route params:", params);
  console.log("JobApplicationsPage - jobId:", jobId);
  
  // Handle case when jobId is undefined (should not happen with proper routing)
  if (!jobId) {
    console.log("JobApplicationsPage - No jobId, redirecting to jobs list");
    return <Navigate to="/employer/jobs" />;
  }
  
  // Handle navigation back to jobs list
  const handleBackToJobs = () => {
    navigate('/employer/jobs');
  };
  
  return <JobApplicationsPageClass jobId={jobId} onBackToJobs={handleBackToJobs} />;
}; 
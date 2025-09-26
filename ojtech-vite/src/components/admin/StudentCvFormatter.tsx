import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { FileText, Download, Code } from 'lucide-react';

interface StudentCvFormatterProps {
  cvHtml: string;
  studentProfile: any;
}

/**
 * StudentCvFormatter component for displaying student CV in different formats
 * This component is used on the admin side to view and manage student CVs
 */
const StudentCvFormatter: React.FC<StudentCvFormatterProps> = ({ cvHtml, studentProfile }) => {
  const [activeTab, setActiveTab] = useState<string>('preview');
  
  // Function to download CV as HTML
  const downloadCvAsHtml = () => {
    const blob = new Blob([cvHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentProfile.firstName}_${studentProfile.lastName}_CV.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to download CV as PDF (requires server-side implementation)
  const downloadCvAsPdf = () => {
    // This would typically call a server endpoint that converts HTML to PDF
    alert('PDF download functionality requires server-side implementation');
  };

  return (
    <Card className="mt-4 overflow-hidden">
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Student CV</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCvAsHtml}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            HTML
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadCvAsPdf}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-4">
          <TabsList className="bg-transparent">
            <TabsTrigger value="preview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              Preview
            </TabsTrigger>
            <TabsTrigger value="source" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Source
              </div>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="p-0 m-0">
          <iframe
            title="Resume Preview"
            className="w-full h-[800px] border-0 bg-white"
            sandbox="allow-same-origin allow-scripts"
            srcDoc={cvHtml}
          />
        </TabsContent>
        
        <TabsContent value="source" className="p-0 m-0">
          <div className="p-4 overflow-auto bg-gray-50">
            <pre className="text-xs">{cvHtml}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default StudentCvFormatter;

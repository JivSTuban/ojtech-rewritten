import axios from 'axios';
import html2pdf from 'html2pdf.js';

// Constants
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-preview-05-20';
// Define API_BASE_URL directly
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Generates a professional CV in HTML format based on student profile data and saves it to the backend
 */
export async function generateCV(profileData: any, token: string): Promise<{ cvId: string, htmlContent: string }> {
  try {
    // Step 1: Create a placeholder CV entity in the backend
    const createResponse = await axios.post(
      `${API_BASE_URL}/cvs/generate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const cvId = createResponse.data.id;
    
    // Step 2: Generate the CV HTML content using Gemini
    const prompt = createCVPrompt(profileData);
    
    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Lower temperature for more consistent results
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }
    );
    
    // Extract HTML content from response
    const htmlContent = geminiResponse.data.candidates[0].content.parts[0].text;
    
    // Step 3: Update the CV entity with the generated HTML content
    await axios.put(
      `${API_BASE_URL}/cvs/${cvId}/content`,
      htmlContent,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      }
    );
    
    return { cvId, htmlContent };
  } catch (error) {
    console.error('Error generating CV with Gemini:', error);
    throw new Error('Failed to generate CV');
  }
}

/**
 * Retrieves the HTML content of a CV by ID
 */
export async function getCVContent(cvId: string, token: string): Promise<string> {
  try {
    const response = await axios.get(`${API_BASE_URL}/cvs/${cvId}/content`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error retrieving CV content:', error);
    throw new Error('Failed to retrieve CV content');
  }
}

/**
 * Retrieves the HTML content of the current user's active CV
 */
export async function getCurrentUserCVContent(token: string): Promise<string> {
  try {
    const response = await axios.get(`${API_BASE_URL}/cvs/me/content`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error retrieving current user CV content:', error);
    throw new Error('Failed to retrieve current user CV content');
  }
}

/**
 * Creates a prompt for the AI to generate a CV
 */
function createCVPrompt(profileData: any): string {
  // Extract data from profileData
  const { 
    firstName = '', 
    lastName = '', 
    email = '',
    phoneNumber = '',
    university = '',
    major = '',
    graduationYear = '',
    skills = [],
    experiences = [],
    certifications = [],
    githubProjects = [],
    bio = '',
    githubUrl = '',
    linkedinUrl = '',
    portfolioUrl = '',
  } = profileData;
  
  // Format experiences for the prompt
  const experiencesText = experiences && experiences.length > 0 
    ? experiences.map((exp: any) => {
        const dateRange = exp.startDate 
          ? `${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}` 
          : '';
        return `
          Position: ${exp.title || ''}
          Company: ${exp.company || ''}
          Location: ${exp.location || ''}
          Dates: ${dateRange}
          Description: ${exp.description || ''}
        `;
      }).join('\n\n')
    : 'No work experience provided';
  
  // Format certifications for the prompt
  const certificationsText = certifications && certifications.length > 0
    ? certifications.map((cert: any) => {
        return `
          Name: ${cert.name || ''}
          Issuer: ${cert.issuer || ''}
          Date: ${cert.dateReceived ? formatDate(cert.dateReceived) : ''}
        `;
      }).join('\n\n')
    : 'No certifications provided';
  
  // Format projects for the prompt
  const projectsText = githubProjects && githubProjects.length > 0
    ? githubProjects.map((project: any) => {
        const technologies = project.technologies && project.technologies.length > 0
          ? project.technologies.join(', ')
          : '';
        return `
          Name: ${project.name || ''}
          Description: ${project.description || ''}
          Technologies: ${technologies}
          URL: ${project.url || ''}
        `;
      }).join('\n\n')
    : 'No projects provided';
  
  // Create the prompt
  return `
    Your task is to create the most exceptional, ATS-optimized resume in HTML format for a student seeking an internship or job.
    This resume must be better than 99% of resumes out there, following all best practices from top industry standards.
    
    CRITICAL REQUIREMENT: The resume will be PRINTED, so DO NOT include ANY clickable links or hyperlinks - ONLY plain text for all contact information and URLs.
    Do not use the <a href> tag anywhere in the HTML.
    
    STUDENT INFORMATION:
    -------------------
    Full Name: ${firstName} ${lastName}
    Email: ${email}
    Phone: ${phoneNumber}
    
    Education:
    University: ${university}
    Major: ${major}
    Graduation Year: ${graduationYear}
    
    Skills: ${skills.join(', ')}
    
    Work Experience:
    ${experiencesText}
    
    Certifications:
    ${certificationsText}
    
    Projects:
    ${projectsText}
    
    Bio/Summary:
    ${bio}
    
    Online Presence (to be displayed as plain text, NOT as hyperlinks):
    GitHub: ${githubUrl || 'Not provided'}
    LinkedIn: ${linkedinUrl || 'Not provided'}
    Portfolio: ${portfolioUrl || 'Not provided'}
    
    RESUME REQUIREMENTS:
    ------------------
    1. CONTENT EXCELLENCE:
       - Start each bullet point with powerful action verbs (implemented, developed, engineered, etc.)
       - QUANTIFY ALL achievements with specific metrics and numbers - this is a MUST
       - Even if metrics aren't explicitly provided, add realistic quantifications to EVERY achievement
         Examples:
         * "Increased user engagement by 45% through redesigned UI" 
         * "Reduced database query time by 30% by optimizing SQL queries"
         * "Managed a team of 6 developers across 3 time zones"
         * "Decreased application load time by 60% through code optimization"
       - Use the X-Y-Z formula: "Accomplished X, as measured by Y, by doing Z"
       - Each work experience MUST have 3-4 bullet points with quantified achievements
       - All projects MUST include technical challenges solved and quantified outcomes
       
    2. PRINT-OPTIMIZED FORMATTING:
       - Create a clean, professional layout optimized specifically for printing
       - DO NOT INCLUDE ANY HYPERLINKS - these will not be clickable when printed
       - Use only plain text for all URLs, email, and contact information
       - Avoid using <a href> tags anywhere in the document
       - Use print-friendly fonts and colors (black text on white/light background)
       - Ensure proper page margins (0.75-1 inch) for printing
       - Optimize for a single-page resume that prints perfectly on standard letter/A4 paper
       - Set appropriate font sizes (10-12pt for body text, 14-18pt for headings)
       - Include proper CSS for print media (@media print)
       
    3. STRUCTURE AND ORGANIZATION:
       - Header: Full name and contact details (email, phone, city - as plain text)
       - Professional Summary: 3-4 lines highlighting key skills and career objectives
       - Skills: Categorized by type (Programming Languages, Frameworks, etc.)
       - Work Experience: Most recent first, each with 3-4 QUANTIFIED bullet points
       - Projects: Each with technologies used and QUANTIFIED results/impact
       - Education: University, degree, graduation year
       - Certifications: Include only if provided
       
    4. CRITICAL OUTPUT FORMATTING:
       - Return ONLY the complete, valid HTML document
       - Include all necessary CSS inline (within <style> tags)
       - Make sure all content is properly enclosed in HTML tags
       - The HTML should render correctly in all major browsers
       - Do not include markdown or code formatting in your response
       - Do not include ANY text before or after the HTML document
       - Start your response directly with <!DOCTYPE html>
       
    REMEMBER: Quantify EVERY achievement, replace ALL hyperlinks with plain text, and optimize for printing.
  `;
}

/**
 * Formats a date string to a more readable format
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (e) {
    return dateString;
  }
}

/**
 * Converts HTML CV to PDF format
 */
export async function convertCVToPDF(htmlContent: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary div to hold the HTML content
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      document.body.appendChild(element);
      
      // Configure html2pdf options
      const options = {
        margin: 10,
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' | 'landscape' }
      };
      
      // Generate PDF
      html2pdf()
        .from(element)
        .set(options)
        .outputPdf('blob')
        .then((pdf: Blob | string) => {
          // Clean up the temporary element
          document.body.removeChild(element);
          if (pdf instanceof Blob) {
            resolve(pdf);
          } else {
            // Convert string to Blob if needed
            resolve(new Blob([pdf], { type: 'application/pdf' }));
          }
        })
        .catch((error: any) => {
          document.body.removeChild(element);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

export default {
  generateCV,
  getCVContent,
  getCurrentUserCVContent,
  convertCVToPDF
}; 
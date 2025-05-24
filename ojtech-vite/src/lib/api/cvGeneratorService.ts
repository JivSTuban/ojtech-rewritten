import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { CV_TEMPLATE } from '../templates/cvTemplate';
import authService from './authService';

// Constants
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-preview-05-20';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Add these interfaces at the top of the file
interface ResumeData {
  professionalSummary?: {
    summaryPoints: string[];
  };
  skills?: {
    skillsList: string[];
  };
  experience?: {
    experiences: {
      title: string;
      company: string;
      location?: string;
      dateRange: string;
      achievements: string[];
    }[];
  };
  projects?: {
    projectsList: {
      name: string;
      technologies?: string;
      highlights: string[];
    }[];
  };
  education?: {
    university: string;
    major: string;
    graduationYear?: string;
    location?: string;
  };
  certifications?: {
    certificationsList: {
      name: string;
      issuer: string;
      dateReceived?: string;
    }[];
  };
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    address?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

/**
 * Converts JSON resume data to HTML format
 */
function generateHTMLFromJSON(jsonData: ResumeData | any): string {
  try {
    console.log('Generating HTML from JSON data:', jsonData);
    
    // Check if jsonData is actually in the expected format
    if (!jsonData || typeof jsonData !== 'object') {
      console.error('Invalid JSON data for HTML generation:', jsonData);
      throw new Error('Invalid data format');
    }
    
    // Handle if we were passed the full CV object instead of just the resume content
    if (jsonData.id && jsonData.active !== undefined && jsonData.parsedResume) {
      console.log('Received CV object instead of resume data, extracting parsedResume');
      // If parsedResume is a JSON string, parse it
      if (typeof jsonData.parsedResume === 'string') {
        try {
          // If it seems to be HTML, return it directly
          if (jsonData.parsedResume.includes('<!DOCTYPE html>') || 
              jsonData.parsedResume.includes('<html>')) {
            return jsonData.parsedResume;
          }
          // Otherwise try to parse it as JSON
          const parsedData = JSON.parse(jsonData.parsedResume);
          jsonData = parsedData;
        } catch (e) {
          console.error('Error parsing parsedResume as JSON:', e);
          // If it's a string but not parseable as JSON, assume it's raw HTML
          return jsonData.parsedResume;
        }
      }
    }
    
    // Extract data with null safety
    const contactInfo = jsonData.contactInfo || {
      name: '',
      email: '',
      phone: '',
      location: '',
      address: '',
      linkedin: '',
      github: '',
      portfolio: ''
    };
    
    // If contactInfo is provided, use it, otherwise try to build from top-level properties
    const name = contactInfo.name || `${jsonData.firstName || ''} ${jsonData.lastName || ''}`.trim() || 'Name Not Provided';
    const email = contactInfo.email || jsonData.email || '';
    const phone = contactInfo.phone || jsonData.phoneNumber || '';
    const location = contactInfo.location || jsonData.location || '';
    const linkedin = contactInfo.linkedin || jsonData.linkedinUrl || '';
    const github = contactInfo.github || jsonData.githubUrl || '';
    const portfolio = contactInfo.portfolio || jsonData.portfolioUrl || '';
    
    // Extract sections safely
    const professionalSummary = jsonData.professionalSummary?.summaryPoints || 
                              (jsonData.bio ? [jsonData.bio] : []);
    
    let skills = [];
    if (jsonData.skills?.skillsList && Array.isArray(jsonData.skills.skillsList)) {
      skills = jsonData.skills.skillsList;
    } else if (jsonData.skills && Array.isArray(jsonData.skills)) {
      skills = jsonData.skills;
    }
    
    let experiences = [];
    if (jsonData.experience?.experiences && Array.isArray(jsonData.experience.experiences)) {
      experiences = jsonData.experience.experiences;
    } else if (jsonData.experiences && Array.isArray(jsonData.experiences)) {
      experiences = jsonData.experiences.map((exp: any) => {
        // Convert raw experience format to template format
        const dateRange = exp.startDate ? 
          `${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate || '')}` : '';
        
        return {
          title: exp.title || '',
          company: exp.company || '',
          location: exp.location || '',
          dateRange: dateRange,
          achievements: exp.description ? [exp.description] : []
        };
      });
    }
    
    let projects = [];
    if (jsonData.projects?.projectsList && Array.isArray(jsonData.projects.projectsList)) {
      projects = jsonData.projects.projectsList;
    } else if (jsonData.githubProjects && Array.isArray(jsonData.githubProjects)) {
      projects = jsonData.githubProjects.map((project: any) => {
        // Convert raw project format to template format
        return {
          name: project.name || '',
          technologies: project.technologies || '',
          highlights: project.description ? [project.description] : []
        };
      });
    }
    
    // Extract education safely
    const education = jsonData.education || {
      university: jsonData.university || '',
      major: jsonData.major || '',
      graduationYear: jsonData.graduationYear || '',
      location: ''
    };
    
    // Extract certifications safely
    let certifications = [];
    if (jsonData.certifications?.certificationsList && Array.isArray(jsonData.certifications.certificationsList)) {
      certifications = jsonData.certifications.certificationsList;
    } else if (jsonData.certifications && Array.isArray(jsonData.certifications)) {
      certifications = jsonData.certifications.map((cert: any) => {
        // Convert raw certification format to template format
        return {
          name: cert.name || '',
          issuer: cert.issuer || '',
          dateReceived: cert.dateReceived ? formatDate(cert.dateReceived) : ''
        };
      });
    }
    
    // Generate HTML using a clean, modern resume template
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${name} - Resume</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
          background: #fff;
          color: #333;
          line-height: 1.5;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        .resume-container {
          max-width: 100%;
        }
        .header {
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #eee;
          padding-bottom: 1rem;
        }
        h1 {
          font-size: 2rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.9rem;
          color: #4a5568;
        }
        .contact-info div {
          display: flex;
          align-items: center;
        }
        .section {
          margin-bottom: 1.5rem;
        }
        h2 {
          font-size: 1.3rem;
          color: #2d3748;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.25rem;
        }
        .summary {
          margin-bottom: 1.5rem;
        }
        .summary ul {
          padding-left: 1.5rem;
        }
        .summary li {
          margin-bottom: 0.5rem;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          list-style: none;
        }
        .skill-item {
          background: #f7fafc;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          border: 1px solid #e2e8f0;
        }
        .work-item, .project-item, .education-item, .certification-item {
          margin-bottom: 1.25rem;
        }
        h3 {
          font-size: 1.1rem;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }
        .work-meta, .project-meta, .education-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }
        .work-description ul, .project-description ul {
          padding-left: 1.5rem;
          margin-top: 0.5rem;
        }
        .work-description li, .project-description li {
          margin-bottom: 0.25rem;
        }
        .links {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .links a {
          color: #4299e1;
          text-decoration: none;
        }
        .links a:hover {
          text-decoration: underline;
        }
        @media print {
          body {
            padding: 0;
          }
          .resume-container {
            padding: 0.5in;
          }
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <header class="header">
          <h1>${name}</h1>
          <div class="contact-info">
            ${email ? `<div>${email}</div>` : ''}
            ${phone ? `<div>${phone}</div>` : ''}
            ${location ? `<div>${location}</div>` : ''}
            
            <div class="links">
              ${linkedin ? `<a href="${linkedin}" target="_blank">LinkedIn</a>` : ''}
              ${github ? `<a href="${github}" target="_blank">GitHub</a>` : ''}
              ${portfolio ? `<a href="${portfolio}" target="_blank">Portfolio</a>` : ''}
            </div>
          </div>
        </header>
        
        ${professionalSummary.length > 0 ? `
        <section class="section summary">
          <h2>Professional Summary</h2>
          <ul>
            ${professionalSummary.map((point: string) => `<li>${point}</li>`).join('')}
          </ul>
        </section>
        ` : ''}
        
        ${skills.length > 0 ? `
        <section class="section skills-section">
          <h2>Skills</h2>
          <ul class="skills-list">
            ${skills.map((skill: string) => `<li class="skill-item">${skill}</li>`).join('')}
          </ul>
        </section>
        ` : ''}
        
        ${experiences.length > 0 ? `
        <section class="section experience-section">
          <h2>Experience</h2>
          ${experiences.map((exp: any) => `
            <div class="work-item">
              <h3>${exp.title}</h3>
              <div class="work-meta">
                <span>${exp.company}${exp.location ? `, ${exp.location}` : ''}</span>
                <span>${exp.dateRange}</span>
              </div>
              <div class="work-description">
                <ul>
                  ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${projects.length > 0 ? `
        <section class="section projects-section">
          <h2>Projects</h2>
          ${projects.map((project: any) => `
            <div class="project-item">
              <h3>${project.name}</h3>
              ${project.technologies ? `<div class="project-meta">${project.technologies}</div>` : ''}
              <div class="project-description">
                <ul>
                  ${project.highlights.map((highlight: string) => `<li>${highlight}</li>`).join('')}
                </ul>
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}
        
        ${education.university ? `
        <section class="section education-section">
          <h2>Education</h2>
          <div class="education-item">
            <h3>${education.university}</h3>
            <div class="education-meta">
              <span>${education.major || ''}</span>
              <span>${education.graduationYear || ''}</span>
            </div>
            ${education.location ? `<div>${education.location}</div>` : ''}
          </div>
        </section>
        ` : ''}
        
        ${certifications.length > 0 ? `
        <section class="section certifications-section">
          <h2>Certifications</h2>
          ${certifications.map((cert: any) => `
            <div class="certification-item">
              <h3>${cert.name}</h3>
              <div class="work-meta">
                <span>${cert.issuer}</span>
                <span>${cert.dateReceived || ''}</span>
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}
      </div>
    </body>
    </html>
    `;
    
    return html;
  } catch (error) {
    console.error('Error generating HTML from JSON:', error);
    // Return a basic error template
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume Generation Error</title>
      </head>
      <body>
        <h1>Error Generating Resume</h1>
        <p>There was an error processing your resume data. Please try again later.</p>
      </body>
      </html>
    `;
  }
}

/**
 * Creates a prompt for the AI to format resume content
 */
function createCVPrompt(profileData: any): string {
  // Extract data from profileData
  const { 
    firstName = '', 
    lastName = '', 
    email = '',
    phoneNumber = '',
    location = '',
    address = '',
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
    Format the following resume information into optimized content. DO NOT create any HTML - just return a JSON object with the formatted content.
    Focus on creating impactful bullet points and quantifying achievements.
    
    STUDENT INFORMATION:
    -------------------
    Full Name: ${firstName} ${lastName}
    Email: ${email}
    Phone: ${phoneNumber}
    Location: ${location}
    Address: ${address}
    
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
    
    Online Presence:
    GitHub: ${githubUrl || 'Not provided'}
    LinkedIn: ${linkedinUrl || 'Not provided'}
    Portfolio: ${portfolioUrl || 'Not provided'}
    
    REQUIREMENTS:
    ------------
    1. Return a JSON object with the following structure:
       {
         "professionalSummary": {
           "summaryPoints": ["point1", "point2", "point3"]  // 3-4 bullet points
         },
         "skills": {
           "skillsList": ["skill1", "skill2", ...]  // Categorized and organized skills
         },
         "experience": {
           "experiences": [
             {
               "title": "Job Title",
               "company": "Company Name",
               "location": "Location",
               "dateRange": "Date Range",
               "achievements": ["achievement1", "achievement2", ...]  // 3-4 bullet points per role
             }
           ]
         },
         "projects": {
           "projectsList": [
             {
               "name": "Project Name",
               "technologies": "Tech Stack",
               "highlights": ["highlight1", "highlight2", ...]  // 2-3 bullet points per project
             }
           ]
         },
         "education": {
           "university": "University Name",
           "major": "Major",
           "graduationYear": "Year",
           "location": "Location"
         },
         "certifications": {
           "certificationsList": [
             {
               "name": "Cert Name",
               "issuer": "Issuer",
               "dateReceived": "Date"
             }
           ]
         },
         "contactInfo": {
           "name": "Full Name",
           "email": "Email",
           "phone": "Phone",
           "location": "Location",
           "address": "Full Address",
           "linkedin": "LinkedIn URL",
           "github": "GitHub URL",
           "portfolio": "Portfolio URL"
         }
       }
    
    2. For each bullet point:
       - Start with a strong action verb
       - Include specific metrics and numbers
       - Focus on achievements and impact
       - Use the X-Y-Z formula: "Accomplished X, as measured by Y, by doing Z"
    
    3. Professional Summary points should:
       - Highlight key skills and achievements
       - Include relevant industry keywords
       - Focus on value proposition
       - Be concise but impactful
       - Include location information when relevant
    
    4. Format all dates consistently as "MMM YYYY" (e.g., "Jan 2024")
    
    5. Include the location in the contact information section and in the professional summary if relevant
    
    RESPONSE FORMAT:
    --------------
    Return ONLY the JSON object with the formatted content. Do not include any other text or explanation.
    The JSON will be used to populate a pre-defined template, so stick strictly to the specified structure.
  `;
}

/**
 * Generates a professional CV in HTML format based on student profile data and saves it to the backend
 */
export const generateCV = async (profileData: any): Promise<any> => {
  const token = authService.getCurrentUser()?.accessToken;
  if (!token) {
    throw new Error('Authentication token is required');
  }

  console.log('Making CV generation request with token:', token.substring(0, 15) + '...');
  console.log('Profile data keys:', Object.keys(profileData));
  console.log('API URL:', `${API_BASE_URL}/cvs/cv/generate`);
  
  // Log some key profile data for debugging
  console.log('First name:', profileData.firstName);
  console.log('Last name:', profileData.lastName);
  console.log('Email:', profileData.email);
  
  if (profileData.skills) {
    console.log('Skills count:', profileData.skills.length);
  }
  
  try {
    // First create a CV record
    console.log('API_BASE_URL:', API_BASE_URL);
    
    // Create CV record first
    const createResponse = await axios.post(
      `${API_BASE_URL}/cvs/generate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('CV record created:', createResponse.status, createResponse.data);
    
    if (!createResponse.data || !createResponse.data.id) {
      throw new Error('Failed to create CV record');
    }
    
    const cvId = createResponse.data.id;
    console.log('Generated CV ID:', cvId);
    
    // Then generate the CV content
    console.log('Generating CV content with endpoint:', `${API_BASE_URL}/cvs/cv/generate`);
    
    try {
      const contentResponse = await axios.post(
        `${API_BASE_URL}/cvs/cv/generate`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Content response received:', contentResponse.status);
      console.log('Content response headers:', contentResponse.headers);
      console.log('Content response type:', typeof contentResponse.data);
      if (typeof contentResponse.data === 'string') {
        console.log('Content response preview:', contentResponse.data.substring(0, 100) + '...');
      } else if (contentResponse.data) {
        console.log('Content response keys:', Object.keys(contentResponse.data));
      }
      
      // Parse response data
      let data;
      try {
        if (typeof contentResponse.data === 'string') {
          console.log('Content response is a string, length:', contentResponse.data.length);
          try {
            data = JSON.parse(contentResponse.data);
            console.log('Successfully parsed string to JSON:', Object.keys(data));
          } catch (parseError) {
            console.error('Error parsing string as JSON, treating as raw string:', parseError);
            // If failed to parse as JSON, use the raw HTML if it seems valid
            if (contentResponse.data.includes('<!DOCTYPE html>') || contentResponse.data.includes('<html>')) {
              console.log('String appears to be HTML, using as direct output');
              return {
                htmlContent: contentResponse.data,
                id: cvId
              };
            }
            data = { raw: contentResponse.data };
          }
        } else {
          console.log('Content response is an object:', typeof contentResponse.data);
          data = contentResponse.data;
          console.log('Object data keys:', Object.keys(data));
        }
        console.log('Successfully processed response data');
      } catch (e) {
        console.error('Error processing response data:', e);
        // Even if we can't parse it, let's use the raw response
        data = contentResponse.data;
        
        // Log the structure to help debug
        console.log('Using raw data, type:', typeof data);
        if (typeof data === 'string') {
          console.log('Raw data preview:', data.substring(0, 100) + '...');
        } else if (data !== null && typeof data === 'object') {
          console.log('Raw data keys:', Object.keys(data));
        }
      }
      
      // Generate HTML based on the received data
      const htmlContent = generateHTMLFromJSON(data);
      console.log('HTML content generated, length:', htmlContent.length);
      
      // Update the CV record with the generated HTML
      await axios.put(
        `${API_BASE_URL}/cvs/${cvId}/content`,
        htmlContent,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/html'
          }
        }
      );
      
      console.log('CV content updated successfully');
      
      // Return the generated HTML and the CV ID
      return {
        htmlContent,
        id: cvId
      };
    } catch (cvGenerationError: any) {
      console.error('Error in CV content generation step:', cvGenerationError);
      // If we have a response
      if (cvGenerationError.response) {
        console.error(`CV generation failed with status ${cvGenerationError.response.status}:`, 
                     cvGenerationError.response.data);
        
        // For 404 errors on the endpoint, show a special error message
        if (cvGenerationError.response.status === 404) {
          throw new Error('CV generation endpoint not found. Please check API configuration.');
        }
      }
      
      // Rethrow the error to be caught by the outer catch
      throw cvGenerationError;
    }
  } catch (error: any) {
    console.error('Error generating CV:', error);
    
    // Format error message for better user experience
    let errorMessage = 'Failed to generate resume. Please try again later.';
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      // Log all error response details for debugging
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          console.error('Error response text:', error.response.data.substring(0, 500) + '...');
        } else if (error.response.data.message) {
          console.error('Error message:', error.response.data.message);
        } else {
          console.error('Error data structure:', JSON.stringify(error.response.data));
        }
      }
      
      // Try to extract error message from response
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          // If it's a string, use it directly
          errorMessage = error.response.data.length > 100 
            ? error.response.data.substring(0, 100) + '...' 
            : error.response.data;
        } else if (error.response.data.message) {
          // If it has a message property
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          // If it has an error property
          errorMessage = error.response.data.error;
        }
      }
      
      // Handle specific error codes
      if (error.response.status === 401 || error.response.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data.message || 'Invalid profile data provided.';
      } else if (error.response.status === 429) {
        errorMessage = 'Too many resume generation requests. Please try again later.';
      } else if (error.response.status === 500) {
        console.error('Server error:', error.response.data);
        errorMessage = 'Server error occurred while generating resume. Please try again later.';
        
        // If we have more detailed error information, include it
        if (error.response.data && error.response.data.message) {
          errorMessage += ` Details: ${error.response.data.message}`;
        }
      }
    } else if (error.request) {
      console.error('No response received from server');
      errorMessage = 'No response received from server. Please check your internet connection.';
    } else {
      console.error('Error message:', error.message);
      errorMessage = `Failed to generate resume data: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Formats a date string to "MMM YYYY" format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Gets CV content by ID with retries
 */
export async function getCVContent(cvId: string, token: string, retries = 3): Promise<string> {
  if (!token) {
    // Try to get token from authService if not provided
    const userToken = authService.getCurrentUser()?.accessToken;
    if (!userToken) {
      throw new Error('Authentication token is required');
    }
    token = userToken;
  }

  try {
    console.log(`Getting CV content for ID: ${cvId}`);
    const response = await axios.get(
      `${API_BASE_URL}/cvs/${cvId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html, application/json',  // Accept either format
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Don't throw for non-5xx status codes
      }
    );
    
    // Log response details for debugging
    console.log(`CV content response status: ${response.status}`);
    console.log(`CV content response type: ${typeof response.data}`);
    
    // If we got a successful response
    if (response.status === 200) {
      if (typeof response.data === 'string') {
        console.log('CV content is a string, length:', response.data.length);
        
        // If it's already HTML, return it directly
        if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html>')) {
          return response.data;
        }
        
        // Try to parse nested JSON strings
        try {
          // Helper function to recursively parse JSON strings
          const recursivelyParse = (jsonString: string, depth = 0): any => {
            if (depth > 5) return jsonString; // Prevent infinite recursion
            
            try {
              const parsed = JSON.parse(jsonString);
              
              // If the result is another string that might be JSON, try parsing again
              if (typeof parsed === 'string') {
                if ((parsed.startsWith('"') && parsed.endsWith('"')) || 
                    (parsed.startsWith('{') && parsed.endsWith('}')) || 
                    (parsed.startsWith('[') && parsed.endsWith(']'))) {
                  return recursivelyParse(parsed, depth + 1);
                }
                
                // If it has HTML tags after parsing, we're done
                if (parsed.includes('<!DOCTYPE html>') || parsed.includes('<html>')) {
                  return parsed;
                }
              }
              
              return parsed;
            } catch (e) {
              // If parsing fails, return the input
              return jsonString;
            }
          };
          
          // Start the recursive parsing
          const parsedContent = recursivelyParse(response.data);
          
          // If parsing produced HTML or the original was HTML, return it
          if (typeof parsedContent === 'string' && 
              (parsedContent.includes('<!DOCTYPE html>') || parsedContent.includes('<html>'))) {
            return parsedContent;
          }
          
          // If we have a JSON object, convert it to HTML
          if (typeof parsedContent === 'object' && parsedContent !== null) {
            console.log('Parsed CV content to JSON object:', Object.keys(parsedContent));
            return generateHTMLFromJSON(parsedContent);
          }
          
          // Otherwise, return the string result of parsing
          return String(parsedContent);
        } catch (e) {
          console.error('Error parsing CV content:', e);
          return response.data; // Return original if parsing fails
        }
      } else if (response.data && typeof response.data === 'object') {
        // If it's a JSON object already, generate HTML from it
        console.log('CV content is an object, keys:', Object.keys(response.data));
        return generateHTMLFromJSON(response.data);
      } else {
        // For any other type, convert to string
        console.log('CV content is neither string nor object:', typeof response.data);
        return String(response.data);
      }
    } else {
      // For error responses, check if we should retry
      console.error(`Error getting CV content, status: ${response.status}`);
      
      if (retries > 0 && response.status >= 400 && response.status < 500) {
        console.log(`Retrying CV content retrieval, ${retries} attempts left`);
        // Wait a second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getCVContent(cvId, token, retries - 1);
      }
      
      throw new Error(`Failed to get CV content: ${response.status} ${
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      }`);
    }
  } catch (error: any) {
    console.error('Error in getCVContent:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (retries > 0) {
      console.log(`Retrying due to error, ${retries} attempts left`);
      // Wait a second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getCVContent(cvId, token, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Gets current user's CV content
 */
export async function getCurrentUserCVContent(token: string): Promise<string> {
  try {
    console.log('Getting current user CV content');
    const response = await axios.get(
      `${API_BASE_URL}/cvs/me/content`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html, application/json'
        }
      }
    );
    
    // Log response details for debugging
    console.log(`Current user CV content response status: ${response.status}`);
    console.log(`Current user CV content response type: ${typeof response.data}`);
    
    // If we got a successful response
    if (response.status === 200) {
      // Handle string response
      if (typeof response.data === 'string') {
        console.log('Current user CV content is a string, length:', response.data.length);
        
        // If it's already HTML, return it directly
        if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html>')) {
          return response.data;
        }
        
        // Try to parse nested JSON strings
        try {
          // Helper function to recursively parse JSON strings
          const recursivelyParse = (jsonString: string, depth = 0): any => {
            if (depth > 5) return jsonString; // Prevent infinite recursion
            
            try {
              const parsed = JSON.parse(jsonString);
              
              // If the result is another string that might be JSON, try parsing again
              if (typeof parsed === 'string') {
                if ((parsed.startsWith('"') && parsed.endsWith('"')) || 
                    (parsed.startsWith('{') && parsed.endsWith('}')) || 
                    (parsed.startsWith('[') && parsed.endsWith(']'))) {
                  return recursivelyParse(parsed, depth + 1);
                }
                
                // If it has HTML tags after parsing, we're done
                if (parsed.includes('<!DOCTYPE html>') || parsed.includes('<html>')) {
                  return parsed;
                }
              }
              
              return parsed;
            } catch (e) {
              // If parsing fails, return the input
              return jsonString;
            }
          };
          
          // Start the recursive parsing
          const parsedContent = recursivelyParse(response.data);
          
          // If parsing produced HTML or the original was HTML, return it
          if (typeof parsedContent === 'string' && 
              (parsedContent.includes('<!DOCTYPE html>') || parsedContent.includes('<html>'))) {
            return parsedContent;
          }
          
          // If we have a JSON object, convert it to HTML
          if (typeof parsedContent === 'object' && parsedContent !== null) {
            console.log('Parsed current user CV content to JSON object:', Object.keys(parsedContent));
            return generateHTMLFromJSON(parsedContent);
          }
          
          // Otherwise, return the string result of parsing
          return String(parsedContent);
        } catch (e) {
          console.error('Error parsing current user CV content:', e);
          return response.data; // Return original if parsing fails
        }
      } else if (response.data && typeof response.data === 'object') {
        // If it's a JSON object already, generate HTML from it
        console.log('Current user CV content is an object, keys:', Object.keys(response.data));
        
        // If it has a content field, use that
        if (response.data.content) {
          return typeof response.data.content === 'string' 
            ? response.data.content 
            : JSON.stringify(response.data.content);
        } else {
          // Otherwise generate HTML from the object
          return generateHTMLFromJSON(response.data);
        }
      } else {
        // For any other type, convert to string
        console.log('Current user CV content is neither string nor object:', typeof response.data);
        return String(response.data);
      }
    } else {
      throw new Error(`Failed to get CV content: ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error getting current user CV content:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw error;
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

/**
 * Logs the structure of an HTML resume for debugging
 */
export function logResumeStructure(htmlContent: string): void {
  if (!htmlContent) {
    console.error('No HTML content provided to logResumeStructure');
    return;
  }
  
  try {
    console.log('Analyzing resume structure...');
    
    // Check if it's an HTML string
    const isHtml = htmlContent.includes('<!DOCTYPE html>') || htmlContent.includes('<html>');
    if (!isHtml) {
      console.log('Content doesn\'t appear to be HTML, first 100 chars:', htmlContent.substring(0, 100));
      
      // Try to parse as JSON if it looks like JSON
      if ((htmlContent.startsWith('{') && htmlContent.endsWith('}')) || 
          (htmlContent.startsWith('[') && htmlContent.endsWith(']')) ||
          (htmlContent.startsWith('"') && htmlContent.endsWith('"'))) {
        try {
          const parsedJson = JSON.parse(htmlContent);
          console.log('Content appears to be JSON, structure:', 
            typeof parsedJson === 'object' ? Object.keys(parsedJson) : typeof parsedJson);
        } catch (e) {
          console.log('Failed to parse as JSON:', e);
        }
      }
      
      // Not much else we can do with non-HTML content
      return;
    }
    
    // Simple structure extraction through regex
    const structureInfo: Record<string, any> = {};
    
    // Extract name
    const nameMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (nameMatch && nameMatch[1]) {
      structureInfo.name = nameMatch[1].trim();
    }
    
    // Extract contact info
    const contactMatches = htmlContent.matchAll(/<div class="contact-info">[\s\S]*?<\/div>/g);
    if (contactMatches) {
      const contactInfo: string[] = [];
      for (const match of contactMatches) {
        const contactText = match[0];
        const items = contactText.match(/<div[^>]*>([^<]+)<\/div>/g);
        if (items) {
          items.forEach(item => {
            const content = item.match(/<div[^>]*>([^<]+)<\/div>/);
            if (content && content[1]) {
              contactInfo.push(content[1].trim());
            }
          });
        }
      }
      structureInfo.contactInfo = contactInfo;
    }
    
    // Extract skills
    const skillMatches = htmlContent.matchAll(/<li class="skill-item">([^<]+)<\/li>/g);
    if (skillMatches) {
      const skills: string[] = [];
      for (const match of Array.from(skillMatches)) {
        if (match[1]) {
          skills.push(match[1].trim());
        }
      }
      structureInfo.skills = skills;
    }
    
    // Extract education
    const educationMatch = htmlContent.match(/<div class="education-item">[\s\S]*?<\/div>/);
    if (educationMatch) {
      const educationText = educationMatch[0];
      const universityMatch = educationText.match(/<h3>([^<]+)<\/h3>/);
      
      const education: Record<string, string> = {};
      if (universityMatch && universityMatch[1]) {
        education.university = universityMatch[1].trim();
      }
      
      structureInfo.education = education;
    }
    
    // Log the extracted structure
    console.log('Parsed Resume Structure:', structureInfo);
  } catch (error) {
    console.error('Error analyzing resume structure:', error);
  }
}

export default {
  generateCV,
  getCVContent,
  getCurrentUserCVContent,
  convertCVToPDF,
  logResumeStructure
}; 
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

interface ProfessionalSummary {
  summaryPoints?: string[];
}

interface Skills {
  programmingLanguages?: string[];
  webFrameworks?: string[];
  toolsTechnologies?: string[];
  coreConcepts?: string[];
  skillsList?: string[];
}

interface ExperienceItem {
  title?: string;
  company?: string;
  location?: string;
  dateRange?: string;
  achievements?: string[];
}

interface Experience {
  experiences?: ExperienceItem[];
}

interface ProjectItem {
  name?: string;
  technologies?: string;
  highlights?: string[];
}

interface Projects {
  projectsList?: ProjectItem[];
}

interface Education {
  university?: string;
  major?: string;
  graduationYear?: string;
}

interface CertificationItem {
  name?: string;
  issuer?: string;
  dateReceived?: string;
}

interface Certifications {
  certificationsList?: CertificationItem[];
}

interface CVData {
  contactInfo?: ContactInfo;
  professionalSummary?: ProfessionalSummary;
  skills?: Skills;
  experience?: Experience;
  education?: Education;
  projects?: Projects;
  certifications?: Certifications;
}

export default function PublicCVViewerPage() {
  const { cvId } = useParams<{ cvId: string }>();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cvs/${cvId}/data`);
        
        if (!response.ok) {
          throw new Error('CV not found');
        }

        const data = await response.json();
        setCvData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load CV');
      } finally {
        setLoading(false);
      }
    };

    if (cvId) {
      fetchCV();
    }
  }, [cvId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">CV Not Found</h2>
          <p className="text-gray-600">{error || 'The requested CV could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16 px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold uppercase tracking-wider mb-3 drop-shadow-lg">
              {cvData.contactInfo?.name || 'Professional Resume'}
            </h1>
            <h2 className="text-xl font-light uppercase tracking-widest opacity-90">
              Professional
            </h2>
          </div>
        </header>

        <div className="flex flex-col md:flex-row">
          {/* Left Column */}
          <aside className="md:w-2/5 bg-gradient-to-b from-gray-50 to-white p-8 border-r border-gray-200">
            {/* Contact */}
            <section className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                Contact
              </h3>
              <div className="space-y-3">
                {cvData.contactInfo?.email && (
                  <div className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <a href={`mailto:${cvData.contactInfo.email}`} className="hover:underline">
                      {cvData.contactInfo.email}
                    </a>
                  </div>
                )}
                {cvData.contactInfo?.phone && (
                  <div className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    <a href={`tel:${cvData.contactInfo.phone}`} className="hover:underline">
                      {cvData.contactInfo.phone}
                    </a>
                  </div>
                )}
                {cvData.contactInfo?.github && (
                  <div className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"/>
                    </svg>
                    <a href={cvData.contactInfo.github.startsWith('http') ? cvData.contactInfo.github : `https://${cvData.contactInfo.github}`} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="hover:underline">
                      {cvData.contactInfo.github}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Skills */}
            {cvData.skills && (
              <section className="mb-8">
                <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Skills
                </h3>
                <div className="space-y-4">
                  {cvData.skills.programmingLanguages && cvData.skills.programmingLanguages.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <strong className="text-xs font-semibold text-gray-800 block mb-2">Programming Languages:</strong>
                      <p className="text-sm text-gray-700">{cvData.skills.programmingLanguages.join(', ')}</p>
                    </div>
                  )}
                  {cvData.skills.webFrameworks && cvData.skills.webFrameworks.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <strong className="text-xs font-semibold text-gray-800 block mb-2">Web Frameworks/Libraries:</strong>
                      <p className="text-sm text-gray-700">{cvData.skills.webFrameworks.join(', ')}</p>
                    </div>
                  )}
                  {cvData.skills.toolsTechnologies && cvData.skills.toolsTechnologies.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <strong className="text-xs font-semibold text-gray-800 block mb-2">Tools & Technologies:</strong>
                      <p className="text-sm text-gray-700">{cvData.skills.toolsTechnologies.join(', ')}</p>
                    </div>
                  )}
                  {cvData.skills.coreConcepts && cvData.skills.coreConcepts.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <strong className="text-xs font-semibold text-gray-800 block mb-2">Core Concepts:</strong>
                      <p className="text-sm text-gray-700">{cvData.skills.coreConcepts.join(', ')}</p>
                    </div>
                  )}
                  {cvData.skills.skillsList && cvData.skills.skillsList.length > 0 && !cvData.skills.programmingLanguages && (
                    <ul className="space-y-2">
                      {cvData.skills.skillsList.map((skill, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <span className="text-blue-500 font-bold mr-2">▸</span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}

            {/* Education */}
            {cvData.education && (
              <section className="mb-8">
                <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Education
                </h3>
                <div className="space-y-2">
                  {cvData.education.university && (
                    <p className="font-semibold text-gray-800 text-sm">{cvData.education.university}</p>
                  )}
                  {cvData.education.major && (
                    <p className="text-sm text-gray-700">{cvData.education.major}</p>
                  )}
                  {cvData.education.graduationYear && (
                    <p className="text-sm text-gray-600">{cvData.education.graduationYear}</p>
                  )}
                </div>
              </section>
            )}

            {/* Certifications */}
            {cvData.certifications?.certificationsList && cvData.certifications.certificationsList.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Certifications
                </h3>
                <div className="space-y-4">
                  {cvData.certifications.certificationsList.map((cert, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <strong className="text-sm text-gray-800 block">{cert.name}</strong>
                      {cert.issuer && <p className="text-xs text-gray-600 mt-1">{cert.issuer}</p>}
                      {cert.dateReceived && <p className="text-xs text-gray-500 mt-1">{cert.dateReceived}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>

          {/* Right Column */}
          <main className="md:w-3/5 p-8">
            {/* Professional Summary */}
            {cvData.professionalSummary?.summaryPoints && cvData.professionalSummary.summaryPoints.length > 0 && (
              <section className="mb-10">
                <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Professional Summary
                </h3>
                <div className="space-y-3">
                  {cvData.professionalSummary.summaryPoints.map((point, idx) => (
                    <p key={idx} className="text-sm text-gray-700 leading-relaxed text-justify">
                      {point}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            <section className="mb-10">
              <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                Experience
              </h3>
              {cvData.experience?.experiences && cvData.experience.experiences.length > 0 ? (
                <div className="space-y-6">
                  {cvData.experience.experiences.map((exp, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      {exp.title && (
                        <h4 className="font-bold text-gray-800 text-base mb-1">{exp.title}</h4>
                      )}
                      {exp.company && (
                        <p className="text-sm text-gray-600 italic mb-1">
                          {exp.company}
                          {exp.location && ` | ${exp.location}`}
                        </p>
                      )}
                      {exp.dateRange && (
                        <p className="text-sm text-gray-500 italic mb-3">{exp.dateRange}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="space-y-2 mt-3">
                          {exp.achievements.map((achievement, aIdx) => (
                            <li key={aIdx} className="flex items-start text-sm text-gray-700">
                              <span className="text-blue-500 font-bold mr-2 mt-1">▸</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">
                  No experience listed
                </p>
              )}
            </section>

            {/* Projects */}
            {cvData.projects?.projectsList && cvData.projects.projectsList.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Projects
                </h3>
                <div className="space-y-6">
                  {cvData.projects.projectsList.map((project, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      {project.name && (
                        <h4 className="font-bold text-gray-800 text-base mb-2">{project.name}</h4>
                      )}
                      {project.technologies && (
                        <p className="text-sm text-gray-600 italic mb-3">
                          <strong className="font-semibold">Technologies:</strong> {project.technologies}
                        </p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <ul className="space-y-2">
                          {project.highlights.map((highlight, hIdx) => (
                            <li key={hIdx} className="flex items-start text-sm text-gray-700">
                              <span className="text-blue-500 font-bold mr-2 mt-1">▸</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}





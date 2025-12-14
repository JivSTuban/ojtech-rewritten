package com.ojtechapi.spring.jwtoauth.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class ResumeHtmlGeneratorService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateResumeHtml(String jsonContent) {
        try {
            JsonNode resumeData = objectMapper.readTree(jsonContent);
            return buildHtmlFromJson(resumeData);
        } catch (Exception e) {
            return generateErrorHtml("Error parsing resume data: " + e.getMessage());
        }
    }

    private String buildHtmlFromJson(JsonNode data) {
        StringBuilder html = new StringBuilder();

        html.append("<!DOCTYPE html>");
        html.append("<html lang=\"en\">");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("<meta name=\"description\" content=\"Professional Resume\">");
        html.append("<title>Resume - ");
        JsonNode contactInfo = data.has("contactInfo") ? data.get("contactInfo") : data.get("personalInfo");
        if (contactInfo != null && contactInfo.has("name")) {
            html.append(escapeHtml(contactInfo.get("name").asText()));
        } else {
            html.append("Professional Resume");
        }
        html.append("</title>");
        html.append(getStyles());
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"resume-container\">");

        // Header with contact info
        html.append(buildHeader(data));

        html.append("<div class=\"content\">");

        // Left column
        html.append("<div class=\"left-column\">");
        html.append(buildContactSection(data));
        html.append(buildSkillsSection(data));
        html.append(buildEducationSection(data));
        html.append(buildCertificationsSection(data));
        html.append("</div>");

        // Right column
        html.append("<div class=\"right-column\">");
        html.append(buildProfessionalSummarySection(data));
        html.append(buildExperienceSection(data));
        html.append(buildProjectsSection(data));
        html.append("</div>");

        html.append("</div>"); // content
        html.append("</div>"); // resume-container
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    private String buildHeader(JsonNode data) {
        StringBuilder html = new StringBuilder();
        JsonNode contactInfo = data.has("contactInfo") ? data.get("contactInfo") : data.get("personalInfo");

        html.append("<header class=\"header\">");
        if (contactInfo != null && contactInfo.has("name")) {
            html.append("<h1>").append(escapeHtml(contactInfo.get("name").asText())).append("</h1>");
        }
        html.append("<h2>PROFESSIONAL</h2>");
        html.append("</header>");

        return html.toString();
    }

    private String buildContactSection(JsonNode data) {
        StringBuilder html = new StringBuilder();
        JsonNode contactInfo = data.has("contactInfo") ? data.get("contactInfo") : data.get("personalInfo");

        if (contactInfo == null)
            return "";

        html.append("<div class=\"section\">");
        html.append("<h3 class=\"section-title\">Contact</h3>");
        html.append("<div>");

        if (contactInfo.has("email")) {
            String email = contactInfo.get("email").asText();
            html.append("<p class=\"social-item\">");
            html.append(
                    "<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append(
                    "<path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z\"/>");
            html.append("</svg>");
            html.append("<a href=\"mailto:").append(escapeHtml(email))
                    .append("\" style=\"color: #333; text-decoration: none;\">").append(escapeHtml(email))
                    .append("</a>");
            html.append("</p>");
        }
        if (contactInfo.has("phone") && !contactInfo.get("phone").asText().isEmpty()) {
            String phone = contactInfo.get("phone").asText();
            html.append("<p class=\"social-item\">");
            html.append(
                    "<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append(
                    "<path d=\"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z\"/>");
            html.append("</svg>");
            html.append("<a href=\"tel:").append(escapeHtml(phone.replaceAll("[^0-9+]", "")))
                    .append("\" style=\"color: #333; text-decoration: none;\">").append(escapeHtml(phone))
                    .append("</a>");
            html.append("</p>");
        }
        if (contactInfo.has("location") && !contactInfo.get("location").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append(
                    "<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append(
                    "<path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("location").asText()));
            html.append("</p>");
        }
        if (contactInfo.has("linkedin") && !contactInfo.get("linkedin").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append(
                    "<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append(
                    "<path d=\"M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("linkedin").asText()));
            html.append("</p>");
        }
        if (contactInfo.has("github") && !contactInfo.get("github").asText().isEmpty()) {
            String githubUrl = contactInfo.get("github").asText();
            html.append("<p class=\"social-item\">");
            html.append(
                    "<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append(
                    "<path d=\"M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z\"/>");
            html.append("</svg>");
            if (!githubUrl.startsWith("http")) {
                githubUrl = "https://" + githubUrl;
            }
            html.append("<a href=\"").append(escapeHtml(githubUrl))
                    .append("\" style=\"color: #333; text-decoration: none;\">")
                    .append(escapeHtml(contactInfo.get("github").asText())).append("</a>");
            html.append("</p>");
        }
        if (contactInfo.has("portfolio") && !contactInfo.get("portfolio").asText().isEmpty()) {
            html.append("<p class=\"social-item\">");
            html.append(
                    "<svg class=\"social-icon\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">");
            html.append(
                    "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z\"/>");
            html.append("</svg>");
            html.append(escapeHtml(contactInfo.get("portfolio").asText()));
            html.append("</p>");
        }

        html.append("</div>");
        html.append("</div>");

        return html.toString();
    }

    private String buildSkillsSection(JsonNode data) {
        if (!data.has("skills"))
            return "";

        JsonNode skills = data.get("skills");
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">SKILLS</h2>");
        html.append("<div class=\"section-content\">");

        // Check if skills are organized by category
        if (skills.has("programmingLanguages") || skills.has("webFrameworks") ||
                skills.has("toolsTechnologies") || skills.has("coreConcepts")) {

            // Programming Languages
            if (skills.has("programmingLanguages")) {
                JsonNode langList = skills.get("programmingLanguages");
                if (langList.isArray() && langList.size() > 0) {
                    html.append("<div class=\"skills-category\">");
                    html.append("<strong>Programming Languages:</strong> ");
                    html.append("<span>");
                    for (int i = 0; i < langList.size(); i++) {
                        if (i > 0)
                            html.append(", ");
                        html.append(escapeHtml(langList.get(i).asText()));
                    }
                    html.append("</span>");
                    html.append("</div>");
                }
            }

            // Web Frameworks/Libraries
            if (skills.has("webFrameworks")) {
                JsonNode webList = skills.get("webFrameworks");
                if (webList.isArray() && webList.size() > 0) {
                    html.append("<div class=\"skills-category\">");
                    html.append("<strong>Web Frameworks/Libraries:</strong> ");
                    html.append("<span>");
                    for (int i = 0; i < webList.size(); i++) {
                        if (i > 0)
                            html.append(", ");
                        html.append(escapeHtml(webList.get(i).asText()));
                    }
                    html.append("</span>");
                    html.append("</div>");
                }
            }

            // Tools & Technologies
            if (skills.has("toolsTechnologies")) {
                JsonNode toolsList = skills.get("toolsTechnologies");
                if (toolsList.isArray() && toolsList.size() > 0) {
                    html.append("<div class=\"skills-category\">");
                    html.append("<strong>Tools & Technologies:</strong> ");
                    html.append("<span>");
                    for (int i = 0; i < toolsList.size(); i++) {
                        if (i > 0)
                            html.append(", ");
                        html.append(escapeHtml(toolsList.get(i).asText()));
                    }
                    html.append("</span>");
                    html.append("</div>");
                }
            }

            // Core Concepts
            if (skills.has("coreConcepts")) {
                JsonNode conceptsList = skills.get("coreConcepts");
                if (conceptsList.isArray() && conceptsList.size() > 0) {
                    html.append("<div class=\"skills-category\">");
                    html.append("<strong>Core Concepts:</strong> ");
                    html.append("<span>");
                    for (int i = 0; i < conceptsList.size(); i++) {
                        if (i > 0)
                            html.append(", ");
                        html.append(escapeHtml(conceptsList.get(i).asText()));
                    }
                    html.append("</span>");
                    html.append("</div>");
                }
            }
        } else {
            // Fallback: simple list format
            JsonNode skillsList = skills.has("skillsList") ? skills.get("skillsList") : skills;
            if (skillsList != null && skillsList.isArray() && skillsList.size() > 0) {
                html.append("<ul class=\"skills-list\">");
                for (JsonNode skill : skillsList) {
                    html.append("<li>").append(escapeHtml(skill.asText())).append("</li>");
                }
                html.append("</ul>");
            }
        }

        html.append("</div>");
        html.append("</section>");

        return html.toString();
    }

    private String buildEducationSection(JsonNode data) {
        if (!data.has("education"))
            return "";

        JsonNode education = data.get("education");

        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">EDUCATION</h2>");
        html.append("<div class=\"section-content\">");

        if (education.has("university")) {
            html.append("<p class=\"education-item\"><strong>").append(escapeHtml(education.get("university").asText()))
                    .append("</strong></p>");
        }
        if (education.has("major")) {
            html.append("<p class=\"education-item\">").append(escapeHtml(education.get("major").asText()))
                    .append("</p>");
        }
        if (education.has("graduationYear") && !education.get("graduationYear").asText().isEmpty()) {
            html.append("<p class=\"education-item\">").append(escapeHtml(education.get("graduationYear").asText()))
                    .append("</p>");
        }

        html.append("</div>");
        html.append("</section>");

        return html.toString();
    }

    private String buildCertificationsSection(JsonNode data) {
        if (!data.has("certifications"))
            return "";

        JsonNode certifications = data.get("certifications");
        JsonNode certList = certifications.has("certificationsList") ? certifications.get("certificationsList")
                : certifications;

        if (certList == null || !certList.isArray() || certList.size() == 0)
            return "";

        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">CERTIFICATIONS</h2>");
        html.append("<div class=\"section-content\">");

        for (JsonNode cert : certList) {
            if (cert.has("name")) {
                html.append("<div class=\"cert-item\">");
                html.append("<strong>").append(escapeHtml(cert.get("name").asText())).append("</strong>");
                if (cert.has("issuer")) {
                    html.append("<p style=\"font-size: 9pt; color: #7f8c8d; margin-top: 4px;\">")
                            .append(escapeHtml(cert.get("issuer").asText())).append("</p>");
                }
                if (cert.has("dateReceived") && !cert.get("dateReceived").asText().isEmpty()) {
                    html.append("<p style=\"font-size: 8.5pt; color: #95a5a6; margin-top: 2px;\">")
                            .append(escapeHtml(cert.get("dateReceived").asText())).append("</p>");
                }
                html.append("</div>");
            }
        }

        html.append("</div>");
        html.append("</section>");

        return html.toString();
    }

    private String buildProfessionalSummarySection(JsonNode data) {
        if (!data.has("professionalSummary"))
            return "";

        JsonNode summary = data.get("professionalSummary");
        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">PROFESSIONAL SUMMARY</h2>");
        html.append("<div class=\"section-content\">");
        html.append("<div class=\"summary-text\">");

        // Check if summary is an array of points or a single text field
        if (summary.has("summaryPoints") && summary.get("summaryPoints").isArray()) {
            JsonNode summaryPoints = summary.get("summaryPoints");
            for (int i = 0; i < summaryPoints.size(); i++) {
                String point = summaryPoints.get(i).asText();
                html.append("<p>").append(escapeHtml(point)).append("</p>");
            }
        } else if (summary.has("text") && !summary.get("text").asText().isEmpty()) {
            html.append("<p>").append(escapeHtml(summary.get("text").asText())).append("</p>");
        } else if (summary.isTextual() && !summary.asText().isEmpty()) {
            html.append("<p>").append(escapeHtml(summary.asText())).append("</p>");
        }

        html.append("</div>");
        html.append("</div>");
        html.append("</section>");

        return html.toString();
    }

    private String buildExperienceSection(JsonNode data) {
        if (!data.has("experience"))
            return "";

        JsonNode experience = data.get("experience");
        JsonNode experiences = experience.has("experiences") ? experience.get("experiences") : experience;

        if (experiences == null || !experiences.isArray() || experiences.size() == 0) {
            // Show "No experience listed" if empty
            StringBuilder html = new StringBuilder();
            html.append("<section class=\"section\">");
            html.append("<h2 class=\"section-title\">EXPERIENCE</h2>");
            html.append("<div class=\"section-content\">");
            html.append("<p class=\"no-content\">No experience listed</p>");
            html.append("</div>");
            html.append("</section>");
            return html.toString();
        }

        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">EXPERIENCE</h2>");
        html.append("<div class=\"section-content\">");

        for (JsonNode exp : experiences) {
            html.append("<div class=\"exp-item\">");

            if (exp.has("title")) {
                html.append("<h3 class=\"exp-title\">").append(escapeHtml(exp.get("title").asText())).append("</h3>");
            }
            if (exp.has("company")) {
                html.append("<p class=\"exp-meta\">").append(escapeHtml(exp.get("company").asText()));
                if (exp.has("location") && !exp.get("location").asText().isEmpty()) {
                    html.append(" | ").append(escapeHtml(exp.get("location").asText()));
                }
                html.append("</p>");
            }
            if (exp.has("dateRange")) {
                html.append("<p class=\"exp-meta\">").append(escapeHtml(exp.get("dateRange").asText())).append("</p>");
            }

            if (exp.has("achievements") && exp.get("achievements").isArray() && exp.get("achievements").size() > 0) {
                html.append("<ul class=\"achievements-list\">");
                for (JsonNode achievement : exp.get("achievements")) {
                    html.append("<li>").append(escapeHtml(achievement.asText())).append("</li>");
                }
                html.append("</ul>");
            }

            html.append("</div>");
        }

        html.append("</div>");
        html.append("</section>");

        return html.toString();
    }

    private String buildProjectsSection(JsonNode data) {
        if (!data.has("projects"))
            return "";

        JsonNode projects = data.get("projects");
        JsonNode projectsList = projects.has("projectsList") ? projects.get("projectsList") : projects;

        if (projectsList == null || !projectsList.isArray() || projectsList.size() == 0)
            return "";

        StringBuilder html = new StringBuilder();
        html.append("<section class=\"section\">");
        html.append("<h2 class=\"section-title\">PROJECTS</h2>");
        html.append("<div class=\"section-content\">");

        for (JsonNode project : projectsList) {
            html.append("<div class=\"project-item\">");

            if (project.has("name")) {
                html.append("<h3 class=\"project-title\">").append(escapeHtml(project.get("name").asText()))
                        .append("</h3>");
            }
            if (project.has("technologies") && !project.get("technologies").asText().isEmpty()) {
                html.append("<p class=\"project-tech\"><strong>Technologies:</strong> ")
                        .append(escapeHtml(project.get("technologies").asText())).append("</p>");
            }

            if (project.has("highlights") && project.get("highlights").isArray()
                    && project.get("highlights").size() > 0) {
                html.append("<ul class=\"highlights-list\">");
                for (JsonNode highlight : project.get("highlights")) {
                    html.append("<li>").append(escapeHtml(highlight.asText())).append("</li>");
                }
                html.append("</ul>");
            }

            html.append("</div>");
        }

        html.append("</div>");
        html.append("</section>");

        return html.toString();
    }

    private String getStyles() {
        StringBuilder css = new StringBuilder();
        css.append("<style>");

        // Base styles
        css.append("* { margin: 0; padding: 0; box-sizing: border-box; }");
        css.append("body { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); color: #2c3e50; ");
        css.append("font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; font-size: 10pt; padding: 20px; }");

        // Container
        css.append(".resume-container { max-width: 8.5in; margin: 0 auto; background: #fff; ");
        css.append("box-shadow: 0 10px 40px rgba(0,0,0,0.15); border-radius: 8px; overflow: hidden; }");

        // Header
        css.append(".header { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: #fff; ");
        css.append("padding: 50px 40px; text-align: center; }");
        css.append(".header h1 { font-size: 32pt; text-transform: uppercase; letter-spacing: 4px; ");
        css.append("margin-bottom: 12px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }");
        css.append(".header h2 { font-size: 16pt; font-weight: 300; text-transform: uppercase; letter-spacing: 3px; }");

        // Layout
        css.append(".content { display: flex; background: #fff; }");
        css.append(
                ".left-column { width: 35%; padding: 35px 25px; background: #f8f9fa; border-right: 2px solid #e9ecef; }");
        css.append(".right-column { width: 65%; padding: 35px 30px; background: #fff; }");

        // Sections
        css.append(".section { margin-bottom: 30px; }");
        css.append(".section-title { font-size: 12pt; text-transform: uppercase; font-weight: 700; color: #2c3e50; ");
        css.append(
                "margin-bottom: 15px; padding-bottom: 8px; border-bottom: 3px solid #3498db; letter-spacing: 1px; }");

        // Contact
        css.append(
                ".social-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 9.5pt; color: #34495e; }");
        css.append(".social-item a { color: #2c3e50; text-decoration: none; }");
        css.append(".social-item a:hover { color: #3498db; }");
        css.append(".social-icon { color: #3498db; margin-right: 12px; min-width: 18px; }");

        // Lists
        css.append("ul { list-style: none; padding-left: 0; margin-bottom: 10px; }");
        css.append("ul li { margin-bottom: 8px; font-size: 9.5pt; line-height: 1.7; color: #34495e; ");
        css.append("padding-left: 20px; position: relative; }");
        css.append("ul li::before { content: '▸'; position: absolute; left: 0; color: #3498db; font-weight: bold; }");

        // Skills
        css.append(".skills-category { margin-bottom: 15px; padding: 12px; background: #f8f9fa; ");
        css.append("border-radius: 6px; border-left: 4px solid #3498db; }");
        css.append(".skills-category strong { font-size: 9.5pt; color: #2c3e50; display: block; margin-bottom: 6px; }");

        // Education
        css.append(".education-item { margin-bottom: 10px; font-size: 9.5pt; line-height: 1.6; }");
        css.append(".education-item strong { font-size: 10.5pt; color: #2c3e50; font-weight: 600; ");
        css.append("display: block; margin-bottom: 4px; }");

        // Experience/Projects
        css.append(".exp-item, .project-item { margin-bottom: 25px; padding: 15px; background: #f8f9fa; ");
        css.append("border-radius: 6px; border-left: 4px solid #3498db; }");
        css.append(
                ".exp-title, .project-title { font-size: 12pt; font-weight: 700; color: #2c3e50; margin-bottom: 6px; }");
        css.append(
                ".exp-meta, .project-tech { font-size: 9pt; color: #7f8c8d; margin-bottom: 8px; font-style: italic; }");
        css.append(".project-tech strong { color: #34495e; font-style: normal; }");

        // Summary
        css.append(".summary-text { font-size: 9.5pt; line-height: 1.8; color: #34495e; }");
        css.append(".summary-text p { margin-bottom: 12px; text-align: justify; }");

        // Certifications
        css.append(".cert-item { margin-bottom: 15px; padding: 12px; background: #f8f9fa; border-radius: 6px; }");
        css.append(".cert-item strong { font-size: 10pt; color: #2c3e50; display: block; margin-bottom: 4px; }");

        // No content
        css.append(".no-content { font-size: 9pt; color: #95a5a6; font-style: italic; padding: 10px; ");
        css.append("background: #f8f9fa; border-radius: 4px; text-align: center; }");

        // Print styles
        css.append("@media print {");
        css.append("body { background: #fff !important; padding: 0; }");
        css.append(".resume-container { box-shadow: none; border-radius: 0; }");
        css.append(".header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }");
        css.append("}");

        // Mobile styles
        css.append("@media (max-width: 768px) {");
        css.append(".content { flex-direction: column; }");
        css.append(".left-column, .right-column { width: 100%; }");
        css.append(".left-column { border-right: none; border-bottom: 2px solid #e9ecef; }");
        css.append("}");

        css.append("</style>");
        return css.toString();
    }

    private String generateErrorHtml(String errorMessage) {
        return "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<title>Resume Error</title>" +
                "<style>body { font-family: Arial, sans-serif; padding: 40px; text-align: center; } .error { color: #e53e3e; border: 2px solid #e53e3e; padding: 20px; border-radius: 8px; background-color: #fff5f5; }</style>"
                +
                "</head>" +
                "<body>" +
                "<div class=\"error\">" +
                "<h1>Error Loading Resume</h1>" +
                "<p>" + escapeHtml(errorMessage) + "</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String escapeHtml(String text) {
        if (text == null)
            return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}

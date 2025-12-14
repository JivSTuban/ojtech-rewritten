import { CheckCircle, GitBranch, Award, FileText, User } from 'lucide-react';

interface MatchAnalysisProps {
    detailedAnalysis: string;
}

interface ParsedAnalysis {
    githubAnalysis?: string;
    overallMatch?: string;
    portfolioAnalysis?: string;
    bioAnalysis?: string;
    certificationsAnalysis?: string;
}

export function MatchAnalysis({ detailedAnalysis }: MatchAnalysisProps) {
    // Parse the JSON string
    let parsedData: ParsedAnalysis = {};

    try {
        parsedData = JSON.parse(detailedAnalysis);
    } catch (error) {
        console.error('Error parsing detailed analysis:', error);
        return (
            <div className="text-red-400 text-sm">
                Unable to parse match analysis data
            </div>
        );
    }

    // Helper function to render markdown-like text
    const renderMarkdown = (text: string) => {
        if (!text) return null;

        // Split by lines
        const lines = text.split('\n');
        const elements: JSX.Element[] = [];
        let currentList: string[] = [];
        let key = 0;

        const flushList = () => {
            if (currentList.length > 0) {
                elements.push(
                    <ul key={`list-${key++}`} className="list-disc list-inside space-y-1 ml-4 mb-3">
                        {currentList.map((item, idx) => (
                            <li key={idx} className="text-gray-300">{item}</li>
                        ))}
                    </ul>
                );
                currentList = [];
            }
        };

        lines.forEach((line) => {
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) {
                flushList();
                return;
            }

            // Headers (## or ###)
            if (trimmed.startsWith('###')) {
                flushList();
                elements.push(
                    <h4 key={`h4-${key++}`} className="text-sm font-semibold text-blue-400 mt-4 mb-2">
                        {trimmed.replace(/^###\s*/, '')}
                    </h4>
                );
            } else if (trimmed.startsWith('##')) {
                flushList();
                elements.push(
                    <h3 key={`h3-${key++}`} className="text-base font-semibold text-white mt-5 mb-3 border-b border-gray-700 pb-2">
                        {trimmed.replace(/^##\s*/, '')}
                    </h3>
                );
            }
            // List items
            else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                currentList.push(trimmed.replace(/^[-*]\s*/, ''));
            }
            // Bold text
            else if (trimmed.includes('**')) {
                flushList();
                const parts = trimmed.split('**');
                elements.push(
                    <p key={`p-${key++}`} className="text-gray-300 mb-2">
                        {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                        )}
                    </p>
                );
            }
            // Regular paragraphs
            else {
                flushList();
                elements.push(
                    <p key={`p-${key++}`} className="text-gray-300 mb-2">
                        {trimmed}
                    </p>
                );
            }
        });

        flushList();
        return elements;
    };

    const sections = [
        {
            title: 'Overall Match',
            icon: CheckCircle,
            content: parsedData.overallMatch,
            color: 'text-blue-400'
        },
        {
            title: 'GitHub Analysis',
            icon: GitBranch,
            content: parsedData.githubAnalysis,
            color: 'text-purple-400'
        },
        {
            title: 'Bio Analysis',
            icon: User,
            content: parsedData.bioAnalysis,
            color: 'text-green-400'
        },
        {
            title: 'Portfolio Analysis',
            icon: FileText,
            content: parsedData.portfolioAnalysis,
            color: 'text-yellow-400'
        },
        {
            title: 'Certifications Analysis',
            icon: Award,
            content: parsedData.certificationsAnalysis,
            color: 'text-orange-400'
        }
    ];

    return (
        <div className="space-y-4">
            {sections.map((section, idx) => {
                if (!section.content) return null;

                const Icon = section.icon;

                return (
                    <div
                        key={idx}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Icon className={`h-5 w-5 ${section.color}`} />
                            <h3 className={`text-lg font-semibold ${section.color}`}>
                                {section.title}
                            </h3>
                        </div>
                        <div className="text-sm leading-relaxed">
                            {renderMarkdown(section.content)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

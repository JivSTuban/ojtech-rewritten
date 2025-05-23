import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

interface SkillsStepProps {
  skillsInput: string;
  skills: string[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface SkillsStepState {
  suggestedSkills: string[];
}

export default class SkillsStep extends Component<SkillsStepProps, SkillsStepState> {
  constructor(props: SkillsStepProps) {
    super(props);
    this.state = {
      suggestedSkills: []
    };
  }

  componentDidMount() {
    // Load projects from localStorage
    const projects = localStorageManager.getStepData<any[]>('githubProjects');
    
    if (projects && projects.length > 0) {
      // Extract skills from projects
      const projectSkills = localStorageManager.extractSkillsFromProjects(projects);
      
      // Filter out skills that are already selected
      const newSuggestions = projectSkills.filter(skill => 
        !this.props.skills.includes(skill)
      );
      
      this.setState({ suggestedSkills: newSuggestions });
    }
    
    // Load saved skills from localStorage if the current skills are empty
    if (this.props.skills.length === 0) {
      const savedSkills = localStorageManager.getStepData<string[]>('skills');
      if (savedSkills && savedSkills.length > 0) {
        // We need to format them back to a comma-separated string for the input field
        const skillsString = savedSkills.join(', ');
        // Simulate an input change event to update the parent state
        const mockEvent = {
          target: {
            name: 'skills',
            value: skillsString
          }
        } as ChangeEvent<HTMLInputElement>;
        this.props.onChange(mockEvent);
      }
    }
  }

  isValid = (): boolean => {
    return this.props.skills.length > 0;
  };

  handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.isValid()) {
      // Save skills to localStorage
      localStorageManager.saveStepData('skills', this.props.skills);
      this.props.onNext();
    }
  };
  
  addSuggestedSkill = (skill: string) => {
    // Check if the skill is already in the list
    if (this.props.skills.includes(skill)) return;
    
    // Create a new skills string with the added skill
    const newSkillsInput = this.props.skillsInput
      ? `${this.props.skillsInput}, ${skill}`
      : skill;
    
    // Simulate an input change event
    const mockEvent = {
      target: {
        name: 'skills',
        value: newSkillsInput
      }
    } as ChangeEvent<HTMLInputElement>;
    
    this.props.onChange(mockEvent);
    
    // Remove this skill from suggestions
    this.setState(prevState => ({
      suggestedSkills: prevState.suggestedSkills.filter(s => s !== skill)
    }));
  };

  render() {
    const { skillsInput, skills, onChange, onPrev } = this.props;
    const { suggestedSkills } = this.state;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Skills & Expertise
          </h3>
          <p className="text-gray-400 mt-2">
            List your technical and soft skills
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-4">
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-2">
                Skills <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Separate with commas)</span>
              </label>
              <input
                type="text"
                name="skills"
                id="skills"
                value={skillsInput}
                onChange={onChange}
                required
                className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                placeholder="e.g. JavaScript, React, Node.js, Problem Solving"
              />
              
              <div className="text-xs text-gray-500 mt-2 pl-1">
                Add programming languages, frameworks, tools, and soft skills that you possess
              </div>
            </div>

            {/* Suggested skills from projects */}
            {suggestedSkills.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-300 mb-2">
                  Suggested from your GitHub projects:
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestedSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => this.addSuggestedSkill(skill)}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-800/50 text-gray-300 border border-gray-700/30 hover:bg-gray-800 hover:border-gray-600 transition-colors"
                    >
                      <span className="mr-1">+</span> {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {skills && skills.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Your skills:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-800/70 text-gray-300 border border-gray-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-black/90 rounded-xl p-6 border border-gray-800/50">
          <h4 className="text-gray-300 font-medium mb-2">Pro Tips for Skills Section</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Include both technical skills (programming languages, tools) and soft skills (communication, teamwork)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Be specific with technical skills (e.g., "React.js" instead of just "JavaScript")</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Add relevant skills that match your GitHub projects to show consistency</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrev}
            className="px-6 py-3 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={this.handleNext}
            disabled={!this.isValid()}
            className={`
              px-6 py-3 rounded-lg font-medium text-white
              transition-all duration-300 shadow-lg
              ${!this.isValid() 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20'
              }
            `}
          >
            Continue to Contact Information
          </button>
        </div>
      </div>
    );
  }
} 
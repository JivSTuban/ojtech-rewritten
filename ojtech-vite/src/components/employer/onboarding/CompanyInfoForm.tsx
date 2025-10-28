import React, { Component } from 'react';
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select";
import { Loader2 } from "lucide-react";

// Company size options
const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-20", label: "11-20 employees" },
  { value: "21-30", label: "21-30 employees" },
  { value: "31-40", label: "31-40 employees" },
  { value: "41+", label: "41+ employees" }
];

interface FormValues {
  companyName: string;
  companyWebsite: string;
  companySize: string;
  industry: string;
  companyDescription: string;
}

interface CompanyInfoFormProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
}

interface CompanyInfoFormState {
  companyName: string;
  companyWebsite: string;
  companySize: string;
  industry: string;
  companyDescription: string;
  errors: {
    companyWebsite?: string;
    companySize?: string;
    industry?: string;
    companyDescription?: string;
  };
  touched: {
    companyWebsite?: boolean;
    companySize?: boolean;
    industry?: boolean;
    companyDescription?: boolean;
  };
}

export class CompanyInfoForm extends Component<CompanyInfoFormProps, CompanyInfoFormState> {
  constructor(props: CompanyInfoFormProps) {
    super(props);
    this.state = {
      companyName: props.initialData?.companyName || '',
      companyWebsite: props.initialData?.companyWebsite || '',
      companySize: props.initialData?.companySize || '',
      industry: props.initialData?.industry || '',
      companyDescription: props.initialData?.companyDescription || '',
      errors: {},
      touched: {}
    };
  }

  validateWebsite = (value: string): string => {
    if (value && !value.match(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/)) {
      return 'Please enter a valid URL';
    }
    return '';
  };

  validateCompanySize = (value: string): string => {
    if (!value) {
      return 'Please select a company size';
    }
    return '';
  };

  validateIndustry = (value: string): string => {
    if (!value) {
      return 'Please enter an industry';
    }
    return '';
  };

  validateDescription = (value: string): string => {
    if (!value) {
      return 'Please provide a company description';
    }
    if (value.length < 50) {
      return 'Description must be at least 50 characters';
    }
    return '';
  };

  handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      companyWebsite: value,
      touched: { ...this.state.touched, companyWebsite: true },
      errors: { ...this.state.errors, companyWebsite: this.validateWebsite(value) }
    });
  };

  handleCompanySizeChange = (value: string) => {
    this.setState({
      companySize: value,
      touched: { ...this.state.touched, companySize: true },
      errors: { ...this.state.errors, companySize: this.validateCompanySize(value) }
    });
  };

  handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      industry: value,
      touched: { ...this.state.touched, industry: true },
      errors: { ...this.state.errors, industry: this.validateIndustry(value) }
    });
  };

  handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    this.setState({
      companyDescription: value,
      touched: { ...this.state.touched, companyDescription: true },
      errors: { ...this.state.errors, companyDescription: this.validateDescription(value) }
    });
  };

  validateForm = (): boolean => {
    const { companySize, industry, companyDescription, companyWebsite } = this.state;
    
    const errors = {
      companyWebsite: this.validateWebsite(companyWebsite),
      companySize: this.validateCompanySize(companySize),
      industry: this.validateIndustry(industry),
      companyDescription: this.validateDescription(companyDescription)
    };

    const touched = {
      companyWebsite: true,
      companySize: true,
      industry: true,
      companyDescription: true
    };

    this.setState({ errors, touched });

    return !errors.companyWebsite && !errors.companySize && !errors.industry && !errors.companyDescription;
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (this.validateForm()) {
      const { companyName, companyWebsite, companySize, industry, companyDescription } = this.state;
      this.props.onSubmit({
        companyName,
        companyWebsite,
        companySize,
        industry,
        companyDescription
      });
    }
  };

  render() {
    const { companyName, companyWebsite, companySize, industry, companyDescription, errors, touched } = this.state;
    const { isLoading } = this.props;
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Company Information</h2>
          <p className="text-gray-500">Tell us about your company to help attract the right candidates</p>
        </div>
        
        {companyName && (
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-medium text-lg">Company Name</h3>
            <p className="text-muted-foreground">{companyName}</p>
          </div>
        )}
        
        <Form>
          <form onSubmit={this.handleSubmit} className="space-y-8">
            <FormField>
              <FormItem>
                <FormLabel>Company Website</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://www.example.com" 
                    value={companyWebsite}
                    onChange={this.handleWebsiteChange}
                  />
                </FormControl>
                <FormDescription>Optional but recommended</FormDescription>
                {touched.companyWebsite && errors.companyWebsite && (
                  <FormMessage>{errors.companyWebsite}</FormMessage>
                )}
              </FormItem>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField>
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select 
                    value={companySize}
                    onValueChange={this.handleCompanySizeChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companySizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.companySize && errors.companySize && (
                    <FormMessage>{errors.companySize}</FormMessage>
                  )}
                </FormItem>
              </FormField>

              <FormField>
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter industry"
                      value={industry}
                      onChange={this.handleIndustryChange}
                    />
                  </FormControl>
                  {touched.industry && errors.industry && (
                    <FormMessage>{errors.industry}</FormMessage>
                  )}
                </FormItem>
              </FormField>
            </div>

            <FormField>
              <FormItem>
                <FormLabel>Company Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your company, its mission, and what makes it unique..."
                    value={companyDescription}
                    onChange={this.handleDescriptionChange}
                    rows={5}
                  />
                </FormControl>
                <FormDescription>
                  This will be visible to candidates applying for your jobs
                </FormDescription>
                {touched.companyDescription && errors.companyDescription && (
                  <FormMessage>{errors.companyDescription}</FormMessage>
                )}
              </FormItem>
            </FormField>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Label } from "../ui/Label";
import { 
  Building2, 
  Plus, 
  Search, 
  Loader2, 
  Edit, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Users,
  X
} from "lucide-react";
import nloService, { Company, CompanyCreateRequest } from '../../lib/api/nloService';
import { useToast } from "../ui/use-toast";

const CompanyManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'create' | 'edit' | 'activate' | 'deactivate'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CompanyCreateRequest>({
    name: '',
    email: '',
    website: '',
    description: '',
    location: '',
    phone: '',
    industry: '',
    companySize: '',
    logoUrl: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nloService.getAllCompanies();
      setCompanies(Array.isArray(data) ? data : []);
      setFilteredCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies. Please try again later.');
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filter companies based on search and active tab
  useEffect(() => {
    const filterCompanies = () => {
      let filtered = companies;

      // Filter by active status based on tab
      if (activeTab === 'active') {
        filtered = filtered.filter(c => c.active);
      } else {
        filtered = filtered.filter(c => !c.active);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(company =>
          company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredCompanies(filtered);
    };

    filterCompanies();
  }, [searchTerm, companies, activeTab]);

  const handleCreateClick = () => {
    setSelectedCompany(null);
    setActionType('create');
    setFormData({
      name: '',
      email: '',
      website: '',
      description: '',
      location: '',
      phone: '',
      industry: '',
      companySize: '',
      logoUrl: '',
      hrName: '',
      hrEmail: '',
      hrPhone: '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEditClick = (company: Company, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCompany(company);
    setActionType('edit');
    setFormData({
      name: company.name,
      email: company.email,
      website: company.website || '',
      description: company.description || '',
      location: company.location || '',
      phone: company.phone || '',
      industry: company.industry || '',
      companySize: company.companySize || '',
      logoUrl: company.logoUrl || '',
      hrName: company.hrName || '',
      hrEmail: company.hrEmail || '',
      hrPhone: company.hrPhone || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleActivateClick = (company: Company, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCompany(company);
    setActionType('activate');
    setConfirmDialogOpen(true);
  };

  const handleDeactivateClick = (company: Company, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCompany(company);
    setActionType('deactivate');
    setConfirmDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (formData.hrEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.hrEmail)) {
      errors.hrEmail = 'Invalid HR email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (actionType === 'create') {
        await nloService.createCompany(formData);
        toast({
          title: 'Company Created',
          description: `${formData.name} has been created successfully.`,
          variant: 'default',
        });
      } else if (actionType === 'edit' && selectedCompany) {
        await nloService.updateCompany(selectedCompany.id, formData);
        toast({
          title: 'Company Updated',
          description: `${formData.name} has been updated successfully.`,
          variant: 'default',
        });
      }

      setDialogOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error(`Error ${actionType === 'create' ? 'creating' : 'updating'} company:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${actionType === 'create' ? 'create' : 'update'} company. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany) return;

    try {
      if (actionType === 'activate') {
        await nloService.activateCompany(selectedCompany.id);
        toast({
          title: 'Company Activated',
          description: `${selectedCompany.name} has been activated.`,
          variant: 'default',
        });
      } else if (actionType === 'deactivate') {
        await nloService.deactivateCompany(selectedCompany.id);
        toast({
          title: 'Company Deactivated',
          description: `${selectedCompany.name} has been deactivated.`,
          variant: 'default',
        });
      }

      setConfirmDialogOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error(`Error ${actionType} company:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${actionType} company. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const activeCompanies = companies.filter(c => c.active);
  const inactiveCompanies = companies.filter(c => !c.active);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Company Management</h1>
          <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Create New Company
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle className="inline-block mr-2 h-4 w-4" />
            Active Companies ({activeCompanies.length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'inactive'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <X className="inline-block mr-2 h-4 w-4" />
            Inactive Companies ({inactiveCompanies.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, location, industry..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {!loading && companies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No companies found.</p>
            <Button onClick={handleCreateClick} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Create Your First Company
            </Button>
          </div>
        )}

        {!loading && companies.length > 0 && filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {activeTab === 'active' 
                ? 'No active companies found.' 
                : 'No inactive companies found.'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-4 border-gray-700 hover:bg-gray-800"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Companies Grid */}
        {!loading && filteredCompanies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => {
              const companyInitials = company.name.substring(0, 2).toUpperCase();
              
              return (
                <Card key={company.id} className="bg-gray-900 border-gray-800 hover:border-gray-600 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <CardContent className="p-6">
                    {/* Header with Logo and Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Company Logo/Avatar */}
                        {company.logoUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-800 border border-gray-700 flex-shrink-0">
                            <img
                              src={company.logoUrl}
                              alt={company.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">${companyInitials}</div>`;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {companyInitials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-base truncate">{company.name}</h3>
                          <p className="text-sm text-gray-400 truncate">{company.industry || 'No industry specified'}</p>
                          {company.active ? (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded mt-1">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-500/20 text-gray-400 rounded mt-1">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Action Icon */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={(e) => handleEditClick(company, e)}
                          className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{company.email}</span>
                      </div>
                      {company.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{company.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded text-xs text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <Globe className="h-3 w-3" />
                          <span>Website</span>
                        </a>
                      )}
                      {company.companySize && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded text-xs text-gray-300">
                          <Users className="h-3 w-3" />
                          <span>{company.companySize}</span>
                        </div>
                      )}
                      {company.industry && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded text-xs text-gray-300">
                          <Briefcase className="h-3 w-3" />
                          <span>{company.industry}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {company.description || 'No description available.'}
                    </p>

                    {/* Footer Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-800">
                      {company.active ? (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={(e) => handleDeactivateClick(company, e)}
                          disabled={loading}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="mr-1.5 h-3.5 w-3.5" /> Deactivate
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={(e) => handleActivateClick(company, e)}
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Activate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Company Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {actionType === 'create' ? 'Create New Company' : 'Edit Company'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name" className="text-gray-300">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter company name"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {formErrors.name && <p className="text-sm text-red-400">{formErrors.name}</p>}
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter company description"
                    rows={3}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Technology, Finance"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="companySize" className="text-gray-300">Company Size</Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="company@example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {formErrors.email && <p className="text-sm text-red-400">{formErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-gray-300">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* HR Contact */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">HR Contact (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="hrName" className="text-gray-300">HR Name</Label>
                  <Input
                    id="hrName"
                    value={formData.hrName}
                    onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                    placeholder="HR Manager Name"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="hrEmail" className="text-gray-300">HR Email</Label>
                  <Input
                    id="hrEmail"
                    type="email"
                    value={formData.hrEmail}
                    onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                    placeholder="hr@example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {formErrors.hrEmail && <p className="text-sm text-red-400">{formErrors.hrEmail}</p>}
                </div>
                <div>
                  <Label htmlFor="hrPhone" className="text-gray-300">HR Phone</Label>
                  <Input
                    id="hrPhone"
                    value={formData.hrPhone}
                    onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-gray-300">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="bg-gray-800 border-gray-700 text-white"
              />
              {formData.logoUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Logo Preview:</p>
                  <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-700 hover:bg-gray-800">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} className="bg-blue-600 hover:bg-blue-700">
              {actionType === 'create' ? 'Create Company' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {actionType === 'activate' ? 'Activate Company' : 'Deactivate Company'}
            </DialogTitle>
          </DialogHeader>

          {selectedCompany && (
            <>
              <p className="text-base text-gray-300">
                {actionType === 'activate'
                  ? `Are you sure you want to activate ${selectedCompany.name}?`
                  : `Are you sure you want to deactivate ${selectedCompany.name}?`}
              </p>
              <p className="text-sm text-gray-400">
                {actionType === 'activate'
                  ? 'This will make the company available for job postings.'
                  : 'This will hide the company from job posting selections.'}
              </p>
            </>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={actionType === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'activate' ? 'Activate' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManagementPage;

import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Mail, Phone, MapPin, Users, Globe, Edit, ToggleLeft, ToggleRight, Upload, X as XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { useToast } from '../../components/ui/use-toast';
import nloService, { Company, CompanyCreateRequest } from '../../lib/api/nloService';
import apiClient from '../../lib/api/apiClient';

const CompanyManagementPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CompanyCreateRequest>({
    name: '',
    website: '',
    description: '',
    location: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    logoUrl: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, showActiveOnly]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await nloService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({ title: 'Failed to fetch companies', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (showActiveOnly) {
      filtered = filtered.filter(company => company.active);
    }

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      website: '',
      description: '',
      location: '',
      email: '',
      phone: '',
      industry: '',
      companySize: '',
      logoUrl: '',
      hrName: '',
      hrEmail: '',
      hrPhone: '',
    });
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await nloService.createCompany(formData);
      toast({ title: 'Company created successfully', variant: 'success' });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast({ title: 'Failed to create company', variant: 'destructive' });
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    try {
      await nloService.updateCompany(editingCompany.id, formData);
      toast({ title: 'Company updated successfully', variant: 'success' });
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
      toast({ title: 'Failed to update company', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      if (company.active) {
        await nloService.deactivateCompany(company.id);
        toast({ title: 'Company deactivated successfully', variant: 'success' });
      } else {
        await nloService.activateCompany(company.id);
        toast({ title: 'Company activated successfully', variant: 'success' });
      }
      fetchCompanies();
    } catch (error) {
      console.error('Error toggling company status:', error);
      toast({ title: 'Failed to update company status', variant: 'destructive' });
    }
  };

  const openEditDialog = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      website: company.website || '',
      description: company.description || '',
      location: company.location || '',
      email: company.email,
      phone: company.phone || '',
      industry: company.industry || '',
      companySize: company.companySize || '',
      logoUrl: company.logoUrl || '',
      hrName: company.hrName || '',
      hrEmail: company.hrEmail || '',
      hrPhone: company.hrPhone || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    setUploadingLogo(true);
    try {
      // Get Cloudinary params
      const { data: cloudParams } = await apiClient.get('/public/cloudinary/company-logo-params');

      // Upload to Cloudinary - only include signed parameters
      const cloudForm = new FormData();
      cloudForm.append('file', file);
      cloudForm.append('api_key', cloudParams.apiKey);
      cloudForm.append('timestamp', String(cloudParams.timestamp));
      cloudForm.append('signature', cloudParams.signature);
      cloudForm.append('folder', cloudParams.folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudParams.cloudName}/image/upload`;
      const cloudRes = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudForm,
      });

      const cloudJson = await cloudRes.json();
      if (!cloudRes.ok) {
        throw new Error(cloudJson?.error?.message || 'Upload failed');
      }

      const uploadedUrl = cloudJson.secure_url || cloudJson.url;
      setFormData({ ...formData, logoUrl: uploadedUrl });
      toast({ title: 'Logo uploaded successfully', variant: 'success' });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      const errorMsg = error?.message || 'Failed to upload logo';
      toast({ title: errorMsg, variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const CompanyForm = ({ onSubmit, submitText }: { onSubmit: (e: React.FormEvent) => void; submitText: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <Input
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company Size</label>
          <Input
            value={formData.companySize}
            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Company Logo</label>
          <div className="space-y-2">
            {formData.logoUrl && (
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logoUrl: '' })}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="flex-1"
              />
              {uploadingLogo && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            <p className="text-xs text-gray-500">Or enter logo URL manually:</p>
            <Input
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-lg font-medium mb-3">HR Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">HR Name</label>
            <Input
              value={formData.hrName}
              onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">HR Email</label>
            <Input
              type="email"
              value={formData.hrEmail}
              onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">HR Phone</label>
            <Input
              value={formData.hrPhone}
              onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }}>
          Cancel
        </Button>
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage partner company profiles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>
            <CompanyForm onSubmit={handleCreateCompany} submitText="Create Company" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant={showActiveOnly ? "default" : "outline"}
              onClick={() => setShowActiveOnly(!showActiveOnly)}
            >
              {showActiveOnly ? "Show All" : "Active Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge variant={company.active ? "default" : "secondary"}>
                      {company.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(company)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(company)}
                  >
                    {company.active ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  {company.email}
                </div>
                {company.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {company.phone}
                  </div>
                )}
                {company.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.location}
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {company.industry && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    {company.industry}
                  </div>
                )}
              </div>

              {(company.hrName || company.hrEmail || company.hrPhone) && (
                <div className="border-t pt-3">
                  <h5 className="text-sm font-medium mb-2">HR Contact</h5>
                  <div className="space-y-1">
                    {company.hrName && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.hrName}</div>
                    )}
                    {company.hrEmail && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.hrEmail}</div>
                    )}
                    {company.hrPhone && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.hrPhone}</div>
                    )}
                  </div>
                </div>
              )}

              {company.description && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {company.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No companies found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first company"}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <CompanyForm onSubmit={handleEditCompany} submitText="Update Company" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManagementPage;

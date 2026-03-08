import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { getJobTemplates, deleteJobTemplate, createJobFromTemplate } from '../services/templates';
import { Briefcase, Trash2, Plus } from 'lucide-react';

export const JobTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getJobTemplates();
      setTemplates(data || []);
    } catch (err: any) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;

    setActioningId(templateId);
    try {
      await deleteJobTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      setError('Failed to delete template');
    } finally {
      setActioningId(null);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setActioningId(templateId);
    try {
      const job = await createJobFromTemplate(templateId);
      navigate(`/employer/jobs`);
    } catch (err: any) {
      setError('Failed to create job from template');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Templates</h1>
            <p className="text-gray-600 mt-1">Save and reuse job postings</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/employer/post-job')}>
            <Plus size={18} className="mr-2" />
            Create New Job
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No templates yet</p>
              <p className="text-gray-400 text-sm mb-6">
                Save your job postings as templates to reuse them later
              </p>
              <Button variant="primary" onClick={() => navigate('/employer/post-job')}>
                Post Your First Job
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {template.template_name}
                    </h2>
                    <p className="text-base font-medium text-gray-700 mb-2">{template.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.description}</p>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>📍 {template.city}</span>
                      <span>💼 {template.employment_type}</span>
                      {(template.salary_min || template.salary_max) && (
                        <span>💰 ₹{template.salary_min || 0} - ₹{template.salary_max || 0}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUseTemplate(template.id)}
                      loading={actioningId === template.id}
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      loading={actioningId === template.id}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { apiRequest } from './core';
import type { TestTemplate, CreateTemplateRequest, UpdateTemplateRequest, Pool } from './types';

// Helper function to convert template Date objects to ISO strings
const convertTemplateDates = (template: {
  id: string;
  name: string;
  description?: string;
  pools: Pool[];
  createdAt: Date | string;
  updatedAt: Date | string;
}): TestTemplate => {
  const createdAtStr = typeof template.createdAt === 'string' 
    ? template.createdAt 
    : (template.createdAt as Date).toISOString();
  const updatedAtStr = typeof template.updatedAt === 'string' 
    ? template.updatedAt 
    : (template.updatedAt as Date).toISOString();
  
  return {
    ...template,
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  };
};

export const testTemplatesApi = {
  async getAll(): Promise<TestTemplate[]> {
    const templates = await apiRequest<TestTemplate[]>('/design/templates');
    return templates.map(convertTemplateDates);
  },

  async getById(id: string): Promise<TestTemplate> {
    const template = await apiRequest<TestTemplate>(`/design/templates/${id}`);
    return convertTemplateDates(template);
  },

  async create(data: CreateTemplateRequest): Promise<TestTemplate> {
    const template = await apiRequest<TestTemplate>('/design/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return convertTemplateDates(template);
  },

  async update(id: string, data: UpdateTemplateRequest): Promise<TestTemplate> {
    const template = await apiRequest<TestTemplate>(`/design/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return convertTemplateDates(template);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/design/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

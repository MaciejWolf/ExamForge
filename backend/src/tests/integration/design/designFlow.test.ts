import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../../index';
import { createSupabaseClient } from '../../../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Design Module Integration Test - Complete Flow
 *
 * This test file follows the complete design flow:
 * 1. Create questions in the global bank
 * 2. Add tags to questions
 * 3. Create a test template with local pools referencing the global questions
 * 4. Verify the template and its pools are retrievable
 * 5. Update the template structure
 * 6. Attempt to delete a used question (expect failure)
 * 7. Remove question from template and delete (expect success)
 */
describe('Design Module Integration Tests - Complete Flow', () => {
  let app: Express;
  let supabase: SupabaseClient;

  // Shared test data across tests
  let question1Id: string;
  let question2Id: string;
  let question3Id: string;
  let templateId: string;

  beforeAll(async () => {
    supabase = createSupabaseClient();

    // Clean the database before executing tests
    // Clean templates first (they reference questions)
    const { error: templatesError } = await supabase
      .from('templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (templatesError) {
      console.error('Failed to clean templates table', templatesError);
      throw templatesError;
    }

    // Clean questions after templates are removed
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (questionsError) {
      console.error('Failed to clean questions table', questionsError);
      throw questionsError;
    }

    app = createApp({
      designModuleConfig: {
        supabaseClient: supabase
      }
    });

    // app = createApp();
  });

  afterAll(async () => {
    // Clean up templates first (they reference questions)
    const { error: templatesError } = await supabase
      .from('templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (templatesError) {
      console.error('Failed to clean templates table in afterAll', templatesError);
    }

    // Clean up questions after templates are removed
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (questionsError) {
      console.error('Failed to clean questions table in afterAll', questionsError);
    }
  });

  it('1. POST /api/design/questions: Create questions in the global bank', async () => {
    // Create first question
    const question1Data = {
      text: 'What is 2+2?',
      answers: [
        { id: 'answer-1', text: '3' },
        { id: 'answer-2', text: '4' },
        { id: 'answer-3', text: '5' },
      ],
      correctAnswerId: 'answer-2',
      tags: ['math'],
    };

    const response1 = await request(app)
      .post('/api/design/questions')
      .send(question1Data)
      .expect(201);

    expect(response1.body).toMatchObject({
      text: question1Data.text,
      correctAnswerId: question1Data.correctAnswerId,
    });
    expect(response1.body.id).toBeDefined();
    expect(response1.body.tags).toEqual(['math']);

    question1Id = response1.body.id;

    // Create second question
    const question2Data = {
      text: 'What is the capital of France?',
      answers: [
        { id: 'answer-1', text: 'London' },
        { id: 'answer-2', text: 'Paris' },
        { id: 'answer-3', text: 'Berlin' },
      ],
      correctAnswerId: 'answer-2',
      tags: ['geography'],
    };

    const response2 = await request(app)
      .post('/api/design/questions')
      .send(question2Data)
      .expect(201);

    expect(response2.body.id).toBeDefined();
    question2Id = response2.body.id;

    // Create third question
    const question3Data = {
      text: 'What is the largest planet in our solar system?',
      answers: [
        { id: 'answer-1', text: 'Earth' },
        { id: 'answer-2', text: 'Jupiter' },
        { id: 'answer-3', text: 'Saturn' },
      ],
      correctAnswerId: 'answer-2',
      tags: ['science'],
    };

    const response3 = await request(app)
      .post('/api/design/questions')
      .send(question3Data)
      .expect(201);

    expect(response3.body.id).toBeDefined();
    question3Id = response3.body.id;

    // Verify all three questions were created
    expect(question1Id).toBeDefined();
    expect(question2Id).toBeDefined();
    expect(question3Id).toBeDefined();
  });

  it('2. PUT /api/design/questions/:id: Add tags to questions', async () => {
    // Add additional tags to question 1
    const updateData1 = {
      tags: ['math', 'arithmetic', 'easy'],
    };

    const response1 = await request(app)
      .put(`/api/design/questions/${question1Id}`)
      .send(updateData1)
      .expect(200);

    expect(response1.body.tags).toEqual(['math', 'arithmetic', 'easy']);

    // Add additional tags to question 2
    const updateData2 = {
      tags: ['geography', 'europe', 'capitals'],
    };

    const response2 = await request(app)
      .put(`/api/design/questions/${question2Id}`)
      .send(updateData2)
      .expect(200);

    expect(response2.body.tags).toEqual(['geography', 'europe', 'capitals']);

    // Add additional tags to question 3
    const updateData3 = {
      tags: ['science', 'astronomy', 'planets'],
    };

    const response3 = await request(app)
      .put(`/api/design/questions/${question3Id}`)
      .send(updateData3)
      .expect(200);

    expect(response3.body.tags).toEqual(['science', 'astronomy', 'planets']);
  });

  it('3. POST /api/design/templates: Create a test template with local pools referencing the global questions', async () => {
    const templateData = {
      name: 'General Knowledge Test',
      description: 'A test covering multiple subjects',
      pools: [
        {
          name: 'Math Pool',
          questionCount: 1,
          points: 10,
          questionIds: [question1Id],
        },
        {
          name: 'Geography Pool',
          questionCount: 1,
          points: 10,
          questionIds: [question2Id],
        },
        {
          name: 'Science Pool',
          questionCount: 1,
          points: 10,
          questionIds: [question3Id],
        },
      ],
    };

    const response = await request(app)
      .post('/api/design/templates')
      .send(templateData)
      .expect(201);

    expect(response.body).toMatchObject({
      name: templateData.name,
      description: templateData.description,
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.pools).toHaveLength(3);
    expect(response.body.pools[0].questionIds).toEqual([question1Id]);
    expect(response.body.pools[1].questionIds).toEqual([question2Id]);
    expect(response.body.pools[2].questionIds).toEqual([question3Id]);

    templateId = response.body.id;
  });

  it('4. GET /api/design/templates/:id: Verify the template and its pools are retrievable', async () => {
    const response = await request(app)
      .get(`/api/design/templates/${templateId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: templateId,
      name: 'General Knowledge Test',
      description: 'A test covering multiple subjects',
    });
    expect(response.body.pools).toHaveLength(3);

    // Verify Math Pool
    const mathPool = response.body.pools.find((p: any) => p.name === 'Math Pool');
    expect(mathPool).toBeDefined();
    expect(mathPool.questionIds).toEqual([question1Id]);
    expect(mathPool.questionCount).toBe(1);
    expect(mathPool.points).toBe(10);

    // Verify Geography Pool
    const geoPool = response.body.pools.find((p: any) => p.name === 'Geography Pool');
    expect(geoPool).toBeDefined();
    expect(geoPool.questionIds).toEqual([question2Id]);

    // Verify Science Pool
    const sciPool = response.body.pools.find((p: any) => p.name === 'Science Pool');
    expect(sciPool).toBeDefined();
    expect(sciPool.questionIds).toEqual([question3Id]);
  });

  it('5. PUT /api/design/templates/:id: Update the template structure', async () => {
    // Update the template by adding question 1 to geography pool as well
    // and removing the science pool
    const updateData = {
      pools: [
        {
          name: 'Math Pool',
          questionCount: 1,
          points: 10,
          questionIds: [question1Id],
        },
        {
          name: 'Geography Pool',
          questionCount: 2,
          points: 15,
          questionIds: [question2Id, question1Id], // Add question 1 to this pool
        },
        // Science pool removed
      ],
    };

    const response = await request(app)
      .put(`/api/design/templates/${templateId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.pools).toHaveLength(2);

    // Verify updated Geography Pool
    const geoPool = response.body.pools.find((p: any) => p.name === 'Geography Pool');
    expect(geoPool).toBeDefined();
    expect(geoPool.questionIds).toEqual([question2Id, question1Id]);
    expect(geoPool.questionCount).toBe(2);
    expect(geoPool.points).toBe(15);

    // Verify Science Pool is removed
    const sciPool = response.body.pools.find((p: any) => p.name === 'Science Pool');
    expect(sciPool).toBeUndefined();
  });

  it('6. DELETE /api/design/questions/:id: Attempt to delete a used question (expect failure)', async () => {
    // Try to delete question 1, which is used in the template
    const response = await request(app)
      .delete(`/api/design/questions/${question1Id}`)
      .expect(409);

    expect(response.body.error).toBeDefined();
    expect(response.body.error.type).toBe('QuestionInUse');
    expect(response.body.error.questionId).toBe(question1Id);
    expect(response.body.error.templateIds).toContain(templateId);
  });

  it('6. DELETE /api/design/questions/:id: Remove question from template and delete (expect success)', async () => {
    // First, update the template to remove question 1 from all pools
    const updateData = {
      pools: [
        {
          name: 'Geography Pool',
          questionCount: 1,
          points: 10,
          questionIds: [question2Id], // Remove question 1
        },
      ],
    };

    await request(app)
      .put(`/api/design/templates/${templateId}`)
      .send(updateData)
      .expect(200);

    // Now try to delete question 1 (should succeed)
    const deleteResponse = await request(app)
      .delete(`/api/design/questions/${question1Id}`)
      .expect(200);

    expect(deleteResponse.body.message).toBe('Question deleted successfully');

    // Verify the question is actually deleted
    await request(app)
      .get(`/api/design/questions/${question1Id}`)
      .expect(404);

    // Also verify question 3 can be deleted (it's not used in the template anymore)
    const delete3Response = await request(app)
      .delete(`/api/design/questions/${question3Id}`)
      .expect(200);

    expect(delete3Response.body.message).toBe('Question deleted successfully');
  });
});

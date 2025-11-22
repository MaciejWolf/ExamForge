import { describe, it, expect, beforeEach } from 'vitest';
import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../index';
import { Question } from '../../design/types/question';

describe('Design Module Integration Tests - Questions API', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  describe('POST /api/design/questions', () => {
    it('should create a question with valid data and return the created question with an ID', async () => {
      const questionData = {
        text: 'What is 2+2?',
        answers: [
          { id: 'answer-1', text: '3' },
          { id: 'answer-2', text: '4' },
          { id: 'answer-3', text: '5' },
        ],
        correctAnswerId: 'answer-2',
        points: 2,
        tags: [
          { id: 'tag-1', name: 'math' },
          { id: 'tag-2', name: 'arithmetic' },
        ],
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(201);

      expect(response.body).toMatchObject({
        text: questionData.text,
        points: questionData.points,
        correctAnswerId: questionData.correctAnswerId,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.answers).toEqual(questionData.answers);
      expect(response.body.tags).toEqual(questionData.tags);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return validation error for missing required field - content', async () => {
      const questionData = {
        answers: [
          { id: 'answer-1', text: '3' },
          { id: 'answer-2', text: '4' },
        ],
        correctAnswerId: 'answer-2',
        points: 2,
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toBeDefined();
    });

    it('should return validation error for missing required field - answers', async () => {
      const questionData = {
        text: 'What is 2+2?',
        correctAnswerId: 'answer-2',
        points: 2,
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
    });

    it('should return validation error for missing required field - points', async () => {
      const questionData = {
        text: 'What is 2+2?',
        answers: [
          { id: 'answer-1', text: '3' },
          { id: 'answer-2', text: '4' },
        ],
        correctAnswerId: 'answer-2',
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
    });

    it('should return validation error for empty content', async () => {
      const questionData = {
        text: '',
        answers: [
          { id: 'answer-1', text: '3' },
          { id: 'answer-2', text: '4' },
        ],
        correctAnswerId: 'answer-2',
        points: 2,
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toContain('empty');
    });

    it('should return validation error for negative points', async () => {
      const questionData = {
        text: 'What is 2+2?',
        answers: [
          { id: 'answer-1', text: '3' },
          { id: 'answer-2', text: '4' },
        ],
        correctAnswerId: 'answer-2',
        points: -1,
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toContain('points');
    });

    it('should return validation error for invalid answer structure - too few answers', async () => {
      const questionData = {
        text: 'What is 2+2?',
        answers: [{ id: 'answer-1', text: '3' }],
        correctAnswerId: 'answer-1',
        points: 2,
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toContain('at least 2 answers');
    });

    it('should return validation error for invalid answer structure - too many answers', async () => {
      const questionData = {
        text: 'What is 2+2?',
        answers: Array.from({ length: 7 }, (_, i) => ({
          id: `answer-${i + 1}`,
          text: `${i + 1}`,
        })),
        correctAnswerId: 'answer-1',
        points: 2,
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toContain('more than 6 answers');
    });

    it('should persist the question and allow retrieval after creation', async () => {
      const questionData = {
        text: 'What is 2+2?',
        answers: [
          { id: 'answer-1', text: '3' },
          { id: 'answer-2', text: '4' },
        ],
        correctAnswerId: 'answer-2',
        points: 2,
        tags: [{ id: 'tag-1', name: 'math' }],
      };

      const createResponse = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(201);

      const questionId = createResponse.body.id;

      const getResponse = await request(app)
        .get(`/api/design/questions/${questionId}`)
        .expect(200);

      expect(getResponse.body).toMatchObject({
        id: questionId,
        text: questionData.text,
        points: questionData.points,
        correctAnswerId: questionData.correctAnswerId,
      });
      expect(getResponse.body.answers).toEqual(questionData.answers);
      expect(getResponse.body.tags).toEqual(questionData.tags);
    });
  });

  describe('PUT /api/design/questions/:id', () => {
    let createdQuestionId: string;

    beforeEach(async () => {
      const questionData = {
        text: 'Original question',
        answers: [
          { id: 'answer-1', text: 'Option 1' },
          { id: 'answer-2', text: 'Option 2' },
        ],
        correctAnswerId: 'answer-1',
        points: 1,
        tags: [{ id: 'tag-1', name: 'original' }],
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(201);

      createdQuestionId = response.body.id;
    });

    it('should update question content and verify changes are persisted', async () => {
      const updateData = {
        text: 'Updated question text',
      };

      const updateResponse = await request(app)
        .put(`/api/design/questions/${createdQuestionId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.text).toBe('Updated question text');

      const getResponse = await request(app)
        .get(`/api/design/questions/${createdQuestionId}`)
        .expect(200);

      expect(getResponse.body.text).toBe('Updated question text');
    });

    it('should update question answers and verify changes are persisted', async () => {
      const updateData = {
        answers: [
          { id: 'answer-1', text: 'New Option 1' },
          { id: 'answer-2', text: 'New Option 2' },
          { id: 'answer-3', text: 'New Option 3' },
        ],
        correctAnswerId: 'answer-3',
      };

      const updateResponse = await request(app)
        .put(`/api/design/questions/${createdQuestionId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.answers).toEqual(updateData.answers);
      expect(updateResponse.body.correctAnswerId).toBe('answer-3');

      const getResponse = await request(app)
        .get(`/api/design/questions/${createdQuestionId}`)
        .expect(200);

      expect(getResponse.body.answers).toEqual(updateData.answers);
      expect(getResponse.body.correctAnswerId).toBe('answer-3');
    });

    it('should update question points and verify changes are persisted', async () => {
      const updateData = {
        points: 5,
      };

      const updateResponse = await request(app)
        .put(`/api/design/questions/${createdQuestionId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.points).toBe(5);

      const getResponse = await request(app)
        .get(`/api/design/questions/${createdQuestionId}`)
        .expect(200);

      expect(getResponse.body.points).toBe(5);
    });

    it('should update question tags and verify changes are persisted', async () => {
      const updateData = {
        tags: [
          { id: 'tag-1', name: 'math' },
          { id: 'tag-2', name: 'algebra' },
          { id: 'tag-3', name: 'updated' },
        ],
      };

      const updateResponse = await request(app)
        .put(`/api/design/questions/${createdQuestionId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.tags).toEqual(updateData.tags);

      const getResponse = await request(app)
        .get(`/api/design/questions/${createdQuestionId}`)
        .expect(200);

      expect(getResponse.body.tags).toEqual(updateData.tags);
    });

    it('should return validation error when updating with invalid data - empty content', async () => {
      const updateData = {
        text: '',
      };

      const response = await request(app)
        .put(`/api/design/questions/${createdQuestionId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toContain('empty');
    });

    it('should return validation error when updating with invalid data - negative points', async () => {
      const updateData = {
        points: -5,
      };

      const response = await request(app)
        .put(`/api/design/questions/${createdQuestionId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toContain('points');
    });

    it('should return validation error when updating with invalid data - too few answers', async () => {
      const updateData = {
        answers: [{ id: 'answer-1', text: 'Only one' }],
        correctAnswerId: 'answer-1',
      };

      const response = await request(app)
        .put(`/api/design/questions/${createdQuestionId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('InvalidQuestionData');
      expect(response.body.error.message).toContain('at least 2 answers');
    });

    it('should return error response when updating a non-existent question ID', async () => {
      const updateData = {
        text: 'Updated text',
      };

      const response = await request(app)
        .put('/api/design/questions/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('QuestionNotFound');
      expect(response.body.error.questionId).toBe('non-existent-id');
    });
  });

  describe('GET /api/design/questions/:id', () => {
    let createdQuestion: Question;

    beforeEach(async () => {
      const questionData = {
        text: 'Test question for retrieval',
        answers: [
          { id: 'answer-1', text: 'Answer 1' },
          { id: 'answer-2', text: 'Answer 2' },
          { id: 'answer-3', text: 'Answer 3' },
        ],
        correctAnswerId: 'answer-2',
        points: 3,
        tags: [
          { id: 'tag-1', name: 'test' },
          { id: 'tag-2', name: 'integration' },
        ],
      };

      const response = await request(app)
        .post('/api/design/questions')
        .send(questionData)
        .expect(201);

      createdQuestion = response.body;
    });

    it('should retrieve an existing question by ID and verify all fields are returned correctly', async () => {
      const response = await request(app)
        .get(`/api/design/questions/${createdQuestion.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdQuestion.id,
        text: createdQuestion.text,
        points: createdQuestion.points,
        correctAnswerId: createdQuestion.correctAnswerId,
      });
      expect(response.body.answers).toEqual(createdQuestion.answers);
      expect(response.body.tags).toEqual(createdQuestion.tags);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return error response when retrieving a non-existent question ID', async () => {
      const response = await request(app)
        .get('/api/design/questions/non-existent-id')
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.type).toBe('QuestionNotFound');
      expect(response.body.error.questionId).toBe('non-existent-id');
    });

    it('should verify the retrieved question matches the data that was created/updated', async () => {
      // First, update the question
      const updateData = {
        text: 'Updated question text',
        points: 5,
        tags: [{ id: 'tag-3', name: 'updated' }],
      };

      await request(app)
        .put(`/api/design/questions/${createdQuestion.id}`)
        .send(updateData)
        .expect(200);

      // Then retrieve and verify it matches the update
      const response = await request(app)
        .get(`/api/design/questions/${createdQuestion.id}`)
        .expect(200);

      expect(response.body.text).toBe('Updated question text');
      expect(response.body.points).toBe(5);
      expect(response.body.tags).toEqual(updateData.tags);
      expect(response.body.id).toBe(createdQuestion.id);
    });
  });
});


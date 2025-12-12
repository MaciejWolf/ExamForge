import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createAssessmentRouter } from '../http';
import { AssessmentModule } from '../index';
import { ok, err } from '../../shared/result';

describe('Assessment HTTP Routes', () => {
  let app: express.Express;
  let mockModule: AssessmentModule;

  beforeEach(() => {
    mockModule = {
      startSession: vi.fn(),
      listSessions: vi.fn(),
      getSessionById: vi.fn(),
      getSessionReport: vi.fn(),
      startTestInstance: vi.fn(),
      finishTestInstance: vi.fn(),
      getTestQuestions: vi.fn(),
    } as unknown as AssessmentModule;

    app = express();
    app.use(express.json());
    app.use('/', createAssessmentRouter(mockModule));
  });

  describe('POST /instances/:id/finish', () => {
    it('should finish a test instance successfully', async () => {
      const testInstanceId = 'test-id';
      const mockResult = {
        id: testInstanceId,
        startedAt: new Date(),
        completedAt: new Date(),
        testContent: {
          id: 'content-id',
          templateId: 'template-id',
          sections: [],
          createdAt: new Date(),
        }
      };

      (mockModule.finishTestInstance as any).mockResolvedValue(ok(mockResult));

      const response = await request(app)
        .post(`/instances/${testInstanceId}/finish`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testInstanceId);
      expect(response.body.completedAt).toBeDefined();
    });

    it('should return 400 when test not started', async () => {
        const testInstanceId = 'test-id';
        (mockModule.finishTestInstance as any).mockResolvedValue(err({
            type: 'TestNotStarted',
            testInstanceId
        }));

        const response = await request(app)
            .post(`/instances/${testInstanceId}/finish`)
            .send();

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('TestNotStarted');
    });

    it('should return 400 when test already finished', async () => {
        const testInstanceId = 'test-id';
        (mockModule.finishTestInstance as any).mockResolvedValue(err({
            type: 'TestAlreadyFinished',
            testInstanceId
        }));

        const response = await request(app)
            .post(`/instances/${testInstanceId}/finish`)
            .send();

        expect(response.status).toBe(400);
        expect(response.body.error.type).toBe('TestAlreadyFinished');
    });

     it('should return 404 when test instance not found', async () => {
        const testInstanceId = 'test-id';
        (mockModule.finishTestInstance as any).mockResolvedValue(err({
            type: 'TestInstanceNotFound',
            testInstanceId
        }));

        const response = await request(app)
            .post(`/instances/${testInstanceId}/finish`)
            .send();

        expect(response.status).toBe(404);
        expect(response.body.error.type).toBe('TestInstanceNotFound');
    });
  });
});

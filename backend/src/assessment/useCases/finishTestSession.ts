import { Result, ok, err } from '../../shared/result';
import { TestInstance } from '../types/testInstance';
import { AssessmentError } from '../types/assessmentError';
import { SessionRepository, TestInstanceRepository } from '../repository';
import { TestContentPackage } from '../../design/types/testContentPackage';

type FinishTestInstanceDeps = {
  testInstanceRepo: TestInstanceRepository;
  sessionRepo: SessionRepository;
  now: () => Date;
};

type ScoreResult = {
  totalScore: number;
  maxScore: number;
};

const calculateScore = (
  testContent: TestContentPackage,
  answers: Record<string, string>
): ScoreResult => {
  let totalScore = 0;
  let maxScore = 0;

  for (const section of testContent.sections) {
    // Calculate max score for section
    maxScore += section.points;

    // Calculate points per question in this section
    const questionsInSection = section.questions.length;
    if (questionsInSection === 0) continue;

    const pointsPerQuestion = section.points / questionsInSection;

    // Award points for correct answers
    for (const question of section.questions) {
      const participantAnswer = answers[question.id];
      if (participantAnswer === question.correctAnswerId) {
        totalScore += pointsPerQuestion;
      }
    }
  }

  return { totalScore, maxScore };
};

export const finishTestInstance = (deps: FinishTestInstanceDeps) => async (testInstanceId: string, answers?: Record<string, string>): Promise<Result<TestInstance, AssessmentError>> => {
  const instance = await deps.testInstanceRepo.findById(testInstanceId);
  if (!instance) {
    return err({ type: 'TestInstanceNotFound', testInstanceId });
  }

  if (!instance.startedAt) {
    return err({ type: 'TestNotStarted', testInstanceId });
  }

  if (instance.completedAt) {
    return err({ type: 'TestAlreadyFinished', testInstanceId });
  }

  // Validate answers if provided
  if (answers !== undefined && (typeof answers !== 'object' || answers === null || Array.isArray(answers))) {
    return err({ type: 'RepositoryError', message: 'Answers must be an object if provided' });
  }

  // Persist answers atomically with completion status
  if (answers !== undefined) {
    instance.answers = answers;
  }

  instance.completedAt = deps.now();

  // Calculate scores if answers are provided
  if (answers !== undefined && instance.startedAt) {
    const { totalScore, maxScore } = calculateScore(instance.testContent, answers);
    instance.totalScore = totalScore;
    instance.maxScore = maxScore;

    // Calculate time taken in minutes
    const timeTakenMs = instance.completedAt.getTime() - instance.startedAt.getTime();
    instance.timeTakenMinutes = timeTakenMs / (1000 * 60);
  }

  await deps.testInstanceRepo.save(instance);

  return ok(instance);
};

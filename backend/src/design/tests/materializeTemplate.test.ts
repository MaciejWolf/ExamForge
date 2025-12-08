import { describe, it, expect, beforeEach } from 'vitest';
import { configureDesignModule, DesignModule } from '../index';

describe('materializeTemplate Use Case', () => {
  let module: DesignModule;
  let questionIds: string[];

  beforeEach(async () => {
    module = givenDesignModule();
    questionIds = await givenQuestions(module, 15);
  });

  it('Successfully materialize template with sufficient questions', async () => {
    // Given template "t-1" having pool "p-1" with 10 questions, questionCount set to 5
    const templateResult = await module.createTemplate({
      name: 'Test Template',
      pools: [{
        name: 'Math Pool',
        questionsToDraw: 5,
        points: 10,
        questionIds: questionIds.slice(0, 10),
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;
    const templateId = templateResult.value.id;

    // When materializeTemplate is called with templateId "t-1"
    const result = await module.materializeTemplate(templateId);

    // Then returns success with TestContentPackage containing 5 randomly selected questions from pool
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.templateId).toBe(templateId);
      expect(result.value.sections).toHaveLength(1);
      expect(result.value.sections[0].questions).toHaveLength(5);
      expect(result.value.sections[0].poolName).toBe('Math Pool');
      expect(result.value.sections[0].points).toBe(10);
      // Verify questions are from the pool
      const materializedQuestionIds = result.value.sections[0].questions.map(q => q.id);
      materializedQuestionIds.forEach(id => {
        expect(questionIds.slice(0, 10)).toContain(id);
      });
    }
  });

  it('Successfully materialize template with multiple pools', async () => {
    // Given template "t-1" having pools "p-1" (10 questions, select 3) and "p-2" (8 questions, select 2)
    const templateResult = await module.createTemplate({
      name: 'Multi-Pool Template',
      pools: [
        {
          name: 'Pool 1',
          questionsToDraw: 3,
          points: 15,
          questionIds: questionIds.slice(0, 10),
        },
        {
          name: 'Pool 2',
          questionsToDraw: 2,
          points: 10,
          questionIds: questionIds.slice(10, 15),
        },
      ],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;
    const templateId = templateResult.value.id;

    // When materializeTemplate is called with templateId "t-1"
    const result = await module.materializeTemplate(templateId);

    // Then returns success with TestContentPackage containing 3 questions from "p-1" and 2 from "p-2"
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sections).toHaveLength(2);

      // Verify first pool
      expect(result.value.sections[0].questions).toHaveLength(3);
      expect(result.value.sections[0].poolName).toBe('Pool 1');
      expect(result.value.sections[0].points).toBe(15);

      // Verify second pool
      expect(result.value.sections[1].questions).toHaveLength(2);
      expect(result.value.sections[1].poolName).toBe('Pool 2');
      expect(result.value.sections[1].points).toBe(10);
    }
  });

  it('Fail to materialize template with insufficient questions in pool', async () => {
    // Given template "t-1" having pool "p-1" with 3 questions, questionCount set to 5
    const templateResult = await module.createTemplate({
      name: 'Insufficient Questions Template',
      pools: [{
        name: 'Small Pool',
        questionsToDraw: 5,
        points: 10,
        questionIds: questionIds.slice(0, 3), // Only 3 questions but requires 5
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;
    const templateId = templateResult.value.id;

    // When materializeTemplate is called with templateId "t-1"
    const result = await module.materializeTemplate(templateId);

    // Then returns error with type "InsufficientQuestions" indicating pool "p-1" needs 2 more questions
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('InsufficientQuestions');
      if (result.error.type === 'InsufficientQuestions') {
        expect(result.error.required).toBe(5);
        expect(result.error.available).toBe(3);
      }
    }
  });

  it('Fail to materialize template with empty pool', async () => {
    // Given template "t-1" having pool "p-1" with 0 questions, questionCount set to 5
    const templateResult = await module.createTemplate({
      name: 'Empty Pool Template',
      pools: [{
        name: 'Empty Pool',
        questionsToDraw: 5,
        points: 10,
        questionIds: [], // Empty pool
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;
    const templateId = templateResult.value.id;

    // When materializeTemplate is called with templateId "t-1"
    const result = await module.materializeTemplate(templateId);

    // Then returns error with type "InsufficientQuestions"
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('InsufficientQuestions');
      if (result.error.type === 'InsufficientQuestions') {
        expect(result.error.required).toBe(5);
        expect(result.error.available).toBe(0);
      }
    }
  });

  it('Fail to materialize non-existent template', async () => {
    // Given no existing templates

    // When materializeTemplate is called with templateId "non-existent-template"
    const result = await module.materializeTemplate('non-existent-template');

    // Then returns error with type "TemplateNotFound"
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('TemplateNotFound');
      if (result.error.type === 'TemplateNotFound') {
        expect(result.error.templateId).toBe('non-existent-template');
      }
    }
  });

  it('Successfully materialize template with exact question count', async () => {
    // Given template "t-1" having pool "p-1" with 5 questions, questionCount set to 5
    const templateResult = await module.createTemplate({
      name: 'Exact Count Template',
      pools: [{
        name: 'Exact Pool',
        questionsToDraw: 5,
        points: 20,
        questionIds: questionIds.slice(0, 5), // Exactly 5 questions
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;
    const templateId = templateResult.value.id;

    // When materializeTemplate is called with templateId "t-1"
    const result = await module.materializeTemplate(templateId);

    // Then returns success with TestContentPackage containing all 5 questions
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sections).toHaveLength(1);
      expect(result.value.sections[0].questions).toHaveLength(5);

      // Verify all questions from the pool are included
      const materializedQuestionIds = result.value.sections[0].questions.map(q => q.id);
      questionIds.slice(0, 5).forEach(id => {
        expect(materializedQuestionIds).toContain(id);
      });
    }
  });

  it('Verify materialization creates frozen snapshot', async () => {
    // Given template "t-1" and question "q-1" in pool
    const templateResult = await module.createTemplate({
      name: 'Snapshot Test Template',
      pools: [{
        name: 'Snapshot Pool',
        questionsToDraw: 1,
        points: 10,
        questionIds: [questionIds[0]],
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;
    const templateId = templateResult.value.id;

    // When materializeTemplate is called with templateId "t-1"
    const result1 = await module.materializeTemplate(templateId);
    expect(result1.ok).toBe(true);
    if (!result1.ok) return;

    const originalQuestion = result1.value.sections[0].questions[0];
    const originalText = originalQuestion.text;
    const originalAnswers = [...originalQuestion.answers];

    // Then question "q-1" is updated in global bank
    const updateResult = await module.updateQuestion({
      id: questionIds[0],
      text: 'Updated Question Text',
    });
    expect(updateResult.ok).toBe(true);

    // Then the materialized TestContentPackage contains the original version of "q-1" (frozen snapshot)
    // Verify the first materialization is unchanged
    expect(result1.value.sections[0].questions[0].text).toBe(originalText);
    expect(result1.value.sections[0].questions[0].answers).toEqual(originalAnswers);
    expect(result1.value.sections[0].questions[0].text).not.toBe('Updated Question Text');

    // Also verify that a new materialization gets the updated version
    const result2 = await module.materializeTemplate(templateId);
    expect(result2.ok).toBe(true);
    if (result2.ok) {
      expect(result2.value.sections[0].questions[0].text).toBe('Updated Question Text');
    }
  });

  it('Verify answer selection with 2 answers - keeps all answers', async () => {
    // Given a question with only 2 answers
    const twoAnswerResult = await module.createQuestion({
      text: 'Two Answer Question',
      answers: [
        { id: 'ans-1', text: 'Correct Answer' },
        { id: 'ans-2', text: 'Wrong Answer' },
      ],
      correctAnswerId: 'ans-1',
      tags: ['test'],
    });

    expect(twoAnswerResult.ok).toBe(true);
    if (!twoAnswerResult.ok) return;

    const templateResult = await module.createTemplate({
      name: 'Two Answer Template',
      pools: [{
        name: 'Two Answer Pool',
        questionsToDraw: 1,
        points: 10,
        questionIds: [twoAnswerResult.value.id],
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;

    // When materializeTemplate is called
    const result = await module.materializeTemplate(templateResult.value.id);

    // Then all 2 answers should be included
    expect(result.ok).toBe(true);
    if (result.ok) {
      const materializedQuestion = result.value.sections[0].questions[0];
      expect(materializedQuestion.answers).toHaveLength(2);

      // Verify correct answer is included
      const hasCorrectAnswer = materializedQuestion.answers.some(a => a.id === 'ans-1');
      expect(hasCorrectAnswer).toBe(true);
    }
  });

  it('Verify answer selection with 3 answers - keeps all answers', async () => {
    // Given a question with 3 answers
    const threeAnswerResult = await module.createQuestion({
      text: 'Three Answer Question',
      answers: [
        { id: 'ans-1', text: 'Correct Answer' },
        { id: 'ans-2', text: 'Wrong Answer 1' },
        { id: 'ans-3', text: 'Wrong Answer 2' },
      ],
      correctAnswerId: 'ans-1',
      tags: ['test'],
    });

    expect(threeAnswerResult.ok).toBe(true);
    if (!threeAnswerResult.ok) return;

    const templateResult = await module.createTemplate({
      name: 'Three Answer Template',
      pools: [{
        name: 'Three Answer Pool',
        questionsToDraw: 1,
        points: 10,
        questionIds: [threeAnswerResult.value.id],
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;

    // When materializeTemplate is called
    const result = await module.materializeTemplate(templateResult.value.id);

    // Then all 3 answers should be included
    expect(result.ok).toBe(true);
    if (result.ok) {
      const materializedQuestion = result.value.sections[0].questions[0];
      expect(materializedQuestion.answers).toHaveLength(3);

      // Verify correct answer is included
      const hasCorrectAnswer = materializedQuestion.answers.some(a => a.id === 'ans-1');
      expect(hasCorrectAnswer).toBe(true);
    }
  });

  it('Verify answer selection with 4 answers - keeps all answers', async () => {
    // Given a question with 4 answers
    const fourAnswerResult = await module.createQuestion({
      text: 'Four Answer Question',
      answers: [
        { id: 'ans-1', text: 'Correct Answer' },
        { id: 'ans-2', text: 'Wrong Answer 1' },
        { id: 'ans-3', text: 'Wrong Answer 2' },
        { id: 'ans-4', text: 'Wrong Answer 3' },
      ],
      correctAnswerId: 'ans-1',
      tags: ['test'],
    });

    expect(fourAnswerResult.ok).toBe(true);
    if (!fourAnswerResult.ok) return;

    const templateResult = await module.createTemplate({
      name: 'Four Answer Template',
      pools: [{
        name: 'Four Answer Pool',
        questionsToDraw: 1,
        points: 10,
        questionIds: [fourAnswerResult.value.id],
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;

    // When materializeTemplate is called
    const result = await module.materializeTemplate(templateResult.value.id);

    // Then all 4 answers should be included
    expect(result.ok).toBe(true);
    if (result.ok) {
      const materializedQuestion = result.value.sections[0].questions[0];
      expect(materializedQuestion.answers).toHaveLength(4);

      // Verify correct answer is included
      const hasCorrectAnswer = materializedQuestion.answers.some(a => a.id === 'ans-1');
      expect(hasCorrectAnswer).toBe(true);
    }
  });

  it('Verify answer selection with 6 answers - selects 4 total (1 correct + 3 incorrect)', async () => {
    // Given a question with 6 answers
    const sixAnswerResult = await module.createQuestion({
      text: 'Six Answer Question',
      answers: [
        { id: 'ans-1', text: 'Correct Answer' },
        { id: 'ans-2', text: 'Wrong Answer 1' },
        { id: 'ans-3', text: 'Wrong Answer 2' },
        { id: 'ans-4', text: 'Wrong Answer 3' },
        { id: 'ans-5', text: 'Wrong Answer 4' },
        { id: 'ans-6', text: 'Wrong Answer 5' },
      ],
      correctAnswerId: 'ans-1',
      tags: ['test'],
    });

    expect(sixAnswerResult.ok).toBe(true);
    if (!sixAnswerResult.ok) return;

    const templateResult = await module.createTemplate({
      name: 'Six Answer Template',
      pools: [{
        name: 'Six Answer Pool',
        questionsToDraw: 1,
        points: 10,
        questionIds: [sixAnswerResult.value.id],
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;

    // When materializeTemplate is called
    const result = await module.materializeTemplate(templateResult.value.id);

    // Then exactly 4 answers should be selected (1 correct + 3 incorrect)
    expect(result.ok).toBe(true);
    if (result.ok) {
      const materializedQuestion = result.value.sections[0].questions[0];
      expect(materializedQuestion.answers).toHaveLength(4);

      // Verify correct answer is included
      const correctAnswer = materializedQuestion.answers.find(a => a.id === 'ans-1');
      expect(correctAnswer).toBeDefined();
      expect(correctAnswer?.text).toBe('Correct Answer');

      // Verify 3 incorrect answers are included
      const incorrectAnswers = materializedQuestion.answers.filter(a => a.id !== 'ans-1');
      expect(incorrectAnswers).toHaveLength(3);

      // Verify all selected answers are from the original set
      materializedQuestion.answers.forEach(answer => {
        expect(['ans-1', 'ans-2', 'ans-3', 'ans-4', 'ans-5', 'ans-6']).toContain(answer.id);
      });
    }
  });

  it('Verify answers are shuffled in random order', async () => {
    // Create a module with actual random shuffling
    let idCounter = 1;
    const moduleWithRandomShuffle = configureDesignModule({
      idGenerator: () => `test-id-${idCounter++}`,
      now: () => new Date('2025-11-22T00:00:00Z'),
      randomSelector: deterministicSelector, // Keep question selection deterministic
      // answerShuffler not specified - uses default random shuffler
    });

    // Given a question with 4 answers
    const questionResult = await moduleWithRandomShuffle.createQuestion({
      text: 'Shuffle Test Question',
      answers: [
        { id: 'ans-1', text: 'Answer A' },
        { id: 'ans-2', text: 'Answer B' },
        { id: 'ans-3', text: 'Answer C' },
        { id: 'ans-4', text: 'Answer D' },
      ],
      correctAnswerId: 'ans-1',
      tags: ['test'],
    });

    expect(questionResult.ok).toBe(true);
    if (!questionResult.ok) return;

    const templateResult = await moduleWithRandomShuffle.createTemplate({
      name: 'Shuffle Template',
      pools: [{
        name: 'Shuffle Pool',
        questionsToDraw: 1,
        points: 10,
        questionIds: [questionResult.value.id],
      }],
    });

    expect(templateResult.ok).toBe(true);
    if (!templateResult.ok) return;

    // When we materialize the template multiple times
    const results = [];
    for (let i = 0; i < 10; i++) {
      const result = await moduleWithRandomShuffle.materializeTemplate(templateResult.value.id);
      if (result.ok) {
        const answerOrder = result.value.sections[0].questions[0].answers.map(a => a.id).join(',');
        results.push(answerOrder);
      }
    }

    // Then we should see at least some variation in answer order (not all the same)
    // Note: There's a small chance this could fail due to random chance, but it's very unlikely
    const uniqueOrders = new Set(results);
    expect(uniqueOrders.size).toBeGreaterThan(1);

    // Verify all materializations still have all 4 answers
    expect(results).toHaveLength(10);
  });
});

// Helper functions

const givenDesignModule = () => {
  let idCounter = 1;

  return configureDesignModule({
    idGenerator: () => `test-id-${idCounter++}`,
    now: () => new Date('2025-11-22T00:00:00Z'),
    randomSelector: deterministicSelector, // Use deterministic selection for tests
    answerShuffler: deterministicShuffler, // Use deterministic shuffling for tests
  });
};

const givenQuestions = async (
  module: DesignModule,
  count: number
): Promise<string[]> => {
  const questionIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const result = await module.createQuestion({
      text: `Question ${i + 1}`,
      answers: [
        { id: 'ans-1', text: 'Answer 1' },
        { id: 'ans-2', text: 'Answer 2' },
      ],
      correctAnswerId: 'ans-1',
      tags: ['test'],
    });

    if (result.ok) {
      questionIds.push(result.value.id);
    } else {
      throw new Error(`Failed to create test question: ${result.error}`);
    }
  }

  return questionIds;
};

// Deterministic selector for predictable testing - returns first N items
const deterministicSelector = <T>(items: T[], count: number): T[] => {
  return items.slice(0, count);
};

// Deterministic shuffler for predictable testing - returns items in original order
const deterministicShuffler = <T>(items: T[]): T[] => {
  return [...items];
};

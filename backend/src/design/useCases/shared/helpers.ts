import { Answer, Question } from '../../types/question';

// Helper function to create a deep copy/snapshot of a question with answer selection and shuffling
export const createQuestionSnapshot = (
    question: Question,
    randomSelector: <T>(items: T[], count: number) => T[],
    answerShuffler: <T>(items: T[]) => T[]
): Question => {
    const selectedAnswers = selectAndShuffleAnswers(
        question.answers,
        question.correctAnswerId,
        randomSelector,
        answerShuffler
    );

    return {
        ...question,
        answers: selectedAnswers,
        tags: [...question.tags],
        createdAt: new Date(question.createdAt),
        updatedAt: new Date(question.updatedAt),
    };
};

// Helper function to select and shuffle answers
// Rules:
// - If question has <= 4 answers: select all and shuffle
// - If question has > 4 answers: select 1 correct + 3 random incorrect, then shuffle
export const selectAndShuffleAnswers = (
    answers: Answer[],
    correctAnswerId: string,
    randomSelector: <T>(items: T[], count: number) => T[],
    answerShuffler: <T>(items: T[]) => T[]
): Answer[] => {
    // If 4 or fewer answers, return all of them shuffled
    if (answers.length <= 4) {
        const copiedAnswers = answers.map(a => ({ ...a }));
        return answerShuffler(copiedAnswers);
    }

    // If more than 4 answers, select 1 correct + 3 incorrect
    const correctAnswer = answers.find(a => a.id === correctAnswerId);
    const incorrectAnswers = answers.filter(a => a.id !== correctAnswerId);

    if (!correctAnswer) {
        // Fallback: if correct answer not found, just take first 4 and shuffle
        const copiedAnswers = answers.slice(0, 4).map(a => ({ ...a }));
        return answerShuffler(copiedAnswers);
    }

    // Select 3 random incorrect answers
    const selectedIncorrect = randomSelector(incorrectAnswers, Math.min(3, incorrectAnswers.length));

    // Combine correct + selected incorrect, make deep copies, and shuffle
    const selectedAnswers = [correctAnswer, ...selectedIncorrect].map(a => ({ ...a }));
    return answerShuffler(selectedAnswers);
};

// Default random selector using Fisher-Yates shuffle algorithm
export const defaultRandomSelector = <T>(items: T[], count: number): T[] => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
};

// Default shuffler using Fisher-Yates shuffle algorithm
export const defaultShuffler = <T>(items: T[]): T[] => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

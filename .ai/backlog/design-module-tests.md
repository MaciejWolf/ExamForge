# Design Module Unit Test Cases

This document contains unit test cases for the Design Module, written in Given/When/Then style. These tests follow the Vertical Slice Architecture pattern and test the module's public API directly using in-memory repositories and deterministic test stubs.

## Global Question Bank Management Tests

### createQuestion Use Case

**Test Case: Successfully create a new question in the global bank**
- **Given** a design module configured with in-memory repository and deterministic ID generation
- **When** createQuestion is called with valid question data (text: "What is 2+2?", answers: ["3", "4", "5", "6"], correctAnswerIndex: 1, points: 2)
- **Then** returns success with a question containing the provided data, generated ID/timestamps, and empty tags array

**Test Case: Successfully create a question with tags**
- **Given** a design module configured with in-memory repository
- **When** createQuestion is called with valid question data and tags: ["math", "basic"]
- **Then** returns success with question containing the specified tags

**Test Case: Fail to create question with invalid data - too few answers**
- **Given** a design module configured with in-memory repository
- **When** createQuestion is called with only 1 answer
- **Then** returns error with type "InvalidQuestionData"

**Test Case: Fail to create question with invalid data - too many answers**
- **Given** a design module configured with in-memory repository
- **When** createQuestion is called with 7 answers
- **Then** returns error with type "InvalidQuestionData"

**Test Case: Fail to create question with invalid correct answer index**
- **Given** a design module configured with in-memory repository
- **When** createQuestion is called with correctAnswerIndex out of bounds
- **Then** returns error with type "InvalidQuestionData"

### updateQuestion Use Case

**Test Case: Successfully update existing question**
- **Given** a design module with an existing question (id: "q-1", text: "Old question")
- **When** updateQuestion is called with id "q-1" and new text "Updated question"
- **Then** returns success with updated question and new timestamp

**Test Case: Successfully update question tags**
- **Given** a design module with an existing question with tags ["math"]
- **When** updateQuestion is called to update tags to ["math", "algebra"]
- **Then** returns success with updated tags

**Test Case: Verify question update propagates to all templates**
- **Given** a design module with question "q-1" used in templates "t-1" and "t-2"
- **When** updateQuestion is called to modify question "q-1"
- **Then** returns success and both templates reflect the updated question data

**Test Case: Fail to update non-existent question**
- **Given** a design module with no questions
- **When** updateQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### deleteQuestion Use Case

**Test Case: Successfully delete unused question**
- **Given** a design module with an existing question (id: "q-1") not used in any template
- **When** deleteQuestion is called with id "q-1"
- **Then** returns success and question is no longer retrievable

**Test Case: Fail to delete question used in template**
- **Given** a design module with question "q-1" assigned to a pool in template "t-1"
- **When** deleteQuestion is called with id "q-1"
- **Then** returns error with type "QuestionInUse" containing list of templates using it

**Test Case: Fail to delete non-existent question**
- **Given** a design module with no questions
- **When** deleteQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### getQuestion Use Case

**Test Case: Successfully retrieve existing question**
- **Given** a design module with an existing question (id: "q-1")
- **When** getQuestion is called with id "q-1"
- **Then** returns success with complete question data including answers, points, and tags

**Test Case: Fail to retrieve non-existent question**
- **Given** a design module with no questions
- **When** getQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### listQuestions Use Case

**Test Case: Successfully list all questions in global bank**
- **Given** a design module with 5 questions in the global bank
- **When** listQuestions is called without filters
- **Then** returns success with array of all 5 questions

**Test Case: Successfully list questions filtered by single tag**
- **Given** a design module with questions tagged: q-1["math"], q-2["math", "algebra"], q-3["history"]
- **When** listQuestions is called with tag filter ["math"]
- **Then** returns success with array containing q-1 and q-2

**Test Case: Successfully list questions filtered by multiple tags (AND logic)**
- **Given** a design module with questions tagged: q-1["math"], q-2["math", "algebra"], q-3["history"]
- **When** listQuestions is called with tag filter ["math", "algebra"]
- **Then** returns success with array containing only q-2

**Test Case: Successfully list questions with no matching tags**
- **Given** a design module with questions tagged: q-1["math"], q-2["history"]
- **When** listQuestions is called with tag filter ["science"]
- **Then** returns success with empty array

**Test Case: Successfully list questions from empty bank**
- **Given** a design module with no questions
- **When** listQuestions is called
- **Then** returns success with empty array

## Tag Management Tests

### addTagsToQuestion Use Case

**Test Case: Successfully add tags to question**
- **Given** a design module with question "q-1" having tags ["math"]
- **When** addTagsToQuestion is called with id "q-1" and tags ["algebra", "basic"]
- **Then** returns success with question having tags ["math", "algebra", "basic"]

**Test Case: Successfully add tags to question with no existing tags**
- **Given** a design module with question "q-1" having no tags
- **When** addTagsToQuestion is called with id "q-1" and tags ["math"]
- **Then** returns success with question having tags ["math"]

**Test Case: Ignore duplicate tags when adding**
- **Given** a design module with question "q-1" having tags ["math"]
- **When** addTagsToQuestion is called with id "q-1" and tags ["math", "algebra"]
- **Then** returns success with question having tags ["math", "algebra"] (no duplicate "math")

**Test Case: Fail to add tags to non-existent question**
- **Given** a design module with no questions
- **When** addTagsToQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### removeTagsFromQuestion Use Case

**Test Case: Successfully remove tags from question**
- **Given** a design module with question "q-1" having tags ["math", "algebra", "basic"]
- **When** removeTagsFromQuestion is called with id "q-1" and tags ["basic"]
- **Then** returns success with question having tags ["math", "algebra"]

**Test Case: Successfully remove all tags from question**
- **Given** a design module with question "q-1" having tags ["math"]
- **When** removeTagsFromQuestion is called with id "q-1" and tags ["math"]
- **Then** returns success with question having empty tags array

**Test Case: Ignore non-existent tags when removing**
- **Given** a design module with question "q-1" having tags ["math"]
- **When** removeTagsFromQuestion is called with id "q-1" and tags ["history", "science"]
- **Then** returns success with question still having tags ["math"]

**Test Case: Fail to remove tags from non-existent question**
- **Given** a design module with no questions
- **When** removeTagsFromQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### listTags Use Case

**Test Case: Successfully list all unique tags**
- **Given** a design module with questions having tags: q-1["math", "basic"], q-2["math", "algebra"], q-3["history"]
- **When** listTags is called
- **Then** returns success with array ["math", "basic", "algebra", "history"]

**Test Case: Successfully list tags when no questions exist**
- **Given** a design module with no questions
- **When** listTags is called
- **Then** returns success with empty array

### suggestTags Use Case

**Test Case: Successfully suggest tags matching partial input**
- **Given** a design module with existing tags ["mathematics", "math-basic", "history", "algebra"]
- **When** suggestTags is called with query "math"
- **Then** returns success with array ["mathematics", "math-basic"]

**Test Case: Successfully suggest tags with case-insensitive matching**
- **Given** a design module with existing tags ["Mathematics", "MATH-BASIC", "History"]
- **When** suggestTags is called with query "math"
- **Then** returns success with array ["Mathematics", "MATH-BASIC"]

**Test Case: Successfully suggest tags with no matches**
- **Given** a design module with existing tags ["mathematics", "history"]
- **When** suggestTags is called with query "science"
- **Then** returns success with empty array

**Test Case: Successfully suggest tags with empty query**
- **Given** a design module with existing tags ["math", "history", "science"]
- **When** suggestTags is called with empty query ""
- **Then** returns success with all tags ["math", "history", "science"]

## Template Management Tests

### createTemplate Use Case

**Test Case: Successfully create template with empty pools**
- **Given** a design module configured with in-memory repository
- **When** createTemplate is called with valid template data (name: "Midterm Exam") and no pools
- **Then** returns success with template containing generated ID, provided name, and empty pools array

**Test Case: Successfully create template with local pools**
- **Given** a design module configured with in-memory repository
- **When** createTemplate is called with name "Final Exam" and pools: [{name: "Math", questionCount: 5}, {name: "History", questionCount: 3}]
- **Then** returns success with template containing two local pools with generated pool IDs

**Test Case: Fail to create template with duplicate name**
- **Given** a design module with existing template named "Midterm Exam"
- **When** createTemplate is called with same name "Midterm Exam"
- **Then** returns error with type "TemplateNameConflict"

**Test Case: Fail to create template with duplicate pool names**
- **Given** a design module configured with in-memory repository
- **When** createTemplate is called with pools having duplicate names: [{name: "Math", ...}, {name: "Math", ...}]
- **Then** returns error with type "DuplicatePoolNames"

### updateTemplate Use Case

**Test Case: Successfully update template name**
- **Given** a design module with existing template (id: "t-1", name: "Old Exam")
- **When** updateTemplate is called with id "t-1" and new name "Updated Exam"
- **Then** returns success with updated template and new timestamp

**Test Case: Successfully update template metadata**
- **Given** a design module with existing template (id: "t-1")
- **When** updateTemplate is called with id "t-1" and new description
- **Then** returns success with updated template

**Test Case: Fail to update non-existent template**
- **Given** a design module with no templates
- **When** updateTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### deleteTemplate Use Case

**Test Case: Successfully delete existing template**
- **Given** a design module with existing template (id: "t-1") containing local pools
- **When** deleteTemplate is called with id "t-1"
- **Then** returns success, template is no longer retrievable, and local pools are deleted

**Test Case: Verify deleting template does not delete questions from global bank**
- **Given** a design module with template "t-1" containing pool with question "q-1"
- **When** deleteTemplate is called with id "t-1"
- **Then** returns success and question "q-1" still exists in global bank

**Test Case: Fail to delete non-existent template**
- **Given** a design module with no templates
- **When** deleteTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### getTemplate Use Case

**Test Case: Successfully retrieve existing template with pools**
- **Given** a design module with existing template (id: "t-1") containing 2 local pools
- **When** getTemplate is called with id "t-1"
- **Then** returns success with complete template data including all local pools and their questions

**Test Case: Fail to retrieve non-existent template**
- **Given** a design module with no templates
- **When** getTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### listTemplates Use Case

**Test Case: Successfully list all templates**
- **Given** a design module with 3 existing templates
- **When** listTemplates is called
- **Then** returns success with array containing all 3 templates

**Test Case: Successfully list empty templates**
- **Given** a design module with no templates
- **When** listTemplates is called
- **Then** returns success with empty array

## Local Pool Management Tests (within Templates)

### createPoolInTemplate Use Case

**Test Case: Successfully create pool in template**
- **Given** a design module with existing template "t-1"
- **When** createPoolInTemplate is called with templateId "t-1", name "Math Pool", questionCount 5
- **Then** returns success with new pool containing generated ID and empty questions array

**Test Case: Fail to create pool with duplicate name in same template**
- **Given** a design module with template "t-1" containing pool named "Math Pool"
- **When** createPoolInTemplate is called with templateId "t-1" and name "Math Pool"
- **Then** returns error with type "PoolNameConflict"

**Test Case: Successfully create pools with same name in different templates**
- **Given** a design module with templates "t-1" and "t-2"
- **When** createPoolInTemplate is called for both templates with name "Math Pool"
- **Then** returns success for both (pool names are scoped to templates)

**Test Case: Fail to create pool in non-existent template**
- **Given** a design module with no templates
- **When** createPoolInTemplate is called with templateId "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### updatePoolInTemplate Use Case

**Test Case: Successfully update pool name**
- **Given** a design module with template "t-1" containing pool "p-1" named "Old Name"
- **When** updatePoolInTemplate is called with templateId "t-1", poolId "p-1", new name "New Name"
- **Then** returns success with updated pool

**Test Case: Successfully update pool question count**
- **Given** a design module with template "t-1" containing pool "p-1" with questionCount 5
- **When** updatePoolInTemplate is called with templateId "t-1", poolId "p-1", questionCount 10
- **Then** returns success with updated questionCount

**Test Case: Fail to update pool in non-existent template**
- **Given** a design module with no templates
- **When** updatePoolInTemplate is called with templateId "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

**Test Case: Fail to update non-existent pool**
- **Given** a design module with template "t-1" with no pools
- **When** updatePoolInTemplate is called with templateId "t-1", poolId "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

### deletePoolFromTemplate Use Case

**Test Case: Successfully delete pool from template**
- **Given** a design module with template "t-1" containing pool "p-1" with questions
- **When** deletePoolFromTemplate is called with templateId "t-1", poolId "p-1"
- **Then** returns success, pool is removed from template, questions remain in global bank

**Test Case: Fail to delete pool from non-existent template**
- **Given** a design module with no templates
- **When** deletePoolFromTemplate is called with templateId "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

**Test Case: Fail to delete non-existent pool**
- **Given** a design module with template "t-1" with no pools
- **When** deletePoolFromTemplate is called with templateId "t-1", poolId "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

### addQuestionToPool Use Case

**Test Case: Successfully add question from global bank to pool**
- **Given** a design module with template "t-1", pool "p-1", and question "q-1" in global bank
- **When** addQuestionToPool is called with templateId "t-1", poolId "p-1", questionId "q-1"
- **Then** returns success and question "q-1" is now in pool "p-1"

**Test Case: Fail to add question already in another pool in same template**
- **Given** a design module with template "t-1", pools "p-1" and "p-2", question "q-1" already in "p-1"
- **When** addQuestionToPool is called with templateId "t-1", poolId "p-2", questionId "q-1"
- **Then** returns error with type "QuestionAlreadyInPool"

**Test Case: Successfully add same question to pools in different templates**
- **Given** a design module with templates "t-1" and "t-2", each with pool "p-1", and question "q-1"
- **When** addQuestionToPool is called for both templates with questionId "q-1"
- **Then** returns success for both (question can be in multiple templates)

**Test Case: Fail to add non-existent question**
- **Given** a design module with template "t-1" and pool "p-1"
- **When** addQuestionToPool is called with questionId "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

**Test Case: Fail to add question to non-existent pool**
- **Given** a design module with template "t-1" and question "q-1"
- **When** addQuestionToPool is called with poolId "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

### removeQuestionFromPool Use Case

**Test Case: Successfully remove question from pool**
- **Given** a design module with template "t-1", pool "p-1" containing question "q-1"
- **When** removeQuestionFromPool is called with templateId "t-1", poolId "p-1", questionId "q-1"
- **Then** returns success and question "q-1" is removed from pool (but remains in global bank)

**Test Case: Fail to remove question not in pool**
- **Given** a design module with template "t-1", pool "p-1" without question "q-1"
- **When** removeQuestionFromPool is called with templateId "t-1", poolId "p-1", questionId "q-1"
- **Then** returns error with type "QuestionNotInPool"

**Test Case: Fail to remove question from non-existent pool**
- **Given** a design module with template "t-1"
- **When** removeQuestionFromPool is called with poolId "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

### moveQuestionBetweenPools Use Case

**Test Case: Successfully move question from one pool to another in same template**
- **Given** a design module with template "t-1", pools "p-1" and "p-2", question "q-1" in "p-1"
- **When** moveQuestionBetweenPools is called with templateId "t-1", questionId "q-1", fromPoolId "p-1", toPoolId "p-2"
- **Then** returns success, question "q-1" is removed from "p-1" and added to "p-2"

**Test Case: Fail to move question to pool in different template**
- **Given** a design module with templates "t-1" and "t-2", each with pools
- **When** moveQuestionBetweenPools is called with mismatched template IDs
- **Then** returns error with type "InvalidPoolReferences"

**Test Case: Fail to move question not in source pool**
- **Given** a design module with template "t-1", pools "p-1" and "p-2", question "q-1" not in "p-1"
- **When** moveQuestionBetweenPools is called with fromPoolId "p-1"
- **Then** returns error with type "QuestionNotInPool"

**Test Case: Fail to move question to non-existent pool**
- **Given** a design module with template "t-1", pool "p-1" containing question "q-1"
- **When** moveQuestionBetweenPools is called with toPoolId "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

### listPoolsInTemplate Use Case

**Test Case: Successfully list all pools in template**
- **Given** a design module with template "t-1" containing 3 pools
- **When** listPoolsInTemplate is called with templateId "t-1"
- **Then** returns success with array containing all 3 pools with their questions

**Test Case: Successfully list pools in template with no pools**
- **Given** a design module with template "t-1" containing no pools
- **When** listPoolsInTemplate is called with templateId "t-1"
- **Then** returns success with empty array

**Test Case: Fail to list pools in non-existent template**
- **Given** a design module with no templates
- **When** listPoolsInTemplate is called with templateId "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

## Template Materialization Tests

### materializeTemplate Use Case

**Test Case: Successfully materialize template with sufficient questions**
- **Given** a design module with template "t-1" having pool "p-1" with 10 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns success with TestContentPackage containing 5 randomly selected questions from pool

**Test Case: Successfully materialize template with multiple pools**
- **Given** a design module with template "t-1" having pools "p-1" (10 questions, select 3) and "p-2" (8 questions, select 2)
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns success with TestContentPackage containing 3 questions from "p-1" and 2 from "p-2"

**Test Case: Fail to materialize template with insufficient questions in pool**
- **Given** a design module with template "t-1" having pool "p-1" with 3 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns error with type "InsufficientQuestions" indicating pool "p-1" needs 2 more questions

**Test Case: Fail to materialize template with empty pool**
- **Given** a design module with template "t-1" having pool "p-1" with 0 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns error with type "InsufficientQuestions"

**Test Case: Fail to materialize non-existent template**
- **Given** a design module with no templates
- **When** materializeTemplate is called with templateId "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

**Test Case: Successfully materialize template with exact question count**
- **Given** a design module with template "t-1" having pool "p-1" with 5 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns success with TestContentPackage containing all 5 questions

**Test Case: Verify materialization creates frozen snapshot**
- **Given** a design module with template "t-1" and question "q-1" in pool
- **When** materializeTemplate is called with templateId "t-1", then question "q-1" is updated in global bank
- **Then** the materialized TestContentPackage contains the original version of "q-1" (frozen snapshot)

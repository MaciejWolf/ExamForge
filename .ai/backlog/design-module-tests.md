# Design Module Unit Test Cases

This document contains unit test cases for the Design Module, written in Given/When/Then style. These tests follow the Vertical Slice Architecture pattern and test the module's public API directly using in-memory repositories and deterministic test stubs.

## Question Pool Management Tests

### createPool Use Case

**Test Case: Successfully create a new question pool**
- **Given** a design module configured with in-memory repository and deterministic ID generation
- **When** createPool is called with valid pool data (name: "Math Pool", description: "Basic math questions")
- **Then** returns success with a pool containing the provided data and generated ID/timestamps

**Test Case: Fail to create pool with duplicate name**
- **Given** a design module with an existing pool named "Math Pool"
- **When** createPool is called with the same name "Math Pool"
- **Then** returns error with type "PoolNameConflict"

**Test Case: Fail to create pool with invalid data**
- **Given** a design module configured with in-memory repository
- **When** createPool is called with empty name
- **Then** returns error with type "InvalidPoolData"

### updatePool Use Case

**Test Case: Successfully update an existing pool**
- **Given** a design module with an existing pool (id: "pool-1", name: "Math Pool")
- **When** updatePool is called with id "pool-1" and new description "Advanced math questions"
- **Then** returns success with updated pool containing new description and updated timestamp

**Test Case: Fail to update non-existent pool**
- **Given** a design module with no pools
- **When** updatePool is called with id "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

### deletePool Use Case

**Test Case: Successfully delete an existing pool**
- **Given** a design module with an existing pool (id: "pool-1")
- **When** deletePool is called with id "pool-1"
- **Then** returns success and pool is no longer retrievable

**Test Case: Fail to delete non-existent pool**
- **Given** a design module with no pools
- **When** deletePool is called with id "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

**Test Case: Fail to delete pool with existing questions**
- **Given** a design module with a pool containing questions
- **When** deletePool is called with that pool's id
- **Then** returns error with type "PoolNotEmpty"

### getPool Use Case

**Test Case: Successfully retrieve existing pool**
- **Given** a design module with an existing pool (id: "pool-1", name: "Math Pool")
- **When** getPool is called with id "pool-1"
- **Then** returns success with the complete pool data

**Test Case: Fail to retrieve non-existent pool**
- **Given** a design module with no pools
- **When** getPool is called with id "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

### listPools Use Case

**Test Case: Successfully list all pools**
- **Given** a design module with multiple pools (3 pools total)
- **When** listPools is called
- **Then** returns success with array containing all 3 pools

**Test Case: Successfully list empty pools**
- **Given** a design module with no pools
- **When** listPools is called
- **Then** returns success with empty array

## Question Management Tests

### createQuestion Use Case

**Test Case: Successfully create question in existing pool**
- **Given** a design module with an existing pool (id: "pool-1")
- **When** createQuestion is called with poolId "pool-1" and valid question data (text: "What is 2+2?", answers: ["3", "4"], correctAnswer: 1)
- **Then** returns success with question containing generated ID and association to pool

**Test Case: Fail to create question in non-existent pool**
- **Given** a design module with no pools
- **When** createQuestion is called with poolId "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

**Test Case: Fail to create question with invalid data**
- **Given** a design module with an existing pool
- **When** createQuestion is called with question having no answers
- **Then** returns error with type "InvalidQuestionData"

### updateQuestion Use Case

**Test Case: Successfully update existing question**
- **Given** a design module with an existing question (id: "q-1", text: "Old question")
- **When** updateQuestion is called with id "q-1" and new text "Updated question"
- **Then** returns success with updated question and new timestamp

**Test Case: Fail to update non-existent question**
- **Given** a design module with no questions
- **When** updateQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### deleteQuestion Use Case

**Test Case: Successfully delete existing question**
- **Given** a design module with an existing question (id: "q-1")
- **When** deleteQuestion is called with id "q-1"
- **Then** returns success and question is no longer retrievable

**Test Case: Fail to delete non-existent question**
- **Given** a design module with no questions
- **When** deleteQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### getQuestion Use Case

**Test Case: Successfully retrieve existing question**
- **Given** a design module with an existing question (id: "q-1")
- **When** getQuestion is called with id "q-1"
- **Then** returns success with complete question data including answers

**Test Case: Fail to retrieve non-existent question**
- **Given** a design module with no questions
- **When** getQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### listQuestions Use Case

**Test Case: Successfully list questions in pool**
- **Given** a design module with a pool containing 3 questions
- **When** listQuestions is called with that pool's id
- **Then** returns success with array of all 3 questions

**Test Case: Successfully list questions in empty pool**
- **Given** a design module with an empty pool (no questions)
- **When** listQuestions is called with that pool's id
- **Then** returns success with empty array

**Test Case: Fail to list questions in non-existent pool**
- **Given** a design module with no pools
- **When** listQuestions is called with id "non-existent-pool"
- **Then** returns error with type "PoolNotFound"

## Template Management Tests

### createTemplate Use Case

**Test Case: Successfully create template**
- **Given** a design module configured with in-memory repository
- **When** createTemplate is called with valid template data (name: "Midterm Exam", poolIds: ["pool-1", "pool-2"], questionCount: 10)
- **Then** returns success with template containing generated ID and provided configuration

**Test Case: Fail to create template with duplicate name**
- **Given** a design module with existing template named "Midterm Exam"
- **When** createTemplate is called with same name "Midterm Exam"
- **Then** returns error with type "TemplateNameConflict"

**Test Case: Fail to create template with invalid pool references**
- **Given** a design module with no pools
- **When** createTemplate is called with non-existent pool IDs
- **Then** returns error with type "InvalidPoolReferences"

### updateTemplate Use Case

**Test Case: Successfully update existing template**
- **Given** a design module with existing template (id: "template-1", name: "Old Exam")
- **When** updateTemplate is called with id "template-1" and new name "Updated Exam"
- **Then** returns success with updated template and new timestamp

**Test Case: Fail to update non-existent template**
- **Given** a design module with no templates
- **When** updateTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### deleteTemplate Use Case

**Test Case: Successfully delete existing template**
- **Given** a design module with existing template (id: "template-1")
- **When** deleteTemplate is called with id "template-1"
- **Then** returns success and template is no longer retrievable

**Test Case: Fail to delete non-existent template**
- **Given** a design module with no templates
- **When** deleteTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### getTemplate Use Case

**Test Case: Successfully retrieve existing template**
- **Given** a design module with existing template (id: "template-1")
- **When** getTemplate is called with id "template-1"
- **Then** returns success with complete template data including pool references

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

### materializeTemplate Use Case

**Test Case: Successfully materialize template with sufficient questions**
- **Given** a design module with template referencing pools containing enough questions
- **When** materializeTemplate is called with template id
- **Then** returns success with TestContentPackage containing selected questions

**Test Case: Fail to materialize template with insufficient questions**
- **Given** a design module with template requesting more questions than available in pools
- **When** materializeTemplate is called with template id
- **Then** returns error with type "InsufficientQuestions"

**Test Case: Fail to materialize non-existent template**
- **Given** a design module with no templates
- **When** materializeTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"


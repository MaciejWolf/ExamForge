# Design Module Unit Test Cases

This document contains unit test cases for the Design Module, written in Given/When/Then style. These tests follow the Vertical Slice Architecture pattern and test the module's public API directly using in-memory repositories and deterministic test stubs.

## Global Question Bank Management Tests

### createQuestion Use Case

- [x] **Test Case: Successfully create a new question**
- **Given** no existing questions in the global bank
- **When** createQuestion is called with valid question data and tags: ["math", "basic"]
- **Then** returns success with question containing the specified tags

- [x] **Test Case: Fail to create question with invalid data - too few answers**
- **Given** no existing questions in the global bank
- **When** createQuestion is called with only 1 answer
- **Then** returns error with type "InvalidQuestionData"

- [x] **Test Case: Fail to create question with invalid data - too many answers**
- **Given** no existing questions in the global bank
- **When** createQuestion is called with 7 answers
- **Then** returns error with type "InvalidQuestionData"

- [x] **Test Case: Fail to create question with invalid correct answer index**
- **Given** no existing questions in the global bank
- **When** createQuestion is called with correctAnswerIndex out of bounds
- **Then** returns error with type "InvalidQuestionData"

### updateQuestion Use Case

- [X] **Test Case: Successfully update existing question**
- **Given** an existing question (id: "q-1", text: "Old question")
- **When** updateQuestion is called with id "q-1" and new text "Updated question"
- **Then** returns success with updated question and new timestamp

- [X] **Test Case: Successfully update question tags**
- **Given** an existing question with tags ["math"]
- **When** updateQuestion is called to update tags to ["math", "algebra"]
- **Then** returns success with updated tags

- [X] **Test Case: Fail to update non-existent question**
- **Given** no existing questions
- **When** updateQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### deleteQuestion Use Case

- [X] **Test Case: Successfully delete unused question**
- **Given** an existing question (id: "q-1") not used in any template
- **When** deleteQuestion is called with id "q-1"
- **Then** returns success and question is no longer retrievable

- [x] **Test Case: Fail to delete question used in template**
- **Given** question "q-1" assigned to a pool in template "t-1"
- **When** deleteQuestion is called with id "q-1"
- **Then** returns error with type "QuestionInUse" containing list of templates using it

- [X] **Test Case: Fail to delete non-existent question**
- **Given** no existing questions
- **When** deleteQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

- [X] **Test Case: Successfully delete question after removing it from template**
- **Given** question "q-1" assigned to a pool in template "t-1"
- **When** updateTemplate is called to remove "q-1" from template "t-1", then deleteQuestion is called with id "q-1"
- **Then** returns success and question is no longer retrievable

- [X] **Test Case: Successfully delete question after deleting containing template**
- **Given** question "q-1" assigned to a pool in template "t-1"
- **When** deleteTemplate is called with id "t-1", then deleteQuestion is called with id "q-1"
- **Then** returns success and question is no longer retrievable

### getQuestion Use Case

- [x] **Test Case: Successfully retrieve existing question**
- **Given** an existing question (id: "q-1")
- **When** getQuestion is called with id "q-1"
- **Then** returns success with complete question data including answers, points, and tags

- [x] **Test Case: Fail to retrieve non-existent question**
- **Given** no existing questions
- **When** getQuestion is called with id "non-existent-question"
- **Then** returns error with type "QuestionNotFound"

### listQuestions Use Case

- [X] **Test Case: Successfully list all questions in global bank**
- **Given** 5 questions in the global bank
- **When** listQuestions is called without filters
- **Then** returns success with array of all 5 questions

- [X] **Test Case: Successfully list questions filtered by single tag**
- **Given** questions tagged: q-1["math"], q-2["math", "algebra"], q-3["history"]
- **When** listQuestions is called with tag filter ["math"]
- **Then** returns success with array containing q-1 and q-2

- [X] **Test Case: Successfully list questions filtered by multiple tags (AND logic)**
- **Given** questions tagged: q-1["math"], q-2["math", "algebra"], q-3["history"]
- **When** listQuestions is called with tag filter ["math", "algebra"]
- **Then** returns success with array containing only q-2

- [X] **Test Case: Successfully list questions with no matching tags**
- **Given** questions tagged: q-1["math"], q-2["history"]
- **When** listQuestions is called with tag filter ["science"]
- **Then** returns success with empty array

## Template Management Tests

### createTemplate Use Case

- [x] **Test Case: Fail to create template with empty pools**
- **Given** no existing templates
- **When** createTemplate is called with valid template data (name: "Midterm Exam") and empty pools array
- **Then** returns error indicating that at least one pool is required

- [x] **Test Case: Successfully create template with pools**
- **Given** no existing templates
- **When** createTemplate is called with name "Final Exam" and pools: [{name: "Math", questionCount: 5}, {name: "History", questionCount: 3}]
- **Then** returns success with template containing two pools with generated pool IDs

- [x] **Test Case: Fail to create template with duplicate name**
- **Given** existing template named "Midterm Exam"
- **When** createTemplate is called with same name "Midterm Exam"
- **Then** returns error with type "TemplateNameConflict"

- [x] **Test Case: Fail to create template with duplicate pool names**
- **Given** no existing templates
- **When** createTemplate is called with pools having duplicate names: [{name: "Math", ...}, {name: "Math", ...}]
- **Then** returns error with type "DuplicatePoolNames"

### updateTemplate Use Case

- [x] **Test Case: Successfully update template name**
- **Given** existing template (id: "t-1", name: "Old Exam")
- **When** updateTemplate is called with id "t-1" and new name "Updated Exam"
- **Then** returns success with updated template and new timestamp

- [x] **Test Case: Successfully update template metadata**
- **Given** existing template (id: "t-1")
- **When** updateTemplate is called with id "t-1" and new description
- **Then** returns success with updated template

- [x] **Test Case: Successfully update template, including adding a new pool and modifying an existing pool**
- **Given** existing template (id: "t-1", name: "Template 1") with a pool "p-1" (name: "Math", questionCount: 5)
- **When** updateTemplate is called with id "t-1" and an updated template object that:
    - Renames "Template 1" to "Updated Template 1"
    - Changes "Math" pool's name to "Algebra" and questionCount to 10
    - Adds a new pool "p-2" (name: "History", questionCount: 3)
- **Then** returns success with the updated template, and `getTemplate("t-1")` reflects all changes (new name, updated pool, new pool).

- [x] **Test Case: Successfully update template, including removing a pool and a question from a pool**
- **Given** existing template (id: "t-1") with:
    - Pool "p-1" containing question "q-1"
    - Pool "p-2"
- **When** updateTemplate is called with id "t-1" and an updated template object that:
    - Removes pool "p-2"
    - Removes question "q-1" from pool "p-1"
- **Then** returns success with the updated template, and `getTemplate("t-1")` reflects all changes (pool "p-2" is gone, question "q-1" is gone from "p-1").

- [x] **Test Case: Fail to update non-existent template**
- **Given** no existing templates
- **When** updateTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### deleteTemplate Use Case

- [x] **Test Case: Successfully delete existing template**
- **Given** existing template (id: "t-1") containing local pools
- **When** deleteTemplate is called with id "t-1"
- **Then** returns success, template is no longer retrievable, and local pools are deleted

- [x] **Test Case: Verify deleting template does not delete questions from questions bank**
- **Given** template "t-1" containing pool with question "q-1"
- **When** deleteTemplate is called with id "t-1"
- **Then** returns success and question "q-1" still exists in questions bank

- [x] **Test Case: Fail to delete non-existent template**
- **Given** no existing templates
- **When** deleteTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### getTemplate Use Case

- [x] **Test Case: Successfully retrieve existing template with pools**
- **Given** existing template (id: "t-1") containing 2 pools
- **When** getTemplate is called with id "t-1"
- **Then** returns success with complete template data including all pools and their questions

- [x] **Test Case: Fail to retrieve non-existent template**
- **Given** no existing templates
- **When** getTemplate is called with id "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

### listTemplates Use Case

- [x] **Test Case: Successfully list all templates**
- **Given** 3 existing templates
- **When** listTemplates is called
- **Then** returns success with array containing all 3 templates

- [x] **Test Case: Successfully list empty templates**
- **Given** no existing templates
- **When** listTemplates is called
- **Then** returns success with empty array

## Template Materialization Tests

### materializeTemplate Use Case

- [x] **Test Case: Successfully materialize template with sufficient questions**
- **Given** template "t-1" having pool "p-1" with 10 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns success with TestContentPackage containing 5 randomly selected questions from pool

- [x] **Test Case: Successfully materialize template with multiple pools**
- **Given** template "t-1" having pools "p-1" (10 questions, select 3) and "p-2" (8 questions, select 2)
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns success with TestContentPackage containing 3 questions from "p-1" and 2 from "p-2"

- [x] **Test Case: Fail to materialize template with insufficient questions in pool**
- **Given** template "t-1" having pool "p-1" with 3 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns error with type "InsufficientQuestions" indicating pool "p-1" needs 2 more questions

- [x] **Test Case: Fail to materialize template with empty pool**
- **Given** template "t-1" having pool "p-1" with 0 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns error with type "InsufficientQuestions"

- [x] **Test Case: Fail to materialize non-existent template**
- **Given** no existing templates
- **When** materializeTemplate is called with templateId "non-existent-template"
- **Then** returns error with type "TemplateNotFound"

- [x] **Test Case: Successfully materialize template with exact question count**
- **Given** template "t-1" having pool "p-1" with 5 questions, questionCount set to 5
- **When** materializeTemplate is called with templateId "t-1"
- **Then** returns success with TestContentPackage containing all 5 questions

- [x] **Test Case: Verify materialization creates frozen snapshot**
- **Given** template "t-1" and question "q-1" in pool
- **When** materializeTemplate is called with templateId "t-1", then question "q-1" is updated in global bank
- **Then** the materialized TestContentPackage contains the original version of "q-1" (frozen snapshot)

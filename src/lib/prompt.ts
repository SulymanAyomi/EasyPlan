const today = new Date();
const formattedDate = today.toISOString().split('T')[0];

export const validationPrompt = (userPrompt: string) => (`
You are an assistant for a task management application called EasyPlan. Your job is to determine if a user  is related to task management.

- If the prompt is related to task management, respond with:
"valid".

- If the prompt is NOT related to task management, explain why and suggest how the user can modify their prompt to make it relevant to task management.

Example inputs:
1. Prompt: "Tell me a joke."
Response: "invalid: This is not a task management-related request. Try asking for help planning a project, creating a schedule, or assigning tasks."

2. Prompt: "Plan a training session."
Response: "valid".

Now, classify and provide feedback for the following prompt:
Prompt: "${userPrompt}"

Response:
`)

export const createProjectPrompt = (userPrompt: string) => (`
You are an assistant for a task management application called EasyPlan.
Generate a detailed task list for the following project. take starting date as ${formattedDate} if starting date is not provided: ${userPrompt}.
kindly provide the following information:
- project name
- tasks :
    - name: Task name
    - description: Task description
    - dueDate: Suggested deadline in YYYY-MM-DD format

`)

export const createProjectTaskJson = (userPrompt: string) => `
 "${userPrompt}"
Return the above project task list as a JSON objects, with the following fields: 
- project name
- tasks : [
    - name: Task name
    - status: Default to "To Do"
    - description: Task description
    - dueDate: Suggested deadline in YYYY-MM-DD format
].
`
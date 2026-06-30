import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabaseClient';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Dynamic fallback: creates a realistic task from user input without AI
function createFallbackTask(input: string) {
  const lowerInput = input.toLowerCase();
  
  let category = "Today";
  if (lowerInput.includes("urgent") || lowerInput.includes("now") || lowerInput.includes("asap") || lowerInput.includes("immediately")) {
    category = "Urgent";
  } else if (lowerInput.includes("week") || lowerInput.includes("later") || lowerInput.includes("sometime")) {
    category = "This Week";
  } else if (lowerInput.includes("delegate") || lowerInput.includes("someone") || lowerInput.includes("assign")) {
    category = "Delegate";
  }

  // Extract a clean title (first 60 chars or first sentence)
  const firstSentence = input.split(/[.!?]/)[0].trim();
  const title = firstSentence.length > 60 ? firstSentence.substring(0, 57) + "..." : firstSentence;

  return {
    title,
    category,
    deadline: category === "Urgent" ? "Within 1 hour" : category === "Today" ? "End of day" : "This week",
    time_to_start: category === "Urgent" ? "Now" : "Soon",
    sprints: [
      `Open everything you need for: "${title.substring(0, 30)}..."`,
      "Spend exactly 5 minutes on the hardest part first.",
      "Write down what's blocking you, then solve the smallest blocker.",
      "Do one final check and mark it complete."
    ]
  };
}

router.post('/', async (req, res) => {
  try {
    const { input } = req.body;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are the AI engine for "Deadline Mode", a high-pressure task manager.
      Analyze the following user input: "${input}"
      
      Determine the following:
      1. title: A concise, actionable title.
      2. category: Must be exactly one of: 'Urgent', 'Today', 'This Week', 'Delegate'.
      3. deadline: An estimation of when this needs to be done based on the text (e.g., 'Today 5 PM' or 'Tomorrow 9 AM'). If not specified, infer urgency.
      4. time_to_start: A countdown string of how much time they have left to START the task before it's too late (e.g., '48:22' or '5:00').
      5. sprints: A JSON array of string steps. Break down the task into 2-5 extremely small, specific micro-actions.

      Respond ONLY with a valid JSON object matching this structure:
      {
        "title": "string",
        "category": "string",
        "deadline": "string",
        "time_to_start": "string",
        "sprints": ["step 1", "step 2"]
      }
    `;

    let taskData: any = null;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      const responseText = result.response.text();
      taskData = JSON.parse(responseText);
    } catch (apiError) {
      console.warn("⚠️ Gemini API unavailable. Using smart fallback.", apiError);
      taskData = createFallbackTask(input);
    }

    // Validate taskData has required fields
    if (!taskData.title || !taskData.category || !taskData.sprints) {
      taskData = createFallbackTask(input);
    }

    // Insert task into Supabase
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([
        { 
          title: taskData.title, 
          category: taskData.category, 
          deadline: taskData.deadline, 
          time_to_start: taskData.time_to_start,
          is_active: true
        }
      ])
      .select()
      .single();

    if (taskError) throw taskError;

    // Insert sprints into Supabase
    if (taskData.sprints && taskData.sprints.length > 0) {
      const sprintsToInsert = taskData.sprints.map((text: string, index: number) => ({
        task_id: task.id,
        step_number: index + 1,
        text,
        is_active: index === 0
      }));

      const { error: sprintError } = await supabase
        .from('sprints')
        .insert(sprintsToInsert);

      if (sprintError) throw sprintError;
    }

    res.status(200).json({ success: true, task });
  } catch (error: any) {
    console.error('Triage error:', error);
    res.status(500).json({ error: 'Failed to process triage: ' + (error.message || 'Unknown error') });
  }
});

export default router;

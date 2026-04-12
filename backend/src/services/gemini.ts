import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateProfileTags(
  about: string,
  techStack: string[],
  skills: string[],
  interests: string[]
): Promise<string[]> {
  
  const tryModel = async (modelName: string) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `You are an expert talent profiler. Analyze the following developer profile and generate 5-10 concise, professional, searchable tags that describe their expertise and domains.
    
    About: ${about}
    Tech Stack: ${techStack.join(', ')}
    Skills: ${skills.join(', ')}
    Interests: ${interests.join(', ')}
    
    Return ONLY a JSON array of strings. Example: ["Full-Stack", "Web3", "AI/ML", "Backend", "System Design"]
    
    Tags should be:
    - Short (1-3 words)
    - Searchable
    - Cover domains and roles`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract JSON array from response (handling potential markdown)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in AI response");
    
    const tags = JSON.parse(jsonMatch[0]) as string[];
    return Array.isArray(tags) ? tags.slice(0, 10) : [];
  };

  try {
    // Attempt with Flash first
    try {
      return await tryModel('gemini-flash-latest');
    } catch (e) {
      console.warn(`Gemini Flash failed for tagging, falling back to Pro:`, e);
      // Fallback to Pro
      return await tryModel('gemini-pro-latest');
    }
  } catch (err) {
    console.error('All Gemini tagging attempts failed:', err);
    return [];
  }
}

export async function generateATSScore(
  resumeText: string,
  techStack: string[],
  about: string
): Promise<{ score: number; feedback: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const prompt = `You are an expert ATS (Applicant Tracking System) parser and technical recruiter. 
    Review the following resume text extracted from a PDF. Evaluate it based on how well it maps to standard engineering guidelines and the candidate's self-reported metadata:
    
    Candidate's Stated Tech Stack: ${techStack.join(', ')}
    Candidate's About: ${about}

    Resume Text extracted from PDF:
    """
    ${resumeText.substring(0, 5000)} // Truncating to prevent tokens overflow just in case
    """

    Calculate an ATS match score out of 100 based on standard ATS readability, technical depth, formatting clues, and mapping to the stated tech stack.
    Also generate a brief, actionable feedback string (1-2 sentences) on how they can improve it.
    
    Return ONLY a raw JSON object (do not wrap in markdown tags like \`\`\`json). The format must exactly be:
    {
      "score": 85,
      "feedback": "Your resume effectively highlights your React experience, but consider adding more metric-driven bullet points to quantify your impact."
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Quick cleanup in case of markdown wrapping
    if (text.startsWith('\`\`\`json')) text = text.slice(7);
    if (text.startsWith('\`\`\`')) text = text.slice(3);
    if (text.endsWith('\`\`\`')) text = text.slice(0, -3);
    text = text.trim();

    const parsed = JSON.parse(text);
    return {
      score: parsed.score || 0,
      feedback: parsed.feedback || 'Unable to generate specific feedback.',
    };
  } catch (error: any) {
    console.error('Failed to generate ATS score:', error);
    const errStr = error?.message || String(error);
    return { score: 0, feedback: `Error processing resume via AI: ${errStr}` };
  }
}


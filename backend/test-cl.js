import { executeAiChain, PROMPT_LIBRARY } from './src/services/aiService.js';

const runTest = async (companyName, jobTitle, jobDescription) => {
  const resumeData = {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '555-123-4567',
    location: 'Seattle, WA',
    summary: 'Senior Software Engineer with 5+ years of experience in distributed systems and cloud infrastructure.',
    experience: 'Senior Engineer at TechCorp (2020-2023): Led migration to microservices, improving throughput by 42%. Reduced cloud costs by 35% through resource optimization.',
    skills: 'Node.js, React, AWS, Docker, Kubernetes',
    projects: 'Project Phoenix (Lead): Architected a high-availability event streaming platform.'
  };

  const jobData = { companyName, jobTitle, jobDescription };

  const prompt = PROMPT_LIBRARY.generate_cover_letter;
  
  console.log(`\n--- Generating Cover Letter for ${companyName} - ${jobTitle} ---`);
  
  try {
    const aiResult = await executeAiChain({
      promptType: 'generate_cover_letter',
      systemMsg: prompt.system,
      userMsg: prompt.template(resumeData, jobData),
      stream: false,
    });
    console.log(aiResult.text);
    console.log(`Word Count: ${aiResult.text.split(/\\s+/).length}`);
  } catch (err) {
    console.error('Error generating letter:', err);
  }
};

const main = async () => {
  await runTest(
    'Google', 
    'Senior Software Engineer', 
    'Looking for an engineer to build highly scalable distributed systems. Must have experience with microservices, cloud infrastructure, and optimizing performance.'
  );
  
  await runTest(
    'Amazon', 
    'Cloud Systems Developer', 
    'We need a developer who understands AWS, cost optimization, and high-availability systems. Leadership experience is a plus.'
  );

  await runTest(
    'Microsoft', 
    'Backend Engineer', 
    'Seeking a strong backend engineer experienced in Node.js and event-driven architectures to modernize legacy platforms.'
  );
};

main();

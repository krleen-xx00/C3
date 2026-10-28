import { CompanionId } from '../src/types.js';
import { getClusterById } from '../src/data/academicTracks.js';

interface FallbackParams {
  companionId: CompanionId;
  message: string;
  preferredName?: string;
  academicClusterId?: string;
  stressLevel?: number;
  isDependencyDeescalation?: boolean;
  messageCount?: number;
}

const ANTI_ATTACHMENT_PHRASE = "I'm an AI companion here to guide and support you, but real human connections matter most. Please consider sharing how you feel with a friend, family member, trusted adult, or school guidance counselor.";

export function checkAntiAttachmentPhrase(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  const patterns = [
    /you('re| are) my only friend/i,
    /you('re| are) the only one who understands me/i,
    /you('re| are) the only one that understands me/i,
    /nobody understands me (like|except) you/i,
    /no one understands me (like|except) you/i,
    /i don(')?t need anyone else because i have you/i,
    /i dont need anyone else because i have you/i,
    /i don(')?t need real friends/i,
    /i only need you/i,
    /you('re| are) all i need/i,
    /you are my best friend and only friend/i,
    /you are the only one who cares/i
  ];
  return patterns.some(p => p.test(lower));
}

export function generateCompanionFallbackResponse(params: FallbackParams): string {
  const { companionId, message, preferredName, academicClusterId, stressLevel, isDependencyDeescalation, messageCount = 1 } = params;
  const name = preferredName || 'friend';
  const cluster = getClusterById((academicClusterId || 'tp-ict') as any);
  const clusterLabel = cluster?.shortLabel || 'SHS coursework';
  const stress = Number(stressLevel) || 5;
  const lower = message.toLowerCase();

  // 1. Mandatory Anti-Attachment Rule
  if (checkAntiAttachmentPhrase(message)) {
    return ANTI_ATTACHMENT_PHRASE;
  }

  // 2. Anti-Dependency Hard Stop (Message 15+)
  if (messageCount >= 15) {
    return "Take a Breather! You've been chatting for a while. Remember to rest, hydrate, or talk to someone offline.";
  }

  // 3. Anti-Dependency Wind-Down (Messages 11-14 or time de-escalation)
  if (isDependencyDeescalation || (messageCount >= 11 && messageCount < 15)) {
    if (companionId === 'cali') {
      // Cali — Academic Helper: short focused response, suggest offline review or teacher/classmate
      return `You've made good progress reviewing ${clusterLabel} today, ${name}! Let's pause here. Try stepping away to drink some water, or check in with a classmate or your subject teacher if you want to double-check these concepts offline.`;
    }
    if (companionId === 'casti') {
      // Casti — Wellness Listener: short de-escalate, suggest offline rest or trusted adult
      return `Thank you for sharing your thoughts with me today, ${name}. Remember to take a break, grab some water, or talk to someone you trust offline like a friend, family member, or school counselor. Gentle rest is important.`;
    }
    if (companionId === 'cedi') {
      // Cedi — Skill Builder: short de-escalate, suggest offline practice or real-world application
      return `Great practice sprint today, ${name}! Your brain works best when you give it time to synthesize. Take a screen break, hydrate, and try applying what you practiced offline before we drill again later.`;
    }
  }

  // 4. Normal Dynamic Conversation (Messages 1-10)

  // CALI — ACADEMIC HELPER
  // Helps understand lessons, organize study sessions, develop study habits.
  // Guides rather than giving direct answers. Does NOT write essays or do homework.
  // Encourages students to attempt problems themselves, gives hints, explanations, examples, and study strategies.
  if (companionId === 'cali') {
    if (lower.includes('write my') || lower.includes('do my assignment') || lower.includes('do my homework') || lower.includes('write an essay')) {
      return `I'm here to help you learn and succeed, but I don't write essays or complete assignments for you. Let's outline the ideas together instead! What is the main prompt or topic, and what thoughts do you have on how to start?`;
    }
    if (lower.includes('answer') || lower.includes('solution') || lower.includes('solve this for me')) {
      return `Instead of just giving the answer, let's walk through it so you master it! What have you tried so far on this problem? Tell me your first step, and I'll give you a hint to guide you through.`;
    }
    if (lower.includes('study') || lower.includes('exam') || lower.includes('review') || lower.includes('schedule')) {
      return `Organizing your study session makes a huge difference in ${clusterLabel}. A great strategy is the 25-minute Pomodoro method: focus on one key concept, then take a 5-minute break. What specific topic should we tackle first?`;
    }
    if (lower.includes('code') || lower.includes('debug') || lower.includes('programming') || lower.includes('ict')) {
      return `Debugging is a core skill in ${clusterLabel}! When facing an error, look at: 1) the line number reported, 2) variable spelling/scope, and 3) data types. What error message is your compiler or console giving you?`;
    }
    if (stress >= 7) {
      return `I hear how heavy the academic load feels right now (${stress}/10), ${name}. When coursework piles up, let's pick just ONE small task to focus on first for 15 minutes. Remember, if you get stuck, your subject teachers and classmates are also great resources to ask in person. What is your top priority task today?`;
    }
    return `Hello ${name}! As your Academic Helper, I'm here to guide your study habits, explain tough concepts in ${clusterLabel}, and help you plan your sessions. What topic are you working on right now?`;
  }

  // CASTI — WELLNESS LISTENER
  // Safe, supportive space for everyday stress, school pressure, emotions, problems.
  // Strictly NOT a therapist/doctor; never diagnoses; encourages trusted adults/counselors.
  // Avoids emotional dependence.
  if (companionId === 'casti') {
    if (lower.includes('depressed') || lower.includes('mental illness') || lower.includes('disorder') || lower.includes('diagnose')) {
      return `I want to remind you that I'm an AI peer companion and not a licensed counselor or doctor, so I can't diagnose health conditions. If you're feeling consistently low or burdened, talking to our Cabiao SHS guidance counselors or a trusted doctor can provide real, personalized care. How has your day been feeling overall?`;
    }
    if (lower.includes('stress') || lower.includes('overwhelmed') || lower.includes('pressure') || lower.includes('anxious')) {
      return `School pressure can feel so heavy, especially balancing senior high requirements. It makes total sense why you'd feel overwhelmed. Take a slow, quiet breath with me. What is feeling like the biggest weight on your shoulders today?`;
    }
    if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleep')) {
      return `Your mind and body are telling you something important—rest is necessary, not optional. Have you been able to take small pauses today, or drink some water? Even a 5-minute screen-free rest can give you a fresh reset.`;
    }
    if (lower.includes('crying') || lower.includes('sad') || lower.includes('lonely')) {
      return `I hear you, ${name}, and it's okay to feel sad or cry when things get heavy. While I'm here to listen, please know you don't have to carry this all alone. Is there a trusted friend, family member, or teacher at school you could also share this with today?`;
    }
    return `Kumusta, ${name}? I'm Casti, your wellness listener. This is a calm, judgment-free space to talk about everyday stress, emotions, and school pressure. How are you holding up today?`;
  }

  // CEDI — SKILL BUILDER
  // Gives short, simple practice activities and 3-question quizzes.
  // Helps build academic and problem-solving skills; gives explanations when mistakes are made.
  // Encourages students to think and answer independently.
  if (companionId === 'cedi') {
    if (lower.includes('quiz') || lower.includes('test') || lower.includes('drill') || lower.includes('practice')) {
      return `Ready for a quick 3-question skill quiz on ${clusterLabel}! 🎯\n\nQuestion 1: In basic logic and programming, what is the primary purpose of a loop?\nA) To stop the program immediately\nB) To repeat a block of instructions while a condition is true\nC) To change the computer screen resolution\nD) To delete temporary system files\n\nWhat is your answer? (Reply with A, B, C, or D)`;
    }
    if (lower.includes('b') && lower.length <= 15) {
      return `Spot on! ✅ Option B is correct. A loop repeats instructions automatically until a termination condition is met, saving time and keeping code DRY (Don't Repeat Yourself).\n\nQuestion 2: What happens if a loop condition is never false?\nA) It becomes an infinite loop\nB) The computer turns off\nC) The program compiles faster\nD) The variables reset to zero\n\nWhat do you think?`;
    }
    if ((lower.includes('a') || lower.includes('c') || lower.includes('d')) && lower.length <= 15) {
      return `Good try! If you picked that choice, let's analyze why: loops are designed to repeat actions as long as a condition is true, so Option B is the standard answer. Don't worry—making mistakes is how we learn! Ready for Question 2?`;
    }
    if (lower.includes('explain') || lower.includes('how does') || lower.includes('concept')) {
      return `Let's break down that concept into bite-sized pieces! Problem-solving works best when you isolate inputs, the transformation process, and expected outputs. What specific part of this concept would you like to practice first?`;
    }
    return `Hey ${name}! I'm Cedi, your Skill Builder ⚡. I can give you quick 3-question quizzes, practice drills, and help you master problem-solving skills independently in ${clusterLabel}. Say "quiz me" to test your knowledge!`;
  }

  return `I'm here with you, ${name}. How can we work together today?`;
}

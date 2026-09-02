// Rotating intro slogans displayed dynamically on each website visit
export const INTRO_SLOGANS = [
  "Come on! You were born to Win!",
  "Upload! Learn less! Understand More!",
  "This is a brand new Humanly-AI-Tutor!",
  "Democratizing 1-on-1 Personalized Education for Everyone!",
  "Stop Memorizing. Start Building Deep Intuition!",
  "Your 24/7 Human-Like AI Mentor is Ready!",
  "Master Any Subject at Your Own Pace!",
  "Turn Complex Documents into Instant Interactive Knowledge!"
];

export function getSessionIntroSlogan(): string {
  try {
    const key = 'kishore_ai_mentor_slogan_index';
    const lastIndexStr = localStorage.getItem(key);
    let nextIndex = 0;
    
    if (lastIndexStr !== null) {
      nextIndex = (parseInt(lastIndexStr, 10) + 1) % INTRO_SLOGANS.length;
    } else {
      nextIndex = Math.floor(Math.random() * INTRO_SLOGANS.length);
    }
    
    localStorage.setItem(key, nextIndex.toString());
    return INTRO_SLOGANS[nextIndex];
  } catch (e) {
    return INTRO_SLOGANS[0];
  }
}

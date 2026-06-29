# LastMinute ⏳ — The AI Deadline Pressure Coach

**LastMinute** is a psychology-first, AI-powered productivity engine built to combat task paralysis, chronic procrastination, and missed deadlines.

Unlike traditional, passive task managers that send notifications that are easy to swipe away, **LastMinute** uses pressure-based psychology, immersive sound design, browser isolation, and interactive debriefings to force users into action.

---

## 🚀 Key Features

*   **🎙️ AI Voice Triage**: Speak or dump your cluttered thoughts. The app uses Gemini AI to instantly structure them into clear goals, categorize them by urgency, and estimate start times.
*   **🔒 "No Escape" Fullscreen Mode**: Clicking "Start Now" launches Live Execution Mode, locking the browser into fullscreen, removing tabs, and eliminating external distractions.
*   **🔊 Immersive Sound Design**: Built using client-side Web Audio API synthesis. Features custom ticking sound countdowns in the final 10 seconds of a sprint, failure buzzers, and arpeggiated success chimes.
*   **🛑 Anti-Excuse Quit Modal**: Quitting a live sprint requires typing the phrase `"I GIVE UP"` to force confrontation with procrastination patterns.
*   **⚠ Drift Detection**: Tracks user idle time. If the page is left unattended for more than 30 seconds, the app calculates and displays the exact real-life consequence of that delay.
*   **📅 Calendar Integration**: Seamlessly syncs triaged tasks to Google Calendar, Apple Calendar, or Outlook via dynamic `.ics` file generation.
*   **🔥 Habits & Goals Tracker**: Displays Urgency Streaks, compliance checklist metrics, and active streaks.
*   **💡 AI Recommendations**: A context-aware sidebar widget providing personalized advice based on queue urgency levels.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js (App Router), React, Framer Motion, Tailwind CSS, Lucide Icons, Web Audio API, Web Speech API.
*   **Backend**: Node.js, Express, TypeScript, Google Generative AI SDK (`gemini-2.0-flash`).
*   **Database**: Supabase (PostgreSQL) for task persistence, sprints, and user debrief history.

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Supabase Account

### 1. Database Setup
Create the tables in your Supabase SQL editor:

```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Urgent', 'Today', 'This Week', 'Delegate')),
  deadline TEXT NOT NULL,
  time_to_start TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sprints table
CREATE TABLE sprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false
);

-- Debriefs table
CREATE TABLE debriefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. Backend Configuration
1. Navigate to `/server`.
2. Create a `.env` file:
    ```env
    PORT=5000
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    ```
3. Install dependencies and start:
    ```bash
    npm install
    npm run dev
    ```

### 3. Frontend Configuration
1. Navigate to `/client`.
2. Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
3. Install dependencies and start:
    ```bash
    npm install
    npm run dev
    ```

---

## 🛡️ Demo Insurance (Resilience Built-in)
To guarantee a flawless presentation on stage under variable network conditions or API limits, the backend contains a **Smart Fallback Engine**. If the Gemini API request fails or times out, the backend instantly parses your natural language input locally, creates task steps, and inserts them cleanly into Supabase without throwing errors.

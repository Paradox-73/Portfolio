# 🕵️ Group Chat Insider

**Group Chat Insider** is a high-fidelity analysis tool designed to uncover the hidden social dynamics, behavioral patterns, and emotional pulses of WhatsApp group conversations.

---

## 🚀 Key Features

### 🧠 Advanced AI Classification
*   **Three-Stage Hybrid Pipeline:**
    1.  **Rule-Based:** Instant regex matching for common patterns (Money, Logistics, Laughter).
    2.  **Embedding-Based:** Semantic matching using `paraphrase-multilingual-MiniLM-L12-v2` for Hinglish nuances.
    3.  **LLM-Based:** Deep reasoning for ambiguous messages using `qwen2.5:3b` with a context window.
*   **Hinglish Optimized:** Specifically tuned for college-level Hinglish slang and cultural nuances.

### 🎭 Spotify Wrapped (Shareable PDF)
*   **Personal Wrapped:** Individual report cards featuring top emojis, peak energy hours, "Best Friend" (fastest replier), and unique vocabulary signatures.
*   **Group Wrapped:** Collective milestones like total activity, group vibe (top topics), and Chat MVP.
*   **PDF Export:** Generate high-contrast, printable reports to share with the group.

### 📈 Psychometric & Behavioral Analytics
Detailed metrics on social hierarchy, emotional influence, and linguistic habits. (See [Metrics Definition](#-metrics-definition) below).

---

## 🔬 Metrics Definition

Understanding the "Why" behind the numbers:

### 1. Attachment & Dominance
*   **Reply Time (min):** Average time taken to reply to a different sender. Calculated only for responses within a **15-minute window** to exclude "new start" conversations. *Lower = More Eager.*
*   **Ignore Count:** Number of times a user sent a follow-up message after a **long silence (>15 mins)** without anyone else responding in between. *Higher = Frequent Double-Texter.*
*   **Avg Streak:** The average number of consecutive messages sent by a user in a single "turn" (messages sent within 15 mins of each other before someone else speaks). *Higher = Dominant Speaker.*

### 2. Influence Scores (Contagion)
*   **Rant/Fun Contagion:** Measures how effectively a user "infects" the group with their mood. 
    *   **Formula:** `(Successes / Opportunities) - Global Baseline`
    *   **Opportunity:** When a user initiates a topic (Rant/Fun) and at least one other person responds within **20 minutes**.
    *   **Success:** When a responder's message matches the initiator's category.
    *   **Baseline:** The natural probability of that category appearing in the entire chat.

### 3. Network Dynamics
*   **Interaction Mapping:** A "Network Edge" (link) is created between two users if they speak within **120 seconds** of each other. The weight of the link increases with the frequency of these rapid interactions.

### 4. Vocabulary Signature (Fingerprint)
*   Uses **TF-IDF (Term Frequency-Inverse Document Frequency)**. It identifies words that a specific user uses **significantly more than the rest of the group**. This ignores common stopwords and highlights personal "catchphrases".

---

## 🛠️ Installation & Usage

### Prerequisites
*   [Python 3.10+](https://www.python.org/)
*   [Ollama](https://ollama.ai/) with `qwen2.5:3b` model pulled.

### Setup
1.  **Install Dependencies:**
    ```bash
    pip install -r req.txt
    ```

### Running the Analysis
1.  **Classification Pipeline:**
    ```bash
    python src/core/classifier.py "path/to/your/chat.txt"
    ```
2.  **Launch Dashboard:**
    ```bash
    streamlit run src/app.py
    ```

---

*Built for those who want to know what's actually happening in the group.*

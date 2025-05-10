# ShieldHER

**Tagline:** Write Safer Online.


## ✨ Project Summary

ShieldHER is a real-time online misogyny detection simulator developed for the **GNEC Hackathon 2025 Spring**. It provides instant visual feedback and suggestions as users type, promoting mindful language and contributing to **UN SDGs 5 (Gender Equality) & 10 (Reduced Inequalities)**.

## 🚀 Demo

See ShieldHER in action:
(https://www.youtube.com/watch?v=ubyghoNxGHc) 

## 🌟 Core Features

*   Real-time (debounced) misogyny detection.
*   Visual flagging, likelihood score, and severity.
*   Actionable suggestions for harmful text.
*   Integrated statistics on the impact of online misogyny.

## 💻 Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
*   **Backend:** Python, Flask
*   **ML Model:** `annahaz/xlm-roberta-base-misogyny-sexism-indomain-mix-bal`

## ⚙️ Get Started

1.  **Clone:**
           `git clone https://github.com/YOUR_GITHUB_USERNAME/shieldher.git && cd shieldher`
3.  **Backend:**
            activate Python venv,
            `pip install -r requirements.txt`
             `python app.py`
7.  **Frontend:**
             `cd ../frontend`
             `npm install`
              `npm run dev`
11.  **Visit:** Go to `http://localhost:3000` in your browser (ensure backend is running first).

## 💡 What's Next

We envision ShieldHER becoming a cross-platform **Browser Extension** for seamless, everyday use, and expanding analysis to include text from URLs and Images.


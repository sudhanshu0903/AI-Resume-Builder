
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai

from flask import Flask, request, jsonify, render_template
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Load model (this ALWAYS works with AI Studio keys)
model = genai.GenerativeModel("gemini-2.5-flash")


def get_gemini_suggestions(profile, skills, projects):
    print("✅ get_gemini_suggestions() CALLED")

    try:
        print("🔥 Calling Gemini via SDK...")

        prompt = f"""
You are an ATS resume evaluator.

Based ONLY on the resume content below, give 3 UNIQUE and SPECIFIC
improvement suggestions.

Resume Content:

Profile:
{profile}

Skills:
{skills}

Projects:
{projects}

Rules:
- Do NOT repeat generic advice
- Mention missing or weak areas
- One suggestion per line
"""

        response = model.generate_content(prompt)

        text = response.text
        print("DEBUG → Gemini response text:", text)

        suggestions = [
            line.strip("-• ")
            for line in text.split("\n")
            if line.strip()
        ]

        return suggestions[:3]

    except Exception as e:
        print("❌ Gemini SDK Error:", e)
        return [
            "Add more technical skills relevant to the role",
            "Explain projects with tools and measurable impact",
            "Tailor the resume to match the job description"
        ]

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/resume")
def resume():
    return render_template("resume.html")
    
@app.route("/generate", methods=["POST"])
def generate_resume():
    data = request.json
    print("DEBUG → Incoming data:", data)

    name = data.get("name", "")
    skills = data.get("skills", "")
    projects = data.get("projects", "")

    profile = (
        f"{name} is a motivated candidate skilled in {skills}. "
        f"Worked on projects like {projects}, demonstrating practical knowledge."
    )

    # Improved score logic
    skill_score = len([s for s in skills.split(",") if s.strip()]) * 6
    project_score = len(projects.split()) * 1.5
    score = min(100, int(40 + skill_score + project_score))

    suggestions = get_gemini_suggestions(profile, skills, projects)

    return jsonify({
        "profile": profile,
        "score": score,
        "suggestions": suggestions
    })


if __name__ == "__main__":
    print("DEBUG → GEMINI_API_KEY =", repr(GEMINI_API_KEY))

    app.run(debug=True)

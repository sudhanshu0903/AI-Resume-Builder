/* ===============================
   GENERATE RESUME (FORM PAGE)
================================ */

function generateResume() {
    const data = {
        name: document.getElementById("name").value,
        role: document.getElementById("role").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        linkedin: document.getElementById("linkedin").value,
        github: document.getElementById("github").value,
        portfolio: document.getElementById("portfolio").value,
        skills: document.getElementById("skills").value,
        education: document.getElementById("education").value,
        projects: document.getElementById("projects").value,
        experience: document.getElementById("experience").value,
        certifications: document.getElementById("certifications").value
    };

    fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: data.name,
            skills: data.skills,
            projects: data.projects
        })
    })
        .then(res => res.json())
        .then(ai => {
            data.profile = ai.profile;
            data.score = ai.score;
            data.suggestions = ai.suggestions;

            // Save all data for next page
            localStorage.setItem("resumeData", JSON.stringify(data));

            // Redirect to resume page
            window.location.href = "/resume";
        })
        .catch(err => {
            alert("Backend not running. Start Flask server.");
            console.error(err);
        });
}

/* ===============================
   HELPER: FORMAT SECTION
================================ */

function formatSection(title, content) {
    if (!content || content.trim() === "") return "";

    const lines = content.split("\n");

    const html = lines.map(line => {
        const parts = line.split("|");
        if (parts.length === 2) {
            return `
                <p>
                    <strong>${parts[0].trim()}</strong><br>
                    ${parts[1].trim()}
                </p>
            `;
        } else {
            return `<p>${line}</p>`;
        }
    }).join("");

    return `
        <div class="section">
            <h3>${title}</h3>
            ${html}
        </div>
    `;
}

/* ===============================
   LOAD RESUME (RESUME PAGE)
================================ */

function loadResume() {
    const data = JSON.parse(localStorage.getItem("resumeData"));
    if (!data) return;

    // Skills list
    let skillsHTML = "";
    if (data.skills) {
        skillsHTML = `
            <div class="section">
                <h3>Skills</h3>
                <ul class="skills">
                    ${data.skills.split(",").map(skill =>
            `<li>${skill.trim()}</li>`
        ).join("")}
                </ul>
            </div>
        `;
    }

    // Social profiles
    let socialHTML = "";
    if (data.linkedin) socialHTML += `<p>🔗 LinkedIn: ${data.linkedin}</p>`;
    if (data.github) socialHTML += `<p>💻 GitHub: ${data.github}</p>`;
    if (data.portfolio) socialHTML += `<p>🌐 Portfolio: ${data.portfolio}</p>`;

    document.getElementById("resume").innerHTML = `
        <div class="header">
            <h1>${data.name}</h1>
            <p>${data.role}</p>
            <p>
                📧 ${data.email} &nbsp; | &nbsp;
                📞 ${data.phone}
            </p>
        </div>

        ${formatSection("About Me", data.profile)}
        ${skillsHTML}
        ${formatSection("Education", data.education)}
        ${formatSection("Projects", data.projects)}
        ${formatSection("Experience", data.experience)}
        ${formatSection("Certifications & Achievements", data.certifications)}
        ${formatSection("Social Profiles", socialHTML)}
    `;

    document.getElementById("feedback").innerHTML = `
        <h3>AI Resume Feedback</h3>
        <p><strong>Resume Score:</strong> ${data.score}/100</p>
        <p><strong>Suggestions:</strong> ${data.suggestions.join(", ")}</p>
    `;
}

/* ===============================
   ACTION BUTTONS
================================ */

function downloadPDF() {
    window.print();
}

function goBack() {
    window.location.href = "index.html";
}
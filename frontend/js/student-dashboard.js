const token = localStorage.getItem("token");

async function loadDashboard() {
  const res = await fetch("http://localhost:5000/api/dashboard/student", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  renderCourses(data.courses);
  renderAttempts(data.recentAttempts);
}

function renderCourses(courses) {
  const container = document.getElementById("courses");
  container.innerHTML = "";

  courses.forEach(course => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h4>${course.title}</h4>
      <p>${course.description || ""}</p>
    `;

    container.appendChild(div);
  });
}

function renderAttempts(attempts) {
  const container = document.getElementById("attempts");
  container.innerHTML = "";

  attempts.forEach(a => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p><b>Quiz:</b> ${a.quiz_title}</p>
      <p><b>Score:</b> ${a.score}/${a.total_questions}</p>
      <p><b>Passed:</b> ${a.passed ? "Yes" : "No"}</p>
    `;

    container.appendChild(div);
  });
}

loadDashboard();
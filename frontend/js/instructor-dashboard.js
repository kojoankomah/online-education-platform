const token = localStorage.getItem("token");

async function loadDashboard() {
  const res = await fetch("http://localhost:5000/api/dashboard/instructor", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  renderCourses(data.courses, data.courseStats);
}

function renderCourses(courses, stats) {
  const container = document.getElementById("courses");
  container.innerHTML = "";

  courses.forEach(course => {
    const stat = stats.find(s => s.id === course.id);

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h4>${course.title}</h4>
      <p>${course.description || ""}</p>
      <p><b>Students:</b> ${stat ? stat.students : 0}</p>
    `;

    container.appendChild(div);
  });
}

loadDashboard();
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


localStorage.setItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3ODA5NzI5NjksImV4cCI6MTc4MTA1OTM2OX0.SM5Mt_cJeBMC8ctG_n0kEVvcb4O4KdQyJxNEnhIHFvQ", response.token);

loadDashboard();
function startQuiz() {
  const checkboxes = document.querySelectorAll('input[name="assignment"]:checked');
  const selectedAssignments = Array.from(checkboxes).map(cb => cb.value);

  if (selectedAssignments.length === 0) {
    alert("Please select at least one assignment.");
    return;
  }

  localStorage.setItem("selectedAssignments", JSON.stringify(selectedAssignments));
  window.location.href = "quiz-start.html";
}

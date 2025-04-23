document.getElementById("assignmentForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const selected = [];
    document.querySelectorAll('input[name="assignment"]:checked').forEach((checkbox) => {
      selected.push(checkbox.value);
    });

    if (selected.length === 0) {
      alert("Please select at least one assignment.");
      return;
    }});
    
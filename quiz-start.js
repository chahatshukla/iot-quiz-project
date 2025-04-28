document.addEventListener("DOMContentLoaded", function () {
  const quizContainer = document.getElementById("quiz-container");

  if (!quizContainer) {
    console.error("Quiz container not found in quiz-start.html.");
    return;
  }

  const selectedAssignments = JSON.parse(localStorage.getItem("selectedAssignments"));

  if (!selectedAssignments || selectedAssignments.length === 0) {
    quizContainer.innerHTML = "<p>Please go back and select assignments.</p>";
    return;
  }

  fetch("mcqs.json")
    .then(response => response.json())
    .then(data => {
      const quizData = {};

      selectedAssignments.forEach(number => {
        const key = "Assignment" + number;
        if (data[key]) {
          quizData[number] = data[key];
        } else {
          console.warn(`Assignment ${key} not found in mcqs.json`);
        }
      });

      // Checking if quizData is filled correctly
      console.log(quizData);  // Check the structure of quizData

      if (Object.keys(quizData).length === 0) {
        quizContainer.innerHTML = "<p>No valid questions available for the selected assignments.</p>";
        return;
      }

      startQuiz(quizData);
    })
    .catch(error => {
      console.error("Error loading questions:", error);
      quizContainer.innerHTML = "<p>Failed to load quiz questions.</p>";
    });

  function startQuiz(quizData) {
    let allQuestions = Object.values(quizData).flat();

    // Shuffle all the questions and split into chunks (5-10 questions each)
    allQuestions = allQuestions.sort(() => Math.random() - 0.5);

    // Divide into chunks of 5-10 questions
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < allQuestions.length; i += chunkSize) {
      chunks.push(allQuestions.slice(i, i + chunkSize));
    }

    let currentChunkIndex = 0;
    let correct = 0;
    let wrong = 0;
    let totalQuestions = allQuestions.length;

    // Function to load the current chunk
    function loadChunk(chunkIndex) {
      if (chunkIndex >= chunks.length) {
        // All chunks completed
        quizComplete(correct, wrong, totalQuestions);
        return;
      }

      const chunk = chunks[chunkIndex];
      const quizHTML = chunk.map((q, index) => {
        return `
          <div class="question-block" id="q${index}">
            <h3>Q${index + 1}: ${q.question}</h3>
            ${q.image ? `<div style="width: 100%;"><img src="${q.image}" alt="Question image" style="max-width: 100%; height: auto; display: block; margin: 10px 0;"></div>` : ''}
            ${q.options.map(option => `
              <label class="option-label">
                <input type="radio" name="q${index}" value="${option}">
                ${option}
              </label><br>
            `).join('')}
            <p class="feedback" style="display:none; font-weight:bold;"></p>
            <hr>
          </div>
        `;
      }).join('');

      quizContainer.innerHTML = `
        <form id="quizForm">
          ${quizHTML}
        </form>
      `;

      // Add event listeners for each option to handle feedback immediately after selection
      chunk.forEach((q, index) => {
        const options = document.querySelectorAll(`input[name="q${index}"]`);
        options.forEach(opt => {
          opt.addEventListener("change", function () {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const feedback = document.querySelector(`#q${index} .feedback`);

            // Check if the selected option is correct
            if (selected.value === q.answer) {
              correct++;
              opt.parentElement.classList.add("correct");
              feedback.innerText = `✅ Correct Answer is: ${q.answer}`;
            } else {
              wrong++;
              opt.parentElement.classList.add("wrong");

              // Highlight the correct answer option
              options.forEach(option => {
                if (option.value === q.answer) {
                  option.parentElement.classList.add("correct");
                }
              });

              feedback.innerText = `⚠️ Incorrect! Correct answer is: ${q.answer}`;
            }

            feedback.style.display = "block";

            // Disable all options after selection
            options.forEach(option => {
              option.disabled = true;  // Disable the radio buttons
            });
          });
        });
      });

      // Move to the next chunk after the current one is answered
      if (chunkIndex < chunks.length - 1) {
        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.classList.add("next-btn");
        nextButton.addEventListener("click", () => {
          currentChunkIndex++;
          loadChunk(currentChunkIndex);
        });
        quizContainer.appendChild(nextButton);
      } else {
        // If it's the last chunk, show the complete results button
        const completeButton = document.createElement("button");
        completeButton.innerText = "Complete Quiz";
        completeButton.classList.add("complete-quiz-btn");
        completeButton.addEventListener("click", () => { 
          quizComplete(correct, wrong, totalQuestions);
        });
        quizContainer.appendChild(completeButton);
      }
    }

    // Start with the first chunk
    loadChunk(currentChunkIndex);
  }

  function quizComplete(correct, wrong, totalQuestions) {
    quizContainer.innerHTML += `
      <div style="margin-top:20px;">
        <h2>Quiz Completed!</h2>
        <p><strong>Total Questions:</strong> ${totalQuestions}</p>
        <p><strong>Correct Answers:</strong> ${correct}</p>
        <p><strong>Wrong Answers:</strong> ${wrong}</p>
        <p><strong>Your Score:</strong> ${correct} / ${totalQuestions}</p>
        <p><strong>Quiz Complete!</strong></p>
      </div>
    `;
  }
});

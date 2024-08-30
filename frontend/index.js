document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('input_form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const userInput = document.getElementById('userInput').value;
    document.querySelector('.output').textContent = `You entered: ${userInput}`;

    try {
      const response = await fetch('http://localhost:3000/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput }),
      });
      const data = await response.json();
      document.querySelector('.output').textContent = `AI Output: ${data.output}`;
    } catch (error) {
      document.querySelector('.output').textContent = `Error: ${error.message}`;
    }
  });
});

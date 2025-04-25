const form = document.querySelector("form");
const chatfield = document.getElementById("chatfield");
const submitButton = form.querySelector("button");
const outputElement = document.getElementById("output");
const questionField = document.getElementById("vraag");

let messages = [];

// load messages from localStorage
function loadMessages() {
    const storedMessages = JSON.parse(localStorage.getItem("messages"));
    if (storedMessages) {
        messages = storedMessages;
    } else {
        // Default system message if nothing is stored
        messages = [
            { role: "system", content: "Je bent een taalcoach die gespecialiseerd is in het helpen van studenten met spelling, grammatica en zinnen. Je hebt geduld en legt uit waarom iets juist of fout is, zodat de student ervan leert. Als een student vraagt hoe een zin grammaticaal correct is, geef dan niet alleen het juiste antwoord, maar leg ook uit waarom het correct is en bied alternatieve zinnen aan." }
        ];
    }
}

// Call the loadMessages function to initialize messages
loadMessages();

submitButton.disabled = true;
submitButton.classList.add("disabled-button");

chatfield.addEventListener("input", () => {
    submitButton.disabled = !chatfield.value.trim();
    submitButton.classList.toggle("disabled-button", submitButton.disabled);
});

form.addEventListener("submit", askQuestion);

async function askQuestion(e) {
    e.preventDefault();

    const vraag = chatfield.value.trim();
    if (!vraag) return;

    // Handle user question and update UI
    handleUserQuestion(vraag);

    try {
        await fetchAIResponse();
    } catch (error) {
        outputElement.textContent = "Streaming mislukt. Probeer opnieuw.";
        console.error("Streaming fout:", error);
    }

    // Re-enable the submit button
    submitButton.disabled = false;
    submitButton.classList.remove("disabled-button");
}

function handleUserQuestion(vraag) {
    // Add the user question to the messages
    messages.push({ role: "user", content: vraag });

    // Update the question in the UI
    questionField.textContent = vraag;

    // Disable submit button and clear output element
    submitButton.disabled = true;
    submitButton.classList.add("disabled-button");
    outputElement.textContent = "";

    // Clear the input field
    chatfield.value = "";
}

async function fetchAIResponse() {
    const response = await fetch("http://localhost:3000/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
    });

    if (!response.ok || !response.body) {
        throw new Error("Geen geldige response ontvangen.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let aiAntwoord = "";

    // Handle the streaming response
    await handleStreamingResponse(reader, decoder, aiAntwoord);
}

// Function to handle the streaming response and update UI in real-time
async function handleStreamingResponse(reader, decoder, aiAntwoord) {
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lijnen = chunk.split("\n\n");

        for (let lijn of lijnen) {
            if (lijn.startsWith("data: ")) {
                const data = lijn.replace("data: ", "");

                if (data === "[DONE]") {
                    messages.push({ role: "assistant", content: aiAntwoord });
                    localStorage.setItem("messages", JSON.stringify(messages)); // Save messages to localStorage
                    return;
                }

                aiAntwoord += data;
                outputElement.textContent = aiAntwoord;
            }
        }
    }
}
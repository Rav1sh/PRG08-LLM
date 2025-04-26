const form = document.querySelector("form");
const chatfield = document.getElementById("chatfield");
const submitButton = form.querySelector("button");
const chatHistory = document.getElementById("chat-history");

// Houdt de berichten bij, inclusief systeem-instructie voor de AI.
let messages = [
    {
        role: "system",
        content: "Je bent een taalcoach die gespecialiseerd is in het helpen van studenten met spelling, grammatica en zinnen. Je hebt geduld en legt uit waarom iets juist of fout is, zodat de student ervan leert. Als een student vraagt hoe een zin grammaticaal correct is, geef dan niet alleen het juiste antwoord, maar leg ook uit waarom het correct is en bied alternatieve zinnen aan."
    }
];

// Zet de submitknop uit totdat er tekst is ingevoerd.
submitButton.disabled = true;
submitButton.classList.add("disabled-button");

// Controleert of er tekst is ingevoerd om de knop te activeren.
chatfield.addEventListener("input", () => {
    submitButton.disabled = !chatfield.value.trim();
    submitButton.classList.toggle("disabled-button", submitButton.disabled);
});

form.addEventListener("submit", askQuestion);

// Stuurt de vraag van de gebruiker en haalt het antwoord van de AI op.
async function askQuestion(e) {
    e.preventDefault();

    const vraag = chatfield.value.trim();
    if (!vraag) return;

    // Verwerkt de vraag van de gebruiker.
    handleHumanQuestion(vraag); 

    try {
        await fetchAIResponse();
    } catch (error) {
        console.error("Streaming fout:", error);
    }

    submitButton.disabled = false;
    submitButton.classList.remove("disabled-button");
}

// Voegt de vraag van de gebruiker toe aan de chat en aan messages array.
function handleHumanQuestion(vraag) {
    messages.push({ role: "human", content: vraag });

    const chatItem = document.createElement("div");
    chatItem.className = "chat-item";
    chatItem.innerHTML = `
        <p class="question">${vraag}</p>
        <p class="answer">Bezig met antwoorden...</p>`;

    chatHistory.appendChild(chatItem);
    chatHistory.currentAnswerElement = chatItem.querySelector(".answer");
    chatHistory.scrollTop = chatHistory.scrollHeight;

    chatfield.value = "";
    submitButton.disabled = true;
    submitButton.classList.add("disabled-button");
}

// Stuurt de chatgeschiedenis naar de server en begint streaming van antwoord.
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

    const reader = response.body.getReader(); // Maakt een reader om streaming te lezen.
    const decoder = new TextDecoder("utf-8"); // Decodeert de bytes naar tekst.
    let aiAntwoord = "";

    await handleStreamingResponse(reader, decoder, aiAntwoord);
}

async function handleStreamingResponse(reader, decoder, aiAntwoord) {
    const answerElement = chatHistory.currentAnswerElement;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lijnen = chunk.split("\n\n");

        for (let lijn of lijnen) {
            if (lijn.startsWith("data: ")) {
                const data = lijn.replace("data: ", "");

                if (data === "[DONE]") {
                    messages.push({ role: "ai", content: aiAntwoord });
                    return;
                }

                aiAntwoord += data; // Voegt het binnengekomen tekstdeel toe.
                answerElement.textContent = aiAntwoord; // Update het antwoord live.
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
        }
    }
}
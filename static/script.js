document.addEventListener("DOMContentLoaded", function () {
    const userInfoStep = document.getElementById("user-info");
    const chatWindowStep = document.getElementById("chat-window");
    const startChatButton = document.getElementById("start-chat");
    const backToInfoButton = document.getElementById("back-to-info");
    const chatBox = document.getElementById("chat-box");
    const messageInput = document.getElementById("message-input");
    const sendMessageButton = document.getElementById("send-message");

    let userName = "";
    let userCompany = "";
    let currentCategory = "inicio";

    function addMessage(sender, message, isBot = false) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message");
        const time = new Date().toLocaleTimeString();

        if (isBot) {
            messageElement.innerHTML = `<span class='bot'>AutoRed:</span> ${message} <span class='time'>${time}</span>`;
        } else {
            messageElement.innerHTML = `<span class='user'>${userName} - ${userCompany}:</span> ${message} <span class='time'>${time}</span>`;
        }
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function sendMessage() {
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        addMessage(userName, userMessage);
        messageInput.value = "";

        fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage, category: currentCategory }),
        })
            .then((response) => response.json())
            .then((data) => {
                currentCategory = data.next_category || currentCategory;
                addMessage("AutoRed", data.response, true);

                if (data.options) {
                    data.options.forEach((option) => {
                        addMessage("AutoRed", option.texto, true);
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                addMessage("AutoRed", "Hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.", true);
            });
    }

    sendMessageButton.addEventListener("click", sendMessage);

    messageInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
            event.preventDefault();
        }
    });

    startChatButton.addEventListener("click", function () {
        userName = document.getElementById("name").value.trim();
        userCompany = document.getElementById("company").value.trim();

        if (!userName || !userCompany) {
            alert("Por favor, completa tu nombre y empresa para continuar.");
            return;
        }

        userInfoStep.classList.add("hidden");
        chatWindowStep.classList.remove("hidden");
        addMessage("AutoRed", "¡Hola! ¿En qué te puedo ayudar? Aquí tienes algunas opciones para elegir:", true);
    });

    backToInfoButton.addEventListener("click", function () {
        chatWindowStep.classList.add("hidden");
        userInfoStep.classList.remove("hidden");
        chatBox.innerHTML = "";
        currentCategory = "inicio";
    });
});

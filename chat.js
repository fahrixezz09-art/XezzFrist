// ===============================
// XEZZ AI — CHAT SYSTEM
// PERMANENT CHAT HISTORY
// ===============================

// ===============================
// ELEMENTS
// ===============================

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const messages =
    document.getElementById("messages");

const chatWelcome =
    document.getElementById("chatWelcome");

const newChatButton =
    document.getElementById("newChatButton");

const sidebarNewChat =
    document.getElementById("sidebarNewChat");

const chatHistory =
    document.getElementById("chatHistory");

const suggestionCards =
    document.querySelectorAll(".suggestion-card");


// ===============================
// STORAGE
// ===============================

const STORAGE_KEY =
    "xezz_chat_sessions_v1";

const CURRENT_CHAT_KEY =
    "xezz_current_chat_v1";


// ===============================
// CHAT STATE
// ===============================

let conversationStarted = false;

let currentChatTitle =
    "New conversation";

let conversationHistory = [];

let currentChatId = null;


// ===============================
// LOAD STORAGE
// ===============================

function loadSessions() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return [];
        }

        const sessions =
            JSON.parse(saved);

        return Array.isArray(sessions)
            ? sessions
            : [];

    } catch (error) {

        console.error(
            "Gagal membaca chat history:",
            error
        );

        return [];
    }
}


// ===============================
// SAVE STORAGE
// ===============================

function saveSessions(
    sessions
) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(sessions)
        );

    } catch (error) {

        console.error(
            "Gagal menyimpan chat history:",
            error
        );

    }
}


// ===============================
// GET CURRENT CHAT ID
// ===============================

function getCurrentChatId() {

    return localStorage.getItem(
        CURRENT_CHAT_KEY
    );

}


// ===============================
// SET CURRENT CHAT ID
// ===============================

function setCurrentChatId(id) {

    if (id) {

        localStorage.setItem(
            CURRENT_CHAT_KEY,
            id
        );

    } else {

        localStorage.removeItem(
            CURRENT_CHAT_KEY
        );

    }

}


// ===============================
// CREATE CHAT ID
// ===============================

function createChatId() {

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    const text =
        messageInput.value.trim();

    if (text === "") {
        return;
    }


    sendButton.disabled = true;


    // Sembunyikan welcome
    chatWelcome.style.display = "none";


    // ===============================
    // BUAT CHAT BARU
    // ===============================

    if (!conversationStarted) {

        conversationStarted = true;

        currentChatId =
            createChatId();

        setCurrentChatId(
            currentChatId
        );

        currentChatTitle =
            createChatTitle(text);

        conversationHistory = [];

        createHistoryItem(
            currentChatId,
            currentChatTitle
        );

    }


    // ===============================
    // USER MESSAGE
    // ===============================

    addMessage(
        text,
        "user"
    );


    conversationHistory.push({

        role: "user",

        content: text

    });


    // Simpan langsung
    saveCurrentChat();


    // Bersihkan input
    messageInput.value = "";

    autoResize();


    // ===============================
    // TYPING
    // ===============================

    const typingMessage =
        showTypingIndicator();


    try {

        const response =
            await fetch(
                "/api/chat",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        messages:
                            conversationHistory

                    })

                }
            );


        const data =
            await response.json();


        removeTypingIndicator(
            typingMessage
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Server mengalami masalah."
            );

        }


        const reply =
            data.reply ||
            "Xezz AI tidak memberikan jawaban.";


        // ===============================
        // AI MESSAGE
        // ===============================

        addMessage(
            reply,
            "ai"
        );


        conversationHistory.push({

            role: "assistant",

            content: reply

        });


        // Simpan jawaban AI
        saveCurrentChat();


    } catch (error) {

        console.error(
            "Xezz AI Error:",
            error
        );


        removeTypingIndicator(
            typingMessage
        );


        addMessage(

            "Maaf, Xezz AI sedang mengalami masalah. Silakan periksa server.",

            "ai"

        );

    } finally {

        sendButton.disabled =
            false;

        messageInput.focus();

    }

}


// ===============================
// ADD MESSAGE
// ===============================

function addMessage(
    text,
    type
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.classList.add(
        "message",
        type === "user"
            ? "message-user"
            : "message-ai"
    );


    const meta =
        document.createElement(
            "div"
        );

    meta.classList.add(
        "message-meta"
    );

    meta.textContent =
        type === "user"
            ? "You"
            : "Xezz AI";


    const bubble =
        document.createElement(
            "div"
        );

    bubble.classList.add(
        "message-bubble"
    );

    bubble.textContent =
        text;


    wrapper.appendChild(
        meta
    );

    wrapper.appendChild(
        bubble
    );

    messages.appendChild(
        wrapper
    );


    scrollToBottom();

}


// ===============================
// RENDER CHAT
// ===============================

function renderChat() {

    messages.innerHTML = "";


    if (
        conversationHistory.length ===
        0
    ) {

        chatWelcome.style.display =
            "block";

        return;

    }


    chatWelcome.style.display =
        "none";


    conversationHistory.forEach(
        (message) => {

            addMessage(

                message.content,

                message.role ===
                    "user"
                    ? "user"
                    : "ai"

            );

        }
    );

}


// ===============================
// TYPING INDICATOR
// ===============================

function showTypingIndicator() {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.classList.add(
        "message",
        "message-ai"
    );

    wrapper.id =
        "typingIndicator";


    const meta =
        document.createElement(
            "div"
        );

    meta.classList.add(
        "message-meta"
    );

    meta.textContent =
        "Xezz AI";


    const bubble =
        document.createElement(
            "div"
        );

    bubble.classList.add(
        "message-bubble",
        "typing-bubble"
    );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const dot =
            document.createElement(
                "span"
            );

        dot.classList.add(
            "typing-dot"
        );

        bubble.appendChild(
            dot
        );

    }


    wrapper.appendChild(
        meta
    );

    wrapper.appendChild(
        bubble
    );

    messages.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;

}


// ===============================
// REMOVE TYPING
// ===============================

function removeTypingIndicator(
    element
) {

    if (element) {

        element.remove();

    }

}


// ===============================
// CREATE CHAT TITLE
// ===============================

function createChatTitle(
    text
) {

    let title =
        text.trim();


    if (
        title.length > 28
    ) {

        title =
            title.substring(
                0,
                28
            ) + "...";

    }


    return title;

}


// ===============================
// SAVE CURRENT CHAT
// ===============================

function saveCurrentChat() {

    if (
        !currentChatId ||
        conversationHistory.length === 0
    ) {

        return;

    }


    const sessions =
        loadSessions();


    const existingIndex =
        sessions.findIndex(
            (session) =>
                session.id ===
                currentChatId
        );


    const chatData = {

        id:
            currentChatId,

        title:
            currentChatTitle,

        messages:
            conversationHistory,

        updatedAt:
            Date.now()

    };


    if (
        existingIndex !== -1
    ) {

        sessions[
            existingIndex
        ] =
            chatData;

    } else {

        sessions.push(
            chatData
        );

    }


    saveSessions(
        sessions
    );


    setCurrentChatId(
        currentChatId
    );


    renderHistory();

}


// ===============================
// LOAD CHAT
// ===============================

function loadChat(
    chatId
) {

    const sessions =
        loadSessions();


    const chat =
        sessions.find(
            (session) =>
                session.id ===
                chatId
        );


    if (!chat) {
        return;
    }


    currentChatId =
        chat.id;

    currentChatTitle =
        chat.title;

    conversationHistory =
        Array.isArray(
            chat.messages
        )
            ? chat.messages
            : [];


    conversationStarted =
        conversationHistory.length >
        0;


    setCurrentChatId(
        currentChatId
    );


    renderChat();

    renderHistory();

    messageInput.focus();

}


// ===============================
// DELETE CHAT
// ===============================

function deleteChat(
    chatId
) {

    const sessions =
        loadSessions()
            .filter(
                (session) =>
                    session.id !==
                    chatId
            );


    saveSessions(
        sessions
    );


    if (
        currentChatId ===
        chatId
    ) {

        startFreshChat();

    } else {

        renderHistory();

    }

}


// ===============================
// HISTORY UI
// ===============================

function renderHistory() {

    chatHistory.innerHTML = "";


    const sessions =
        loadSessions()
            .sort(
                (a, b) =>
                    b.updatedAt -
                    a.updatedAt
            );


    sessions.forEach(
        (session) => {

            createHistoryItem(

                session.id,

                session.title

            );

        }
    );

}


// ===============================
// CREATE HISTORY ITEM
// ===============================

function createHistoryItem(
    chatId,
    title
) {

    const item =
        document.createElement(
            "button"
        );


    item.classList.add(
        "history-item"
    );


    if (
        chatId ===
        currentChatId
    ) {

        item.classList.add(
            "active"
        );

    }


    item.innerHTML =
        `<span>✦</span>${escapeHTML(title)}`;


    item.addEventListener(
        "click",
        () => {

            loadChat(
                chatId
            );

        }
    );


    chatHistory.appendChild(
        item
    );

}


// ===============================
// START FRESH CHAT
// ===============================

function startFreshChat() {

    currentChatId =
        null;

    currentChatTitle =
        "New conversation";

    conversationHistory =
        [];

    conversationStarted =
        false;


    setCurrentChatId(
        null
    );


    messages.innerHTML = "";


    chatWelcome.style.display =
        "block";


    messageInput.value = "";


    autoResize();


    renderHistory();


    messageInput.focus();

}


// ===============================
// RESET CHAT
// ===============================

function resetChat() {

    startFreshChat();

}


// ===============================
// SUGGESTION CARDS
// ===============================

suggestionCards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                messageInput.value =
                    card.dataset.prompt;

                autoResize();

                messageInput.focus();

            }
        );

    }
);


// ===============================
// SEND BUTTON
// ===============================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ===============================
// ENTER
// ===============================

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ===============================
// AUTO RESIZE
// ===============================

messageInput.addEventListener(
    "input",
    autoResize
);


function autoResize() {

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        messageInput.scrollHeight +
        "px";

}


// ===============================
// SCROLL
// ===============================

function scrollToBottom() {

    messages.scrollTo({

        top:
            messages.scrollHeight,

        behavior:
            "smooth"

    });

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


// ===============================
// INITIALIZE
// ===============================

function initializeChat() {

    const sessions =
        loadSessions();

    const savedChatId =
        getCurrentChatId();


    // ===============================
    // KALAU ADA CHAT TERAKHIR
    // ===============================

    if (savedChatId) {

        const savedChat =
            sessions.find(
                (session) =>
                    session.id ===
                    savedChatId
            );


        if (savedChat) {

            currentChatId =
                savedChat.id;

            currentChatTitle =
                savedChat.title;

            conversationHistory =
                Array.isArray(
                    savedChat.messages
                )
                    ? savedChat.messages
                    : [];

            conversationStarted =
                conversationHistory.length > 0;


            renderChat();

        }

    }


    // ===============================
    // KALAU BELUM ADA CHAT
    // ===============================

    else {

        currentChatId =
            null;

        currentChatTitle =
            "New conversation";

        conversationHistory =
            [];

        conversationStarted =
            false;

        messages.innerHTML =
            "";

        chatWelcome.style.display =
            "block";

    }


    // Render sidebar
    renderHistory();


    console.log(
        "Xezz AI v0.4.1 — Chat restored."
    );

}


// ===============================
// START
// ===============================

initializeChat();
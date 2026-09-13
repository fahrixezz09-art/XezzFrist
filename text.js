// ==================================================
// XEZZFRIST — TEXT TOOLS
// ==================================================


// ==================================================
// ELEMENTS
// ==================================================

const textInput =
    document.getElementById("textInput");

const wordCount =
    document.getElementById("wordCount");

const characterCount =
    document.getElementById("characterCount");

const characterNoSpaceCount =
    document.getElementById("characterNoSpaceCount");

const lineCount =
    document.getElementById("lineCount");

const textStatus =
    document.getElementById("textStatus");

const uppercaseButton =
    document.getElementById("uppercaseButton");

const lowercaseButton =
    document.getElementById("lowercaseButton");

const removeSpacesButton =
    document.getElementById("removeSpacesButton");

const copyButton =
    document.getElementById("copyButton");

const clearButton =
    document.getElementById("clearButton");


// ==================================================
// UPDATE STATISTICS
// ==================================================

function updateStatistics() {

    if (!textInput) {
        return;
    }


    const text =
        textInput.value;


    // ------------------------------------------
    // WORD COUNT
    // ------------------------------------------

    const trimmedText =
        text.trim();

    const words =
        trimmedText === ""
            ? []
            : trimmedText.split(/\s+/);

    const totalWords =
        words.length;


    // ------------------------------------------
    // CHARACTER COUNT
    // ------------------------------------------

    const totalCharacters =
        text.length;


    // ------------------------------------------
    // CHARACTER WITHOUT SPACES
    // ------------------------------------------

    const charactersWithoutSpaces =
        text.replace(/\s/g, "").length;


    // ------------------------------------------
    // LINE COUNT
    // ------------------------------------------

    const totalLines =
        text === ""
            ? 0
            : text.split(/\r?\n/).length;


    // ------------------------------------------
    // UPDATE UI
    // ------------------------------------------

    if (wordCount) {

        wordCount.textContent =
            totalWords;

    }


    if (characterCount) {

        characterCount.textContent =
            totalCharacters;

    }


    if (characterNoSpaceCount) {

        characterNoSpaceCount.textContent =
            charactersWithoutSpaces;

    }


    if (lineCount) {

        lineCount.textContent =
            totalLines;

    }


    updateStatus();

}


// ==================================================
// UPDATE STATUS
// ==================================================

function updateStatus() {

    if (!textStatus || !textInput) {
        return;
    }


    const text =
        textInput.value.trim();


    if (text === "") {

        textStatus.textContent =
            "Ready";

        return;
    }


    textStatus.textContent =
        "Editing";

}


// ==================================================
// UPPERCASE
// ==================================================

function convertToUppercase() {

    if (!textInput) {
        return;
    }


    if (textInput.value === "") {

        showTextNotification(
            "Masukkan teks terlebih dahulu."
        );

        textInput.focus();

        return;
    }


    const start =
        textInput.selectionStart;

    const end =
        textInput.selectionEnd;


    textInput.value =
        textInput.value.toUpperCase();


    restoreSelection(
        start,
        end
    );


    updateStatistics();

    showTextNotification(
        "Teks berhasil diubah menjadi uppercase."
    );

}


// ==================================================
// LOWERCASE
// ==================================================

function convertToLowercase() {

    if (!textInput) {
        return;
    }


    if (textInput.value === "") {

        showTextNotification(
            "Masukkan teks terlebih dahulu."
        );

        textInput.focus();

        return;
    }


    const start =
        textInput.selectionStart;

    const end =
        textInput.selectionEnd;


    textInput.value =
        textInput.value.toLowerCase();


    restoreSelection(
        start,
        end
    );


    updateStatistics();

    showTextNotification(
        "Teks berhasil diubah menjadi lowercase."
    );

}


// ==================================================
// CLEAN SPACES
// ==================================================

function cleanSpaces() {

    if (!textInput) {
        return;
    }


    if (textInput.value === "") {

        showTextNotification(
            "Masukkan teks terlebih dahulu."
        );

        textInput.focus();

        return;
    }


    const start =
        textInput.selectionStart;

    const end =
        textInput.selectionEnd;


    let cleanedText =
        textInput.value;


    // Gabungkan spasi berlebih
    cleanedText =
        cleanedText.replace(
            /[ \t]+/g,
            " "
        );


    // Hilangkan spasi kosong di awal setiap baris
    cleanedText =
        cleanedText.replace(
            /^[ \t]+/gm,
            ""
        );


    // Hilangkan spasi kosong di akhir setiap baris
    cleanedText =
        cleanedText.replace(
            /[ \t]+$/gm,
            ""
        );


    // Batasi baris kosong yang berlebihan
    cleanedText =
        cleanedText.replace(
            /\n{3,}/g,
            "\n\n"
        );


    textInput.value =
        cleanedText.trim();


    restoreSelection(
        Math.min(start, textInput.value.length),
        Math.min(end, textInput.value.length)
    );


    updateStatistics();

    showTextNotification(
        "Spasi berlebih berhasil dibersihkan."
    );

}


// ==================================================
// COPY
// ==================================================

async function copyText() {

    if (!textInput) {
        return;
    }


    const text =
        textInput.value;


    if (text.trim() === "") {

        showTextNotification(
            "Tidak ada teks untuk disalin."
        );

        textInput.focus();

        return;
    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        showTextNotification(
            "Teks berhasil disalin."
        );


    } catch (error) {

        // --------------------------------------
        // FALLBACK
        // --------------------------------------

        textInput.focus();

        textInput.select();

        const copied =
            document.execCommand("copy");


        if (copied) {

            showTextNotification(
                "Teks berhasil disalin."
            );

        } else {

            showTextNotification(
                "Gagal menyalin teks."
            );

        }

    }

}


// ==================================================
// CLEAR
// ==================================================

function clearText() {

    if (!textInput) {
        return;
    }


    if (textInput.value === "") {

        showTextNotification(
            "Teks sudah kosong."
        );

        return;
    }


    textInput.value = "";


    updateStatistics();


    textInput.focus();


    showTextNotification(
        "Teks berhasil dibersihkan."
    );

}


// ==================================================
// RESTORE SELECTION
// ==================================================

function restoreSelection(
    start,
    end
) {

    if (!textInput) {
        return;
    }


    requestAnimationFrame(() => {

        textInput.focus();

        textInput.setSelectionRange(
            start,
            end
        );

    });

}


// ==================================================
// NOTIFICATION
// ==================================================

function showTextNotification(
    message
) {

    let notification =
        document.getElementById(
            "textNotification"
        );


    // ------------------------------------------
    // CREATE
    // ------------------------------------------

    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "textNotification";


        document.body.appendChild(
            notification
        );


        // --------------------------------------
        // STYLE
        // --------------------------------------

        notification.style.position =
            "fixed";

        notification.style.bottom =
            "25px";

        notification.style.right =
            "25px";

        notification.style.padding =
            "13px 18px";

        notification.style.borderRadius =
            "10px";

        notification.style.background =
            "#17191f";

        notification.style.border =
            "1px solid rgba(255,255,255,0.10)";

        notification.style.color =
            "#ffffff";

        notification.style.fontSize =
            "12px";

        notification.style.zIndex =
            "9999";

        notification.style.opacity =
            "0";

        notification.style.transform =
            "translateY(15px)";

        notification.style.transition =
            "0.3s ease";

    }


    notification.textContent =
        message;


    requestAnimationFrame(() => {

        notification.style.opacity =
            "1";

        notification.style.transform =
            "translateY(0)";

    });


    clearTimeout(
        window.textNotificationTimer
    );


    window.textNotificationTimer =
        setTimeout(() => {

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateY(15px)";

        }, 2800);

}


// ==================================================
// EVENTS
// ==================================================

if (textInput) {

    textInput.addEventListener(
        "input",
        updateStatistics
    );

}


if (uppercaseButton) {

    uppercaseButton.addEventListener(
        "click",
        convertToUppercase
    );

}


if (lowercaseButton) {

    lowercaseButton.addEventListener(
        "click",
        convertToLowercase
    );

}


if (removeSpacesButton) {

    removeSpacesButton.addEventListener(
        "click",
        cleanSpaces
    );

}


if (copyButton) {

    copyButton.addEventListener(
        "click",
        copyText
    );

}


if (clearButton) {

    clearButton.addEventListener(
        "click",
        clearText
    );

}


// ==================================================
// PAGE READY
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateStatistics();


        console.log(
            "XezzFrist Text Tools loaded."
        );

    }
);
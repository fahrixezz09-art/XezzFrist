// ==================================================
// XEZZFRIST — QR GENERATOR
// ==================================================


// ==================================================
// ELEMENTS
// ==================================================

const qrInput = document.getElementById("qrInput");
const generateButton = document.getElementById("generateButton");

const qrPlaceholder =
    document.getElementById("qrPlaceholder");

const qrResult =
    document.getElementById("qrResult");

const qrCode =
    document.getElementById("qrCode");

const downloadButton =
    document.getElementById("downloadButton");


// ==================================================
// GENERATE QR
// ==================================================

function generateQRCode() {

    if (!qrInput || !qrCode) {
        return;
    }


    const value =
        qrInput.value.trim();


    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (value === "") {

        showQRNotification(
            "Masukkan teks atau URL terlebih dahulu."
        );

        qrInput.focus();

        return;
    }


    // ------------------------------------------
    // CLEAR OLD QR
    // ------------------------------------------

    qrCode.innerHTML = "";


    // ------------------------------------------
    // GENERATE
    // ------------------------------------------

    new QRCode(qrCode, {

        text: value,

        width: 240,

        height: 240,

        colorDark: "#111318",

        colorLight: "#ffffff",

        correctLevel:
            QRCode.CorrectLevel.H

    });


    // ------------------------------------------
    // SHOW RESULT
    // ------------------------------------------

    if (qrPlaceholder) {

        qrPlaceholder.style.display =
            "none";

    }


    if (qrResult) {

        qrResult.classList.remove(
            "hidden"
        );

    }


    showQRNotification(
        "QR code berhasil dibuat."
    );

}


// ==================================================
// DOWNLOAD QR
// ==================================================

function downloadQRCode() {

    if (!qrCode) {
        return;
    }


    const image =
        qrCode.querySelector("img");


    const canvas =
        qrCode.querySelector("canvas");


    // ------------------------------------------
    // IMAGE
    // ------------------------------------------

    if (image) {

        const link =
            document.createElement("a");

        link.href =
            image.src;

        link.download =
            "xezzfrist-qr.png";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        showQRNotification(
            "QR code berhasil diunduh."
        );

        return;
    }


    // ------------------------------------------
    // CANVAS
    // ------------------------------------------

    if (canvas) {

        const link =
            document.createElement("a");

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        link.download =
            "xezzfrist-qr.png";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        showQRNotification(
            "QR code berhasil diunduh."
        );

        return;
    }


    showQRNotification(
        "QR code belum tersedia."
    );

}


// ==================================================
// NOTIFICATION
// ==================================================

function showQRNotification(message) {

    let notification =
        document.getElementById(
            "qrNotification"
        );


    // ------------------------------------------
    // CREATE NOTIFICATION
    // ------------------------------------------

    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "qrNotification";

        document.body.appendChild(
            notification
        );


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


    // ------------------------------------------
    // SHOW
    // ------------------------------------------

    requestAnimationFrame(() => {

        notification.style.opacity =
            "1";

        notification.style.transform =
            "translateY(0)";

    });


    clearTimeout(
        window.qrNotificationTimer
    );


    window.qrNotificationTimer =
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

if (generateButton) {

    generateButton.addEventListener(
        "click",
        generateQRCode
    );

}


if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadQRCode
    );

}


// ==================================================
// ENTER KEY
// ==================================================

if (qrInput) {

    qrInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                generateQRCode();

            }

        }
    );

}


// ==================================================
// PAGE READY
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "XezzFrist QR Generator loaded."
        );

    }
);
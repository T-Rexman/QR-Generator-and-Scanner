document.addEventListener('DOMContentLoaded', () => {
    const scannerDiv = document.querySelector(".scanner");

    if (!scannerDiv) {
        console.error("Scanner container not found.");
        return;
    }

    const camera = scannerDiv.querySelector("h1 .fa-camera");
    const stopCam = scannerDiv.querySelector("h1 .fa-circle-stop");
    const form = scannerDiv.querySelector(".scanner-form");
    const fileInput = form ? form.querySelector("input") : null;
    const p = form ? form.querySelector("p") : null;
    const img = form ? form.querySelector("img") : null;
    const video = form ? form.querySelector("video") : null;
    const content = form ? form.querySelector(".content") : null;

    const textarea = scannerDiv.querySelector(".scanner-details textarea");
    const copyBtn = scannerDiv.querySelector(".scanner-details .Copy");
    const closeBtn = scannerDiv.querySelector(".scanner-details .Close");
    const notification = scannerDiv.querySelector(".scanner-details .notification");

    let scanner; 

    function resetState() {
        if (camera) camera.style.display = "inline-block";
        if (stopCam) stopCam.style.display = "none";
        if (form) form.classList.remove("active-video", "active-img", "pointerEvents");
        if (scannerDiv) scannerDiv.classList.remove("active");
        if (textarea) textarea.innerText = "";
        if (p) p.innerText = "Upload QR Code to Scan"; 

        if (scanner) {
            scanner.stop().catch(err => console.error("Error stopping scanner: ", err));
            scanner = null; 
        }

        if (video) {
            video.srcObject = null;
            video.pause();
        }
    }

    function fetchRequest(file) {
        let formData = new FormData();
        formData.append("file", file);

        p.innerText = "Scanning QR Code....";

        fetch(`http://api.qrserver.com/v1/read-qr-code/`, {
            method: "POST",
            body: formData
        }).then(res => res.json()).then(result => {
            let text = result[0].symbol[0].data;

            if (!text) {
                p.innerText = "Couldn't Scan QR Code";
                return;
            }

            scannerDiv.classList.add("active");
            form.classList.add("active-img");

            img.src = URL.createObjectURL(file);
            textarea.innerText = text;
        }).catch(err => console.error("Fetch error: ", err));
    }

    if (form && fileInput && p && img && video && content) {
        form.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", e => {
            let file = e.target.files[0];
            if (!file) return;
            fetchRequest(file);
        });

        if (camera) {
            camera.addEventListener("click", () => {
                resetState(); 

                camera.style.display = "none";
                form.classList.add("pointerEvents");
                p.innerText = "Scanning QR Code....";

                scanner = new Instascan.Scanner({ video: video });

                Instascan.Camera.getCameras()
                    .then(cameras => {
                        if (cameras.length > 0) {
                            return scanner.start(cameras[0]);
                        } else {
                            throw new Error("No Cameras Found!");
                        }
                    })
                    .then(() => {
                        form.classList.add("active-video");
                        stopCam.style.display = "inline-block";
                    })
                    .catch(err => console.error("Camera error: ", err));

                scanner.addListener("scan", content => {
                    scannerDiv.classList.add("active");
                    textarea.innerText = content;
                });
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                let text = textarea.textContent;
                if (text) {
                    navigator.clipboard.writeText(text).then(() => {
                        notification.innerText = "Text copied to clipboard!";
                        notification.style.display = "block";

                        setTimeout(() => {
                            notification.style.display = "none";
                        }, 3000);
                    }).catch(err => console.error("Clipboard error: ", err));
                } else {
                    console.error("No text to copy.");
                }
            });
        } else {
            console.error("Copy button not found.");
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                window.location.reload(); 
            });
        } else {
            console.error("Close button not found.");
        }

        if (stopCam) {
            stopCam.addEventListener("click", () => resetState());
        }
    }
});

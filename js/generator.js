document.addEventListener("DOMContentLoaded", () => {
    const generatorDiv = document.querySelector(".generator");
    const generateBtn = generatorDiv.querySelector(".generator-form button");
    const qrInput = generatorDiv.querySelector(".generator-form input");
    const qrImg = generatorDiv.querySelector(".generator-img img");
    const downloadBtn = generatorDiv.querySelector(".generator-btn .btn-link");

    let imgURL = ''; // Global variable to store the image URL

    generateBtn.addEventListener("click", () => {
        let qrValue = qrInput.value;
        if (!qrValue.trim()) return;

        generateBtn.innerText = "Generating QR Code....";

        imgURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`; 
        qrImg.src = imgURL;

        qrImg.addEventListener("load", () => {
            generatorDiv.classList.add("active");
            generateBtn.innerText = "Generate QR Code";
        });
    });

    downloadBtn.addEventListener("click", () => {
        if (!imgURL) return; 
        fetchImage(imgURL);
    });

    function fetchImage(url) {
        fetch(url)
            .then(res => res.blob())
            .then(file => {
                let tempFile = URL.createObjectURL(file);
                let file_name = url.split("/").pop().split(".")[0];
                let extension = file.type.split("/")[1];
                download(tempFile, file_name, extension);
            })
            .catch(() => imgURL = ''); // Reset imgURL on error
    }

    function download(tempFile, imgURL, extension) {
        const urlParams = new URLSearchParams(imgURL.split('?')[1]); 
        const dataValue = urlParams.get('data'); 

        let userFileName = prompt("Enter the filename:", dataValue);

        if (userFileName === null) {
            return; // Do nothing, just exit the function
        }

        if (!userFileName) userFileName = dataValue;
    
        let a = document.createElement('a');
        a.href = tempFile;
        a.download = `${userFileName}.${extension}`; // Use the user-provided or default filename
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    
    qrInput.addEventListener("input", () => {
        if (!qrInput.value.trim()) {
            generatorDiv.classList.remove("active");
        }
    });

    const generatorTab = document.querySelector('.nav-gene');
    const scannerTab = document.querySelector('.nav-scan');

    if (generatorTab) {
        generatorTab.addEventListener('click', resetGenerator);
    }

    if (scannerTab) {
        scannerTab.addEventListener('click', resetGenerator); 
    }

    function resetGenerator() {
        qrInput.value = '';  
        qrImg.src = '';     
        generatorDiv.classList.remove("active");  
        generateBtn.innerText = "Generate QR Code";  
        imgURL = '';  
    }
});

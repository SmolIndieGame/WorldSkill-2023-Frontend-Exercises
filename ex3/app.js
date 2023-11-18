const passwordLength = 16;

const chars = {
    uppers: "QAZWSXEDCRFVTGBYHNUJMIKOLP",
    lowers: "qazwsxedcrfvtgbyhnujmikolp",
    numbers: "12334567890",
    symbols: "~`!@#$%^&*()_+{}|:\"<>?-=[]\\;',./'",
}

const passwordElement = document.querySelector("#password");
const generateElement = document.querySelector("#generate");
const optionElements = document.querySelectorAll(".options input[type=\"checkbox\"]");
const lengthElement = document.querySelector("#length");

function generate() {
    let strList = "";
    for (const element of optionElements)
        if (element.checked)
            strList += chars[element.id];
    const len = Number.parseInt(lengthElement.value);

    let password = "";
    for (let i = 0; i < len; i++)
        password += strList[Math.floor(Math.random() * strList.length)];
    passwordElement.value = password;
}

generateElement.addEventListener("click", generate)
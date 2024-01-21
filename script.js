import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js' ;
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  update,
  remove
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js'

const appSettings = { databaseURL: 'https://prettynaked-d3731-default-rtdb.firebaseio.com/' };
const firebaseConfig = {
    apiKey: "AIzaSyCNhM23FsKj8iziXUr6PEm_uN1wSLrwM6M",
    authDomain: "prettynaked-d3731.firebaseapp.com",
    databaseURL: "https://prettynaked-d3731-default-rtdb.firebaseio.com",
    projectId: "prettynaked-d3731",
    storageBucket: "prettynaked-d3731.appspot.com",
    messagingSenderId: "122336906134",
    appId: "1:122336906134:web:137df1cb1b93a3977e6bb7"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


//------------------backend----------------


const addInput = document.querySelector(".input-type");
const wrap = document.querySelector(".setsinput");
const legDb = ref(db, "Leg");
const armDb = ref(db, "Arm");
const backDb = ref(db, "Back");
const waterDb = ref(db, "Water");
const proteinDb = ref(db, "Protein");
const allDb = ref(db);
const select = document.querySelector(".select");
const setsInput = document.querySelector(".setsinput");
const optionElements = select.querySelectorAll('option');
const btn = document.querySelector(".addbtn");

let isToggled = false;

btn.addEventListener('click', () => {
  isToggled = !isToggled;

  if (isToggled) {
      addInput.innerHTML = "";
      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.placeholder = "Add exercise"
      inputField.classList.add("ty");

      const confirmBtn = document.createElement("button");
      confirmBtn.classList.add("confirmbtn");
      confirmBtn.textContent = "+";

      addInput.appendChild(inputField);
      addInput.appendChild(confirmBtn);

      confirmBtn.addEventListener("click", handleConfirmButtonClick);
  } else {
      addInput.innerHTML = "";
  }
});

function handleConfirmButtonClick() {
  let inputField = document.querySelector(".ty");
  let inputVal = inputField.value;
  let selectedOption = select.options[select.selectedIndex];

  if (selectedOption.value === "") {
      displayErrorMessage("Select a muscle group first");
      return;
  }

  if (selectedOption.classList.contains("leg")) {
      push(legDb, inputVal);
  } else if (selectedOption.classList.contains("arm")) {
      push(armDb, inputVal);
  } else if (selectedOption.classList.contains("back")) {
      push(backDb, inputVal);
  }

  append(inputVal);
}

const bodyPartDbs = ["Leg", "Arm", "Back"];

bodyPartDbs.forEach((part) => {
  const partDb = ref(db, part);
  onValue(partDb, (snapshot) => {
    displayValues(snapshot.val(), part.toLowerCase());
  });
});

select.addEventListener("change", updateDisplayedValues);

function displayValues(values, type) {
  const valuesArray = Object.values(values);
  setsInput.innerHTML = "";

  valuesArray.forEach((value) => {
    append(value, type);
  });
}

function append(value, type) {
  let selectedOption = select.options[select.selectedIndex];

  if (selectedOption.classList.contains(type)) {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.classList.add("chk");

    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.id = value;

    const checkboxLabel = document.createElement("label");
    checkboxLabel.htmlFor = value;
    checkboxLabel.textContent = value;

    checkboxDiv.appendChild(checkboxInput);
    checkboxDiv.appendChild(checkboxLabel);

    setsInput.appendChild(checkboxDiv);
  } 
}

function displayErrorMessage(message) {
  let newDiv = document.createElement("div");
  newDiv.classList.add("newdiv");
  newDiv.textContent = message;
  let inputField = document.querySelector(".ty");
  inputField.style.border = "2px solid greenyellow";
  addInput.appendChild(newDiv);

  setTimeout(() => {
      addInput.removeChild(newDiv);
  }, 3000);
}


function updateDisplayedValues() {
  setsInput.innerHTML = "";

  let selectedOption = select.options[select.selectedIndex];
  let type = selectedOption.classList.contains("leg")
    ? "leg"
    : selectedOption.classList.contains("arm")
    ? "arm"
    : "back";

  let db;
  switch (type) {
    case "leg":
      db = legDb;
      break;
    case "arm":
      db = armDb;
      break;
    case "back":
      db = backDb;
      break;
    default:
      // Handle default case or throw an error if needed
      break;
  }

  onValue(db, function (snapshot) {
    displayValues(snapshot.val(), type);
  });
}

//--------------water intake---------------
let num = document.querySelector(".num")
let wtrbtn = document.querySelector(".waterbtn")
let wtrField = document.querySelector(".wtrfield")
let wtrList = document.querySelector(".wtrlist")

wtrbtn.addEventListener('click', () => {
  isToggled = !isToggled;

   if (isToggled) {
       wtrField.innerHTML = `
           <input placeholder="ml" type="number" class="ml"></input>  
           <button class="confirm-wtr">+</button>`;
       
       const confirmwtr = document.querySelector(".confirm-wtr");

       confirmwtr.addEventListener("click", confirmClick);
   } 
});

function confirmClick() {
   let wtrNum = document.querySelector(".ml");
   let wtrVal = wtrNum.value;

   push(waterDb, wtrVal);
  
   const wtrInput = document.querySelector(".ml")
   wtrInput.value = ""
}

let wtrsum = 0

function appendWtr(wtr) {
  const wtrId = wtr[0];
  const wtrValue = parseInt(wtr[1]);

  const wtrBottles = document.createElement("li");
  wtrBottles.classList.add("bottles");
  const wtrValueLiters = wtrValue / 1000;
  wtrBottles.textContent = `${wtrValue} ml`;
  wtrList.appendChild(wtrBottles);

wtrsum += wtrValueLiters;
  // num.textContent = `${wtrsum.toFixed(1)}L`; 

  wtrBottles.addEventListener("click", () => {
    // Ensure wtrId is the correct unique identifier
    remove(ref(db, `Water/${wtrId}`));
  });

  console.log(wtrsum)
}


onValue(waterDb, (snapshot) => {
  // Reset wtrsum before updating it with new values
  wtrsum = 0;

  let wtrIntake = Object.entries(snapshot.val());

  wtrList.innerHTML = "";

  for (let i = 0; i < wtrIntake.length; i++) {
    let wtrIndex = wtrIntake[i];

    appendWtr(wtrIndex);
  }

  // Update num.textContent after resetting wtrsum
  num.textContent = `${wtrsum.toFixed(1)}L`;
});



//----------------protein------------------

const proteinbtn = document.querySelector(".proteinbtn");
const proteinInput = document.querySelector(".proteinfield");
const list = document.querySelector(".list");
const intake = document.querySelector(".intake");
const listItem = document.createElement("li");
const foodList = document.querySelector(".foodlist")


proteinbtn.addEventListener('click', () => {
   isToggled = !isToggled;

    if (isToggled) {
        proteinInput.innerHTML = `
            <input placeholder="Protein choice" type="text" class="inp"></input>
            <input placeholder="Grams" type="number" class="grams"></input>  
            <button class="confirm-protein">+</button>`;
        
        const confirmProtein = document.querySelector(".confirm-protein");

        confirmProtein.addEventListener("click", confirmButtonClick);
    } 
});

function confirmButtonClick() {
    let inputField = document.querySelector(".inp");
    let inputNumber = document.querySelector(".grams");
    let inputVal = inputField.value;
    let numberVal = inputNumber.value;


    push(proteinDb, [inputVal, numberVal]);

    // inputField.value = "";
    // inputNumber.value = "";

}

let sum = 0

function appendProtein(array) {
  const proteinName = array[1][0];
  const proteinGrams = parseInt(array[1][1]);
  const proteinId = array[0];

  const listItem = document.createElement("li");
  listItem.classList.add("proteintag");
  listItem.textContent = proteinName;

  list.appendChild(listItem);

  sum += proteinGrams;
  // intake.textContent = `${sum}g`;

  console.log(sum)

  listItem.addEventListener("click", () => {
      remove(ref(db, `Protein/${proteinId}`));
  });
}


onValue(proteinDb, (snapshot) => {
  let proteinArray = Object.entries(snapshot.val());
  
  list.innerHTML = "";
  sum = 0; // Reset sum to 0 before the loop

  for (let i = 0; i < proteinArray.length; i++) {
    let arrayIndex = proteinArray[i];
    let arrayValue = arrayIndex[1];
    appendProtein(arrayIndex);
  }

  intake.textContent = `${sum}g`;
});


//-----------------splash------------------

const splash = document.querySelector(".splash")
const pretty = document.querySelector(".pretty")
const img = document.querySelector(".img")


document.addEventListener('DOMContentLoaded', (e) => {
    setTimeout(()=>{
        splash.classList.add('display-none');
        pretty.classList.add('display-none');
        img.classList.add('display-none');
    }, 2000)
})

// ----------------resetBtn-------------------

// const reset = document.querySelector(".resetbtn")


// reset.addEventListener("click", () => {
//   let a = 0;


//   set(waterDb, 0)
//       .then(() => {
//           console.log("Database updated successfully");
//       })
//       .catch((error) => {
//           console.error("Error updating database:", error);
//       });


// });

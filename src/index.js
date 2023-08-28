/* The live editor requires this function wrapper */
import readXlsxFile from 'read-excel-file'

class Persona {
  constructor(nom, sexe, experiencia, amistats, unitats) {
    this.nom = nom;
    this.sexe = sexe;
    this.amistats = new Map(amistats);
    this.unitats = new Map(unitats);
  }
}

// File.
let unitatRows, friendsRows, personalRows;
const input = document.getElementById('chooseFile')
input.addEventListener('change', () => {
  readXlsxFile(input.files[0], { sheet: 'Unitat' }).then((rows) => {
    unitatRows = rows;
    while (document.getElementById("allGrup").firstChild) {
      document.getElementById("allGrup").removeChild(document.getElementById("allGrup").firstChild);
    }
    for (let i = 1; i < rows[0].length; i++) {
      addGrup(rows[0][i], i - 1);
    }
  })
  readXlsxFile(input.files[0], { sheet: 'Friends' }).then((rows) => {
    friendsRows = rows;
  })
  readXlsxFile(input.files[0], { sheet: 'Personal' }).then((rows) => {
    personalRows = rows;
    personList();
  })
})

let persones = [];
let amistats;
let unitats;
let nota;

function personList() {
  for (let i = 1; i < unitatRows.length; i++) {
    amistats = new Map();
    for (let j = 1; j < friendsRows[i].length; j += 2) {
      if (friendsRows[i][j] == null || friendsRows[i][j] == undefined ||
        friendsRows[i][j + 1] == null || friendsRows[i][j + 1] == undefined) break;
      amistats.set(friendsRows[i][j], friendsRows[i][j + 1]);
    }

    unitats = new Map();
    for (let j = 1; j < unitatRows[i].length; j++) {
      switch (unitatRows[i][j]) {
        case 1: nota = 10; break;//Potser ha de ser 1 o '1', ho he de comprovar.
        case 2: nota = 7; break;
        case 3: nota = 5; break;
        case 4: nota = 4; break;
        case 5: nota = 0; break;
        default: nota = 8; break; //He de vigilar perque si no es amb comilles donara tot 7.
      }
      unitats.set(unitatRows[0][j], nota);
    }
    persones.push(new Persona(unitatRows[i][0], personalRows[i][1], personalRows[i][2], amistats, unitats))
  }
  console.log(persones);
}
document.getElementById("generate").addEventListener(
  "click",
  function (event) {
    generate(event);
  },
  false
);

let groups;
let num;
let condicional;
let valorPersonal;
let valorTotal;

function generate(event) {
  event.preventDefault();

  const size = friendsRows.length;

  let unitats = [];  //No existeix, simplement son els grups que fa el xouxou
  for (let i = 0; i < 8; i++) //no ha d'existir, es el que fa el xouxou
  {
    unitats.push(new Array(5));
  }

  do {
    groups = [];
    for (let i = 0; i < unitats.length; i++) {
      groups.push(new Array(0));
    }
    for (const persona of persones) {
      do {
        num = Math.floor(Math.random() * unitats.length);
      } while (groups[num].length >= unitats[num].length)
      groups[num].push(persona);
    }
    calculaGrups();
  } while (valorTotal == 0);
  document.getElementById("valor").textContent = valorTotal.toString();
  console.log(groups);

  debugGrups();

  document.querySelectorAll('.nom').forEach((n) => n.addEventListener("click", () => {
    console.log("has clicat");
    toggle(n);
}));
  
  console.log(valorTotal);
  for (const g of groups) {
    for (const p of g) {
      const grup = document.querySelectorAll('.grup');
      grup.forEach((g) => g.getElementsByClassName);
    }

  }
}

function calculaGrups()
{
  valorTotal = 1;
    for (const g of groups) {
      for (const person1 of g) {
        condicional = false;
        valorPersonal = 10;
        for (const person2 of g) {
          if (person1.amistats.has(person2.nom)) {
            condicional = true;
            if (person1.amistats.get(person2.nom) < valorPersonal) {
              valorPersonal = person1.amistats.get(person2.nom);
            }
          }
        }

        if (condicional) valorTotal *= valorPersonal;
        else valorTotal *= 7;

        valorTotal *= person1.unitats.get(Array.from(person1.unitats.keys())[groups.indexOf(g)]);
        //falta paritat i experiencia!!!!!!!
        //  !!!!!!!!!!!!
        // !!!!!!!!!!!
      }
      if (valorTotal == 0)
        break;
    }
}

function debugGrups()
{
  let button;
  for (const g of groups) {
    while (document.getElementById("allGrup").children[groups.indexOf(g)].children[1].firstChild) {
      document.getElementById("allGrup").children[groups.indexOf(g)].children[1].removeChild(document.getElementById("allGrup").children[groups.indexOf(g)].children[1].firstChild);
    }
    while (document.getElementById("allGrup").children[groups.indexOf(g)].children[2]) {
      document.getElementById("allGrup").children[groups.indexOf(g)].removeChild(document.getElementById("allGrup").children[groups.indexOf(g)].children[2]);
    }
    for (const person1 of g) {
      button = document.createElement('button');
      button.textContent = person1.nom;
      button.className = 'nom';
      document.getElementById("allGrup").children[groups.indexOf(g)].children[1].appendChild(button);
      for (const person2 of g) {
        if (person1.amistats.has(person2.nom)) {
          if (person1.amistats.get(person2.nom) < 7) {
            console.log(person1.nom + ' </3 ' + person2.nom + ': ' + person1.amistats.get(person2.nom));
          }
        }
      }
      if (person1.unitats.get(Array.from(person1.unitats.keys())[groups.indexOf(g)]) == 7) {
        console.log(person1.nom + ' segona opcio: ' + Array.from(person1.unitats.keys())[groups.indexOf(g)]);
      }
      else if (person1.unitats.get(Array.from(person1.unitats.keys())[groups.indexOf(g)]) < 7) {
        console.log(person1.nom + ' ni primera ni segona opcio: '
          + Array.from(person1.unitats.keys())[groups.indexOf(g)] + ': ' + person1.unitats.get(Array.from(person1.unitats.keys())[groups.indexOf(g)]));
      }
    }
    for(let i = 5 - g.length; i > 0; i--)
    {
      button = document.createElement('button');
      button.textContent = '+';
      button.className = 'nom';
      document.getElementById("allGrup").children[groups.indexOf(g)].appendChild(button);
    }

    //falta paritat i experiencia!!!!!!!
    //  !!!!!!!!!!!!
    // !!!!!!!!!!!
  }
}

let tog = null;
function toggle(nom)
{
  if (tog == null) {
    tog = nom;
    nom.style.background = '#990000';
  }
  else if(tog === nom) {
    tog = null;
    nom.style.background = '';
  } 
  else{
    let aux = nom.textContent;
    nom.textContent = tog.textContent;
    tog.textContent = aux;
    if(tog.textContent == '+' && nom.textContent == '+') {}
    else if(nom.textContent == '+'){
      groups[tog.parentElement.children[1].id].push(groups[nom.parentElement.id][Array.from(nom.parentElement.children).indexOf(nom)]);
      groups[nom.parentElement.id].splice(Array.from(nom.parentElement.children).indexOf(nom),1);
    }
    else if(tog.textContent == '+'){
      groups[nom.parentElement.children[1].id].push(groups[tog.parentElement.id][Array.from(tog.parentElement.children).indexOf(tog)]);
      groups[tog.parentElement.id].splice(Array.from(tog.parentElement.children).indexOf(tog),1);
    }
    else{
      let s1 = groups[nom.parentElement.id][Array.from(nom.parentElement.children).indexOf(nom)];
      let s2 = groups[tog.parentElement.id][Array.from(tog.parentElement.children).indexOf(tog)];
      groups[nom.parentElement.id][Array.from(nom.parentElement.children).indexOf(nom)] = s2;
      groups[tog.parentElement.id][Array.from(tog.parentElement.children).indexOf(tog)] = s1;
    }
    nom.style.background = '';
    tog = null;
    calculaGrups();
    debugGrups();
    document.getElementById("valor").textContent = valorTotal.toString();
    console.log(nom, tog);
    document.querySelectorAll('.nom').forEach((n) => n.addEventListener("click", () => {
      console.log("has clicat");
      toggle(n);
  }));  //No entenc perque aixo es necessari pero bueno... espero que no crei infinits event listeners i es mori tot.
  }
}


// PART DEL JORDI
//-----------------------------------------------------------------------------------

function addGrup(nom, id) {
  let numberOfChildren = Number(document.getElementsByTagName('div').length)
  if (numberOfChildren == null)
    numberOfChildren = 0;

  let maindiv = document.createElement('div');
  
  let div = document.createElement('div');
  div.textContent = nom;
  div.className = 'nomUnitat';
  maindiv.appendChild(div);

  let il = document.createElement('il');
  il.className = 'grup';
  il.id = id.toString();
  maindiv.appendChild(il);

  document.getElementById("allGrup").appendChild(maindiv);
}


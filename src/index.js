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
var unitatRows, friendsRows, personalRows;
const input = document.getElementById('input')
input.addEventListener('change', () => {
  readXlsxFile(input.files[0], { sheet: 'Unitat' }).then((rows) => {
    unitatRows = rows;
    for(let i = 1; i < rows[0].length; i++) {
      addGrup(rows[0][i], i-1);
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
var amistats;
var unitats;
var nota;

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

function generate(event) {
  event.preventDefault();

  const size = friendsRows.length;

  var unitats = [];  //No existeix, simplement son els grups que fa el xouxou
  for (let i = 0; i < 8; i++) //no ha d'existir, es el que fa el xouxou
  {
    unitats.push(new Array(5));
  }

  var groups;
  var num;
  var condicional;
  var valorPersonal;
  var valorTotal;

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
  } while (valorTotal == 0);
  console.log(groups);  
  for (const g of groups) {
    document.getElementById(groups.indexOf(g).toString()).children[2].textContent = '\n\n';
    for (const person1 of g) {
      document.getElementById(groups.indexOf(g).toString()).children[2].textContent += person1.nom + '\n';
      valorPersonal = 10;
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
      document.getElementById(groups.indexOf(g).toString()).children[2].textContent += '\n';
    }

    //falta paritat i experiencia!!!!!!!
    //  !!!!!!!!!!!!
    // !!!!!!!!!!!
  }
  console.log(valorTotal);
  for (const g of groups) {
    for(const p of g){
      const grup = document.querySelectorAll('.grup');
      grup.forEach((g)=>g.getElementsByClassName);
    }

  }
}


// PART DEL JORDI
//-----------------------------------------------------------------------------------



function deleteGrup() {
  event.target.parentElement.remove()
}
function addGrup(nom, id) {
  var numberOfChildren = Number(document.getElementsByTagName('div').length)
  if (numberOfChildren == null)
      numberOfChildren = 0;

  let il = document.createElement('il');
  il.className = 'grup';
  il.id = id.toString();

  let inputLlista = document.createElement('input');
  inputLlista.type = 'text'
  inputLlista.value = nom;
  il.appendChild(inputLlista)

  let deleteButton = document.createElement('button');
  deleteButton.id = 'deleteGrup';
  deleteButton.textContent = 'x';
  il.appendChild(deleteButton);

  let labelLlista = document.createElement('label');
  labelLlista.textContent = '\n\n';
  il.appendChild(labelLlista)


  deleteButton.addEventListener("click", deleteGrup, false);
  document.getElementById("allGrup").appendChild(il);
}


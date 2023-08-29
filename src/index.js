/* The live editor requires this function wrapper */
import readXlsxFile from 'read-excel-file'

class Persona {
  constructor(nom, sexe, experiencia, amistats, unitats) {
    this.nom = nom;
    this.sexe = sexe;
    this.amistats = new Map(amistats);
    this.unitats = new Map(unitats);
    this.experiencia = experiencia;
  }
}

//Variables Globals

let unitatRows, friendsRows, personalRows, persones = [], groups, valorTotal = 0, size, par;


//Main

//Llegeix el doc xlsx i crea unitats i les persones
const input = document.getElementById('chooseFile')
input.addEventListener('change', () => {  
  while (document.getElementById("allGrup").firstChild) {
    document.getElementById("allGrup").removeChild(document.getElementById("allGrup").firstChild);
  }
  readXlsxFile(input.files[0], { sheet: 'Unitat' }).then((rows) => {
    unitatRows = rows;
    for (let i = 1; i < rows[0].length; i++) addGrup(rows[0][i], i - 1);
  });
  readXlsxFile(input.files[0], { sheet: 'Friends' }).then((rows) => {
    friendsRows = rows;
  });
  readXlsxFile(input.files[0], { sheet: 'Personal' }).then((rows) => {
    personalRows = rows;
    personList();
  });
})

document.getElementById("generate").addEventListener(
  "click",
  function (event) {
    generate(event);
  },
  false
);



//Crea les persones
function personList() {
  for (let i = 1; i < unitatRows.length; i++) {
    let amistats = new Map();
    for (let j = 1; j < friendsRows[i].length; j += 2) {
      if (friendsRows[i][j] == null || friendsRows[i][j] == undefined ||
          friendsRows[i][j+1] == null || friendsRows[i][j+1] == undefined) break;
      amistats.set(friendsRows[i][j], friendsRows[i][j + 1]);
    }

    let grupsUnitats = new Map();
    for (let j = 1; j < unitatRows[i].length; j++) {
      switch (unitatRows[i][j]) {
        case 1: grupsUnitats.set(unitatRows[0][j], 10); break;
        case 2: grupsUnitats.set(unitatRows[0][j], 7); break;
        case 3: grupsUnitats.set(unitatRows[0][j], 5); break;
        case 4: grupsUnitats.set(unitatRows[0][j], 4); break;
        case 5: grupsUnitats.set(unitatRows[0][j], 0); break;
        default: grupsUnitats.set(unitatRows[0][j], 8); break;
      }
    }
    persones.push(new Persona(unitatRows[i][0], personalRows[i][1], personalRows[i][2], amistats, grupsUnitats))
  }
  //Afegeixo els likes/dislikes reciprocament agafant sempre el mes baix.
  for (const persona of persones) {
    for (const nomamic of Array.from(persona.amistats.keys())) {
      for (const amic of persones) {
        if(amic.nom == nomamic){
          if(amic.amistats.has(persona.nom && persona.amistats.get(nomamic) > amic.amistats.get(persona.nom)))
            persona.amistats.set(nomamic, amic.amistats.get(persona.nom));
          else if(persona.amistats.get(nomamic) < 7)
            amic.amistats.set(persona.nom, persona.amistats.get(nomamic));
          break;
        }
      }
    }
  }
  let m = 0, f = 0;
  for (const pers of persones) {
    if(pers.sexe == 'M') m++;
    else if(pers.sexe == 'F') f++;
    else {console.log("on no, un no binari!"); return;}
  }     //Potser hauria de ser variable global i no anar calculant
  par = m / (m+f);
  //console.log(persones);
}







function generate(event) {
  event.preventDefault();

  size = Math.ceil((friendsRows.length-1)/(unitatRows[0].length-1));

  let unitats = [];
  for (let i = 0; i < unitatRows[0].length-1; i++) {
    unitats.push(new Array(size));  //Es bastant inutil pero ho deixo aixi per si en el futur faig que es puguin fer de tamanys diferents
  }

  let bestValor = 0;
  let bestGroups = new Map();

  for(let num = 0; num < 100000; num++)
  {
    do {
      groups = [];
      for (let i = 0; i < unitats.length; i++) {
        groups.push(new Array(0));
      }
      fixedCreaGrups();
    } while (valorTotal == 0);
    calculaGrups();
    if(bestGroups.size < 30) {
      bestGroups.set(valorTotal, [...groups]);
      bestGroups = new Map([...bestGroups.entries()].sort());
      bestValor = Array.from(bestGroups.keys())[0];
    }
    else if(bestValor < valorTotal){
      bestGroups.delete(Array.from(bestGroups.keys())[0]);
      bestGroups.set(valorTotal, [...groups]);
      bestGroups = new Map([...bestGroups.entries()].sort());
      bestValor = Array.from(bestGroups.keys())[0];
    }
  }
  
  let button;
  for(let i = bestGroups.size - 1; i >= 0; i--) {
    button = document.createElement('button');
    button.textContent = bestGroups.size - i;
    button.className = 'buff';
    document.getElementById("buffer").appendChild(button);
  }
  document.querySelectorAll('.buff').forEach((n) => n.addEventListener("click", () => {
    console.clear();
    groups = bestGroups.get(Array.from(bestGroups.keys())[bestGroups.size - n.textContent]);
    calculaGrups();
    debugGrups();
  }));
}

function fixedCreaGrups(){
  let randPersones = [...persones];
  let num;
  let disponibilitat;
  valorTotal = 1;
  while(randPersones.length > 0) {
    num = Math.floor(Math.random() * randPersones.length);
    disponibilitat = calculaPosicio(randPersones[num]);   
    
    let total = disponibilitat.reduce((partialSum, a) => partialSum + a, 0);
    if(total == 0) {
      valorTotal = 0;
      return;
    }
    let rand = Math.random()*total;
    let i;
    for(i = 0; rand >= 0; i++){
      rand -= disponibilitat[i];
    }
    groups[i-1].push(randPersones[num]);
    valorTotal *= disponibilitat[i-1];
    randPersones[num] = randPersones[randPersones.length-1];
    randPersones.pop();
  }
}

function calculaPosicio(persona)
{
  let disponibilitat = new Array(unitatRows[0].length-1);
  for(let i = 0; i < disponibilitat.length; i++)
  {
    if(size - groups[i].length == 0) disponibilitat[i] = 0;
    else disponibilitat[i] = Math.pow(persona.unitats.get(Array.from(persona.unitats.keys())[i]), size - groups[i].length);
    let num = 1;
    for (const p of groups[i]) {
      if(persona.amistats.has(p.nom)) num *= persona.amistats.get(p.nom);
      else num *= 7;
    }
    num *= Math.pow(7, size - groups[i].length);
    disponibilitat[i] *= num;
    // let m = 0, f = 0;
    // if(groups[i].length != 0){
    //   for (const pers of groups[i]) {
    //     if(pers.sexe == 'M') m++;
    //     else if(pers.sexe == 'F') f++;
    //   }
    //   let grupPar = m / (m+f);
    //   if(persona.sexe == 'M') m++;
    //   else if(persona.sexe == 'F') f++;
    //   let grupParmes = m / (m+f);
    //   disponibilitat[i] *= Math.pow(3 * (1 + Math.abs(par-grupPar) - Math.abs(par-grupParmes)), size);
    // }
    // else{
    //   let grupPar;
    //   if(persona.sexe == 'M') grupPar = 1;
    //   else if(persona.sexe == 'F') grupPar = 0;
    //   disponibilitat[i] *= Math.pow(3 * (1 + grupPar - par), size);
    // }
    // if(persona.experiencia == 'vell')
    //   for (const pers of groups[i]) {
    //     if(pers.experiencia == 'seminou') disponibilitat[i] *= 5;
    //     else if(pers.experiencia == 'nou') disponibilitat[i] *= 10;
    //   }
    // else if(persona.experiencia == 'nou'){
    //   for (const pers of groups[i]) {
    //     if(pers.experiencia == 'seminou') disponibilitat[i] *= 5;
    //     else if(pers.experiencia == 'vell') disponibilitat[i] *= 10;
    //   }
    //   if(i > 6){
    //     disponibilitat[i] /= Math.pow(5, size);
    //   }
    // }
    
    if(disponibilitat[i] != 0) disponibilitat[i] = Math.log10(disponibilitat[i]); //Redueixo el numero perque sino surt molt gran.
  }
  return disponibilitat;
}

function calculaGrups()
{
  valorTotal = 1;
    for (const g of groups) {
      for (const person1 of g) {
        let condicional = false;
        let valorPersonal = 10;
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
      }
      // let m, f;
      // m = 0;
      // f = 0;
      // for (const pers of g) {
      //   if(pers.sexe == 'M') m++;
      //   else if(pers.sexe == 'F') f++;
      // }
      // let grupPar = m / (m+f);
      // valorTotal *= Math.pow(5 * (1 - Math.abs(grupPar - par)), size);
    }
    valorTotal = Math.log10(valorTotal);
}

function debugGrups()
{
  let button;
  console.log('CONFLICTES');
  document.getElementById("valor").textContent = valorTotal.toString();
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
          if (person1.amistats.get(person2.nom) < 7 && g.indexOf(person1) < g.indexOf(person2)) {
            console.log(person1.nom + ' i ' + person2.nom + ' no es volen gaire ): -> ' + person1.amistats.get(person2.nom));
          }
        }
      }
      if (person1.unitats.get(Array.from(person1.unitats.keys())[groups.indexOf(g)]) == 7) {
        console.log(person1.nom + ' segona opcio: ' + Array.from(person1.unitats.keys())[groups.indexOf(g)]);
      }
      else if (person1.unitats.get(Array.from(person1.unitats.keys())[groups.indexOf(g)]) == 5) {
        console.log(person1.nom + ' tercera opcio: ' + Array.from(person1.unitats.keys())[groups.indexOf(g)]);
      }
      else if (person1.unitats.get(Array.from(person1.unitats.keys())[groups.indexOf(g)]) < 5) {
        console.log(person1.nom + ' quarta opció: '  + Array.from(person1.unitats.keys())[groups.indexOf(g)]);
      }
    }
    for(let i = size - g.length; i > 0; i--)
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
  document.querySelectorAll('.nom').forEach((n) => n.addEventListener("click", () => {
    toggle(n);
  }));
}

let tog = null;
function toggle(nom)
{
  if (tog == null) {
    tog = nom;
    nom.style.background = '#afafaf';
  }
  else if(tog === nom) {
    tog = null;
    nom.style.background = '';
  } 
  else{
    let aux = nom.textContent;
    nom.textContent = tog.textContent;
    tog.textContent = aux;
    if(tog.textContent == '+' && nom.textContent == '+') {return;}
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


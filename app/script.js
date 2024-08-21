/*** Les variables ***/
var span = getId("regleSpecial");
var info = getId ("infoCoord");
var can=getId("can");
var body1 = getId("body1");
var body2 = getId("body2");
var button = getId("butt");
var ctx= can.getContext('2d');
var width = can.width, height = can.height;//taille du canvas
var arrayGrid=[];//Recupère la grille de base
var tabStateGrid=[];//Conserve l'etat de la grille
var cellNum=[];//stocke le numero de case sélectionné
var k=0;//compteur pour pouvoir stocker la precedente sélection
var selectedCell= [];// pour stocker les cases sélectionné
var rule = new BasicRules();
var red = "#cb4853", blue ="#48cbb7";
var kingRule, knightRule;
var currentGridId;
var currentPlayerId;

/*** Les fonctions ***/
function getId(str) {
    return document.getElementById(str);
}
button.addEventListener("click",function (){

    var name = document.getElementById("name").value;
    if(name !== undefined && name!==""){
        connexion(name);
        getGrid();
        document.body.style.backgroundColor="rgba(169, 127, 102, 0.7)";
        body1.style.display="none";
        body2.style.display="";
        body2.style.marginTop="10px";
        body2.style.padding="1em";
        handleKeyboard();
    }else
        swal("Erreur","Entre un nom", "error");

});
//Au démarrage executer la fonction
function getGrid() {
    var xhr=new XMLHttpRequest();
    //On recupere la grille
    xhr.onreadystatechange= function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            readData(xhr.responseText);
        }
    };
    xhr.open("GET","getGrid.php");
    xhr.send(null);

}
function playerData(data){
    var player=JSON.parse(data);
    currentPlayerId=player[1].pid;
}
function finishedGrid(){
    var pid = currentPlayerId;
    var gid= currentGridId;
    var xhr = new XMLHttpRequest();
    xhr.open("GET","getGrid.php?pid="+pid+"&gid="+gid);
    xhr.send(null);
}
function connexion(name) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (){
        if(xhr.readyState === 4 && xhr.status === 200){
            playerData(xhr.responseText);
        }
    };
    xhr.open("GET","getGrid.php?name=" +name);
    xhr.send(null);
}
function readData(data) {
    //Ici on récupère la grille qu'on passe en format JSON ensuite on affiche
    var grid = JSON.parse(data);
    drawSudokugrid();
    displayGrid(grid);
}
//Lors du rafraichissement mettre à jour la grille
function updateGrid(){
    var x,y,i,j,cmpt=0,validCells=0;
    for(i = 0, y=50; i < 9; i++) {
        for(j= 0,x=15; j< 9 ; j++){
            if(tabStateGrid[cmpt].number === ".")
            {
                ctx.fillText("",x,y);
            }else if (tabStateGrid[cmpt].number ==="PM"){

                console.log(tabStateGrid[cmpt]);
                console.log("pencil de l'updateGrid");
                pencilMarksUpdate(cmpt);
                //tabStateGrid[cmpt].selected=false;
            }else if (tabStateGrid[cmpt].fix){
                ctx.font="55px Arial";
                ctx.fillStyle="black";
                ctx.fillText(tabStateGrid[cmpt].number,x,y);
            }else{
                ctx.font="55px Arial";

                if(validity(cmpt)){
                    ctx.fillStyle=blue;
                    tabStateGrid[cmpt].correct=true;
                }
                else{
                    ctx.fillStyle=red;
                    tabStateGrid[cmpt].correct=false;
                }


                ctx.fillText(tabStateGrid[cmpt].number,x,y);
            }

            //Si tout les cases sont remplit et que tout est correct on affiche un message et on tire une autre grille
            if(tabStateGrid[cmpt].number !== "." && tabStateGrid[cmpt].number !== "PM" && tabStateGrid[cmpt].correct){
                validCells++;
            }
            x+=60;//on va à la case suivante
            cmpt++;
        }y+=60;
    }
    if(validCells===81){
        swal("Félicitations!!","Tu as terminé la grille! À la prochaine!","success");
        finishedGrid();
        setTimeout(function(){location.reload()},5000);
    }
}
function refreshCanv(){
    ctx.clearRect(0,0,width,height);
    drawSudokugrid();
    updateGrid();
}
function drawSudokugrid(){

    ctx.lineWidth  = 2;// Epaisseur de la grille
    //rectangles vertical
    ctx.strokeRect(0,-1,180,545);
    ctx.strokeRect(180,-1,180,545);
    ctx.strokeRect(360,-1,180,545);
    //rectangles horizontal
    ctx.strokeRect(-1,0,545,180);
    ctx.strokeRect(-1,180,545,180);
    ctx.strokeRect(-1,360,545,180);
    //Les petits rectangles horizontal
    ctx.lineWidth=0.5;// on reduit l'epaisseur pour les petits rectangles
    ctx.strokeRect(-1,60,545,60);
    ctx.strokeRect(-1,240,545,60);
    ctx.strokeRect(-1,420,545,60);
    //Les petits rectangles vertical
    ctx.strokeRect(60,-1,60,545);
    ctx.strokeRect(240,-1,60,545);
    ctx.strokeRect(420,-1,60,545);

}
function displayGrid(grid){
    //On declare un compteur qui servira d'indice de tableau
    var x,y,i,j,cmpt=0;

    //On stocke la grille récupéré dans le tableau pour plus de faciliter, le tableau contient uniquement la grille
    for ( i=0; i<grid[0].grille.length; i++){
        arrayGrid[i]=grid[0].grille[i];
    }
    console.log(grid[0]);
    currentGridId=grid[0].gid;
    kingRule=grid[0].king;
    knightRule=grid[0].knight;
    if(kingRule===1){
        span.innerHTML="Un chiffre ne peut pas se retrouver sur les 8 cases adjaccentes à un même chiffre. <br>";
    }else if(knightRule===1){
        span.innerHTML="Un chiffre ne peut pas se retrouver selon un pas de cavalier aux échecs du même chiffre. <br>" +
        "(Le cavalier se déplace de deux cases dans un sens puis de une case perpendiculairement, formant une forme en L).<br>";
    }
    addItem(rule);
    //Definition de la taille des chiffres à afficher
    ctx.font="55px Arial";

    //Inialisation des premieres cordonnées (15,50) où on va commencer à afficher les chiffres
    //On parcourt la grille, si c'est un point on affiche un espace sinon on affiche le contenu de la grille

    for(i = 0, y=50; i < 9; i++) {
        for(j= 0,x=15; j< 9 ; j++){
            if(arrayGrid[cmpt] === ".")
            {
                ctx.fillText("",x,y);
                tabStateGrid[cmpt]=new StateGrid(arrayGrid[cmpt],x,y);//on remplit le tableau qui contient l'etat de la grille
            }else if (arrayGrid[cmpt] !== "."){
                tabStateGrid[cmpt]=new StateGrid(arrayGrid[cmpt],x,y);
                tabStateGrid[cmpt].fix=true;
                ctx.fillText(arrayGrid[cmpt],x,y);//affichage des chiffres de la grille
            }
            x+=60;//on va à la case suivante
            cmpt++;
        }y+=60;
    }

}

function hideORshowHelp(){
    var el = document.getElementById("help");
    if( el.style.display === "none"){
        el.style.display = "block";
    }else{
        el.style.display = "none";
    }
}
function DeletePos(x,y,posTab){
    //objet qui contient la coordonnée d'effacement
    this.x=x-12;//ajusté à la position d'effacement
    this.y=y-47;
    this.posTab=posTab;
    return this;
}
function StateGrid (nb,x,y){
    //objet pour l'etat de la grille
    this.number=nb;
    this.posX=x;
    this.posY=y;
    this.selected = false;
    this.correct = true;
    this.fix=false;

    return this;
}
function BasicRules(){
    //objet contenant les règles de bases
    this.row = new Array(9);
    this.column = new Array(9);
    this.scare = new Array(9);

    for (var i = 0; i <9 ; i++) {
        this.row[i]=new Array(9);
        this.column[i]=new Array(9);
        this.scare[i]=new Array(9);
    }
    return this;
}
function addItem(rule){
    var cmp=0,i,j;
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 9; j++) {

            rule.row[i][j]=arrayGrid[cmp];
            cmp++;

        }

    }

    for (i = 0; i < 9; i++) {
        var m=i;
        for ( j = 0; j < 9 ; j++) {
                rule.column[i][j]=arrayGrid[m];
            m+=9;
        }
    }
    cmp=0;
    for ( i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            for (var l = 0; l < 3; l++) {
                for (var n = 0; n < 3; n++) {
                        rule.scare[i*3+l][j*3+n]=arrayGrid[cmp];
                        cmp++;
                }
            }
        }
    }
}

can.onmousemove= function(e)
{
    var cellX,cellY,x=e.offsetX,y=e.offsetY;

    cellX=Math.floor(x/width*9);//on convertit la coordonnée en "coordonnée de case"
    cellY=Math.floor(y/height*9);
    info.innerHTML = "Coordonées de la souris (X;Y) : ("+ x + ";" + y +")";

    can.onclick=function()
    {
        var firstClic=false;
        x=60*cellX;//on multiplie la taille d'une case par le numero de case ou on a cliqué
        y=60*cellY;//pour que le rectangle soit dessiné à partir de la position (0,0) de la case
        var yBis=y+50,xBis=x+15;

        ctx.fillStyle="rgba(94,94,94,0.4)";
        for (var i = 0; i <tabStateGrid.length; i++) {

            if (tabStateGrid[i].posX===xBis && tabStateGrid[i].posY===yBis && !tabStateGrid[i].fix)
            {

                cellNum[k]= i;
                if(!tabStateGrid[i].selected && (cellNum[k-1] !== cellNum[k] || tabStateGrid[i].number !==".") ){
                    ctx.fillRect(x+3, y+3, 54, 54);
                    tabStateGrid[i].selected= true;
                    firstClic=true;
                }

                if(k>0)//si k est supérieur à 0 on commence à éffacer k-1 ( précédente sélection )
                {
                    handleClic(firstClic);
                }
                k++;

            }
            else if (tabStateGrid[i].posX===xBis && tabStateGrid[i].posY===yBis && tabStateGrid[i].fix)
            {
                //on sort de la boucle si c'est un chiffre fixe
                //pas la peine de continuer à parcourir le reste du tableau
                break;
            }
        }
    }
}
function handleClic(firstClic){
    //todo : handleClic
    var preX=tabStateGrid[cellNum[k-1]].posX,preY=tabStateGrid[cellNum[k-1]].posY;
    var yBis=tabStateGrid[cellNum[k]].posY,xBis=tabStateGrid[cellNum[k]].posX;
    var x=xBis-15, y=yBis-50;
    //si la case précedente contient un chiffre on n'efface pas
    if(tabStateGrid[cellNum[k-1]].posX===preX && tabStateGrid[cellNum[k-1]].posY===preY && tabStateGrid[cellNum[k-1]].number===".")
    {
        if (cellNum[k-1] !== cellNum[k])
        {
            ctx.clearRect(preX-12,preY-47,54,54);
            tabStateGrid[cellNum[k-1]].selected = false;
            //différente case donc on déselectionne
        }
        else if (cellNum[k-1] === cellNum[k] && tabStateGrid[cellNum[k-1]].selected){
            ctx.clearRect(preX-12,preY-47,54,54);
            tabStateGrid[cellNum[k-1]].selected = false;
            //meme case déjà selectionnée donc on deselectionne

        }
        else if(cellNum[k-1] === cellNum[k] && !tabStateGrid[cellNum[k-1]].selected ){
            ctx.fillRect(x+3, y+3, 54, 54);
            tabStateGrid[cellNum[k-1]].selected= true;
            //meme case pas selectionnée donc on selectionne
        }
    }
    //Possibilité de selectionner ou déselectionner un chiffre
    if(tabStateGrid[cellNum[k]].number !=="." && tabStateGrid[cellNum[k]].number !=="PM" && tabStateGrid[cellNum[k]].selected && !firstClic)
    {
        ctx.font="55px Arial";
        ctx.clearRect(x+3, y+3, 54, 54);
        if(tabStateGrid[cellNum[k]].correct)
            ctx.fillStyle=blue;
        else
            ctx.fillStyle=red;
        ctx.fillText(tabStateGrid[cellNum[k]].number,xBis,yBis);
        tabStateGrid[cellNum[k]].selected = false;
        //case contenant un chiffre déjà selectionnée donc on deselectionne
    }
    else if(tabStateGrid[cellNum[k]].number ==="PM" && tabStateGrid[cellNum[k]].selected && !firstClic)
    {
        //si les cases sont différente on ajoute un dans la fonction pour que ça corresponde
        if(cellNum[k-1] !== cellNum[k])
            pencilMarks(1);
        else
            pencilMarks();
        //case contenant un PM déjà selectionnée donc on deselectionne
    }
}
function handleInputNumbers(nb,x,y,xBis,yBis,lig,col,scareNum){
    var scareCellNum;

    if(tabStateGrid[cellNum[k-1]].selected){
        ctx.clearRect(x+3,y+3,54,54);
        ctx.font="55px Arial";
        tabStateGrid[cellNum[k-1]].number=nb;
        tabStateGrid[cellNum[k-1]].selected=false;
        if(tabStateGrid[cellNum[k-1]].number !== "." && tabStateGrid[cellNum[k-1]].number !== "PM"){
            //si la case contient un chiffre on la remplace dans les tableaux de règle par le nouveau nombre saisie, permet d'eviter des erreurs
            rule.row[lig][col]=nb;
            rule.column[col][lig]=nb;
            scareCellNum=numberOfScare(lig,col);//numero de grille (0,1,2,..)
            rule.scare[scareNum][scareCellNum]=nb;
        }
        ctx.fillStyle=blue;
        ctx.fillText(nb,xBis,yBis);

    } else{
        swal("ERREUR","Selectionne d'abord une case", "error");
    }
}
function handleKeyboard (){
    document.body.addEventListener("keydown", function(e){
        var x,y,xBis,yBis,lig,col,scareX,scareY,scareNum;
        var keycode= e.which;
        var nb=(keycode>96 ? keycode-96 : keycode-48).toString();

        if ((keycode >= 97 && keycode <= 105) || (keycode >= 49 && keycode <= 57)) {
            yBis = tabStateGrid[cellNum[k - 1]].posY;
            xBis = tabStateGrid[cellNum[k - 1]].posX;
            x = xBis - 15;
            y = yBis - 50;
            lig = Math.floor(y / width * 9);
            col = Math.floor(x / height * 9);
            scareY = Math.floor((lig * width / 9) / 180);
            scareX = Math.floor((col * height / 9) / 180);
            scareNum = scareY * 3 + scareX;
            handleInputNumbers(nb, x, y, xBis, yBis, lig, col, scareNum);


        }
        if (keycode === 46)
            effacer();
        else if (keycode === 80)
            pencilMarks();
        refreshCanv();

    });
}
//Pour gerer les evenement du pavé numérique
function evNumPad(evt){

    var nb= evt.target.textContent;
    var yBis=tabStateGrid[cellNum[k-1]].posY,xBis=tabStateGrid[cellNum[k-1]].posX;
    var x=xBis-15, y=yBis-50;
    var lig=Math.floor(y/width*9), col=Math.floor(x/height*9);
    var scareY=Math.floor((lig*width/9)/180),scareX=Math.floor((col*height/9)/180);
    var scareNum=scareY*3+scareX;

    handleInputNumbers(nb,x,y,xBis,yBis,lig,col,scareNum);
}
(function numPad(){

    var tbl,tr,td,val;
    tbl = document.createElement("table");
    for (var i = 0; i <= 4; i++) {
        tr=document.createElement("tr");//on crée les lignes de la table
        for (var j = 1; j <= 3; j++) {
            if(i<3)
                td= document.createElement("td");//on crée les colonnes de la tables
            else if (i>2 && j===1)
                td= document.createElement("td");
            if(i<3){
                val=j+3*(2-i);
                td.innerHTML=val;
                td.id = "td_"+val;
                td.onclick= function (){
                    evNumPad(event);
                    refreshCanv();
                }
                td.onmouseover=function(e){
                    e.target.className= "down";
                }
                td.onmouseout=function(e){
                    e.target.className= "";
                }
            }
            else if(i===3 && j===1)
            {
                td.innerHTML="Pencil Marks";
                td.onclick=function (){
                    pencilMarks();
                }

                td.colSpan= 3;
                td.onmouseover=function(e){
                    e.target.className= "down";
                }
                td.onmouseout=function(e){
                    e.target.className= "";
                }
            }
            else if(i===4 && j===1)
            {
                td.innerHTML="Effacer";
                td.colSpan=3;
                td.onmouseover=function(e){
                    e.target.className= "down";
                }
                td.onmouseout=function(e){
                    e.target.className= "";
                }
                td.onclick=effacer;

            }
            tr.appendChild(td);
        }
        tbl.appendChild(tr);
    }
    document.getElementById("body2").appendChild(tbl);

})();
function effacer(){
    var nb,lig,col,scareY,scareX,x,y,scareNum,scareCellNum;

    //D'abord faire une boucle pour parcourir le tableau et stocker les cellules sélectionnées, pour les effacer
    for(var m=0; m<tabStateGrid.length; m++){
        if(tabStateGrid[m].selected)
        {
            selectedCell.push(new DeletePos(tabStateGrid[m].posX,tabStateGrid[m].posY,m));
        }
    }

    for (var l=0; l<selectedCell.length; l++){
        x=selectedCell[l].x-3;y=selectedCell[l].y-3;
        ctx.clearRect(x+3,y+3,54,54);
        lig=Math.floor(y/width*9); col=Math.floor(x/height*9);
        scareY=Math.floor((lig*width/9)/180);scareX=Math.floor((col*height/9)/180);
        scareNum=scareY*3+scareX;
        nb=tabStateGrid[selectedCell[l].posTab].number;
        //lorsqu'on efface on efface aussi dans les tableaux des règles

        rule.row[lig][col]=".";
        rule.column[col][lig]=".";
        scareCellNum=numberOfScare(lig,col);
        rule.scare[scareNum][scareCellNum]=".";
        tabStateGrid[selectedCell[l].posTab].number=".";
        tabStateGrid[selectedCell[l].posTab].selected=false;
    }
    refreshCanv();
    selectedCell= [];
    //on vide le tableau pour pas encombrer la mémoire
    cellNum=[];
    k=0;

}
//Fonction pour verifier les règles
function validityKnight(nb,lig,col){
    var K=true;
    //chercher au dessus
    if(lig-2>= 0 && col-1>=0 && col+1<= 8) {
        if (rule.row[lig-2][col-1]=== nb ) {
            K=false;
        }
        if (rule.row[lig-2][col+1] === nb ) {
            K=false;
        }
    }
    //en dessous
    if(lig+2<= 8 && col-1 >= 0 && col+1<= 8 ) {
        if (rule.row[lig+2][col-1]=== nb ) {
            K=false;
        }
        if (rule.row[lig+2][col+1] === nb ) {
            K=false;
        }
    }

    //à gauche
    if(col-2>= 0 && lig-1>= 0 && lig+1<= 8) {
        if (rule.row[lig+1][col-2]=== nb ) {
            K=false;
        }
        if (rule.row[lig-1][col-2] === nb ) {
            K=false;
        }
    }

    //à droite
    if(col+2<= 8 && lig-1 >= 0 && lig+1<= 8 ) {
        if (rule.row[lig-1][col+2]=== nb ) {
            K=false;
        }
        if (rule.row[lig+1][col+2] === nb ) {
            K=false;
        }
    }
    return K;
}
function validityKing(nb,lig,col){
    var K=true;

    //ligne au dessus de la case actuel
    if (lig-1>=0 && col-1>=0 && col+1<=8) {
        if (rule.row[lig-1][col-1] === nb ) {
            K=false;
        }
        if (rule.row[lig-1][col+1] === nb ) {
            K=false;
        }
    }
    //ligne en dessous de la case actuel
    if (lig+1<=8 && col-1>=0 && col+1<=8 ) {
        if (rule.row[lig+1][col-1]=== nb ) {
            K=false;
        }
        if (rule.row[lig+1][col+1] === nb ) {
            K=false;
        }
    }
    return K;
}
function validity(cmpt){

    var nb = tabStateGrid[cmpt].number;
    var y=tabStateGrid[cmpt].posY-50,x=tabStateGrid[cmpt].posX-15;
    var lig=Math.floor(y/width*9), col=Math.floor(x/height*9);
    var scareY=Math.floor((lig*width/9)/180), scareX=Math.floor((col*height/9)/180);
    var scareNum=scareY*3+scareX,scareCellNum;
    var flagL,flagC,flagS,flagK;

    //Verifier doublons sur la ligne
    flagL= checkOccurence(rule.row[lig],nb);
    //Verifier doublons sur la colonne
    flagC = checkOccurence(rule.column[col],nb);
    //Verifier doublons dans le carré
    flagS= checkOccurence(rule.scare[scareNum],nb);

    if(kingRule===1){
        flagK=validityKing(nb,lig,col);
    }
    else if(knightRule===1){
        flagK=validityKnight(nb,lig,col);
    }

    rule.row[lig][col]=nb;
    rule.column[col][lig]=nb;
    scareCellNum=numberOfScare(lig,col);
    rule.scare[scareNum][scareCellNum]=nb;

    if(kingRule === 1 || knightRule === 1)
        return flagL && flagC && flagS && flagK;
    else
        return flagL && flagC && flagS;
}
function checkOccurence(tab,nb){
    var occurence=0;
    for (var i = 0; i < tab.length; i++) {
        if(tab[i]===nb){
            occurence++;
        }
    }
    return occurence <= 1;//retourne false si occurence >1
}

function validPencilMarks(nb,lig,col,scareNum){
    var flag=true;

    //verifier doublons sur la ligne
    if(rule.row[lig].includes(nb)){
        flag= false;
    }
    //Verifier doublons sur la colonne
    else if(rule.column[col].includes(nb)){
        flag = false;
    }
    //Verifier doublons dans le carré
    else if(rule.scare[scareNum].includes(nb)){
        flag= false;
    }
    //Verifier doublons si règle King
    else if(kingRule===1){
            flag=validityKing(nb,lig,col);

    }
    //Verifier doublons si règle knight
    else if(knightRule===1){
            flag=validityKnight(nb,lig,col);

    }

    return flag;
}
function numberOfScare(lig,col){
    var scareLig,scareCol;

    if(lig>2 && lig<6)
        scareLig=lig-3;
    else if(lig>5 && lig<9)
        scareLig=lig-6;
    else
        scareLig=lig;
    if(col>2 && col<6)
        scareCol=col-3;
    else if(col>5 && col<9)
        scareCol=col-6;
    else
        scareCol=col;

    return scareLig*3+scareCol;
}
function pencilMarksUpdate(cmpt){

    var yBis=tabStateGrid[cmpt].posY-34,xBis,nb;
    var x=tabStateGrid[cmpt].posX-15, y=tabStateGrid[cmpt].posY-50;
    var lig=Math.floor(y/width*9), col=Math.floor(x/height*9);
    var scareY=Math.floor((lig*width/9)/180),scareX=Math.floor((col*height/9)/180);
    var scareNum=scareY*3+scareX;

    ctx.clearRect(x+3,y+3,54,54);
    ctx.fillStyle=blue;
    for(var i = 0; i < 3; i++) {
        ctx.font="15px Arial";
        xBis=tabStateGrid[cmpt].posX-10;
        for(var j= 1; j<= 3 ; j++){
            nb=(j+3*(2-i)).toString();
            if(validPencilMarks(nb,lig,col,scareNum))
                ctx.fillText(nb,xBis,yBis);
            xBis+=20;
        }yBis+=20;
    }
}
function pencilMarks(n=0){

    var yBis=tabStateGrid[cellNum[k-1+n]].posY-34,xBis,nb;
    var x=tabStateGrid[cellNum[k-1+n]].posX-15, y=tabStateGrid[cellNum[k-1+n]].posY-50;
    var lig=Math.floor(y/width*9), col=Math.floor(x/height*9);
    var scareY=Math.floor((lig*width/9)/180),scareX=Math.floor((col*height/9)/180);
    var scareNum=scareY*3+scareX,scareCellNum;
    if(tabStateGrid[cellNum[k-1+n]].selected){
        ctx.clearRect(x+3,y+3,54,54);
        ctx.fillStyle=blue;
        if(tabStateGrid[cellNum[k-1+n]].number !== "."){
            rule.row[lig][col]=".";
            rule.column[col][lig]=".";
            scareCellNum=numberOfScare(lig,col);
            rule.scare[scareNum][scareCellNum]=".";
        }
        for(var i = 0; i < 3; i++) {
            ctx.font="15px Arial";
            xBis=tabStateGrid[cellNum[k-1+n]].posX-10;
            for(var j= 1; j<= 3 ; j++){
                nb=(j+3*(2-i)).toString();
                if(validPencilMarks(nb,lig,col,scareNum))
                    ctx.fillText(nb,xBis,yBis);
                xBis+=20;
            }yBis+=20;
        }
        tabStateGrid[cellNum[k-1+n]].number="PM";
        tabStateGrid[cellNum[k-1+n]].selected=false;

    }else{
        swal("ERREUR","Selectionne d'abord une case", "error");
    }
}


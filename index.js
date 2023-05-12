const express = require("express");
const fs = require("fs");
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const {Client} = require('pg');

var client= new Client({database:"proiectweb",
        user:"alexm1",
        password:"1234",
        host:"localhost",
        port:5432});
client.connect();

app= express();

var fileNameTS=null;
function getCurrentDate(){
    var time = new Date().getTime();
    var date = new Date(time);
    var timeStampVector= date.toString().split(" ");
    var dateTimeSec=timeStampVector[4].split(":");
    return fileNameTS="_"+ timeStampVector[1] + "_"+ timeStampVector[2] + "_" + timeStampVector[3] + "_" + dateTimeSec[0] + "_" + dateTimeSec[1] + "_" + dateTimeSec[2];
}

getCurrentDate();

globalObj={
    errObj:null,
    imgObj:null,
    folderScss: path.join(__dirname, "resources/scss"),
    folderCss: path.join(__dirname,"/resources/css"),
    folderBkp: path.join(__dirname,"bkp"),
    menuOptions: [],
    menuOptions2: [],
    pretMinMax:[],
    accesoriiPhotoShoot:[]
}

client.query("select * from unnest(enum_range(null::tip_photoshoot))", function(err,rezTipuri){
    if(err){
        console.log(err);
    }
    else{
        globalObj.menuOptions=rezTipuri.rows;
    }
}) //luam tipurile de photoshoot si le bagam in obj global

client.query("select * from unnest(enum_range(null::categ_photoshoot))", function(err,rezTipuri2){
    if(err){
        console.log(err);
    }
    else{
        globalObj.menuOptions2=rezTipuri2.rows;
    }
});

client.query("select min(pret), max(pret) from servicii", function(err,rezPret){
    if(err){
        console.log(err);
    }
    else{
        globalObj.pretMinMax=rezPret.rows;
    }
});

client.query("select accesorii from servicii", function(err,rezAcc){
    if(err){
        console.log(err);
    }
    else{
        globalObj.accesoriiPhotoShoot=rezAcc.rows;
        //console.log(globalObj.accesoriiPhotoShoot);
    }
});

console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Current working directory", process.cwd());

vectorFolders=["temp", "temp1","bkp"];

for(let folder_for of vectorFolders){
    let folderPath = path.join(__dirname,folder_for);
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
    }
}

app.set("view engine","ejs");

app.use("/resources", express.static(__dirname+"/resources")); //trimite toate fisierele din resurse
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu=globalObj.menuOptions;
    next();
});

app.use("/services", function(req, res, next){
    res.locals.optiuniMeniu2=globalObj.menuOptions2;
    res.locals.acc=globalObj.accesoriiPhotoShoot;
    res.locals.preturi_range=globalObj.pretMinMax;
    next();
});

app.use(/^\/resources(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function(req,res){
    showErr(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/resources/img/favicon/favicon.ico");
})

app.get(["/index","/","/home"], function(req, res){
    res.render("pages/index", {ip: req.ip, imagini:globalObj.imgObj.imagini});
})

//app.get(/\.ejs$/) - cu regexp
app.get("/*.ejs", function(req,res){
    showErr(res,400);
})

app.get(["/about"], function(req, res){
    res.render("pages/about");
})

app.get(["/eventsgallery"], function(req, res){
    res.render("pages/eventsgallery",{imagini:globalObj.imgObj.imagini});
})

app.get(["/portfolio"], function(req, res){
    res.render("pages/portfolio");
})

app.get(["/contact"], function(req, res){
    res.render("pages/contact");
})



app.get(["/services"],function(req, res){
    client.query("select * from unnest(enum_range(null::tip_photoshoot))", function(err,rezCategorie){
        let conditieWhere="";
        if(req.query.type){
            conditieWhere=` where tip_p ='${req.query.type}'`;
            //console.log(req.query.type);
        }//pentru a vedea doar serviciile de un anumit tip (cand alegem din meniu) - individual/grup/cuplu
        client.query("select * from servicii"+ conditieWhere , function(err, rez){
            //console.log(300);
            if(err){
                console.log(err);
                showErr(res, 2);
            }
            else
            if(rez.rowCount==0){
                res.render("pages/services", {produse:rez.rows, optiuni:rezCategorie.rows, err:"Nu exista produse"});
            }else{
                res.render("pages/services", {produse:rez.rows, optiuni:rezCategorie.rows});
            }
        });
    });
}); 

app.get("/product/:id",function(req, res){
    //console.log(req.params);
    client.query(` select * from servicii where id = ${req.params.id} `, function (err, rez){
        if(err){
            console.log(err);
            showErr(res, 2);
        }
        else
            res.render("pages/product", {prod:rez.rows[0]});
    });
}); //pagina dedicata produsului

app.get("/*",function(req, res){
    //console.log("path:",req.url);
    try{
        res.render("pages"+ req.url, function(err, renderRes){
            if (err){
                console.log(err);
                if(err.message.startsWith("Failed to lookup view"))
                    showErr(res,404);
                else
                   showErr(res);
            }
            else{
                res.send(renderRes);
            }
        });
    }
    catch(err){
        console.log(err);
        if(err.message.startsWith("Cannot find module")){
            showErr(res,404);
        }
    }
    
 
});

function compileScss(pathScss, reason, pathCss){
    if(!pathCss){
        let extPathScss= path.basename(pathScss); //luam numele fisierului in var separata
        let currentFileScss=extPathScss.split(".")[0]; //luam numele fisierului fara extensie pt a crea cel cu .css
        pathCss=currentFileScss+".css"; //adaugam extensia .css la fisier
    }
    
    if (!path.isAbsolute(pathScss)){
        pathScss=path.join(globalObj.folderScss,pathScss);
    }

    if (!path.isAbsolute(pathCss)){
        pathCss=path.join(globalObj.folderCss,pathCss);
    } // la acest punct avem cai absolute in pathScss si pathCss
    let currentFileCss=path.basename(pathCss);

    //let caleResBackup=path.join(globalObj.pathBkp,"resurse/css");

    if(fs.existsSync(pathCss)){
        let pathBkp = path.parse(pathCss).name + fileNameTS + "_" + reason + ".css";
        fs.copyFileSync(pathCss, path.join(globalObj.folderBkp,pathBkp));
        console.log("Creare fisier backup in folderul",globalObj.folderBkp,"fisierul",pathBkp);
    }

    rez=sass.compile(pathScss,{"sourceMap":true});
    fs.writeFileSync(pathCss,rez.css);
    console.log("Fisierul SCSS",pathScss,"a fost compilat in",pathCss);
} 

scssFiles=fs.readdirSync(globalObj.folderScss);
for(let fileName of scssFiles){
    if(path.extname(fileName)==".scss"){
        compileScss(fileName,"startup");
    }
}

var timedOut;
fs.watch(globalObj.folderScss, function(changeAction, fileNameChanged){ //verifica actiunea care s-a intamplat pe un anumit fisier
    if(changeAction=="change" || changeAction=="rename"){
        let updatedFilePath=path.join(globalObj.folderScss, fileNameChanged);
        if(fs.existsSync(updatedFilePath) && !timedOut){
            console.log(changeAction,fileNameChanged);
            timedOut = setTimeout(function() { timedOut=null }, 5000); //blochez recompilarea pt 5 secunde, bug din fs.watch() care inregistreaza mai multe evenimente per schimbare
            getCurrentDate();
            compileScss(updatedFilePath,"fileupdate");
        }
    }
})

function initErr(){
    var content= fs.readFileSync(__dirname+"/resources/json/errors.json").toString("utf-8");
    var errObjLocal=JSON.parse(content);
    for(let err of errObjLocal.errInfo){
        err.img="/"+errObjLocal.base_path+"/"+err.img;
    }
    globalObj.errObj=errObjLocal;
} //initializeaza eroarea
initErr();

function showErr(res, id_p, title_p, text_p, img_p){
    let errorLocal= globalObj.errObj.errInfo.find(function(elemErr){return elemErr.id==id_p}) //cautam in json eroarea
    if(errorLocal){
        let title_1=title_p || errorLocal.title;
        let text_1=text_p || errorLocal.text;
        let img_1=img_p || errorLocal.img; //verificam daca avem parametri functiei altfel luam din json
        if(errorLocal.status)
            res.status(errorLocal.id).render("pages/error",{title:title_1, text: text_1, img: img_1});
        else
        res.render("pages/error",{title:title_1, text: text_1, img: img_1});
    }
    else {
        res.render("pages/error", {title: globalObj.errObj.defaultErr.title, text: globalObj.errObj.defaultErr.text, img: globalObj.errObj.base_path+"/"+defaultErr.img});
    }
} //afiseaza eroarea

function initImg(){
    var imgJSON= fs.readFileSync(__dirname+"/resources/json/galerie_1.json").toString("utf-8");
    globalObj.imgObj=JSON.parse(imgJSON);
    let vImg=globalObj.imgObj.imagini;
    let imgPath=path.join(__dirname,globalObj.imgObj.cale_galerie);
    let imgMediu=path.join(imgPath,"mediu");
    let imgMic=path.join(imgPath,"mic");

    if(!fs.existsSync(imgMediu)){
        fs.mkdirSync(imgMediu);
        console.log("Folder imagini medii creat.");
    }
    if(!fs.existsSync(imgMic)){
        fs.mkdirSync(imgMic);
        console.log("Folder imagini mici creat.");
    }

    for(let imag of vImg){
        [fileName,extensie]=imag.fisier.split(".");
        let imgPathFisier=path.join(imgPath,imag.fisier);
        let imgPathMediu=path.join(imgMediu,fileName)+".webp";
        let imgPathMic=path.join(imgMic,fileName)+".webp";

        sharp(imgPathFisier).resize(400).toFile(imgPathMediu);
        sharp(imgPathFisier).resize(250).toFile(imgPathMic);

        imag.fisier="/"+path.join(globalObj.imgObj.cale_galerie,imag.fisier);
        imag.fisier_mediu="/"+path.join(globalObj.imgObj.cale_galerie,"mediu",fileName+".webp");
        imag.fisier_mic="/"+path.join(globalObj.imgObj.cale_galerie,"mic",fileName+".webp");
    }
}
initImg();

app.listen(8080);
console.log("Serverul a pornit");
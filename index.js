const express = require("express");
const fs = require("fs");
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const {Client} = require('pg');
const formidable=require("formidable");
const {Utilizator}=require("./module_proprii/utilizator.js")
const session=require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const AccesBD= require("./module_proprii/accesbd.js");


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
    accesoriiPhotoShoot:[],
    nume_lista:[]
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

client.query("select nume from servicii", function(err,rezNume){
    if(err){
        console.log(err);
    }
    else{
        globalObj.nume_lista=rezNume.rows;
    }
});

console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Current working directory", process.cwd());

vectorFolders=["temp", "temp1","bkp", "poze_uploadate"];

for(let folder_for of vectorFolders){
    let folderPath = path.join(__dirname,folder_for);
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
    }
}

app.set("view engine","ejs");
app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

app.use("/resources", express.static(__dirname+"/resources")); //trimite toate fisierele din resurse
app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu=globalObj.menuOptions;
    res.locals.Drepturi=Drepturi;
    if (req.session.utilizator){
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);
    }   
    next();
});

app.use("/services", function(req, res, next){
    res.locals.optiuniMeniu2=globalObj.menuOptions2;
    res.locals.acc=globalObj.accesoriiPhotoShoot;
    res.locals.preturi_range=globalObj.pretMinMax;
    res.locals.nume_l=globalObj.nume_lista;
    res.locals.desc_l=globalObj.desc_lista;
    next();
});

app.use("/services2", function(req, res, next){
    res.locals.optiuniMeniu2=globalObj.menuOptions2;
    res.locals.acc=globalObj.accesoriiPhotoShoot;
    res.locals.preturi_range=globalObj.pretMinMax;
    res.locals.nume_l=globalObj.nume_lista;
    res.locals.desc_l=globalObj.desc_lista;
    next();
});

app.use(/^\/resources(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function(req,res){
    showErr(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/resources/img/favicon/favicon.ico");
})

app.get(["/index","/","/home","/login"], async function(req, res){
    let sir=req.session.succesLogin;
    req.session.succesLogin=null;
    res.render("pages/index", {ip: req.ip, imagini:globalObj.imgObj.imagini, mesajLogin:sir});
})

app.post("/inregistrare",function(req, res){
    var username;
    var poza;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        var eroare="";

        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume; //apelam setter, parametru este dupa egal
            utilizNou.setareUsername=campuriText.username;
            utilizNou.email=campuriText.email
            utilizNou.prenume=campuriText.prenume
            
            utilizNou.parola=campuriText.parola;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            utilizNou.poza= poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru , eroareUser){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul";
                }

                if(!eroare){
                    res.render("pages/inregistrare", {raspuns:"Inregistrare cu succes!"})
                    
                }
                else
                    res.render("pages/inregistrare", {err: "Eroare: "+eroare});
            })
            

        }
        catch(e){ 
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pages/inregistrare", {err: "Eroare: "+eroare})
        }
    
    });
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
		
        if(nume=="username")
            username=val;
    }) 
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
		
        console.log(nume,fisier);
		//TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser=path.join(__dirname, "poze_uploadate",username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })    
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    }); 
});

app.post("/login",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        Utilizator.getUtilizDupaUsername (campuriText.username,{
            req:req,
            res:res,
            parola:campuriText.parola
        }, function(u, obparam ){
            let parolaCriptata=Utilizator.criptareParola(obparam.parola);
            if(u.parola==parolaCriptata && u.confirmat_mail ){
                u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";
                obparam.req.session.utilizator=u;
                
                obparam.req.session.mesajLogin="Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else{
                console.log("Eroare logare")
                obparam.req.session.mesajLogin="Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});

app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pages/logout");
});

app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        showErr(res,403)
        res.render("pages/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
            conditiiAnd:[`parola='${parolaCriptata}'`,`username='${campuriText.username}'`]
        }, 
        function(err, rez){
            if(err){
                console.log(err);
                showErr(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pages/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume;
                req.session.utilizator.prenume= campuriText.prenume;
                req.session.utilizator.email= campuriText.email;
                req.session.utilizator.culoare_chat= campuriText.culoare_chat;
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pages/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});

app.get("/useri", function(req, res){
   
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    }
    else{
        afisareEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){
           
                AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        afisareEroare(res,403);
    }
})


app.get("/cod/:username/:token",function(req,res){
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
            AccesBD.getInstanta().update(
                {tabel:"utilizatori",
                campuri:{confirmat_mail:'true'}, 
                conditiiAnd:[`cod='${obparam.token}'`]}, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        afisareEroare(res,3);
                    }
                    else{
                        res.render("pages/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        renderError(res,2);
    }
});

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

app.get(["/services2"],function(req, res){
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
                res.render("pages/services_cards", {produse:rez.rows, optiuni:rezCategorie.rows, err:"Nu exista produse"});
            }else{
                res.render("pages/services_cards", {produse:rez.rows, optiuni:rezCategorie.rows});
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

app.get("/product2/:id",function(req, res){
    //console.log(req.params);
    client.query(` select * from servicii where id = ${req.params.id} `, function (err, rez){
        if(err){
            console.log(err);
            showErr(res, 2);
        }
        else
            res.render("pages/product2", {prod:rez.rows[0]});
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
    
    // const sm = JSON.stringify(rez.sourceMap)
    // const smBase64 = (Buffer.from(sm, 'utf8') || '').toString('base64')
    // const smComment = '/*# sourceMappingURL=data:application/json;charset=utf-8;base64,' + smBase64 + ' */'
    // css_f = rez.css.toString() + '\n'.repeat(2) + smComment
    // fs.writeFileSync(pathCss,css_f);

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
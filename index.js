const express = require("express");
const fs = require("fs");
const path = require('path');

app= express();

globalObj={
    errObj:null,
    imgObj:null
}
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Current working directory", process.cwd());

vectorFolders=["temp", "temp1"];

for(let folder_for of vectorFolders){
    let folderPath = path.join(__dirname,folder_for);
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
    }
}

app.set("view engine","ejs");

app.use("/resources", express.static(__dirname+"/resources")); //trimite toate fisierele din resurse

app.use(/^\/resources(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function(req,res){
    showErr(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/resources/img/favicon/favicon.ico");
})

app.get(["/index","/","/home"], function(req, res){
    res.render("pages/index", {ip: req.ip});
})

//app.get(/\.ejs$/) - cu regexp
app.get("/*.ejs", function(req,res){
    showErr(res,400);
})

app.get(["/about"], function(req, res){
    res.render("pages/about");
})

app.get("/*",function(req, res){
    //console.log("path:",req.url);
    try{
        res.render("pages"+ req.url, function(err, renderRes){
            if (err){
                console.log(err);
                if(err.message.startsWith("Failed to lookup view "))
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

app.listen(8080);
console.log("Serverul a pornit");
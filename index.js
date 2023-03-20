const express = require("express");

app= express();
console.log("Folder proiect", __dirname);

app.set("view engine","ejs");

app.use("/resources", express.static(__dirname+"/resources")); //trimite toate fisierele din resurse

app.get("/index", function(req, res){
    res.render("pages/index");
})

app.listen(8080);
console.log("Serverul a pornit");
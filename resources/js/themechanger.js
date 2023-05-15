function changeThemeD(){
    localStorage.setItem("theme", "dark")
    document.body.classList.add("dark");
    document.body.classList.remove("colorful");
    document.getElementById("btn-theme-d").checked=true;
    document.getElementById("btn-theme-l").checked=false;
    document.getElementById("btn-theme-c").checked=false;
    console.log("changed theme to dark");;
}
function changeThemeL(){
    localStorage.setItem("theme", "light")
    document.body.classList.remove("dark");
    document.body.classList.remove("colorful");
    document.getElementById("btn-theme-l").checked=true;
    document.getElementById("btn-theme-d").checked=false;
    document.getElementById("btn-theme-c").checked=false;
    console.log("changed theme to light");
}
function changeThemeC(){
    localStorage.setItem("theme", "colorful")
    document.body.classList.remove("dark");
    document.body.classList.add("colorful");
    document.getElementById("btn-theme-l").checked=false;
    document.getElementById("btn-theme-d").checked=false;
    document.getElementById("btn-theme-c").checked=true;
    console.log("changed theme to colorful");
}

window.addEventListener("DOMContentLoaded", function(){
    const localTheme = localStorage.getItem("theme");
    if(localTheme=="dark"){
        changeThemeD();
    }else if(localTheme=="colorful"){
        changeThemeC();
    }else{
        changeThemeL();
    }
    document.getElementById("btn-theme-d").onclick = function(){
        changeThemeD();
    }
    document.getElementById("btn-theme-l").onclick = function(){
        changeThemeL();
    }
    document.getElementById("btn-theme-c").onclick = function(){
        changeThemeC();
    }
});
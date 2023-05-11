function changeThemeD(){
    localStorage.setItem("theme", "dark")
    document.body.classList.add("dark");
    document.body.classList.remove("colorful");
    document.getElementById("btn-theme-d").checked=true;
    document.getElementById("btn-theme-l").checked=false;
    document.getElementById("btn-theme-c").checked=false;
    document.getElementById("th-switch").checked=true;
    document.getElementById("th-switch").style.display="block";
    document.getElementById("th-sw-label").style.display="block";
    document.getElementById("th-sw-label").innerHTML=`<i class="bi bi-moon-stars"></i>`;
    console.log("changed theme to dark");
}
function changeThemeL(){
    localStorage.setItem("theme", "light")
    document.body.classList.remove("dark");
    document.body.classList.remove("colorful");
    document.getElementById("btn-theme-l").checked=true;
    document.getElementById("btn-theme-d").checked=false;
    document.getElementById("btn-theme-c").checked=false;
    document.getElementById("th-switch").checked=false;
    document.getElementById("th-switch").style.display="block";
    document.getElementById("th-sw-label").style.display="block";
    document.getElementById("th-sw-label").innerHTML=`<i class="bi bi-sun"></i>`;
    console.log("changed theme to light");
}
function changeThemeC(){
    localStorage.setItem("theme", "colorful")
    document.body.classList.remove("dark");
    document.body.classList.add("colorful");
    document.getElementById("btn-theme-l").checked=false;
    document.getElementById("btn-theme-d").checked=false;
    document.getElementById("btn-theme-c").checked=true;
    document.getElementById("th-switch").style.display="none";
    document.getElementById("th-sw-label").style.display="none";
    console.log("changed theme to colorful");
}
window.onload = function(){
    const localTheme = localStorage.getItem("theme");
    if(localTheme=="dark"){
        changeThemeD();
    }else if(localTheme=="light"){
        changeThemeL();
    }else{
        changeThemeC();
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

    var th_sw_state = document.getElementById("th-switch").checked;

    if(th_sw_state){
        changeThemeD();
    }

    if(!th_sw_state){
        changeThemeL();
    }
}

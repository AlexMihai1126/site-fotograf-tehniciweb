//setCookie("a",10, 1000)
function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
    d=new Date();
    d.setTime(d.getTime()+timpExpirare);
    document.cookie=`${nume}=${val}; path=/; expires=${d.toUTCString()}`;
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
}

function deleteAllCookies(){
    let v_cookies=document.cookie.split(";");
    for(let cookie of v_cookies){
        let numeC=cookie.split("=")[0];
        deleteCookie(numeC);
    }
}


window.addEventListener("DOMContentLoaded", function(){
    if (getCookie("acceptat_banner")){
        document.getElementById("banner_container").style.display="none";
    }

    this.document.getElementById("btn-cookies").onclick=function(){
        setCookie("acceptat_banner",true,(7*24*3600000)) //seteaza cookie pt 7 zile
        document.getElementById("banner_container").style.display="none"
    }
})

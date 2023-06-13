window.addEventListener("DOMContentLoaded", function(){
    if(getCookie("acceptat_banner")){
        setCookie("ultimul_produs_vizitat",window.location.href,(24*3600000)); //seteaza cookie pt o zi
    }
});
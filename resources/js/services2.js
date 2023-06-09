function rstErr(){
    document.getElementById("eroarePlaceholder").innerHTML="";
    document.getElementById("inp-desc").classList.remove("is-invalid");
    document.getElementById("inp-nume").classList.remove("is-invalid");
} //reseteaza erorile

function rst(){
    var conf= confirm("Doresti sa resetezi filtrele?");
    if(conf){
        rstErr();
        var produse = document.getElementsByClassName("produs");
        for (let prod of produse){
            prod.style.display = "block";
        }
        document.getElementById("inp-nume").value="";
        document.getElementById("inp-desc").value="";
        document.getElementById("inp-pret").value=document.getElementById("inp-pret").max;
        document.getElementById("inp-categorie").value="toate";
        document.getElementById("i_datalist").value="";
        document.getElementById("i_rad4").checked=true;
        document.getElementById("i_check1").checked=true;
        document.getElementById("i_check2").checked=true;
        document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").max})`
        for (let opt of document.getElementById("i_sel_multiplu").options){
            opt.selected=false;
        }
    }
    
} //reseteaza toate filtrele si erorile

function filtrare(){
    rstErr();

    let val_nume = document.getElementById("inp-nume").value.toLowerCase();
    let val_descriere = document.getElementById("inp-desc").value.toLowerCase().trim();
    if(val_nume.search(/,|;|\.|\||!|@|'|`|:|[0-9]/gmi)!=-1){
        document.getElementById("inp-nume").classList.add("is-invalid");
        return;
    }
    if(val_descriere.search(/,|;|\.|\||!|@|'|`|:|[0-9]/gmi)!=-1){
        document.getElementById("inp-desc").classList.add("is-invalid");
        return;
    }

    let val_durata;
    for (let r of document.getElementsByName("gr_rad")){
        if(r.checked){
            val_durata=r.value;
            break;
        }
    }
    let val_pret = document.getElementById("inp-pret").value;
    let val_tip = document.getElementById("i_datalist").value;
    let val_categorie = document.getElementById("inp-categorie").value;

    var val_acc = [];
    for (let opt1 of document.getElementById("i_sel_multiplu").options){
        if (opt1.selected) {
            val_acc.push(opt1.value);
        }
    }

    var produse = document.getElementsByClassName("produs");
    let nr_rez=0;
    for (let prod of produse){
        prod.style.display = "none";
        let nume_serv = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
        let durata_serv = prod.getElementsByClassName("val-durata")[0].innerHTML;
        let desc_serv = prod.getElementsByClassName("val-desc")[0].innerHTML.toLowerCase().trim();
        let zile_serv= prod.getElementsByClassName("val-ext")[0].innerHTML;
        let pret_serv = parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML);
        let categ_serv = prod.getElementsByClassName("val-categorie")[0].innerHTML;
        let tip_serv = prod.getElementsByClassName("val-tip")[0].innerHTML;
        let acc_serv = prod.getElementsByClassName("val-acc")[0].innerHTML.split(",");

        let cond_nume = nume_serv.includes(val_nume);
        let cond_desc = desc_serv.includes(val_descriere); 
        let cond_durata = true;
        if(val_durata!="toate"){
            [nra, nrb]=val_durata.split(":");
            nra=parseInt(nra);
            nrb=parseInt(nrb); //intervalul de calorii
            cond_durata = (nra<=durata_serv && durata_serv < nrb);
        }
        
        let cond_pret = (val_pret>=pret_serv);
        let cond_categ = (val_categorie == categ_serv || val_categorie == "toate");
        let cond_zile_1;
        let cond_zile_ambele;
        let cond_zile=false;
        if(document.getElementById("i_check1").checked && document.getElementById("i_check2").checked){
            cond_zile_ambele=true; //daca asta e true inseamna ca le afisam pe ambele si o ignoram pe a doua
        }else{
            if(document.getElementById("i_check1").checked){
                cond_zile_1=false; //daca asta e false afisam doar cele care au "false" la val-ext
            }else{
                if(document.getElementById("i_check2").checked){
                    cond_zile_1=true;//daca asta e true afisam doar cele care au "true" la val-ext
                }
            }
        }
        //verificare cu ce are in produs
        if(cond_zile_ambele){
            cond_zile=true;
        }else{
            if(prod.getElementsByClassName("val-ext")[0].innerHTML==new String(cond_zile_1)){
                cond_zile=true;
            }
        }
        let cond_tip = (val_tip == tip_serv || val_tip == "");
        let cond_acc=true;
        for(let acc of val_acc){
            if(acc_serv.includes(acc)){
                cond_acc=false;
                break; //cand gasim cel putin una nu afisam produsul
            }
        }
        if(cond_nume && cond_desc && cond_durata && cond_pret && cond_categ && cond_tip && cond_acc && cond_zile){
            prod.style.display = "block";
            nr_rez+=1;
        } //aplicam filtrele
        //cea de o zi sau mai multe va fi ultima implementata
    }

    if(nr_rez==0){
        document.getElementById("eroarePlaceholder").innerHTML=`<div class="alert alert-danger" role="alert">Nu exista rezultate conform filtrelor!</div>`;
    }

}

function sorteaza(semn){
    var produse=document.getElementsByClassName("produs");
    var v_produse=Array.from(produse); //transformam in vector static si aplicam metode pt vector

    v_produse.sort(function(a,b){
        var pret_a=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
        var pret_b=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
        if(pret_a==pret_b){
            var cat_a=a.getElementsByClassName("val-categorie")[0].innerHTML;
            var cat_b=b.getElementsByClassName("val-categorie")[0].innerHTML;
            return semn*cat_a.localeCompare(cat_b); //-1 0 1 returneaza (ca in C)
        } 
        return (pret_a-pret_b)*semn; //functie comparator
    })
    for (let produs of v_produse){
        produs.parentNode.appendChild(produs);
    }      
}


window.addEventListener("DOMContentLoaded", function(){

    let iduriProduse=localStorage.getItem("cos_virtual");
    iduriProduse=iduriProduse?iduriProduse.split(","):[];      //["3","1","10","4","2"]

    for(let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if(ch){
            ch.checked=true;
        }
        else{
            console.log("id cos virtual inexistent:", idp);
        }
    }

    //aici vine partea de cos virtual

    document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").max})`;
    document.getElementById("filtrare").onclick = filtrare;
 
    document.getElementById("sortCrescNume").onclick=function(){
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sorteaza(-1);
    }

    document.getElementById("resetare").onclick = rst;
});

window.addEventListener("change", function(){
    document.getElementById("inp-categorie").onchange = filtrare;
    document.getElementById("i_datalist").onchange = filtrare;
    document.getElementById("i_sel_multiplu").onchange = filtrare;
    document.getElementById("inp-nume").onchange = filtrare;
    document.getElementById("inp-desc").onchange = filtrare;
    document.getElementById("i_rad1").onchange = filtrare;
    document.getElementById("i_rad2").onchange = filtrare;
    document.getElementById("i_rad3").onchange = filtrare;
    document.getElementById("i_rad4").onchange = filtrare;
    document.getElementById("i_check1").onchange = filtrare;
    document.getElementById("i_check2").onchange = filtrare;
    document.getElementById("inp-pret").onchange = function(){
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        filtrare();
    }//update valoare afisata input range
}); //pe change executa

window.onkeydown = function(e){
    if(document.getElementById("info-suma")){
        return;
    }
    if(e.key=="c" && e.altKey){
        var produse = document.getElementsByClassName("produs");
        let suma=0;
        for(let prod of produse){
            if(prod.style.display!="none"){
                let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                suma+=pret;
            }
        }
        let p = document.createElement("p");
        p.innerHTML=suma;
        p.id="info-suma";
        let ps=document.getElementById("p-suma");
        let container=ps.parentNode;
        let frate=ps.nextElementSibling;
        container.insertBefore(p, frate);
        setTimeout(function(){
            let info = document.getElementById("info-suma");
            if(info){
                info.remove();
            }
        }, 2000);
    }
};

window.addEventListener("resize", function(){
    var w=window.innerWidth
    if(w<=1000){
        document.getElementById("filtrare").innerHTML=`<i class="bi bi-funnel"></i>`
        document.getElementById("sortCrescNume").innerHTML=`<i class="bi bi-sort-numeric-up"></i>`
        document.getElementById("sortDescrescNume").innerHTML=`<i class="bi bi-sort-numeric-down-alt"></i>`
        document.getElementById("resetare").innerHTML=`<i class="bi bi-arrow-clockwise"></i>`
    }else{
        document.getElementById("filtrare").innerHTML=`<i class="bi bi-funnel"></i> Filtreaza`
        document.getElementById("sortCrescNume").innerHTML=`<i class="bi bi-sort-numeric-up"></i> Sorteaza crescator dupa pret si categorie`
        document.getElementById("sortDescrescNume").innerHTML=`<i class="bi bi-sort-numeric-down-alt"></i>Sorteaza descrescator dupa pret si categorie`
        document.getElementById("resetare").innerHTML=`<i class="bi bi-arrow-clockwise"></i> Reseteaza`
    }
})


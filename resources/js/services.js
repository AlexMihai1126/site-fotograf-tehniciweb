function rstErr(){
    document.getElementById("eroarePlaceholder").innerHTML="";
}

function rst(){
    rstErr();
    var produse = document.getElementsByClassName("produs");
    for (let prod of produse){
        prod.style.display = "block";
    }
    document.getElementById("inp-nume").value="";
    document.getElementById("inp-pret").value=document.getElementById("inp-pret").min;
    document.getElementById("inp-categorie").value="toate";
    document.getElementById("i_rad4").checked=true;
    document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").min})`
}

function filtrare(){
    rstErr();
    document.getElementById("inp-pret").onchange = function(){
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }//update valoare afisata input range

    let val_nume = document.getElementById("inp-nume").value.toLowerCase();
    let val_calorii;
    let grup_radio = document.getElementsByName("gr_rad");
    for (let r of grup_radio){
        if(r.checked){
            val_calorii=r.value;
            break;
        }
    }

    var produse = document.getElementsByClassName("produs");
    let nr_rez=0;
    for (let prod of produse){
        prod.style.display = "none";
        let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
        let calorii = prod.getElementsByClassName("val-calorii")[0].innerHTML;
        let cond1 = (nume.startsWith(val_nume));
        let cond2 = true;
        if(val_calorii!="toate"){
            [nra, nrb]=val_calorii.split(":");
            nra=parseInt(nra);
            nrb=parseInt(nrb); //intervalul de calorii
            cond2 = (nra<=calorii && calorii < nrb);
        }
        
        let val_pret = document.getElementById("inp-pret").value;
        let pret = parseInt(prod.getElementsByClassName("val-pret")[0].innerHTML);
        let cond3 = (val_pret<=pret);

        let val_categorie = document.getElementById("inp-categorie").value;
        let categProdus = prod.getElementsByClassName("val-categorie")[0].innerHTML;
        let cond4 = (val_categorie == categProdus || val_categorie == "toate");

        if(cond1 && cond2 && cond3 && cond4){
            prod.style.display = "block";
            nr_rez+=1;
        } //aplicam filtrele
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
            var nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
            var nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
            return semn*nume_a.localeCompare(nume_b); //-1 0 1 returneaza (ca in C)
        } 
        return (pret_a-pret_b)*semn; //functie comparator
    })
    for (let produs of v_produse){
        produs.parentNode.appendChild(produs);
    }      
}

window.onload = function(){
    document.getElementById("infoRange").innerHTML = `(${document.getElementById("inp-pret").min})`;
    document.getElementById("filtrare").onclick = filtrare;
 
    document.getElementById("sortCrescNume").onclick=function(){
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sorteaza(-1);
    }

    document.getElementById("inp-pret").onchange = filtrare;
    document.getElementById("inp-categorie").onchange = filtrare;
    document.getElementById("inp-nume").onchange = filtrare;
    document.getElementById("i_rad1").onchange = filtrare;
    document.getElementById("i_rad2").onchange = filtrare;
    document.getElementById("i_rad3").onchange = filtrare;
    document.getElementById("i_rad4").onchange = filtrare;

    document.getElementById("resetare").onclick = rst;

    document.getElementById("p-suma").style.display="none";
}
/* const optArea = document.getElementById("optArea");
console.log(optArea);
optArea.addEventListener("mouseover", function(event){
    document.getElementById("inp-pret").onchange = filtrare;
    document.getElementById("inp-categorie").onchange = filtrare;
    document.getElementById("inp-nume").onchange = filtrare;
    document.getElementById("i_rad1").onchange = filtrare;
    document.getElementById("i_rad2").onchange = filtrare;
    document.getElementById("i_rad3").onchange = filtrare;
    document.getElementById("i_rad4").onchange = filtrare;
}); */
class Produs{

    constructor({id, nume, descr, pret, imag, durata, categ, tip_p, accesorii, extins, data_ad, locatie}={}) {

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }

    }

}
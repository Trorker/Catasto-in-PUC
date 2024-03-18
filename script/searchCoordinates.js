//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getRegioni&tkn=undefined&callback=jQuery20309342435046069326_1710792627389&_=1710792627390
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getProvince&reg=EMILIA-ROMAGNA&callback=jQuery203002000866046841132_1710792570001&tkn=undefined&_=1710792570003
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getComuniSez&prov=MO&callback=jQuery20309342435046069326_1710792627389&tkn=undefined&_=1710792627392
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getGeomComune&prov=MO&cod_com=B819&callback=jQuery20309342435046069326_1710792627389&tkn=undefined&_=1710792627393

//https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=image&lang=it
//https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=check&captcha=groppuvi

//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getFogli&prov=MO&cod_com=C398&tkn=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getParts&prov=MO&cod_com=C398&foglio=1&tkn=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



//getCookies: https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/catalog.search
//getCaptcha: https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=image&lang=it

let url = "https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/catalog.search";

fetch(url, {
    method: "GET",
    mode: "cors", // same-origin, no-cors
    credentials: "same-origin", // omit, include
}).then(response => {
    if (!response.ok) {
        throw new Error("Errore nella richiesta: " + response.status);
    }
    console.log(response);


    // Ottenere il valore del cookie JSESSIONID dalla risposta
    console.log(response.headers.getSetCookie('set-cookie'));
    console.log(response.headers.get('set-cookie'));
    console.log(response.headers.get('Set-Cookie'));


    // Gestisci la risposta qui, ad esempio leggendo il corpo dell'immagine
}).catch(error => {
    console.error("Si è verificato un errore:", error);
});


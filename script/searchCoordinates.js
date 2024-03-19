//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getRegioni&tkn=undefined&callback=jQuery20309342435046069326_1710792627389&_=1710792627390
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getProvince&reg=EMILIA-ROMAGNA&callback=jQuery203002000866046841132_1710792570001&tkn=undefined&_=1710792570003
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getComuniSez&prov=MO&callback=jQuery20309342435046069326_1710792627389&tkn=undefined&_=1710792627392
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getGeomComune&prov=MO&cod_com=B819&callback=jQuery20309342435046069326_1710792627389&tkn=undefined&_=1710792627393

//https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=image&lang=it
//https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=check&captcha=groppuvi

//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getFogli&prov=MO&cod_com=C398&tkn=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getParts&prov=MO&cod_com=C398&foglio=1&tkn=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=check&captcha=&jsessionid=

//getCookies: https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/catalog.search
//getCaptcha: https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=image&lang=it

//https://gist.github.com/jfromaniello/4087861
//https://gist.github.com/killmenot/9976859


//https://www.geopoi.it/geopoin/php/getData.php?_serv=map
let jws = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6Mjk0NDM2MjAsImVpZCI6Mjk0NDM2MTksImxpZCI6ImJkZDMxODNmYTRiYmRjMWRjN2ZiNTg0MTM1Yzk1MGI3NzY4YmQ4YzYiLCJkIjp7InBwIjp0cnVlfSwicGYiOmZhbHNlLCJleHAiOjE3MTA4NTU4MjQsIm1leHAiOjE3MTA5NDA0MjR9.0Y_1DZ5TqVNwRe_rPpC13M08VgsWWzEN4kg7wn2C8IM";
jws.split(".").map((jws) => {
  console.log(JSON.parse(window.atob(jws)));
})

let url = "https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=image&lang=it";

fetch(url, {
  method: "GET",
  mode: "cors", // cors, same-origin, no-cors
  credentials: "same-origin", //same-origin, omit, include
}).then(response => {
  if (!response.ok) {
    throw new Error("Errore nella richiesta: " + response.status);
  }
  console.log(response);


  // Ottenere il valore del cookie JSESSIONID dalla risposta
  console.log(response.headers.getSetCookie('set-cookie'));
  console.log(response.headers.get('set-cookie'));
  console.log(response.headers.get('Set-Cookie'));


  response.blob().then((blob) => {
    const imageUrl = URL.createObjectURL(blob);
    const image = document.getElementById('imgCaptcha');
    image.src = imageUrl;
  }).catch((error) => {
    console.error("Errore durante la lettura del Blob:", error);
  });
}).catch(error => {
  console.error("Si è verificato un errore:", error);
});

window.sendCaptcha = () => {
  let captcha = document.querySelector("#Captcha").value;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=check&captcha=" + captcha, true);
  xhr.withCredentials = false;
  xhr.send(null);
  xhr.onload = function () {
    if (xhr.status != 200) {
      console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    } else {
      console.log(xhr);
    }
  };
}

const xhr = new XMLHttpRequest();
xhr.open("GET", "https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/Captcha?type=image&lang=it", true);
xhr.withCredentials = false;
xhr.send(null);
xhr.onload = function () {
  if (xhr.status != 200) { // analizza lo status HTTP della risposta
    console.log(`Error ${xhr.status}: ${xhr.statusText}`); // ad esempio 404: Not Found
  } else { // mostra il risultato
    console.log(`Done, got ${xhr.response.length} bytes`); // response contiene la risposta del server
    console.log(xhr);
    console.log(xhr.getResponseHeader('set-cookie'));
    console.log(xhr.getAllResponseHeaders());
  }
};

//https://catastomappe.it/mappa.php



//https://help.opendatasoft.com/apis/csw/#csw-api
//https://geodati.gov.it/geoportale/manuale-rndt
//https://gn.mase.gov.it/portale/servizio-di-ricerca-csw#:~:text=Cos'%C3%A8%20un%20servizio%20di%20ricerca%20CSW&text=Il%20CSW%20(Catalog%20Service%20for,software%20per%20la%20loro%20fruizione.
//https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/catalog.search#/links
//https://csw.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetCapabilities

//https://csw.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecords&QUERY=title:modena&typeNames=csw:Record
//https://csw.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecords&typeNames=csw:Record&resultType=results&ElementSetName=full

/*fetch('https://csw.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/csw?SERVICE=CSW&VERSION=2.0.2&REQUEST=GetRecords&typeNames=csw:Record&resultType=results&ElementSetName=full', {
    method: 'GET',
})
    .then(response => response.text())
    .then(xmlText => {
        // Analizza il documento XML qui
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        // Ora puoi navigare nel documento XML e estrarre le informazioni necessarie
        console.log(xmlDoc);
    })
    .catch(error => {
        console.error('Si è verificato un errore:', error);
    });*/




/*
fetch('https://csw.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/csw')
  .then(response => response.text())
  .then(xmlText => {
    // Analizza il documento XML della risposta
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Trova e stampa le informazioni di ServiceIdentification
    const serviceIdentification = xmlDoc.querySelector('ows\\:ServiceIdentification');
    const title = serviceIdentification.querySelector('ows\\:Title').textContent;
    const abstract = serviceIdentification.querySelector('ows\\:Abstract').textContent;
    console.log('Titolo del servizio:', title);
    console.log('Abstract del servizio:', abstract);

    // Trova e stampa le informazioni di ServiceProvider
    const serviceProvider = xmlDoc.querySelector('ows\\:ServiceProvider');
    const providerName = serviceProvider.querySelector('ows\\:ProviderName').textContent;
    console.log('Provider del servizio:', providerName);

    // Trova e stampa le informazioni sulle operazioni supportate
    const operations = xmlDoc.querySelectorAll('ows\\:Operation');
    console.log('Operazioni supportate:');
    operations.forEach(operation => {
      const operationName = operation.getAttribute('name');
      console.log('-', operationName);
    });

    // Trova e stampa i queryable supportati
    const queryables = xmlDoc.querySelectorAll('ows\\:Parameter[name="sections"] ows\\:Value');
    console.log('Queryable supportati:');
    queryables.forEach(queryable => {
      console.log('-', queryable.textContent);
    });
  })
  .catch(error => {
    console.error('Si è verificato un errore durante il recupero delle capacità:', error);
  });

*/
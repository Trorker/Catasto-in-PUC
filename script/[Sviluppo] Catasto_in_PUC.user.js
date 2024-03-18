// ==UserScript==
// @name        Catasto in PUC [Sviluppo]
// @namespace   https://github.com/Trorker/Catasto-in-PUC
// @version     1.1.3 beta
// @description Aggiunge il catasto nelle mappe PUC
// @author      Ruslan Dzyuba
// @downloadURL https://trorker.github.io/Catasto-in-PUC/script/Catasto_in_PUC.user.js
// @updateURL   https://trorker.github.io/Catasto-in-PUC/script/Catasto_in_PUC.user.js
// @match       https://*u*-it*.*ne*i*t.*/E*i*R*te/*
// @match       https://*u*-it*.*ne*i*t.*/p3/#/P3?*
// @match       https://*u*-it*.*ne*i*t.*/*U*A*e*a/#/AT?*
// @icon        https://ruslan-dzyuba.it/Catasto-in-PUC/resources/img/Catasto_in_PUC.logo.svg
// @require     https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require     https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/proj4leaflet/1.0.2/proj4leaflet.js
// @require     https://trorker.github.io/Catasto-in-PUC/resources/js/library/vComparator.js
// ==/UserScript==

/*
1.1.3: [fix] Sistemato finestra "About" aggiungendo link per il sito web

1.1.X: [add] Aggiungere le "News" aggiungendo un file esterno JSON dove va a pescare le notizie
1.1.X: [add] Aggiungere la ricerca https://photon.komoot.io/
*/

(function () { // @grant       GM_openInTab
    'use strict';

    //Add css
    window.GM_addStyle = (cssStr) => {
        var D = document;
        var newNode = D.createElement('style');
        newNode.textContent = cssStr;

        var targ = D.getElementsByTagName('head')[0] || D.b
        targ.appendChild(newNode);
    }

    window.GM_addStyle(`
                        .swal2-container {-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}
                        .swal2-container a {color: #ff0062 }
                        .swal2-container .link {color: #ff0062; cursor: pointer; }
                        .swal2-container .swal2-popup { background: #4b4e5d; color: #ffffff; }
                        .swal2-container .swal2-footer { border-top: 1px solid #212125; }
                        .swal2-close { box-shadow: none !important; }
                        .swal2-close:hover { color: #ff0062; }
                        .swal2-popup { font-size: larger; }
                        .swal2-styled.swal2-confirm { background-color: #ff0062; }
                        img.swal2-image { border-radius: 50%; }
                        .drop .text,.or{font-weight:500}.drop-container{padding:1.5rem}.drop{border-radius:10px;border:3px dashed #aaa;display:grid;width:100%;place-content:center;padding:2rem;box-sizing:border-box;display:grid;place-items:center}.file-input{display:none !important}.active{border:3px solid grey;background:#ff0f6440}.drop .text{text-align:center;margin-top:1rem;color:white}.progress{background:#ff0f64;width:0%;border-radius:10px;transition:.2s;height:20px}.drop label{background:#ff0f64;padding:.7rem 1.8rem;border-radius:5px;color:white;cursor:pointer}.line{width:80px;height:1px;background:#949494}.or-con{display:flex;align-items:center;margin:.5rem}.or{margin:0 1rem;color:white}
                        .switch::after,.switch::before{content:"";display:inline-flex;position:absolute;border-radius:1em}input.switch{font-size:1.25em;height:.7em;display:inline-flex;align-items:center;width:1.65em;position:relative;margin:.3em 0;cursor:pointer}.switch::before{height:.8em;width:1.4em;padding:0 .2em;background:#bdb9a6;box-shadow:inset 0 .1em .3em rgba(0,0,0,.3);-webkit-transition:.3s;-moz-transition:.3s;transition:.3s}.switch::after{height:1em;width:1em;background:#fff;box-shadow:0 .1em .3em rgba(0,0,0,.3);-webkit-transition:.3s;-moz-transition:.3s;transition:.3s}input.switch:checked::after{-webkit-transform:translateX(80%);-moz-transform:translateX(80%);transform:translateX(80%)}input.switch:checked::before{background:#ff0062}input.switch:disabled::after,input.switch:disabled::before{background:#ccc;cursor:not-allowed}
                        `);

    setInterval(() => {
        let idMap = document.getElementById("map");
        if (idMap && !idMap.getAttribute("exist") && window.global_map) {
            idMap.setAttribute("exist", true);

            console.log("Inject: ", GM_info.script.name, "-version: ", GM_info.script.version);

            window.ScriptUpdate(GM_info.script);

            window.loadMap(window.global_map.maps.leaflet);
        }

    }, 100);

    window.Toast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', window.Swal.stopTimer)
            toast.addEventListener('mouseleave', window.Swal.resumeTimer)
        }
    });

    window.News = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        //showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '<b style="color: #ff0062">Scopri</b>',
        denyButtonText: 'Nascondi',
        cancelButtonText: 'Cancella',
        confirmButtonColor: "#4b4e5d",
        denyButtonColor: "#4b4e5d",
        cancelButtonColor: "#4b4e5d",
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', window.Swal.stopTimer)
            toast.addEventListener('mouseleave', window.Swal.resumeTimer)
        }
    });

    window.ScriptUpdate = (script) => {

        fetch(script.updateURL)
            .then(response => response.text())
            .then((text) => {
                const regex = /\/\/\s+@version\s+(([0-9.]+)[\s+\w+](\w*))/i; // /\/\/\s+@version\s+((\d[+\.\d+])[\s+\w+](\w))/i
                //console.log(text);
                let vLoad = regex.exec(text) || null;
                console.log(vLoad);
                console.log(vComparator.getVersionType(vLoad[1]));
                console.log(vComparator.compareSoftwareVersions(script.version, vLoad[1]));

                switch (vComparator.compareSoftwareVersions(script.version, vLoad[1])) {
                    case (-1):
                        // it's old version
                        window.Swal.fire({
                            title: script.name,
                            icon: 'info',
                            html: "C'è la nuova versione dello script.",
                            showCancelButton: true,
                            cancelButtonText: "Chiudi",
                            confirmButtonText: 'Aggiorna',
                            //allowOutsideClick: false,
                            //preConfirm: (value) => { return false } //cancell event to clouse modal (click button confirm)
                            footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com"> mail</a>',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                var new_window = window.open(script.updateURL + '?t=' + Date.now());//add in 1.1.2
                                new_window.onbeforeunload = () => { location.reload() }
                            }
                        });
                        break;
                    case (1):
                        // it's new version
                        localStorage.removeItem("isDismissed_News_Grid_People_Awards_2023"); //add in 1.1.2
                        window.Swal.fire({
                            icon: 'success',
                            title: "Update Script " + script.name,
                            text: 'Lo script è stato agiornato', //qui inserire le novitÃ . (esposrtarli in un nuova variabile)
                            footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com"> mail</a>',
                        });
                        break;
                    default:
                        // code block
                        console.log("default");
                }

            })
            .catch(err => console.log(err))

        if (localStorage.getItem(script.name)) {
            const Lscript = JSON.parse(localStorage.getItem(script.name));
            switch (vComparator.compareSoftwareVersions(script.version, Lscript.version)) {
                case (-1):
                    // it's old version //https://stackoverflow.com/questions/53369092/can-i-get-a-userscripts-version-and-use-it-on-another-webpage
                    window.Swal.fire({
                        title: script.name,
                        icon: 'info',
                        html: "C'è la nuova versione dello script.",
                        showCancelButton: true,
                        cancelButtonText: "Chiudi",
                        confirmButtonText: 'Aggiorna',
                        //allowOutsideClick: false,
                        //preConfirm: (value) => { return false } //cancell event to clouse modal (click button confirm)
                        footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com"> mail</a>',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            var new_window = window.open(script.updateURL + '?t=' + Date.now());//add in 1.1.2
                            new_window.onbeforeunload = () => { location.reload() }
                        }
                    });
                    break;
                case (1):
                    // it's new version
                    localStorage.removeItem("isDismissed_News_Grid_People_Awards_2023"); //add in 1.1.2
                    window.Swal.fire({
                        icon: 'success',
                        title: "Update Script " + script.name,
                        text: 'Lo script è stato agiornato', //qui inserire le novitÃ . (esposrtarli in un nuova variabile)
                        footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com"> mail</a>',
                    });
                    break;
                default:
                    // code block
                    console.log("default");
            }
        } else {
            window.Swal.fire({
                icon: 'info',
                title: script.name,
                text: 'Grazie per aver installato lo script.',
                footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com"> mail</a>',
            });
        }

        localStorage.setItem(script.name, JSON.stringify(script));
    }

    //Star About
    window.License = () => {
        window.Swal.fire({
            title: 'License',
            html: `<p style="text-align: justify;">
                          MIT License
                          <br><br>Copyright (c) ${new Date().getFullYear()} ${GM_info.script.author}
                          <br><br>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                          <br><br>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                          <br><br>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                    </p>
                `,
            showConfirmButton: false,
            showCloseButton: true,
            //footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com">mail</a>',
        });
    };

    window.qrCode = () => {
        window.Swal.fire({
            title: 'qrCode',
            html: `<p style="text-align: justify;">
                          MIT License
                          <img src="data:image/png;base64,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" alt="qrCode">
                  </p>
                `,
            showConfirmButton: false,
            showCloseButton: true,
            //footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com">mail</a>',
        });
    };

    window.OpenSource = () => {
        const req = (GM_info.script.require).map((require) => { return '<li><a href="' + require + '" target="_blank">' + require.substr(require.lastIndexOf("/") + 1); + '</a></li>' });

        window.Swal.fire({
            title: 'Open-Source resources used',
            html: `<p style="text-align: justify;">
                          In order to develop the <b>${GM_info.script.name}</b> project, external libraries have been employed.
                          <br><br>Below is a comprehensive list of the libraries utilized:
                    </p>
                    <ul style="text-align: left;">${req.join('')}</ul>
                `,
            showConfirmButton: false,
            showCloseButton: true,
            //footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com">mail</a>',
        });
    };

    window.About = async () => {

        var ScriptInfo = GM_info.script;

        window.Swal.fire({
            showConfirmButton: false,
            showCloseButton: true,
            willOpen: async () => {
                window.Swal.showLoading();
                await fetch(ScriptInfo.icon)
                    .then((response) => {
                        if (!response.ok) throw new Error(response.statusText)
                        return response.blob()
                    })
                    .then((blob) => {
                        Swal.update({
                            imageUrl: URL.createObjectURL(blob),
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'GitHub Avatar',
                        });
                    }).catch(error => { /*Swal.showValidationMessage(`Request failed: ${error}`);*/
                        console.error(`Request failed: ${error}`);
                    });
                window.Swal.update({//(<span class="link" onclick="window.Update()">releas notes</span>)
                    title: 'About us',
                    html: `
                              <h3>
                                  <b>${ScriptInfo.name}</b><br>
                                  <i>by&nbsp;&nbsp;</i><a href="https://github.com/trorker" target="_blank"><b>${ScriptInfo.author}</b></a>
                              </h3>
                              <div style="font-size: 0.8em">
                                  <i>Version:&nbsp;${ScriptInfo.version}&nbsp;</i><br>
                                  <a href="https://trorker.github.io/Catasto-in-PUC/" style="text-decoration: none;" target="_blank"><i>Web Site</i></a><br>
                                  <span class="link" onclick="window.OpenSource()"><i>Open-Source resources used</i></span><br>
                                  <span class="link" onclick="window.qrCode()"><i>QrCode</i></span><br>
                                  <span class="link" onclick="window.License()"><i>License</i></span>
                              </div><br><br>
                              `,
                    footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com">mail</a>',
                });
                Swal.hideLoading();
            },
        });
    }
    //End About

    window.getJsonURL = async (url) => {
        const response = await fetch(url);
        return await response.json();
    }

    window.loadMap = (map) => {

        let EPSG_6706 = new window.L.Proj.CRS("EPSG:6706", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs", {
            resolutions: [8192, 4096, 2048, 1024, 512, 256, 128]
        });

        //https://timwhitlock.info/blog/2010/04/google-maps-zoom-scales/

        /*var wmsCatasto=L.tileLayer.wms("https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php",{
        tileSize: new L.Point(512, 512),
        layers:["province","CP.CadastralZoning","CP.CadastralParcel","fabbricati","strade","vestizioni","acque"],
          opacity: .5,
          crs: EPSG_6706,
          format:"image/png",
          minZoom: 6,
          maxZoom:21,
          transparent:true,
          attribution:'Â© <a href="https://creativecommons.org/licenses/by-nc-nd/2.0/it/">Agenzia delle Entrate</a>'}
        );*/

        //!importante dividere in due gruppi, uno qullo trasparente(aree) e uno no (le scrite o confini)
        let wmsCatasto_URL = "https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php?";
        let wmsCatasto_CadastralParcel = L.tileLayer.wms(wmsCatasto_URL, { layers: "CP.CadastralParcel", opacity: .3, crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 17, maxZoom: 20, tileSize: 1024 });
        let wmsCatasto_fabbricati = L.tileLayer.wms(wmsCatasto_URL, { layers: "fabbricati", opacity: .5, crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 17, maxZoom: 20, tileSize: 1024 });
        let wmsCatasto_strade = L.tileLayer.wms(wmsCatasto_URL, { layers: "strade", opacity: .5, crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 17, maxZoom: 20, tileSize: 1024 });
        let wmsCatasto_acque = L.tileLayer.wms(wmsCatasto_URL, { layers: "acque", opacity: .5, crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 17, maxZoom: 20, tileSize: 1024 });
        let wmsCatasto_CadastralZoning = L.tileLayer.wms(wmsCatasto_URL, { layers: "CP.CadastralZoning", crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 13, maxZoom: 20, tileSize: 1024 });
        let wmsCatasto_vestizioni = L.tileLayer.wms(wmsCatasto_URL, { layers: "vestizioni", crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 18, maxZoom: 20, tileSize: 1024 });
        let wmsCatasto_province = L.tileLayer.wms(wmsCatasto_URL, { layers: "province", crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 6/*minZoom parte la mappa, non ÃƒÂ¨ piu in linea*/, maxZoom: 20, /*tileSize: 1024,*/ attribution: '© <a href="https://creativecommons.org/licenses/by-nc-nd/2.0/it/">Agenzia delle Entrate</a>' });

        let wmsCatasto_Aree = L.tileLayer.wms(wmsCatasto_URL, { layers: ["CP.CadastralParcel", "fabbricati", "strade", "acque"], opacity: .5, crs: EPSG_6706, format: "image/png", transparent: true, minZoom: 17, maxZoom: 20, tileSize: 1024 });

        let overlayMaps = {
            //"Particelle catastali": wmsCatasto_CadastralParcel,
            //"Fabbricati": wmsCatasto_fabbricati,
            //"Strade": wmsCatasto_strade,
            //"Acque": wmsCatasto_acque,
            "Province": wmsCatasto_province,//NO opacity
            "Fogli catastali": wmsCatasto_CadastralZoning,//NO opacity
            "Numeri particelle": wmsCatasto_vestizioni,//NO opacity
            "Aree": wmsCatasto_Aree,
        };

        //Add automatic "Recupero del Tile non caricato."
        Object.values(overlayMaps).map(layer => {
            layer.on('tileerror', (e) => {
                console.log("Recupero del Tile non caricato.");
                e.tile.src = e.tile.src + "&time=" + new Date().getTime();
                e.tile.onload = function () { ////BETA add in 1.0.8
                    console.log("Tile recuperato.");
                    e.tile.classList.add("leaflet-tile-loaded");
                }
            });
        });

        let Catasto = L.layerGroup(Object.values(overlayMaps));

        map.addEventListener('click', async (e) => { //contextmenu
            if (map.hasLayer(Catasto)) {
                var lat = Math.round(e.latlng.lat * 100000) / 100000;
                var lng = Math.round(e.latlng.lng * 100000) / 100000;
                console.log(lat + ", " + lng);

                document.body.style.cursor = "progress";

                try {
                    //https://nominatim.openstreetmap.org/reverse?lat=<value>&lon=<value>&<params>
                    const nominatim = await window.getJsonURL(`https://nominatim.openstreetmap.org/reverse?lon=${lng}&lat=${lat}&format=json&accept-language=it`);
                    console.log(nominatim); //fare una funzione dove verifica la variabile, se non ÃƒÂ¨ definita ti restituise altro valore es.  nominatim.address.house_number | "Nan"

                    let datiCatasto = await window.getJsonURL(`https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getDatiOggetto&lon=${lng}&lat=${lat}`);
                    console.log(datiCatasto);

                    //https://stackoverflow.com/questions/387942/google-street-view-url
                    //http://web.archive.org/web/20110903160743/http://mapki.com/wiki/Google_Map_Parameters#Street_View
                    //https://maps.google.com/maps?q=barcelona&amp;aq=f&amp;ie=UTF8&amp;hl=es&amp;hq=&amp;hnear=Barcelona,+Catalu%C3%B1a&amp;ll=41.385064,2.173404&amp;spn=0.32884,0.727158&amp;t=h&amp;z=11&amp;layer=c&amp;cbll=41.384233,2.177893&amp;panoid=cHQCwlORibRoxMqj2m9IVg&amp;cbp=12,0,,0,0&amp;source=embed&amp;output=svembed
                    //https://maps.google.com/maps?layer=c&amp;cbll={latitude},{longitude}&amp;cbp=,{bearing},{tilt},{zoom},{pitch}&amp;source=embed&amp;output=svembed
                    //const url = `https://maps.google.com/maps?layer=c&amp;cbll=${lat + ", " + lng}&amp;cbp=12,0,0,0,0&amp;source=embed&amp;output=svembed`;
                    //let GoogleStreetView = `<iframe width="100%" height="200" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${url}"></iframe>`;


                    let datiCatastoTxt = datiCatasto.TIPOLOGIA == "PARTICELLA" ? `<b>&#128220;: ${datiCatasto.DENOM}<br>&#128209;: Foglio ${datiCatasto.FOGLIO} Mappale ${datiCatasto.NUM_PART}</b>` : `<b>${datiCatasto.COMUNI} ${datiCatasto.TIPOLOGIA}</b>`;
                    let datiIndirizzoTxt = `<span>&#128234;: ${nominatim.address.road}, ${nominatim.address.house_number | 0} - ${nominatim.address.postcode} ${nominatim.address.town} (${nominatim.address["ISO3166-2-lvl6"].substr(nominatim.address["ISO3166-2-lvl6"].indexOf("-") + 1, 2)})</span>`;
                    let datiCoordinateTxt = `<i>&#128204;: ${lat}, ${lng}</i>`;
                    let datiAuthorTxt = `<b style="font-size: 0.8em;"><i onclick="window.About()" style="color: #ff0f64; cursor: pointer">by Ruslan</i>&nbsp;&#169;</b>`;
                    let datiLicenceTxt = `<a href="https://osm.org/copyright" style="font-size: 0.6rem" target="_blank">Data © OpenStreetMap contributors, ODbL 1.0.</a>`;
                    let content = `${datiCatastoTxt}<br><br>${datiIndirizzoTxt}<br>${datiCoordinateTxt}<br><br>${datiAuthorTxt} - ${datiLicenceTxt}`; //<div style="height: 200px" id="GoogleStreetView"></div>

                    L.popup().setLatLng(e.latlng).setContent(content).openOn(map);

                    /*const panorama = new google.maps.StreetViewPanorama( //https://developers.google.com/maps/documentation/javascript/streetview?hl=it
                        document.getElementById("GoogleStreetView"), //<div style="height: 200px" id="GoogleStreetView"></div>
                        {
                            position: { lat, lng },
                            linksControl: false,
                            panControl: false,
                            enableCloseButton: false,
                            zoomControl: false,
                            fullscreenControl: false,
                            addressControl: false,
                        },
                    );*/
                } catch (error) {
                    console.error(error);
                }

                document.body.style.cursor = "default";
            }
        });

        L.Control.Button = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: (map) => {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                var button = L.DomUtil.create('a', 'leaflet-control-button', container);

                container.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    console.log("Impostazioni ", e);

                    window.About();
                });

                container.style.cssText = "background-color: white; text-align: center; padding: 4px; font-size: 15px;";
                button.title = GM_info.script.name;
                button.style.cssText = "cursor: pointer;";
                button.style.backgroundImage = "url(" + GM_info.script.icon + ")";

                map.on('layeradd', (e) => {
                    if (map.hasLayer(Catasto)) {
                        container.style.border = '2px solid #ff0062';
                    } else {
                        container.style.border = '';
                    }
                });
                map.on('layerremove', (e) => {
                    if (map.hasLayer(Catasto)) {
                        container.style.border = '2px solid #ff0062';
                    } else {
                        container.style.border = '';
                    }
                });

                L.DomEvent.disableClickPropagation(button);

                L.DomEvent.on(button, 'click', () => {
                    if (map.hasLayer(Catasto)) {
                        map.removeLayer(Catasto);
                        container.style.border = '';
                    } else {
                        Catasto.addTo(map);
                        container.style.border = '2px solid #ff0062';

                        Object.values(Catasto._layers).map(layer => {
                            layer.bringToFront();
                        });

                        global_map.tileOverlays.gisOverlay.proprietary_tileOverlay.bringToFront(); //BETA add in 1.0.6


                        if (new Date().getTime() <= new Date("2023-11-10T23:59:59.000Z").getTime() && !localStorage.getItem("isDismissed_News_Grid_People_Awards_2023")) {//add in 1.1.2
                            window.News.fire({
                                icon: 'info',
                                title: 'il progetto “Mappe catastali in PUC” è stato candidato sulla piattaforma WeGrid all’interno di "Grid People Awards 2023"'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    const dataUrl = "aHR0cHM6Ly93ZWdyaWQuZW5lbC5jb20vaXQvY29tcG9uZW50L3pvby9pdGVtL251b3ZvLWFzc3VudG8tbnVvdmUtaWRlZS1udW92YS1tYXBwYS03NGE4ZjNlZGEw";
                                    window.open(window.atob(dataUrl), '_blank').focus();
                                }
                                if (result.isDismissed) {
                                    localStorage.setItem("isDismissed_News_Grid_People_Awards_2023", true);
                                };
                            });
                        }

                    }
                });

                return container;
            },
            onRemove: (map) => { },
        });
        var control = new L.Control.Button()
        control.addTo(map);

    }
})();
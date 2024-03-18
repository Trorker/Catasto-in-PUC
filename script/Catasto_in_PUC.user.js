// ==UserScript==
// @name        Catasto in PUC
// @namespace   https://github.com/Trorker/Catasto-in-PUC
// @version     1.1.2 alpha
// @description Aggiunge il catasto nelle mappe PUC
// @author      Ruslan Dzyuba
// @downloadURL https://trorker.github.io/Catasto-in-PUC/script/Catasto_in_PUC.user.js
// @updateURL   https://trorker.github.io/Catasto-in-PUC/script/Catasto_in_PUC.user.js
// @match       https://*u*-it*.*ne*i*t.*/E*i*R*te/*
// @match       https://*u*-it*.*ne*i*t.*/p3/#/P3?*
// @icon        https://ruslan-dzyuba.it/Catasto-in-PUC/resources/img/Catasto_in_PUC.logo.svg
// @require     https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require     https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/proj4leaflet/1.0.2/proj4leaflet.js
// @require     https://trorker.github.io/Catasto-in-PUC/resources/js/library/vComparator.js
// ==/UserScript==

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
                window.Swal.update({ //(<span class="link" onclick="window.Update()">releas notes</span>)
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
                                    window.open("https://wegrid.enel.com/it/component/zoo/item/nuovo-assunto-nuove-idee-nuova-mappa-74a8f3eda0", '_blank').focus();
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

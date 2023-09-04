// ==UserScript==
// @name        Catasto in PUC
// @namespace   https://github.com/trorker
// @version     1.0.8
// @description Aggiunge il catasto nelle mappe PUC
// @author      Ruslan Dzyuba
// @match       https://puc-ita.enelint.global/EditRete/*
// @match       https://puc-ita.enelint.global/p3/#/P3?*
// @icon        https://raw.githubusercontent.com/Trorker/MyTools/main/resource/img/Catasto_in_PUC.logo.svg
// @require     https://cdn.jsdelivr.net/npm/sweetalert2@11
// @require     https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.5.0/proj4.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/proj4leaflet/1.0.2/proj4leaflet.js
// ==/UserScript==


(function () {
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
                        .swal2-close { box-shadow: none !important; }
                        .swal2-close:hover { color: #ff0062; }
                        .swal2-popup { font-size: larger; }
                        .swal2-styled.swal2-confirm { background-color: #ff0062; }
                        img.swal2-image { border-radius: 50%; }
                        div:where(.swal2-container) div:where(.swal2-footer) { border-top: 1px solid #212125; }
                        div:where(.swal2-container) div:where(.swal2-popup) { background: #4b4e5d; color: #ffffff; }
                        `);

    setInterval(() => {
        let idMap = document.getElementById("map");
        if (idMap && !idMap.getAttribute("exist") && window.global_map) {
            idMap.setAttribute("exist", true);

            console.log("Inject: ", GM_info.script.name, "-version: ", GM_info.script.version);

            window.loadMap(window.global_map.maps.leaflet);
        }

    }, 100);

    window.Update = (script) => {
        window.Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'The feature is still in development.',
            showConfirmButton: false,
            showCloseButton: true,
        });
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
        });
    };

    window.OpenSource = () => {
        const req = (GM_info.script.require).map((require) => { return '<li><a href="' + require + '" target="_blank">' + require.substr(require.lastIndexOf("/") + 1); + '</a></li>' });

        window.Swal.fire({
            title: 'Open-Source resources used',
            html: `<p style="text-align: justify;">
                          In order to develop the <b>${GM_info.script.name}</b> project, external libraries have been employed.
                          <br><br>Below is a comprehensive list of the libraries utilized
                    </p>
                    <ul style="text-align: left;">${req.join('')}</ul>
                `,
            showConfirmButton: false,
            showCloseButton: true,
        });
    };

    window.About = async () => {

        var ScriptInfo = GM_info.script;
        console.log(GM_info);

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
                            imageAlt: 'Script icon',
                        });
                    }).catch(error => { /*Swal.showValidationMessage(`Request failed: ${error}`);*/
                        console.error(`Request failed: ${error}`);
                    });
                window.Swal.update({
                    html: `
                              <h3>
                                  <b>${ScriptInfo.name}</b><br>
                                  <i>by&nbsp;&nbsp;</i><a href="https://github.com/trorker" target="_blank"><b>${ScriptInfo.author}</b></a>
                              </h3>
                              <div style="font-size: 0.8em">
                                  <i>Version:&nbsp;${ScriptInfo.version}&nbsp;(<a href="javascript:window.Update()">releas notes</a>)</i><br>
                                  <a href="javascript:window.OpenSource()"><i>Open-Source resources used</i></a><br>
                                  <a href="javascript:window.License()"><i>License</i></a>
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

        var Catasto = L.layerGroup(Object.values(overlayMaps));

        let leyers = {
            'Catasto&nbsp;<b style="font-size: 0.8em;"><i onclick="window.About()" style="color: #ff0f64; cursor: pointer">by Ruslan</i>&nbsp;&#169;</b>': Catasto,
            //"test": wmsCatasto
        };

        var layerControl = L.control.layers(null, leyers, { position: "bottomleft", collapsed: false }).addTo(map); //bottomleft

        map.on('overlayadd', (e) => {
            console.log(e);
            //wmsCatasto.bringToFront();
            Object.values(e.layer._layers).map(layer => {
                layer.bringToFront();
            });

            global_map.tileOverlays.gisOverlay.proprietary_tileOverlay.bringToFront(); //BETA add in 1.0.6

        });

        map.addEventListener('click', async (e) => { //contextmenu
            if (map.hasLayer(Catasto)) {
                var lat = Math.round(e.latlng.lat * 100000) / 100000;
                var lng = Math.round(e.latlng.lng * 100000) / 100000;
                console.log(lat + ", " + lng);

                document.body.style.cursor = "progress";

                //https://nominatim.openstreetmap.org/reverse?lat=<value>&lon=<value>&<params>
                const nominatim = await window.getJsonURL(`https://nominatim.openstreetmap.org/reverse?lon=${lng}&lat=${lat}&format=json`);
                console.log(nominatim); //fare una funzione dove verifica la variabile, se non ÃƒÂ¨ definita ti restituise altro valore es.  nominatim.address.house_number | "Nan"

                let datiCatasto = await window.getJsonURL(`https://wms.cartografia.agenziaentrate.gov.it/inspire/ajax/ajax.php?op=getDatiOggetto&lon=${lng}&lat=${lat}`);
                console.log(datiCatasto);

                let datiCatastoTxt = datiCatasto.TIPOLOGIA == "PARTICELLA" ? `<b>&#128220;: ${datiCatasto.DENOM}<br>&#128209;: Foglio ${datiCatasto.FOGLIO} Mappale ${datiCatasto.NUM_PART}</b>` : `<b>${datiCatasto.COMUNI} ${datiCatasto.TIPOLOGIA}</b>`;
                let datiIndirizzoTxt = `<span>&#128234;: ${nominatim.address.road}, ${nominatim.address.house_number | 0} - ${nominatim.address.postcode} ${nominatim.address.town} (${nominatim.address["ISO3166-2-lvl6"].substr(nominatim.address["ISO3166-2-lvl6"].indexOf("-") + 1, 2)})</span>`;
                let datiCoordinateTxt = `<i>&#128204;: ${lat}, ${lng}</i>`;
                let datiAuthorTxt = `<b style="font-size: 0.8em;"><i onclick="window.About()" style="color: #ff0f64; cursor: pointer">by Ruslan</i>&nbsp;&#169;</b>`;
                let datiLicenceTxt = `<a href="https://osm.org/copyright" style="font-size: 0.6rem">Data © OpenStreetMap contributors, ODbL 1.0.</a>`;
                let content = `${datiCatastoTxt}<br><br>${datiIndirizzoTxt}<br>${datiCoordinateTxt}<br><br>${datiAuthorTxt} - ${datiLicenceTxt}`;

                L.popup().setLatLng(e.latlng).setContent(content).openOn(map);

                document.body.style.cursor = "default";
            }
        });
    }
})();

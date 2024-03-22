// ==UserScript==
// @name        Catasto in PUC
// @namespace   https://github.com/Trorker/Catasto-in-PUC
// @version     1.2.0
// @description Aggiunge il catasto nelle mappe PUC
// @author      Ruslan Dzyuba
// @downloadURL https://ruslan-dzyuba.it/Catasto-in-PUC/script/Catasto_in_PUC.user.js
// @updateURL   https://ruslan-dzyuba.it/Catasto-in-PUC/script/Catasto_in_PUC.user.js
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

            window.Deprecated();

            //window.ScriptUpdate(GM_info.script);

            //window.loadMap(window.global_map.maps.leaflet);
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

      window.Deprecated = async () => {

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
                    //title: 'About us',
                    html: `
                              <h3>
                                  <b>${ScriptInfo.name}</b><br>
                                  <i>by&nbsp;&nbsp;</i><a href="https://github.com/trorker" target="_blank"><b>${ScriptInfo.author}</b></a><br>
                                  <a href="https://trorker.github.io/Catasto-in-PUC/" style="text-decoration: none; font-size: 0.8em" target="_blank"><i>Web Site</i></a><br>
                              </h3>
                              <div style="font-size: 0.8em; text-align: justify;">
                                <i>Carissimi utenti,</i>
                                <p>Con profonda gratitudine per il vostro supporto e utilizzo, desidero informarvi che abbiamo preso la decisione di <b style="color: #ff6ba4">interrompere il supporto e lo sviluppo</b> dello script che implementa le mappe catastali sulla piattaforma cartografica PUC.</p>
                                <p>Questa decisione è stata presa a seguito della recente <b style="color: #ff6ba4">integrazione ufficiale</b> della funzionalità catasto sulla piattaforma. Di conseguenza, non saremo più in grado di garantire l'efficacia e l'aggiornamento dello script non ufficiale.</p>
                                <p>Pertanto, vi chiediamo cortesemente di <b style="color: #ff6ba4">disinstallare l'estensione</b> "Violentmonkey" dal vostro browser Chrome.</p>
                                <p><b style="color: #ff6ba4">Vogliamo ringraziarvi sinceramente</b> per aver utilizzato il nostro servizio e per il vostro costante supporto. Il vostro feedback e la vostra partecipazione sono stati fondamentali per noi. Non esitate a contattarci se avete domande o necessitate di assistenza.</p>
                                <p>Grazie ancora e cordiali saluti,</p>
                              </div><br><br>
                              `,
                    footer: '<span>Vuoi contattare lo sviluppatore</span>...manda una&nbsp;<a href="mailto:ruslan.dzyuba@e-distribuzione.com">mail</a>',
                });
                Swal.hideLoading();
            },
        });
    }
    //End About
})();

// ==UserScript==
// @name        Change image background PUC
// @namespace   Violentmonkey Scripts
// @match       https://puc-ita.enelint.global/ERLogin/
// @grant       none
// @version     1.0
// @author      -
// @description 5/7/2023, 13:36:59
// @require     https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js
// ==/UserScript==

(async () => {
    'use strict';

    let form = document.querySelector("form.form-signin"); //https://hype4.academy/tools/glassmorphism-generator
    form.style.cssText = `
        background: rgba( 255, 255, 255, 0.35 );
        box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 );
        backdrop-filter: blur( 4px );
        -webkit-backdrop-filter: blur( 4px );
        border-radius: 10px;
        border: 1px solid rgba( 255, 255, 255, 0.18 );
      `;

    document.body.style.backgroundImage = "none";
    document.body.style.cssText = `
      background: rgb(63,94,251);
      background: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
    `;

    await fetch("https://picsum.photos/1920/1080?random")
        .then((response) => {
            if (!response.ok) throw new Error(response.statusText)
            return response.blob()
        })
        .then((blob) => {

            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(blob);

            document.body.style.backgroundImage = `url(${imageUrl})`;

            const colorThief = new ColorThief();
            let img = document.createElement('img');
            img.onload = (e) => {
                const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
                    const hex = x.toString(16)
                    return hex.length === 1 ? '0' + hex : hex
                }).join('');

                const addAlpha = (color, opacity) => {
                    var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
                    return color + _opacity.toString(16).toUpperCase();
                }

                function invertColor(hex, bw) {
                    if (hex.indexOf('#') === 0) {
                        hex = hex.slice(1);
                    }
                    // convert 3-digit hex to 6-digits.
                    if (hex.length === 3) {
                        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                    }
                    if (hex.length !== 6) {
                        throw new Error('Invalid HEX color.');
                    }
                    var r = parseInt(hex.slice(0, 2), 16),
                        g = parseInt(hex.slice(2, 4), 16),
                        b = parseInt(hex.slice(4, 6), 16);
                    if (bw) {
                        // https://stackoverflow.com/a/3943023/112731
                        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                            ? '#000000'
                            : '#FFFFFF';
                    }
                    // invert color components
                    r = (255 - r).toString(16);
                    g = (255 - g).toString(16);
                    b = (255 - b).toString(16);
                    // pad each with zeros and return
                    return "#" + padZero(r) + padZero(g) + padZero(b);
                }

                function padZero(str, len) {
                    len = len || 2;
                    var zeros = new Array(len).join('0');
                    return (zeros + str).slice(-len);
                }

                let hexColor = rgbToHex(...colorThief.getColor(img));


                let form = document.querySelector("form.form-signin");
                form.style.background = addAlpha(hexColor, 0.5);
                form.style.color = invertColor(hexColor, true);
            }
            img.src = imageUrl;

        }).catch(error => { /*Swal.showValidationMessage(`Request failed: ${error}`);*/
            console.error(`Request failed: ${error}`);
        });

})();

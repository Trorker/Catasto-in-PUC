const stickNavbar = () => {
    var navbar = document.getElementById("navbar");
    //document.documentElement.style.setProperty("--navbar-height", `${navbar.offsetHeight}px`);
    var sticky = navbar.offsetTop;
    (window.scrollY >= sticky) ? navbar.classList.add("sticky") : navbar.classList.remove("sticky");
    window.onscroll = () => {
        (window.scrollY >= sticky) ? navbar.classList.add("sticky") : navbar.classList.remove("sticky");
    };
}

const SmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", (e) => {
            e.preventDefault();

            let getHref = (element) => {
                const href = element.getAttribute("href");
                if (href == null) return getHref(element.parentNode);
                return href;
            }

            const targetId = getHref(e.target).substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: "smooth"
                });

                // Aggiungi l'hash all'URL dopo lo smooth scrolling
                history.pushState(null, null, "#" + targetId);
            }
        });
    });
}

const installScript = (e) => {
    const dataUrl = "aHR0cHM6Ly9lbmVsY29tLnNoYXJlcG9pbnQuY29tLzp1Oi9yL3NpdGVzL1Byb2dyYW1zL0RvY3VtZW50aSUyMGNvbmRpdmlzaS9TY3JpcHRzL0NhdGFzdG8lMjBpbiUyMFBVQy9yZWxlYXNlL0NhdGFzdG9faW5fUFVDLnVzZXIuanM="; 

    window.open(window.atob(dataUrl), '_blank').focus();
}

const feedback = (e) => {
    var oggetto = document.getElementById("subject");
    var messaggio = document.getElementById("body");

    oggetto.setAttribute("aria-invalid", (!oggetto.value));
    messaggio.setAttribute("aria-invalid", (!messaggio.value));

    if (!messaggio.value) {
        messaggio.setCustomValidity("Questo campo è obbligatorio!");
        messaggio.reportValidity();
    }

    if (!oggetto.value) {
        oggetto.setCustomValidity("Questo campo è obbligatorio!");
        oggetto.reportValidity();
    }

    if (oggetto.value && messaggio.value) { 
        const to = "ruslan.dzyuba@e-distribuzione.com";
        const subject = `[FeedBack] - ${oggetto.value} - [Catasto in PUC]`;
        const body = `${messaggio.value}`;
        const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
        window.open(mailto);
    }
}



window.onload = () => {
    stickNavbar();
    SmoothScrolling();
}
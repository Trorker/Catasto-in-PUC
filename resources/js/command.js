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

const feedback = (e) => {
    //e.preventDefault();

    var oggetto = document.getElementById("subject");
    var messaggio = document.getElementById("body");

    oggetto.setAttribute("aria-invalid", (!oggetto.value));
    messaggio.setAttribute("aria-invalid", (!messaggio.value));

    if (oggetto.value && messaggio.value) {
        const mailto = `mailto:ruslan.dzyuba@e-distribuzione.com?subject=${oggetto.value}&body=${messaggio.value}`;
        window.open(mailto);
    }
}



window.onload = () => {
    stickNavbar();
    SmoothScrolling();

    //document.getElementById("feedback-form").addEventListener("submit", feedback);
}
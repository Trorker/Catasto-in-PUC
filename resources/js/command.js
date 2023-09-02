const stickNavbar = () => {
    var navbar = document.getElementById("navbar");
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
            }
        });
    });
}

window.onload = () => {
    stickNavbar();
    SmoothScrolling();
}
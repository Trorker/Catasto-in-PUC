//Fork by https://basicons.xyz/embed.js

document.querySelectorAll("[class*='icon-']").forEach(async (el) => {
    let iconName
    el.classList.forEach((className) => {
        if (className.startsWith('icon-')) {
            iconName = className.replace("icon-", "");
        }
    })

    try {
        const resp = await fetch(`resources/img/icons/${iconName}.svg`
        )
        if (!resp.ok) {
            throw new Error('failed to load icon ' + iconName)
        } else {
            el.innerHTML = await resp.text()
        }
    } catch (error) {
        console.log(error)
    }
})
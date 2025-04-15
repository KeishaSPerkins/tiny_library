'use strict'
const events = ["click", "mousemove"]
function addScreenSaverElements() {
    const root = qs("html:not(iframe):not(iframe body)")
    const parentElement = root.length > 1 ? root[0] : root
    const wrapper = createElement("div", { "class": "wrapper screensaver" }, parentElement)
    const bouncerX = createElement("div", { "class": "bouncer X" }, ".wrapper.screensaver")
    const bouncerY = createElement("div", { "class": "bouncer Y" }, ".bouncer.X")

}
function addClockElements() {
    const clock = createElement("section", { class: "clock" }, ".wrapper.screensaver")
    const time = createElement("time", { class: "clock__time" }, ".wrapper.screensaver .clock")
    const innerClock = createElement("span", { id: "js-clock" }, ".wrapper.screensaver .clock .clock__time")
}
function runClock() {
    const el = qs("#js-clock")
    // Ensure the element exists
    if (!el) return
    /** Time Format */
    const timeFormat = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    })

    /** Render Util */
    const render = (template, node) => {
        if (!node) return
        node.textContent = typeof template === "function" ? template() : template
        const event = new CustomEvent("elementRenderer", { bubbles: true })
        node.dispatchEvent(event)
    }

    /** Pass vars to out Render Util */
    render(timeFormat, el)
}
function addStyles() {
    const styleTag = createElement("link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/KeishaSPerkins/tiny_library/Screensaver/styles.min.css" }, ".screensaver.wrapper")
}
function manageScreenSaver() {
    let wrapper = qs(".screensaver.wrapper")
    hideScreenSaver(wrapper)
    debounce(() => showScreenSaver(wrapper), 15000)()
}
function initializeScreenSaver() {
    addScreenSaverElements()
    addClockElements()
    addStyles()
    window.setInterval(runClock, 1000)
    manageScreenSaver(0)
    events.forEach((evt) => window.addEventListener(evt, manageScreenSaver))
}

function showScreenSaver(item) {
    if (getSettings().screensaver) {
        item.classList.add("show")
    }
}
function hideScreenSaver(item) {
    item.classList.remove("show")

}

function listens(type, selector, callback, options = {}, parent = null) {
    window.addEventListener(
        type,
        e => {
            if (e.target.matches(selector)) callback(e)
        },
        options
    )
}
(function(){
    initializeScreenSaver();
    listens('change', ".toggle_item input[type='checkbox']", (d) => { setSetting(d.target.value, d.target.checked ? true : false) })
})();

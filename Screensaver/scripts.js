
(function () {
    'use strict'
    let allow = true
    const events = ["click", "mousemove"]
    const $ = (q, p = null) => {
        const e = [...(p || document).querySelectorAll(q)]
        if (e.length > 1) { return e }
        return e[0]
    }
    const addScreenSaverElements = () => {
        const wrapper = document.createElement("div")
        const bouncerX = document.createElement("div")
        const bouncerY = document.createElement("div")
        const root = $("html:not(iframe):not(iframe body)")
        const parentElement = root.length > 1 ? root[0] : root

        wrapper.className = "wrapper screensaver"
        bouncerX.className = "bouncer X"
        bouncerY.className = "bouncer Y"

        bouncerX.appendChild(bouncerY)
        wrapper.appendChild(bouncerX)
        parentElement.appendChild(wrapper)
    }
    const addClockElements = () => {
        const clock = document.createElement("section")
        const time = document.createElement("time")
        const innerClock = document.createElement("span")

        clock.className = "clock"
        time.className = "clock__time"
        innerClock.id = "js-clock"

        time.appendChild(innerClock)
        clock.appendChild(time)
        $(".wrapper").appendChild(clock)
    }
    const runClock = () => {
        const el = $("#js-clock")

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
    const addStyles = () => {
        const styleString = [`
  `]
        const styleTag = document.createElement("style")
        const styleText = document.createTextNode(styleString[0])
        styleTag.appendChild(styleText)
        $(".screensaver.wrapper").appendChild(styleTag)
    }
    const debounce = (callback, delay = 20000) => {
        let timeout
        return () => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                callback()
            }, delay)
        }
    }
    const manageScreenSaver = () => {
        let wrapper = $(".screensaver.wrapper")
        wrapper.classList.remove("show")
        debounce(() => { wrapper.classList.add("show") })()
    }
    const initializeScreenSaver = () => {
        addScreenSaverElements()
        addClockElements()
        addStyles()
        window.setInterval(runClock, 1000)
        manageScreenSaver(0)
        events.forEach((evt) => window.addEventListener(evt, manageScreenSaver))
    }

    if (allow) { initializeScreenSaver() }

})()
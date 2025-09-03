
function colorMode(){
  let root =  document.querySelector("html")
  let theme = root.getAttribute("data-bs-theme")
  let accent = "pink"
  root.setAttribute("data-accent-color", accent)
  root.setAttribute("data-bs-theme", "dark")
  // if(theme == "light"){root.setAttribute("data-bs-theme", "dark")}
  // else{root.setAttribute("data-bs-theme", "light")}
}
colorMode()
document.querySelectorAll("details").forEach(d => { d.setAttribute("open", "")})


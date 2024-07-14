const menuBtn = document.querySelector("#profile-btn")
const menu = document.querySelector("#menu");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("hide");
})

document.addEventListener("click", e => {
  if (!menu.contains(e.target) && e.target !== menuBtn) {
    menu.classList.add("hide");
  }
})
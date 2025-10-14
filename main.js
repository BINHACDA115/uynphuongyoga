// Toggle navbar
const toggle = document.querySelector(".toggle-button");
const collapses = document.querySelectorAll(".collapse");

toggle.addEventListener("click", () => {
  collapses.forEach(col => col.classList.toggle("collapse-toggle"));
});

// Swiper initialization
new Swiper(".swiper-container", {
  loop: true,
  slidesPerView: 3,
  spaceBetween: 20,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  pagination: { el: ".swiper-pagination", clickable: true },
  navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
  breakpoints: {
    320: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }
});

// Sticky navbar
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  header.classList.toggle("sticky", window.scrollY > 50);
});

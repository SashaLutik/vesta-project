/* бесконечная карусель */
const slider = document.querySelector(".hero__slider");
const dots = document.querySelectorAll(".hero__dot");
const slides = document.querySelectorAll(".hero__slide").length;

let currentIndex = 0;

const firstSlideClone = slider.firstElementChild.cloneNode(true);
slider.appendChild(firstSlideClone);

setInterval(() => {
  currentIndex++;
  slider.style.transition = "0.8s";
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;

  const dotIndex = currentIndex % slides;
  dots.forEach((dot, index) => {
    dot.classList.toggle("hero__dot--active", index === dotIndex);
  });

  if (currentIndex === slides) {
    setTimeout(() => {
      slider.style.transition = "none";
      slider.style.transform = "translateX(0)";
      currentIndex = 0;
      dots.forEach((dot, index) => {
        dot.classList.toggle("hero__dot--active", index === 0);
      });
    }, 800);
  }
}, 3000);

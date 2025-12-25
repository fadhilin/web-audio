function getData() {
  fetch("./assets/data.json")
    .then((response) => response.json())
    .then((items) => {
      const cards = [];
      const productList = document.getElementById("productList");

      items.forEach((item) => {
        const card = document.createElement("div");
        const href = `detail.html?id=${encodeURIComponent(item.id)}`;

        card.className = "product";
        card.style.backgroundImage = `url(${item.image})`;
        card.innerHTML = ` 
        
          <div class="card-text">
            <h1 class="title">${item.title}</h1>
            <p class="subtitle">${item.subtitle}</p>

          <div class= "card-stats">
        
            <div class ="stats">
              <span class="label">Warna</span>
              <span class="value">${item.color}</span>
            </div>
            <div class ="stats">
              <span class="label">Baterai</span>
              <span class="value">${item.battery}</span>
            </div>
            <div class ="stats">
              <span class="label">Bobot</span>
              <span class="value">${item.weight}</span>
            </div>
            <div class ="stats">
              <span class="label">Latency</span>
              <span class="value">${item.latency}</span>
            </div>
            <div class ="stats">
              <span class="label">Price</span>
              <span class="value">${item.price}</span>
            </div>
          </div>
        </div>

        `;

        const content = card.querySelector(".card-text");
        if (content)
          content.onclick = () => {
            window.location.href = href;
          };

        productList.appendChild(card);
        cards.push(card);
      });

      function reveal() {
        for (const card of cards) {
          const { top, bottom } = card.getBoundingClientRect();

          if (
            top < window.innerHeight * 0.85 &&
            bottom > window.innerHeight * 0.15
          ) {
            card.classList.add("show");
          }
        }
      }

      reveal();
      window.addEventListener("scroll", reveal, { passive: true });
      window.addEventListener("resize", reveal);
    });
}

getData();

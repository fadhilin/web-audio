function getDetail() {
  const productDetail = document.getElementById("productDetail");

  const params = new URLSearchParams(location.search);
  const productID = params.get("id");

  if (!productID) {
    productDetail.textContent = "ID Tidak Ditemukan!";
    return;
  }

  fetch("./assets/data.json")
    .then((response) => response.json())
    .then((data) => {
      const item = data.find((row) => row.id === productID);
      if (!item) {
        productDetail.textContent = "Produk Tidak Ditemukan!";
        return;
      }

      productDetail.innerHTML = `
    <div class= "detail-card">
        <div class= "detail-hero" style="background-image: url('${item.image}')"></div>
            <div class= "detail-body">
            <a href="index.html" class="back">&#8592; Kembali</a>   
            <h1>${item.title}</h1>
            <p>${item.subtitle}</p>
                <div id="detailBody"></div>

                    <div class="detail-stats">
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
    </div>  
  `;

      const detailBody = document.getElementById("detailBody");
      const paraghraps = (item.detail_description || "").split(/\n+/);
      paraghraps.forEach((text) => {
        const trimmed = text.trim();
        const p = document.createElement("p");
        p.textContent = trimmed;
        detailBody.appendChild(p);
      });
    });
}

getDetail();

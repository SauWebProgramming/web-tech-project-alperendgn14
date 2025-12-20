// DOM Elementlerini Seçme
const container = document.getElementById('media-container');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const navHome = document.getElementById('nav-home');
const navFavorites = document.getElementById('nav-favorites');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

// Global Değişkenler
let allMedia = [];
let isFavoritesView = false;

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await fetchData();
    fillCategories();
    renderMedia(allMedia);
}

// Veri Çekme (Fetch API)
async function fetchData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) throw new Error('Veri çekilemedi');
        allMedia = await response.json();
    } catch (error) {
        console.error('Hata:', error);
        container.innerHTML = '<p>Veriler yüklenirken bir hata oluştu.</p>';
    }
}

// Ekrana Yazdırma (Render)
function renderMedia(list) {
    container.innerHTML = ''; // Önce temizle

    if (list.length === 0) {
        container.innerHTML = '<p>Aradığınız kriterlere uygun içerik bulunamadı.</p>';
        return;
    }

    list.forEach(item => {
        const card = document.createElement('article');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="card-info">
                <h3>${item.title}</h3>
                <p>${item.category} | ${item.year}</p>
                <div class="rating">★ ${item.rating}</div>
            </div>
        `;
        // Karta tıklayınca detayı aç
        card.addEventListener('click', () => openDetail(item));
        container.appendChild(card);
    });
}

// 3. Arama ve Filtreleme
function filterMedia() {
    // Favorilerdeysem favori listesi üzerinden, değilse ana liste üzerinden filtrele
    let sourceList = isFavoritesView ? getFavorites() : allMedia;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    const filtered = sourceList.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderMedia(filtered);
}

// Event Listener'lar
searchInput.addEventListener('input', filterMedia);
categorySelect.addEventListener('change', filterMedia);

// 4. Detay Sayfası (Modal/SPA)
function openDetail(item) {
    const favorites = getFavorites();
    const isFav = favorites.some(fav => fav.id === item.id);
    const btnText = isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle';

    modalBody.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="detail-img">
        <div class="detail-info">
            <h2>${item.title} (${item.year})</h2>
            <p><strong>Kategori:</strong> ${item.category}</p>
            <p><strong>Puan:</strong> ${item.rating}/10</p>
            <p class="desc">${item.description}</p>
            <button class="fav-btn" onclick="toggleFavorite(${item.id})">${btnText}</button>
        </div>
    `;
    modal.classList.remove('hidden');
}

// Modalı Kapatma
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// 5. Favoriler ve LocalStorage
function getFavorites() {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
}

// Not: HTML onclick attribute'u ile çağrıldığı için window objesine atıyorm.
window.toggleFavorite = function(id) {
    let favorites = getFavorites();
    const item = allMedia.find(m => m.id === id);
    
    const exists = favorites.some(fav => fav.id === id);

    if (exists) {
        favorites = favorites.filter(fav => fav.id !== id);
        alert('Favorilerden çıkarıldı.');
    } else {
        favorites.push(item);
        alert('Favorilere eklendi.');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    

    // Basitlik için modalı kapatıyorum.
    modal.classList.add('hidden');
    
    // Eğer favoriler sekmesindeysem listeyi yenile
    if(isFavoritesView) {
        renderMedia(favorites);
    }
};

// Menü Yönetimi
navHome.addEventListener('click', (e) => {
    e.preventDefault();
    isFavoritesView = false;
    navHome.classList.add('active');
    navFavorites.classList.remove('active');
    searchInput.value = ''; // Aramayı sıfırla
    categorySelect.value = 'all';
    renderMedia(allMedia);
});

navFavorites.addEventListener('click', (e) => {
    e.preventDefault();
    isFavoritesView = true;
    navFavorites.classList.add('active');
    navHome.classList.remove('active');
    searchInput.value = '';
    categorySelect.value = 'all';
    const favs = getFavorites();
    renderMedia(favs);
});


// Kategorileri Otomatik Doldurma Fonksiyonu
function fillCategories() {
    const select = document.getElementById('category-select');
    
    //Tüm medyalardan sadece kategori isimlerini al
    const categories = allMedia.map(item => item.category);
    
    // Tekrarlayanları temizle
    const uniqueCategories = [...new Set(categories)];

    //Her kategori için bir option oluştur
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}
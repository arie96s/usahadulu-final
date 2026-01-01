// js/main.js

// 1. FUNGSI INISIALISASI
window.addEventListener('load', () => {
    // A. Handle Preloader
    const preloader = document.getElementById('preloader');
    if(preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 300); 
    }
    
    // B. Handle UI Bahasa & WA
    updateLanguageUI();
    updateWALinks();
    
    // C. Set Tombol Bahasa
    const toggleBtn = document.getElementById('langToggle');
    if(toggleBtn) toggleBtn.setAttribute('data-lang', siteData.currentLang);

    // D. Active Menu State
    const currentPath = window.location.pathname.split("/").pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.menu-title');
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.style.color = '#ffffff';
            link.style.fontWeight = '900';
            link.style.borderBottom = '1px solid #fff';
        }
    });

    bindHoverEvents();
    
    // E. Render Halaman Spesifik
    if (document.getElementById('dynamicServiceList')) renderServices();
    if (document.getElementById('faqContent')) renderFAQ();
    if (document.getElementById('portfolioGrid')) {
        renderPortfolio('all');
        renderFilters();
    }
    if (document.getElementById('paymentList')) renderPayments();
    if (document.getElementById('testimonialGrid')) {
        renderTestimonials(); // Render data bawaan
        loadLocalReviews();   // MODIFIKASI: Render data inputan user
        setupReviewStars(); 
    }
});

// 2. LOGIC BAHASA
function toggleLanguage() {
    siteData.currentLang = siteData.currentLang === 'id' ? 'en' : 'id';
    localStorage.setItem('usahadulu_lang', siteData.currentLang);

    const toggleBtn = document.getElementById('langToggle');
    if(toggleBtn) toggleBtn.setAttribute('data-lang', siteData.currentLang);
    
    updateLanguageUI();
    if(document.getElementById('dynamicServiceList')) renderServices();
    if(document.getElementById('faqContent')) renderFAQ();
    updateWALinks();
}

function updateLanguageUI() {
    const lang = siteData.currentLang;
    const t = siteData.translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });
    const aboutText = document.getElementById('aboutText');
    if(aboutText) aboutText.innerHTML = t.about_desc;
}

// 3. LOGIC WHATSAPP
function updateWALinks() {
    const floatBtn = document.getElementById('waFloatBtn');
    if(!floatBtn) return;
    const lang = siteData.currentLang;
    const phone = "6282283687565"; 
    const msg = encodeURIComponent(lang === 'id' ? "Halo, saya ingin bertanya jasa desain." : "Hello, I want to ask about design services.");
    floatBtn.href = `https://wa.me/${phone}?text=${msg}`;
}

// 4. CUSTOM CURSOR
const cursor = document.getElementById('cursor');
function bindHoverEvents() {
    if(!cursor) return;
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, .menu-title, .social-icon-btn');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        target.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}
document.addEventListener('mousemove', (e) => {
    if(cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

// 5. MENU NAVIGASI
const menuBtn = document.getElementById('menuBtn');
const navOverlay = document.getElementById('navOverlay');
const mainHeader = document.getElementById('mainHeader');

function toggleMenu() {
    if(!menuBtn) return;
    menuBtn.classList.toggle('active');
    navOverlay.classList.toggle('open');
    mainHeader.classList.toggle('menu-active');
    document.body.classList.toggle('no-scroll');
    
    const logoImg = document.getElementById('headerLogoImg');
    if (logoImg) {
        logoImg.src = navOverlay.classList.contains('open') ? 'img/logo_web.png' : 'img/logo_ambigram.png';
    }
}
if(menuBtn) menuBtn.addEventListener('click', toggleMenu);

// 6. FUNGSI RENDER
function renderServices() {
    const container = document.getElementById('dynamicServiceList');
    if(!container) return;
    container.innerHTML = '';
    const lang = siteData.currentLang;
    siteData.services.forEach(svc => {
        const name = lang === 'id' ? svc.name_id : svc.name_en;
        const desc = lang === 'id' ? svc.desc_id : svc.desc_en;
        const t = siteData.translations[lang];
        let tableRows = '';
        svc.packages.forEach(pkg => { tableRows += `<tr><td>${pkg.item}</td><td>${pkg.price}</td></tr>`; });
        
        const li = document.createElement('li');
        li.className = 'service-wrapper';
        li.innerHTML = `
            <div class="service-header hover-target" onclick="this.classList.toggle('active'); this.nextElementSibling.style.maxHeight = this.classList.contains('active') ? this.nextElementSibling.scrollHeight + 'px' : null;">
                <span class="service-name-main">${name}</span>
                <span class="service-icon-state">▼</span>
            </div>
            <div class="service-body">
                <p class="service-desc">${desc}</p>
                <table class="price-table">${tableRows}</table>
                <div class="service-btn-wrapper">
                    <a href="https://wa.me/6282283687565?text=Order%20${name}" target="_blank" class="service-action-btn hover-target">${t.btn_order_now}</a>
                </div>
            </div>`;
        container.appendChild(li);
    });
    bindHoverEvents();
}

function renderFAQ() {
    const container = document.getElementById('faqContent');
    if(!container) return;
    container.innerHTML = '';
    const lang = siteData.currentLang;
    siteData.faq.forEach(item => {
        const q = lang === 'id' ? item.q_id : item.q_en;
        const a = lang === 'id' ? item.a_id : item.a_en;
        container.innerHTML += `<div class="faq-item"><span class="faq-q">${q}</span><span class="faq-a">${a}</span></div>`;
    });
}

function renderPortfolio(cat) {
    const grid = document.getElementById('portfolioGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const items = cat === 'all' ? siteData.portfolio : siteData.portfolio.filter(i => i.category === cat);
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'portfolio-item hover-target';
        let imgSrc = item.fileName; 
        if(!imgSrc.includes('http')) imgSrc = 'img/' + imgSrc; 
        else imgSrc = item.demoUrl; 
        div.onclick = () => openLightbox(imgSrc, item.title);
        div.innerHTML = `<img src="${imgSrc}" loading="lazy"><div class="portfolio-tag">${item.category.toUpperCase()}</div>`;
        grid.appendChild(div);
    });
    bindHoverEvents();
}

function renderFilters() {
    const container = document.getElementById('filterContainer');
    if(!container) return;
    container.innerHTML = '<button class="filter-btn hover-target active" onclick="renderPortfolio(\'all\')">ALL</button>';
    siteData.filters.forEach(c => {
        container.innerHTML += `<button class="filter-btn hover-target" onclick="renderPortfolio('${c}')">${c.toUpperCase()}</button>`;
    });
}

function renderPayments() {
    const container = document.getElementById('paymentList');
    if(!container) return;
    const categories = {};
    siteData.payments.forEach(pay => {
        if (!categories[pay.cat]) categories[pay.cat] = [];
        categories[pay.cat].push(pay);
    });
    container.innerHTML = '';
    for (const [catName, items] of Object.entries(categories)) {
        let itemsHtml = '';
        items.forEach(item => {
            if (item.cat === 'QRIS') {
                itemsHtml += `
                    <div class="qris-wrapper">
                        <div class="qris-placeholder">QR CODE</div>
                        <span style="display:block;margin-top:10px;font-size:12px;color:#000;font-weight:bold;">SCAN QRIS</span>
                    </div>`;
            } else {
                itemsHtml += `
                    <div class="payment-item hover-target">
                        <div class="bank-info">
                            <span class="bank-name">${item.type}</span>
                            <span class="bank-number">${item.number}</span>
                            <span class="bank-holder">A.N ${item.holder}</span>
                        </div>
                        <button class="copy-btn hover-target" onclick="navigator.clipboard.writeText('${item.number}').then(()=>alert('Copied!'))">COPY</button>
                    </div>`;
            }
        });
        const catDiv = document.createElement('div');
        catDiv.className = 'payment-category';
        catDiv.innerHTML = `
            <div class="payment-cat-header hover-target" onclick="this.classList.toggle('active'); this.nextElementSibling.style.maxHeight = this.classList.contains('active') ? this.nextElementSibling.scrollHeight + 'px' : null;">
                <span class="payment-cat-title">${catName}</span>
                <span class="payment-cat-icon">▼</span>
            </div>
            <div class="payment-cat-body">${itemsHtml}</div>
        `;
        container.appendChild(catDiv);
    }
    bindHoverEvents();
}

// 7. REVIEW SYSTEM (MODIFIED: POST TO PAGE)
let currentRating = 0;
function setupReviewStars() {
    const stars = document.querySelectorAll('.star-icon');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const val = parseInt(this.getAttribute('data-val'));
            currentRating = val;
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-val'));
                if (sVal <= val) s.classList.add('active');
                else s.classList.remove('active');
            });
            document.getElementById('reviewFormContainer').style.display = 'block';
        });
    });
}

function renderTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if(!grid) return;
    grid.innerHTML = '';
    // Render data bawaan dari data.js
    siteData.testimonials.forEach(t => {
        grid.innerHTML += createTestimonialHTML(t.name, t.brand, t.quote);
    });
}

// MODIFIKASI: Helper untuk membuat HTML Testimonial
function createTestimonialHTML(name, brand, quote) {
    return `<div class="testi-card">
                <div class="testi-quote">${quote}</div>
                <span class="testi-author">${name}</span>
                <span class="testi-brand">${brand}</span>
            </div>`;
}

// MODIFIKASI: Submit sekarang menyimpan ke LocalStorage dan menambah DOM
function submitReview() {
    const nameInput = document.getElementById('reviewName');
    const typeInput = document.getElementById('reviewType');
    const commentInput = document.getElementById('reviewComment');

    const name = nameInput.value;
    const brand = typeInput.value;
    const comment = commentInput.value;

    if (!name || !brand || !comment) {
        alert("Harap isi semua kolom ulasan.");
        return;
    }

    // Buat Objek Review Baru
    const newReview = { name, brand, quote: comment, rating: currentRating };

    // 1. Tambah ke Grid (DOM) secara langsung
    const grid = document.getElementById('testimonialGrid');
    const newHtml = createTestimonialHTML(name, brand, comment);
    // Masukkan di paling atas grid (setelah elemen pertama jika mau, atau append)
    // Kita taruh di awal agar terlihat user
    grid.insertAdjacentHTML('afterbegin', newHtml);

    // 2. Simpan ke LocalStorage agar tidak hilang saat refresh
    saveReviewToLocal(newReview);

    // 3. Reset Form
    alert("Terima kasih! Ulasan Anda telah diposting.");
    nameInput.value = '';
    typeInput.value = '';
    commentInput.value = '';
    document.getElementById('reviewFormContainer').style.display = 'none';
    currentRating = 0;
    document.querySelectorAll('.star-icon').forEach(s => s.classList.remove('active'));
}

// MODIFIKASI: Fungsi Load/Save LocalStorage
function saveReviewToLocal(reviewObj) {
    let savedReviews = JSON.parse(localStorage.getItem('usahadulu_reviews') || '[]');
    savedReviews.push(reviewObj);
    localStorage.setItem('usahadulu_reviews', JSON.stringify(savedReviews));
}

function loadLocalReviews() {
    const grid = document.getElementById('testimonialGrid');
    if(!grid) return;
    let savedReviews = JSON.parse(localStorage.getItem('usahadulu_reviews') || '[]');
    // Loop dan masukkan ke grid (reverse agar yang terbaru di atas jika mau)
    savedReviews.reverse().forEach(t => {
        grid.insertAdjacentHTML('afterbegin', createTestimonialHTML(t.name, t.brand, t.quote));
    });
}

// 8. LIGHTBOX
function openLightbox(src, title) {
    const modal = document.getElementById('lightboxModal');
    if(modal) {
        document.getElementById('lightboxImg').src = src;
        document.getElementById('lightboxTitle').innerText = title;
        modal.classList.add('show');
    }
}
function closeLightboxOnly() {
    const modal = document.getElementById('lightboxModal');
    if(modal) modal.classList.remove('show');
}

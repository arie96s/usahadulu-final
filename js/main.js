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
    if (document.getElementById('paymentList')) {
        renderPayments();
        renderOrderSummary(); // Render Ringkasan Order
    }
    if (document.getElementById('testimonialGrid')) {
        renderTestimonials(); 
        loadLocalReviews();   
        setupReviewStars(); 
    }

    // F. Handle Halaman Order (Jika ada)
    if (document.getElementById('orderForm')) {
        initOrderPage();
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
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, .menu-title, .social-icon-btn, input, select, textarea');
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

// 6. FUNGSI RENDER SERVICES (MODIFIKASI LINK ORDER)
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
        svc.packages.forEach(pkg => { 
            // Tambahkan link ke order.html dengan parameter
            const orderLink = `order.html?service=${encodeURIComponent(name)}&package=${encodeURIComponent(pkg.item)}&price=${encodeURIComponent(pkg.price)}`;
            
            tableRows += `
                <tr>
                    <td>${pkg.item}</td>
                    <td>${pkg.price}</td>
                    <td style="text-align:right;">
                        <a href="${orderLink}" class="mini-order-btn hover-target">ORDER</a>
                    </td>
                </tr>`; 
        });
        
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

// 7. REVIEW SYSTEM
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
    siteData.testimonials.forEach(t => {
        grid.innerHTML += createTestimonialHTML(t.name, t.brand, t.quote);
    });
}

function createTestimonialHTML(name, brand, quote) {
    return `<div class="testi-card">
                <div class="testi-quote">${quote}</div>
                <span class="testi-author">${name}</span>
                <span class="testi-brand">${brand}</span>
            </div>`;
}

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

    const newReview = { name, brand, quote: comment, rating: currentRating };
    const grid = document.getElementById('testimonialGrid');
    const newHtml = createTestimonialHTML(name, brand, comment);
    grid.insertAdjacentHTML('afterbegin', newHtml);
    saveReviewToLocal(newReview);

    alert("Terima kasih! Ulasan Anda telah diposting.");
    nameInput.value = '';
    typeInput.value = '';
    commentInput.value = '';
    document.getElementById('reviewFormContainer').style.display = 'none';
    currentRating = 0;
    document.querySelectorAll('.star-icon').forEach(s => s.classList.remove('active'));
}

function saveReviewToLocal(reviewObj) {
    let savedReviews = JSON.parse(localStorage.getItem('usahadulu_reviews') || '[]');
    savedReviews.push(reviewObj);
    localStorage.setItem('usahadulu_reviews', JSON.stringify(savedReviews));
}

function loadLocalReviews() {
    const grid = document.getElementById('testimonialGrid');
    if(!grid) return;
    let savedReviews = JSON.parse(localStorage.getItem('usahadulu_reviews') || '[]');
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

// 9. LOGIC HALAMAN ORDER (NEW)
function initOrderPage() {
    // Ambil parameter dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service') || '-';
    const pkg = urlParams.get('package') || '-';
    const price = urlParams.get('price') || 'TBD';

    // Auto-fill form
    document.getElementById('orderService').value = service;
    document.getElementById('orderPackage').value = pkg;
    document.getElementById('orderPrice').value = price;
}

// FUNGSI SUBMIT ORDER & GENERATE PDF
window.submitOrder = function() {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const email = document.getElementById('clientEmail').value;
    const brief = document.getElementById('clientBrief').value;
    const service = document.getElementById('orderService').value;
    const pkg = document.getElementById('orderPackage').value;
    const price = document.getElementById('orderPrice').value;

    if(!name || !phone || !email) {
        alert("Mohon lengkapi data diri Anda.");
        return;
    }

    // A. Simpan ke LocalStorage untuk halaman Payment
    const orderData = { name, phone, email, brief, service, pkg, price, date: new Date().toLocaleDateString() };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // B. Generate PDF (Client Side)
    // Note: logo_ambigram.png harus accessible
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Style Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("USAHADULU STUDIO", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Visual Solutions | Dumai City", 105, 28, null, null, "center");
    doc.line(20, 32, 190, 32); // Horizontal line

    // Order Details
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE / ORDER SHEET", 20, 45);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    let y = 60;
    const content = [
        ["Date", orderData.date],
        ["Client Name", name],
        ["Phone/WA", phone],
        ["Email", email],
        ["Service Category", service],
        ["Package Selected", pkg],
        ["Price Estimate", price],
        ["Project Brief", brief]
    ];

    content.forEach(row => {
        doc.setFont("helvetica", "bold");
        doc.text(row[0] + ":", 20, y);
        doc.setFont("helvetica", "normal");
        // Handle multiline text for Brief
        if(row[0] === "Project Brief") {
            const splitBrief = doc.splitTextToSize(row[1], 120);
            doc.text(splitBrief, 70, y);
            y += (splitBrief.length * 7); 
        } else {
            doc.text(row[1], 70, y);
            y += 10;
        }
    });

    y += 10;
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("*Please proceed to payment to confirm your order.", 20, y);
    doc.text("*Upload proof of transfer on the payment page.", 20, y+5);

    // Save PDF
    doc.save(`Order_${name}_USAHADULU.pdf`);

    // C. Redirect to Payment
    setTimeout(() => {
        window.location.href = "payment.html";
    }, 1500); // Delay sedikit agar download PDF mulai
};

// 10. RENDER ORDER SUMMARY DI HALAMAN PAYMENT
function renderOrderSummary() {
    const container = document.getElementById('orderSummaryContainer');
    if(!container) return;

    const data = JSON.parse(localStorage.getItem('currentOrder'));
    if(!data) {
        container.innerHTML = '<p style="color:#666; font-style:italic;">Belum ada pesanan aktif. Silakan pilih layanan terlebih dahulu.</p>';
        return;
    }

    container.innerHTML = `
        <div class="summary-card">
            <h3 class="summary-title">RINGKASAN PESANAN</h3>
            <div class="summary-row"><span>Nama Klien:</span> <strong>${data.name}</strong></div>
            <div class="summary-row"><span>Paket:</span> <strong>${data.service} - ${data.pkg}</strong></div>
            <div class="summary-row total"><span>TOTAL TAGIHAN:</span> <strong>${data.price}</strong></div>
            <p class="summary-note">Silakan transfer DP 50% atau Pelunasan ke salah satu rekening di bawah.</p>
        </div>
        
        <div class="confirm-upload-section">
            <h3 class="summary-title" style="margin-top:20px;">KONFIRMASI PEMBAYARAN</h3>
            <p style="font-size:12px; color:#888; margin-bottom:15px;">Lampirkan bukti transfer agar pesanan diproses.</p>
            <input type="file" id="proofFile" class="file-input hover-target">
            <button class="confirm-btn hover-target" onclick="sendConfirmation()">KIRIM KONFIRMASI (WHATSAPP)</button>
        </div>
    `;
}

window.sendConfirmation = function() {
    const data = JSON.parse(localStorage.getItem('currentOrder'));
    if(!data) { alert("Data order tidak ditemukan."); return; }
    
    // Karena kita tidak punya backend untuk upload file, kita arahkan user ke WA
    // User akan diminta melampirkan file PDF/Gambar manual di WA
    const msg = `Halo Admin USAHADULU,%0A%0ASaya sudah melakukan pembayaran untuk order:%0A- Nama: ${data.name}%0A- Paket: ${data.service} (${data.pkg})%0A- Total: ${data.price}%0A%0ABerikut saya lampirkan bukti transfer dan File Order PDF. Mohon diproses. Terima kasih.`;
    
    window.open(`https://wa.me/6282283687565?text=${msg}`, '_blank');
};

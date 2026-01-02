{
type: uploaded file
fileName: main.js
fullContent:
// js/main.js

// 1. FUNGSI INISIALISASI
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if(preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }, 300); 
    }
    
    updateLanguageUI();
    updateWALinks();
    
    const toggleBtn = document.getElementById('langToggle');
    if(toggleBtn) toggleBtn.setAttribute('data-lang', siteData.currentLang);

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
    
    if (document.getElementById('dynamicServiceList')) renderServices();
    if (document.getElementById('faqContent')) renderFAQ();
    if (document.getElementById('portfolioGrid')) {
        renderPortfolio('all');
        renderFilters();
    }
    if (document.getElementById('paymentGatewayContainer')) {
        renderOrderSummary(); 
    }
    if (document.getElementById('testimonialGrid')) {
        renderTestimonials(); 
        loadLocalReviews();   
        setupReviewStars(); 
    }
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

// 3. LOGIC WHATSAPP (Diupdate agar ada di semua page)
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

// 6. RENDER SERVICES
function renderServices() {
    const container = document.getElementById('dynamicServiceList');
    if(!container) return;
    container.innerHTML = '';
    const lang = siteData.currentLang;
    siteData.services.forEach(svc => {
        const name = lang === 'id' ? svc.name_id : svc.name_en;
        const desc = lang === 'id' ? svc.desc_id : svc.desc_en;
        
        let tableRows = '';
        svc.packages.forEach(pkg => { 
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

// 7. PORTFOLIO & CASE STUDY
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
        
        // Pass item object to openCaseStudy
        div.onclick = () => openCaseStudy(item, imgSrc);
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

// 8. CASE STUDY MODAL LOGIC
function openCaseStudy(item, imgSrc) {
    const modal = document.getElementById('lightboxModal');
    if(!modal) return;
    
    // Default data if no case study info
    const cs = item.caseStudy || { client: "-", problem: "-", solution: "-", result: "-" };
    
    const contentHtml = `
        <div class="modal-content case-study-content">
            <div class="close-modal hover-target" onclick="closeLightboxOnly()">×</div>
            <h2 class="modal-title">${item.title}</h2>
            
            <div class="case-study-grid">
                <div class="case-study-img">
                    <img src="${imgSrc}" alt="${item.title}">
                </div>
                <div class="case-study-details">
                    <h3>CLIENT</h3>
                    <p>${cs.client}</p>
                    
                    <h3>PROBLEM</h3>
                    <p>${cs.problem}</p>
                    
                    <h3>SOLUTION</h3>
                    <p>${cs.solution}</p>
                    
                    <h3>RESULT</h3>
                    <p>${cs.result}</p>
                    
                    <a href="services.html" class="service-action-btn hover-target" style="margin-top:20px;">START SIMILAR PROJECT</a>
                </div>
            </div>
        </div>
    `;
    
    // Replace content inside modal
    modal.innerHTML = contentHtml;
    modal.classList.add('show');
    bindHoverEvents();
}

function closeLightboxOnly() {
    const modal = document.getElementById('lightboxModal');
    if(modal) modal.classList.remove('show');
}

// 9. REVIEW SYSTEM
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
        grid.innerHTML += `<div class="testi-card"><div class="testi-quote">${t.quote}</div><span class="testi-author">${t.name}</span><span class="testi-brand">${t.brand}</span></div>`;
    });
}

function submitReview() {
    // Simplified logic
    alert("Terima kasih! Ulasan Anda telah diposting.");
    document.getElementById('reviewFormContainer').style.display = 'none';
}

function loadLocalReviews() {
    // Placeholder
}

// 10. ORDER & PAYMENT LOGIC (UPDATED FOR XENDIT SIMULATION)
function initOrderPage() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById('orderService').value = urlParams.get('service') || '-';
    document.getElementById('orderPackage').value = urlParams.get('package') || '-';
    document.getElementById('orderPrice').value = urlParams.get('price') || 'TBD';
}

window.submitOrder = function() {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const service = document.getElementById('orderService').value;
    const pkg = document.getElementById('orderPackage').value;
    const price = document.getElementById('orderPrice').value;

    if(!name || !phone) { alert("Data tidak lengkap!"); return; }

    const orderData = { name, phone, service, pkg, price };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // Simulate PDF generation & Redirect
    alert("Invoice Generated! Redirecting to Payment...");
    setTimeout(() => { window.location.href = "payment.html"; }, 500);
};

// XENDIT DEMO RENDERER
function renderOrderSummary() {
    const container = document.getElementById('paymentGatewayContainer');
    const data = JSON.parse(localStorage.getItem('currentOrder'));
    
    if(!data) {
        container.innerHTML = '<p>No active order.</p>';
        return;
    }

    container.innerHTML = `
        <div class="summary-card">
            <h3 class="summary-title">RINGKASAN PESANAN</h3>
            <div class="summary-row"><span>Nama:</span> <strong>${data.name}</strong></div>
            <div class="summary-row"><span>Paket:</span> <strong>${data.service} (${data.pkg})</strong></div>
            <div class="summary-row total"><span>TOTAL:</span> <strong>${data.price}</strong></div>
        </div>
        
        <button class="payment-gateway-trigger hover-target" onclick="openXenditDemo('${data.price}')">
            ${siteData.currentLang === 'id' ? 'BAYAR VIA XENDIT (QRIS/PAYPAL)' : 'PAY VIA XENDIT (QRIS/PAYPAL)'}
        </button>
    `;
}

window.openXenditDemo = function(price) {
    const modal = document.getElementById('lightboxModal');
    const html = `
        <div class="modal-content xendit-modal-body">
            <div class="x-header">
                <span class="x-logo">xendit</span>
                <span class="x-amount">${price}</span>
            </div>
            <div class="x-content">
                <span class="x-label">VIRTUAL ACCOUNT (Not Available)</span>
                
                <span class="x-label">QR CODE</span>
                <div class="x-option hover-target" onclick="alert('Redirecting to QRIS...')">
                    <div class="x-icon">QRIS</div>
                    <div class="x-name">QRIS (GoPay, OVO, Dana)</div>
                </div>
                
                <span class="x-label">E-WALLET / GLOBAL</span>
                <div class="x-option hover-target" onclick="alert('Redirecting to PayPal...')">
                    <div class="x-icon">PP</div>
                    <div class="x-name">PayPal International</div>
                </div>
            </div>
            <div class="x-footer">
                Powered by Xendit Payment Gateway (Demo Mode)
            </div>
            <button onclick="closeLightboxOnly()" style="width:100%; padding:10px; background:#eee; border:none; color:#333; cursor:pointer;">CANCEL</button>
        </div>
    `;
    modal.innerHTML = html;
    modal.classList.add('show');
}
}
/* ===================================================================
   AMINE FISH RESTAURANT - MAIN JAVASCRIPT
   =================================================================== */

(function() {
    'use strict';

    // ===== MOBILE NAVIGATION =====
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i, span');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.textContent = '✕';
                } else {
                    icon.textContent = '☰';
                }
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i, span');
                if (icon) icon.textContent = '☰';
            });
        });
    }

    // ===== STICKY NAVBAR =====
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 61, 94, 0.98)';
                navbar.style.padding = '0.5rem 0';
            } else {
                navbar.style.background = 'rgba(15, 61, 94, 0.95)';
                navbar.style.padding = '1rem 0';
            }
        });
    }

    // ===== FADE-IN ANIMATION =====
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => observer.observe(el));
    } else {
        // Fallback - show all elements
        fadeElements.forEach(el => el.classList.add('visible'));
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ===== ACTIVE NAV LINK =====
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ===== SET MIN DATE FOR RESERVATIONS =====
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
        dateInput.value = minDate;
    }

    // ===== GALLERY LIGHTBOX =====
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const caption = item.querySelector('span');
                if (!img) return;

                // Create lightbox
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <button class="lightbox-close" aria-label="Close">&times;</button>
                        <img src="${img.src}" alt="${img.alt || ''}">
                        ${caption ? `<div class="lightbox-caption">${caption.textContent}</div>` : ''}
                    </div>
                `;
                document.body.appendChild(lightbox);
                document.body.style.overflow = 'hidden';

                // Fade in
                requestAnimationFrame(() => {
                    lightbox.style.opacity = '1';
                });

                // Close handlers
                const close = () => {
                    lightbox.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(lightbox);
                        document.body.style.overflow = '';
                    }, 300);
                };

                lightbox.querySelector('.lightbox-close').addEventListener('click', close);
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) close();
                });

                document.addEventListener('keydown', function escHandler(e) {
                    if (e.key === 'Escape') {
                        close();
                        document.removeEventListener('keydown', escHandler);
                    }
                });
            });
        });
    }

    // ===== LANGUAGE SWITCH (Simple AR/EN) =====
    const langSwitch = document.querySelector('.lang-switch');
    if (langSwitch) {
        langSwitch.addEventListener('click', () => {
            const isEnglish = document.body.classList.contains('en');
            if (isEnglish) {
                // Switch to Arabic
                document.body.classList.remove('en');
                document.documentElement.lang = 'ar';
                document.documentElement.dir = 'rtl';
                langSwitch.textContent = 'EN';
                localStorage.setItem('lang', 'ar');
            } else {
                // Switch to English
                document.body.classList.add('en');
                document.documentElement.lang = 'en';
                document.documentElement.dir = 'ltr';
                langSwitch.textContent = 'AR';
                localStorage.setItem('lang', 'en');
            }
        });

        // Load saved language
        const savedLang = localStorage.getItem('lang');
        if (savedLang === 'en') {
            langSwitch.click();
        }
    }

    // ===== RESERVATION FORM =====
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(reservationForm);
            const data = Object.fromEntries(formData);

            // Validate
            const requiredFields = ['name', 'phone', 'date', 'time', 'guests'];
            const missing = requiredFields.filter(field => !data[field] || data[field].trim() === '');

            if (missing.length > 0) {
                showFormMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            // Validate phone (Moroccan format)
            const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
            const cleanPhone = data.phone.replace(/\s/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                showFormMessage('error', 'يرجى إدخال رقم هاتف مغربي صحيح');
                return;
            }

            // Validate date (must be future)
            const selectedDate = new Date(data.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showFormMessage('error', 'يرجى اختيار تاريخ مستقبلي');
                return;
            }

            // Save to localStorage
            const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
            const newReservation = {
                id: 'RES-' + Date.now(),
                ...data,
                createdAt: new Date().toISOString(),
                status: 'pending'
            };
            reservations.push(newReservation);
            localStorage.setItem('reservations', JSON.stringify(reservations));

            // Show success
            showFormMessage('success',
                `شكراً ${data.name}! تم استلام حجزك بنجاح. سنتصل بك قريباً على ${data.phone} لتأكيد الحجز. رقم الحجز: ${newReservation.id}`);

            // Reset form
            reservationForm.reset();

            // Restore default date
            if (dateInput) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                dateInput.value = tomorrow.toISOString().split('T')[0];
            }

            // Scroll to message
            const message = document.querySelector('.form-message');
            if (message) {
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    function showFormMessage(type, text) {
        const message = document.querySelector('.form-message');
        if (!message) return;
        message.className = 'form-message ' + type;
        message.textContent = text;
        setTimeout(() => {
            if (type === 'success') {
                message.style.display = 'block';
            }
        }, 100);
    }

    // ===== NEWSLETTER (if exists) =====
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                alert('شكراً لاشتراكك في نشرتنا البريدية!');
                newsletterForm.reset();
            }
        });
    }

    // ===== ADD LIGHTBOX STYLES DYNAMICALLY =====
    if (galleryItems.length > 0 && !document.getElementById('lightbox-styles')) {
        const style = document.createElement('style');
        style.id = 'lightbox-styles';
        style.textContent = `
            .lightbox {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.92);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                opacity: 0;
                transition: opacity 0.3s ease;
                cursor: pointer;
            }
            .lightbox-content {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                cursor: default;
            }
            .lightbox-content img {
                max-width: 100%;
                max-height: 85vh;
                border-radius: 8px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            }
            .lightbox-close {
                position: absolute;
                top: -50px;
                right: 0;
                background: var(--accent);
                color: var(--primary-dark);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                font-weight: 700;
                transition: var(--transition);
            }
            .lightbox-close:hover {
                background: var(--accent-light);
                transform: scale(1.1) rotate(90deg);
            }
            .lightbox-caption {
                color: white;
                text-align: center;
                padding: 1rem;
                font-size: 1.1rem;
            }
        `;
        document.head.appendChild(style);
    }

    console.log('%c🐟 Amine Fish Restaurant', 'color: #D4A24C; font-size: 24px; font-weight: bold;');
    console.log('%cمرحباً بك في موقعنا!', 'color: #0F3D5E; font-size: 14px;');
})();

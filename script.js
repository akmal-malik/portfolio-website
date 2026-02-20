// ==================== Hero Particles ====================
class HeroParticles {
    constructor() {
        this.container = document.getElementById('hero-particles-container');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isTouchDevice = 'ontouchstart' in window;
        this.interactionRadius = 100;
        this.init();
    }
    init() {
        this.createParticles(150);
        this.setupEventListeners();
        this.animate();
    }
    createParticles(count) {
        if (!this.container) return;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 4 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const opacity = Math.random() * 0.4 + 0.3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.opacity = opacity;
            particle.style.animationDuration = `${duration}s`;
            particle.style.background = `rgba(255, 255, 255, ${opacity})`;
            particle.originalX = posX;
            particle.originalY = posY;
            particle.currentX = 0;
            particle.currentY = 0;
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }
    setupEventListeners() {
        const heroSection = document.getElementById('hero');
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1100) {
            heroSection.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });
            heroSection.addEventListener('mouseleave', () => {
                this.mouseX = -1000;
                this.mouseY = -1000;
            });
        } else if (screenWidth >= 700 && screenWidth < 1100 && this.isTouchDevice) {
            heroSection.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
                this.particles.forEach(particle => {
                    const rect = particle.getBoundingClientRect();
                    const particleX = rect.left + rect.width / 2;
                    const particleY = rect.top + rect.height / 2;
                    const distance = Math.sqrt(
                        Math.pow(particleX - this.mouseX, 2) + 
                        Math.pow(particleY - this.mouseY, 2)
                    );
                    if (distance < this.interactionRadius) {
                        particle.classList.add('touched');
                        setTimeout(() => particle.classList.remove('touched'), 300);
                    }
                });
            });
            heroSection.addEventListener('touchend', () => {
                this.mouseX = -1000;
                this.mouseY = -1000;
            });
        }
    }
    animate() {
        this.updateParticles();
        requestAnimationFrame(() => this.animate());
    }
    updateParticles() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 700) {
            this.particles.forEach(particle => {
                const rect = particle.getBoundingClientRect();
                const particleX = rect.left + rect.width / 2;
                const particleY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(particleX - this.mouseX, 2) + 
                    Math.pow(particleY - this.mouseY, 2)
                );
                if (distance < this.interactionRadius && (screenWidth >= 1100 || (screenWidth >= 700 && screenWidth < 1100 && this.isTouchDevice))) {
                    const force = (this.interactionRadius - distance) / this.interactionRadius;
                    const angle = Math.atan2(particleY - this.mouseY, particleX - this.mouseX);
                    const pushDistance = force * 50;
                    particle.currentX = Math.cos(angle) * pushDistance;
                    particle.currentY = Math.sin(angle) * pushDistance;
                    particle.style.setProperty('--dx', `${particle.currentX}px`);
                    particle.style.setProperty('--dy', `${particle.currentY}px`);
                } else {
                    particle.currentX *= 0.9;
                    particle.currentY *= 0.9;
                    if (Math.abs(particle.currentX) > 0.1 || Math.abs(particle.currentY) > 0.1) {
                        particle.style.setProperty('--dx', `${particle.currentX}px`);
                        particle.style.setProperty('--dy', `${particle.currentY}px`);
                    } else {
                        particle.style.removeProperty('--dx');
                        particle.style.removeProperty('--dy');
                    }
                }
            });
        }
    }
}

// ==================== Hero Visibility Observer ====================
function setupHeroObserver() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.body.classList.add('hero-visible');
            } else {
                document.body.classList.remove('hero-visible');
            }
        });
    }, { threshold: 0.1 }); // 10% of hero visible

    observer.observe(hero);
}

// ==================== Enhanced Lazy Loader ====================
class EnhancedLazyLoader {
    constructor() {
        this.observers = new Map();
        this.init();
    }
    init() {
        this.setupSectionObserver();
        this.setupElementObserver();
        this.setupImageObserver();
    }
    setupSectionObserver() {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '100px' });
        document.querySelectorAll('.lazy-section').forEach(section => sectionObserver.observe(section));
        this.observers.set('sections', sectionObserver);
    }
    setupElementObserver() {
        const elementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    elementObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '100px' });
        document.querySelectorAll('.lazy-element').forEach(el => elementObserver.observe(el));
        this.observers.set('elements', elementObserver);
    }
    setupImageObserver() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            img.src = src;
                            img.classList.remove('lazy-placeholder');
                            img.classList.add('loaded');
                        };
                        tempImg.src = src;
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, { threshold: 0.05, rootMargin: '200px' });
        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
        this.observers.set('images', imageObserver);
    }
}

// ==================== Infinite Circular Certifications Slider ====================
class CertificationsSlider {
    constructor() {
        this.track = document.getElementById('certifications-track');
        this.prevBtn = document.getElementById('cert-slider-prev');
        this.nextBtn = document.getElementById('cert-slider-next');
        // Original slide data (hardcoded – you can later fetch from HTML if needed)
        this.originalSlidesData = [
            {
                icon: 'fab fa-aws',
                iconBg: 'from-yellow-400 to-orange-500',
                title: 'AWS Certified Developer – Associate',
                provider: 'Infosys Springboard',
                link: 'assets/images/PHOTO-2026-02-07-10-35-06.jpg',
                linkTarget: '_blank'
            },
            {
                icon: 'fab fa-react',
                iconBg: 'from-blue-400 to-cyan-500',
                title: 'React Development',
                provider: 'Meta (Coursera)',
                link: 'https://coursera.org/verify/ZS7VDNDBFYCA',
                linkTarget: '_blank'
            },
            {
                icon: 'fab fa-html5',
                iconBg: 'from-orange-400 to-red-500',
                title: 'HTML & CSS in Depth',
                provider: 'Meta (Coursera)',
                link: 'https://coursera.org/verify/GFHWWG0DXM14',
                linkTarget: '_blank'
            },
            {
                icon: 'fas fa-laptop-code',
                iconBg: 'from-purple-400 to-pink-500',
                title: 'Full Stack Web Development',
                provider: 'Udemy',
                link: 'https://www.udemy.com/certificate/UC-2265b908-4e96-4267-a4eb-bb47bcdd8697/',
                linkTarget: '_blank'
            }
        ];
        this.visibleSlides = 3; // will be updated on resize
        this.cloneCount = 0; // will be set based on visibleSlides
        this.currentIndex = 0;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000;
        this.isTransitioning = false; // to prevent multiple triggers
        this.init();
    }

    init() {
        this.buildTrack();
        this.calculateVisibleSlides();
        this.updateSlideWidths();
        this.setupEventListeners();
        this.startAutoSlide();
        window.addEventListener('resize', () => this.handleResize());
    }

    // Build track with clones for infinite effect
    buildTrack() {
        this.track.innerHTML = ''; // clear
        const totalOriginal = this.originalSlidesData.length;
        // Number of clones = visibleSlides (to ensure smooth loop)
        this.cloneCount = Math.min(this.visibleSlides, totalOriginal); // at most visibleSlides
        // Create array of all slides: clones at start + originals + clones at end
        const startClones = this.originalSlidesData.slice(-this.cloneCount); // last N
        const endClones = this.originalSlidesData.slice(0, this.cloneCount); // first N
        const allSlidesData = [...startClones, ...this.originalSlidesData, ...endClones];

        allSlidesData.forEach((data, idx) => {
            const slide = document.createElement('div');
            slide.className = 'certification-slide';
            slide.innerHTML = `
                <div class="glass-card rounded-2xl p-8 text-center hover-lift certification-card">
                    <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${data.iconBg} flex items-center justify-center certification-icon">
                        <i class="${data.icon} text-white text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-primary-700 mb-3 certification-title">${data.title}</h3>
                    <p class="text-secondary-600 mb-4 certification-provider">${data.provider}</p>
                    <a href="${data.link}" target="${data.linkTarget}" rel="noopener noreferrer"
                       class="inline-block px-6 py-2 bg-gradient-to-r ${data.iconBg} text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg view-certificate-btn"
                       title="View Certificate">
                       View Certificate
                    </a>
                </div>
            `;
            this.track.appendChild(slide);
        });

        this.slides = Array.from(this.track.children);
        this.totalSlides = this.slides.length;
        // Set current index to the first original slide (after start clones)
        this.currentIndex = this.cloneCount;
        this.updateSlider(false); // no animation for initial positioning
    }

    calculateVisibleSlides() {
        const width = window.innerWidth;
        if (width <= 640) this.visibleSlides = 1;
        else if (width <= 1000) this.visibleSlides = 2;
        else this.visibleSlides = 3;
        // Rebuild if cloneCount changes (i.e., visibleSlides changed)
        if (this.cloneCount !== this.visibleSlides && this.originalSlidesData.length >= this.visibleSlides) {
            this.cloneCount = this.visibleSlides;
            this.buildTrack(); // this also updates currentIndex and slides
        }
    }

    updateSlideWidths() {
        if (!this.slides || this.slides.length === 0) return;
        const gap = 30; // matches gap in CSS
        const trackWidth = this.track.parentElement.clientWidth - 120; // account for padding 60px each side
        const slideWidth = (trackWidth / this.visibleSlides) - (gap * (this.visibleSlides - 1) / this.visibleSlides);
        this.slides.forEach(slide => {
            slide.style.minWidth = `${slideWidth}px`;
        });
        // reposition after width change
        this.updateSlider(false);
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => {
            this.stopAutoSlide();
            this.prevSlide();
            this.startAutoSlide();
        });
        this.nextBtn.addEventListener('click', () => {
            this.stopAutoSlide();
            this.nextSlide();
            this.startAutoSlide();
        });
        // Pause auto-slide on hover
        this.track.parentElement.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.track.parentElement.addEventListener('mouseleave', () => this.startAutoSlide());

        // Touch events for mobile swipe
        let startX = 0, isDragging = false;
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.stopAutoSlide();
        });
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) this.nextSlide();
                else this.prevSlide();
            }
            isDragging = false;
            this.startAutoSlide();
        });

        // Listen for transition end to reset position when in clone zone
        this.track.addEventListener('transitionend', () => {
            this.isTransitioning = false;
            // If we are in the clone region, jump to the corresponding real slide without transition
            const totalOriginals = this.originalSlidesData.length;
            if (this.currentIndex < this.cloneCount) {
                // In left clones (prepended) – jump to the corresponding last original slide
                this.currentIndex = this.cloneCount + totalOriginals - (this.cloneCount - this.currentIndex);
                this.updateSlider(false);
            } else if (this.currentIndex >= this.cloneCount + totalOriginals) {
                // In right clones (appended) – jump to the corresponding first original slide
                this.currentIndex = this.cloneCount + (this.currentIndex - (this.cloneCount + totalOriginals));
                this.updateSlider(false);
            }
        });
    }

    updateSlider(animate = true) {
        if (!this.track || this.slides.length === 0) return;
        const slideWidth = this.slides[0].offsetWidth + 30; // width + gap
        const translateX = -this.currentIndex * slideWidth;
        if (animate) {
            this.track.style.transition = 'transform 0.5s ease-in-out';
        } else {
            this.track.style.transition = 'none';
        }
        this.track.style.transform = `translateX(${translateX}px)`;
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex--;
        this.updateSlider(true);
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex++;
        this.updateSlider(true);
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => this.nextSlide(), this.autoSlideDelay);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    handleResize() {
        this.calculateVisibleSlides(); // may rebuild track
        this.updateSlideWidths();
        // Reset index to first original slide after rebuild
        if (this.slides.length > 0) {
            this.currentIndex = this.cloneCount;
            this.updateSlider(false);
        }
    }
}

// ==================== Main Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    const heroParticles = new HeroParticles();
    const lazyLoader = new EnhancedLazyLoader();
    const certSlider = new CertificationsSlider();
    setupHeroObserver(); // Add hero visibility observer

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('animate-slide-up');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                if (icon.classList.contains('fa-times')) {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.remove('opacity-0', 'translate-y-10');
            backToTop.classList.add('opacity-100', 'translate-y-0');
        } else {
            backToTop.classList.remove('opacity-100', 'translate-y-0');
            backToTop.classList.add('opacity-0', 'translate-y-10');
        }
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuButton.querySelector('i');
                    if (icon.classList.contains('fa-times')) {
                        icon.classList.replace('fa-times', 'fa-bars');
                    }
                }
            }
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                alert('Please fill in all fields.');
                return;
            }

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert('Thank you for your message! I will get in touch with you within 1 to 2 days.');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        alert(data.errors.map(error => error.message).join(', '));
                    } else {
                        alert('Oops! There was a problem submitting your form. Please try again.');
                    }
                }
            } catch (error) {
                alert('Oops! There was a problem submitting your form. Please try again.');
            }
        });
    }


    // Animate skill bars on scroll
    const animateSkillBars = () => {
        const skillBars = document.querySelectorAll('.skill-bar');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'width 1.5s ease-in-out';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        skillBars.forEach(bar => observer.observe(bar));
    };
    setTimeout(animateSkillBars, 500);

    // Preload hero image
    const heroImg = document.querySelector('#hero img[data-src]');
    if (heroImg) {
        const img = new Image();
        img.onload = () => {
            heroImg.src = img.src;
            heroImg.classList.remove('lazy-placeholder');
            heroImg.classList.add('loaded');
        };
        img.src = heroImg.dataset.src;
    }
});

// Performance: remove loading placeholders after a timeout
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.lazy-placeholder:not(.loaded)').forEach(el => {
            el.classList.remove('lazy-placeholder');
        });
    }, 2000);
});
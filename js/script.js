// ===================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// SCROLL ANIMATIONS
// ===================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe all sections and cards for scroll animations
const animateElements = document.querySelectorAll(
    '.question-card, .problem-card, .step, .benefit-card, .story-card, .pricing-card'
);

animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add the animate-in class styles dynamically
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ===================================
// SCROLL INDICATOR - HIDE ON SCROLL
// ===================================
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '0.7';
            scrollIndicator.style.pointerEvents = 'auto';
        }
        
        lastScrollTop = scrollTop;
    });
}

// ===================================
// CTA BUTTON TRACKING & ANALYTICS
// ===================================
const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
        // Track button click (ready for analytics integration)
        console.log(`CTA Button clicked: ${button.textContent.trim()}`);
        
        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.animation = 'ripple-effect 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        const rect = button.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple-effect {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ===================================
// PARALLAX EFFECT FOR HERO SECTION
// ===================================
const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');

if (hero && heroContent) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        
        if (scrolled < hero.offsetHeight) {
            heroContent.style.transform = `translateY(${rate}px)`;
            heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.7;
        }
    });
}

// ===================================
// STAGGERED ANIMATION FOR CARDS
// ===================================
const cardGroups = {
    '.example-questions .question-card': 200,
    '.problems-grid .problem-card': 150,
    '.benefits-grid .benefit-card': 100,
    '.stories-grid .story-card': 200
};

Object.keys(cardGroups).forEach(selector => {
    const cards = document.querySelectorAll(selector);
    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * cardGroups[selector]}ms`;
    });
});

// ===================================
// NAVBAR ON SCROLL (IF NEEDED LATER)
// ===================================
// Placeholder for adding sticky navigation if required
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // You can add navbar show/hide logic here if needed
    // For now, this is just a placeholder for future enhancements
    
    lastScroll = currentScroll;
});

// ===================================
// PRICING CARD HOVER EFFECT
// ===================================
const pricingCards = document.querySelectorAll('.pricing-card');
pricingCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===================================
// COMPARISON ANIMATION
// ===================================
const comparisonContainer = document.querySelector('.comparison-container');
if (comparisonContainer) {
    const comparisonObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const otherSide = entry.target.querySelector('.comparison-other');
                const yourSide = entry.target.querySelector('.comparison-yours');
                
                if (otherSide && yourSide) {
                    setTimeout(() => {
                        otherSide.style.opacity = '1';
                        otherSide.style.transform = 'translateX(0)';
                    }, 200);
                    
                    setTimeout(() => {
                        yourSide.style.opacity = '1';
                        yourSide.style.transform = 'translateX(0)';
                    }, 400);
                }
                
                comparisonObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Set initial state
    const otherSide = comparisonContainer.querySelector('.comparison-other');
    const yourSide = comparisonContainer.querySelector('.comparison-yours');
    
    if (otherSide) {
        otherSide.style.opacity = '0';
        otherSide.style.transform = 'translateX(-30px)';
        otherSide.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }
    
    if (yourSide) {
        yourSide.style.opacity = '0';
        yourSide.style.transform = 'translateX(30px)';
        yourSide.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }
    
    comparisonObserver.observe(comparisonContainer);
}

// ===================================
// FLOATING ANIMATION FOR HERO AVATAR
// ===================================
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
    let floatDirection = 1;
    let floatAmount = 0;
    
    setInterval(() => {
        floatAmount += 0.5 * floatDirection;
        
        if (floatAmount >= 10) floatDirection = -1;
        if (floatAmount <= -10) floatDirection = 1;
        
        heroVisual.style.transform = `translateY(${floatAmount}px)`;
    }, 50);
}

// ===================================
// TYPING EFFECT FOR CHAT BUBBLE (OPTIONAL)
// ===================================
const chatBubble = document.querySelector('.chat-bubble p');
if (chatBubble) {
    const originalText = chatBubble.textContent;
    chatBubble.textContent = '';
    
    let charIndex = 0;
    const typingSpeed = 30;
    
    // Wait for page load, then start typing
    window.addEventListener('load', () => {
        setTimeout(() => {
            const typeInterval = setInterval(() => {
                if (charIndex < originalText.length) {
                    chatBubble.textContent += originalText.charAt(charIndex);
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                }
            }, typingSpeed);
        }, 1000);
    });
}

// ===================================
// MOBILE MENU TOGGLE (IF NEEDED)
// ===================================
// Placeholder for mobile navigation if header is added later

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Lazy load images if any are added later
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// CONSOLE MESSAGE (EASTER EGG)
// ===================================
console.log('%c👋 Hello, Future You!', 'font-size: 20px; font-weight: bold; color: #6b46c1;');
console.log('%cReady to get the clarity you need?', 'font-size: 14px; color: #4a5568;');

// ===================================
// READY STATE
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Talk to Your Future Self - Landing page loaded');
    
    // Add loaded class to body for any CSS transitions
    document.body.classList.add('page-loaded');
    
    // Fade in body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

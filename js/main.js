document.addEventListener('DOMContentLoaded', () => {

    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(7, 7, 10, 0.95)';
            navbar.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(7, 7, 10, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with .fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Dynamic mouse move effect on glass cards
    const cards = document.querySelectorAll('.glass-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Add CSS rule for dynamic card hover reflection
    const style = document.createElement('style');
    style.innerHTML = `
        .glass-card {
            position: relative;
            overflow: hidden;
        }
        .glass-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(
                800px circle at var(--mouse-x, 0) var(--mouse-y, 0), 
                rgba(255, 255, 255, 0.06),
                transparent 40%
            );
            z-index: 1;
            pointer-events: none;
            transition: opacity 0.5s;
            opacity: 0;
        }
        .glass-card:hover::before {
            opacity: 1;
        }
        .project-content, .timeline-header, .duties, .skill-category, h3, h4, p, ul {
            position: relative;
            z-index: 2;
        }
    `;
    document.head.appendChild(style);
});

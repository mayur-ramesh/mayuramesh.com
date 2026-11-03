document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

    // Navbar state, scroll progress bar and back-to-top button
    const navbar = document.querySelector('.navbar');
    const backToTop = document.querySelector('.back-to-top');

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        navbar.classList.toggle('scrolled', y > 50);
        navbar.style.setProperty('--progress', max > 0 ? y / max : 0);
        backToTop.classList.toggle('show', y > window.innerHeight);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Highlight the nav link for the section in view
    const navLinks = document.querySelectorAll('.nav-links a');
    const navTargets = {
        home: 'home', education: 'home', experience: 'experience',
        projects: 'projects', skills: 'skills', contact: 'contact'
    };

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = navTargets[entry.target.id];
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${target}`);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

    // Stagger reveal delays inside groups
    document.querySelectorAll('.reveal-group').forEach(group => {
        group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
            el.style.setProperty('--d', `${i * 110}ms`);
        });
    });

    // Scroll reveal
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Animated stat counters
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            if (reduceMotion) return;

            const duration = 1400;
            const start = performance.now();
            const tick = now => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(eased * target);
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.stat-num[data-count]').forEach(el => counterObserver.observe(el));

    // Typing effect
    const typed = document.querySelector('.typed');
    if (typed && !reduceMotion) {
        const words = typed.dataset.words.split('|');
        let wordIndex = 0;
        let charIndex = words[0].length;
        let deleting = true;

        const type = () => {
            const word = words[wordIndex];
            charIndex += deleting ? -1 : 1;
            typed.textContent = word.slice(0, charIndex);

            let delay = deleting ? 40 : 85;
            if (!deleting && charIndex === word.length) {
                delay = 2200;
                deleting = true;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                delay = 350;
            }
            setTimeout(type, delay);
        };
        setTimeout(type, 2600);
    }

    // Card spotlight + 3D tilt
    if (finePointer) {
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                if (!reduceMotion && card.classList.contains('tilt')) {
                    const rx = ((y / rect.height) - 0.5) * -6;
                    const ry = ((x / rect.width) - 0.5) * 6;
                    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
                }
            });

            if (card.classList.contains('tilt')) {
                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                });
            }
        });
    }

    // Background particle network
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    const mouse = { x: -9999, y: -9999 };
    const LINK_DIST = 130;
    const MOUSE_DIST = 170;
    let particles = [];
    let width = 0;
    let height = 0;
    let rafId = null;

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(Math.floor((width * height) / 16000), width < 768 ? 40 : 90);
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.6 + 0.6,
            purple: Math.random() < 0.3
        }));
    };

    const draw = () => {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Gentle pull towards the cursor
            const mdx = mouse.x - p.x;
            const mdy = mouse.y - p.y;
            const mDist = Math.hypot(mdx, mdy);
            if (mDist < MOUSE_DIST) {
                p.x += mdx * 0.004;
                p.y += mdy * 0.004;
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.35 * (1 - mDist / MOUSE_DIST)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dist = Math.hypot(p.x - q.x, p.y - q.y);
                if (dist < LINK_DIST) {
                    const alpha = 0.18 * (1 - dist / LINK_DIST);
                    ctx.strokeStyle = p.purple && q.purple
                        ? `rgba(189, 0, 255, ${alpha})`
                        : `rgba(0, 243, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            ctx.fillStyle = p.purple ? 'rgba(189, 0, 255, 0.8)' : 'rgba(0, 243, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const step = () => {
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        });
        draw();
        rafId = requestAnimationFrame(step);
    };

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            if (reduceMotion) draw();
        }, 150);
    });

    resize();

    if (reduceMotion) {
        draw();
    } else {
        if (finePointer) {
            window.addEventListener('mousemove', e => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });
            document.addEventListener('mouseleave', () => {
                mouse.x = mouse.y = -9999;
            });
        }

        // Pause the animation while the tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId);
            } else {
                rafId = requestAnimationFrame(step);
            }
        });

        step();
    }

    // Footer year
    document.querySelector('.year').textContent = new Date().getFullYear();
});

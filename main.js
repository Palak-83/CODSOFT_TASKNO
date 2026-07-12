const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const textEl = document.querySelector('.text');
const menuToggle = document.querySelector('.menu-toggle');
const navbar = document.querySelector('.navbar');

if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navbar.classList.toggle('open');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navbar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('open');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

if (window.Typed && !prefersReducedMotion) {
    new Typed('.text', {
        strings: ['Frontend Developer', 'Aspiring Full Stack Developer', 'AI Enthusiast'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
    });
} else if (textEl) {
    textEl.textContent = 'Frontend Developer';
}

const tabButtons = document.querySelectorAll('.tab-btn');
const popupOverlays = document.querySelectorAll('.popup-overlay');
const closeButtons = document.querySelectorAll('.popup-close');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const popupId = button.dataset.popup;
        popupOverlays.forEach(overlay => overlay.classList.add('hidden'));
        const targetPopup = document.getElementById(popupId);
        if (targetPopup) targetPopup.classList.remove('hidden');
    });
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const overlay = button.closest('.popup-overlay');
        if (overlay) overlay.classList.add('hidden');
    });
});

window.addEventListener('click', e => {
    if (e.target.classList.contains('popup-overlay')) {
        e.target.classList.add('hidden');
    }
    if (e.target.classList.contains('hobby-popup-overlay')) {
        e.target.classList.add('hidden');
    }
});

const hobbyItems = document.querySelectorAll('.hobby-item');
const hobbyCloseButtons = document.querySelectorAll('.hobby-popup-overlay .popup-close');

hobbyItems.forEach(item => {
    item.addEventListener('click', () => {
        const hobbyId = item.dataset.hobby + '-hobby';
        const targetPopup = document.getElementById(hobbyId);
        if (targetPopup) {
            targetPopup.classList.remove('hidden');
        }
    });
});

hobbyCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        const overlay = button.closest('.hobby-popup-overlay');
        if (overlay) overlay.classList.add('hidden');
    });
});

// Custom circular cursor: smooth follow + hover magnify
(function() {
    // Only enable for hover-capable devices
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;

    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const hoverSelector = 'h1,h2,h3,p,a,span,.hover-target';
    const hoverables = Array.from(document.querySelectorAll(hoverSelector));

    let mouseX = 0, mouseY = 0;
    let posX = 0, posY = 0;
    let isHover = false;
    let rafId = null;
    let currentHovered = null;
    let hoveredRect = null;

    const lerp = (a, b, n) => (1 - n) * a + n * b;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // ensure visible when moving
        cursor.style.opacity = '1';
        // update transform-origin for the currently hovered element without forcing layout reads
        if (currentHovered && hoveredRect) {
            const relX = ((mouseX - hoveredRect.left) / hoveredRect.width) * 100;
            const relY = ((mouseY - hoveredRect.top) / hoveredRect.height) * 100;
            currentHovered.style.transformOrigin = `${relX}% ${relY}%`;
        }
    }, { passive: true });

    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');

    // Attach hover handlers and vary cursor size by element (headings larger, links smaller)
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', (ev) => {
            isHover = true;
            currentHovered = el;
            hoveredRect = el.getBoundingClientRect();
            // clear previous size classes
            cursor.classList.remove('cursor-hover', 'cursor-large', 'cursor-small');
            el.classList.remove('hovered-by-cursor', 'hovered-by-cursor-large', 'hovered-by-cursor-small');

            const tag = el.tagName.toLowerCase();
            if (tag === 'a') {
                cursor.classList.add('cursor-small');
                el.classList.add('hovered-by-cursor-small');
            } else if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
                cursor.classList.add('cursor-large');
                el.classList.add('hovered-by-cursor-large');
            } else {
                cursor.classList.add('cursor-hover');
                el.classList.add('hovered-by-cursor');
            }

            // set initial transform-origin based on current mouse position
            const relX = ((ev.clientX - hoveredRect.left) / hoveredRect.width) * 100;
            const relY = ((ev.clientY - hoveredRect.top) / hoveredRect.height) * 100;
            el.style.transformOrigin = `${relX}% ${relY}%`;
        });
        el.addEventListener('mouseleave', () => {
            isHover = false;
            cursor.classList.remove('cursor-hover', 'cursor-large', 'cursor-small');
            el.classList.remove('hovered-by-cursor', 'hovered-by-cursor-large', 'hovered-by-cursor-small');
            // reset
            if (currentHovered) {
                currentHovered.style.transformOrigin = '';
                currentHovered = null;
                hoveredRect = null;
            }
        });
    });

    function render() {
        posX = lerp(posX, mouseX, 0.18);
        posY = lerp(posY, mouseY, 0.18);
        let scale = 1;
        if (cursor.classList.contains('cursor-large')) scale = 3.2;
        else if (cursor.classList.contains('cursor-small')) scale = 1.5;
        else if (cursor.classList.contains('cursor-hover')) scale = 2.5;
        // Apply translate + center offset + scale in one transform (no layout thrash)
        cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%) scale(${scale})`;
        rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    // Clean up when page unloads
    window.addEventListener('unload', () => {
        if (rafId) cancelAnimationFrame(rafId);
    });
})();


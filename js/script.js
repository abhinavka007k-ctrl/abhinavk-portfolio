document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Lenis Smooth Scroll (Ultra Buttery Apple-Style)
    const lenis = new Lenis({
        lerp: 0.05, // Lower value = higher inertia, more "buttery" flow
        smoothWheel: true,
        wheelMultiplier: 0.9, // Slightly softer mouse wheel curve
        smoothTouch: true, 
        touchMultiplier: 2, // Keeps touch responsive but smooth
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Register GSAP Plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Sync Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0, 0);

        // =====================================
        // HERO CANVAS IMAGE SEQUENCE & TEXT
        // =====================================
        const canvas = document.getElementById("hero-canvas");
        if(canvas) {
            const context = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const frameCount = 240;
            const currentFrame = index => `public/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`;
            const images = [];
            const imageSeq = { frame: 0 };

            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFrame(i);
                images.push(img);
            }

            images[0].onload = render;

            function render() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                const img = images[imageSeq.frame];
                if (!img || !img.complete) return;
                
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                const ratio  = Math.max(hRatio, vRatio); // use max for cover, min for contain
                const centerShift_x = (canvas.width - img.width*ratio) / 2;
                const centerShift_y = (canvas.height - img.height*ratio) / 2;  
                
                context.drawImage(img, 0, 0, img.width, img.height,
                                centerShift_x, centerShift_y, img.width*ratio, img.height*ratio);
            }

            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                render();
            });

            gsap.to(imageSeq, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: "#hero-scroll",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.5
                },
                onUpdate: render
            });

            const tlText = gsap.timeline({
                scrollTrigger: {
                    trigger: "#hero-scroll",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1
                }
            });

            // 0) Intro text fades out as soon as scroll begins
            tlText.to("#intro-static-text", {opacity: 0, duration: 1})
            // 1) Text 1 appears then goes up
                  .to("#text-1", {opacity: 1, yPercent: -50, duration: 1})
                  .to("#text-1", {opacity: 0, yPercent: -100, duration: 1})
            // 2) Text 2 appears then goes up
                  .to("#text-2", {opacity: 1, yPercent: -50, duration: 1})
                  .to("#text-2", {opacity: 0, yPercent: -100, duration: 1})
            // 3) Text 3 appears and stays
                  .to("#text-3", {opacity: 1, yPercent: -50, duration: 1.5});
        }

        // =====================================
        // ANIMATION LOGIC A: Apple Scrub Text 
        // Opacity smoothly increases as you scroll
        // =====================================
        const scrubTexts = document.querySelectorAll('.scrub-reveal-text');
        
        scrubTexts.forEach((text) => {
            // Split text into words using SplitType
            const split = new SplitType(text, { types: 'words' });
            
            // Set initial state
            gsap.set(split.words, { opacity: 0.15 });

            // Create scrub animation
            gsap.to(split.words, {
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%",
                    end: "bottom 50%",
                    scrub: 0.5, // Smooth scrubbing
                },
                opacity: 1,
                stagger: 0.1,
                ease: "none"
            });
        });

        // =====================================
        // ANIMATION LOGIC B: Split-Type Word Drop
        // Triggers once as user scrolls into view
        // =====================================
        const splitDropTexts = document.querySelectorAll('.split-reveal-text');
        
        splitDropTexts.forEach((text) => {
            const split = new SplitType(text, { types: 'words, lines' });
            
            // Fix container overflow for clean mask drop
            text.style.overflow = 'hidden';

            gsap.from(split.words, {
                scrollTrigger: {
                    trigger: text,
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.03,
                ease: "power4.out"
            });
        });

        // =====================================
        // ANIMATION LOGIC C: Standard Fade In Up
        // =====================================
        const fadeUps = document.querySelectorAll('.fade-in-up');
        
        fadeUps.forEach((elem) => {
            let delayTime = 0;
            if (elem.classList.contains('delay-1')) delayTime = 0.2;
            
            gsap.fromTo(elem, 
                { y: 60, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%",
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    delay: delayTime,
                    ease: "power3.out"
                }
            );
        });

        // =====================================
        // ANIMATION LOGIC D: Image Parallax Scale
        // Apple style image reveal
        // =====================================
        const images = document.querySelectorAll('.img-reveal');
        
        images.forEach((imgContainer) => {
            const innerImg = imgContainer.querySelector('.project-img');
            
            // Start scaled up and masked
            gsap.set(imgContainer, { clipPath: "inset(20% 20% 20% 20% round 20px)" });
            gsap.set(innerImg, { scale: 1.4 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: imgContainer,
                    start: "top 85%",
                    end: "bottom 50%",
                    scrub: 1,
                }
            });

            tl.to(imgContainer, { clipPath: "inset(0% 0% 0% 0% round 20px)", ease: "none" }, 0)
              .to(innerImg, { scale: 1, ease: "none" }, 0);
        });

        // =====================================
        // ANIMATION LOGIC J: Card Reveal (Volunteer Cards)
        // Same Apple clip-path + scale scrub as img-reveal
        // =====================================
        const revealCards = document.querySelectorAll('.card-reveal');

        revealCards.forEach((card, i) => {
            // Initial state: clipped in & slightly scaled down
            gsap.set(card, { 
                clipPath: "inset(6% 4% 6% 4% round 24px)",
                scale: 0.97,
                opacity: 0.2
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: "top 88%",
                    end: "bottom 55%",
                    scrub: 1.2,
                }
            });

            tl.to(card, { 
                clipPath: "inset(0% 0% 0% 0% round 24px)", 
                scale: 1,
                opacity: 1,
                ease: "none" 
            }, 0);
        });

        // =====================================
        // ANIMATION LOGIC E: Global Background Video
        // Fades in when reaching the Contact section
        // =====================================
        const globalBgVideo = document.getElementById('global-video');
        if (globalBgVideo) {
            gsap.to(globalBgVideo, {
                scrollTrigger: {
                    trigger: "#contact",
                    start: "top 80%", // Fades in exactly as Contact section enters
                    end: "top 20%",
                    scrub: true
                },
                opacity: 0.5,
                ease: "none"
            });
        }

        // =====================================
        // ANIMATION LOGIC F: Experience Automatic Slideshow
        // =====================================
        const racingSlideshow = document.getElementById('racing-slideshow');
        if (racingSlideshow) {
            const racingImages = [
                "racing pic/WhatsApp Image 2026-04-20 at 8.51.54 PM.jpeg",
                "racing pic/WhatsApp Image 2026-04-20 at 8.54.03 PM.jpeg",
                "racing pic/WhatsApp Image 2026-04-20 at 9.01.00 PM.jpeg",
                "racing pic/WhatsApp Image 2026-04-20 at 9.02.53 PM.jpeg",
                "racing pic/WhatsApp Image 2026-04-20 at 9.03.44 PM.jpeg"
            ];
            let currentRacingIndex = 0;

            setInterval(() => {
                gsap.to(racingSlideshow, {
                    opacity: 0.2, 
                    duration: 0.5, 
                    ease: "power2.inOut",
                    onComplete: () => {
                        currentRacingIndex = (currentRacingIndex + 1) % racingImages.length;
                        racingSlideshow.src = racingImages[currentRacingIndex];
                        gsap.to(racingSlideshow, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
                    }
                });
            }, 3000);
        }

        // =====================================
        // ANIMATION LOGIC G: Posture Device Slideshow
        // Crossfades posture images every 5 seconds
        // =====================================
        const postureSlideshow = document.getElementById('posture-slideshow');
        if (postureSlideshow) {
            const postureImages = [
                "posture pic/WhatsApp Image 2026-04-18 at 11.31.05 PM.jpeg",
                "posture pic/WhatsApp Image 2026-04-18 at 11.32.04 PM.jpeg"
            ];
            let currentPostureIndex = 0;

            setInterval(() => {
                gsap.to(postureSlideshow, {
                    opacity: 0.2, 
                    duration: 0.5, 
                    ease: "power2.inOut",
                    onComplete: () => {
                        currentPostureIndex = (currentPostureIndex + 1) % postureImages.length;
                        postureSlideshow.src = postureImages[currentPostureIndex];
                        gsap.to(postureSlideshow, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
                    }
                });
            }, 5000);
        }

        // =====================================
        // ANIMATION LOGIC H: Materials Optimization Slideshow
        // Crossfades material images every 5 seconds
        // =====================================
        const materialsSlideshow = document.getElementById('materials-slideshow');
        if (materialsSlideshow) {
            const materialsImages = [
                "materials/WhatsApp Image 2026-04-19 at 12.14.48 AM.jpeg",
                "materials/WhatsApp Imagea 2026-04-19 at 12.14.48 AM.jpeg"
            ];
            let currentMaterialsIndex = 0;

            setInterval(() => {
                gsap.to(materialsSlideshow, {
                    opacity: 0.2, 
                    duration: 0.5, 
                    ease: "power2.inOut",
                    onComplete: () => {
                        currentMaterialsIndex = (currentMaterialsIndex + 1) % materialsImages.length;
                        materialsSlideshow.src = materialsImages[currentMaterialsIndex];
                        gsap.to(materialsSlideshow, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
                    }
                });
            }, 5000);
        }

        // =====================================
        // ANIMATION LOGIC I: Thermal Slideshow
        // Crossfades thermal images every 5 seconds
        // =====================================
        const thermalSlideshow = document.getElementById('thermal-slideshow');
        if (thermalSlideshow) {
            const thermalImages = [
                "httm image/Screenshot 2026-04-28 173330.png",
                "httm image/Screenshot 2026-04-28 173349.png",
                "httm image/Screenshot 2026-04-28 173417.png",
                "httm image/image.png"
            ];
            let currentThermalIndex = 0;

            setInterval(() => {
                gsap.to(thermalSlideshow, {
                    opacity: 0.2, 
                    duration: 0.5, 
                    ease: "power2.inOut",
                    onComplete: () => {
                        currentThermalIndex = (currentThermalIndex + 1) % thermalImages.length;
                        thermalSlideshow.src = thermalImages[currentThermalIndex];
                        gsap.to(thermalSlideshow, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
                    }
                });
            }, 3000);
        }

        // =====================================
        // ANIMATION LOGIC K: Navigation Indicator (Smooth Sliding Slab)
        // =====================================
        const navIndicator = document.querySelector('.nav-indicator');
        const navLinks = document.querySelectorAll('.links a');
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: "top 20%",
                end: "bottom 20%",
                onToggle: self => {
                    if (self.isActive) {
                        const id = section.getAttribute('id');
                        const activeLink = document.querySelector(`.links a[href="#${id}"]`);

                        if (activeLink) {
                            gsap.to(navIndicator, {
                                opacity: 1,
                                x: activeLink.offsetLeft,
                                width: activeLink.offsetWidth,
                                duration: 0.4,
                                ease: "power2.out"
                            });
                        } else if (id === 'hero-scroll') {
                            // Hide indicator when back at Hero
                            gsap.to(navIndicator, {
                                opacity: 0,
                                duration: 0.3
                            });
                        }
                    }
                }
            });
        });

    } else {
        console.error("GSAP or ScrollTrigger not loaded.");
    }

    // Anchor smooth scrolling (Override default jump)
    document.querySelectorAll('.links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            lenis.scrollTo(this.getAttribute('href'), {
                offset: -50,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        });
    });
});

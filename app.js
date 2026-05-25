// App JavaScript for Uyen & Us 5-Year Memory Timeline

let ytPlayer;
let isPlaying = false;
let progressInterval;
let localAudio;
let currentYearIndex = 0;
let currentMemoryIndex = 0;
let lastActiveSection = "";

// Initialize app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initCanvas();
  initLoveTimer();
  loadTimeline();
  initTiltEffect();
  initKeyboardNav();
  
  // Set up scroll tracking for Tom the Lizard guide
  window.addEventListener("scroll", trackScrollForMascot);
  
  // Set cassette deck labels dynamically from config
  const cassetteTitle = document.querySelector(".cassette-title");
  const cassetteArtist = document.querySelector(".cassette-artist");
  if (cassetteTitle) cassetteTitle.textContent = `${MEMORIES_CONFIG.bgm.title} 🎶`;
  if (cassetteArtist) cassetteArtist.textContent = MEMORIES_CONFIG.bgm.artist;
});

// ==========================================
// 1. 3D ENVELOPE INTRO SCREEN OPENING LOGIC
// ==========================================
function openStory() {
  const introCard = document.getElementById("introCard");
  const introScreen = document.getElementById("introScreen");
  
  if (!introCard || !introScreen) return;
  
  // Trigger 3D envelope flip opening animation
  introCard.classList.add("opened");
  
  // Try playing the background music song ("CILU")
  // Since the user just clicked, the browser grants audio autoplay permission!
  setTimeout(() => {
    togglePlay();
  }, 200);
  
  // Fade out and remove the intro screen after flip animation completes
  setTimeout(() => {
    introScreen.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(1.15)', filter: 'blur(10px)' }
    ], {
      duration: 800,
      easing: 'ease-in-out',
      fill: 'forwards'
    });
    
    setTimeout(() => {
      introScreen.style.display = "none";
    }, 800);
  }, 1200);
}

// ==========================================
// 2. TOM THE LIZARD GUIDE SYSTEM (Leads the Journey)
// ==========================================
const TOM_MESSAGES = {
  hero: "Hi Uyen! 🦎 Tom waving hi! Let's join Tu on a trip down memory lane through your 5 years! Maruko and Shin-chan are here too! 💛",
  2021: "🌸 2021! Tu first asked you out, Uyen! Maruko-chan says: Tu was so nervous and cute! Look at those first butterflies! 🦋",
  2022: "🌱 2022! Travel adventures in Da Lat & Phu Yen! Shin-chan wiggles: Ooooh, pine woods & basalt rocks! So pretty! 🌲🌊",
  2023: "✈️ 2023! Misty heights in Sapa & Tu's University Graduation! Maruko-chan cheers: You two look so brilliant! 🎓🏔️",
  2024: "🏡 2024! Return to Da Lat, exploring Da Nang, Hoi An, Ly Son & Uyen's Master's journey to Taiwan! Cheering you on! ✈️🇹🇼",
  2025: "✨ 2025! Nha Trang beaches, 4 years anniversary at FTU, road trip to Quy Nhon/Hue, and Tu's Master's journey to the UK! 🌊🇬🇧",
  2026: "💍 2026! 5 years! Uyen's grand progression, thesis, two jobs & Japan/Taiwan travels! You are incredibly hardworking and pretty! 🇯🇵🎓✨",
  footer: "💖 We made it! 5 years of beautiful memories. Click 'Jump to Top' to travel back in time with Tu again! 💛"
};

const TOM_RANDOM_NOTES = [
  "Tu loves you more than anything in the world, Uyen! 💛",
  "Tu is so lucky to have Uyen in his life! 🥰",
  "Tu says you look absolutely stunning today, Uyen! 💚",
  "Did you flip the polaroid cards? Click them to read Tu's secret letters! 🔄",
  "Tom the Lizard fully approves of Tu x Uyen! 🦎👍",
  "Tu says: Cuz I luv u! 🦎📱 *typing typing*",
  "Five years down, forever to go! - Tu & Uyen 💍",
  "Maruko-chan says: Tu is so romantic, Uyen! You two are the most perfect couple! 💛🌸",
  "Shin-chan wiggles his hips: Tu and Uyen are holding hands! So embarrassing! *wiggle wiggle* 🍑🕺",
  "Maruko-chan giggles: Every time Tu talks about Uyen, his eyes sparkle like stars! ✨🍰",
  "Shin-chan shouts: Action Mask says Tu and Uyen are the ultimate love champions! 🦸‍♂️💥",
  "Tom, Maruko & Shin-chan all agree: Uyen is the prettiest girl in the universe! 🪐💖"
];

function trackScrollForMascot() {
  const scrollPos = window.scrollY + (window.innerHeight / 2);
  let activeSection = "hero";
  
  // Check timeline year blocks
  MEMORIES_CONFIG.timeline.forEach((item) => {
    const el = document.getElementById(`year${item.year}`);
    if (el) {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height + 60) {
        activeSection = String(item.year);
      }
    }
  });
  
  // Check footer
  const footer = document.querySelector(".footer-section");
  if (footer && scrollPos >= footer.offsetTop) {
    activeSection = "footer";
  }
  
  // If we crossed into a new section, update Tom's speech bubble!
  if (activeSection !== lastActiveSection) {
    lastActiveSection = activeSection;
    updateTomSpeechBubble(TOM_MESSAGES[activeSection]);
  }
}

function updateTomSpeechBubble(text) {
  const bubble = document.getElementById("tomGuideBubble");
  const tom = document.getElementById("tomGuideImg");
  
  if (!bubble || !text) return;
  
  // Fade out text, change it, and bounce Tom
  bubble.animate([
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(0.95)' },
    { opacity: 1, transform: 'scale(1)' }
  ], { duration: 300 });
  
  setTimeout(() => {
    bubble.textContent = text;
  }, 150);
  
  if (tom) {
    tom.animate([
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.25) rotate(-15deg)', offset: 0.3 },
      { transform: 'scale(0.9) rotate(10deg)', offset: 0.6 },
      { transform: 'scale(1) rotate(0deg)' }
    ], { duration: 500, easing: 'ease-out' });
  }
}

function speakRandomNote() {
  const randomMsg = TOM_RANDOM_NOTES[Math.floor(Math.random() * TOM_RANDOM_NOTES.length)];
  updateTomSpeechBubble(randomMsg);
}

// ==========================================
// 3. DYNAMIC CURSOR
// ==========================================
function initCursor() {
  const cursor = document.getElementById("customCursor");
  if (!cursor) return;

  // Track mouse coordinates
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Random cursor emoji shifting occasionally on fast movement
    if (Math.random() < 0.015) {
      const emojis = ["🦎", "💛", "✨", "🦕", "🦎", "🥰"];
      cursor.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    }
  });

  // Lerp mouse trail for smooth organic movement
  function animateCursor() {
    let dx = mouseX - cursorX;
    let dy = mouseY - cursorY;
    cursorX += dx * 0.15;
    cursorY += dy * 0.15;
    
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Click animation
  document.addEventListener("mousedown", () => {
    cursor.classList.add("clicking");
    spawnClickHearts(mouseX, mouseY);
  });
  document.addEventListener("mouseup", () => {
    cursor.classList.remove("clicking");
  });

  // Spawn a floating heart/lizard trail occasionally
  let lastTrailTime = 0;
  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastTrailTime > 150) { // Throttle trail spawns
      spawnTrailElement(e.clientX, e.clientY);
      lastTrailTime = now;
    }
  });
}

function spawnTrailElement(x, y) {
  const trail = document.createElement("div");
  const emojis = ["💛", "✨", "🦎", "❤️", "⭐"];
  trail.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  trail.style.position = "fixed";
  trail.style.left = `${x}px`;
  trail.style.top = `${y}px`;
  trail.style.fontSize = `${Math.random() * 0.8 + 0.8}rem`;
  trail.style.pointerEvents = "none";
  trail.style.zIndex = "9998";
  trail.style.filter = "drop-shadow(1px 1px 0px #1E1E1E)";
  trail.style.transition = "transform 1s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1s ease-out";
  trail.style.transform = "translate(-50%, -50%) scale(1)";
  trail.style.opacity = "1";
  
  document.body.appendChild(trail);
  
  // Animate floating up and away
  setTimeout(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 30;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 80; // Always drift upwards
    
    trail.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.4) rotate(${Math.random() * 90 - 45}deg)`;
    trail.style.opacity = "0";
  }, 10);
  
  setTimeout(() => trail.remove(), 1000);
}

function spawnClickHearts(x, y) {
  for (let i = 0; i < 6; i++) {
    const heart = document.createElement("div");
    heart.textContent = i % 2 === 0 ? "💛" : "💖";
    heart.style.position = "fixed";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = "1.2rem";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "99999";
    heart.style.transition = "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s ease";
    heart.style.transform = "translate(-50%, -50%) scale(0.5)";
    heart.style.opacity = "1";
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distance = Math.random() * 60 + 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      heart.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.3) rotate(${Math.random() * 60 - 30}deg)`;
      heart.style.opacity = "0";
    }, 10);
    
    setTimeout(() => heart.remove(), 800);
  }
}

// ==========================================
// 4. DYNAMIC FLOATING CANVAS PARTICLES
// ==========================================
function initCanvas() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  let particles = [];
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Spread initially
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.size = Math.random() * 15 + 10;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.15;
      
      const items = ["💛", "🦎", "⭐", "🦖", "💖"];
      this.char = items[Math.floor(Math.random() * items.length)];
      
      // Reduce lizards in background so it's not overcrowded
      if (this.char === "🦎" && Math.random() > 0.4) {
        this.char = "💛";
      }
    }
    
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      
      // Oscillate horizontally
      this.speedX += Math.sin(this.y * 0.01) * 0.02;
      
      if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.size}px Fredoka`;
      ctx.shadowColor = "#1E1E1E";
      ctx.shadowBlur = 0;
      ctx.fillText(this.char, this.x, this.y);
      ctx.restore();
    }
  }
  
  // Spawn initial background items
  const particleCount = Math.min(30, Math.floor(canvas.width / 50));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================
// 5. ANNIVERSARY REAL-TIME COUNT-UP TIMER
// ==========================================
function initLoveTimer() {
  const annivDate = new Date(MEMORIES_CONFIG.anniversaryDate);
  const lizardCounter = document.getElementById("lizardEmojiCounter");
  
  const daysVal = document.getElementById("daysVal");
  const hoursVal = document.getElementById("hoursVal");
  const minsVal = document.getElementById("minsVal");
  const secsVal = document.getElementById("secsVal");
  
  function updateTimer() {
    const now = new Date();
    const diffMs = now - annivDate;
    
    if (diffMs < 0) return; // Future date safety
    
    const secMs = 1000;
    const minMs = secMs * 60;
    const hourMs = minMs * 60;
    const dayMs = hourMs * 24;
    
    const days = Math.floor(diffMs / dayMs);
    const hours = Math.floor((diffMs % dayMs) / hourMs);
    const mins = Math.floor((diffMs % hourMs) / minMs);
    const secs = Math.floor((diffMs % minMs) / secMs);
    
    daysVal.textContent = String(days).padStart(4, "0");
    hoursVal.textContent = String(hours).padStart(2, "0");
    minsVal.textContent = String(mins).padStart(2, "0");
    secsVal.textContent = String(secs).padStart(2, "0");

    // Add tiny bounce keyframe trigger to seconds box as it changes
    secsVal.parentElement.style.transform = "scale(1.05)";
    setTimeout(() => {
      secsVal.parentElement.style.transform = "scale(1)";
    }, 150);

    // Randomize Tom Lizard's phone speech bubble lizard emojis occasionally
    if (secs % 10 === 0 && lizardCounter) {
      let count = Math.floor(Math.random() * 4) + 1;
      lizardCounter.textContent = "🦎".repeat(count);
    }
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================
// 6. LOAD TIMELINE MILESTONES (config.js)
// ==========================================
function loadTimeline() {
  const container = document.getElementById("timelineContent");
  if (!container) return;
  
  container.innerHTML = ""; // Clear
  
  MEMORIES_CONFIG.timeline.forEach((item, yearIndex) => {
    const block = document.createElement("div");
    block.className = "year-block";
    block.id = `year${item.year}`;
    
    // Timeline Center Marker Icon
    const pin = document.createElement("div");
    pin.className = "timeline-pin";
    pin.textContent = "🦎";
    pin.style.backgroundColor = item.themeColor;
    
    // Left Side: Text Details Card
    const details = document.createElement("div");
    details.className = "year-details neo-card";
    
    const stamp = document.createElement("div");
    stamp.className = "year-stamp";
    stamp.textContent = item.year;
    stamp.style.backgroundColor = item.themeColor;
    
    const title = document.createElement("h2");
    title.className = "year-details-title";
    title.textContent = item.title;
    
    const summary = document.createElement("p");
    summary.className = "year-summary";
    summary.textContent = item.summary;
    
    details.appendChild(stamp);
    details.appendChild(title);
    details.appendChild(summary);
    
    // Add specific character stickers next to details card
    if (item.year === 2022) {
      const marukoTimelineSticker = document.createElement("img");
      marukoTimelineSticker.src = "assets/images/maruko_sticker.png";
      marukoTimelineSticker.className = "timeline-mascot-sticker maruko-timeline";
      marukoTimelineSticker.alt = "Maruko-chan Sticker";
      details.appendChild(marukoTimelineSticker);
    } else if (item.year === 2024) {
      const shinchanTimelineSticker = document.createElement("img");
      shinchanTimelineSticker.src = "assets/images/shinchan_sticker.png";
      shinchanTimelineSticker.className = "timeline-mascot-sticker shinchan-timeline";
      shinchanTimelineSticker.alt = "Shin-chan Sticker";
      details.appendChild(shinchanTimelineSticker);
    }
    
    // Right Side: 3D Photo Polaroid Grid
    const gallery = document.createElement("div");
    gallery.className = "year-gallery";
    
    item.memories.forEach((mem, memIndex) => {
      const cardWrapper = document.createElement("div");
      cardWrapper.className = "gallery-card-wrapper";
      
      const card = document.createElement("div");
      // Alternate rotations for cute cartoon scrapbook placement
      const rotations = ["rot-left", "rot-right", "rot-slight"];
      const rClass = rotations[(yearIndex + memIndex) % rotations.length];
      card.className = `polaroid-card polaroid-small 3d-tilt ${rClass}`;
      
      // Dynamic open click handler
      card.onclick = () => openLightbox(yearIndex, memIndex);
      
      const imgWrapper = document.createElement("div");
      imgWrapper.className = "polaroid-image-wrapper";
      
      // Local placeholder support
      const imgPlaceholder = document.createElement("div");
      imgPlaceholder.className = "polaroid-placeholder";
      imgPlaceholder.innerHTML = `<span style="font-size: 1.5rem;">💛</span><p style="font-size: 0.75rem; margin-top: 4px;">Memory Photo<br>${mem.date}</p>`;
      
      let mediaElement;
      const isVideo = mem.image.toLowerCase().endsWith(".mov") || mem.image.toLowerCase().endsWith(".mp4");
      
      if (isVideo) {
        mediaElement = document.createElement("video");
        mediaElement.className = "polaroid-real-img";
        mediaElement.muted = true;
        mediaElement.playsInline = true;
        mediaElement.autoplay = false;
        mediaElement.loop = false;
        mediaElement.setAttribute("muted", "");
        mediaElement.setAttribute("playsinline", "");
        mediaElement.src = mem.image;
        
        mediaElement.onloadeddata = function() {
          imgPlaceholder.style.display = 'none';
        };
        mediaElement.onerror = function() {
          this.style.display = 'none';
          imgPlaceholder.style.display = 'flex';
          imgPlaceholder.innerHTML = `<span style="font-size: 1.5rem;">🎬</span><p style="font-size: 0.75rem; margin-top: 4px;">Video Error<br>${mem.date}</p>`;
        };
        
        // Add a cute play overlay sticker for video identification
        const playOverlay = document.createElement("div");
        playOverlay.className = "video-play-overlay";
        playOverlay.innerHTML = "▶️";
        playOverlay.style.position = "absolute";
        playOverlay.style.top = "8px";
        playOverlay.style.right = "8px";
        playOverlay.style.fontSize = "1.1rem";
        playOverlay.style.zIndex = "6";
        playOverlay.style.filter = "drop-shadow(1px 1px 0px #1E1E1E)";
        imgWrapper.appendChild(playOverlay);
      } else if (mem.image.toLowerCase().endsWith(".heic")) {
        mediaElement = document.createElement("img");
        mediaElement.alt = mem.caption;
        mediaElement.className = "polaroid-real-img";
        mediaElement.src = ""; // Empty initially
        setTimeout(() => {
          loadHeicImage(mediaElement, mem.image, imgPlaceholder);
        }, 50);
      } else {
        mediaElement = document.createElement("img");
        mediaElement.alt = mem.caption;
        mediaElement.className = "polaroid-real-img";
        mediaElement.src = mem.image;
        mediaElement.onerror = function() {
          this.style.display = 'none';
          imgPlaceholder.style.display = 'flex';
        };
        mediaElement.onload = function() {
          imgPlaceholder.style.display = 'none';
        };
      }
      
      imgWrapper.appendChild(imgPlaceholder);
      imgWrapper.appendChild(mediaElement);
      
      const caption = document.createElement("div");
      caption.className = "polaroid-caption";
      
      const capText = document.createElement("span");
      capText.className = "caption-handwritten";
      capText.textContent = mem.date;
      
      caption.appendChild(capText);
      card.appendChild(imgWrapper);
      card.appendChild(caption);
      
      cardWrapper.appendChild(card);
      gallery.appendChild(cardWrapper);
    });
    
    // Sticker Badge showing photo count
    const badge = document.createElement("div");
    badge.className = "photo-count-badge";
    badge.textContent = `🦎 ${item.memories.length} Memories`;
    details.appendChild(badge);
    
    block.appendChild(pin);
    block.appendChild(details);
    block.appendChild(gallery);
    
    container.appendChild(block);
  });
}

// ==========================================
// 7. INTERACTIVE CSS 3D TILT EFFECT
// ==========================================
function initTiltEffect() {
  // Use event delegation for dynamically created polaroids!
  document.body.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".3d-tilt");
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // X coordinate inside card
    const y = e.clientY - rect.top;  // Y coordinate inside card
    
    // Normalize coordinates around center (from -0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Max tilt angles (degrees)
    const maxTilt = 15;
    
    const tiltX = normalizedX * maxTilt;
    const tiltY = normalizedY * -maxTilt; // Invert Y axis
    
    card.style.transform = `perspective(1000px) rotateY(${tiltX}deg) rotateX(${tiltY}deg) scale(1.04)`;
    card.style.boxShadow = `${12 + normalizedX * -10}px ${12 + normalizedY * -10}px 0px #1E1E1E`;
  });
  
  document.body.addEventListener("mouseleave", (e) => {
    const card = e.target.closest(".3d-tilt");
    if (!card) return;
    
    // Reset back smoothly
    card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)`;
    card.style.boxShadow = ``;
  }, true);
}

// ==========================================
// 8. 3D LIGHTBOX POSTCARD FLIP MODAL
// ==========================================
function openLightbox(yearIdx, memIdx) {
  currentYearIndex = yearIdx;
  currentMemoryIndex = memIdx;
  
  const modal = document.getElementById("lightboxModal");
  const innerFlip = document.getElementById("modalFlipInner");
  
  // Make sure card starts unflipped (showing photo front)
  if (innerFlip) innerFlip.classList.remove("flipped");
  
  updateLightboxContent();
  
  modal.style.display = "flex";
  // Trigger animations
  modal.animate([
    { opacity: 0, transform: 'scale(0.95)' },
    { opacity: 1, transform: 'scale(1)' }
  ], {
    duration: 250,
    easing: 'ease-out',
    fill: 'forwards'
  });
}

function closeLightbox(event) {
  // Prevent clicks inside the modal card from closing it
  if (event) {
    const clickTarget = event.target;
    if (clickTarget.closest(".flip-card-container") || clickTarget.closest(".gallery-nav-btn")) {
      return;
    }
  }
  
  const videoFront = document.getElementById("modalVideoFront");
  if (videoFront) {
    videoFront.pause();
  }
  
  const modal = document.getElementById("lightboxModal");
  modal.animate([
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(0.95)' }
  ], {
    duration: 200,
    easing: 'ease-in',
    fill: 'forwards'
  });
  
  setTimeout(() => {
    modal.style.display = "none";
  }, 200);
}

function flipModalCard(event) {
  // Prevent click propagation to overlay closing
  event.stopPropagation();
  
  const innerFlip = document.getElementById("modalFlipInner");
  if (innerFlip) {
    innerFlip.classList.toggle("flipped");
  }
}

function updateLightboxContent() {
  const currentYear = MEMORIES_CONFIG.timeline[currentYearIndex];
  const mem = currentYear.memories[currentMemoryIndex];
  
  const imgFront = document.getElementById("modalImgFront");
  const videoFront = document.getElementById("modalVideoFront");
  const capFront = document.getElementById("modalCaptionFront");
  const textBack = document.getElementById("modalTextBack");
  const dateBack = document.getElementById("modalDateBack");
  const locBack = document.getElementById("modalLocBack");
  
  const isVideo = mem.image.toLowerCase().endsWith(".mov") || mem.image.toLowerCase().endsWith(".mp4");
  
  // Scale pop photo front
  imgFront.style.opacity = 0;
  videoFront.style.opacity = 0;
  videoFront.pause();
  
  // Custom Modal Placeholder for decoding wait
  let modalPlaceholder = imgFront.parentElement.querySelector(".modal-heic-placeholder");
  if (modalPlaceholder) modalPlaceholder.remove();
  
  if (isVideo) {
    imgFront.style.display = "none";
    videoFront.style.display = "block";
    videoFront.src = mem.image;
    videoFront.onloadeddata = () => {
      videoFront.style.opacity = 1;
    };
    videoFront.onerror = function() {
      imgFront.style.display = "block";
      videoFront.style.display = "none";
      imgFront.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'300' height%3D'300' viewBox%3D'0%200%20300%20300'%3E%3Crect width%3D'100%25' height%3D'100%25' fill%3D'%23F7F5E6'%2F%3E%3Ctext x%3D'50%25' y%3D'50%25' dominant-baseline%3D'middle' text-anchor%3D'middle' font-family%3D'Fredoka' font-size%3D'20' fill%3D'%23777'%3E🎬 Video Error 🎬%3C%2Ftext%3E%3C%2Fsvg%3E";
      imgFront.style.opacity = 1;
    };
  } else {
    imgFront.style.display = "block";
    videoFront.style.display = "none";
    
    if (mem.image.toLowerCase().endsWith(".heic")) {
      modalPlaceholder = document.createElement("div");
      modalPlaceholder.className = "modal-heic-placeholder polaroid-placeholder";
      modalPlaceholder.style.position = "absolute";
      modalPlaceholder.style.top = "0";
      modalPlaceholder.style.left = "0";
      modalPlaceholder.style.width = "100%";
      modalPlaceholder.style.height = "100%";
      modalPlaceholder.style.display = "flex";
      modalPlaceholder.style.alignItems = "center";
      modalPlaceholder.style.justifyContent = "center";
      modalPlaceholder.style.backgroundColor = "#F7F5E6";
      imgFront.parentElement.appendChild(modalPlaceholder);
      
      imgFront.src = ""; // Empty initially
      loadHeicImage(imgFront, mem.image, modalPlaceholder);
      
      imgFront.onload = () => {
        imgFront.style.opacity = 1;
        if (modalPlaceholder) modalPlaceholder.remove();
      };
    } else {
      imgFront.src = mem.image;
      imgFront.onload = () => imgFront.style.opacity = 1;
      imgFront.onerror = function() {
        this.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'300' height%3D'300' viewBox%3D'0%200%20300%20300'%3E%3Crect width%3D'100%25' height%3D'100%25' fill%3D'%23F7F5E6'%2F%3E%3Ctext x%3D'50%25' y%3D'50%25' dominant-baseline%3D'middle' text-anchor%3D'middle' font-family%3D'Fredoka' font-size%3D'20' fill%3D'%23777'%3E💛 Missing Photo 💛%3C%2Ftext%3E%3C%2Fsvg%3E";
        imgFront.style.opacity = 1;
      };
    }
  }
  
  capFront.textContent = mem.caption.substring(0, 40) + (mem.caption.length > 40 ? "..." : "");
  
  // Lined Postcard back letter text
  textBack.textContent = mem.caption;
  dateBack.textContent = mem.date || "Anniversary Date";
  locBack.textContent = mem.location || "Together";
}

function nextMemory(event) {
  if (event) event.stopPropagation();
  
  const currentYear = MEMORIES_CONFIG.timeline[currentYearIndex];
  
  // Unflip first
  const innerFlip = document.getElementById("modalFlipInner");
  const wasFlipped = innerFlip.classList.contains("flipped");
  innerFlip.classList.remove("flipped");
  
  // Timeout helper to wait for unflip transition if it was flipped
  const delay = wasFlipped ? 300 : 0;
  
  setTimeout(() => {
    currentMemoryIndex++;
    if (currentMemoryIndex >= currentYear.memories.length) {
      // Go to next year
      currentMemoryIndex = 0;
      currentYearIndex = (currentYearIndex + 1) % MEMORIES_CONFIG.timeline.length;
    }
    
    animateModalTransition();
  }, delay);
}

function prevMemory(event) {
  if (event) event.stopPropagation();
  
  // Unflip first
  const innerFlip = document.getElementById("modalFlipInner");
  const wasFlipped = innerFlip.classList.contains("flipped");
  innerFlip.classList.remove("flipped");
  
  const delay = wasFlipped ? 300 : 0;
  
  setTimeout(() => {
    currentMemoryIndex--;
    if (currentMemoryIndex < 0) {
      // Go to previous year's end
      currentYearIndex = (currentYearIndex - 1 + MEMORIES_CONFIG.timeline.length) % MEMORIES_CONFIG.timeline.length;
      currentMemoryIndex = MEMORIES_CONFIG.timeline[currentYearIndex].memories.length - 1;
    }
    
    animateModalTransition();
  }, delay);
}

function animateModalTransition() {
  const container = document.querySelector(".flip-card-container");
  container.animate([
    { transform: 'scale(1) rotateY(0deg)', opacity: 1 },
    { transform: 'scale(0.9) rotateY(-5deg)', opacity: 0.3 },
    { transform: 'scale(1) rotateY(0deg)', opacity: 1 }
  ], {
    duration: 350,
    easing: 'ease-in-out'
  });
  
  setTimeout(updateLightboxContent, 175);
}

function initKeyboardNav() {
  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("lightboxModal");
    if (modal.style.display !== "flex") return;
    
    if (e.key === "ArrowRight") {
      nextMemory();
    } else if (e.key === "ArrowLeft") {
      prevMemory();
    } else if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === " " || e.key === "Enter") {
      const innerFlip = document.getElementById("modalFlipInner");
      if (innerFlip) innerFlip.classList.toggle("flipped");
      e.preventDefault();
    }
  });
}

// ==========================================
// 9. YOUTUBE IFRAME BGM STREAMER
// ==========================================
// Called automatically by the YouTube IFrame API script tag in index.html
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('ytPlayer', {
    height: '100',
    width: '100',
    videoId: MEMORIES_CONFIG.bgm.youtubeId,
    playerVars: {
      'autoplay': 0,
      'controls': 0,
      'loop': 1,
      'playlist': MEMORIES_CONFIG.bgm.youtubeId,
      'playsinline': 1,
      'disablekb': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  console.log("YouTube Audio Stream is loaded and ready!");
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayerUI();
  } else {
    isPlaying = false;
    updatePlayerUI();
  }
}

function togglePlay() {
  const localFile = MEMORIES_CONFIG.bgm.localFile;
  
  if (localFile) {
    if (!localAudio) {
      localAudio = new Audio(localFile);
      localAudio.loop = true;
      localAudio.onplay = () => {
        isPlaying = true;
        updatePlayerUI();
      };
      localAudio.onpause = () => {
        isPlaying = false;
        updatePlayerUI();
      };
      localAudio.ontimeupdate = updateProgressBar;
    }
    
    if (isPlaying) {
      localAudio.pause();
    } else {
      localAudio.play().catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
  } else {
    if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') {
      return;
    }
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }
}

function updatePlayerUI() {
  const playIcon = document.getElementById("playIcon");
  const reelLeft = document.getElementById("reelLeft");
  const reelRight = document.getElementById("reelRight");
  const groover = document.getElementById("lizardGroover");
  
  if (isPlaying) {
    playIcon.textContent = "⏸";
    reelLeft.classList.add("spinning");
    reelRight.classList.add("spinning");
    groover.classList.add("dancing");
    
    if (!MEMORIES_CONFIG.bgm.localFile) {
      clearInterval(progressInterval);
      progressInterval = setInterval(updateProgressBar, 1000);
    }
  } else {
    playIcon.textContent = "▶";
    reelLeft.classList.remove("spinning");
    reelRight.classList.remove("spinning");
    groover.classList.remove("dancing");
    
    if (!MEMORIES_CONFIG.bgm.localFile) {
      clearInterval(progressInterval);
    }
  }
}

function updateProgressBar() {
  const localFile = MEMORIES_CONFIG.bgm.localFile;
  
  if (localFile && localAudio) {
    const duration = localAudio.duration;
    const currentTime = localAudio.currentTime;
    if (duration > 0) {
      const percent = (currentTime / duration) * 100;
      const progressFill = document.getElementById("progressBar");
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
    }
  } else if (ytPlayer && isPlaying) {
    const duration = ytPlayer.getDuration();
    const currentTime = ytPlayer.getCurrentTime();
    
    if (duration > 0) {
      const percent = (currentTime / duration) * 100;
      const progressFill = document.getElementById("progressBar");
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
    }
  }
}

// ==========================================
// 10. UTILITIES
// ==========================================
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ==========================================
// 11. BROWSER HEIC DYNAMIC CONVERT DECODER (heic2any)
// ==========================================
const heicCache = {}; // Cache map to store decoded blob URLs: { heicUrl: blobUrl }

function loadHeicImage(imgElement, heicUrl, placeholderElement) {
  // If already decoded, load instantly from memory cache!
  if (heicCache[heicUrl]) {
    imgElement.src = heicCache[heicUrl];
    imgElement.style.display = 'block';
    if (placeholderElement) placeholderElement.style.display = 'none';
    return;
  }

  if (placeholderElement) {
    placeholderElement.style.display = 'flex';
    placeholderElement.innerHTML = `
      <span style="font-size: 1.5rem; display: inline-block; animation: spin 1.2s linear infinite; filter: drop-shadow(2px 2px 0px #1E1E1E);">🦎</span>
      <p style="font-size: 0.75rem; margin-top: 6px; font-weight: 700; color: #444; font-family: 'Fredoka', sans-serif;">Decoding HEIC...<br>Please wait</p>
    `;
  }
  imgElement.style.display = 'none';

  // Check if heic2any is loaded via CDN successfully
  if (typeof heic2any === 'undefined') {
    console.error("heic2any library is not loaded!");
    if (placeholderElement) {
      placeholderElement.innerHTML = `
        <span style="font-size: 1.5rem;">⚠️</span>
        <p style="font-size: 0.75rem; margin-top: 4px; font-weight: 700; color: var(--accent-coral);">HEIC Decoder Offline</p>
      `;
    }
    return;
  }

  fetch(heicUrl)
    .then((res) => {
      if (!res.ok) throw new Error("File not found");
      return res.blob();
    })
    .then((blob) => {
      // Convert HEIC Blob to standard JPEG Blob live inside the browser!
      return heic2any({
        blob: blob,
        toType: "image/jpeg",
        quality: 0.65
      });
    })
    .then((jpgBlob) => {
      const blobUrl = URL.createObjectURL(jpgBlob);
      heicCache[heicUrl] = blobUrl; // Save in cache so we never re-decode!
      
      imgElement.src = blobUrl;
      imgElement.style.display = 'block';
      if (placeholderElement) placeholderElement.style.display = 'none';
    })
    .catch((err) => {
      console.error("HEIC decode failed:", err);
      if (placeholderElement) {
        placeholderElement.style.display = 'flex';
        placeholderElement.innerHTML = `
          <span style="font-size: 1.5rem;">⚠️</span>
          <p style="font-size: 0.75rem; margin-top: 4px; font-weight: 700; color: var(--accent-coral);">Failed to decode<br>HEIC Image</p>
        `;
      }
    });
}

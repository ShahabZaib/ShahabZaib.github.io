// main.js

document.addEventListener("DOMContentLoaded", () => {
  // Interactive Neural Network Animation
  const canvas = document.createElement('canvas');
  canvas.id = 'neural-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Mouse position
  let mouse = { x: null, y: null };

  // Single neural network with random distribution
  const nodes = [];
  const nodeCount = 150; // Reduced from ~300 nodes
  const connectionDistance = 150; // Connection distance between nodes
  const repelDistance = 130;
  const repelForce = 2.5;

  class Node {
    constructor() {
      this.homeX = Math.random() * width;
      this.homeY = Math.random() * height;
      this.x = this.homeX;
      this.y = this.homeY;
      this.vx = 0;
      this.vy = 0;
      this.radius = 1.5;
    }

    update() {
      let cursorNearby = false;

      // Repel from mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repelDistance) {
          cursorNearby = true;
          const force = (1 - distance / repelDistance) * repelForce;
          // Apply force directly to velocity
          this.vx += (dx / distance) * force;
          this.vy += (dy / distance) * force;
        }
      }

      // Return to home position ONLY when cursor is completely gone
      if (!cursorNearby) {
        const homeDx = this.homeX - this.x;
        const homeDy = this.homeY - this.y;
        const distanceFromHome = Math.sqrt(homeDx * homeDx + homeDy * homeDy);

        // Proportional movement for smooth, non-bouncy return (Ease-out effect)
        if (distanceFromHome > 0.1) {
          // Instead of adding force (acceleration), we nudge velocity towards the target
          // This prevents overshoot/spring effect
          const returnSpeed = 0.02; // Very slow, smooth return factor
          this.vx += homeDx * returnSpeed;
          this.vy += homeDy * returnSpeed;

          // Heavy damping when returning to prevent building up too much momentum
          this.vx *= 0.35;
          this.vy *= 0.35;
        } else {
          // Snap to position
          this.x = this.homeX;
          this.y = this.homeY;
          this.vx = 0;
          this.vy = 0;
        }
      } else {
        // When cursor is nearby (floating freely)
        // Higher damping to prevent "vibrating" against the repulsion force
        this.vx *= 0.80;
        this.vy *= 0.80;
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#9ca3af66'; // Gray nodes
      ctx.fill();
    }
  }

  // Initialize nodes with random positions
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(new Node());
  }

  // Draw connections between nearby nodes
  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.30; // Optimal brightness
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(30, 58, 138, ${opacity})`; // Dark Blue connections
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw nodes
    nodes.forEach(node => {
      node.update();
      node.draw();
    });

    // Draw connections
    drawConnections();

    requestAnimationFrame(animate);
  }

  // Track mouse movement
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Start animation
  animate();

  // GSAP + ScrollTrigger
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Neural hub reacts to scroll
    gsap.to(".neural-hub", {
      scale: 1.1,
      rotation: 360,
      filter: "brightness(0.30)", // Darken to 30% brightness (15% whiter)
      scrollTrigger: {
        trigger: ".layout",
        start: "top top",
        end: "+=50%", // Complete animation after scrolling 50% of viewport height
        scrub: true
      }
    });

    // Neural nodes darken on scroll (GSAP handles this better than manual listener)
    gsap.to(".neural-node", {
      filter: "brightness(0.30)", // Darken to 30% brightness (15% whiter)
      scrollTrigger: {
        trigger: ".layout",
        start: "top top",
        end: "+=50%", // Complete animation after scrolling 50% of viewport height
        scrub: true
      }
    });

    // Neural nodes react to scroll - REMOVED to prevent conflict with hover and darkening
    // The native scroll listener below handles the darkening effect requested by the user.
  }

  // Darken neural buttons on scroll
  const neuralHub = document.querySelector('.neural-hub');

  // Fix for unwanted inline styles (force remove background-color)
  if (neuralHub) {
    neuralHub.style.backgroundColor = '';
  }

  const neuralNodesForDarkening = document.querySelectorAll('.neural-node');

  // Manual scroll listener removed - logic moved to GSAP above for better performance and conflict resolution

  const navLinks = document.querySelectorAll(".nav-link");
  const aiAgent = document.querySelector(".ai-agent");
  const neuralNodes = document.querySelectorAll(".neural-node");
  const panels = document.querySelectorAll(".content-panel");
  const dataStreams = document.querySelector(".data-streams");

  let isAnimating = false;

  function setActiveNav(targetId) {
    navLinks.forEach(link => {
      const t = link.getAttribute("data-target");
      link.classList.toggle("is-active", t === targetId);
    });
  }

  window.showPanel = function (targetId) {
    const contentDeck = document.querySelector('.content-deck');
    let hasExpanded = false;

    panels.forEach(panel => {
      if (panel.id === targetId) {
        panel.classList.add("is-expanded");
        hasExpanded = true;
      } else {
        panel.classList.remove("is-expanded");
      }
    });

    // Toggle backdrop blur
    if (hasExpanded) {
      contentDeck.classList.add('has-expanded');
    } else {
      contentDeck.classList.remove('has-expanded');
    }
  }

  function setActiveNode(targetId) {
    neuralNodes.forEach(node => {
      const s = node.getAttribute("data-section");
      node.classList.toggle("active", s === targetId);
    });
  }

  function deployToSection(targetId) {
    if (isAnimating) return;
    isAnimating = true;

    setActiveNav(targetId);

    const stage = document.getElementById("ai-stage");
    const targetNode = Array.from(neuralNodes).find(
      node => node.getAttribute("data-section") === targetId
    );

    if (!stage || !aiAgent || !targetNode) {
      showPanel(targetId);
      isAnimating = false;
      return;
    }

    // Make agent visible before animation
    gsap.set(aiAgent, {
      opacity: 1
    });

    // Get positions
    const stageRect = stage.getBoundingClientRect();
    const agentRect = aiAgent.getBoundingClientRect();
    const nodeRect = targetNode.getBoundingClientRect();

    const agentCenterX = agentRect.left + agentRect.width / 2;
    const agentCenterY = agentRect.top + agentRect.height / 2;

    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;

    const deltaX = nodeCenterX - agentCenterX;
    const deltaY = nodeCenterY - agentCenterY;

    // GSAP timeline for deployment
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        // After arrival, show content and highlight node
        setActiveNode(targetId);
        showPanel(targetId);

        // Fade data streams out after a short delay
        gsap.to(dataStreams, {
          opacity: 0,
          duration: 0.4,
          delay: 0.1
        });

        // Bring agent back closer to original area (subtle)
        gsap.to(aiAgent, {
          duration: 0.6,
          x: 0,
          y: 0,
          scale: 1,
          ease: "power2.out",
          onComplete: () => {
            isAnimating = false;
          }
        });
      }
    });

    // Start small "charge up" near neural core
    tl.to(aiAgent, {
      duration: 0.25,
      opacity: 1,
      scale: 1.05
    });

    // Enable data streams
    tl.to(
      dataStreams,
      {
        duration: 0.35,
        opacity: 0.7
      },
      "<"
    );

    // Arms processing (simple rotation wiggle)
    tl.to(
      ".agent-arm-left",
      {
        duration: 0.3,
        rotation: -20,
        yoyo: true,
        repeat: 1,
        transformOrigin: "top right"
      },
      "<"
    );

    tl.to(
      ".agent-arm-right",
      {
        duration: 0.3,
        rotation: 20,
        yoyo: true,
        repeat: 1,
        transformOrigin: "top left"
      },
      "<"
    );

    // Deploy across network
    tl.to(aiAgent, {
      duration: 0.9,
      x: deltaX,
      y: deltaY,
      scale: 1.2,
      ease: "power2.in"
    });

    // Slight "connection" bounce
    tl.to(aiAgent, {
      duration: 0.25,
      scale: 1.05,
      ease: "back.out(2)"
    });

    // Node highlight
    tl.to(
      targetNode,
      {
        duration: 0.35,
        scale: 1.15,
        opacity: 1,
        boxShadow: "0 0 45px #10b981ff, 0 0 100px #3b82f6ff"
      },
      "<"
    );
  }



  // Initial state - no panel expanded, just set active node
  // setActiveNode("about");
  gsap.set(aiAgent, { opacity: 0 });



  // Neural node click handlers
  neuralNodes.forEach(node => {
    node.addEventListener("click", evt => {
      const targetId = node.getAttribute("data-section");



      evt.preventDefault();
      deployToSection(targetId);
    });
  });

  // Nav click handlers
  navLinks.forEach(link => {
    link.addEventListener("click", evt => {
      const targetId = link.getAttribute("data-target");



      evt.preventDefault();
      deployToSection(targetId);
    });
  });



  // Close expanded panel when clicking backdrop
  const contentDeck = document.querySelector('.content-deck');
  if (contentDeck) {
    contentDeck.addEventListener('click', (e) => {
      if (e.target === contentDeck && contentDeck.classList.contains('has-expanded')) {
        // Close all expanded panels
        panels.forEach(panel => panel.classList.remove('is-expanded'));
        contentDeck.classList.remove('has-expanded');
      }
    });
  }

  // Project Card Expansion Handler
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Only trigger if the panel is expanded
      const panel = card.closest('.content-panel');
      if (panel && panel.classList.contains('is-expanded')) {
        // Toggle current card
        const wasOpen = card.classList.contains('is-open');

        // Optional: Close others (Accordion style) - Uncomment if desired
        // projectCards.forEach(c => c.classList.remove('is-open'));

        if (!wasOpen) {
          card.classList.add('is-open');
        } else {
          card.classList.remove('is-open');
        }
      }
    });
  });

  // Experience Card Expansion Handler
  const experienceCards = document.querySelectorAll('.experience-card');
  experienceCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const panel = card.closest('.content-panel');
      if (panel && panel.classList.contains('is-expanded')) {
        card.classList.toggle('is-open');
      }
    });
  });

  // Chatbot Functionality
  const chatbotOverlay = document.getElementById('chatbot-overlay');
  const chatbotTrigger = document.getElementById('chatbot-trigger');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');

  // FAQ Database
  const faqDatabase = [
    {
      q: ['who are you', 'who is this', 'about you', 'introduce yourself', 'your name', 'who is shahab'],
      a: "I am Shahab Zaib, an AI engineer working on real-world and research-driven systems."
    },
    {
      q: ['what do you do', 'your work', 'what you do', 'job', 'role', 'position'],
      a: "I build intelligent systems with a focus on generative AI, including LLMs, computer vision, and practical AI applications."
    },
    {
      q: ['background', 'education', 'study', 'degree', 'university'],
      a: "I have a BS in Computer Science and I’m pursuing an MPhil in Generative AI at Malakand University, with hands-on AI research and development experience."
    },
    {
      q: ['projects', 'what projects', 'kind of projects', 'work on', 'your projects'],
      a: "I work on AI systems, generative models, disaster management tools, RAG-powered assistants, and practical AI applications for real-world problems."
    },
    {
      q: ['generative ai', 'gen ai', 'llm', 'language model', 'gpt', 'ai models'],
      a: "Yes, I specialize in generative AI and large language models, including fine-tuning with QLoRA and building RAG-powered systems."
    },
    {
      q: ['research', 'development', 'research or development', 'academic', 'research work'],
      a: "I do both applied research and real-world system development. I’ve published research papers and built production-ready AI systems."
    },
    {
      q: ['real', 'are these real', 'projects real', 'actual work', 'deployed'],
      a: "Yes, these are real projects, including deployed systems at NDMA, research publications, and working applications."
    },
    {
      q: ['see projects', 'view projects', 'show projects', 'portfolio', 'projects section'],
      a: "You can explore my work in the Projects section, where I highlight selected projects with short descriptions."
    },
    {
      q: ['collaborate', 'freelance', 'hire', 'work together', 'available'],
      a: "Yes, I’m open to collaboration, freelance projects, and opportunities in AI/ML. Feel free to reach out through the Contact section."
    },
    {
      q: ['contact', 'reach', 'email', 'phone', 'linkedin', 'get in touch'],
      a: "You can find my contact details in the Contact section. Email: shahab111zeb@gmail.com, Phone: +92 325 9593987."
    },
    {
      q: ['experience', 'see experience', 'work experience', 'jobs', 'employment'],
      a: "Check the Experience section to see my work at NDMA, Hong Kong Polytechnic University, and other roles."
    },
    {
      q: ['cv', 'resume', 'curriculum vitae', 'download cv'],
      a: "Visit the CV section to view my full curriculum vitae and download it as a PDF."
    },
    {
      q: ['skills', 'technologies', 'tech stack', 'tools', 'frameworks'],
      a: "I work with Python, PyTorch, TensorFlow, Hugging Face, LLMs, Stable Diffusion, Django, FAISS, and more. The CV section has the full skills list."
    },
    {
      q: ['ndma', 'disaster', 'current work', 'current job'],
      a: "I currently work as an AI engineer at NDMA (National Disaster Management Authority), building AI systems for disaster management and weather advisory."
    },
    {
      q: ['publications', 'papers', 'research papers', 'published'],
      a: "Yes, I’ve published research on plant disease detection and design cognition. You can find these in the CV or Publications section."
    },
    {
      q: ['start', 'where to start', 'begin', 'navigate'],
      a: "A good place to start is the Projects section to see my work, or the Experience section to learn about my background."
    },
    {
      q: ['help', 'what can you do', 'commands', 'how to use', 'what can you answer', 'questions', 'topics'],
      a: "I can answer questions about my projects, experience, skills, education, research, and how to contact me. Try asking about any of these."
    },
    {
      q: ['machine learning', 'ml', 'deep learning', 'dl', 'neural networks'],
      a: "I have experience in ML and deep learning, including CNNs, transformers, GANs, and other architectures for computer vision and NLP."
    },
    {
      q: ['fine-tuning', 'finetune', 'qlora', 'lora', 'train', 'training models'],
      a: "I specialize in LLM fine-tuning using QLoRA and LoRA. I’ve fine-tuned LLaMA models for specific domains with strong results."
    },
    {
      q: ['computer vision', 'cv', 'image', 'vision'],
      a: "I work on computer vision projects such as plant disease detection, image generation with Stable Diffusion, and visual components for disaster-related systems."
    },
    {
      q: ['nlp', 'natural language', 'text', 'language processing'],
      a: "I have experience in NLP, including sentiment analysis, text classification, and building RAG-powered conversational AI systems."
    }
  ];


  function findAnswer(userQuestion) {
    const normalizedQuestion = userQuestion.toLowerCase().trim();

    // Score each FAQ entry based on pattern matches
    let bestMatch = null;
    let bestScore = 0;

    for (const faq of faqDatabase) {
      let score = 0;

      for (const pattern of faq.q) {
        // Create regex pattern that matches whole words
        const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

        if (regex.test(normalizedQuestion)) {
          // Give higher score for exact matches
          if (normalizedQuestion === pattern) {
            score += 10;
          } else if (normalizedQuestion.includes(pattern)) {
            score += 5;
          } else {
            score += 3;
          }
        }

        // Also check for partial word matches (more lenient)
        if (normalizedQuestion.includes(pattern)) {
          score += 1;
        }
      }

      // Update best match if this FAQ has a higher score
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq.a;
      }
    }

    // Return best match if score is high enough, otherwise return help message
    if (bestScore >= 3) {
      return bestMatch;
    }

    return "I'm not sure about that specific question. \n\nHere are some topics I can help with:\n\n• Who is Shahab? (background, education)\n• What does he do? (work, skills, technologies)\n• Projects and research\n• Experience and jobs\n• Contact information\n• How to collaborate\n\nTry asking about any of these topics!";
  }

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'bot-message';
    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function handleUserMessage() {
    const userMessage = chatbotInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, true);
    chatbotInput.value = '';

    setTimeout(() => {
      const botResponse = findAnswer(userMessage);
      addMessage(botResponse, false);
    }, 500);
  }

  // Event Listeners
  if (chatbotTrigger) {
    chatbotTrigger.addEventListener('click', () => {
      chatbotOverlay.classList.add('active');
    });
  }

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotOverlay.classList.remove('active');
    });
  }

  if (chatbotOverlay) {
    chatbotOverlay.addEventListener('click', (e) => {
      if (e.target === chatbotOverlay) {
        chatbotOverlay.classList.remove('active');
      }
    });
  }

  if (chatbotSend) {
    chatbotSend.addEventListener('click', handleUserMessage);
  }

  if (chatbotInput) {
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleUserMessage();
      }
    });
  }
});

// ==UserScript==
// @name         log-panel-pockieninja
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Panel log bisa diminimize, draggable dan auto-scroll (dengan posisi tetap setelah refresh)
// @author       Merro
// @match        *://*.pockieninja.online/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Ambil posisi terakhir dari localStorage
  const savedPosition = JSON.parse(localStorage.getItem('logPanelPosition')) || {};

  // Buat panel
  const panel = document.createElement('div');
  panel.id = 'custom-log-panel';
  panel.style.position = 'fixed';
  panel.style.left = savedPosition.left || '';
  panel.style.top = savedPosition.top || '';
  panel.style.bottom = savedPosition.bottom || '10px';
  panel.style.right = savedPosition.right || '10px';
  panel.style.width = '300px';
  panel.style.height = '200px';
  panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  panel.style.color = '#0f0';
  panel.style.fontFamily = 'monospace';
  panel.style.fontSize = '12px';
  panel.style.border = '1px solid #333';
  panel.style.zIndex = '999999';
  panel.style.overflow = 'hidden';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';

  // Header panel
  const header = document.createElement('div');
  header.style.backgroundColor = '#222';
  header.style.cursor = 'move';
  header.style.padding = '4px 8px';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.userSelect = 'none';
  header.innerHTML = `<span style="color: #0f0;">Log</span>`;

  // Tombol minimize
  const minimizeBtn = document.createElement('button');
  minimizeBtn.textContent = '–';
  minimizeBtn.style.background = 'none';
  minimizeBtn.style.border = 'none';
  minimizeBtn.style.color = '#0f0';
  minimizeBtn.style.cursor = 'pointer';
  minimizeBtn.style.fontSize = '16px';
  minimizeBtn.style.lineHeight = '1';
  minimizeBtn.style.marginLeft = '8px';

  header.appendChild(minimizeBtn);
  panel.appendChild(header);

  // Isi log
  const content = document.createElement('div');
  content.style.flex = '1';
  content.style.overflowY = 'auto';
  content.style.padding = '4px';
  panel.appendChild(content);

  document.body.appendChild(panel);

  // Minimize logic
  let minimized = false;
  minimizeBtn.addEventListener('click', () => {
    minimized = !minimized;
    content.style.display = minimized ? 'none' : 'block';
    panel.style.height = minimized ? 'auto' : '200px';
  });


  let isDragging = false, offsetX = 0, offsetY = 0;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.getBoundingClientRect().left;
    offsetY = e.clientY - panel.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const left = e.clientX - offsetX;
    const top = e.clientY - offsetY;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxLeft = vw - panel.offsetWidth;
    const maxTop = vh - panel.offsetHeight;

    panel.style.left = Math.max(0, Math.min(maxLeft, left)) + 'px';
    panel.style.top = Math.max(0, Math.min(maxTop, top)) + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {

      localStorage.setItem('logPanelPosition', JSON.stringify({
        left: panel.style.left,
        top: panel.style.top,
        right: 'auto',
        bottom: 'auto'
      }));
    }
    isDragging = false;
  });


  const originalConsoleLog = console.log;
  console.log = function (...args) {
    originalConsoleLog.apply(console, args);


    const fullMsg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');


    const blockedKeywords = [
      '__cf_bm',
      'AudioContext was prevented',
      'Firefox can’t establish a connection',
      'Phaser',
      'cookie',
      'rejected',
      'socket.io',
    ];


    if (blockedKeywords.some(keyword => fullMsg.toLowerCase().includes(keyword.toLowerCase()))) return;


    const msg = document.createElement('div');
    msg.textContent = fullMsg;


    msg.classList.add('blink-effect');

    content.appendChild(msg);
    content.scrollTop = content.scrollHeight;
  };

  // Log awal
  console.log("Monitoring Log");

  const style = document.createElement('style');
  style.textContent = `
    .blink-effect {
      animation: blink 1s ease-out 1;
    }

    @keyframes blink {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

})();

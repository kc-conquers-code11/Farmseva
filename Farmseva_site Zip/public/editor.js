(function() {
    'use strict';
  
    // Track currently selected element
    let selectedElement = null;
    let hoverElement = null;
    
    // Styles for visual feedback
    const hoverStyles = {
      outline: '2px solid rgba(59, 130, 246, 0.5)',
      outlineOffset: '2px',
      transition: 'outline 0.15s ease-in-out'
    };
    
    const selectedStyles = {
      outline: '2px solid rgb(59, 130, 246)',
      outlineOffset: '2px'
    };
  
    // Store original styles to restore later
    const originalStyles = new WeakMap();
  
    // Helper to save original styles
    function saveOriginalStyles(element) {
      if (!originalStyles.has(element)) {
        originalStyles.set(element, {
          outline: element.style.outline,
          outlineOffset: element.style.outlineOffset,
          transition: element.style.transition
        });
      }
    }
  
    // Helper to restore original styles
    function restoreOriginalStyles(element) {
      const original = originalStyles.get(element);
      if (original) {
        element.style.outline = original.outline || '';
        element.style.outlineOffset = original.outlineOffset || '';
        element.style.transition = original.transition || '';
      }
    }
  
    // Apply hover styles
    function applyHoverStyles(element) {
      saveOriginalStyles(element);
      Object.assign(element.style, hoverStyles);
    }
  
    // Apply selected styles
    function applySelectedStyles(element) {
      saveOriginalStyles(element);
      Object.assign(element.style, selectedStyles);
    }
  
    // Check if element is text-editable (simple text node without children)
    function isTextEditable(element) {
      const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'li', 'td', 'th', 'a'];
      const tag = element.tagName.toLowerCase();
      
      // Check if it's a text tag and has no child elements (only text nodes)
      return textTags.includes(tag) && 
             element.children.length === 0 &&
             element.childNodes.length > 0;
    }
  
    // Handle mouse over for hover effect
    document.addEventListener('mouseover', function(e) {
      const target = e.target.closest('[data-editor-id]');
      
      if (target && target !== selectedElement) {
        // Remove previous hover
        if (hoverElement && hoverElement !== selectedElement) {
          restoreOriginalStyles(hoverElement);
        }
        
        // Apply hover to new element
        hoverElement = target;
        if (target !== selectedElement) {
          applyHoverStyles(target);
        }
      }
    });
  
    // Handle mouse out
    document.addEventListener('mouseout', function(e) {
      const target = e.target.closest('[data-editor-id]');
      
      if (target === hoverElement && target !== selectedElement) {
        restoreOriginalStyles(target);
        hoverElement = null;
      }
    });
  
    // Handle click for selection
    document.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target.closest('[data-editor-id]');
      
      if (target) {
        // Remove previous selection
        if (selectedElement && selectedElement !== target) {
          restoreOriginalStyles(selectedElement);
        }
        
        // Apply selection to new element
        selectedElement = target;
        applySelectedStyles(target);
        
        // Gather element data
        const id = target.getAttribute('data-editor-id');
        const tag = target.tagName.toLowerCase();
        const isText = isTextEditable(target);
        const text = isText ? target.innerText : null;
        const classes = target.className;
        
        // Send selection data to parent
        const data = {
          type: 'select',
          id: id,
          tag: tag,
          isText: isText,
          text: text,
          classes: classes
        };
        
        window.parent.postMessage(data, '*');
        
        // Enable inline text editing if applicable
        if (isText) {
          // Prevent multiple editing sessions on the same element
          if (target.contentEditable === 'true') {
            return; // Already in editing mode
          }
          
          target.contentEditable = 'true';
          target.focus();
          
          // Select all text for easy editing
          const range = document.createRange();
          range.selectNodeContents(target);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Handle blur to save changes and cleanup
          const handleBlur = function() {
            target.contentEditable = 'false';
            
            // Send updated text to parent
            window.parent.postMessage({
              type: 'updateText',
              id: id,
              newText: target.innerText
            }, '*');
            
            // Clean up all event listeners
            target.removeEventListener('blur', handleBlur);
            target.removeEventListener('keydown', handleKeydown);
          };
          
          // Handle Enter key to finish editing
          const handleKeydown = function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              target.blur(); // This will trigger handleBlur
            }
          };
          
          // Add event listeners
          target.addEventListener('blur', handleBlur);
          target.addEventListener('keydown', handleKeydown);
        }
      }
    });
  
    // Prevent default link behavior in editor mode
    document.addEventListener('click', function(e) {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        e.preventDefault();
      }
    }, true);
  
    // Listen for messages from parent (e.g., to clear selection or apply updates)
    window.addEventListener('message', function(e) {
      if (e.data.type === 'clearSelection' && selectedElement) {
        restoreOriginalStyles(selectedElement);
        selectedElement = null;
      } else if (e.data.type === 'applyOptimisticUpdate') {
        // Apply optimistic updates immediately
        const element = document.querySelector(`[data-editor-id="${e.data.id}"]`);
        if (element) {
          if (e.data.action === 'style') {
            // Parse the value to extract Tailwind class
            const newClass = e.data.value;
  
            // Get current classes
            let classes = element.className.split(' ').filter(c => c);
  
            // Replacement rules by utility group. We replace previous classes in the same
            // group (ignoring a leading '!'), but keep responsive/state variants like 'sm:' or 'hover:'.
            const getClassesToRemove = (incoming) => {
              const stripBang = (s) => (s && s.startsWith('!') ? s.slice(1) : s);
              const cls = stripBang(incoming);
  
              // Skip if nothing meaningful
              if (!cls) return null;
  
              const isVariant = (s) => s.includes(':');
  
              // Helpers to test tokens (without '!')
              const matchers = {
                textColor: /^text-(?!xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
                textSize: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
                bgColor: /^bg-/,
                borderColor: /^border-(?!0|2|4|8|t|b|l|r|x|y)/,
                borderWidth: /^(?:border|border-(?:0|2|4|8))$/,
                rounded: /^rounded/,
                fontWeight: /^font-/,
                paddingAll: /^p-\d+$/,
                paddingSide: /^p[tlbr]-\d+$/,
                marginAll: /^m-\d+$/,
                marginSide: /^m[tlbr]-\d+$/,
              };
  
              let group = null;
              if (matchers.textColor.test(cls)) group = 'textColor';
              else if (matchers.textSize.test(cls)) group = 'textSize';
              else if (matchers.bgColor.test(cls)) group = 'bgColor';
              else if (matchers.borderColor.test(cls)) group = 'borderColor';
              else if (matchers.borderWidth.test(cls)) group = 'borderWidth';
              else if (matchers.rounded.test(cls)) group = 'rounded';
              else if (matchers.fontWeight.test(cls)) group = 'fontWeight';
              else if (matchers.paddingAll.test(cls)) group = 'paddingAll';
              else if (matchers.paddingSide.test(cls)) group = 'paddingSide';
              else if (matchers.marginAll.test(cls)) group = 'marginAll';
              else if (matchers.marginSide.test(cls)) group = 'marginSide';
  
              if (!group) return null;
  
              // For side-specific spacing, compute the side key (e.g., 'mt', 'pl')
              const sideKey = (group === 'paddingSide' || group === 'marginSide') ? cls.substring(0, 2) : null;
  
              return (c) => {
                const token = stripBang(c);
                if (!token) return false;
                // Preserve variant/state classes
                if (isVariant(token)) return false;
  
                switch (group) {
                  case 'textColor': return matchers.textColor.test(token);
                  case 'textSize': return matchers.textSize.test(token);
                  case 'bgColor': return matchers.bgColor.test(token);
                  case 'borderColor': return matchers.borderColor.test(token);
                  case 'borderWidth': return matchers.borderWidth.test(token);
                  case 'rounded': return matchers.rounded.test(token);
                  case 'fontWeight': return matchers.fontWeight.test(token);
                  case 'paddingAll': return matchers.paddingAll.test(token);
                  case 'paddingSide': return new RegExp('^' + sideKey + '-\\d+$').test(token);
                  case 'marginAll': return matchers.marginAll.test(token);
                  case 'marginSide': return new RegExp('^' + sideKey + '-\\d+$').test(token);
                  default: return false;
                }
              };
            };
  
            const shouldRemove = getClassesToRemove(newClass);
            if (shouldRemove) {
              classes = classes.filter(c => !shouldRemove(c));
            }
  
            // Add the new class with ! prefix to ensure it takes priority; avoid duplicates
            if (!classes.includes(newClass)) {
              classes.push(newClass);
            }
  
            // De-duplicate and apply
            classes = Array.from(new Set(classes.filter(Boolean)));
            element.className = classes.join(' ');
  
            // Inline style fallbacks so preview updates immediately even if Tailwind doesn't have the utility compiled
            // 1) Arbitrary color utilities: !bg-[#ff0000], !text-[#222222], !border-[#00ff00]
            const arbitraryMatch = newClass.match(/^!?((bg|text|border))-\[(#[0-9a-fA-F]{3,8})\]$/);
            if (arbitraryMatch) {
              const util = arbitraryMatch[1];
              const color = arbitraryMatch[3];
              if (util === 'bg') element.style.backgroundColor = color;
              if (util === 'text') element.style.color = color;
              if (util === 'border') element.style.borderColor = color;
            } else {
              // If switching to a non-arbitrary utility in these groups, clear inline color to let classes apply
              if (/^!?bg-/.test(newClass)) element.style.backgroundColor = '';
              if (/^!?text-/.test(newClass)) element.style.color = '';
              if (/^!?border-/.test(newClass)) element.style.borderColor = '';
            }
  
            // 2) Spacing utilities (padding/margin): p-4, pt-2, m-8, mt-1, etc.
            const spacingMatch = newClass.match(/^!?([pm])([tlbr])?-(\d+)$/);
            if (spacingMatch) {
              const kind = spacingMatch[1]; // 'p' or 'm'
              const side = spacingMatch[2] || '';
              const scale = parseInt(spacingMatch[3], 10);
              const value = `${0.25 * scale}rem`;
              const setSpacing = (prop) => { element.style[prop] = value; };
              if (kind === 'p') {
                if (!side) { setSpacing('paddingTop'); setSpacing('paddingRight'); setSpacing('paddingBottom'); setSpacing('paddingLeft'); }
                if (side === 't') setSpacing('paddingTop');
                if (side === 'r') setSpacing('paddingRight');
                if (side === 'b') setSpacing('paddingBottom');
                if (side === 'l') setSpacing('paddingLeft');
              } else if (kind === 'm') {
                if (!side) { setSpacing('marginTop'); setSpacing('marginRight'); setSpacing('marginBottom'); setSpacing('marginLeft'); }
                if (side === 't') setSpacing('marginTop');
                if (side === 'r') setSpacing('marginRight');
                if (side === 'b') setSpacing('marginBottom');
                if (side === 'l') setSpacing('marginLeft');
              }
            }
  
            // 3) Font size: text-sm ... text-6xl
            const textSizeMatch = newClass.match(/^!?text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/);
            if (textSizeMatch) {
              const size = textSizeMatch[1];
              const sizeMap = {
                xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem',
                '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem',
                '6xl': '3.75rem', '7xl': '4.5rem', '8xl': '6rem', '9xl': '8rem'
              };
              element.style.fontSize = sizeMap[size] || '';
              // Tailwind sets line-height with sizes; keep simple here
            }
  
            // 4) Font weight: font-thin ... font-extrabold
            const fontWeightMatch = newClass.match(/^!?font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/);
            if (fontWeightMatch) {
              const weight = fontWeightMatch[1];
              const weightMap = {
                thin: '100', extralight: '200', light: '300', normal: '400', medium: '500',
                semibold: '600', bold: '700', extrabold: '800', black: '900'
              };
              element.style.fontWeight = weightMap[weight] || '';
            }
  
            // 5) Border width: border, border-0, border-2, border-4, border-8
            const borderWidthMatch = newClass.match(/^!?border(?:-(0|2|4|8))?$/);
            if (borderWidthMatch) {
              const w = borderWidthMatch[1];
              const px = w === undefined ? 1 : parseInt(w, 10);
              element.style.borderStyle = px === 0 ? '' : 'solid';
              element.style.borderWidth = px === 0 ? '0' : `${px}px`;
            }
  
            // 6) Border radius: rounded, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-full, rounded-none
            const radiusMatch = newClass.match(/^!?rounded(?:-(none|sm|md|lg|xl|2xl|full))?$/);
            if (radiusMatch) {
              const r = radiusMatch[1] || 'DEFAULT';
              const radiusMap = {
                none: '0px', DEFAULT: '0.25rem', sm: '0.125rem', md: '0.375rem', lg: '0.5rem',
                xl: '0.75rem', '2xl': '1rem', full: '9999px'
              };
              element.style.borderRadius = radiusMap[r] || '';
            }
            
            // If this is the selected element, update the selection message
            if (element === selectedElement) {
              window.parent.postMessage({
                type: 'select',
                id: e.data.id,
                tag: element.tagName.toLowerCase(),
                isText: isTextEditable(element),
                text: isTextEditable(element) ? element.innerText : null,
                classes: element.className
              }, '*');
            }
          } else if (e.data.action === 'text') {
            element.innerText = e.data.value;
          }
        }
      }
    });
  
    console.log('Visual Editor initialized successfully');
  })();
  
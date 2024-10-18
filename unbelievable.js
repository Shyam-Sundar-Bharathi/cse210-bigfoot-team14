(function() {
  // Define the bigfoot function and options
  function bigfoot(options) {
    // Your bigfoot logic goes here
    // Define variables
      var addBreakpoint, baseFontSize, bigfoot, buttonHover, calculatePixelDimension, cleanFootnoteLinks, clickButton, createPopover, defaults, deleteEmptyOrHR, escapeKeypress, footnoteInit, getSetting, makeDefaultCallbacks, popoverStates, positionTooltip, removeBackLinks, removeBreakpoint, removePopovers, replaceWithReferenceAttributes, repositionFeet, roomCalc, settings, touchClick, unhoverFeet, updateSetting, viewportDetails;

      // Initialize bigfoot as undefined
      bigfoot = undefined;

      // Default settings object
      defaults = {
      actionOriginalFN: "hide",
      activateCallback: function() {},
      activateOnHover: false,
      allowMultipleFN: false,
      anchorPattern: /(fn|footnote|note)[:\-_\d]/gi,
      anchorParentTagname: 'sup',
      breakpoints: {},
      deleteOnUnhover: false,
      footnoteParentClass: 'footnote',
      footnoteTagname: 'li',
      hoverDelay: 250,
      numberResetSelector: undefined,
      popoverDeleteDelay: 300,
      popoverCreateDelay: 100,
      animationDuration: 200,
      positionContent: true,
      preventPageScroll: true,
      scope: false,
      useFootnoteOnlyOnce: true,
      contentMarkup: "<aside class='bigfoot-footnote is-positioned-bottom' data-footnote-number='{{FOOTNOTENUM}}' data-footnote-identifier='{{FOOTNOTEID}}' alt='Footnote {{FOOTNOTENUM}}'> <div class='bigfoot-footnote__wrapper'> <div class='bigfoot-footnote__content'> {{FOOTNOTECONTENT}} </div></div> <div class='bigfoot-footnote__tooltip'></div> </aside>",
      buttonMarkup: "<div class='bigfoot-footnote__container'> <button class='bigfoot-footnote__button' id='{{SUP:data-footnote-backlink-ref}}' data-footnote-number='{{FOOTNOTENUM}}' data-footnote-identifier='{{FOOTNOTEID}}' alt='See Footnote {{FOOTNOTENUM}}' rel='footnote' data-bigfoot-footnote='{{FOOTNOTECONTENT}}'> <svg class='bigfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg> <svg class='bigfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg> <svg class='bigfoot-footnote__button__circle' viewbox='0 0 6 6' preserveAspectRatio='xMinYMin'><circle r='3' cx='3' cy='3' fill='white'></circle></svg> </button></div>"
      };

      // Use Object.assign to merge defaults with options (if options exist)
      settings = Object.assign({}, defaults, options);

      // Initialize popoverStates as an empty object
      popoverStates = {};

      var footnoteInit = function() {
          var curResetElement, currentLastFootnoteLink, footnoteAnchors, footnoteButton, lastResetElement, parent, relevantFNLink, relevantFootnote, finalFNLinks, footnoteButtonSearchQuery, footnoteContent, footnoteIDNum, footnoteLinks, footnoteNum, footnotes, i, j, results;
        
          footnoteButtonSearchQuery = settings.scope ? settings.scope + " a[href*='#']" : "a[href*='#']";
          
          // Get all the footnote anchors based on the search query
          footnoteAnchors = Array.from(document.querySelectorAll(footnoteButtonSearchQuery)).filter(function(anchor) {
            var relAttr = anchor.getAttribute("rel");
            if (relAttr === null) {
              relAttr = "";
            }
            return (anchor.getAttribute("href") + relAttr).match(settings.anchorPattern) && 
                   !anchor.closest("[class*=" + settings.footnoteParentClass + "]:not(a):not(" + settings.anchorParentTagname + ")");
          });
        
          footnotes = [];
          footnoteLinks = [];
          finalFNLinks = [];
        
          cleanFootnoteLinks(footnoteAnchors, footnoteLinks);
        
          footnoteLinks.forEach(function(link) {
            var closestFootnoteEl, relatedFN;
            
            relatedFN = link.getAttribute("data-footnote-ref").replace(/[:.+~*\]\[]/g, "\\$&");
        
            if (settings.useFootnoteOnlyOnce) {
              relatedFN = relatedFN + ":not(.footnote-processed)";
            }
        
            closestFootnoteEl = document.querySelector(relatedFN);
            
            if (closestFootnoteEl) {
              closestFootnoteEl.classList.add("footnote-processed");
              footnotes.push(closestFootnoteEl);
              finalFNLinks.push(link);
            }
          });
        
          currentLastFootnoteLink = document.querySelector("[data-footnote-identifier]:last-child");
          footnoteIDNum = currentLastFootnoteLink ? +currentLastFootnoteLink.getAttribute("data-footnote-identifier") : 0;
        
          results = [];
          
          for (i = 0; i < footnotes.length; i++) {
            footnoteContent = removeBackLinks(footnotes[i].innerHTML.trim(), finalFNLinks[i].getAttribute("data-footnote-backlink-ref"));
            footnoteContent = footnoteContent.replace(/"/g, "&quot;").replace(/&lt;/g, "&ltsym;").replace(/&gt;/g, "&gtsym;").replace(/'/g, "&apos;");
            
            footnoteIDNum += 1;
            footnoteButton = "";
            relevantFNLink = finalFNLinks[i];
            relevantFootnote = footnotes[i];
        
            if (settings.numberResetSelector) {
              curResetElement = relevantFNLink.closest(settings.numberResetSelector);
              if (curResetElement === lastResetElement) {
                footnoteNum += 1;
              } else {
                footnoteNum = 1;
              }
              lastResetElement = curResetElement;
            } else {
              footnoteNum = footnoteIDNum;
            }
        
            if (!footnoteContent.startsWith("<")) {
              footnoteContent = "<p>" + footnoteContent + "</p>";
            }
        
            footnoteButton = settings.buttonMarkup
              .replace(/\{\{FOOTNOTENUM\}\}/g, footnoteNum)
              .replace(/\{\{FOOTNOTEID\}\}/g, footnoteIDNum)
              .replace(/\{\{FOOTNOTECONTENT\}\}/g, footnoteContent);
        
            footnoteButton = replaceWithReferenceAttributes(footnoteButton, "SUP", relevantFNLink);
            footnoteButton = replaceWithReferenceAttributes(footnoteButton, "FN", relevantFootnote);
        
            var footnoteButtonElement = document.createElement('div');
            footnoteButtonElement.innerHTML = footnoteButton;
            var footnoteButtonNode = footnoteButtonElement.firstChild;
            relevantFNLink.insertAdjacentElement('beforebegin', footnoteButtonNode);
        
            parent = relevantFootnote.parentNode;
        
            switch (settings.actionOriginalFN.toLowerCase()) {
              case "hide":
                relevantFNLink.classList.add("footnote-print-only");
                relevantFootnote.classList.add("footnote-print-only");
                results.push(deleteEmptyOrHR(parent));
                break;
              case "delete":
                relevantFNLink.remove();
                relevantFootnote.remove();
                results.push(deleteEmptyOrHR(parent));
                break;
              default:
                results.push(relevantFNLink.classList.add("footnote-print-only"));
            }
          }
        
          return results;
      };

      var cleanFootnoteLinks = function(footnoteAnchors, footnoteLinks) {
          var parent, supChild, linkHREF, linkID;
          
          // Initialize footnoteLinks if not provided
          if (footnoteLinks == null) {
            footnoteLinks = [];
          }
        
          footnoteAnchors.forEach(function(anchor) {
            linkHREF = "#" + anchor.getAttribute("href").split("#")[1];
            
            parent = anchor.closest(settings.anchorParentTagname);
            supChild = anchor.querySelector(settings.anchorParentTagname);
        
            if (parent) {
              linkID = (parent.getAttribute("id") || "") + (anchor.getAttribute("id") || "");
              parent.setAttribute("data-footnote-backlink-ref", linkID);
              parent.setAttribute("data-footnote-ref", linkHREF);
              footnoteLinks.push(parent);
            } else if (supChild) {
              linkID = (supChild.getAttribute("id") || "") + (anchor.getAttribute("id") || "");
              anchor.setAttribute("data-footnote-backlink-ref", linkID);
              anchor.setAttribute("data-footnote-ref", linkHREF);
              footnoteLinks.push(anchor);
            } else {
              linkID = anchor.getAttribute("id") || "";
              anchor.setAttribute("data-footnote-backlink-ref", linkID);
              anchor.setAttribute("data-footnote-ref", linkHREF);
              footnoteLinks.push(anchor);
            }
          });
      };

      var deleteEmptyOrHR = function(el) {
          var parent;
          
          if (!el) return; // Ensure element exists
          
          // Check if element is empty or contains only elements with the class 'footnote-print-only'
          if (el.innerHTML.trim() === "" || Array.from(el.children).every(child => child.classList.contains("footnote-print-only"))) {
            parent = el.parentElement;
        
            if (settings.actionOriginalFN.toLowerCase() === "delete") {
              el.remove();  // Remove element if action is 'delete'
            } else {
              el.classList.add("footnote-print-only");  // Otherwise, add 'footnote-print-only' class
            }
        
            // Recursively call function for parent element
            deleteEmptyOrHR(parent);
          } 
          // Check if element only contains 'hr' elements that are not marked as 'footnote-print-only'
          else if (Array.from(el.children).filter(child => !child.classList.contains("footnote-print-only")).every(child => child.tagName === "HR")) {
            parent = el.parentElement;
        
            if (settings.actionOriginalFN.toLowerCase() === "delete") {
              el.remove();  // Remove element if action is 'delete'
            } else {
              Array.from(el.children).forEach(function(child) {
                if (child.tagName === "HR") {
                  child.classList.add("footnote-print-only");  // Add 'footnote-print-only' class to HR elements
                }
              });
              el.classList.add("footnote-print-only");
            }
        
            // Recursively call function for parent element
            deleteEmptyOrHR(parent);
          }
      };
      
      var removeBackLinks = function(footnoteHTML, backlinkID) {
          var regex;
          
          // Check if backlinkID contains spaces and modify it accordingly
          if (backlinkID.indexOf(' ') >= 0) {
            backlinkID = backlinkID.trim().replace(/\s+/g, "|").replace(/(.*)/g, "($1)");
          }
        
          // Create a regular expression to match the backlink anchor tag
          regex = new RegExp("(\\s|&nbsp;)*<\\s*a[^#<]*#" + backlinkID + "[^>]*>(.*?)<\\s*/\\s*a>", "g");
          
          // Replace matching backlinks with an empty string and remove any stray "[]"
          return footnoteHTML.replace(regex, "").replace("[]", "");
      };

      var replaceWithReferenceAttributes = function(string, referenceKeyword, referenceElement) {
          var refMatches, refRegex, refReplaceText;
          
          // Create a regular expression to find reference attributes in the string
          refRegex = new RegExp("\\{\\{" + referenceKeyword + ":([^\\}]*)\\}\\}", "g");
          refMatches = refRegex.exec(string);
          
          // Loop through all matches found in the string
          while (refMatches) {
            if (refMatches[1]) {
              // Get the attribute value from the referenceElement
              refReplaceText = referenceElement.getAttribute(refMatches[1]) || "";
              // Replace the placeholder in the string with the attribute value
              string = string.replace("{{" + referenceKeyword + ":" + refMatches[1] + "}}", refReplaceText);
            }
            // Find the next match
            refMatches = refRegex.exec(string);
          }
          
          return string; // Return the modified string
      };
      
      var buttonHover = function(event) {
          var buttonHovered, dataIdentifier, otherPopoverSelector;
        
          if (settings.activateOnHover) {
            buttonHovered = event.target.closest(".bigfoot-footnote__button");
            dataIdentifier = "[data-footnote-identifier='" + buttonHovered.getAttribute("data-footnote-identifier") + "']";
        
            if (buttonHovered.classList.contains("is-active")) {
              return;
            }
        
            buttonHovered.classList.add("is-hover-instantiated");
        
            if (!settings.allowMultipleFN) {
              otherPopoverSelector = ".bigfoot-footnote:not(" + dataIdentifier + ")";
              removePopovers(otherPopoverSelector);
            }
        
            createPopover(".bigfoot-footnote__button" + dataIdentifier).classList.add("is-hover-instantiated");
          }
      };
        
      var touchClick = function(event) {
          var nearButton, nearFootnote, target;
        
          target = event.target;
          nearButton = target.closest(".bigfoot-footnote__button");
          nearFootnote = target.closest(".bigfoot-footnote");
        
          if (nearButton) {
            event.preventDefault();
            clickButton(nearButton);
          } else if (!nearFootnote) {
            if (document.querySelectorAll(".bigfoot-footnote").length > 0) {
              removePopovers();
            }
          }
      };
        
      var clickButton = function(button) {
          var dataIdentifier;
        
          button.blur();
          dataIdentifier = "data-footnote-identifier='" + button.getAttribute("data-footnote-identifier") + "'";
        
          if (button.classList.contains("changing")) {
            return;
          } else if (!button.classList.contains("is-active")) {
            button.classList.add("changing");
            setTimeout(function() {
              button.classList.remove("changing");
            }, settings.popoverCreateDelay);
        
            createPopover(".bigfoot-footnote__button[" + dataIdentifier + "]");
            button.classList.add("is-click-instantiated");
        
            if (!settings.allowMultipleFN) {
              removePopovers(".bigfoot-footnote:not([" + dataIdentifier + "])");
            }
          } else {
            if (!settings.allowMultipleFN) {
              removePopovers();
            } else {
              removePopovers(".bigfoot-footnote[" + dataIdentifier + "]");
            }
          }
      };
      
      var createPopover = function(selector) {
          var buttons, popoversCreated = [];
        
          if (typeof selector !== "string" && settings.allowMultipleFN) {
            buttons = selector;
          } else if (typeof selector !== "string") {
            buttons = selector[0]; // Assuming `first()` returns the first element
          } else if (settings.allowMultipleFN) {
            buttons = document.querySelectorAll(selector);
          } else {
            buttons = document.querySelector(selector + ":first").closest(".bigfoot-footnote__button");
          }
        
          buttons.forEach(function(button) {
            var content, contentContainer, $this = button;
            try {
              content = settings.contentMarkup
                .replace(/\{\{FOOTNOTENUM\}\}/g, $this.getAttribute("data-footnote-number"))
                .replace(/\{\{FOOTNOTEID\}\}/g, $this.getAttribute("data-footnote-identifier"))
                .replace(/\{\{FOOTNOTECONTENT\}\}/g, $this.getAttribute("data-bigfoot-footnote"))
                .replace(/\&gtsym\;/g, "&gt;")
                .replace(/\&ltsym\;/g, "&lt;");
        
              content = replaceWithReferenceAttributes(content, "BUTTON", $this);
            } finally {
              var contentElement = document.createElement("div");
              contentElement.innerHTML = content;
        
              try {
                settings.activateCallback(contentElement, $this);
              } catch (error) {}
        
              $this.parentNode.insertBefore(contentElement, $this.nextSibling);
              popoverStates[$this.getAttribute("data-footnote-identifier")] = "init";
              
              var maxWidth = calculatePixelDimension(getComputedStyle(contentElement).maxWidth, contentElement);
              contentElement.setAttribute("bigfoot-max-width", maxWidth);
              contentElement.style.maxWidth = "10000px"; // Setting to a very large value
              contentElement.style.transitionDuration = settings.animationDuration + "ms";
        
              contentContainer = contentElement.querySelector(".bigfoot-footnote__content");
              contentElement.setAttribute("data-bigfoot-max-height", calculatePixelDimension(getComputedStyle(contentContainer).maxHeight, contentContainer));
              repositionFeet();
              $this.classList.add("is-active");
        
              // Bind scroll handler to the content container
              bindScrollHandler.call(contentContainer);
        
              popoversCreated.push(contentElement);
            }
          });
        
          setTimeout(function() {
            popoversCreated.forEach(function(popover) {
              popover.classList.add("is-active");
            });
          }, settings.popoverCreateDelay);
        
          return popoversCreated;
        };
        
      var baseFontSize = function() {
          var el = document.createElement("div");
          el.style.cssText = "display:inline-block;padding:0;line-height:1;position:absolute;visibility:hidden;font-size:1em;";
          var m = document.createElement("M");
          el.appendChild(m);
          document.body.appendChild(el);
          
          var size = el.offsetHeight;
          document.body.removeChild(el);
          
          return size;
      };
        
      var calculatePixelDimension = function(dim, el) {
          if (dim === "none") {
            dim = 10000; // Very large value for "none"
          } else if (dim.includes("rem")) {
            dim = parseFloat(dim) * baseFontSize();
          } else if (dim.includes("em")) {
            dim = parseFloat(dim) * parseFloat(getComputedStyle(el).fontSize);
          } else if (dim.includes("px")) {
            dim = parseFloat(dim);
            if (dim <= 60) {
              dim = dim / parseFloat(getComputedStyle(el.parentNode).width);
            }
          } else if (dim.includes("%")) {
            dim = parseFloat(dim) / 100;
          }
          
          return dim;
      };
        
      var bindScrollHandler = function() {
          if (!settings.preventPageScroll) {
            return this;
          }
        
          this.addEventListener("DOMMouseScroll", function(event) { scrollHandler(event, this); });
          this.addEventListener("mousewheel", function(event) { scrollHandler(event, this); });
        
          return this;
      };
        
      var scrollHandler = function(event, el) {
          var popover = el.closest(".bigfoot-footnote");
          var scrollTop = el.scrollTop;
          var scrollHeight = el.scrollHeight;
          var height = parseInt(getComputedStyle(el).height);
          
          if (scrollTop > 0 && scrollTop < 10) {
            popover.classList.add("is-scrollable");
          }
          
          if (!popover.classList.contains("is-scrollable")) {
            return;
          }
        
          var delta = event.type === "DOMMouseScroll" ? event.detail * -40 : event.wheelDelta;
          var up = delta > 0;
        
          var prevent = function() {
            event.stopPropagation();
            event.preventDefault();
            return false;
          };
        
          if (!up && -delta > scrollHeight - height - scrollTop) {
            el.scrollTop = scrollHeight;
            popover.classList.add("is-fully-scrolled");
            return prevent();
          } else if (up && delta > scrollTop) {
            el.scrollTop = 0;
            popover.classList.remove("is-fully-scrolled");
            return prevent();
          } else {
            popover.classList.remove("is-fully-scrolled");
          }
      };
        
      var unhoverFeet = function(e) {
          if (settings.deleteOnUnhover && settings.activateOnHover) {
            setTimeout(function() {
              var target = e.target.closest(".bigfoot-footnote, .bigfoot-footnote__button");
              if (!document.querySelector(".bigfoot-footnote__button:hover, .bigfoot-footnote:hover")) {
                removePopovers();
              }
            }, settings.hoverDelay);
          }
      };

      escapeKeypress = function(event) {
          if (event.keyCode === 27) {
            return removePopovers();
          }
      };
      
      removePopovers = function(footnotes, timeout) {
          var $buttonsClosed, $linkedButton, $this, footnoteID;
          if (footnotes == null) {
            footnotes = ".bigfoot-footnote";
          }
          if (timeout == null) {
            timeout = settings.popoverDeleteDelay;
          }
          // Initialize jQuery collection for closed buttons
          $buttonsClosed = $();
          // Process each footnote
          $(footnotes).each(function() {
            $this = $(this);
            footnoteID = $this.attr("data-footnote-identifier");
            $linkedButton = $(".bigfoot-footnote__button[data-footnote-identifier='" + footnoteID + "']");
            if (!$linkedButton.hasClass("changing")) {
              $buttonsClosed = $buttonsClosed.add($linkedButton);
              $linkedButton.removeClass("is-active is-hover-instantiated is-click-instantiated").addClass("changing");
              $this.removeClass("is-active").addClass("disapearing");
              $this.css("transition-duration", settings.animationDuration + "ms");
              // Timeout for removal
              setTimeout((function() {
                $this.remove();
                delete popoverStates[footnoteID];
                return $linkedButton.removeClass("changing");
              }), settings.animationDuration);
            }
          });
          return $buttonsClosed;
      };

      repositionFeet = function(e) {
          var type;
          if (settings.positionContent) {
            type = e ? e.type : "resize";
            $(".bigfoot-footnote").each(function() {
              // Retrieve dimensions and positioning details
              var $button, $contentWrapper, $mainWrap, $this, dataIdentifier, identifier, lastState, marginSize, maxHeightInCSS, maxHeightOnScreen, maxWidth, maxWidthInCSS, positionOnTop, relativeToWidth, roomLeft, totalHeight;
              $this = $(this);
              identifier = $this.attr("data-footnote-identifier");
              dataIdentifier = "data-footnote-identifier='" + identifier + "'";
              $contentWrapper = $this.find(".bigfoot-footnote__content");
              $button = $this.siblings(".bigfoot-footnote__button");
              roomLeft = roomCalc($button);
              marginSize = parseFloat($this.css("margin-top"));
              maxHeightInCSS = +($this.attr("data-bigfoot-max-height"));
              totalHeight = 2 * marginSize + $this.outerHeight();
              maxHeightOnScreen = 10000;
              // Determine position (top or bottom)
              positionOnTop = roomLeft.bottomRoom < totalHeight && roomLeft.topRoom > roomLeft.bottomRoom;
              lastState = popoverStates[identifier];
              // Update classes and max heights
              if (positionOnTop) {
                if (lastState !== "top") {
                  popoverStates[identifier] = "top";
                  $this.addClass("is-positioned-top").removeClass("is-positioned-bottom");
                  $this.css("transform-origin", (roomLeft.leftRelative * 100) + "% 100%");
                }
                maxHeightOnScreen = roomLeft.topRoom - marginSize - 15;
              } else {
                if (lastState !== "bottom" || lastState === "init") {
                  popoverStates[identifier] = "bottom";
                  $this.removeClass("is-positioned-top").addClass("is-positioned-bottom");
                  $this.css("transform-origin", (roomLeft.leftRelative * 100) + "% 0%");
                }
                maxHeightOnScreen = roomLeft.bottomRoom - marginSize - 15;
              }
              $this.find(".bigfoot-footnote__content").css({
                "max-height": Math.min(maxHeightOnScreen, maxHeightInCSS) + "px"
              });
              // Resize handling
              if (type === "resize") {
                // Code to handle resizing
              }
              // Scroll handling
              if (parseInt($this.outerHeight()) < $this.find(".bigfoot-footnote__content")[0].scrollHeight) {
                return $this.addClass("is-scrollable");
              }
            });
          }
      };

      positionTooltip = function($popover, leftRelative) {
          var $tooltip;
          if (leftRelative == null) {
            leftRelative = 0.5; // Default to center
          }
          $tooltip = $popover.find(".bigfoot-footnote__tooltip");
          if ($tooltip.length > 0) {
            $tooltip.css("left", (leftRelative * 100) + "%");
          }
      };

      roomCalc = function($el) {
          var elHeight, elLeftMargin, elWidth, leftRoom, topRoom, w;
          elLeftMargin = parseFloat($el.css("margin-left"));
          elWidth = parseFloat($el.outerWidth()) - elLeftMargin;
          elHeight = parseFloat($el.outerHeight());
          w = viewportDetails();
          topRoom = $el.offset().top - w.scrollY + elHeight / 2;
          leftRoom = $el.offset().left - w.scrollX + elWidth / 2;
          return {
            topRoom: topRoom,
            bottomRoom: w.height - topRoom,
            leftRoom: leftRoom,
            rightRoom: w.width - leftRoom,
            leftRelative: leftRoom / w.width,
            topRelative: topRoom / w.height
          };
      };

      viewportDetails = function() {
          var $window;
          $window = $(window);
          return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: $window.scrollLeft(),
            scrollY: $window.scrollTop()
          };
      };
        
      addBreakpoint = function(size, trueCallback, falseCallback, deleteDelay, removeOpen) {
          var falseDefaultPositionSetting, minMax, mqListener, mql, query, s, trueDefaultPositionSetting;
          if (deleteDelay == null) {
            deleteDelay = settings.popoverDeleteDelay;
          }
          if (removeOpen == null) {
            removeOpen = true;
          }
          mql = void 0;
          minMax = void 0;
          s = void 0;
          if (typeof size === "string") {
            s = size.toLowerCase() === "iphone" ? "<320px" : size.toLowerCase() === "ipad" ? "<768px" : size;
            minMax = s.charAt(0) === ">" ? "min" : s.charAt(0) === "<" ? "max" : null;
            query = minMax ? "(" + minMax + "-width: " + (s.substring(1)) + ")" : s;
            mql = window.matchMedia(query);
          } else {
            mql = size;
          }
          if (mql.media && mql.media === "invalid") {
            return {
              added: false,
              mq: mql,
              listener: null
            };
          }
          trueDefaultPositionSetting = minMax === "min";
          falseDefaultPositionSetting = minMax === "max";
          trueCallback = trueCallback || makeDefaultCallbacks(removeOpen, deleteDelay, trueDefaultPositionSetting, function($popover) {
            return $popover.addClass("is-bottom-fixed");
          });
          falseCallback = falseCallback || makeDefaultCallbacks(removeOpen, deleteDelay, falseDefaultPositionSetting, function() {});
          mqListener = function(mq) {
            if (mq.matches) {
              trueCallback(removeOpen, bigfoot);
            } else {
              falseCallback(removeOpen, bigfoot);
            }
          };
          mql.addListener(mqListener);
          mqListener(mql);
          settings.breakpoints[size] = {
            added: true,
            mq: mql,
            listener: mqListener
          };
          return settings.breakpoints[size];
      };

      makeDefaultCallbacks = function(removeOpen, deleteDelay, position, callback) {
          return function(removeOpen, bigfoot) {
            var $closedPopovers;
            $closedPopovers = void 0;
            if (removeOpen) {
              $closedPopovers = bigfoot.close();
              bigfoot.updateSetting("activateCallback", callback);
            }
            return setTimeout((function() {
              bigfoot.updateSetting("positionContent", position);
              if (removeOpen) {
                return bigfoot.activate($closedPopovers);
              }
            }), deleteDelay);
          };
      };

      removeBreakpoint = function(target, callback) {
          var b, breakpoint, mq, mqFound;
          mq = null;
          b = void 0;
          mqFound = false;
          if (typeof target === "string") {
            mqFound = settings.breakpoints[target] !== undefined;
          } else {
            for (b in settings.breakpoints) {
              if (settings.breakpoints.hasOwnProperty(b) && settings.breakpoints[b].mq === target) {
                mqFound = true;
              }
            }
          }
          if (mqFound) {
            breakpoint = settings.breakpoints[b || target];
            if (callback) {
              callback({
                matches: false
              });
            } else {
              breakpoint.listener({
                matches: false
              });
            }
            breakpoint.mq.removeListener(breakpoint.listener);
            delete settings.breakpoints[b || target];
          }
          return mqFound;
      };

      updateSetting = function(newSettings, value) {
          var oldValue, prop;
          oldValue = void 0;
          if (typeof newSettings === "string") {
            oldValue = settings[newSettings];
            settings[newSettings] = value;
          } else {
            oldValue = {};
            for (prop in newSettings) {
              if (newSettings.hasOwnProperty(prop)) {
                oldValue[prop] = settings[prop];
                settings[prop] = newSettings[prop];
              }
            }
          }
          return oldValue;
      };
      
      getSetting = function(setting) {
          return settings[setting];
      };

      $(document).ready(function() {
          footnoteInit();
          $(document).on("mouseenter", ".bigfoot-footnote__button", buttonHover);
          $(document).on("touchend click", touchClick);
          $(document).on("mouseout", ".is-hover-instantiated", unhoverFeet);
          $(document).on("keyup", escapeKeypress);
          $(window).on("scroll resize", repositionFeet);
          return $(document).on("gestureend", function() {
            return repositionFeet();
          });
      });

      bigfoot = {
          removePopovers: removePopovers,
          close: removePopovers,
          createPopover: createPopover,
          activate: createPopover,
          repositionFeet: repositionFeet,
          reposition: repositionFeet,
          addBreakpoint: addBreakpoint,
          removeBreakpoint: removeBreakpoint,
          getSetting: getSetting,
          updateSetting: updateSetting
      };
    return bigfoot;
  }

  // Expose bigfoot globally
  window.bigfoot = bigfoot;
})();

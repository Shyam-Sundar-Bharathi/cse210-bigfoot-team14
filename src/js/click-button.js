function clickButton($button) {
    $button.blur();
    var dataIdentifier = "data-footnote-identifier='" + $button.attr("data-footnote-identifier") + "'";
    
    if ($button.hasClass("changing")) {
      return;
    } else if (!$button.hasClass("is-active")) {
      $button.addClass("changing");
      setTimeout(function() {
        $button.removeClass("changing");
      }, settings.popoverCreateDelay);
      createPopover(".bigfoot-footnote__button[" + dataIdentifier + "]");
      $button.addClass("is-click-instantiated");
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
  }
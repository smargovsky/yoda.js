import {calcMD5} from './md5';
import Popper from 'popper.js';

const TYPES = {
    TOAST: 'toast', 
    DEFAULT: 'pop-up',
    TOP: 'top',
    BOTTOM: 'bottom'
}

class YodaGuides {
    init(getDataFromApp, apiHost) {
        this.apiHost = apiHost;

        this.sendReady();

        return getDataFromApp().then((dataFromApp) => {
            let {userId, locale} = dataFromApp;

            if (!userId || !locale) {
                throw Error('getDataFromApp must return a promise to an object of the form {userId: ___, locale: ___}')
            }

            this.userHash = calcMD5(userId);
            this.locale = locale;

            this.setupStyles();
            return true;
        });
    }

    fetchGuide(userHash, locale, page) {
        if (!locale) {
            locale = 'en';
        }

        return $.ajax({
            type: 'POST',
            url: this.apiHost + '/guides',
            data: JSON.stringify({
                'user_id': userHash,
                route: page,
                locale: locale
            }),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        })
        .then((guides) => {
            this.guides = guides

            return this.guides
        });
    }

    update(filterGuides, page) {
        if (this.guideIndex > 0) return //ignore if we're in the middle of a guide, dont mount another popover

        this.fetchGuide(this.userHash, this.locale, page).then( (fetchedGuides) => {
            this.guideIndex = 0;
            return filterGuides(fetchedGuides);
        }).then( (filteredGuides) => {
            this.guide = filteredGuides;
            this.displayPopperWithHtml(this.guide, this.guideIndex);
        });
    }

    displayPopperWithHtml(guide, index) {
        if (!guide || this.selectMode) return
        
        let {selector, content, title} = guide.steps[index]
        let placement = 'left';
        let fixed = false;
        //if displyType doesn't require a selector - don't give it one
        if (guide.displayType === TYPES.TOAST) {
            selector = 'html';
            placement = 'top-end';
            fixed = true;
        } 
        this.whenExists(selector, () => {
            let testReference = $(selector)[0]

            let maybePrev = index > 0 ? '<button class="previous btn-sm btn-default">Prev</span>' : '';
            let maybeNext = guide.steps.length - 1 > index ? '<button class="next btn-sm btn-primary">Next</span>': '<button class="finish btn-sm btn-primary">Finish</span>';
            let classes = this.getClasses(guide)
            let popTag = $(`<div class="${classes}">`
                + '<div class="header">'
                + title
                + '</div>'
                + '</n>'
                + '<div class="content">'
                + content
                + '</div>'
                + '<div class=btn-container>'
                + maybePrev
                + maybeNext
                + '</div>'
                + '<div class="popper__arrow" x-arrow=""></div></div>');

            $('body').append(popTag);

            popTag.find('.next').on('click', this.nextGuide.bind(this));
            popTag.find('.finish').on('click', this.finishGuide.bind(this));
            popTag.find('.previous').on('click', this.previousGuide.bind(this));

            this.currentPop = new Popper(testReference, popTag, {
                placement: placement,
                positionFixed: fixed,
                removeOnDestroy: true
            });
        });
    }


    whenExists(selector, cb, waitTime) {
        let timesChecked = 0;
        let checkExistance = setInterval(function() {
            if ($(selector).length) {
                cb()
                clearInterval(checkExistance);
            } else {
                timesChecked++;
                if (timesChecked > 200) {
                    console.warn('Couldnt find element to attach yoda after 20 seconds, giving up')
                    clearInterval(checkExistance);
                }
            }
        }, 100);
    }

    getClasses(guide) {
        var classes = 'yoda-popper';
        switch (guide.displayType) {
            case TYPES.DEFAULT:
                classes += ' yoda-announcement';
                break;
            case TYPES.TOAST:
                classes += ' yoda-toast';
                break;
            case TYPES.BOTTOM:
                classes += ' yoda-banner banner-top';
                break;
            case TYPES.TOP:
                classes += ' yoda-banner banner-top';
                break;   
        }
        return classes;
    }

    setupStyles() {
        $(`<style type='text/css'>
        .btn-primary {
            background-color: transparent;
            border-color: #94c5d6;
            color: #ffffff;
            text-shadow: none;
            background-image: -webkit-linear-gradient(top, #61b8d4 0%, #4a9cb6 100%);
            background-image: linear-gradient(to bottom, #00b4d0 0%, #4a9cb6 150%)
            background-repeat: repeat-x;
        }
        .btn-sm {
            padding: 5px 10px;
            font-size: 14px;
            line-height: 1.5;
            border-radius: 3px;
            margin-top: 20px;
        }
        .spacer {
            padding: 10px
        }
        .btn-default {
            border-color: #b8b8b8;
            color: #333333;
            text-shadow: none;
            background-image: -webkit-linear-gradient(top, #f7f7f7 0%, #e5e5e5 100%);
            background-image: linear-gradient(to bottom, #00b4d0 0%, #4a9cb6 150%)
            background-repeat: repeat-x;
        }
        .btn-container {
            width: 100%;
        }
        .yoda-annoucement {
          background: #ffffff;
          padding: 20px;
          max-width: 400px;
          min-width: 400px;
          text-align: left;
          border-radius: 5px;
          font-family: "Lato", “HelveticaNeue”, “Helvetica”, “Arial”, sans-serif;
          -webkit-box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
          -moz-box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
          box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
        }
        .yoda-banner {
          background: #ffffff;
          padding: 20px;
          text-align: left;
          font-family: "Lato", “HelveticaNeue”, “Helvetica”, “Arial”, sans-serif;
          -webkit-box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
          -moz-box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
          box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
        }
        .yoda-toast {
          background: #ffffff;
          padding: 20px;
          max-width: 400px;
          text-align: left;
          border-radius: 5px 5px 0px 0px;
          font-family: "Lato", “HelveticaNeue”, “Helvetica”, “Arial”, sans-serif;
          -webkit-box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
          -moz-box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
          box-shadow: 5px 5px 42px -4px rgba(0,0,0,0.5);
          z-index: 5000;
        }
        .yoda-toast .popper__arrow { display: none }
        .banner-bottom {
          position: absolute;
          bottom:0;
          max-width: none;
          width: 90%;
          margin-left: auto;
          margin-right: auto;
          min-width: 400px;
          border-radius: 5px 5px 0px 0px;
        }

        .banner-top {
          position: absolute;
          top:0;
          max-width: none;
          width: 90%;
          margin-left: auto;
          margin-right: auto;
          min-width: 400px;
          border-radius: 0px 0px 5px 5px;

        }
        .yoda-popper .close {
          border: none;
          text-decoration: none;
          font-size: 1rem;
          float: right;
          color: grey;
        }
        .yoda-popper .close:hover {
          color: black;

        }
        .yoda-popper .popper__arrow {
          width: 0;
          height: 0;
          border-style: solid;
          position: absolute;
          margin: 5px;
        }

        .yoda-popper[x-placement^=top] {
          margin-bottom: 5px;
        }
        .yoda-popper[x-placement^=top] .popper__arrow {
          border-width: 5px 5px 0 5px;
          border-color: #ffffff transparent transparent transparent;
          bottom: -5px;
          left: calc(50% - 5px);
          margin-top: 0;
          margin-bottom: 0;
        }

        .yoda-popper[x-placement^=bottom] {
          margin-top: 5px;
        }
        .yoda-popper[x-placement^=bottom] .popper__arrow {
          border-width: 0 5px 5px 5px;
          border-color: transparent transparent #ffffff transparent;
          top: -5px;
          left: calc(50% - 5px);
          margin-top: 0;
          margin-bottom: 0;
        }

        .yoda-popper[x-placement^=right] {
          margin-left: 5px;
        }
        .yoda-popper[x-placement^=right] .popper__arrow {
          border-width: 5px 5px 5px 0;
          border-color: transparent #ffffff transparent transparent;
          left: -5px;
          top: calc(50% - 5px);
          margin-left: 0;
          margin-right: 0;
        }

        .yoda-popper[x-placement^=left] {
          margin-right: 5px;
        }
        .yoda-popper[x-placement^=left] .popper__arrow {
          border-width: 5px 0 5px 5px;
          border-color: transparent transparent transparent #ffffff;
          right: -5px;
          top: calc(50% - 5px);
          margin-left: 0;
          margin-right: 0;
        }

        .yoda-popper .previous {
          float: left;
          margin-right: 5px;
        }

        .yoda-popper .next {
          float: right
        }

        .yoda-popper .content {
          margin: 0 0 6px 0;
          padding: 0;
          margin-top: 4px;
          font-size: 1rem;
          letter-spacing: .01rem;
          font-weight: 300;
          margin-bottom: 10px;
        }

        .yoda-popper .header {
          font-size: 20px;
          margin-bottom: 25px;
          font-weight: 550;
          color: #61b8d4;
        }

        .yoda-popper .finish {
          float: left
        }

        .yoda-popper { height: auto; }
        </style>`).appendTo("head");
    }

    nextGuide() {
        this.guideIndex++;
        if (this.currentPop && !this.currentPop.state.isDestroyed) {
            this.currentPop.destroy();
        }
        this.displayPopperWithHtml(this.guide, this.guideIndex);
    }

    finishGuide() {
        this.currentPop.destroy()
        $.ajax({
            type: 'POST',
            url: this.apiHost + '/guides/' + this.guide.id,
            data: JSON.stringify({
                user_id: this.userHash,
                completed: true
            }),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        })

        this.guideIndex = 0 // reset for new guide
        // dont get the next guide yet - after demo we make this happen
        // .then(() => {
        //   this.update()
        // })
    }

    previousGuide() {
        this.guideIndex--;
        if (this.currentPop && !this.currentPop.state.isDestroyed) this.currentPop.destroy();
        this.displayPopperWithHtml(this.guide, this.guideIndex);
    }

    ////
    // SETTING UP SELECTORS
    ////

    sendReady() {
        parent.postMessage({yodaMessage: 'iframe-ready'}, '*')

        // Listen for select mode
        window.addEventListener('message', this.receiveMessage.bind(this), false);
    }

    receiveMessage({data}) {
        let {yodaMessage} = data;
        if (yodaMessage === 'select-mode') {
            this.selectMode = true;
            console.log('Enable "select-mode" postmessage received.');
            if (this.currentPop && !this.currentPop.state.isDestroyed) {
                this.currentPop.destroy();    
            } 
            this.enterElementHighlightMode();
        }
        if (yodaMessage === 'clear-pops') {
            this.selectMode = true;
            console.log('"clear-pops" postmessage received.');
            if (this.currentPop && !this.currentPop.state.isDestroyed) {
                this.currentPop.destroy();
            }
        }

        if (yodaMessage === 'init') {
            this.sendReady();
        }
    }

    _onClickHighlightedElement(e) {
      parent.postMessage({
          yodaMessage: 'return-selector',
          yodaMessageSelector: this._cssPath(this.previousEl[0])
      }, '*');
      e.stopPropagation();
      e.preventDefault();
      $(document).off('mousemove');
      this.previousEl.css('background', this.previousBackground);
    }

    _selectorIsUnique(selector) {
      if($(selector).length <= 1) {
        if($(selector).length === 0) {
          throw Error('Selector does\'nt match any elements');
        } else {
          return true;
        }
      } else {
        return false;
      }
    }

    _cssPath(el) {
      if (!(el instanceof Element))
        return;
      let path = '';
      let needsMoreSpecificity = true;
      while (needsMoreSpecificity && el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        let tagName = selector;
        if (el.classList.length) {
          selector += '.' + Array.from(el.classList).join('.');
        }
        var sib = el, nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() === tagName)
            nth++;
        }
        if (nth != 1) {
          selector += ":nth-of-type("+nth+")";
        }
        path = selector + path;

        // See if this selector is sufficient to uniquely select the element we want
        if(this._selectorIsUnique(path)) {
          break;
        
        // If not, we'll include information from the parent
        } else {
          path = ' > ' + path;
        }

        // Move up to the next parent and continue to build selector
        el = el.parentNode;
      }
      return path;
    }

    enterElementHighlightMode() {
      this.previousEl = null;
      this.previousBackground = null
      $(document).on('mousemove', ({clientX, clientY}) => {
        let el = $(document.elementFromPoint(clientX, clientY));
        if (this.previousEl) {
          this.previousEl.css('background', this.previousBackground);
          this.previousEl.off('click', this._onClickHighlightedElement);
        }
        this.previousBackground = el.css('background');
        el.css('background', 'lightskyblue');
        el.on('click', this._onClickHighlightedElement.bind(this));
        this.previousEl = el;
      })
    }

}
window.Yoda = new YodaGuides();

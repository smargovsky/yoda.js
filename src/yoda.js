import {calcMD5} from './md5';
import Popper from 'popper.js'

export class Yoda {


  // fetchGuide() {
  //   return Promise.resolve(
  //     {
  //       title: "titsle",
  //       steps: [
  //         {
  //           selector: '.section-header',
  //           content: '<div> WIZARDS</div>'
  //         },
  //         {
  //           selector: '.breadcrumbs',
  //           content: '<div> WIZARDS EVERYWHERE </div>'
  //         }
  //       ]
  //     }
  //   );
  // }

  fetchGuide(userHash, permissions, locale) {

    // $.ajax({
    //   type: 'POST',
    //   url: this.apiHost + '/guides/' + this.guide.id,
    //   data: JSON.stringify({
    //     user_id: this.userHash,
    //     completed: true
    //   }),
    //   dataType: 'json',
    //   contentType: 'application/json; charset=utf-8'
    // })
    if (!locale) {
      locale = 'en';
    }
    return $.ajax({
      type: 'POST',
      url: this.apiHost + '/guides',
      data: JSON.stringify({
        'user_id': userHash, 
        permissions, 
        route: location.pathname + location.hash,
        locale: locale
      }),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    })
    .then((guides) => {
      return guides[0];
    })

    // return $.post(this.apiHost + '/guides', 
    //   {userHash, permissions, route: location.pathname + location.hash})
    //   .then((guides) => {
    //     return guides[0];
    //   })
    //   .catch((err) => console.error(e));
  }

  displayPopperWithHtml(guide, index) {
    let {selector, content} = guide.steps[index]
    this.whenExists(selector, () => {
      let testReference = $(selector)[0]

      let maybePrev = index > 0 ? '<button class="previous btn-sm btn-default">Prev</span>' : '';
      let maybeNext = guide.steps.length - 1 > index ? '<button class="next btn-sm btn-primary">Next</span>': '<button class="finish btn-sm btn-primary">Finish</span>';

      let popTag = $('<div class="yoda-popper">' 
        + '<div>'
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
        placement: 'left',
        modifiers: {
          arrow: {
            enabled: true
          }
        },
        removeOnDestroy: true,
        offset: {
          enabled: true,
          offset: '0,10'
        }
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

  setupStyles() {
    $(`<style type='text/css'> 
      .btn-primary {
        background-color: transparent;
        border-color: #4b9eb9;
        color: #ffffff;
        text-shadow: none;
        background-image: -webkit-linear-gradient(top, #61b8d4 0%, #4a9cb6 100%);
        background-image: linear-gradient(to bottom, #61b8d4 0%, #4a9cb6 100%);
        background-repeat: repeat-x;
      }
      .btn-sm {
        padding: 5px 10px;
        font-size: 12px;
        line-height: 1.5;
        border-radius: 3px;
        margin-top: 5px;
      }
      .btn-default {
        border-color: #b8b8b8;
        color: #333333;
        text-shadow: none;
        background-image: -webkit-linear-gradient(top, #f7f7f7 0%, #e5e5e5 100%);
        background-image: linear-gradient(to bottom, #f7f7f7 0%, #e5e5e5 100%);
        background-repeat: repeat-x;
      }
      .btn-container {
        width: 100%;
        
      }
      .yoda-popper {
        background: #ffffff;
        padding: 10px;
        max-width: 200px;
        text-align: left;
        border-radius: 5px;
        font-family: "Lato", “HelveticaNeue”, “Helvetica”, “Arial”, sans-serif;
        -webkit-box-shadow: 10px 10px 42px -6px rgba(0,0,0,0.75);
        -moz-box-shadow: 10px 10px 42px -6px rgba(0,0,0,0.75);
        box-shadow: 10px 10px 42px -6px rgba(0,0,0,0.75);
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
        float: left
      }

      .yoda-popper .next {
        float: right
      }

      .yoda-popper .finish {
        float: right
      }
      </style>`).appendTo("head");
  }

  init(getUserAndPermissions, apiHost) {

    this.apiHost = apiHost;

    this.sendReady();

    getUserAndPermissions().then( (userAndPermissions) => {
      let {userId, permissions, locale} = userAndPermissions

      if (!userId || !permissions) {
        throw Error('getUserAndPermissions must return a promise to an object of the form {userId: ___, permissions: ___}')
      }

      this.userHash = calcMD5(userId);
      this.permissions = permissions;
      this.locale = locale;


      yoda.setupStyles();
      this.fetchGuide(this.userHash, this.permissions, this.locale).then( (fetchedGuide) => {
        this.guideIndex = 0;
        this.guide = fetchedGuide;
        this.displayPopperWithHtml(this.guide, this.guideIndex);
        // this.enterElementHighlightMode();
      });
    });
  }

  nextGuide() {
    this.guideIndex++;
    this.currentPop.destroy();
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
  }

  previousGuide() {
    this.guideIndex--;
    this.currentPop.destroy();
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
      if(this.currentPop) {
        this.currentPop.destroy();
      }
      this.enterElementHighlightMode();
    }
  }

  enterElementHighlightMode() {

    let cssPath = function(el) {
      if (!(el instanceof Element)) 
          return;
      let path = [];
      while (el.nodeType === Node.ELEMENT_NODE) {
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
          path.unshift(selector);
          el = el.parentNode;
      }
      let fullSelector = path.join(" > ");
      return fullSelector;
    }

    let previousEl = null;
    let previousBackground = null
    $(document).on('mousemove', ({clientX, clientY}) => {
      let el = $(document.elementFromPoint(clientX, clientY));
      if (previousEl) {
        previousEl.css('background', previousBackground);
      }
      previousBackground = el.css('background');
      el.css('background', 'lightskyblue');
      previousEl = el;
    })

    $(document).on('click', (e) => {
      parent.postMessage({
        yodaMessage: 'return-selector',
        yodaMessageSelector: cssPath(previousEl[0])
      }, '*');
      e.stopPropagation();
      e.preventDefault();
      $(document).off('click');
      $(document).off('mousemove');
      previousEl.css('background', previousBackground);
    })
  }

}




export let yoda = new Yoda();
// export let yoda = new Yoda()
// window.yoda = new Yoda();
// yoda.init(() => {return Promise.resolve({userHash: 'stub', permissions: []})}, 'https://docs.test/wp-json/api/v1' )
// yoda.setupStyles();
// yoda.whenExists('.section-header', () => {
//   yoda.displayPopperWithHtml('.section-header', '<div>Food</div>')
// });

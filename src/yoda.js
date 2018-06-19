
import Popper from 'popper.js'
class Yoda {


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

  fetchGuide(userHash, permissions) {
    return $.get(this.apiHost 
          + '/guides?userHash=' + userHash 
          + '&permissions=' + permissions.join(',') 
          + '&route=' + encodeURIComponent(location.pathname+location.hash))
      .then((guides) => {
        return guides[0];
      })
  }

  displayPopperWithHtml(guide, index) {
    let {selector, content} = guide.steps[index]
  // displayPopperWithHtml(selector, inputHTML) {
    //test
    this.whenExists(selector, () => {
      let testReference = $(selector)

      // // let popTag = window.document.createElement('div')
      // // popTag.innerHTML = '<p>hello</p>';
      let maybePrev = index > 0 ? '<button class="previous btn-sm btn-default">Prev</span>' : '';
      let maybeNext = guide.steps.length - 1 > index ? '<button class="next btn-sm btn-primary">Next</span>': '';

      let popTag = $('<div class="yoda-popper">' 
        + content
        + maybePrev
        + maybeNext
        + '<div class="popper__arrow" x-arrow=""></div></div>');

      $('body').append(popTag);

      popTag.find('.next').on('click', this.nextGuide.bind(this));
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


  whenExists(selector, cb) {
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
      .yoda-popper {
        background: #ffffff;
        padding: 10px;
        text-align: center;
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
      </style>`).appendTo("head");
  }

  //TODO: 
  init(getUserAndPermissions, apiHost) {

    this.apiHost = apiHost;

    getUserAndPermissions().then( (userAndPermissions) => {
      let {userHash, permissions} = userAndPermissions

      if (!userHash || !permissions) {
        throw Error('getUserAndPermissions must return a promise to an object of the form {userHash: ___, permissions: ___}')
      }

      yoda.setupStyles();
      this.fetchGuide(userHash, permissions).then( (fetchedGuide) => {
        this.guideIndex = 0;
        this.guide = fetchedGuide;
        this.displayPopperWithHtml(this.guide, this.guideIndex);
      });
    });
  }

  nextGuide() {
    this.guideIndex++;
    this.currentPop.destroy();
    this.displayPopperWithHtml(this.guide, this.guideIndex);
  }

  previousGuide() {
    this.guideIndex--;
    this.currentPop.destroy();
    this.displayPopperWithHtml(this.guide, this.guideIndex);
  }

}

let yoda = new Yoda
yoda.init(() => {return Promise.resolve({userHash: 'stub', permissions: []})}, 'https://docs.test/wp-json/api/v1' )
// yoda.setupStyles();
// yoda.whenExists('.section-header', () => {
//   yoda.displayPopperWithHtml('.section-header', '<div>Food</div>')
// });

export default yoda;

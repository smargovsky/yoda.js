
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
    return $.get(this.guideApiHost 
          + '/guide?userHash=' + userHash 
          + '&permissions=' + permissions.join(',') 
          + '&route=' + encodeURIComponent(location.pathname+location.hash)
    )
  }

  displayPopperWithHtml(guide, index) {
    let {selector, content} = guide.steps[index]
  // displayPopperWithHtml(selector, inputHTML) {
    //test
    this.whenExists(selector, () => {
      let testReference = $(selector)

      // // let popTag = window.document.createElement('div')
      // // popTag.innerHTML = '<p>hello</p>';
      let maybePrev = index > 0 ? '<span class="previous">\<</span>' : '';
      let maybeNext = guide.steps.length - 1 > index ? '<span class="next">\></span>': '';

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
      .yoda-popper {
        background: #ffc107;
        padding: 10px;
        text-align: center;
        border-radius: 5px;
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
        border-color: #ffc107 transparent transparent transparent;
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
        border-color: transparent transparent #ffc107 transparent;
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
        border-color: transparent #ffc107 transparent transparent;
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
        border-color: transparent transparent transparent #ffc107;
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
  init(getUserAndPermissions) {

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
yoda.init()
// yoda.setupStyles();
// yoda.whenExists('.section-header', () => {
//   yoda.displayPopperWithHtml('.section-header', '<div>Food</div>')
// });

export default yoda;

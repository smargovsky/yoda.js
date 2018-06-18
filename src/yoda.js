
import Popper from 'popper.js'
class yoda {

  greet() {
  }

  bootstrapExists() {
    return (typeof $().modal === 'function');
  }

  static displayPopperWithHtml(selector, inputHTML) {
    //test
    let testReference = $(selector)

    // // let popTag = window.document.createElement('div')
    // // popTag.innerHTML = '<p>hello</p>';
    let popTag = $('<div class="yoda-popper">' + inputHTML + '<div class="popper__arrow" x-arrow=""></div></div>');

    $('body').append(popTag);

    window.pop = new Popper(testReference, popTag, {
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
  }


  static whenExists(selector, cb) {
    let checkExistance = setInterval(function() {
      if ($(selector).length) {
        cb()
        clearInterval(checkExistance);
      }
    }, 500);
  }

  static setupStyles() {
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
      </style>`).appendTo("head");
  }

}

yoda.setupStyles();
yoda.whenExists('.section-header', () => {
  yoda.displayPopperWithHtml('.section-header', '<div>Food</div>')
});

export default yoda;

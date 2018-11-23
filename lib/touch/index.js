// @package touch controls
//
const $ = (el) => document.querySelector(el)


//we create a Input factory for different regions
class Input {
  constructor(element, debug) {
      let el = $(element);
      /* special touch listeners for multi-touch support within one region
      el.addEventListener("touchstart",  this.handle, event);
      el.addEventListener("touchend",    this.handle, event);
      el.addEventListener("touchmove",   this.handle, event);
      */
      el.addEventListener("mousedown",   this.handle.bind(this), event);
      el.addEventListener("mousemove",   this.handle.bind(this), event);
      el.addEventListener("mouseup",     this.handle.bind(this), event);
      el.addEventListener("keydown",     this.handle.bind(this), event);
      el.addEventListener("keyup",       this.handle.bind(this), event);

      this.state = 'idle'; //state for the whole class
      this.element = el;   //element the listeners are bound to
      this.debug = debug || false; //linking debug window information
      this.linkedAction = false;
      this.timeStamp = new Date().getTime();
  }
  setState(newState) {
    this.state = newState;
    if (this.debug != false) {
      $(this.debug+'Action').innerHTML=newState + '<br>TS:' + this.timeStamp;
    }
  }
  getState() {
    return {
      'state':this.state,
      'timeStamp':this.timeStamp
    }
  }

  //handling inputs.
  handle(e) {
    this.timeStamp = new Date().getTime();

    if (e.type == 'mousedown' || e.type == 'keydown') {

      if (this.down != undefined) {
        //lif the two event are within a treshold, register that
        this.linkedAction = (e.timeStamp - this.down.timeStamp < inputTreshold.betweenInputs)
      }
      this.down = e;
    }

    if (e.type == 'mouseup' || e.type == 'keyup') {

      let changeInY = this.down.offsetY - e.offsetY;

      if ( Math.abs(changeInY) > inputTreshold.changeInY ) {
        if (this.linkedAction)
          this.setState('DRAG' +  (changeInY>0 ? 'UP' : 'DOWN'));
        else
          this.setState('SWIPE' + (changeInY>0 ? 'UP' : 'DOWN'));
      }
      else {
        if (this.linkedAction)
          this.setState('DBLCLICK');
        else
          this.setState('CLICK');

      }
    }
    }



} // class

let a = new Input('#tb','#debug');

let inputTreshold = {
  changeInY : 100,
  betweenInputs : 500 //ms
}

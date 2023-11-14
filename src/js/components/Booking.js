import { templates, select } from "../settings.js";
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(element){
      const thisBooking = this;

      thisBooking.element = element;
      thisBooking.render(element);
      thisBooking.initWidgets();
      
    }
    render(element){
        const thisBooking = this;
        /* generating HTML code using the templates.bookingWidget template */
        const generatedHTML = templates.bookingWidget();
        /* create an empty thisBooking.dom object */
        thisBooking.dom = {};
        /* adding the wrapper property to this object and assigning it a reference to the container(available in the method argument) */
        thisBooking.dom.wrapper = element;
        /* changing the content of the wrapper (innerHTML) to HTML code generated from the template */
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    }
    initWidgets(){
        const thisBooking = this;
        
        thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){});

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){});
    }
}

export default Booking;
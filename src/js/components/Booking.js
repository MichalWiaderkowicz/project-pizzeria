import { templates, select } from "../settings.js";
import AmountWidget from './AmountWidget.js';
import DatePicker from "./DatePicker.js";
import HourPicker from './HourPicker.js';

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
        thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    }
    initWidgets(){
        const thisBooking = this;
        
        thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){});

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){});

        thisBooking.dom.datePicker.addEventListener('updated', function(){});

        thisBooking.dom.hourPicker.addEventListener('updated', function(){});
    }
}

export default Booking;
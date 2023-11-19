import { templates, classNames, select, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element){
      const thisBooking = this;

      thisBooking.element = element;
      /* prepare a property in the constructor that will store information about the selected table */
      thisBooking.selectedElement = '';

      thisBooking.render(element);
      thisBooking.initWidgets();
      thisBooking.getData();
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };
        //console.log('getData params:',params);

        const urls = {
            booking:       settings.db.url + '/' + settings.db.bookings 
                                           + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsRepeat.join('&'), 

        };
        //console.log('getData urls:',urls);

        Promise.all([                                    
            fetch(urls.booking),                       
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ]).then(function(allResponses){                 
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];

            return Promise.all ([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        }).then(function([bookings, eventsCurrent, eventsRepeat]){ 
           //console.log(bookings);
           //console.log(eventsCurrent);
           //console.log(eventsRepeat);
           thisBooking.parseData(bookings,eventsCurrent,eventsRepeat);
        });
    }

    parseData(bookings,eventsCurrent,eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
        for (let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat){
            if(item.repeat == 'daily'){ 
                for( let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        //console.log('thisBooking.booked:', thisBooking.booked);

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            //console.log('loop:',ourBlock);
            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
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
        thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
        thisBooking.dom.tablesWrapper = element.querySelector(select.booking.tablesWrapper);
        thisBooking.dom.timeOutput = element.querySelector(select.widgets.hourPicker.output);
        thisBooking.dom.dateInput = element.querySelector(select.widgets.datePicker.input);
        thisBooking.dom.peopleAmountInput = thisBooking.dom.peopleAmount.querySelector(select.widgets.amount.input);
        thisBooking.dom.hoursInput = element.querySelector(select.widgets.amount.input);
        thisBooking.dom.startersCheckmarks = element.querySelectorAll(select.booking.starters);
        thisBooking.dom.phoneInput = element.querySelector(select.cart.phone);
        thisBooking.dom.addressInput = element.querySelector(select.cart.address);



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

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
            thisBooking.resetTables();
        });
        /* Add a new listener to initWidgets which will activate the new initTables method when it detects a click in the table div */
        thisBooking.dom.tablesWrapper.addEventListener('click',  function(event){
            event.preventDefault();
            /* reference clicked element div DOM */
            const clickedElement = event.target;
            //console.log('clickedElement',clickedElement);
            thisBooking.initTables(clickedElement);
        });

        thisBooking.dom.wrapper.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
        });
    }

    initTables(clickedTable){
        const thisBooking = this;

        /* check if clicked table have a class 'table' */
        if(clickedTable.classList.contains(classNames.booking.table)){
            if(!clickedTable.classList.contains(classNames.booking.tableBooked)){    
                /* check if clicked table doesn't have a class 'booked' */
                if(!clickedTable.classList.contains(classNames.booking.tableSelected)){
                    //console.log(clickedTable);
                    /* get attribute data-table from clicked table */
                    const dataTable = clickedTable.getAttribute(settings.booking.tableIdAttribute);
                    /* add number of the table to selectedElement */
                    thisBooking.selectedElement = (dataTable);
                    //console.log('selectedElement:', thisBooking.selectedElement);
                    /* check if there is another table with class 'selected', if yes remove this class from it and add to clicked table */
                    for(const table of clickedTable.offsetParent.children){
                        //console.log('table:', table);
                        const selectedTable = table.classList.contains('selected');
                        //console.log('table class selected:', selectedTable);
                        if(selectedTable){ 
                            /* remove class selected */
                            table.classList.remove('selected');
                        }                    
                    }
                    /* add class 'selected' to clicked table */
                    clickedTable.classList.add(classNames.booking.tableSelected);
                } else {
                    /* remove class 'selected' to clicked table */
                    clickedTable.classList.remove(classNames.booking.tableSelected);
                    /* create empty space */
                    thisBooking.selectedElement = '';

                }   
                } else {
                    window.alert("STOLIK NIEDOSTĘPNY!");
                    console.log('STOLIK NIEDOSTĘPNY!');
                }
            }
    
        //console.log('selectedElement:', thisBooking.selectedElement);
    }

    resetTables(){
        const thisBooking = this;

        for(const table of thisBooking.dom.tables){
            /* remove 'selected' class from table */
            table.classList.remove(classNames.booking.tableSelected);
        }
         /* create empty space */
         thisBooking.selectedElement = '';
    }

    sendBooking(){
        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.bookings;
        console.log('url:', url);
        const payload = {
            /* date selected in datePicker */
            "date": thisBooking.dom.dateInput.value,
            /* time selected in hourPicker (in HH:ss format) */
            "hour": thisBooking.dom.timeOutput.innerHTML,
            /* number of the selected table (or null if nothing is selected) */
            "table": Number(thisBooking.selectedElement),
            /* number of hours selected by the client */
            "duration": Number(thisBooking.dom.hoursInput.value),
            /* number of people selected by the client */
            "ppl": Number(thisBooking.dom.peopleAmountInput.value),
            /* starters should be an array that contains the values of the selected checkboxes in the "Starters" section */
            "starters": [],
            /* telephone number from the form */
            "phone": thisBooking.dom.phoneInput.value,
            /* address from the form */
            "address": thisBooking.dom.addressInput.value,
        };

        for(let starter of thisBooking.dom.startersCheckmarks){
            if(starter.checked == true){
                payload.starters.push(starter.value);
            }
        }
        console.log('payload:', payload);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
        };

        fetch(url, options)
            .then(function(response){
              return response.json();
            }) .then(function(parsedResponse){
              console.log('parsedResponse:',parsedResponse);
              thisBooking.makeBooked(payload.date,payload.hour,payload.duration,payload.table);
              console.log('thisBooking.booked:', thisBooking.booked);
            });  
    }
}




export default Booking;
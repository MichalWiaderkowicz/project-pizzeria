import { templates } from '../settings.js';
import utils from '../utils.js';

class Home{
    constructor(element){
        const thisHome = this;
        /* create a place in the html div for the Home class */
        thisHome.element = element;
        /* call the render method which will fill this div with content */
        thisHome.render(element);
    }

    render(element){
        const thisHome = this;
        /* generate HTML based on template */
        const generatedHTML = templates.homePage();
        /* using utils.createElementFromHTML create a element  */
        thisHome.elementDOM = utils.createDOMFromHTML(generatedHTML);
        /* add element to this div on page */
        element.appendChild(thisHome.elementDOM);
    }

}

export default Home;
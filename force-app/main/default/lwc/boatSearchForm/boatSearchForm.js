import { api, LightningElement, track, wire } from 'lwc';
// imports
// import getBoatTypes from the BoatDataService => getBoatTypes method';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';
  
    // Private
    error = undefined;
  
    // Needs explicit track due to nested data
    @track
    searchOptions;
  
    // Wire a custom Apex method
    @wire(getBoatTypes)
    boatTypes({ error, data }) {
        if (data) {
            console.log(data)
            this.searchOptions = data.map(type => {
                // A Map object iterates its elements in insertion order — a for...of loop returns an array of [key, value] for each iteration.
                // TODO: complete the logic
                console.log(type)
                return { label: type.Name, value: type.Id };
            });
            this.searchOptions.unshift({ label: 'All Types', value: '' });
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }
  
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        this.selectedBoatTypeId = event.detail.value;
        // Create the const searchEvent
        // searchEvent must be the new custom event search
        searchEvent = new CustomEvent('search', { detail: { boatTypeId: this.selectedBoatTypeId }});
        // The CustomEvent() constructor has one required parameter, which is a string indicating the event type.
        // To pass data up to a receiving component, set a detail property in the CustomEvent constructor.
        this.dispatchEvent(searchEvent);
    }
}

// Use events to communicate up the component containment hierarchy. For example, a child component, c-todo-item, dispatches an event to tell its parent, c-todo-app, that a user selected it.
// https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.events
// The CustomEvent interface imposes no type requirements or structure on the detail property. However it’s important to send only primitive data. JavaScript passes all data types by reference except for primitives. If a component includes an object (non-primitive) in its detail property, any listener can mutate that object without the component’s knowledge. This is a bad thing!
// Not doing this here because of specific requirements from super badge guide - to pass the value of selectedBoatTypeId in the detail using the key boatTypeId through a dispatched event.
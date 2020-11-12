import { LightningElement, track, api, wire } from 'lwc';
import { MessageContext, publish } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'escription', fieldName: 'Description__c', editable: true }
];

export default class BoatSearchResults extends LightningElement {
    @api
    selectedBoatId;
    columns = COLUMNS;
    @api
    boatTypeId = '';
    boats;
    isLoading = false;

    // wired message context
    @wire(MessageContext)
    messageContext;
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats({ error, data }) {
        this.notifyLoading(true);
        if (data) {
            this.boats = data;
            this.notifyLoading(false);
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
        this.notifyLoading(false);      
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api
    async refresh() {
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
        return refreshApex(this.boats);
    }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        const message = {
            recordId: boatId
        };
        publish(this.messageContext, BOATMC, message);
    }

    // This method must save the changes in the Boat Editor
    // Show a toast message with the title
    // clear lightning-datatable draft values
    // This method must save the changes in the Boat Editor
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
          const fields = Object.assign({}, draft);
          return { fields };
        });
  
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
      
        Promise.all(promises).then(boats => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            // Clear all draft values
            this.draftValues = [];
        }).catch(error => {
            // Handle error
            this.dispatchEvent(
              new ShowToastEvent({
                  title: ERROR_TITLE,
                  message: error.body.message,
                  variant: ERROR_VARIANT
              })
          );
        }).finally(() => {
           // Display fresh data in the datatable
           this.refresh();
        });
  
      }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        let status = isLoading ? 'loading' : 'doneloading';
        const loadingEvent = new CustomEvent(status);
        this.dispatchEvent(loadingEvent);
    }
}
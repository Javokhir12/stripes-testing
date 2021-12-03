import { MultiColumnList, HTML, including, Button, Section } from '../../../../interactors';

const actionsButton = Section({ id: 'pane-instancedetails' }).find(Button('Actions'));
const identifiers = MultiColumnList({ id:'list-identifiers' });
const editMARCBibRecordButton = Button({ id:'edit-instance-marc' });
const viewSourceButton = Button({ id:'clickable-view-source' });


export default {
  validOCLC : { id:'176116217',
  // TODO: hardcoded count related with interactors getters issue. Redesign to cy.then(QuickMarkEditor().rowsCount()).then(rowsCount => {...}
    getLastRowNumber:() => 31 },
  checkExpectedOCLCPresence: (OCLCNumber) => {
    cy.expect(identifiers.find(HTML(including(OCLCNumber))).exists());
  },

  goToEditMARCBiblRecord:() => {
    cy.do(actionsButton.click());
    cy.do(editMARCBibRecordButton.click());
  },

  viewSource: () => {
    cy.do(actionsButton.click());
    cy.do(viewSourceButton.click());
  },
  waitLoading:() => cy.expect(actionsButton.exists())
};

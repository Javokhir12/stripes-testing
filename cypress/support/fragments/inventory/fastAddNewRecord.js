import {
  MultiColumnListCell,
  Button,
  Select,
  Selection,
  SelectionList,
  TextField,
  KeyValue,
  Section, PaneHeader,
} from '../../../../interactors';
import getRandomPostfix from '../../utils/stringTools';
import TopMenu from '../topMenu';
import InteractorsTools from '../../utils/interactorsTools';


const calloutMessages = {
  INVENTORY_RECORDS_CREATE_SUCCESS: 'Inventory records have been created successfully',
  SETTING_UPDATE_SUCCESS: 'Setting was successfully updated.'
};

const fastAddNewRecordFormDetails = {
  defaultInstanceStatusCodeOption: 'Select instance status',
  instanceStatusCodeOption: 'Uncataloged',
  instanceStatusCodeValue: 'uncat',
  resourceTitle: 'Monograph',
  resourceType: 'text',
  permanentLocationOption: 'Online (E) ',
  permanentLocationValue: 'Online',
  itemBarcode: `${getRandomPostfix()}Barcode`,
  materialType: 'text',
  permanentLoanType: 'Course reserves',
  note: 'note for monograph',
};

const updateInventoryFastAddSetting = (statusCode) => {
  cy.visit(TopMenu.inventorySettingsFastAddPath);
  cy.do(Select({ name: 'instanceStatusCode' }).choose(statusCode));
  cy.do(Button('Save').click());

  InteractorsTools.checkCalloutMessage(calloutMessages.SETTING_UPDATE_SUCCESS);
};

const fillFastAddNewRecordForm = ({
  resourceTitle,
  resourceType,
  permanentLocationOption,
  itemBarcode,
  materialType,
  permanentLoanType,
  note,
}) => {
  cy.do([
    TextField('Resource title*').fillIn(resourceTitle),
    Select('Resource type*').choose(resourceType),
    Selection('Permanent location*').open(),
    SelectionList().filter(permanentLocationOption),
    SelectionList().select(permanentLocationOption),
    TextField('Barcode').fillIn(itemBarcode),
    Select('Material type*').choose(materialType),
    Select('Permanent loan type*').choose(permanentLoanType),
    TextField('Note*').fillIn(note),
  ]);
};

const saveAndClose = () => {
  cy.do(Button('Save and close').click());

  cy.expect(Section({ id: 'pane-results' }).find(Button('Actions')).exists());
};

const waitLoading = () => {
  cy.expect(PaneHeader('New fast add record').exists());
};

const openRecordDetails = (row = 0) => {
  cy.do(MultiColumnListCell({ row, columnIndex: 1 }).click());

  cy.expect(Section({ id: 'pane-instancedetails' }).exists());
};

const verifyRecordCreatedDate = ({ start, end }) => {
  cy
    .get('[class^="metaHeaderLabel"]')
    .invoke('text')
    .then(dateText => {
      const createdAt = new Date(dateText);

      const startedDate = new Date(start.getTime());
      const completedDate = new Date(end.getTime());

      // since created date is displayed in UTC time in UI,
      // current timestamps need to be converted to UTC time
      startedDate.setDate(startedDate.getUTCDate());
      completedDate.setDate(completedDate.getUTCDate());
      startedDate.setHours(startedDate.getUTCHours(), startedDate.getUTCMinutes(), 0, 0);
      completedDate.setHours(completedDate.getUTCHours(), completedDate.getUTCMinutes(), 0, 0);

      expect(startedDate).to.lte(createdAt);
      expect(completedDate).to.gte(createdAt);
    });
};

const viewHoldings = () => {
  cy.do(Button('View holdings').click());

  cy.expect(Section({ id: 'ui-inventory.holdingsRecordView' }).exists());
};

const verifyPermanentLocation = value => {
  cy.expect(KeyValue('Permanent').has({ value }));
};

const closeHoldingsRecordView = () => {
  cy.do(Section({ id: 'ui-inventory.holdingsRecordView' }).find(Button({ icon: 'times' })).click());
};

export default {
  calloutMessages,
  fastAddNewRecordFormDetails,
  updateInventoryFastAddSetting,
  fillFastAddNewRecordForm,
  saveAndClose,
  waitLoading,
  openRecordDetails,
  verifyRecordCreatedDate,
  viewHoldings,
  verifyPermanentLocation,
  closeHoldingsRecordView,
};

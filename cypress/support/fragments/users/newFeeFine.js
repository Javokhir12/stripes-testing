import uuid from 'uuid';
import { Button, Modal, Option, Select, TextArea, MultiColumnListRow, HTML, TextField } from '../../../../interactors';

const rootModal = Modal({ id: 'new-modal' });
const feeFineTypeSelect = rootModal.find(Select({ id: 'feeFineType' }));
const amountTextField = rootModal.find(TextField({ name: 'amount' }));

const getChargeFeeFine = ({ amount, userId, feeFineType, id, dateAction, createdAt, source }) => ({
  accountId: id,
  amountAction: amount,
  balance: amount,
  id : uuid(),
  userId,
  typeAction: feeFineType,
  dateAction,
  createdAt,
  source,
});

const getNewFeeFineAccount = ({ id, ownerId, feeFineId, amount, paymentStatus, status, userId, feeFineType, feeFineOwner }) => ({
  // required field
  feeFineId,
  // required field
  ownerId,
  // required field
  amount,
  paymentStatus: paymentStatus || { "name":"Outstanding" },
  status: status || {"name":"Open"},
  // required field
  id,
  // required field
  userId,
  // required field
  feeFineType,
  // required field
  remaining: amount,
  // required field
  feeFineOwner,
});

const createFeeFineAccountViaApi = (feeFineAccount) => (
  cy.okapiRequest({
    method: 'POST',
    path: 'accounts',
    body: feeFineAccount,
    isDefaultSearchParamsRequired: false
  }).then(res => res.body.id)
);

const chargeAmountFeeFineActionsViaApi = (chargeFeeFineAction) => (
  cy.okapiRequest({ method: 'POST',
    path: 'feefineactions',
    body: chargeFeeFineAction,
    searchParams: { limit: 1000, query: `(userId==${chargeFeeFineAction.userId})` },
    isDefaultSearchParamsRequired: false }).then(res => res.body.accountId)
);

export default {
  waitLoading:() => {
    cy.expect(rootModal.exists());
  },

  checkInitialState:({ lastName: userLastName, middleName: userMiddleName, firstName: userFirstName, barcode: userBarcode }, ownerName) => {
    cy.expect(rootModal.find(Button(`${userLastName}, ${userFirstName} ${userMiddleName}`)).exists());
    cy.expect(rootModal.find(Button(userBarcode)).exists());
    cy.expect(Option(ownerName).exists());
    cy.expect(feeFineTypeSelect.has({ value:'' }));
    cy.expect(rootModal.find(TextField({ id:'amount' })).has({ value: '' }));
    cy.expect(rootModal.find(TextField({ placeholder:'Scan or enter item barcode' })).has({ value: '' }));
    cy.expect(rootModal.find(TextArea({ id:'comments' })).has({ value:'' }));
  },

  checkClosedFeesByRow(feeProps, index) {
    cy.do(Button({ id: 'closed-accounts' }).click());
    feeProps.forEach(feeProp => {
      cy.expect(MultiColumnListRow({ indexRow: `row-${index}` }).find(HTML(feeProp)).exists());
    });
  },

  openFromLoanDetails() {
    cy.do([
      Button({ icon: 'ellipsis' }).click(),
      Button('New fee/fine').click()
    ]);
  },

  setFeeFineOwner: (ownerName) => {
    // TODO: fix iterators issue related with select
    cy.get('div[id=new-modal] select[name=ownerId]').select(ownerName);
  },

  checkFilteredFeeFineType:(feefineTypeName) => {
    cy.expect(feeFineTypeSelect.find(Option(feefineTypeName)).exists());
  },

  setFeeFineType: (feeFineType) => {
    // TODO: fix iterators issue related with select
    cy.get('div[id=new-modal] select[name=feeFineId]').select(feeFineType);
  },

  checkAmount: (amount) => {
    cy.expect(amountTextField.has({ value : amount.toFixed(2) }));
    cy.expect(amountTextField.has({ disabled: false }));
  },

  cancel:() => cy.do(rootModal.find(Button({ id:'cancelCharge' })).click()),

  chargeAndPayNow: () => cy.do(rootModal.find(Button({ id:'chargeAndPay' })).click()),

  chargeOnly: () => cy.do(rootModal.find(Button({ id:'chargeOnly' })).click()),

  createViaApi: (feeFineAccount) => {
    return createFeeFineAccountViaApi(getNewFeeFineAccount(feeFineAccount))
      .then((feeFineAccountId) => chargeAmountFeeFineActionsViaApi(getChargeFeeFine({ ...feeFineAccount, id: feeFineAccountId })));
  },

  deleteFeeFineAccountViaApi: (feeFineAccountId) => (
    cy.okapiRequest({
      method: 'DELETE',
      path: `accounts/${feeFineAccountId}`,
      isDefaultSearchParamsRequired: false
    })
  ),

  keepEditing() {
    cy.do(Button({ id:'clickable-cancel-editing-confirmation-confirm' }).click());
  },
};

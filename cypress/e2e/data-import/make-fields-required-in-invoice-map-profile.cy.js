import permissions from '../../support/dictionary/permissions';
import TestTypes from '../../support/dictionary/testTypes';
import DevTeams from '../../support/dictionary/devTeams';
import FieldMappingProfiles from '../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import NewFieldMappingProfile from '../../support/fragments/data_import/mapping_profiles/newFieldMappingProfile';
import Helper from '../../support/fragments/finance/financeHelper';
import Users from '../../support/fragments/users/users';
import MappingProfileDetails from '../../support/fragments/data_import/mapping_profiles/mappingProfileDetails';
import SettingsMenu from '../../support/fragments/settingsMenu';

describe('ui-data-import: Make some of the fields on the Invoice field mapping profile required', () => {
  let user = null;
  const mappingProfileName = `C343284 invoice mapping profile ${Helper.getRandomBarcode()}`;

  before(() => {
    cy.createTempUser([
      permissions.moduleDataImportEnabled.gui,
      permissions.settingsDataImportEnabled.gui,
      permissions.viewOrganization.gui
    ])
      .then(userProperties => {
        user = userProperties;

        cy.login(user.username, user.password, { path: SettingsMenu.mappingProfilePath, waiter: FieldMappingProfiles.waitLoading });
      });
  });

  after(() => {
    Users.deleteViaApi(user.userId);
  });

  it('C343284 Make some of the fields on the Invoice field mapping profile required (folijet)', { tags: [TestTypes.criticalPath, DevTeams.folijet] }, () => {
    FieldMappingProfiles.checkListOfExistingProfilesIsDisplayed();
    FieldMappingProfiles.openNewMappingProfileForm();
    FieldMappingProfiles.checkNewMappingProfileFormIsOpened();

    NewFieldMappingProfile.addName(mappingProfileName);
    NewFieldMappingProfile.addIncomingRecordType('EDIFACT invoice');
    NewFieldMappingProfile.addFolioRecordType('Invoice');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Batch group*');

    NewFieldMappingProfile.fillBatchGroup('"FOLIO"');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Vendor invoice number*');

    NewFieldMappingProfile.fillVendorInvoiceNumber('123');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Payment method*');

    NewFieldMappingProfile.fillPaymentMethod('"Cash"');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Currency*');

    NewFieldMappingProfile.fillCurrency('"USD"');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Description*');

    NewFieldMappingProfile.fillDescription('abc');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Quantity*');

    NewFieldMappingProfile.fillQuantity('1');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Sub-total*');

    NewFieldMappingProfile.fillSubTotal('10.00');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Vendor name*');

    NewFieldMappingProfile.fillVendorName('EBSCO');
    NewFieldMappingProfile.saveProfile();
    MappingProfileDetails.checkErrorMessageIsPresented('Invoice date*');
    NewFieldMappingProfile.fillInvoiceDate('###TODAY###');
    NewFieldMappingProfile.saveProfile();
    FieldMappingProfiles.closeViewModeForMappingProfile(mappingProfileName);
    FieldMappingProfiles.checkMappingProfilePresented(mappingProfileName);

    MappingProfileDetails.deleteMappingProfile(mappingProfileName);
  });
});

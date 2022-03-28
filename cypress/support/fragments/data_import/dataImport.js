import { Button, Section, HTML, including } from '../../../../interactors';
import { getLongDelay } from '../../utils/cypressTools';
import getRandomPostfix from '../../utils/stringTools';
import JobProfiles from './job_profiles/jobProfiles';
import SearchInventory from './searchInventory';
import TopMenu from '../topMenu';
import DataImportUploadFile from '../../../../interactors/dataImportUploadFile';

const uploadFile = (filePathName, fileName) => {
  cy.get('input[type=file]', getLongDelay()).attachFile({ filePath: filePathName, fileName });
};

const wailtLoading = () => {
  cy.expect(Section({ id: 'pane-jobs-title' }).exists());
  cy.expect(Section({ id: 'pane-jobs-title' }).find(HTML(including('Loading'))).absent());
  cy.expect(Section({ id: 'pane-logs-title' }).find(Button('View all')).exists());
};

export default {
  uploadFile,
  wailtLoading,

  uploadExportedFile(fileName) {
    cy.get('input[type=file]', getLongDelay()).attachFile(fileName);
  },

  uploadMarcBib: () => {
    // unique file name to upload
    const nameForMarcFileWithBib = `autotest1Bib${getRandomPostfix()}.mrc`;
    // upload a marc file for export
    cy.visit(TopMenu.dataImportPath);
    uploadFile('oneMarcBib.mrc', nameForMarcFileWithBib);
    JobProfiles.searchJobProfileForImport(JobProfiles.defaultInstanceAndSRSMarcBib);
    JobProfiles.runImportFile(nameForMarcFileWithBib);

    // get Instance HRID through API
    SearchInventory.getInstanceHRID()
      .then(id => {
        cy.wrap(id).as('requestedHrId');
      });
    return cy.get('@requestedHrId');
  },

  getLinkToAuthority: (title) => cy.then(() => Button(title).href()),

  // delete file if it hangs unimported before test
  checkUploadState:() => {
    cy.allure().startStep('Delete files before upload file');
    cy.visit(TopMenu.dataImportPath);
    wailtLoading();
    cy.then(() => DataImportUploadFile().isDeleteFilesButtonExists()).then(isDeleteFilesButtonExists => {
      if (isDeleteFilesButtonExists) {
        cy.do(Button('Delete files').click());
        cy.expect(Button('or choose files').exists());
        cy.allure().endStep();
      }
    });
  }
};

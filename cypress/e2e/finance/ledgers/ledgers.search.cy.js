import uuid from 'uuid';
import getRandomPostfix from '../../../support/utils/stringTools';
import Ledgers from '../../../support/fragments/finance/ledgers/ledgers';
import FinanceHelp from '../../../support/fragments/finance/financeHelper';
import TopMenu from '../../../support/fragments/topMenu';
import { MultiColumnList } from '../../../../interactors';
import TestType from '../../../support/dictionary/testTypes';
import devTeams from '../../../support/dictionary/devTeams';

describe('ui-finance: Ledgers', () => {
  let aUnit;

  const ledger = {
    id: uuid(),
    name: `E2E ledger ${getRandomPostfix()}`,
    code: `E2ELC${getRandomPostfix()}`,
    description: `E2E ledger description ${getRandomPostfix()}`,
    ledgerStatus: 'Frozen',
    currency: 'USD',
    restrictEncumbrance: false,
    restrictExpenditures: false,
    acqUnitIds: [],
    fiscalYearOneId: ''
  };

  before(() => {
    cy.login(Cypress.env('diku_login'), Cypress.env('diku_password'));
    cy.getAdminToken();

    cy.getAcqUnitsApi({ limit: 1 })
      .then(({ body }) => {
        ledger.acqUnitIds = [body.acquisitionsUnits[0].id];
        aUnit = body.acquisitionsUnits[0];
      });

    cy.getFiscalYearsApi({ limit: 1 })
      .then(({ body }) => {
        ledger.fiscalYearOneId = body.fiscalYears[0].id;
      });

    cy.visit(TopMenu.ledgerPath);
  });

  beforeEach(() => {
    cy.createLedgerApi({
      ...ledger
    });
  });

  afterEach(() => {
    cy.deleteLedgerApi(ledger.id);
  });

  it('C4061 Test the search and filter options for ledgers (thunderjet)', { tags: [TestType.smoke, devTeams.thunderjet] }, function () {
    FinanceHelp.checkZeroSearchResultsMessage();

    // search by acquisition units, name and status
    Ledgers.searchByStatusUnitsAndName('Frozen', aUnit.name, ledger.name);
    cy.expect(MultiColumnList({ id: 'ledgers-list' }).has({ rowCount: 1 }));

    // search by name only
    Ledgers.resetFilters();
    FinanceHelp.searchByName(ledger.name);
    cy.expect(MultiColumnList({ id: 'ledgers-list' }).has({ rowCount: 1 }));

    // search by code only
    Ledgers.resetFilters();
    FinanceHelp.searchByCode(ledger.code);
    cy.expect(MultiColumnList({ id: 'ledgers-list' }).has({ rowCount: 1 }));
  });
});

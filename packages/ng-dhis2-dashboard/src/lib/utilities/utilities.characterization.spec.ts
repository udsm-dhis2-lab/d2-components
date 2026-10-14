import { CurrentUser } from '@iapps/d2-web-sdk';
import {
  authorizedToViewItem,
  translateAccess,
  userAuthorizedDashboards,
} from './access-control.util';
import { DataSelectionUtil } from './data-selection.util';

const user = { id: 'user-a', userGroups: [{ id: 'group-a' }] } as CurrentUser;
const sharing = (overrides: Record<string, unknown> = {}) => ({
  owner: 'owner-a', public: '--------', external: false, users: {}, userGroups: {},
  ...overrides,
});

describe('dashboard utilities', () => {
  it('translates DHIS2 read and write access strings', () => {
    expect(translateAccess('rw------')).toEqual({ read: true, write: true });
    expect(translateAccess('--------')).toEqual({ read: false, write: false });
  });

  it.each([
    sharing({ owner: 'user-a' }), sharing({ public: 'r-------' }),
    sharing({ users: { 'user-a': { id: 'user-a', access: 'r-------' } } }),
    sharing({ userGroups: { 'group-a': { id: 'group-a', access: 'r-------' } } }),
  ])('authorizes every supported sharing path', (itemSharing) => {
    expect(authorizedToViewItem({ id: 'a', name: 'A', sharing: itemSharing }, user)).toBe(true);
  });

  it('filters unauthorized parents and nested menus', () => {
    const result = userAuthorizedDashboards([
      {
        id: 'allowed', name: 'Allowed', sharing: sharing({ public: 'r-------' }),
        subMenus: [
          { id: 'child-a', name: 'Visible', sharing: sharing({ owner: 'user-a' }) },
          { id: 'child-b', name: 'Hidden', sharing: sharing() },
        ],
      },
      { id: 'hidden', name: 'Hidden', sharing: sharing() },
    ], user);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'allowed', subMenus: [expect.objectContaining({ id: 'child-a' })],
      }),
    ]);
  });

  it('creates the configured startup period selection', () => {
    expect(DataSelectionUtil.getStartUpSelections({
      allowSelectionOnStartUp: true, startUpPeriodType: 'Yearly',
      periodConfig: { openFuturePeriods: 1 },
    })).toEqual([{ dimension: 'pe', items: [expect.objectContaining({ id: '2024' })] }]);
    expect(DataSelectionUtil.getStartUpSelections({
      allowSelectionOnStartUp: false, startUpPeriodType: 'Yearly',
    })).toEqual([]);
  });
});

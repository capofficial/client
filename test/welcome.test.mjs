import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';

// Load the actual browser ES module without changing this package's CommonJS metadata.
const source = await readFile(new URL('../src/lib/welcome.js', import.meta.url));
const {createWelcomeSession, WELCOME_STORAGE_KEY} = await import(`data:text/javascript;base64,${source.toString('base64')}`);

const eligible = {ready: true, page: 'Trade', modal: undefined};
function storage(entries = []) {
  const values = new Map(entries);
  return {values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};
}

test('offers the guide once on a new trading-dashboard visit', () => {
  const saved = storage();
  const session = createWelcomeSession(() => saved);
  assert.equal(session.shouldOpen(eligible), true);
  assert.equal(session.shouldOpen(eligible), false);
  assert.equal(saved.getItem(WELCOME_STORAGE_KEY), null, 'opening alone is not dismissal');
});

test('waits for the country check and a trading route', () => {
  const session = createWelcomeSession(() => storage());
  assert.equal(session.shouldOpen({...eligible, ready: false}), false);
  for (const page of [undefined, 'Home', 'Pool', 'Stake', 'Leaderboard']) {
    assert.equal(session.shouldOpen({...eligible, page}), false);
  }
  assert.equal(session.shouldOpen(eligible), true);
});

test('does not replace another modal and offers the guide after it closes', () => {
  const session = createWelcomeSession(() => storage());
  assert.equal(session.shouldOpen({...eligible, modal: 'LeverageSelect'}), false);
  assert.equal(session.shouldOpen(eligible), true);
});

test('dismissal survives a new session without changing unrelated preferences', () => {
  const saved = storage([['userSettings', '{"chartResolution":900}']]);
  const session = createWelcomeSession(() => saved);
  session.shouldOpen(eligible);
  session.dismiss();
  assert.equal(saved.getItem(WELCOME_STORAGE_KEY), '1');
  assert.equal(saved.getItem('userSettings'), '{"chartResolution":900}');
  assert.equal(createWelcomeSession(() => saved).shouldOpen(eligible), false);
});

test('a reload before dismissal still offers the guide', () => {
  const saved = storage();
  assert.equal(createWelcomeSession(() => saved).shouldOpen(eligible), true);
  assert.equal(createWelcomeSession(() => saved).shouldOpen(eligible), true);
});

test('only the versioned dismissal value suppresses onboarding', () => {
  for (const value of [null, '', '0', 'true', '{broken']) {
    assert.equal(createWelcomeSession(() => storage([[WELCOME_STORAGE_KEY, value]])).shouldOpen(eligible), true);
  }
  assert.equal(createWelcomeSession(() => storage([[WELCOME_STORAGE_KEY, '1']])).shouldOpen(eligible), false);
});

test('an unavailable storage getter does not break the dashboard', () => {
  const session = createWelcomeSession(() => { throw new Error('blocked'); });
  assert.equal(session.shouldOpen(eligible), true);
  assert.doesNotThrow(() => session.dismiss());
  assert.equal(session.shouldOpen(eligible), false);
});

test('a failed storage write still dismisses for the current session', () => {
  const saved = {getItem: () => null, setItem: () => { throw new Error('quota'); }};
  const session = createWelcomeSession(() => saved);
  session.shouldOpen(eligible);
  assert.doesNotThrow(() => session.dismiss());
  assert.equal(session.shouldOpen(eligible), false);
  assert.equal(createWelcomeSession(() => saved).shouldOpen(eligible), true);
});

test('a manually opened guide can be dismissed before automatic onboarding', () => {
  const saved = storage();
  const session = createWelcomeSession(() => saved);
  session.dismiss();
  assert.equal(session.shouldOpen(eligible), false);
  assert.equal(saved.getItem(WELCOME_STORAGE_KEY), '1');
});

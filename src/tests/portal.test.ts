import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getRankedCharacters,
  getRankedGuilds,
  paginate,
  mockCharacters,
} from '../data/rankingData.ts';

import {
  calculateCartTotal,
  mockShopProducts,
} from '../data/shopData.ts';

import {
  initialServerStatus,
  serverStateMetas,
} from '../data/serverStatusData.ts';

import { communityLinks } from '../config/site.ts';

test('Ranking: sorts characters by score descending by default', () => {
  const ranked = getRankedCharacters();
  assert.equal(ranked.length, mockCharacters.length);
  assert.equal(ranked[0].position, 1);
  assert.ok(ranked[0].score >= ranked[1].score);
  assert.equal(ranked[0].name, 'Galahad_Artemis');
});

test('Ranking: filters characters by class correctly', () => {
  const tkOnly = getRankedCharacters({ characterClass: 'TransKnight' });
  assert.ok(tkOnly.length > 0);
  assert.ok(tkOnly.every((c) => c.characterClass === 'TransKnight'));
  assert.equal(tkOnly[0].position, 1);

  const foemaOnly = getRankedCharacters({ characterClass: 'Foema' });
  assert.ok(foemaOnly.every((c) => c.characterClass === 'Foema'));
});

test('Ranking: filters characters by search query', () => {
  const result = getRankedCharacters({ search: 'Morgana' });
  assert.ok(result.length >= 1);
  assert.ok(result[0].name.includes('Morgana'));
});

test('Ranking: pagination handles boundaries and math accurately', () => {
  const all = getRankedCharacters();
  const page1 = paginate(all, 1, 8);
  assert.equal(page1.items.length, 8);
  assert.equal(page1.currentPage, 1);
  assert.equal(page1.startIndex, 1);
  assert.equal(page1.endIndex, 8);
  assert.equal(page1.totalPages, Math.ceil(all.length / 8));

  const page4 = paginate(all, 4, 8);
  assert.equal(page4.currentPage, 4);
  assert.equal(page4.startIndex, 25);
  assert.equal(page4.endIndex, all.length);
  assert.equal(page4.items.length, 1);
});

test('Ranking: sorts guilds by score descending', () => {
  const guilds = getRankedGuilds();
  assert.ok(guilds.length >= 5);
  assert.equal(guilds[0].position, 1);
  assert.equal(guilds[0].name, 'Valhalla');
  assert.ok(guilds[0].score >= guilds[1].score);
});

test('Shop: calculates cart total correctly in fictional credits', () => {
  const cart = [
    { productId: 'pkg-01', quantity: 2 }, // 2500 * 2 = 5000
    { productId: 'mount-01', quantity: 1 }, // 3000 * 1 = 3000
  ];
  const total = calculateCartTotal(cart, mockShopProducts);
  assert.equal(total, 8000);
});

test('Server Status: starts in unconnected state without fabricated player count', () => {
  assert.equal(initialServerStatus.state, 'unconnected');
  assert.equal(initialServerStatus.onlinePlayers, null);
  assert.equal(initialServerStatus.source, 'none');
  assert.ok(serverStateMetas.unconnected.label.includes('Não Conectado'));
});

test('Community Config: unconfigured channels default to null URL', () => {
  assert.equal(communityLinks.discord.url, null);
  assert.equal(communityLinks.community.url, null);
  assert.equal(communityLinks.support.url, null);
});

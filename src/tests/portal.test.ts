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
import {
  sanitizeText,
  sanitizeUrl,
  evaluatePasswordStrength,
  hashPassword,
} from '../utils/security.ts';
import {
  isAccountAdmin,
  AUTHORIZED_ADMIN_EMAILS,
  AUTHORIZED_ADMIN_USERNAMES,
  getAuthorizedAdminEmails,
  removeAuthorizedAdminEmail,
  getMasterPasskey,
  setMasterPasskey,
  DEFAULT_ADMIN_PASSKEY,
} from '../utils/adminAuth.ts';
import {
  validateGameAccountUsername,
  validateGameAccountPin,
  validateCharacterName,
  canAddGameAccount,
  canAddCharacterToAccount,
  validatePasswordChange,
  MAX_GAME_ACCOUNTS_PER_USER,
  MAX_CHARACTERS_PER_GAME_ACCOUNT,
} from '../utils/gameAccountRules.ts';

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

// ---------------------------------------------------------------------------
// Testes Automatizados do Carrossel e Gerenciador de Slides
// ---------------------------------------------------------------------------

import {
  initialDefaultSlides,
  presetBannerImages,
  filterActiveSlides,
  isSlideActive,
  validateSlide,
} from '../data/slidesData.ts';
import type { BannerSlide } from '../types/index.ts';

test('Carousel: preset banners contains all 5 official medieval slides', () => {
  assert.equal(presetBannerImages.length, 5);
  assert.equal(initialDefaultSlides.length, 5);
  const ids = presetBannerImages.map((p) => p.id);
  assert.ok(ids.includes('banner-cadastro'));
  assert.ok(ids.includes('banner-atualizacao'));
  assert.ok(ids.includes('banner-lenda'));
  assert.ok(ids.includes('banner-pvp'));
  assert.ok(ids.includes('banner-comunidade'));
});

test('Carousel: filters out inactive and draft slides', () => {
  const sampleSlides: BannerSlide[] = [
    {
      id: 's1',
      title: 'Slide Publicado',
      imageUrl: '/img1.png',
      alignment: 'left',
      status: 'published',
      order: 1,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
    {
      id: 's2',
      title: 'Slide Rascunho',
      imageUrl: '/img2.png',
      alignment: 'left',
      status: 'draft',
      order: 2,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
    {
      id: 's3',
      title: 'Slide Inativo',
      imageUrl: '/img3.png',
      alignment: 'left',
      status: 'inactive',
      order: 3,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
  ];

  const active = filterActiveSlides(sampleSlides);
  assert.equal(active.length, 1);
  assert.equal(active[0].id, 's1');
});

test('Carousel: filters out future scheduled slides and past expired slides', () => {
  const now = new Date('2026-10-23T12:00:00Z');

  const futureSlide: BannerSlide = {
    id: 'future',
    title: 'Evento Futuro',
    imageUrl: '/future.png',
    alignment: 'center',
    status: 'published',
    order: 1,
    startDate: '2026-11-01T00:00:00Z', // Agendado para o futuro
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  };

  const expiredSlide: BannerSlide = {
    id: 'expired',
    title: 'Evento Passado',
    imageUrl: '/past.png',
    alignment: 'center',
    status: 'published',
    order: 2,
    endDate: '2026-10-01T00:00:00Z', // Expirado
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  };

  const validSlide: BannerSlide = {
    id: 'valid',
    title: 'Evento Vigente',
    imageUrl: '/valid.png',
    alignment: 'center',
    status: 'published',
    order: 3,
    startDate: '2026-10-20T00:00:00Z',
    endDate: '2026-10-30T00:00:00Z',
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
  };

  assert.equal(isSlideActive(futureSlide, now), false);
  assert.equal(isSlideActive(expiredSlide, now), false);
  assert.equal(isSlideActive(validSlide, now), true);

  const filtered = filterActiveSlides([futureSlide, expiredSlide, validSlide], now);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'valid');
});

test('Carousel: sorts active slides by order ascending', () => {
  const unordered: BannerSlide[] = [
    {
      id: 's3',
      title: 'Terceiro',
      imageUrl: '/img.png',
      alignment: 'center',
      status: 'published',
      order: 3,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
    {
      id: 's1',
      title: 'Primeiro',
      imageUrl: '/img.png',
      alignment: 'center',
      status: 'published',
      order: 1,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
    {
      id: 's2',
      title: 'Segundo',
      imageUrl: '/img.png',
      alignment: 'center',
      status: 'published',
      order: 2,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
  ];

  const sorted = filterActiveSlides(unordered);
  assert.equal(sorted[0].id, 's1');
  assert.equal(sorted[1].id, 's2');
  assert.equal(sorted[2].id, 's3');
});

test('Carousel: validateSlide catches invalid input and approves valid payload', () => {
  // Empty title & image
  const invalidEmpty = validateSlide({ title: '', imageUrl: '' });
  assert.ok(invalidEmpty.title);
  assert.ok(invalidEmpty.imageUrl);

  // Button text without URL
  const invalidBtn = validateSlide({
    title: 'Teste',
    imageUrl: '/img.png',
    buttonText: 'Cadastre-se',
    buttonUrl: '',
  });
  assert.ok(invalidBtn.buttonUrl);

  // End date before start date
  const invalidDates = validateSlide({
    title: 'Teste',
    imageUrl: '/img.png',
    startDate: '2026-10-25T10:00',
    endDate: '2026-10-20T10:00',
  });
  assert.ok(invalidDates.endDate);

  // Valid payload
  const valid = validateSlide({
    title: 'Título Válido',
    imageUrl: '/assets/slides/slide-cadastro.png',
    buttonText: 'Cadastrar',
    buttonUrl: '/area-jogador',
    order: 1,
    startDate: '2026-10-20T00:00',
    endDate: '2026-10-30T00:00',
  });
  assert.equal(Object.keys(valid).length, 0);
});

test('Security: sanitizeText removes HTML tags and harmful characters', () => {
  const dirtyInput = '<script>alert("xss")</script>Guerreiro<b>Mortal</b>';
  const clean = sanitizeText(dirtyInput);
  assert.equal(clean, 'alert("xss")GuerreiroMortal');
});

test('Security: sanitizeUrl rejects malicious schemes and accepts safe URLs and routes', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeUrl('vbscript:msgbox(1)'), null);
  assert.equal(sanitizeUrl('data:text/html,hack'), null);
  assert.equal(sanitizeUrl('/area-jogador'), '/area-jogador');
  assert.equal(sanitizeUrl('https://wydartemis.com/noticias'), 'https://wydartemis.com/noticias');
});

test('Security: evaluatePasswordStrength rates weak, medium and strong correctly', () => {
  // Less than 6 chars
  const weak = evaluatePasswordStrength('123');
  assert.equal(weak.label, 'Fraca');
  assert.equal(weak.hasMinLength, false);

  // 6+ chars but only letters
  const medium = evaluatePasswordStrength('senhaforte');
  assert.equal(medium.label, 'Média');
  assert.equal(medium.hasMinLength, true);

  // 8+ chars with letters, numbers and special symbols
  const strong = evaluatePasswordStrength('Artemis#2026');
  assert.equal(strong.label, 'Forte');
  assert.equal(strong.score, 2);
});

test('Security: hashPassword produces hashed output without plaintext leakage', async () => {
  const password = 'MinhaSenhaSecreta123';
  const hash = await hashPassword(password);

  assert.ok(hash);
  assert.notEqual(hash, password);
  assert.ok(typeof hash === 'string');
});

// ---------------------------------------------------------------------------
// Testes de Cargo e Acesso de Administrador (MALACA & malaca7x@gmail.com)
// ---------------------------------------------------------------------------

test('Admin Auth: MALACA with email malaca7x@gmail.com has administrator role and privileges', () => {
  assert.ok(AUTHORIZED_ADMIN_EMAILS.includes('malaca7x@gmail.com'));
  assert.ok(AUTHORIZED_ADMIN_USERNAMES.includes('malaca'));

  // Por e-mail oficial
  assert.equal(isAccountAdmin('malaca7x@gmail.com', null, null), true);
  // Por nome de usuário oficial
  assert.equal(isAccountAdmin(null, 'MALACA', null), true);
  // Por ambos
  assert.equal(isAccountAdmin('malaca7x@gmail.com', 'MALACA', 'admin'), true);
});

test('Admin Auth: handles case-insensitivity and whitespace for MALACA and malaca7x@gmail.com', () => {
  assert.equal(isAccountAdmin('  MALACA7X@GMAIL.COM  ', null, null), true);
  assert.equal(isAccountAdmin('Malaca7x@Gmail.Com', 'malaca', null), true);
  assert.equal(isAccountAdmin(null, '   MaLaCa   ', null), true);
});

test('Admin Auth: denies administrator privileges to ordinary users without admin credentials', () => {
  assert.equal(isAccountAdmin('guerreiro@gmail.com', 'Guerreiro123', null), false);
  assert.equal(isAccountAdmin('jogador@artemis.realm', 'PlayerOne', 'player'), false);
  assert.equal(isAccountAdmin(null, null, null), false);
});

test('Admin Auth: role admin or administrator grants immediate admin status', () => {
  assert.equal(isAccountAdmin('outro@email.com', 'OutroUser', 'admin'), true);
  assert.equal(isAccountAdmin(null, null, 'administrator'), true);
});

test('Admin Access Control: getAuthorizedAdminEmails returns official default list', () => {
  const emails = getAuthorizedAdminEmails();
  assert.ok(emails.includes('malaca7x@gmail.com'));
  assert.ok(emails.includes('admin@wydartemis.com.br'));
});

test('Admin Access Control: prevents revoking permissions of primary administrator MALACA', () => {
  assert.throws(
    () => removeAuthorizedAdminEmail('malaca7x@gmail.com'),
    /Não é permitido revogar os privilégios do Administrador Geral/
  );
});

test('Admin Access Control: validates master passkey defaults and constraints', () => {
  const passkey = getMasterPasskey();
  assert.equal(passkey, DEFAULT_ADMIN_PASSKEY);
  assert.throws(
    () => setMasterPasskey('123'),
    /A nova chave mestra deve conter ao menos 6 caracteres/
  );
});

test('Game Accounts: validates username length, characters and constraints', () => {
  // Valid usernames
  assert.equal(validateGameAccountUsername('guerreiro_01').valid, true);
  assert.equal(validateGameAccountUsername('malaca_adm').valid, true);
  assert.equal(validateGameAccountUsername('foema99').valid, true);

  // Invalid: empty or null
  assert.equal(validateGameAccountUsername('').valid, false);

  // Invalid: too short (< 4) or too long (> 16)
  assert.equal(validateGameAccountUsername('abc').valid, false);
  assert.equal(validateGameAccountUsername('abcdefghijklmnopq').valid, false);

  // Invalid: spaces or special characters
  assert.equal(validateGameAccountUsername('guerreiro 01').valid, false);
  assert.equal(validateGameAccountUsername('guerreiro@01').valid, false);
});

test('Game Accounts: validates 4-digit numeric security PIN', () => {
  // Valid 4-digit PINs
  assert.equal(validateGameAccountPin('1234').valid, true);
  assert.equal(validateGameAccountPin('9876').valid, true);
  assert.equal(validateGameAccountPin('0000').valid, true);

  // Invalid PINs: wrong length, letters or empty
  assert.equal(validateGameAccountPin('').valid, false);
  assert.equal(validateGameAccountPin('123').valid, false);
  assert.equal(validateGameAccountPin('12345').valid, false);
  assert.equal(validateGameAccountPin('123456').valid, false);
  assert.equal(validateGameAccountPin('abcd').valid, false);
  assert.equal(validateGameAccountPin('12a4').valid, false);
});

test('Game Accounts: validates character name constraints', () => {
  // Valid character names
  assert.equal(validateCharacterName('Artemis_TK').valid, true);
  assert.equal(validateCharacterName('Sir_Galahad').valid, true);
  assert.equal(validateCharacterName('Foema-Pro').valid, true);

  // Invalid character names
  assert.equal(validateCharacterName('').valid, false);
  assert.equal(validateCharacterName('ab').valid, false); // too short (< 3)
  assert.equal(validateCharacterName('VeryLongNameExceedsLimit').valid, false); // too long (> 14)
  assert.equal(validateCharacterName('Hero Name').valid, false); // spaces
  assert.equal(validateCharacterName('Hero#1').valid, false); // special character
});

test('Game Accounts: enforces slot boundaries (max 5 game accounts, max 4 characters per account)', () => {
  assert.equal(MAX_GAME_ACCOUNTS_PER_USER, 5);
  assert.equal(MAX_CHARACTERS_PER_GAME_ACCOUNT, 4);

  // Can add game account
  assert.equal(canAddGameAccount(0), true);
  assert.equal(canAddGameAccount(4), true);
  assert.equal(canAddGameAccount(5), false);
  assert.equal(canAddGameAccount(6), false);

  // Can add character to account (WYD 4 character slots)
  assert.equal(canAddCharacterToAccount(0), true);
  assert.equal(canAddCharacterToAccount(3), true);
  assert.equal(canAddCharacterToAccount(4), false);
  assert.equal(canAddCharacterToAccount(5), false);
});

test('Password Change: enforces minimum length, confirmation and old password verification', () => {
  // Valid change
  assert.equal(validatePasswordChange('novaSenha123', 'novaSenha123', 'antiga123', 'antiga123').valid, true);

  // Invalid: new password too short (< 6)
  assert.equal(validatePasswordChange('123', '123').valid, false);
  assert.match(validatePasswordChange('123', '123').error || '', /pelo menos 6 caracteres/);

  // Invalid: confirmation does not match
  assert.equal(validatePasswordChange('novaSenha123', 'outraSenha').valid, false);
  assert.match(validatePasswordChange('novaSenha123', 'outraSenha').error || '', /não coincide/);

  // Invalid: wrong old password
  assert.equal(validatePasswordChange('novaSenha123', 'novaSenha123', 'senhaErrada', 'senhaCerta').valid, false);
  assert.match(
    validatePasswordChange('novaSenha123', 'novaSenha123', 'senhaErrada', 'senhaCerta').error || '',
    /senha atual digitada está incorreta/
  );
});






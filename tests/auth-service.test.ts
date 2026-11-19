import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { AuthService } from '../src/domain/auth-service.ts';

test('AuthService - Sign up & Sign in with Google OAuth, session validation, and logout', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const auth = new AuthService(db, bus);

  // 1. Initial Google Sign up
  const signupResult = auth.createGoogleUserOrLogin({
    googleId: 'google_sub_12345',
    email: 'newdeveloper@gmail.com',
    name: 'Ada Lovelace',
    avatarUrl: 'https://example.com/avatar.png',
  });

  assert.equal(signupResult.isNewUser, true);
  assert.equal(signupResult.user.email, 'newdeveloper@gmail.com');
  assert.equal(signupResult.user.name, 'Ada Lovelace');
  assert.ok(signupResult.sessionToken.startsWith('devos_ses_'));

  // 2. Validate active session token
  const validatedUser = auth.validateSession(signupResult.sessionToken);
  assert.ok(validatedUser);
  assert.equal(validatedUser.id, signupResult.user.id);
  assert.equal(validatedUser.email, 'newdeveloper@gmail.com');

  // 3. Repeat login with same Google account (Sign in)
  const loginResult = auth.createGoogleUserOrLogin({
    googleId: 'google_sub_12345',
    email: 'newdeveloper@gmail.com',
    name: 'Ada Lovelace Updated',
  });

  assert.equal(loginResult.isNewUser, false);
  assert.equal(loginResult.user.id, signupResult.user.id);
  assert.equal(loginResult.user.name, 'Ada Lovelace Updated');

  // 4. Logout session
  const loggedOut = auth.logout(signupResult.sessionToken);
  assert.equal(loggedOut, true);

  // 5. Verifying old session token returns null after logout
  const afterLogoutUser = auth.validateSession(signupResult.sessionToken);
  assert.equal(afterLogoutUser, null);
});

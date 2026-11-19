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

test('AuthService - Email and password signup, signin, and dynamic workspace initialization', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const auth = new AuthService(db, bus);

  // 1. Sign up with email and password
  const signup = auth.signUpWithPassword({
    email: 'grace.hopper@compiler.org',
    password: 'supersecretpassword',
    name: 'Grace Hopper',
  });

  assert.ok(signup.user.id.startsWith('usr_'));
  assert.equal(signup.user.email, 'grace.hopper@compiler.org');
  assert.equal(signup.user.name, 'Grace Hopper');
  assert.ok(signup.sessionToken.startsWith('devos_ses_'));

  // 2. Validate session
  const validUser = auth.validateSession(signup.sessionToken);
  assert.ok(validUser);
  assert.equal(validUser.email, 'grace.hopper@compiler.org');

  // 3. Reject duplicate signup with same email
  assert.throws(() => {
    auth.signUpWithPassword({
      email: 'grace.hopper@compiler.org',
      password: 'differentpassword',
    });
  }, /account with this email already exists/i);

  // 4. Sign in with correct password
  const signin = auth.signInWithPassword({
    email: 'grace.hopper@compiler.org',
    password: 'supersecretpassword',
  });
  assert.ok(signin.sessionToken);
  assert.equal(signin.user.id, signup.user.id);

  // 5. Reject sign in with incorrect password
  assert.throws(() => {
    auth.signInWithPassword({
      email: 'grace.hopper@compiler.org',
      password: 'wrongpassword',
    });
  }, /invalid email or password/i);

  // 6. Sign in with seeded default developer user
  const devSignin = auth.signInWithPassword({
    email: 'developer@devos.local',
    password: 'devos123',
  });
  assert.ok(devSignin.sessionToken);
  assert.equal(devSignin.user.name, 'Lead Engineer');
});

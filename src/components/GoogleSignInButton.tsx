"use client";

import React from 'react';

/**
 * Native "Sign in with Google" button component.
 * Uses the Google Identity Services HTML API to render a standard,
 * personalized (if available) Google sign-in button.
 */
export default function GoogleSignInButton() {
  return (
    <div className="flex justify-center my-2">
      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
        data-width="240"
        data-use_fedcm_for_button="true"
        data-button_auto_select="true"
      ></div>
    </div>
  );
}

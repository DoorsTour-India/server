import '@babel/polyfill';
import { resetPassword } from './resetPassword';

//DOM Elements
const resetPasswordForm = document.getElementById('form-reset-password');
const resetPasswordBtn = document.querySelector('.btn--save-password');
const token = resetPasswordBtn.dataset.token;

//Delegations
if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    console.log(token);

    await resetPassword(password, passwordConfirm, token);

    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

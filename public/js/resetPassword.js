import axios from 'axios';
import { showAlert } from './alerts';

export const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/krayikapi/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Updated Successfully!, Log In the app to continue!'
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};

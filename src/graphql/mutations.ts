import { gql } from '@apollo/client';

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    SignIn(email: $email, password: $password) {
      user {
        id
        email
      }
      session {
        access_token
      }
    }
  }
`;

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!, $username: String!) {
    SignUp(email: $email, password: $password, username: $username) {
      user {
        id
        email
      }
    }
  }
`;

export const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    SignOut {
      success
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!, $redirectTo: String) {
    ForgotPassword(email: $email, redirectTo: $redirectTo) {
      success
    }
  }
`;

export const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($password: String!) {
    UpdatePassword(password: $password) {
      success
    }
  }
`;

export const SIGN_IN_WITH_GOOGLE_MUTATION = gql`
  mutation SignInWithGoogle($redirectTo: String) {
    SignInWithGoogle(redirectTo: $redirectTo) {
      url
    }
  }
`;

import { gql } from '@apollo/client';

// Definir la mutación de login
export const LOGIN_MUTATION = gql`
  mutation ($loginInput: LoginInput) {
    loginUser(loginInput: $loginInput) {
      _id
      username
      name
      rol
      token
    }
  }
`;

export const ADD_USER = gql`
  mutation ($registerInput: RegisterInput) {
    registerUser(registerInput: $registerInput) {
      _id
    }
  }
`;

export const GET_USERS = gql`
  query getUsers {
    users {
      _id
      username
      name
      rol
    }
  }
`;

export const DELETE_USER = gql`
  mutation ($id: ID!) {
    deleteUser(_id: $id) {
      _id
    }
  }
`;

export const USERS_QUANTITY = gql`
  query usersQuantity {
    usersQuantity
  }
`;

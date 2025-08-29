import { gql } from "@apollo/client";

// Definir la mutación de login
export const LOGIN_MUTATION = gql`
  mutation ($loginInput: LoginInput) {
    loginUser(loginInput: $loginInput) {
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

export const UPDATE_USER_TABLE_ASSIGNMENT = gql`
  mutation ($id: ID!, $assignedTableId: ID) {
    updateUserTableAssignment(_id: $id, assignedTableId: $assignedTableId) {
      _id
      assignedTable {
        _id
        number
      }
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
      assignedTable {
        _id
        number
      }
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

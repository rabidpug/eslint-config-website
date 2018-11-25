import gql from 'graphql-tag';


export const RULE_QUERY = gql`
  query rule($id: ID $name: String) {
    rule(id: $id name: $name) {
      id
      name
      options {
        type
        name
        value
        defaultValue
        options
      }
      value
      category
      shortDescription
      longDescription
      examples {
        correct
        incorrect
      }
      isRecommended
      isFixable
    }
  }
`;

export const RULES_QUERY = gql`
  {
    rules {
      id
      name
      options {
        type
        name
        value
        defaultValue
        options
      }
      value
      category
      shortDescription
      longDescription
      examples {
        correct
        incorrect
      }
      isRecommended
      isFixable
    }
  }
`;

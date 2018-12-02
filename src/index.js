import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import { ApolloProvider, Query } from 'react-apollo';
import fast from 'fast.js';
import { ToastContainer, toast } from 'react-toastify';

import { Loader, EditingModeModal } from 'ui/atoms';
import { ConfigPreviewer } from 'ui/molecules';
import { Sidebar, RuleInfo } from 'ui/organisms';
import { GlobalStyles } from 'ui/theme';

import { RULES_QUERY } from 'graphql/queries/rule';
import { client } from 'client';
import { generateConfig } from 'utils';

import 'react-toastify/dist/ReactToastify.css';


const Wrapper = styled.div`
  display: flex;
`;


class App extends React.Component {
  state = {
    rules: [],
    filteredRules: [],
    activeRule: null,
    searchingString: '',
    isConfigPreviewerVisible: false,
    isEditingModeEnabled: false,
    isEditingModeModalVisible: false,
    wasEditingModeModalShowed: false,
    didRulesQueryMount: false,
  };

  filterRules = () => {
    this.setState((prevState) => {
      if (prevState.searchingString.length === 0) {
        return {
          ...prevState,
          filteredRules: prevState.rules,
        };
      }

      const rulesMatchedByName = fast.filter(prevState.rules, ((rule) => rule.name.includes(prevState.searchingString)));
      const rulesMatchedByShortDescription = fast.filter(prevState.rules, ((rule) => rule.shortDescription.includes(prevState.searchingString)));

      const filteredRules = [...rulesMatchedByName, ...rulesMatchedByShortDescription];

      const filteredRulesWithoutCopies = fast.filter(filteredRules, ((rule, i, rules) => !rules.includes(rule, i + 1)));

      return {
        ...prevState,
        filteredRules: filteredRulesWithoutCopies,
      };
    });
  };

  changeSearchingString = (value) => {

    if (value === 'TURN ON EDITING MODE' || value === 'TURN OFF EDITING MODE') {
      if (this.state.isEditingModeEnabled !== (value === 'TURN ON EDITING MODE')) {
        this.setState({
          isEditingModeEnabled: value === 'TURN ON EDITING MODE',
          isEditingModeModalVisible: value === 'TURN ON EDITING MODE',
        }, () => toast.success(`Editing mode was successfully ${value === 'TURN ON EDITING MODE' ? 'enabled' : 'disabled'}`));
      }
    } else {
      this.setState({
        searchingString: value,
      }, this.filterRules);
    }
  };

  setActiveRule = (activeRuleName) => {

    this.setState((prevState) => {
      if (activeRuleName === 'previous' || activeRuleName === 'next') {
        const activeRuleIndex = prevState.filteredRules.findIndex((rule) => rule.name === prevState.activeRule.name);
        let newActiveRuleIndex = activeRuleName === 'previous' ? activeRuleIndex - 1 : activeRuleIndex + 1;

        if (newActiveRuleIndex < 0) {
          newActiveRuleIndex = prevState.filteredRules.length - 1;
        } else if (newActiveRuleIndex > prevState.filteredRules.length - 1) {
          newActiveRuleIndex = 0;
        }

        activeRuleName = prevState.filteredRules[newActiveRuleIndex].name;
      }

      return {
        ...prevState,
        filteredRules: fast.map(prevState.filteredRules, ((rule) => {
          rule.isActive = rule.name === activeRuleName;

          return rule;
        })),
        activeRule: prevState.rules.find((rule) => rule.name === activeRuleName),
      };
    });
  };

  toggleAllRulesInCategory = (category, value) => {
    this.setState((prevState) => {

      return {
        ...prevState,
        rules: fast.map(prevState.rules, ((rule) => {
          if (rule.category === category) {
            rule.isTurnedOn = value;
          }

          return rule;
        })),
      };
    });
  };

  changeRuleValue = (ruleName, value) => {
    this.setState((prevState) => {
      const rules = [...prevState.rules];

      const changingRuleIndex = rules.findIndex((rule) => rule.name === ruleName);

      if (rules[changingRuleIndex].value !== value) {
        rules[changingRuleIndex].isTurnedOn = true;
      }

      rules[changingRuleIndex].value = value;

      return {
        ...prevState,
        rules: rules,
      };
    });
  };

  changeRuleTurnOnValue = (ruleName, value) => {
    this.setState((prevState) => {
      const rules = [...prevState.rules];

      const changingRuleIndex = rules.findIndex((rule) => rule.name === ruleName);

      rules[changingRuleIndex].isTurnedOn = value;

      return {
        ...prevState,
        rules: rules,
      };
    });
  };

  changeRuleOptionValue = (ruleName, optionName, value) => {
    this.setState((prevState) => {
      const rules = [...prevState.rules];

      const changingRuleIndex = rules.findIndex((rule) => rule.name === ruleName);
      const changingRuleOptionIndex = rules[changingRuleIndex].options.findIndex((option) => option.name === optionName);

      rules[changingRuleIndex].options[changingRuleOptionIndex].value = value;

      if (!rules[changingRuleIndex].options.every((option) => option.value === option.defaultValue)) {
        rules[changingRuleIndex].isTurnedOn = true;
      }

      return {
        ...prevState,
        rules: rules,
      };
    });
  };

  downloadConfig = () => {
    const element = document.createElement('a');
    const file = new Blob([generateConfig(this.state.rules)], { type: 'application/json' });

    element.href = URL.createObjectURL(file);
    element.download = '_.eslintrc.json';
    element.click();
  };

  openConfigPreviewer = () => {
    this.setState({ isConfigPreviewerVisible: true });
  };

  closeConfigPreviewer = () => {
    this.setState({ isConfigPreviewerVisible: false });
  };

  closeEditingModeModal = () => {
    this.setState({
      isEditingModeModalVisible: false,
      wasEditingModeModalShowed: true,
    });
  };

  render = () => {

    return (
      <ApolloProvider client={ client }>
        <GlobalStyles/>

        {
          !this.state.didRulesQueryMount ?
            <Query query={ RULES_QUERY }>
              { ({ error, loading, data }) => {
                if (error) {
                  return <div>Oops, error! { error.message }</div>;
                } else if (loading) {
                  return <Loader/>;
                }

                if (data.rules && data.rules.length) {
                  const sortedRules = data.rules.sort((rule1, rule2) => {
                    if (rule1.name < rule2.name) return -1;
                    if (rule1.name > rule2.name) return 1;

                    return 0;
                  });

                  const possibleErrorsRules = fast.filter(sortedRules, (rule) => rule.category === 'Possible Errors');
                  const bestPracticesRules = fast.filter(sortedRules, (rule) => rule.category === 'Best Practices');
                  const strictModeRules = fast.filter(sortedRules, (rule) => rule.category === 'Strict Mode');
                  const variablesRules = fast.filter(sortedRules, (rule) => rule.category === 'Variables');
                  const nodeJSAndCommonJSRules = fast.filter(sortedRules, (rule) => rule.category === 'Node.js and CommonJS');
                  const stylisticIssuesRules = fast.filter(sortedRules, (rule) => rule.category === 'Stylistic Issues');
                  const ECMAScript6Rules = fast.filter(sortedRules, (rule) => rule.category === 'ECMAScript 6');

                  possibleErrorsRules[0].isActive = true; // First element should be active by default

                  this.setState({
                    rules: [
                      ...possibleErrorsRules,
                      ...bestPracticesRules,
                      ...strictModeRules,
                      ...variablesRules,
                      ...nodeJSAndCommonJSRules,
                      ...stylisticIssuesRules,
                      ...ECMAScript6Rules,
                    ],
                    activeRule: possibleErrorsRules[0],
                    didRulesQueryMount: true,
                  });

                  this.filterRules();
                }

                return null;
              } }
            </Query>
            :
            <Wrapper>
              <Sidebar
                rules={ this.state.filteredRules }
                onSearchEnterPress={ this.changeSearchingString }
                onCategorySwitcherClick={ this.toggleAllRulesInCategory }
                onRuleSwitcherClick={ this.changeRuleTurnOnValue }
                onRuleClick={ this.setActiveRule }
                onDownloadConfigButtonClick={ this.downloadConfig }
                onPreviewConfigButtonClick={ this.openConfigPreviewer }
              />
              {
                this.state.isConfigPreviewerVisible ?
                  <ConfigPreviewer rules={ this.state.rules } onCloseButtonClick={ this.closeConfigPreviewer }/>
                  :
                  <RuleInfo
                    rule={ this.state.activeRule }
                    onSelectChange={ this.changeRuleValue }
                    onPreviousOrNextButtonClick={ this.setActiveRule }
                    onSwitcherClick={ this.changeRuleTurnOnValue }
                    onOptionChange={ this.changeRuleOptionValue }
                    isEditingModeEnabled={ this.state.isEditingModeEnabled }
                  />
              }
            </Wrapper>
        }

        <ToastContainer
          autoClose={ 5000 }
          closeButton={ false }
          hideProgressBar={ true }
          newestOnTop={ true }
          draggable={ false }
        />

        <EditingModeModal
          isVisible={ this.state.isEditingModeModalVisible && !this.state.wasEditingModeModalShowed }
          onCloseButtonClick={ this.closeEditingModeModal }
        />
      </ApolloProvider>
    );
  };
}


ReactDOM.render(<App/>, document.getElementById('root'));


if (module.hot) {
  module.hot.accept();
}

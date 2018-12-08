import * as React from 'react';
import styled, { css } from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';

import { Switcher } from 'ui/atoms';
import { Check, Wrench, Missing } from 'ui/outlines';
import { color } from 'ui/theme';

import { rgba } from 'utils';


const Name = styled.h3`
  display: inline;
  font-size: 16px;
  font-weight: 500;
  color: ${rgba(color.secondary, 0.7)};
  margin-top: 0;
  margin-bottom: 0;
  transition: 0.1s;
`;

const Description = styled.p`
  font-size: 14px;
  text-decoration: none;
  color: ${rgba(color.secondary, 0.7)};
  margin-top: 0;
  margin-bottom: 0;
  transition: 0.1s;
`;

const HeaderSide = styled.div`
  flex-grow: 1;
  text-decoration: none;
  padding-right: 10px;
  padding-bottom: 5px;
  
  &:last-child {
    flex-grow: 0;
    display: flex;
    align-items: center;
    padding-right: 0;
  }
    
  svg {
    position: relative;
    z-index: 9;
    display: inline;
    fill: ${rgba(color.secondary, 0.7)};
    margin-top: 2.5px;
    margin-left: 5px;
    transition: 0.1s;
    
    &:first-child {
      margin-left: 0;
      margin-right: 5px;
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  ${Switcher} {
    flex-shrink: 0;
  }
`;

const Wrapper = styled.div`
  cursor: pointer;
  
  &:hover {
  
    ${Name} {
      color: ${color.secondary};
    }
    
    ${Description} {
      color: ${color.secondary};
    }
    
    ${HeaderSide} {
      
      svg {
        fill: ${color.secondary};
      }
    }
  }

  ${props => css`
    
    ${props.isActive && css`
  
      &:hover {
      
        ${Name} {
          color: ${color.primary};
        }
        
        ${Description} {
          color: ${color.secondary};
        }
        
        ${HeaderSide} {
      
          svg {
            fill: ${color.secondary};
          }
        }
      }

      ${Name} {
        color: ${color.primary};
      }
      
      ${Description} {
        color: ${color.secondary};
      }
      
      ${HeaderSide} {
    
        svg {
          fill: ${color.secondary};
        }
      }
    `}
  `}
`;


export class Rule extends React.Component {

  shouldComponentUpdate = (nextProps) => {
    return nextProps.isTurnedOn !== this.props.isTurnedOn || nextProps.isActive !== this.props.isActive;
  };

  render = () => {
    const doesHaveMissingExamples = this.props.examples.length ? this.props.examples.some((example) => !example.correct && !example.incorrect) : true;

    return (
      <Wrapper className={ this.props.className } isActive={ this.props.isActive }>
        <Header>
          <HeaderSide to={ `/rules/${this.props.name}` } as={ Link }>
            <Name>{ this.props.name }</Name>
            {
              this.props.isRecommended &&
              <React.Fragment>
                <Check data-tip data-for={ `rule-check-icon-${ this.props.name }` } width={ 14 } height={ 14 }/>
                <ReactTooltip id={ `rule-check-icon-${this.props.name}` } className={ 'react-tooltip' } effect={ 'solid' } delayShow={ 500 }>
                  <span>Recommended</span>
                </ReactTooltip>
              </React.Fragment>
            }
            {
              this.props.isFixable &&
              <React.Fragment>
                <Wrench data-tip data-for={ `rule-wrench-icon-${ this.props.name }` } width={ 14 } height={ 14 }/>
                <ReactTooltip id={ `rule-wrench-icon-${this.props.name}` } className={ 'react-tooltip' } effect={ 'solid' } delayShow={ 500 }>
                  <span>Fixable</span>
                </ReactTooltip>
              </React.Fragment>
            }
          </HeaderSide>

          <HeaderSide>
            {
              doesHaveMissingExamples &&
              <React.Fragment>
                <Missing data-tip data-for={ `rule-missing-icon-${ this.props.name }` } width={ 14 } height={ 14 }/>
                <ReactTooltip id={ `rule-missing-icon-${this.props.name}` } className={ 'react-tooltip' } effect={ 'solid' } delayShow={ 500 }>
                  <span>Has missing examples</span>
                </ReactTooltip>
              </React.Fragment>
            }
            <Switcher
              data-tip
              data-for={ `rule-switcher-${this.props.name}` }
              isActive={ this.props.isTurnedOn }
              onClick={ () => this.props.onSwitcherClick(this.props.name, !this.props.isTurnedOn) }
            />
            <ReactTooltip id={ `rule-switcher-${this.props.name}` } className={ 'react-tooltip' } effect={ 'solid' } delayShow={ 750 }>
              <span>{ this.props.isTurnedOn ? 'Turn off' : 'Turn on' }</span>
            </ReactTooltip>
          </HeaderSide>
        </Header>

        <Description to={ `/rules/${this.props.name}` } as={ Link }>{ this.props.description }</Description>
      </Wrapper>
    );
  };
};

import * as React from 'react';
import styled, { css } from 'styled-components';

import { Switcher } from 'ui/atoms';
import { Check, Wrench } from 'ui/outlines';
import { color } from 'ui/theme';
import { rgba } from 'utils';


const Name = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${rgba(color.secondary, 0.7)};
  margin-top: 0;
  margin-bottom: 0;
  transition: 0.1s;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${rgba(color.secondary, 0.7)};
  margin-top: 0;
  margin-bottom: 0;
  transition: 0.1s;
`;

const HeaderSide = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  padding-right: 5px;
  padding-bottom: 5px;
    
  svg {
    fill: ${rgba(color.secondary, 0.7)};
    margin-left: 5px;
    transition: 0.1s;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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


export const Rule = (props) => {
  return (
    <Wrapper className={ props.className } isActive={ props.isActive }>
      <Header>
        <HeaderSide onClick={ () => props.onClick(props.name) }>
          <Name>{ props.name }</Name>
          { props.isRecommended && <Check width={ 14 } height={ 14 }/> }
          { props.isFixable && <Wrench width={ 14 } height={ 14 }/> }
        </HeaderSide>

        <Switcher isActive={ props.isTurnedOn } onClick={ () => props.onSwitcherClick(props.name, !props.isTurnedOn) }/>
      </Header>
      <Description onClick={ () => props.onClick(props.name) }>{ props.description }</Description>
    </Wrapper>
  );
};

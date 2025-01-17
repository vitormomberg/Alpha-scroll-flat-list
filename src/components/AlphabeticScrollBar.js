import React, { Component } from 'react';
import {View, Text, PanResponder, Platform} from 'react-native';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import ResponsiveFontSize from 'react-native-responsive-fontsize';

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

class AlphabeticScrollBar extends Component {
    constructor (props) {
        super(props);

        this.alphabet = props.keys ? props.keys.split('') : ALPHABET;

        this.state = {
            activeLetter: undefined,
            activeLetterViewTop: 0,
            alphabet: props.reverse ? [...this.alphabet].reverse() : this.alphabet
        };

    }

    componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: debounce(this.handleOnFingerTouch.bind(this)),
            onPanResponderMove: debounce(this.handleOnFingerMove.bind(this)),
            onPanResponderTerminate: this.handleOnFingerStop.bind(this),
            onPanResponderRelease: this.handleOnFingerStop.bind(this),
        });
    }

    componentWillReceiveProps (newProps) {
        if (newProps.reverse !== this.props.reverse) {
            const alphabet = newProps.reverse ? [...this.alphabet].reverse() : this.alphabet;

            this.setState({
                alphabet
            });
        }
    }

    getTouchedLetter (y) {
        const top = y - (this.containerTop || 0) - 5;

        if (top >= 1 && top <= this.containerHeight) {
            this.setState({
                activeLetterViewTop: top
            });

            return this.state.alphabet[Math.round((top / this.containerHeight) * this.state.alphabet.length)]
        }
    }

    handleOnFingerTouch (e, gestureState) {
        this.handleOnTouchLetter(this.getTouchedLetter(gestureState.y0));
    }

    handleOnFingerMove (evt, gestureState) {
        this.handleOnTouchLetter(this.getTouchedLetter(gestureState.moveY));
    }

    handleOnTouchLetter (activeLetter) {
        this.setState({
            activeLetter
        });

        this.props.onScroll(activeLetter, this.state.activeLetterViewTop);
    }

    handleOnFingerStop () {
        this.setState({
            activeLetter: undefined,
        });

        this.props.onScrollEnds(this.state.activeLetter);
    }

    handleOnLayout () {
        this.alphabetContainer.measure((width, x1, y1, height, px, py) => {
            if (!this.containerTop && !this.containerHeight) {
                this.containerTop = py;
                this.containerHeight = height;
            }
        });
    }

    render() {
        return (
          <View
              ref={elem => this.alphabetContainer = elem}
              {...this.panResponder.panHandlers}
              onLayout={this.handleOnLayout.bind(this)}
              style={[styles.container, this.props.scrollBarContainerStyle]}
          >
              {this.state.alphabet.map(letter => (
                  <View key={letter} style={{width: '100%'}}>
                      <Text style={[{
                          ...styles.letter,
                          ...this.props.fontColor ? {color: this.props.fontColor} : {},
                          fontFamily: this.props.letterActive === letter ? "Gotham-Bold" : "Gotham-Light",
                          fontSize: ResponsiveFontSize(this.props.isPortrait ? 2 : 1.6) * this.props.fontSizeMultiplier,
                      }, Platform.OS === 'ios' ? { fontWeight: this.props.letterActive === letter ? "bold" : "normal"} : {}]}>
                          {letter}
                      </Text>
                  </View>
              ))}
          </View>
        );
    }
}

const styles = {
    container: {
        width: 30,
        position: 'absolute',
        right: 0,
        top: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    letter: {
        alignSelf: 'center',
        fontWeight: 'normal',
        fontFamily: 'Gotham-Bold'
    }
};

AlphabeticScrollBar.propTypes = {
    onScroll: PropTypes.func,
    onScrollEnds: PropTypes.func,
    activeColor: PropTypes.string,
    reverse: PropTypes.bool,
    isPortrait: PropTypes.bool,
    fontColor: PropTypes.string,
    fontSizeMultiplier: PropTypes.number,
    scrollBarContainerStyle: PropTypes.object
};

AlphabeticScrollBar.propTypes = {
    onScroll: () => {},
    onScrollEnds: () => {}
};

export default AlphabeticScrollBar;

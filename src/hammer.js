import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Hammer from 'hammerjs';

const hammerReactMap = {
    onPan: 'pan',
    onPanEnd: 'panend',
    onPanStart: 'panstart',
    onPanCancel: 'pancancel'
};

class ReactHammer extends React.Component {
    componentDidMount() {
        this.hammer = new Hammer(ReactDOM.findDOMNode(this));

        this.getPropKeys().forEach(prop => {
            if (this.props[prop]) {
                this.hammer.on(hammerReactMap[prop], this.props[prop]);
            }
        });
    }
    componentWillUnmount() {
        this.getPropKeys().forEach(prop => {
            if (this.props[prop]) {
                this.hammer.off(hammerReactMap[prop], this.props[prop]);
            }
        });
    }
    componentWillUnmount() {
        if (this.hammer) {
            this.hammer.stop();
            this.hammer.destroy();
        }
        this.hammer = null;
    }
    getPropKeys() {
        return Object.keys(this.props).reduce((acc, prop) => {
            if (Object.keys(ReactHammer.propTypes).includes(prop)) {
                acc.push(prop);
            }
            return acc;
        }, []);
    }
    render() {
        return this.props.children;
    }
}

ReactHammer.propTypes = {
    onPan: PropTypes.func,
    onPanEnd: PropTypes.func,
    onPanStart: PropTypes.func,
    onPanCancel: PropTypes.func
};

export default ReactHammer;

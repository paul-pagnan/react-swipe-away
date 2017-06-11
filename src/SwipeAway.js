import React from 'react';
import PropTypes from 'prop-types';
import Hammer from './hammer';
import sizeme from 'react-sizeme';
import * as Util from './util';

const styles = {
    back: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -1,
        paddingLeft: '50px',
        paddingRight: '50px'
    },
    swipeable: {
        position: 'relative'
    },
    label: {
        fontWeight: 'bold',
        fontSize: '16px',
        textTransform: 'uppercase',
        width: '50%',
        display: 'table-cell',
        verticalAlign: 'middle'
    },
    labelLeft: {
        textAlign: 'left'
    },
    labelRight: {
        textAlign: 'right'
    },
    backWrapper: {
        position: 'relative',
        display: 'table',
        width: '100%'
    }
};

class SwipeAway extends React.Component {
    constructor(props) {
        super(props);
        this.state = { swipeAttrs: {}, containerAttrs: {} };
    }
    mergeSwipeAttrs(attrs) {
        this.mergeState({ swipeAttrs: { ...this.state.swipeAttrs, ...attrs }});
    }
    mergeState(attrs) {
        this.setState({...this.state, ...attrs});
    }
    paned(e) {
        const attrs = { left: e.deltaX, opacity: 1 };

        if (this.props.fade) {
            attrs.opacity = 1 - Util.easeOutCubic(Math.abs(attrs.left), 0, 1, this.props.size.width);
        }
        if (e.deltaX > 0) {
            this.mergeState({ labelLeftAttrs: { opacity: 1 }, labelRightAttrs: { opacity: 0 } });
        } else {
            this.mergeState({ labelLeftAttrs: { opacity: 0 }, labelRightAttrs: { opacity: 1 } });
        }

        this.mergeSwipeAttrs(attrs);
        Util.safeCall(this.props.onMoved, Util.translateEvent(e));
    }
    panStart(e) {
        this.mergeState({ initialVelocity: e.velocityX });
        Util.safeCall(this.props.onMoveStart, Util.translateEvent(e));
    }
    panEnd(e) {
        const initialV = this.state.initialVelocity;
        const v = e.velocityX;

        this.mergeState({ velocity: v });

        if (Math.abs(v) > 0 && Math.sign(v) === Math.sign(initialV)) {
            this.animateOut();
        } else {
            this.reset();
        }
        Util.safeCall(this.props.onMoveEnd);
    }
    reset() {
        const startedAt = new Date().getTime();
        const initialLeft = this.state.swipeAttrs.left;

        this.mergeState({ startedAt, initialLeft });
        this.animateToZero();
    }
    minimize() {
        const { minimizeDelay } = this.props;

        setTimeout((function () {
            this.mergeState({
                startedAt: new Date().getTime(),
                initialHeight: this.props.size.height
            });
            this.animateminimize();
        }).bind(this), minimizeDelay);
    }
    animateOut() {
        let { minVelocity, maxVelocity } = this.props;
        const velocity = Util.normaliseVelocity(this.state.velocity, minVelocity, maxVelocity);
        const left = this.state.swipeAttrs.left + (velocity * this.props.swipeSpeed);

        this.mergeSwipeAttrs({ left });
        this.mergeState({ velocity });

        if (Math.abs(this.state.swipeAttrs.left) > this.props.size.width) {
            if (this.props.minimize) {
                this.minimize();
            }
            Util.safeCall(this.props.onComplete);
        } else {
            Util.runAnimationFrame(::this.animateOut);
        }
    }
    animateToZero() {
        const { startedAt, initialLeft } = this.state;
        const { resetDuration } = this.props;

        const timeElapsed = Math.min(Util.timeSince(startedAt), resetDuration);
        const animVal = Util.easeInCubic(timeElapsed, 0, initialLeft, resetDuration);
        const left = initialLeft - animVal;

        this.mergeSwipeAttrs({ left });

        if (timeElapsed < resetDuration) {
            Util.runAnimationFrame(::this.animateToZero);
        }
    }
    animateminimize() {
        const { minimizeDuration } = this.props;
        const { startedAt, initialHeight } = this.state;
        const timeElapsed = Math.min(Util.timeSince(startedAt), minimizeDuration);

        const animVal = Util.easeInCubic(timeElapsed, 0, initialHeight, minimizeDuration);
        const height = initialHeight - animVal;

        this.mergeState({ containerAttrs: { height }});

        if (timeElapsed < minimizeDuration) {
            Util.runAnimationFrame(::this.animateminimize);
        } else {
            Util.safeCall(this.props.onMinimize);
        }
    }
    render() {
        if (this.props.backColor) {
            styles.back.backgroundColor = this.props.backColor;
        }

        let back = this.props.backElem;

        if (!this.props.backElem) {
            const labelStyle = {
                ...styles.label,
                height: `${this.props.size.height}px`,
                color: this.props.labelColor,
                ...this.props.labelStyle
            };

            back = (
                <div style={styles.backWrapper}>
                    <div style={{...labelStyle, ...this.state.labelLeftAttrs}}>
                        {this.props.label}
                        {!this.props.label && this.props.labelLeft}
                    </div>
                    <div style={{...labelStyle, ...styles.labelRight, ...this.state.labelRightAttrs}}>
                        {this.props.label}
                        {!this.props.label && this.props.labelRight}
                    </div>
                </div>
            );
        }

        return (
            <Hammer
                onPan={::this.paned}
                onPanEnd={::this.panEnd}
                onPanStart={::this.panStart}
                onPanCancel={::this.reset}>
                <div style={{...styles.swipeable, ...this.state.containerAttrs}}>
                    <div style={{...styles.back, ...this.props.backStyle}}>
                        {back}
                    </div>
                    <div
                        className={this.props.className}
                        style={{...styles.swipeable, ...this.props.style, ...this.state.swipeAttrs}}>
                        {this.props.children}
                    </div>
                </div>
            </Hammer>
        );
    }
}

SwipeAway.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    className: PropTypes.string,
    style: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    swipeSpeed: PropTypes.number,
    resetDuration: PropTypes.number,
    minVelocity: PropTypes.number,
    maxVelocity: PropTypes.number,
    minimize: PropTypes.bool,
    minimizeDelay: PropTypes.number,
    minimizeDuration: PropTypes.number,
    backColor: PropTypes.string,
    fade: PropTypes.bool,
    backElem: PropTypes.node,
    backStyle: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    labelLeft: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    labelRight: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    labelColor: PropTypes.string,
    labelStyle: PropTypes.string,

    // Events
    onMove: PropTypes.func,
    onMoveStart: PropTypes.func,
    onMoveEnd: PropTypes.func,
    onComplete: PropTypes.func,
    onMinimize: PropTypes.func
};

SwipeAway.defaultProps = {
    swipeSpeed: 25,
    resetDuration: 200,
    minVelocity: 1,
    maxVelocity: 2,
    minimize: true,
    minimizeDelay: 0,
    minimizeDuration: 200,
    fade: false,
    labelColor: 'white'
};

export default sizeme({
    monitorWidth: true,
    monitorHeight: true,
    refreshRate: 99999999999999999,
    noPlaceholder: true
})(SwipeAway);


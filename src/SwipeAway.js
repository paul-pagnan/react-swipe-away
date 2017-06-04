import React from 'react';
import PropTypes from 'prop-types';
import Hammer from 'react-hammerjs';
import sizeme from 'react-sizeme';
import * as Util from './util';

const styles = {
    back: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'green',
        zIndex: -1
    },
    swipeable: {
        position: 'relative'
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
        this.mergeSwipeAttrs({ left: e.deltaX });
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
    minimise() {
        const { minimiseDelay } = this.props;

        setTimeout((function () {
            this.mergeState({
                startedAt: new Date().getTime(),
                initialHeight: this.props.size.height
            });
            this.animateMinimise();
        }).bind(this), minimiseDelay);
    }
    animateOut() {
        let { minVelocity, maxVelocity } = this.props;
        const velocity = Util.normaliseVelocity(this.state.velocity, minVelocity, maxVelocity);
        const left = this.state.swipeAttrs.left + (velocity * this.props.swipeSpeed);

        this.mergeSwipeAttrs({ left });
        this.mergeState({ velocity });

        if (Math.abs(this.state.swipeAttrs.left) > this.props.size.width) {
            if (this.props.minimise) {
                this.minimise();
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
    animateMinimise() {
        const { minimiseDuration } = this.props;
        const { startedAt, initialHeight } = this.state;
        const timeElapsed = Math.min(Util.timeSince(startedAt), minimiseDuration);

        const animVal = Util.easeInCubic(timeElapsed, 0, initialHeight, minimiseDuration);
        const height = initialHeight - animVal;

        this.mergeState({ containerAttrs: { height }});

        if (timeElapsed < minimiseDuration) {
            Util.runAnimationFrame(::this.animateMinimise);
        }
    }
    render() {
        return (
            <Hammer
                onPan={::this.paned}
                onPanEnd={::this.panEnd}
                onPanStart={::this.panStart}
                onPanCancel={::this.reset}>
                <div style={{...styles.swipeable, ...this.state.containerAttrs}}>
                    <div style={styles.back}>
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
    onMove: PropTypes.func,
    onMoveStart: PropTypes.func,
    onMoveEnd: PropTypes.func,
    onComplete: PropTypes.func,
    swipeSpeed: PropTypes.number,
    resetDuration: PropTypes.number,
    minVelocity: PropTypes.number,
    maxVelocity: PropTypes.number,
    minimise: PropTypes.bool,
    minimiseDelay: PropTypes.number,
    minimiseDuration: PropTypes.number
};

SwipeAway.defaultProps = {
    swipeSpeed: 25,
    resetDuration: 200,
    minVelocity: 1,
    maxVelocity: 2,
    minimise: true,
    minimiseDelay: 0,
    minimiseDuration: 200
};

export default sizeme({
    monitorWidth: true,
    monitorHeight: true,
    refreshRate: 999999999
})(SwipeAway);


import { Component } from 'react';
import PropTypes from 'prop-types';

export class SwipeAway extends Component {
    constructor(props) {
        super(props);
    }.
}

SwipeAway.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ]),
};


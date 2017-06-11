import React from 'react';
import './App.css';
import SwipeAway from 'react-swipe-away';
import MdCheck from 'react-icons/lib/md/check';

class App extends React.Component {
    render() {
        return (
            <div className="card-wrapper">
                <SwipeAway className="card" backColor="green" label={<MdCheck size={40} />}>
                    Test
                </SwipeAway>
            </div>
        );
    }
}

export default App;

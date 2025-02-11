import React, { Component } from 'react';
import { connect } from 'react-redux';
import Obstruction from 'obstruction';

import { withStyles, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { fetchEvents } from '../../actions/cached';
import { clipsExit } from '../../actions/clips';
import Colors from '../../colors';
import ClipList from './ClipList';
import ClipCreate from './ClipCreate';
import ClipUpload from './ClipUpload';
import ClipDone from './ClipDone';

const styles = () => ({
  window: {
    background: 'linear-gradient(to bottom, #30373B 0%, #272D30 10%, #1D2225 100%)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    margin: 18,
  },
  headerContext: {
    alignItems: 'center',
    justifyContent: 'space-between',
    display: 'flex',
    padding: 12,
  },
  headerInfo: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 500,
    paddingLeft: 12,
  },
  error: {
    color: Colors.white,
    fontSize: '0.9rem',
    padding: '12px 24px',
  },
});

class ClipView extends Component {
  componentDidMount() {
    this.componentDidUpdate({}, {});
  }

  componentDidUpdate(prevProps) {
    const { currentRoute, dispatch } = this.props;
    if (prevProps.currentRoute !== currentRoute && currentRoute) {
      dispatch(fetchEvents(currentRoute));
    }
  }

  render() {
    const { classes, clips, dispatch } = this.props;

    let title = 'Create a clip';
    let text = null;
    if (clips.state === 'done') {
      title = 'View clip';
    } else if (clips.state === 'list') {
      title = 'View clips';
    } else if (clips.state === 'error') {
      title = 'View clip';
      if (clips.error === 'clip_doesnt_exist') {
        text = 'Could not find this clip';
      }
    } else if (clips.state === 'loading') {
      title = '';
    }

    return (
      <div className={classes.window}>
        <div className={classes.headerContext}>
          <IconButton onClick={ () => dispatch(clipsExit()) }>
            <CloseIcon />
          </IconButton>
          <div className={ classes.headerInfo }>
            { title }
          </div>
          <div style={{ width: 48 }} />
        </div>
        { clips.state === 'list' ? <ClipList /> : null }
        { clips.state === 'create' ? <ClipCreate /> : null }
        { clips.state === 'upload' ? <ClipUpload /> : null }
        { clips.state === 'done' ? <ClipDone /> : null }
        { clips.state === 'error' ? <div className={ classes.error }>{ text }</div> : null }
      </div>
    );
  }
}

const stateToProps = Obstruction({
  currentRoute: 'currentRoute',
  dongleId: 'dongleId',
  clips: 'clips',
});

export default connect(stateToProps)(withStyles(styles)(ClipView));
